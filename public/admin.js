let adminState = { products: [], orders: [], chats: [], users: [], reviews: [], settings: { maintenance: false, maintenanceMessage: '', reviewsEnabled: true } };
let activeTab = 'overview';
let activeChatId = '';
let activeAccountId = '';
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
  return `<div class="panel"><div class="panel-head"><div><h2>Kelola produk</h2><span class="panel-meta">Auto-restock menambah 8 saat stok kurang dari 2</span></div><input id="adminSearch" type="search" placeholder="Cari produk..." aria-label="Cari produk"></div><div class="table-wrap"><table><thead><tr><th>PRODUK</th><th>HARGA</th><th>STOK</th><th>AKTIF</th><th>AUTO +8</th><th></th></tr></thead><tbody>${list.map((product) => `<tr data-product-row="${product.id}"><td><img src="${escapeHtml(product.thumbnail)}" alt=""><span class="product-name">${escapeHtml(product.title)}</span></td><td><input class="table-input" data-price value="${product.price}" type="number" min="0" aria-label="Harga ${escapeHtml(product.title)}"></td><td><input class="table-input stock-input" data-stock value="${product.stock}" type="number" min="0" max="49" aria-label="Stok ${escapeHtml(product.title)}"></td><td><input class="toggle" data-enabled type="checkbox" ${product.enabled ? 'checked' : ''} aria-label="Aktifkan ${escapeHtml(product.title)}"></td><td><input class="toggle" data-auto-restock type="checkbox" ${product.autoRestock ? 'checked' : ''} aria-label="Auto-restock ${escapeHtml(product.title)}"></td><td><button class="save-product" data-save-product="${product.id}">Simpan</button></td></tr>`).join('')}</tbody></table></div></div>`;
}

function settingsPanel() { const settings = adminState.settings || {}; return `<div class="settings-grid"><form class="panel maintenance-panel" id="maintenanceForm"><div class="settings-icon"><i data-lucide="construction"></i></div><div><small>STATUS TOKO</small><h2>Mode maintenance</h2><p>Saat aktif, pengunjung melihat halaman pemeliharaan. Dashboard admin tetap dapat dibuka.</p></div><label class="maintenance-switch"><input name="maintenance" type="checkbox" ${settings.maintenance ? 'checked' : ''}><span></span><b>${settings.maintenance ? 'Aktif' : 'Nonaktif'}</b></label><label class="maintenance-switch"><input name="reviewsEnabled" type="checkbox" ${settings.reviewsEnabled === false ? '' : 'checked'}><span></span><b>Terima ulasan baru</b></label><label class="settings-message">PESAN UNTUK PENGUNJUNG<textarea name="maintenanceMessage" maxlength="240">${escapeHtml(settings.maintenanceMessage || '')}</textarea></label><button type="submit">Simpan pengaturan</button></form><div class="panel operations-note"><i data-lucide="refresh-cw"></i><h2>Kontrol operasional</h2><p>Auto-restock dikelola per produk. Ulasan baru bisa dimatikan sementara dari pengaturan ini tanpa menghapus ulasan lama.</p></div></div>`; }

function reviewStars(rating) { return `<span class="admin-stars">${Array.from({ length: 5 }, (_, index) => `<i data-lucide="star" class="${index < Number(rating) ? 'filled' : ''}"></i>`).join('')}</span>`; }
function reviewPanel() {
  const reviews = [...(adminState.reviews || [])].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0;
  const counts = [5, 4, 3, 2, 1].map((rating) => `${rating}★ ${reviews.filter((review) => Number(review.rating) === rating).length}`).join(' · ');
  return `<div class="panel review-admin"><div class="panel-head"><div><h2>Kelola ulasan</h2><span class="panel-meta">${reviews.length} ulasan · rating ${average.toFixed(1)} · ${counts}</span></div><input id="reviewSearch" type="search" placeholder="Cari nama, produk, komentar..."></div><div class="review-admin-status"><span>Ulasan baru: <b>${adminState.settings?.reviewsEnabled === false ? 'Dimatikan' : 'Aktif'}</b></span><span>Hapus ulasan akan langsung mengubah rating publik.</span></div><div class="table-wrap"><table><thead><tr><th>PEMBELI</th><th>PRODUK</th><th>RATING</th><th>KOMENTAR</th><th>TANGGAL</th><th></th></tr></thead><tbody>${reviews.map((review) => { const product = adminState.products.find((item) => item.id === review.productId); return `<tr data-review-row="${escapeHtml(review.id)}"><td><b>${escapeHtml(review.customerName || 'Pembeli')}</b><br><small>${escapeHtml(review.userId || review.orderId || 'sample')}</small></td><td>${escapeHtml(product?.title || review.productId || 'Produk')}</td><td>${reviewStars(review.rating)}<small>${Number(review.rating || 0)} bintang</small></td><td>${escapeHtml(review.comment || '')}</td><td>${new Date(review.createdAt).toLocaleString('id-ID')}</td><td><button class="delete-review" data-delete-review="${escapeHtml(review.id)}"><i data-lucide="trash-2"></i>Hapus</button></td></tr>`; }).join('')}</tbody></table></div></div>`;
}

function orderTable() {
  if (!adminState.orders.length) return '<div class="panel"><div class="panel-head"><h2>Pesanan</h2></div><div class="empty-admin">Belum ada pesanan.</div></div>';
  return `<div class="panel"><div class="panel-head"><h2>Pesanan</h2><span class="panel-meta">${adminState.orders.length} transaksi</span></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>PELANGGAN</th><th>ITEM</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>${adminState.orders.map((order) => { const statuses = order.status === 'expired' ? ['expired', 'pending', 'cancelled'] : ['pending', 'paid', 'completed', 'cancelled']; return `<tr><td><b>${escapeHtml(order.id)}</b><br><small>${new Date(order.createdAt).toLocaleString('id-ID')}</small>${order.expiresAt && order.status === 'pending' ? `<br><small>Expired ${new Date(order.expiresAt).toLocaleTimeString('id-ID')}</small>` : ''}</td><td><b>${escapeHtml(order.customer?.name || '-')}</b><br>${escapeHtml(order.customer?.whatsapp || '-')}</td><td>${order.items.map((line) => `${escapeHtml(line.title || adminState.products.find((product) => product.id === line.id)?.title || line.id)}${line.ownGmail ? ' · Gmail sendiri' : ''}${line.reseller ? ' · Reseller' : ''} ×${line.quantity}`).join('<br>')}</td><td>${money(order.total)}</td><td><select class="order-select status ${escapeHtml(order.status)}" data-order-status="${escapeHtml(order.id)}" data-previous-status="${escapeHtml(order.status)}">${statuses.map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`; }).join('')}</tbody></table></div></div>`;
}

function accountTable() {
  const users = adminState.users || []; if (!activeAccountId && users.length) activeAccountId = users[0].id; const selected = users.find((user) => user.id === activeAccountId);
  return `<div class="account-workspace"><div class="panel account-list"><div class="panel-head"><div><h2>Akun pembeli</h2><span class="panel-meta">${users.length} akun terdaftar</span></div><input id="accountSearch" type="search" placeholder="Cari nama atau email..."></div><div class="table-wrap"><table><thead><tr><th>PEMBELI</th><th>BERGABUNG</th><th>PESANAN</th><th>TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>${users.map((user) => `<tr data-account-row="${user.id}"><td><b>${escapeHtml(user.name)}</b><br><small>${escapeHtml(user.email)}</small></td><td>${new Date(user.createdAt).toLocaleDateString('id-ID')}</td><td>${user.orderCount}</td><td>${money(user.totalSpent)}</td><td><span class="account-status ${user.blocked ? 'blocked' : 'active'}">${user.blocked ? 'Diblokir' : 'Aktif'}</span></td><td><button class="account-detail-button" data-account-detail="${user.id}">Detail</button></td></tr>`).join('')}</tbody></table></div></div>${selected ? accountDetail(selected) : ''}</div>`;
}

function accountDetail(user) {
  return `<aside class="panel account-detail"><div class="account-detail-head"><div><small>DETAIL AKUN</small><h2>${escapeHtml(user.name)}</h2><span>${escapeHtml(user.email)}</span></div><span class="account-status ${user.blocked ? 'blocked' : 'active'}">${user.blocked ? 'Diblokir' : 'Aktif'}</span></div><dl><div><dt>Terdaftar</dt><dd>${new Date(user.createdAt).toLocaleString('id-ID')}</dd></div><div><dt>ID akun</dt><dd>${escapeHtml(user.id)}</dd></div><div><dt>ID perangkat</dt><dd>${escapeHtml(user.deviceId || '-')}</dd></div><div><dt>Total belanja</dt><dd>${money(user.totalSpent)}</dd></div></dl><button class="block-account ${user.blocked ? 'unblock' : ''}" data-block-account="${user.id}" data-blocked="${user.blocked}"><i data-lucide="${user.blocked ? 'shield-check' : 'ban'}"></i>${user.blocked ? 'Buka blokir akun' : 'Blokir akun'}</button><div class="account-orders"><h3>Riwayat pembelian</h3>${user.orders?.length ? user.orders.map((order) => `<article><div><b>${escapeHtml(order.id)}</b><span>${new Date(order.createdAt).toLocaleString('id-ID')}</span></div><em class="status ${order.status}">${order.status}</em><p>${order.items.map((line) => `${escapeHtml(line.title || adminState.products.find((item) => item.id === line.id)?.title || line.id)} ×${line.quantity}${line.reseller ? ' · reseller' : ''}`).join('<br>')}</p><strong>${money(order.total)}</strong></article>`).join('') : '<p class="empty-account-orders">Belum pernah membeli.</p>'}</div></aside>`;
}

function chatWorkspace() {
  const chats = [...(adminState.chats || [])].sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
  if (!activeChatId && chats.length) activeChatId = chats[0].id;
  const chat = chats.find((item) => item.id === activeChatId);
  const whatsapp = String(chat?.customer?.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');
  return `<div class="chat-workspace"><aside class="chat-list"><h2>Chat pembeli <span>${chats.length}</span></h2>${chats.length ? chats.map((item) => `<button class="${item.id === activeChatId ? 'active' : ''}" data-open-chat="${escapeHtml(item.id)}"><b>${escapeHtml(item.customer?.name || 'Pengunjung')}</b><span>${escapeHtml(item.messages?.at(-1)?.text || 'Percakapan baru')}</span></button>`).join('') : '<p>Belum ada chat.</p>'}</aside><section class="admin-conversation">${chat ? `<div class="conversation-head"><div><b>${escapeHtml(chat.customer?.name || 'Pengunjung')}</b><span>${escapeHtml(chat.customer?.whatsapp || 'Nomor WhatsApp belum tersedia')}${chat.orderId ? ` | ${escapeHtml(chat.orderId)}` : ''}</span></div>${whatsapp ? `<a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener">Chat WhatsApp <i data-lucide="external-link"></i></a>` : ''}</div><div class="conversation-messages">${chat.messages.map((message) => `<div class="admin-message ${message.sender === 'admin' ? 'admin' : 'customer'}">${escapeHtml(message.text)}</div>`).join('')}</div><form id="adminReply"><input name="message" required maxlength="1000" autocomplete="off" placeholder="Balas pembeli..."><button type="submit">Kirim</button></form>` : '<div class="empty-admin">Pilih percakapan.</div>'}</section></div>`;
}

function render(options = {}) {
  const listScroll = options.preserveScroll ? content.querySelector('.chat-list')?.scrollTop : 0; const messageScroll = options.preserveScroll ? content.querySelector('.conversation-messages')?.scrollTop : 0;
  const titles = { overview: 'Ringkasan', products: 'Produk', orders: 'Pesanan', accounts: 'Akun Pembeli', reviews: 'Ulasan', chats: 'Chat Pembeli', settings: 'Pengaturan' }; document.querySelector('#adminTitle').textContent = titles[activeTab];
  content.innerHTML = activeTab === 'overview' ? stats() + orderTable() : activeTab === 'products' ? productTable() : activeTab === 'orders' ? orderTable() : activeTab === 'accounts' ? accountTable() : activeTab === 'reviews' ? reviewPanel() : activeTab === 'settings' ? settingsPanel() : chatWorkspace();
  icons();
  if (activeTab === 'chats') { const list = content.querySelector('.chat-list'); const messages = content.querySelector('.conversation-messages'); if (list) list.scrollTop = listScroll; if (messages) messages.scrollTop = options.scrollToEnd ? messages.scrollHeight : messageScroll; }
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
    try { const updated = await api(`/api/admin/products/${save.dataset.saveProduct}`, { method: 'PUT', body: JSON.stringify({ price: Number(row.querySelector('[data-price]').value), stock: Number(row.querySelector('[data-stock]').value), enabled: row.querySelector('[data-enabled]').checked, autoRestock: row.querySelector('[data-auto-restock]').checked }) }); Object.assign(adminState.products.find((product) => product.id === updated.id), updated); row.querySelector('[data-stock]').value = updated.stock; toast(updated.autoRestock ? 'Produk dan auto-restock diperbarui' : 'Produk diperbarui'); }
    catch (error) { toast(error.message); }
    finally { save.disabled = false; save.textContent = 'Simpan'; }
  }
  const chat = event.target.closest('[data-open-chat]'); if (chat) { const listScroll = content.querySelector('.chat-list')?.scrollTop || 0; activeChatId = chat.dataset.openChat; render({ preserveScroll: true, scrollToEnd: true }); const list = content.querySelector('.chat-list'); if (list) list.scrollTop = listScroll; }
  const account = event.target.closest('[data-account-detail]'); if (account) { activeAccountId = account.dataset.accountDetail; render(); }
  const block = event.target.closest('[data-block-account]'); if (block) { block.disabled = true; try { const blocked = block.dataset.blocked !== 'true'; await api(`/api/admin/users/${block.dataset.blockAccount}/block`, { method: 'PUT', body: JSON.stringify({ blocked }) }); const user = adminState.users.find((item) => item.id === block.dataset.blockAccount); user.blocked = blocked; render(); toast(blocked ? 'Akun diblokir dan sesi login dihentikan' : 'Blokir akun dibuka'); } catch (error) { block.disabled = false; toast(error.message); } }
  const deleteReview = event.target.closest('[data-delete-review]'); if (deleteReview) { if (!confirm('Hapus ulasan ini dari toko?')) return; deleteReview.disabled = true; try { await api(`/api/admin/reviews/${encodeURIComponent(deleteReview.dataset.deleteReview)}`, { method: 'DELETE' }); adminState.reviews = adminState.reviews.filter((review) => review.id !== deleteReview.dataset.deleteReview); render(); toast('Ulasan dihapus'); } catch (error) { deleteReview.disabled = false; toast(error.message); } }
});

content.addEventListener('change', async (event) => {
  if (!event.target.matches('[data-order-status]')) return;
  const select = event.target; select.disabled = true;
  try { const updated = await api(`/api/admin/orders/${select.dataset.orderStatus}`, { method: 'PUT', body: JSON.stringify({ status: select.value }) }); Object.assign(adminState.orders.find((order) => order.id === updated.id), updated); select.dataset.previousStatus = updated.status; toast(updated.status === 'cancelled' ? 'Pesanan dibatalkan dan stok dikembalikan' : 'Status pesanan diperbarui'); render(); }
  catch (error) { select.value = select.dataset.previousStatus; select.disabled = false; toast(error.message); }
});
content.addEventListener('input', (event) => { if (!['adminSearch', 'accountSearch', 'reviewSearch'].includes(event.target.id)) return; const query = event.target.value.toLowerCase(); const selector = event.target.id === 'adminSearch' ? '[data-product-row]' : event.target.id === 'accountSearch' ? '[data-account-row]' : '[data-review-row]'; document.querySelectorAll(selector).forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(query); }); });
content.addEventListener('submit', async (event) => {
  if (event.target.id === 'maintenanceForm') { event.preventDefault(); const button = event.target.querySelector('button[type="submit"]'); button.disabled = true; try { const form = new FormData(event.target); const updated = await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ maintenance: form.get('maintenance') === 'on', reviewsEnabled: form.get('reviewsEnabled') === 'on', maintenanceMessage: form.get('maintenanceMessage') }) }); adminState.settings = updated; render(); toast(updated.maintenance ? 'Maintenance mode diaktifkan' : 'Pengaturan disimpan'); } catch (error) { button.disabled = false; toast(error.message); } return; }
  if (event.target.id !== 'adminReply') return; event.preventDefault(); const button = event.target.querySelector('button'); button.disabled = true;
  try { const updated = await api(`/api/admin/chats/${activeChatId}/reply`, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); Object.assign(adminState.chats.find((chat) => chat.id === updated.id), updated); render({ preserveScroll: true, scrollToEnd: true }); }
  catch (error) { button.disabled = false; toast(error.message); }
});

setInterval(async () => { const draft = document.querySelector('#adminReply input'); if (activeTab !== 'chats' || adminApp.hidden || draft?.value) return; try { adminState = await api('/api/admin/state'); render({ preserveScroll: true }); } catch {} }, 5000);
load(); icons();
