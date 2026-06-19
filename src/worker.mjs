const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const STORE_SCHEMA_VERSION = 3;
const OFFICIAL_PRIVATE_DESCRIPTION = 'Akun resmi dan bukan akun ilegal. Akses bersifat privat, bukan sharing, dengan garansi 30 hari sesuai ketentuan penggunaan DigiePro.';
let authTablesReady = false;

function migrateStore(store) {
  if ((store.schemaVersion || 0) >= STORE_SCHEMA_VERSION) return false;
  const overrides = { 46473: { stock: 13, available_stock: 13 }, 23915: { stock: 3, available_stock: 3 } };
  for (const product of store.products || []) {
    const override = overrides[product.id];
    if (override) {
      Object.assign(product, override, { warranty: '30 hari', access: 'Akun resmi privat', description: OFFICIAL_PRIVATE_DESCRIPTION });
      product.total_stock = Number(product.sold || 0) + product.stock;
    }
  }
  store.schemaVersion = STORE_SCHEMA_VERSION;
  return true;
}

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
    if (migrateStore(store)) await saveStore(env, store);
    return store;
  }

  const seedResponse = await env.ASSETS.fetch(new Request('https://assets.local/seed-store.json'));
  if (!seedResponse.ok) throw new Error('Seed katalog tidak ditemukan.');
  const seed = await seedResponse.json();
  seed.orders = [];
  seed.chats = [];
  migrateStore(seed);
  await env.DB.prepare('INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, ?)').bind(JSON.stringify(seed), new Date().toISOString()).run();
  return seed;
}

async function saveStore(env, store) {
  await env.DB.prepare('UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1').bind(JSON.stringify(store), new Date().toISOString()).run();
}

async function ensureAuthTables(env) {
  if (authTablesReady) return;
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS user_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start INTEGER NOT NULL)')
  ]);
  authTablesReady = true;
}

function bytesToHex(value) { return Array.from(new Uint8Array(value), (byte) => byte.toString(16).padStart(2, '0')).join(''); }
async function sha256(value) { return bytesToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))); }
async function hashPassword(password, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return bytesToHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 120000 }, material, 256));
}
function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}
function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }

async function rateLimited(env, key) {
  const now = Date.now();
  const row = await env.DB.prepare('SELECT attempts, window_start FROM login_attempts WHERE key = ?').bind(key).first();
  return Boolean(row && now - Number(row.window_start) < 900000 && Number(row.attempts) >= 5);
}
async function recordFailure(env, key) {
  const now = Date.now();
  const row = await env.DB.prepare('SELECT attempts, window_start FROM login_attempts WHERE key = ?').bind(key).first();
  const attempts = row && now - Number(row.window_start) < 900000 ? Number(row.attempts) + 1 : 1;
  const windowStart = row && now - Number(row.window_start) < 900000 ? Number(row.window_start) : now;
  await env.DB.prepare('INSERT INTO login_attempts (key, attempts, window_start) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET attempts = excluded.attempts, window_start = excluded.window_start').bind(key, attempts, windowStart).run();
}
async function clearFailures(env, key) { await env.DB.prepare('DELETE FROM login_attempts WHERE key = ?').bind(key).run(); }

async function createUserSession(env, userId) {
  const token = randomId(32); const now = new Date(); const expires = new Date(now.getTime() + 30 * 86400000);
  await env.DB.prepare('INSERT INTO user_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(await sha256(token), userId, expires.toISOString(), now.toISOString()).run();
  return `digiepro_user=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;
}

async function currentUser(request, env) {
  const token = getCookie(request, 'digiepro_user'); if (!token) return null;
  await ensureAuthTables(env);
  const user = await env.DB.prepare('SELECT users.id, users.name, users.email FROM user_sessions JOIN users ON users.id = user_sessions.user_id WHERE user_sessions.token_hash = ? AND user_sessions.expires_at > ?').bind(await sha256(token), new Date().toISOString()).first();
  return user ? publicUser(user) : null;
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
  if (pathname.startsWith('/api/auth/')) await ensureAuthTables(env);
  if (pathname === '/api/auth/register' && request.method === 'POST') {
    const body = await readBody(request); const name = String(body.name || '').trim().slice(0, 80); const email = normalizeEmail(body.email); const password = String(body.password || '');
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return json({ error: 'Nama, email, atau password belum valid. Password minimal 8 karakter.' }, 400);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return json({ error: 'Email sudah terdaftar. Silakan masuk.' }, 409);
    const id = `usr-${randomId(12)}`; const salt = randomId(16); const createdAt = new Date().toISOString();
    await env.DB.prepare('INSERT INTO users (id, name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, name, email, await hashPassword(password, salt), salt, createdAt).run();
    const user = { id, name, email }; return json({ user }, 201, { 'Set-Cookie': await createUserSession(env, id) });
  }
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request); const email = normalizeEmail(body.email); const password = String(body.password || ''); const ip = request.headers.get('CF-Connecting-IP') || 'unknown'; const key = `user:${ip}:${email}`;
    if (await rateLimited(env, key)) return json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }, 429);
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user || !safeEqual(await hashPassword(password, user.salt), user.password_hash)) { await recordFailure(env, key); return json({ error: 'Email atau password salah.' }, 401); }
    await clearFailures(env, key); return json({ user: publicUser(user) }, 200, { 'Set-Cookie': await createUserSession(env, user.id) });
  }
  if (pathname === '/api/auth/me' && request.method === 'GET') {
    const user = await currentUser(request, env); return user ? json({ user }) : json({ user: null }, 401);
  }
  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    const token = getCookie(request, 'digiepro_user'); if (token) await env.DB.prepare('DELETE FROM user_sessions WHERE token_hash = ?').bind(await sha256(token)).run();
    return json({ ok: true }, 200, { 'Set-Cookie': 'digiepro_user=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0' });
  }

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
    await ensureAuthTables(env);
    const body = await readBody(request); const ip = request.headers.get('CF-Connecting-IP') || 'unknown'; const key = `admin:${ip}`;
    if (await rateLimited(env, key)) return json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }, 429);
    if (body.password !== env.ADMIN_PASSWORD) { await recordFailure(env, key); return json({ error: 'Password salah.' }, 401); }
    await clearFailures(env, key);
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
    if (order.status !== 'cancelled' && body.status === 'cancelled') {
      for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) product.stock = Math.min(49, product.stock + line.quantity); }
    }
    if (order.status === 'cancelled' && body.status !== 'cancelled') {
      for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (!product || product.stock < line.quantity) return json({ error: `Stok ${product?.title || line.id} tidak cukup untuk mengaktifkan pesanan.` }, 409); }
      for (const line of order.items) store.products.find((item) => item.id === line.id).stock -= line.quantity;
    }
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
