import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const projectRoot = process.cwd();
const root = join(projectRoot, 'public');
const port = Number(process.env.PORT || process.argv[2] || 8000);
const dataDir = join(projectRoot, 'data');
const storeFile = join(dataDir, 'store.json');
const adminPassword = process.env.ADMIN_PASSWORD || 'digiepro123';
const adminToken = randomBytes(24).toString('hex');
const loginAttempts = new Map();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const STORE_SCHEMA_VERSION = 3;
const OFFICIAL_PRIVATE_DESCRIPTION = 'Akun resmi dan bukan akun ilegal. Akses bersifat privat, bukan sharing, dengan garansi 30 hari sesuai ketentuan penggunaan DigiePro.';

mkdirSync(dataDir, { recursive: true });

function readStore() { const data = JSON.parse(readFileSync(storeFile, 'utf8')); data.orders ||= []; data.chats ||= []; data.users ||= []; data.userSessions ||= []; if ((data.schemaVersion || 0) < STORE_SCHEMA_VERSION) { const overrides = { 46473: { stock: 13, available_stock: 13 }, 23915: { stock: 3, available_stock: 3 } }; for (const product of data.products || []) { if (overrides[product.id]) { Object.assign(product, overrides[product.id], { warranty: '30 hari', access: 'Akun resmi privat', description: OFFICIAL_PRIVATE_DESCRIPTION }); product.total_stock = Number(product.sold || 0) + product.stock; } } data.schemaVersion = STORE_SCHEMA_VERSION; writeStore(data); } return data; }
function writeStore(data) { writeFileSync(storeFile, JSON.stringify(data, null, 2)); }
function sendJson(response, status, data, headers = {}) { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers }); response.end(JSON.stringify(data)); }
function readBody(request) { return new Promise((resolve, reject) => { let body = ''; request.on('data', (chunk) => { body += chunk; if (body.length > 1e6) request.destroy(); }); request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); } }); request.on('error', reject); }); }
function getCookie(request, name) { const part = (request.headers.cookie || '').split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`)); return part ? part.slice(name.length + 1) : ''; }
function isAdmin(request) { return getCookie(request, 'digiepro_admin') === adminToken; }
function hashPassword(password, salt) { return scryptSync(password, salt, 32).toString('hex'); }
function hashToken(token) { return createHash('sha256').update(token).digest('hex'); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function isRateLimited(key) { const item = loginAttempts.get(key); return Boolean(item && Date.now() - item.started < 900000 && item.count >= 5); }
function recordFailure(key) { const item = loginAttempts.get(key); loginAttempts.set(key, item && Date.now() - item.started < 900000 ? { ...item, count: item.count + 1 } : { count: 1, started: Date.now() }); }
function createUserSession(store, userId) { const token = randomBytes(32).toString('hex'); store.userSessions = store.userSessions.filter((item) => new Date(item.expiresAt) > new Date()); store.userSessions.push({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() }); return token; }

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/seed-store.json') { response.writeHead(404).end('Not found'); return; }
  if (pathname === '/bolehnihadmin') { response.writeHead(302, { Location: '/bolehdong' }); response.end(); return; }
  if (pathname === '/api/auth/register' && request.method === 'POST') {
    try { const body = await readBody(request); const name = String(body.name || '').trim().slice(0, 80); const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || ''); if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return sendJson(response, 400, { error: 'Nama, email, atau password belum valid. Password minimal 8 karakter.' }); const store = readStore(); if (store.users.some((item) => item.email === email)) return sendJson(response, 409, { error: 'Email sudah terdaftar. Silakan masuk.' }); const salt = randomBytes(16).toString('hex'); const user = { id: `usr-${randomBytes(12).toString('hex')}`, name, email, salt, passwordHash: hashPassword(password, salt), createdAt: new Date().toISOString() }; store.users.push(user); const token = createUserSession(store, user.id); writeStore(store); sendJson(response, 201, { user: publicUser(user) }, { 'Set-Cookie': `digiepro_user=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` }); } catch { sendJson(response, 400, { error: 'Data pendaftaran tidak valid.' }); } return;
  }
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    try { const body = await readBody(request); const email = String(body.email || '').trim().toLowerCase(); const key = `user:${request.socket.remoteAddress}:${email}`; if (isRateLimited(key)) return sendJson(response, 429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }); const store = readStore(); const user = store.users.find((item) => item.email === email); const actual = user ? Buffer.from(hashPassword(String(body.password || ''), user.salt), 'hex') : Buffer.alloc(32); const expected = user ? Buffer.from(user.passwordHash, 'hex') : Buffer.alloc(32, 1); if (!user || !timingSafeEqual(actual, expected)) { recordFailure(key); return sendJson(response, 401, { error: 'Email atau password salah.' }); } loginAttempts.delete(key); const token = createUserSession(store, user.id); writeStore(store); sendJson(response, 200, { user: publicUser(user) }, { 'Set-Cookie': `digiepro_user=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` }); } catch { sendJson(response, 400, { error: 'Permintaan login tidak valid.' }); } return;
  }
  if (pathname === '/api/auth/me' && request.method === 'GET') { const token = getCookie(request, 'digiepro_user'); const store = readStore(); const session = store.userSessions.find((item) => item.tokenHash === hashToken(token) && new Date(item.expiresAt) > new Date()); const user = session && store.users.find((item) => item.id === session.userId); sendJson(response, user ? 200 : 401, { user: user ? publicUser(user) : null }); return; }
  if (pathname === '/api/auth/logout' && request.method === 'POST') { const token = getCookie(request, 'digiepro_user'); const store = readStore(); store.userSessions = store.userSessions.filter((item) => item.tokenHash !== hashToken(token)); writeStore(store); sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'digiepro_user=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' }); return; }
  if (pathname === '/api/store' && request.method === 'GET') { const store = readStore(); sendJson(response, 200, { products: store.products }); return; }
  const chatMatch = pathname.match(/^\/api\/chat\/([a-zA-Z0-9-]{6,80})$/);
  if (chatMatch && request.method === 'GET') { const store = readStore(); const chat = store.chats.find((item) => item.id === chatMatch[1]); sendJson(response, 200, chat || { id: chatMatch[1], messages: [] }); return; }
  if (chatMatch && request.method === 'POST') {
    try { const body = await readBody(request); const text = String(body.message || '').trim().slice(0, 1000); if (!text) return sendJson(response, 400, { error: 'Pesan kosong.' }); const store = readStore(); let chat = store.chats.find((item) => item.id === chatMatch[1]); if (!chat) { chat = { id: chatMatch[1], customer: body.customer || {}, messages: [], updatedAt: new Date().toISOString() }; store.chats.unshift(chat); } if (body.customer) chat.customer = { ...chat.customer, ...body.customer }; chat.messages.push({ id: randomBytes(8).toString('hex'), sender: 'customer', text, createdAt: new Date().toISOString() }); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 201, chat); } catch { sendJson(response, 400, { error: 'Pesan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/orders' && request.method === 'POST') {
    try {
      const body = await readBody(request); const store = readStore();
      if (!Array.isArray(body.items) || !body.items.length) return sendJson(response, 400, { error: 'Keranjang kosong.' });
      let subtotal = 0;
      const normalizedItems = [];
      const requestedStock = new Map();
      for (const line of body.items) {
        const product = store.products.find((item) => item.id === Number(line.id)); const quantity = Number(line.quantity);
        if (!product || !product.enabled) return sendJson(response, 400, { error: 'Produk tidak tersedia.' });
        const requested = (requestedStock.get(product.id) || 0) + quantity;
        if (!Number.isInteger(quantity) || quantity < 1 || requested > product.stock) return sendJson(response, 409, { error: `Stok ${product.title} tidak mencukupi.` });
        requestedStock.set(product.id, requested);
        const ownGmail = product.title.includes('CHATGPT PLUS') && Boolean(line.ownGmail);
        subtotal += (product.price + (ownGmail ? 5000 : 0)) * quantity;
        normalizedItems.push({ id: product.id, quantity, ownGmail });
      }
      for (const line of normalizedItems) store.products.find((item) => item.id === line.id).stock -= line.quantity;
      const adminFee = 99; const total = subtotal + adminFee;
      const order = { id: `DGP-${Date.now().toString().slice(-8)}`, customer: body.customer, chatId: body.chatId || '', items: normalizedItems, subtotal, adminFee, total, status: 'pending', createdAt: new Date().toISOString() };
      if (body.chatId) { let chat = store.chats.find((item) => item.id === body.chatId); if (!chat) { chat = { id: body.chatId, customer: body.customer, messages: [], updatedAt: new Date().toISOString() }; store.chats.unshift(chat); } chat.customer = { ...chat.customer, ...body.customer }; chat.orderId = order.id; }
      store.orders.unshift(order); writeStore(store); sendJson(response, 201, order);
    } catch { sendJson(response, 400, { error: 'Data pesanan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/admin/login' && request.method === 'POST') {
    try { const body = await readBody(request); const key = `admin:${request.socket.remoteAddress}`; if (isRateLimited(key)) return sendJson(response, 429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }); if (body.password !== adminPassword) { recordFailure(key); return sendJson(response, 401, { error: 'Password salah.' }); } loginAttempts.delete(key); sendJson(response, 200, { ok: true }, { 'Set-Cookie': `digiepro_admin=${adminToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800` }); } catch { sendJson(response, 400, { error: 'Permintaan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/admin/logout' && request.method === 'POST') { sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'digiepro_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' }); return; }
  if (pathname === '/api/admin/state' && request.method === 'GET') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); const store = readStore(); sendJson(response, 200, { products: store.products, orders: store.orders, chats: store.chats }); return; }

  const adminChatMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/reply$/);
  if (adminChatMatch && request.method === 'POST') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const text = String(body.message || '').trim().slice(0, 1000); if (!text) return sendJson(response, 400, { error: 'Pesan kosong.' }); const store = readStore(); const chat = store.chats.find((item) => item.id === adminChatMatch[1]); if (!chat) return sendJson(response, 404, { error: 'Chat tidak ditemukan.' }); chat.messages.push({ id: randomBytes(8).toString('hex'), sender: 'admin', text, createdAt: new Date().toISOString() }); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 201, chat); } catch { sendJson(response, 400, { error: 'Pesan tidak valid.' }); }
    return;
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (productMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const store = readStore(); const product = store.products.find((item) => item.id === Number(productMatch[1])); if (!product) return sendJson(response, 404, { error: 'Produk tidak ditemukan.' }); const stock = Number(body.stock); const price = Number(body.price); if (!Number.isInteger(stock) || stock < 0 || stock > 49 || !Number.isInteger(price) || price < 0) return sendJson(response, 400, { error: 'Harga atau stok tidak valid.' }); Object.assign(product, { stock, price, enabled: Boolean(body.enabled) }); writeStore(store); sendJson(response, 200, product); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); }
    return;
  }

  const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if (orderMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const store = readStore(); const order = store.orders.find((item) => item.id === orderMatch[1]); if (!order) return sendJson(response, 404, { error: 'Pesanan tidak ditemukan.' }); if (!['pending', 'paid', 'completed', 'cancelled'].includes(body.status)) return sendJson(response, 400, { error: 'Status tidak valid.' }); if (order.status !== 'cancelled' && body.status === 'cancelled') for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) product.stock = Math.min(49, product.stock + line.quantity); } if (order.status === 'cancelled' && body.status !== 'cancelled') { for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (!product || product.stock < line.quantity) return sendJson(response, 409, { error: `Stok ${product?.title || line.id} tidak cukup untuk mengaktifkan pesanan.` }); } for (const line of order.items) store.products.find((item) => item.id === line.id).stock -= line.quantity; } order.status = body.status; writeStore(store); sendJson(response, 200, order); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); }
    return;
  }

  let requestedPath = pathname;
  if (pathname === '/bolehdong') requestedPath = '/admin.html';
  let file = normalize(join(root, requestedPath === '/' ? 'index.html' : requestedPath));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404).end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); createReadStream(file).pipe(response);
});

server.listen(port, '0.0.0.0', () => console.log(`DigiePro running on port ${port}`));
