const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...jsonHeaders, ...headers } });
}

function randomId(bytes = 8) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function ensureStore(env) {
  if (!env.DB) throw new Error('D1 binding DB belum dikonfigurasi.');
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at TEXT NOT NULL)').run();
  const row = await env.DB.prepare('SELECT data FROM app_state WHERE id = 1').first();
  if (row?.data) {
    const store = JSON.parse(row.data);
    store.orders ||= [];
    store.chats ||= [];
    return store;
  }

  const seedResponse = await env.ASSETS.fetch(new Request('https://assets.local/seed-store.json'));
  if (!seedResponse.ok) throw new Error('Seed katalog tidak ditemukan.');
  const seed = await seedResponse.json();
  seed.orders = [];
  seed.chats = [];
  await env.DB.prepare('INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?)').bind(JSON.stringify(seed), new Date().toISOString()).run();
  return seed;
}

async function saveStore(env, store) {
  await env.DB.prepare('UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1').bind(JSON.stringify(store), new Date().toISOString()).run();
}

async function readBody(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 1_000_000) throw new Error('Payload terlalu besar.');
  return request.json();
}

function getCookie(request, name) {
  const entry = (request.headers.get('cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : '';
}

async function hmac(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function createAdminToken(secret) {
  const timestamp = Date.now().toString();
  return `${timestamp}.${await hmac(timestamp, secret)}`;
}

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const token = getCookie(request, 'digiepro_admin');
  const [timestamp, signature] = token.split('.');
  if (!timestamp || !signature || Date.now() - Number(timestamp) > 28_800_000) return false;
  const expected = await hmac(timestamp, env.ADMIN_PASSWORD);
  if (signature.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < signature.length; index += 1) mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}

async function api(request, env, pathname) {
  if (pathname === '/api/store' && request.method === 'GET') {
    const store = await ensureStore(env);
    return json({ products: store.products });
  }

  const chatMatch = pathname.match(/^\/api\/chat\/([a-zA-Z0-9-]{6,80})$/);
  if (chatMatch && request.method === 'GET') {
    const store = await ensureStore(env);
    return json(store.chats.find((item) => item.id === chatMatch[1]) || { id: chatMatch[1], messages: [] });
  }
  if (chatMatch && request.method === 'POST') {
    const body = await readBody(request);
    const text = String(body.message || '').trim().slice(0, 1000);
    if (!text) return json({ error: 'Pesan kosong.' }, 400);
    const store = await ensureStore(env);
    let chat = store.chats.find((item) => item.id === chatMatch[1]);
    if (!chat) {
      chat = { id: chatMatch[1], customer: body.customer || {}, messages: [], updatedAt: new Date().toISOString() };
      store.chats.unshift(chat);
    }
    if (body.customer) chat.customer = { ...chat.customer, ...body.customer };
    chat.messages.push({ id: randomId(), sender: 'customer', text, createdAt: new Date().toISOString() });
    chat.updatedAt = new Date().toISOString();
    await saveStore(env, store);
    return json(chat, 201);
  }

  if (pathname === '/api/orders' && request.method === 'POST') {
    const body = await readBody(request);
    const store = await ensureStore(env);
    if (!Array.isArray(body.items) || !body.items.length) return json({ error: 'Keranjang kosong.' }, 400);
    let subtotal = 0;
    const normalizedItems = [];
    const requestedStock = new Map();
    for (const line of body.items) {
      const product = store.products.find((item) => item.id === Number(line.id));
      const quantity = Number(line.quantity);
      if (!product || !product.enabled) return json({ error: 'Produk tidak tersedia.' }, 400);
      const requested = (requestedStock.get(product.id) || 0) + quantity;
      if (!Number.isInteger(quantity) || quantity < 1 || requested > product.stock) return json({ error: `Stok ${product.title} tidak mencukupi.` }, 409);
      requestedStock.set(product.id, requested);
      const ownGmail = product.title.includes('CHATGPT PLUS') && Boolean(line.ownGmail);
      subtotal += (product.price + (ownGmail ? 5000 : 0)) * quantity;
      normalizedItems.push({ id: product.id, quantity, ownGmail });
    }
    for (const line of normalizedItems) store.products.find((item) => item.id === line.id).stock -= line.quantity;
    const adminFee = 99;
    const order = { id: `DGP-${Date.now().toString().slice(-8)}`, customer: body.customer, chatId: body.chatId || '', items: normalizedItems, subtotal, adminFee, total: subtotal + adminFee, status: 'pending', createdAt: new Date().toISOString() };
    if (body.chatId) {
      let chat = store.chats.find((item) => item.id === body.chatId);
      if (!chat) {
        chat = { id: body.chatId, customer: body.customer, messages: [], updatedAt: new Date().toISOString() };
        store.chats.unshift(chat);
      }
      chat.customer = { ...chat.customer, ...body.customer };
      chat.orderId = order.id;
    }
    store.orders.unshift(order);
    await saveStore(env, store);
    return json(order, 201);
  }

  if (pathname === '/api/admin/login' && request.method === 'POST') {
    if (!env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD belum dikonfigurasi.' }, 503);
    const body = await readBody(request);
    if (body.password !== env.ADMIN_PASSWORD) return json({ error: 'Password salah.' }, 401);
    const token = await createAdminToken(env.ADMIN_PASSWORD);
    return json({ ok: true }, 200, { 'Set-Cookie': `digiepro_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800` });
  }
  if (pathname === '/api/admin/logout' && request.method === 'POST') {
    return json({ ok: true }, 200, { 'Set-Cookie': 'digiepro_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0' });
  }

  if (pathname === '/api/admin/state' && request.method === 'GET') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    return json(await ensureStore(env));
  }

  const adminChatMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/reply$/);
  if (adminChatMatch && request.method === 'POST') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const text = String(body.message || '').trim().slice(0, 1000);
    if (!text) return json({ error: 'Pesan kosong.' }, 400);
    const store = await ensureStore(env);
    const chat = store.chats.find((item) => item.id === adminChatMatch[1]);
    if (!chat) return json({ error: 'Chat tidak ditemukan.' }, 404);
    chat.messages.push({ id: randomId(), sender: 'admin', text, createdAt: new Date().toISOString() });
    chat.updatedAt = new Date().toISOString();
    await saveStore(env, store);
    return json(chat, 201);
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (productMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const store = await ensureStore(env);
    const product = store.products.find((item) => item.id === Number(productMatch[1]));
    if (!product) return json({ error: 'Produk tidak ditemukan.' }, 404);
    const stock = Number(body.stock);
    const price = Number(body.price);
    if (!Number.isInteger(stock) || stock < 0 || stock > 49 || !Number.isInteger(price) || price < 0) return json({ error: 'Harga atau stok tidak valid.' }, 400);
    Object.assign(product, { stock, price, enabled: Boolean(body.enabled) });
    await saveStore(env, store);
    return json(product);
  }

  const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if (orderMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const store = await ensureStore(env);
    const order = store.orders.find((item) => item.id === orderMatch[1]);
    if (!order) return json({ error: 'Pesanan tidak ditemukan.' }, 404);
    if (!['pending', 'paid', 'completed', 'cancelled'].includes(body.status)) return json({ error: 'Status tidak valid.' }, 400);
    order.status = body.status;
    await saveStore(env, store);
    return json(order);
  }

  return json({ error: 'Endpoint tidak ditemukan.' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/bolehnihadmin') return Response.redirect(new URL('/bolehdong', url), 302);
      if (url.pathname === '/bolehdong') {
        const assetUrl = new URL('/admin.html', url);
        return env.ASSETS.fetch(new Request(assetUrl, request));
      }
      if (url.pathname === '/seed-store.json') return new Response('Not found', { status: 404 });
      if (url.pathname.startsWith('/api/')) return await api(request, env, url.pathname);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return json({ error: error.message || 'Terjadi kesalahan pada server.' }, 500);
    }
  }
};
