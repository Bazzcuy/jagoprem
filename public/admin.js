let adminState = { products: [], orders: [], chats: [] };
let activeTab = 'overview';
let activeChatId = '';
const loginView = document.querySelector('#loginView');
const adminApp = document.querySelector('#adminApp');
const content = document.querySelector('#adminContent');

function money(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); }
function icons() { if (window.lucide) window.lucide.createIcons(); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function toast(message) { const node = document.querySelector('#adminToast'); node.textContent = message; node.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('show'), 2400); }

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { if (response.status === 401 && url !== '/api/admin/login') showLogin(); throw new Error(data.error || 'Terjadi kesalahan'); }
  return data;
}

function showLogin() { loginView.hidden = false; adminApp.hidden = true; }
async function load() {
  try { adminState = await api('/api/admin/state'); loginView.hidden = true; adminApp.hidden = false; render(); }
  catch { showLogin(); }
}

function stats() {
  return `<div class="stats"><article class="stat"><span>Produk aktif</span><strong>${adminState.products.filter((product) => product.enabled).length}</strong></article><article class="stat"><span>Total stok</span><strong>${adminState.products.reduce((total, product) => total + product.stock, 0)}</strong></article><article class="stat"><span>Pesanan pending</span><strong>${adminState.orders.filter((order) => order.status === 'pending').length}</strong></article><article class="stat"><span>Omzet tercatat</span><strong>${money(adminState.orders.filter((order) => ['paid', 'completed'].includes(order.status)).reduce((total, order) => total + order.total, 0))}</strong></article></div>`;
}

function productTable(list = adminState.products) {
  return `<div class="panel"><div class="panel-head"><h2>Kelola produk</h2><input id="adminSearch" type="search" placeholder="Cari produk..." aria-label="Cari produk"></div><div class="table-wrap"><table><thead><tr><th>PRODUK</th><th>HARGA</th><th>STOK (0-49)</th><th>AKTIF</th><th></th></tr></thead><tbody>${list.map((product) => `<tr data-product-row="${product.id}"><td><img src="${escapeHtml(product.thumbnail)}" alt=""><span class="product-name">${escapeHtml(product.title)}</span></td><td><input class="table-input" data-price value="${product.price}" type="number" min="0" aria-label="Harga ${escapeHtml(product.title)}"></td><td><input class="table-input stock-input" data-stock value="${product.stock}" type="number" min="0" max="49" aria-label="Stok ${escapeHtml(product.title)}"></td><td><input class="toggle" data-enabled type="checkbox" ${product.enabled ? 'checked' : ''} aria-label="Aktifkan ${escapeHtml(product.title)}"></td><td><button class="save-product" data-save-product="${product.id}">Simpan</button></td></tr>`).join('')}</tbody></table></div></div>`;
}

function orderTable() {
  if (!adminState.orders.length) return '<div class="panel"><div class="panel-head"><h2>Pesanan</h2></div><div class="empty-admin">Belum ada pesanan.</div></div>';
  return `<div class="panel"><div class="panel-head"><h2>Pesanan</h2><span class="panel-meta">${adminState.orders.length} transaksi</span></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>PELANGGAN</th><th>ITEM</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>${adminState.orders.map((order) => `<tr><td><b>${escapeHtml(order.id)}</b><br><small>${new Date(order.createdAt).toLocaleString('id-ID')}</small></td><td><b>${escapeHtml(order.customer?.name || '-')}</b><br>${escapeHtml(order.customer?.whatsapp || '-')}</td><td>${order.items.map((line) => `${escapeHtml(adminState.products.find((product) => product.id === line.id)?.title || line.id)}${line.ownGmail ? ' · Gmail sendiri' : ''} ×${line.quantity}`).join('<br>')}</td><td>${money(order.total)}</td><td><select class="order-select status ${escapeHtml(order.status)}" data-order-status="${escapeHtml(order.id)}" data-previous-status="${escapeHtml(order.status)}">${['pending', 'paid', 'completed', 'cancelled'].map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div></div>`;
}

function chatWorkspace() {
  const chats = [...(adminState.chats || [])].sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
  if (!activeChatId && chats.length) activeChatId = chats[0].id;
  const chat = chats.find((item) => item.id === activeChatId);
  const whatsapp = String(chat?.customer?.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');
  return `<div class="chat-workspace"><aside class="chat-list"><h2>Chat pembeli <span>${chats.length}</span></h2>${chats.length ? chats.map((item) => `<button class="${item.id === activeChatId ? 'active' : ''}" data-open-chat="${escapeHtml(item.id)}"><b>${escapeHtml(item.customer?.name || 'Pengunjung')}</b><span>${escapeHtml(item.messages?.at(-1)?.text || 'Percakapan baru')}</span></button>`).join('') : '<p>Belum ada chat.</p>'}</aside><section class="admin-conversation">${chat ? `<div class="conversation-head"><div><b>${escapeHtml(chat.customer?.name || 'Pengunjung')}</b><span>${escapeHtml(chat.customer?.whatsapp || 'Nomor WhatsApp belum tersedia')}${chat.orderId ? ` | ${escapeHtml(chat.orderId)}` : ''}</span></div>${whatsapp ? `<a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener">Chat WhatsApp <i data-lucide="external-link"></i></a>` : ''}</div><div class="conversation-messages">${chat.messages.map((message) => `<div class="admin-message ${message.sender === 'admin' ? 'admin' : 'customer'}">${escapeHtml(message.text)}</div>`).join('')}</div><form id="adminReply"><input name="message" required maxlength="1000" autocomplete="off" placeholder="Balas pembeli..."><button type="submit">Kirim</button></form>` : '<div class="empty-admin">Pilih percakapan.</div>'}</section></div>`;
}

function render() {
  document.querySelector('#adminTitle').textContent = activeTab === 'overview' ? 'Ringkasan' : activeTab === 'products' ? 'Produk' : activeTab === 'orders' ? 'Pesanan' : 'Chat Pembeli';
  content.innerHTML = activeTab === 'overview' ? stats() + orderTable() : activeTab === 'products' ? productTable() : activeTab === 'orders' ? orderTable() : chatWorkspace();
  icons();
}

document.querySelector('#adminLogin').addEventListener('submit', async (event) => {
  event.preventDefault(); const button = event.target.querySelector('button'); button.disabled = true; button.textContent = 'Memeriksa...';
  try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); document.querySelector('#loginError').textContent = ''; event.target.reset(); await load(); }
  catch (error) { document.querySelector('#loginError').textContent = error.message; }
  finally { button.disabled = false; button.textContent = 'Masuk dashboard'; }
});
document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { activeTab = button.dataset.tab; document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === button)); render(); }));
document.querySelector('#adminLogout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); location.reload(); });

content.addEventListener('click', async (event) => {
  const save = event.target.closest('[data-save-product]');
  if (save) {
    const row = save.closest('[data-product-row]'); save.disabled = true; save.textContent = 'Menyimpan...';
    try { const updated = await api(`/api/admin/products/${save.dataset.saveProduct}`, { method: 'PUT', body: JSON.stringify({ price: Number(row.querySelector('[data-price]').value), stock: Number(row.querySelector('[data-stock]').value), enabled: row.querySelector('[data-enabled]').checked }) }); Object.assign(adminState.products.find((product) => product.id === updated.id), updated); toast('Produk diperbarui'); }
    catch (error) { toast(error.message); }
    finally { save.disabled = false; save.textContent = 'Simpan'; }
  }
  const chat = event.target.closest('[data-open-chat]'); if (chat) { activeChatId = chat.dataset.openChat; render(); }
});

content.addEventListener('change', async (event) => {
  if (!event.target.matches('[data-order-status]')) return;
  const select = event.target; select.disabled = true;
  try { const updated = await api(`/api/admin/orders/${select.dataset.orderStatus}`, { method: 'PUT', body: JSON.stringify({ status: select.value }) }); Object.assign(adminState.orders.find((order) => order.id === updated.id), updated); select.dataset.previousStatus = updated.status; toast(updated.status === 'cancelled' ? 'Pesanan dibatalkan dan stok dikembalikan' : 'Status pesanan diperbarui'); render(); }
  catch (error) { select.value = select.dataset.previousStatus; select.disabled = false; toast(error.message); }
});
content.addEventListener('input', (event) => { if (event.target.id !== 'adminSearch') return; const query = event.target.value.toLowerCase(); document.querySelectorAll('[data-product-row]').forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(query); }); });
content.addEventListener('submit', async (event) => {
  if (event.target.id !== 'adminReply') return; event.preventDefault(); const button = event.target.querySelector('button'); button.disabled = true;
  try { const updated = await api(`/api/admin/chats/${activeChatId}/reply`, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); Object.assign(adminState.chats.find((chat) => chat.id === updated.id), updated); render(); }
  catch (error) { button.disabled = false; toast(error.message); }
});

setInterval(async () => { const draft = document.querySelector('#adminReply input'); if (activeTab !== 'chats' || adminApp.hidden || draft?.value) return; try { adminState = await api('/api/admin/state'); render(); } catch {} }, 5000);
load(); icons();
