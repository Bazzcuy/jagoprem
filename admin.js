let adminState = { products: [], orders: [], chats: [], users: [], reviews: [], vouchers: [], settings: { maintenance: false, maintenanceMessage: '', reviewsEnabled: true } };
let activeTab = 'overview';
let activeChatId = '';
let activeAccountId = '';
let activeLlmUserId = '';
let chatSortMode = 'unread';
const chatDetails = {};
let chatDetailLoadingId = '';

const loginView = document.querySelector('#loginView');
const adminApp = document.querySelector('#adminApp');
const content = document.querySelector('#adminContent');

function money(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0)); }
function icons() { if (window.lucide) window.lucide.createIcons(); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function formatDateTime(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function formatChatTime(value) { const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; const sameDay = date.toDateString() === new Date().toDateString(); return date.toLocaleString('id-ID', sameDay ? { hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function toast(message) { const node = document.querySelector('#adminToast'); node.textContent = message; node.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('show'), 2400); }
function chatSummary(chat) {
  const messages = chat?.messages || [];
  const lastMessage = messages.at(-1) || null;
  const lastReadAt = new Date(chat?.adminLastReadAt || 0).getTime() || 0;
  return {
    id: chat.id,
    userId: chat.userId || '',
    orderId: chat.orderId || '',
    customer: chat.customer || {},
    updatedAt: chat.updatedAt || lastMessage?.createdAt || '',
    adminLastReadAt: chat.adminLastReadAt || '',
    lastMessageAt: lastMessage?.createdAt || chat.updatedAt || '',
    lastMessageText: lastMessage?.text || '',
    lastMessageSender: lastMessage?.sender || '',
    unreadCount: messages.filter((message) => message.sender !== 'admin' && new Date(message.createdAt || '').getTime() > lastReadAt).length,
    messageCount: messages.length
  };
}
function upsertChat(chat) {
  if (!chat) return null;
  const detail = Array.isArray(chat.messages) ? chat : chatDetails[chat.id] || chat;
  chatDetails[chat.id] = detail;
  const summary = chatSummary(detail);
  const index = (adminState.chats || []).findIndex((item) => item.id === summary.id);
  if (index >= 0) adminState.chats[index] = { ...(adminState.chats[index] || {}), ...summary };
  else adminState.chats.unshift(summary);
  return detail;
}
function sortChats(chats) {
  const comparator = chatSortMode === 'newest'
    ? (left, right) => String(right.lastMessageAt || right.updatedAt || '').localeCompare(String(left.lastMessageAt || left.updatedAt || '')) || Number(right.unreadCount || 0) - Number(left.unreadCount || 0)
    : (left, right) => Number(right.unreadCount || 0) - Number(left.unreadCount || 0) || String(right.lastMessageAt || right.updatedAt || '').localeCompare(String(left.lastMessageAt || left.updatedAt || ''));
  return [...chats].sort(comparator);
}
async function loadChatDetail(chatId) {
  if (!chatId || chatDetailLoadingId === chatId) return chatDetails[chatId] || null;
  chatDetailLoadingId = chatId;
  render({ preserveScroll: true });
  try {
    const chat = await api(`/api/admin/chats/${encodeURIComponent(chatId)}`);
    return upsertChat(chat);
  } catch (error) {
    toast(error.message);
    return null;
  } finally {
    chatDetailLoadingId = '';
    if (activeTab === 'chats') render({ preserveScroll: true });
  }
}
function openChat(chatId) {
  if (!chatId) return;
  activeChatId = chatId;
  if (activeTab !== 'chats') activeTab = 'chats';
  void loadChatDetail(chatId);
}

const adminModalLayer = document.querySelector('#adminModalLayer');
const adminModal = document.querySelector('#adminModal');
let adminDialogState = null;

function closeAdminDialog(result = null) {
  if (adminDialogState?.resolve) adminDialogState.resolve(result);
  adminDialogState = null;
  adminModal.innerHTML = '';
  adminModalLayer.classList.remove('open');
  adminModalLayer.setAttribute('aria-hidden', 'true');
}

function renderAdminDialog() {
  if (!adminDialogState) return;
  const state = adminDialogState;
  const title = escapeHtml(state.title || 'Dialog');
  const description = state.description ? `<p class="admin-modal-desc">${escapeHtml(state.description)}</p>` : '';
  let fields = '';
  if (state.kind === 'compose-message' || state.kind === 'edit-message') {
    fields = `<label class="admin-modal-field">Pesan<textarea name="message" required maxlength="1000" rows="6" placeholder="${escapeHtml(state.placeholder || 'Tulis pesan...')}">${escapeHtml(state.value || '')}</textarea></label>`;
  } else if (state.kind === 'notification') {
    fields = `<label class="admin-modal-field">Judul<input name="title" required maxlength="100" value="${escapeHtml(state.value?.title || '')}" placeholder="Contoh: Promo spesial"></label><label class="admin-modal-field">Isi pesan<textarea name="text" required maxlength="500" rows="6" placeholder="Tulis isi notifikasi...">${escapeHtml(state.value?.text || '')}</textarea></label>`;
  } else if (state.kind === 'confirm-text') {
    fields = `<label class="admin-modal-field">Ketik "${escapeHtml(state.requiredValue || '')}"<input name="value" required autocomplete="off" maxlength="120" value="${escapeHtml(state.value || '')}" placeholder="${escapeHtml(state.requiredValue || '')}"></label>`;
  } else if (state.kind === 'confirm') {
    fields = '<p class="admin-modal-note">Tindakan ini tidak bisa dibatalkan.</p>';
  }
  adminModal.innerHTML = `<form class="admin-modal-shell" id="adminModalForm"><div class="admin-modal-head"><div><small>${escapeHtml(state.eyebrow || 'ADMIN ACTION')}</small><h2 id="adminModalTitle">${title}</h2>${description}</div><button type="button" class="admin-modal-close" data-admin-modal-cancel aria-label="Tutup"><i data-lucide="x"></i></button></div><div class="admin-modal-body">${fields}</div><div class="admin-modal-actions"><button type="button" class="admin-modal-cancel" data-admin-modal-cancel>${escapeHtml(state.cancelLabel || 'Batal')}</button><button type="submit" class="admin-modal-submit ${state.destructive ? 'danger' : ''}">${escapeHtml(state.confirmLabel || 'Simpan')}</button></div></form>`;
  icons();
  requestAnimationFrame(() => {
    adminModal.querySelector('textarea, input')?.focus();
  });
}

function openAdminDialog(state) {
  return new Promise((resolve) => {
    adminDialogState = { ...state, resolve };
    adminModalLayer.classList.add('open');
    adminModalLayer.setAttribute('aria-hidden', 'false');
    renderAdminDialog();
  });
}

adminModalLayer.addEventListener('click', (event) => {
  if (event.target === adminModalLayer || event.target.closest('[data-admin-modal-cancel]')) closeAdminDialog(null);
});
adminModalLayer.addEventListener('submit', (event) => {
  if (event.target.id !== 'adminModalForm') return;
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  if (!adminDialogState) return;
  if (adminDialogState.kind === 'compose-message' || adminDialogState.kind === 'edit-message') {
    const message = String(form.message || '').trim();
    if (!message) return toast('Pesan tidak boleh kosong.');
    closeAdminDialog(message);
    return;
  }
  if (adminDialogState.kind === 'notification') {
    const title = String(form.title || '').trim();
    const text = String(form.text || '').trim();
    if (!title || !text) return toast('Judul dan isi notifikasi wajib diisi.');
    closeAdminDialog({ title, text });
    return;
  }
  if (adminDialogState.kind === 'confirm-text') {
    const value = String(form.value || '').trim();
    if (!value) return toast('Konfirmasi tidak boleh kosong.');
    closeAdminDialog(value);
    return;
  }
  closeAdminDialog(true);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && adminModalLayer.classList.contains('open')) closeAdminDialog(null);
});

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { if (response.status === 401 && url !== '/api/admin/login') showLogin(); throw new Error(data.error || 'Terjadi kesalahan'); }
  return data;
}

function showLogin() { loginView.hidden = false; adminApp.hidden = true; }
async function load() {
  try { adminState = await api('/api/admin/state'); loginView.hidden = true; adminApp.hidden = false; normalizeActiveSelections(); render(); }
  catch { showLogin(); }
}

function normalizeActiveSelections() {
  const chats = adminState.chats || [];
  if (chats.length && !chats.some((chat) => chat.id === activeChatId)) activeChatId = chats[0].id;
  if (!chats.length) activeChatId = '';
  const users = adminState.users || [];
  if (users.length && !users.some((user) => user.id === activeAccountId)) activeAccountId = users[0].id;
  if (!users.length) activeAccountId = '';
}

function statsPanel() {
  const activeProducts = adminState.products.filter((product) => product.enabled).length;
  const stock = adminState.products.reduce((total, product) => total + Number(product.stock || 0), 0);
  const pending = adminState.orders.filter((order) => order.status === 'pending').length;
  const revenue = adminState.orders.filter((order) => ['paid', 'completed'].includes(order.status)).reduce((total, order) => total + Number(order.total || 0), 0);
  return `<div class="stats"><article class="stat"><span>Produk aktif</span><strong>${activeProducts}</strong></article><article class="stat"><span>Total stok</span><strong>${stock}</strong></article><article class="stat"><span>Pesanan pending</span><strong>${pending}</strong></article><article class="stat"><span>Omzet tercatat</span><strong>${money(revenue)}</strong></article></div>`;
}

function isAdminAiProduct(product) { return /(^|\s)AI(?:\s|$)|GPT EDU|CHATGPT|CLAUDE|GROK|GEMINI|PERPLEXITY|KIRO|LEONARDO|KLING|DOLA AI/i.test(product.title || ''); }
function isAdminSharingProduct(product) {
  const explicit = [product.title, product.access, product.thumbnail].filter(Boolean).join(' ');
  const context = [product.title, product.access, product.description].filter(Boolean).join(' ');
  return /sharing/i.test(explicit) && !/(bukan|non[- ]?)\s*sharing|private|privat/i.test(context);
}
function productTable(list = adminState.products) {
  const rows = list.map((product) => {
    const sharing = isAdminSharingProduct(product);
    const badge = sharing ? '<small class="product-policy sharing">Sharing • stok dikunci 0</small>' : (isAdminAiProduct(product) ? '<small class="product-policy private">AI Private</small>' : '');
    const variantRow = `<tr class="variant-row" id="variant-row-${product.id}" hidden><td colspan="6"><div class="variant-editor" id="variant-editor-${product.id}">${variantEditorHtml(product)}</div></td></tr>`;
    return `<tr data-product-row="${product.id}"><td><img src="${escapeHtml(product.thumbnail)}" alt=""><span class="product-name">${escapeHtml(product.title)}${badge}</span></td><td><input class="table-input" data-price value="${Number(product.price || 0)}" type="number" min="0" aria-label="Harga ${escapeHtml(product.title)}"></td><td><input class="table-input stock-input" data-stock value="${Number(product.stock || 0)}" type="number" min="0" max="49" ${sharing ? 'disabled' : ''} aria-label="Stok ${escapeHtml(product.title)}"></td><td><input class="toggle" data-enabled type="checkbox" ${product.enabled ? 'checked' : ''} aria-label="Aktifkan ${escapeHtml(product.title)}"></td><td><input class="toggle" data-auto-restock type="checkbox" ${product.autoRestock ? 'checked' : ''} ${sharing ? 'disabled' : ''} aria-label="Auto-restock ${escapeHtml(product.title)}"></td><td class="product-actions"><button class="save-product" data-save-product="${product.id}">Simpan</button>${product.variants?.length ? `<button class="variant-btn" data-variant-product="${product.id}">Varian (${product.variants.length})</button>` : `<button class="variant-btn" data-variant-product="${product.id}">+ Varian</button>`}</td></tr>${variantRow}`;
  }).join('');
  return `<div class="panel"><div class="panel-head"><div><h2>Kelola produk</h2><span class="panel-meta">Tersinkron langsung dengan katalog toko • akun AI private • produk sharing dikunci stok 0</span></div><input id="adminSearch" type="search" placeholder="Cari produk..." aria-label="Cari produk"></div><div class="table-wrap"><table><thead><tr><th>PRODUK</th><th>HARGA</th><th>STOK</th><th>AKTIF</th><th>AUTO +8</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function variantEditorHtml(product) {
  const variants = product.variants || [];
  return `<div class="variant-editor-inner"><h4>Varian Produk: ${escapeHtml(product.title)}</h4>${variants.length ? `<table class="variant-table"><thead><tr><th>ID</th><th>LABEL</th><th>HARGA</th><th>DURASI</th><th>GARANSI</th><th></th></tr></thead><tbody>${variants.map((v) => `<tr data-variant-row="${escapeHtml(v.id)}"><td><code>${escapeHtml(v.id)}</code></td><td><input class="table-input" data-v-label value="${escapeHtml(v.label)}"></td><td><input class="table-input" data-v-price type="number" min="0" value="${Number(v.price || 0)}"></td><td><input class="table-input" data-v-duration value="${escapeHtml(v.duration || '')}"></td><td><input class="table-input" data-v-warranty value="${escapeHtml(v.warranty || '')}"></td><td><button class="delete-variant" data-delete-variant="${escapeHtml(v.id)}" data-product-id="${product.id}">Hapus</button></td></tr>`).join('')}</tbody></table>` : '<p style="color:#60706c;font-size:13px">Belum ada varian.</p>'}<form class="add-variant-form" data-product-id="${product.id}"><div class="variant-form-row"><input name="id" required maxlength="20" placeholder="ID (mis: 2y)"><input name="label" required maxlength="80" placeholder="Label (mis: 2 Tahun)"><input name="price" required type="number" min="0" placeholder="Harga"><input name="duration" maxlength="40" placeholder="Durasi (mis: 2 tahun)"><input name="warranty" maxlength="40" placeholder="Garansi (mis: 8 bulan)"><button type="submit">Tambah Varian</button></div></form><button class="save-variants-btn" data-save-variants="${product.id}">Simpan Semua Varian</button></div>`;
}

function orderTable() {
  if (!adminState.orders.length) return '<div class="panel"><div class="panel-head"><h2>Pesanan</h2></div><div class="empty-admin">Belum ada pesanan.</div></div>';
  return `<div class="panel"><div class="panel-head"><h2>Pesanan</h2><span class="panel-meta">${adminState.orders.length} transaksi</span></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>PELANGGAN</th><th>ITEM</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>${adminState.orders.map((order) => { const statuses = order.status === 'expired' ? ['expired', 'pending', 'cancelled'] : ['pending', 'paid', 'completed', 'cancelled']; const canEditCustomer = ['pending', 'paid'].includes(order.status); return `<tr><td><b>${escapeHtml(order.id)}</b><br><small>${formatDateTime(order.createdAt)}</small>${order.expiresAt && order.status === 'pending' ? `<br><small>Expired ${new Date(order.expiresAt).toLocaleTimeString('id-ID')}</small>` : ''}</td><td><b>${escapeHtml(order.customer?.name || '-')}</b><br>${escapeHtml(order.customer?.whatsapp || '-')}${order.customer?.note ? `<br><small>${escapeHtml(order.customer.note)}</small>` : ''}${canEditCustomer ? `<br><button class="edit-customer-btn" data-edit-customer="${escapeHtml(order.id)}"><i data-lucide="pencil"></i> Edit WA/Nama</button>` : ''}</td><td>${(order.items || []).map((line) => `${escapeHtml(line.title || adminState.products.find((product) => product.id === line.id)?.title || line.id)}${line.ownGmail ? ' - Gmail sendiri' : ''}${line.reseller ? ' - Reseller' : ''} x${line.quantity}`).join('<br>')}</td><td>${money(order.total)}</td><td><select class="order-select status ${escapeHtml(order.status)}" data-order-status="${escapeHtml(order.id)}" data-previous-status="${escapeHtml(order.status)}">${statuses.map((status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>${canEditCustomer ? `<tr class="customer-edit-row" id="edit-row-${escapeHtml(order.id)}" hidden><td colspan="5"><form class="customer-edit-form" data-order-id="${escapeHtml(order.id)}"><div class="customer-edit-fields"><label>NAMA<input name="name" required maxlength="80" value="${escapeHtml(order.customer?.name || '')}"></label><label>NOMOR WHATSAPP<input name="whatsapp" required pattern="\\+?[0-9]{9,15}" inputmode="tel" value="${escapeHtml(order.customer?.whatsapp || '')}" placeholder="Contoh: 6281234567890"></label><label class="wide">CATATAN<input name="note" maxlength="500" value="${escapeHtml(order.customer?.note || '')}"></label></div><div class="customer-edit-actions"><button type="submit">Simpan perubahan</button><button type="button" data-cancel-edit-customer="${escapeHtml(order.id)}">Batal</button></div></form></td></tr>` : ''}`; }).join('')}</tbody></table></div></div>`;
}

function voucherPanel() {
  const vouchers = adminState.vouchers || [];
  const categoryOptions = (selected = '') => ['', 'AI & produktivitas', 'Developer API', 'Hiburan premium', 'Aplikasi premium'].map((category) => `<option value="${escapeHtml(category)}" ${category === selected ? 'selected' : ''}>${category || 'Semua kategori'}</option>`).join('');
  const typeOptions = (selected = 'amount') => `<option value="amount" ${selected === 'amount' ? 'selected' : ''}>Nominal</option><option value="percent" ${selected === 'percent' ? 'selected' : ''}>Persen</option>`;
  return `<div class="voucher-workspace"><form class="panel voucher-form" id="voucherForm"><div class="panel-head"><div><h2>Buat voucher</h2><span class="panel-meta">Kode promo dipakai pembeli saat checkout</span></div></div><div class="voucher-fields"><label>KODE<input name="code" required maxlength="32" placeholder="SPESIALAI07"></label><label>TIPE<select name="type">${typeOptions('percent')}</select></label><label>NILAI<input name="value" required type="number" min="1" placeholder="16"></label><label>MIN. BELANJA<input name="minSubtotal" type="number" min="0" value="0"></label><label>MIN. PRODUK<input name="minQuantity" type="number" min="0" value="2"></label><label>KATEGORI<select name="requiredCategory">${categoryOptions('AI & produktivitas')}</select></label><label>KUOTA<input name="maxUses" type="number" min="0" value="0"><small>0 = tanpa batas</small></label><label>EXPIRED<input name="expiresAt" type="date"></label><label class="wide">DESKRIPSI<input name="description" maxlength="120" placeholder="Diskon 16% minimal 2 produk AI yang sama"></label><label class="voucher-active"><input name="requireSameProduct" type="checkbox" checked> Wajib produk sama</label><label class="voucher-active"><input name="enabled" type="checkbox" checked> Aktif</label></div><button type="submit">Buat voucher</button></form><div class="panel"><div class="panel-head"><div><h2>Kelola voucher</h2><span class="panel-meta">${vouchers.length} kode promo</span></div><input id="voucherSearch" type="search" placeholder="Cari kode..."></div><div class="voucher-cards">${vouchers.length ? vouchers.map((voucher) => `<article class="voucher-admin-card" data-voucher-row="${escapeHtml(voucher.code)}"><div class="voucher-admin-top"><div><b>${escapeHtml(voucher.code)}</b><small>${Number(voucher.used || 0)} terpakai${Number(voucher.maxUses || 0) ? ` dari ${Number(voucher.maxUses || 0)}` : ''}</small></div><label class="voucher-switch"><input data-voucher-enabled type="checkbox" ${voucher.enabled === false ? '' : 'checked'}> Aktif</label></div><div class="voucher-edit-grid"><label>Kode<input data-voucher-code maxlength="32" value="${escapeHtml(voucher.code)}"></label><label>Tipe<select data-voucher-type>${typeOptions(voucher.type)}</select></label><label>Nilai<input data-voucher-value type="number" min="1" value="${Number(voucher.value || 0)}"></label><label>Min. belanja<input data-voucher-min-subtotal type="number" min="0" value="${Number(voucher.minSubtotal || 0)}"></label><label>Min. produk<input data-voucher-min-quantity type="number" min="0" value="${Number(voucher.minQuantity || 0)}"></label><label>Kategori<select data-voucher-category>${categoryOptions(voucher.requiredCategory || '')}</select></label><label>Kuota<input data-voucher-max-uses type="number" min="0" value="${Number(voucher.maxUses || 0)}"></label><label>Expired<input data-voucher-expires type="date" value="${escapeHtml(String(voucher.expiresAt || '').slice(0, 10))}"></label><label class="wide">Deskripsi<input data-voucher-description maxlength="120" value="${escapeHtml(voucher.description || '')}"></label><label class="voucher-check"><input data-voucher-same-product type="checkbox" ${voucher.requireSameProduct ? 'checked' : ''}> Minimal produk harus dari produk yang sama</label></div><div class="voucher-admin-actions"><button class="save-product" data-save-voucher="${escapeHtml(voucher.code)}">Simpan</button><button class="delete-voucher" data-delete-voucher="${escapeHtml(voucher.code)}">Hapus</button></div></article>`).join('') : '<div class="empty-admin">Belum ada voucher.</div>'}</div></div></div>`;
}

function accountTable() {
  const users = adminState.users || [];
  if (!activeAccountId && users.length) activeAccountId = users[0].id;
  const selected = users.find((user) => user.id === activeAccountId);
  return `<div class="account-workspace"><div class="panel account-list"><div class="panel-head"><div><h2>Akun pembeli</h2><span class="panel-meta">${users.length} akun terdaftar</span></div><input id="accountSearch" type="search" placeholder="Cari nama atau email..."></div><div class="table-wrap"><table><thead><tr><th>PEMBELI</th><th>BERGABUNG</th><th>PESANAN</th><th>TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>${users.map((user) => `<tr data-account-row="${escapeHtml(user.id)}"><td><b>${escapeHtml(user.name)}</b><br><small>${escapeHtml(user.email)}</small></td><td>${formatDateTime(user.createdAt)}</td><td>${Number(user.orderCount || 0)}</td><td>${money(user.totalSpent)}</td><td><span class="account-status ${user.blocked ? 'blocked' : 'active'}">${user.blocked ? 'Diblokir' : 'Aktif'}</span></td><td><button class="account-detail-button" data-account-detail="${escapeHtml(user.id)}">Detail</button></td></tr>`).join('')}</tbody></table></div></div>${selected ? accountDetail(selected) : ''}</div>`;
}

function llmUserDetail(user) {
  return `<div class="llm-user-detail-wrap">
    <div class="llm-user-detail-header">
      <div class="llm-user-avatar">${escapeHtml(user.name).charAt(0).toUpperCase()}</div>
      <div class="llm-user-detail-info">
        <h3>${escapeHtml(user.name)}</h3>
        <span>${escapeHtml(user.email)}</span>
      </div>
      <span class="llm-status-chip ${user.activated ? 'active' : 'pending'}">${user.activated ? 'Aktif' : 'Tertunda'}</span>
    </div>
    <div class="llm-user-stats">
      <div class="llm-stat-box"><span>Terdaftar</span><strong>${formatDateTime(user.createdAt || user.created_at)}</strong></div>
      <div class="llm-stat-box"><span>Saldo (USD)</span><strong>$${Number(user.balance_usd || 0).toFixed(2)}</strong></div>
      <div class="llm-stat-box"><span>Total Requests</span><strong>${Number(user.total_requests || 0).toLocaleString()}</strong></div>
      <div class="llm-stat-box"><span>Failed Requests</span><strong>${Number(user.failed_requests || 0).toLocaleString()}</strong></div>
      <div class="llm-stat-box"><span>Total Tokens</span><strong>${escapeHtml(String(user.total_tokens || '0'))}</strong></div>
    </div>
    <div class="llm-apikey-box">
      <label>API Key</label>
      <div class="llm-apikey-row">
        <input id="llmKeyInput_${escapeHtml(user.id)}" readonly class="llm-apikey-input" value="${escapeHtml(user.api_key)}" />
        <button type="button" class="llm-copy-btn" data-copy-key="${escapeHtml(user.id)}"><i data-lucide="copy"></i> Salin</button>
      </div>
    </div>
    <form class="llm-edit-form" data-llm-id="${escapeHtml(user.id)}">
      <div class="llm-edit-grid">
        <label class="llm-edit-field">Nama<input name="name" required maxlength="80" value="${escapeHtml(user.name)}" /></label>
        <label class="llm-edit-field">Email<input name="email" type="email" required value="${escapeHtml(user.email)}" /></label>
        <label class="llm-edit-field">Saldo (USD)<input name="balance_usd" type="number" step="0.01" min="0" value="${Number(user.balance_usd || 0)}" /></label>
        <label class="llm-edit-field">Total Requests<input name="total_requests" type="number" min="0" value="${Number(user.total_requests || 0)}" /></label>
        <label class="llm-edit-field">Failed Requests<input name="failed_requests" type="number" min="0" value="${Number(user.failed_requests || 0)}" /></label>
        <label class="llm-edit-field">Total Tokens (misal: 182.4k)<input name="total_tokens" maxlength="30" value="${escapeHtml(String(user.total_tokens || '0'))}" /></label>
        <label class="llm-edit-field wide">Catatan<textarea name="notes" maxlength="500" rows="2">${escapeHtml(user.notes || '')}</textarea></label>
        <label class="llm-edit-field wide">Pesan Suspend (ditampilkan jika akun mati)<textarea name="suspend_message" maxlength="500" rows="1">${escapeHtml(user.suspend_message || 'maaf limit api key ini sudah habis')}</textarea></label>
      </div>
      <label class="llm-toggle-row"><input name="activated" type="checkbox" ${user.activated ? 'checked' : ''} /><span>Akun Aktif</span></label>
      <div class="llm-edit-actions">
        <button type="submit" class="llm-btn-save"><i data-lucide="save"></i> Simpan</button>
        <button type="button" class="llm-btn-regen" data-regen-llm="${escapeHtml(user.id)}"><i data-lucide="refresh-cw"></i> Regen Key</button>
        <button type="button" class="llm-btn-delete" data-delete-llm="${escapeHtml(user.id)}" data-llm-name="${escapeHtml(user.name)}"><i data-lucide="trash-2"></i> Hapus</button>
      </div>
    </form>
  </div>`;
}

function llmUserTable() {
  const users = adminState.llmUsers || [];
  if (!activeLlmUserId && users.length) activeLlmUserId = users[0].id;
  const selected = users.find((u) => u.id === activeLlmUserId);
  return `<div class="llm-page">
    <div class="llm-top-bar">
      <div>
        <h2>LLM Users <span class="llm-count">${users.length}</span></h2>
        <p class="llm-subtitle">Kelola akun API LLM JagoPrem</p>
      </div>
      <button class="llm-add-btn" id="llmAddToggle"><i data-lucide="plus"></i> Tambah Akun</button>
    </div>
    <div class="llm-add-form-wrap" id="llmAddFormWrap" style="display:none">
      <form id="addLlmUserForm" class="llm-add-form">
        <label class="llm-edit-field">Nama User<input name="name" required placeholder="misal: Budi Santoso" /></label>
        <label class="llm-edit-field">Email<input name="email" type="email" required placeholder="email@domain.com" /></label>
        <div class="llm-add-actions">
          <button type="submit" class="llm-btn-save"><i data-lucide="user-plus"></i> Buat Akun</button>
          <button type="button" id="llmAddCancel" class="llm-btn-cancel">Batal</button>
        </div>
      </form>
    </div>
    <div class="llm-main">
      <div class="llm-card-list">
        ${users.length ? users.map((u) => `<div class="llm-user-card ${u.id === activeLlmUserId ? 'active' : ''}" data-llm-detail="${escapeHtml(u.id)}">
          <div class="llm-card-avatar">${escapeHtml(u.name).charAt(0).toUpperCase()}</div>
          <div class="llm-card-info">
            <b>${escapeHtml(u.name)}</b>
            <span>${escapeHtml(u.email)}</span>
            <span class="llm-status-chip ${u.activated ? 'active' : 'pending'}">${u.activated ? 'Aktif' : 'Tertunda'}</span>
          </div>
          <div class="llm-card-balance">$${Number(u.balance_usd || 0).toFixed(2)}</div>
        </div>`).join('') : '<p class="llm-empty">Belum ada akun LLM. Klik Tambah Akun untuk mulai.</p>'}
      </div>
      <div class="llm-detail-panel">
        ${selected ? llmUserDetail(selected) : '<div class="llm-no-selection"><i data-lucide="users"></i><p>Pilih user di sebelah kiri untuk melihat detail</p></div>'}
      </div>
    </div>
  </div>`;
}




function accountDetail(user) {
  return `<aside class="panel account-detail"><div class="account-detail-head"><div><small>DETAIL AKUN</small><h2>${escapeHtml(user.name)}</h2><span>${escapeHtml(user.email)}</span></div><span class="account-status ${user.blocked ? 'blocked' : 'active'}">${user.blocked ? 'Diblokir' : 'Aktif'}</span></div><dl><div><dt>Terdaftar</dt><dd>${formatDateTime(user.createdAt)}</dd></div><div><dt>ID akun</dt><dd>${escapeHtml(user.id)}</dd></div><div><dt>ID perangkat</dt><dd>${escapeHtml(user.deviceId || '-')}</dd></div><div><dt>Total belanja</dt><dd>${money(user.totalSpent)}</dd></div></dl><div class="account-action-buttons"><button class="chat-user-btn" data-chat-user="${escapeHtml(user.id)}" data-chat-name="${escapeHtml(user.name)}"><i data-lucide="message-circle"></i>Chat User Ini</button><button class="notify-user-btn" data-notify-user="${escapeHtml(user.id)}"><i data-lucide="bell-ring"></i>Kirim Notif</button><button class="block-account ${user.blocked ? 'unblock' : ''}" data-block-account="${escapeHtml(user.id)}" data-blocked="${Boolean(user.blocked)}"><i data-lucide="${user.blocked ? 'shield-check' : 'ban'}"></i>${user.blocked ? 'Buka blokir akun' : 'Blokir akun'}</button><button class="delete-account-btn" data-delete-account="${escapeHtml(user.id)}" data-account-name="${escapeHtml(user.name)}"><i data-lucide="user-x"></i>Hapus akun</button></div><div class="account-orders"><h3>Riwayat pembelian</h3>${user.orders?.length ? user.orders.map((order) => `<article><div><b>${escapeHtml(order.id)}</b><span>${formatDateTime(order.createdAt)}</span></div><em class="status ${escapeHtml(order.status)}">${escapeHtml(order.status)}</em><p>${(order.items || []).map((line) => `${escapeHtml(line.title || adminState.products.find((item) => item.id === line.id)?.title || line.id)} x${line.quantity}${line.reseller ? ' - reseller' : ''}`).join('<br>')}</p><strong>${money(order.total)}</strong></article>`).join('') : '<p class="empty-account-orders">Belum pernah membeli.</p>'}</div></aside>`;
}

function reviewStars(rating) { return `<span class="admin-stars">${Array.from({ length: 5 }, (_, index) => `<i data-lucide="star" class="${index < Number(rating) ? 'filled' : ''}"></i>`).join('')}</span>`; }
function reviewPanel() {
  const reviews = [...(adminState.reviews || [])].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0;
  const counts = [5, 4, 3, 2, 1].map((rating) => `${rating} bintang ${reviews.filter((review) => Number(review.rating) === rating).length}`).join(' - ');
  return `<div class="panel review-admin"><div class="panel-head"><div><h2>Kelola ulasan</h2><span class="panel-meta">${reviews.length} ulasan - rating ${average.toFixed(1)} - ${counts}</span></div><input id="reviewSearch" type="search" placeholder="Cari nama, produk, komentar..."></div><div class="review-admin-status"><span>Ulasan baru: <b>${adminState.settings?.reviewsEnabled === false ? 'Dimatikan' : 'Aktif'}</b></span><span>Hapus ulasan akan langsung mengubah rating publik.</span></div><div class="table-wrap"><table><thead><tr><th>PEMBELI</th><th>PRODUK</th><th>RATING</th><th>KOMENTAR</th><th>TANGGAL</th><th></th></tr></thead><tbody>${reviews.map((review) => { const product = adminState.products.find((item) => item.id === review.productId); return `<tr data-review-row="${escapeHtml(review.id)}"><td><b>${escapeHtml(review.customerName || 'Pembeli')}</b><br><small>${escapeHtml(review.userId || review.orderId || 'sample')}</small></td><td>${escapeHtml(product?.title || review.productId || 'Produk')}</td><td>${reviewStars(review.rating)}<small>${Number(review.rating || 0)} bintang</small></td><td>${escapeHtml(review.comment || '')}</td><td>${formatDateTime(review.createdAt)}</td><td><button class="delete-review" data-delete-review="${escapeHtml(review.id)}"><i data-lucide="trash-2"></i>Hapus</button></td></tr>`; }).join('')}</tbody></table></div></div>`;
}

function settingsPanel() {
  const settings = adminState.settings || {};
  return `<div class="settings-grid"><form class="panel maintenance-panel" id="maintenanceForm"><div class="settings-icon"><i data-lucide="construction"></i></div><div><small>STATUS TOKO</small><h2>Mode maintenance</h2><p>Saat aktif, pengunjung melihat halaman pemeliharaan. Dashboard admin tetap dapat dibuka.</p></div><label class="maintenance-switch"><input name="maintenance" type="checkbox" ${settings.maintenance ? 'checked' : ''}><span></span><b>${settings.maintenance ? 'Aktif' : 'Nonaktif'}</b></label><label class="maintenance-switch"><input name="reviewsEnabled" type="checkbox" ${settings.reviewsEnabled === false ? '' : 'checked'}><span></span><b>Terima ulasan baru</b></label><label class="settings-message">PESAN UNTUK PENGUNJUNG<textarea name="maintenanceMessage" maxlength="240">${escapeHtml(settings.maintenanceMessage || '')}</textarea></label><button type="submit">Simpan pengaturan</button></form><div class="panel operations-note"><i data-lucide="refresh-cw"></i><h2>Kontrol operasional</h2><p>Auto-restock dikelola per produk. Ulasan baru bisa dimatikan sementara dari pengaturan ini tanpa menghapus ulasan lama.</p></div></div>`;
}

function chatWorkspace() {
  const chats = sortChats(adminState.chats || []);
  if (chats.length && !chats.some((chat) => chat.id === activeChatId)) activeChatId = chats[0].id;
  const chat = chatDetails[activeChatId] || chats.find((item) => item.id === activeChatId) || null;
  const whatsapp = String(chat?.customer?.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');
  const loadingChat = Boolean(activeChatId && !chatDetails[activeChatId] && chatDetailLoadingId === activeChatId);
  return `<div class="chat-workspace"><aside class="chat-list"><div class="chat-list-head"><div><h2>Chat pembeli <span>${chats.length}</span></h2><small>${chatSortMode === 'unread' ? 'Prioritas belum dibaca' : 'Prioritas terbaru'}</small></div><div class="chat-sort-controls"><button type="button" class="chat-sort-btn ${chatSortMode === 'newest' ? 'active' : ''}" data-chat-sort="newest"><i data-lucide="arrow-down-wide-narrow"></i>Terbaru</button><button type="button" class="chat-sort-btn ${chatSortMode === 'unread' ? 'active' : ''}" data-chat-sort="unread"><i data-lucide="badge-alert"></i>Unread</button></div></div>${chats.length ? chats.map((item) => { const hasUnread = Number(item.unreadCount || 0) > 0; return `<button class="${item.id === activeChatId ? 'active' : ''} ${hasUnread ? 'unread' : ''}" data-open-chat="${escapeHtml(item.id)}"><div class="chat-item-top"><b>${escapeHtml(item.customer?.name || 'Pengunjung')}</b>${hasUnread ? `<span class="chat-unread">${Number(item.unreadCount || 0)}</span>` : ''}</div><span>${escapeHtml(item.lastMessageText || 'Percakapan baru')}</span><time>${formatChatTime(item.lastMessageAt || item.updatedAt)}</time></button>`; }).join('') : '<p>Belum ada chat.</p>'}</aside><section class="admin-conversation">${chat ? `<div class="conversation-head"><div><b>${escapeHtml(chat.customer?.name || 'Pengunjung')}</b><span>${escapeHtml(chat.customer?.whatsapp || 'Nomor WhatsApp belum tersedia')}${chat.orderId ? ` | ${escapeHtml(chat.orderId)}` : ''}</span></div>${whatsapp ? `<a href="https://wa.me/${whatsapp}" target="_blank" rel="noopener">Chat WhatsApp <i data-lucide="external-link"></i></a>` : ''}</div><div class="conversation-messages">${(chat.messages || []).map((message) => `<div class="admin-message ${message.sender === 'admin' ? 'admin' : 'customer'}" data-message-id="${escapeHtml(message.id)}" data-chat-id="${escapeHtml(chat.id)}"><div class="msg-bubble-content"><span class="message-text">${escapeHtml(message.text)}</span><time class="message-meta">${formatDateTime(message.createdAt)}</time></div><div class="msg-actions"><button class="msg-action-btn" data-edit-message="${escapeHtml(message.id)}" data-chat-id="${escapeHtml(chat.id)}" title="Edit pesan"><i data-lucide="pencil"></i></button><button class="msg-action-btn danger" data-delete-message="${escapeHtml(message.id)}" data-chat-id="${escapeHtml(chat.id)}" title="Hapus pesan"><i data-lucide="trash-2"></i></button></div></div>`).join('')}</div><form id="adminReply"><textarea name="message" required maxlength="1000" autocomplete="off" rows="1" placeholder="Balas pembeli..."></textarea><button type="submit">Kirim</button></form>` : `<div class="empty-admin">${loadingChat ? 'Memuat percakapan...' : 'Belum ada percakapan.'}</div>`}</section></div>`;
}

function notificationPanel() {
  return `
    <div class="panel" style="max-width: 500px">
      <div class="panel-head" style="margin-bottom: 20px; border-bottom: 1px solid var(--line); padding-bottom: 15px;">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;border-radius:8px;background:#eaf5f2;color:var(--teal);display:flex;align-items:center;justify-content:center"><i data-lucide="bell-ring"></i></div>
          <div><small style="color:var(--muted);font-weight:800;font-size:9px;letter-spacing:1px">NOTIFIKASI</small><h2 style="font-size:16px;margin:2px 0 0">Kirim Broadcast</h2></div>
        </div>
      </div>
      <form id="adminNotificationForm" style="display:flex;flex-direction:column;gap:16px;">
        <label class="llm-edit-field">JUDUL NOTIFIKASI
          <input name="title" required maxlength="100" placeholder="Contoh: Promo Spesial">
        </label>
        <label class="llm-edit-field">TARGET PENGGUNA
          <select name="targetUserId">
            <option value="">Semua User (Broadcast)</option>
            ${adminState.users.map(u => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`).join('')}
          </select>
        </label>
        <label class="llm-edit-field">ISI PESAN
          <textarea name="text" required maxlength="500" placeholder="Ketik pesan notifikasi di sini..."></textarea>
        </label>
        <div style="padding-top:10px;">
          <button type="submit" class="llm-btn-save" style="width:100%;justify-content:center"><i data-lucide="send"></i> Kirim Notifikasi</button>
        </div>
      </form>
    </div>
  `;
}

function render(options = {}) {
  normalizeActiveSelections();
  const listScroll = options.preserveScroll ? content.querySelector('.chat-list')?.scrollTop : 0;
  const messageScroll = options.preserveScroll ? content.querySelector('.conversation-messages')?.scrollTop : 0;
  const titles = { overview: 'Ringkasan', products: 'Produk', orders: 'Pesanan', vouchers: 'Voucher', accounts: 'Akun Pembeli', 'llm-users': 'LLM Users', reviews: 'Ulasan', chats: 'Chat Pembeli', notifications: 'Notifikasi', settings: 'Pengaturan' };
  document.querySelector('#adminTitle').textContent = titles[activeTab] || 'Dashboard';
  content.innerHTML = activeTab === 'overview' ? statsPanel() + orderTable() : activeTab === 'products' ? productTable() : activeTab === 'orders' ? orderTable() : activeTab === 'vouchers' ? voucherPanel() : activeTab === 'accounts' ? accountTable() : activeTab === 'llm-users' ? llmUserTable() : activeTab === 'reviews' ? reviewPanel() : activeTab === 'settings' ? settingsPanel() : activeTab === 'notifications' ? notificationPanel() : chatWorkspace();
  icons();
  if (activeTab === 'chats' && activeChatId && !chatDetails[activeChatId] && !chatDetailLoadingId) void loadChatDetail(activeChatId);
  if (activeTab === 'chats') {
    const list = content.querySelector('.chat-list');
    const messages = content.querySelector('.conversation-messages');
    if (list) list.scrollTop = listScroll;
    if (messages) messages.scrollTop = options.scrollToEnd ? messages.scrollHeight : messageScroll;
  }
}

document.querySelector('#adminLogin').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.target.querySelector('button');
  button.disabled = true;
  button.textContent = 'Memeriksa...';
  try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); document.querySelector('#loginError').textContent = ''; event.target.reset(); await load(); }
  catch (error) { document.querySelector('#loginError').textContent = error.message; }
  finally { button.disabled = false; button.textContent = 'Masuk dashboard'; }
});

document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
  activeTab = button.dataset.tab;
  document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === button));
  render();
}));
document.querySelector('#adminLogout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); location.reload(); });

content.addEventListener('click', async (event) => {
  const sortButton = event.target.closest('[data-chat-sort]');
  if (sortButton) {
    chatSortMode = sortButton.dataset.chatSort === 'newest' ? 'newest' : 'unread';
    render({ preserveScroll: true });
    return;
  }

  // Variant toggle
  const variantBtn = event.target.closest('[data-variant-product]');
  if (variantBtn) {
    const row = content.querySelector(`#variant-row-${CSS.escape(variantBtn.dataset.variantProduct)}`);
    if (row) row.hidden = !row.hidden;
    return;
  }

  // Delete variant
  const deleteVariant = event.target.closest('[data-delete-variant]');
  if (deleteVariant) {
    const productId = Number(deleteVariant.dataset.productId);
    const variantId = deleteVariant.dataset.deleteVariant;
    const product = adminState.products.find((item) => item.id === productId);
    if (!product) return;
    const confirmed = await openAdminDialog({ kind: 'confirm', title: 'Hapus varian?', description: `Varian "${variantId}" akan dihapus permanen.`, confirmLabel: 'Hapus varian', destructive: true, eyebrow: 'VARIAN' }); if (!confirmed) return;
    product.variants = (product.variants || []).filter((v) => v.id !== variantId);
    const editor = content.querySelector(`#variant-editor-${productId}`);
    if (editor) editor.innerHTML = variantEditorHtml(product);
    icons();
    return;
  }

  // Save all variants
  const saveVariants = event.target.closest('[data-save-variants]');
  if (saveVariants) {
    const productId = Number(saveVariants.dataset.saveVariants);
    const product = adminState.products.find((item) => item.id === productId);
    if (!product) return;
    saveVariants.disabled = true; saveVariants.textContent = 'Menyimpan...';
    try {
      const updated = await api(`/api/admin/products/${productId}`, { method: 'PUT', body: JSON.stringify({ price: product.price, stock: product.stock, enabled: product.enabled, autoRestock: product.autoRestock, variants: product.variants || [] }) });
      Object.assign(product, updated);
      toast('Varian berhasil disimpan');
    } catch (error) { toast(error.message); }
    saveVariants.disabled = false; saveVariants.textContent = 'Simpan Semua Varian';
    return;
  }

  // Chat user from accounts panel
  const chatUserBtn = event.target.closest('[data-chat-user]');
  if (chatUserBtn) {
    const userId = chatUserBtn.dataset.chatUser;
    const userName = chatUserBtn.dataset.chatName;
    const message = await openAdminDialog({ kind: 'compose-message', title: `Kirim pesan ke ${userName}`, description: 'Pesan pertama akan membuka atau melanjutkan chat yang sama.', confirmLabel: 'Kirim pesan', placeholder: 'Tulis pesan untuk pembeli...', eyebrow: 'CHAT' });
    if (!message) return;
    chatUserBtn.disabled = true;
    try {
      const chat = await api('/api/admin/chats/initiate', { method: 'POST', body: JSON.stringify({ userId, message: message.trim() }) });
      upsertChat(chat);
      activeChatId = chat.id;
      activeTab = 'chats';
      document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item.dataset.tab === 'chats'));
      render({ scrollToEnd: true });
      void loadChatDetail(chat.id);
      toast(`Pesan terkirim ke ${userName}`);
    } catch (error) { toast(error.message); }
    chatUserBtn.disabled = false;
    return;
  }

  // Notify user from accounts panel
  const notifyUserBtn = event.target.closest('[data-notify-user]');
  if (notifyUserBtn) {
    const userId = notifyUserBtn.dataset.notifyUser;
    const userName = adminState.users.find((item) => item.id === userId)?.name || 'pengguna';
    const notification = await openAdminDialog({ kind: 'notification', title: `Kirim notifikasi ke ${userName}`, description: 'Notifikasi ini hanya dikirim ke akun tersebut.', confirmLabel: 'Kirim notifikasi', eyebrow: 'NOTIFIKASI', value: { title: '', text: '' } });
    if (!notification) return;
    const { title, text } = notification;

    try {
      await api('/api/admin/notifications', { method: 'POST', body: JSON.stringify({ title, text, targetUserId: userId }) });
      toast("Notifikasi berhasil dikirim.");
    } catch (error) { toast(error.message); }
    return;
  }

  const save = event.target.closest('[data-save-product]');
  if (save) {
    const row = save.closest('[data-product-row]');
    save.disabled = true;
    save.textContent = 'Menyimpan...';
    try {
      const updated = await api(`/api/admin/products/${save.dataset.saveProduct}`, { method: 'PUT', body: JSON.stringify({ price: Number(row.querySelector('[data-price]').value), stock: Number(row.querySelector('[data-stock]').value), enabled: row.querySelector('[data-enabled]').checked, autoRestock: row.querySelector('[data-auto-restock]').checked }) });
      const product = adminState.products.find((item) => item.id === updated.id);
      if (product) Object.assign(product, updated);
      row.querySelector('[data-stock]').value = updated.stock;
      toast(updated.autoRestock ? 'Produk dan auto-restock diperbarui' : 'Produk diperbarui');
    } catch (error) { toast(error.message); }
    finally { save.disabled = false; save.textContent = 'Simpan'; }
  }

  const chatButton = event.target.closest('[data-open-chat]');
  if (chatButton) { openChat(chatButton.dataset.openChat); }

  const accountButton = event.target.closest('[data-account-detail]');
  if (accountButton) { activeAccountId = accountButton.dataset.accountDetail; render(); }

  const block = event.target.closest('[data-block-account]');
  if (block) {
    block.disabled = true;
    try {
      const blocked = block.dataset.blocked !== 'true';
      await api(`/api/admin/users/${block.dataset.blockAccount}/block`, { method: 'PUT', body: JSON.stringify({ blocked }) });
      const user = adminState.users.find((item) => item.id === block.dataset.blockAccount);
      if (user) user.blocked = blocked;
      render();
      toast(blocked ? 'Akun diblokir dan sesi login dihentikan' : 'Blokir akun dibuka');
    } catch (error) { block.disabled = false; toast(error.message); }
  }

  const deleteReview = event.target.closest('[data-delete-review]');
  if (deleteReview) {
    const confirmed = await openAdminDialog({ kind: 'confirm', title: 'Hapus ulasan ini?', description: 'Ulasan akan dihapus permanen dari toko.', confirmLabel: 'Hapus ulasan', destructive: true, eyebrow: 'ULASAN' }); if (!confirmed) return;
    deleteReview.disabled = true;
    try { await api(`/api/admin/reviews/${encodeURIComponent(deleteReview.dataset.deleteReview)}`, { method: 'DELETE' }); adminState.reviews = adminState.reviews.filter((review) => review.id !== deleteReview.dataset.deleteReview); render(); toast('Ulasan dihapus'); }
    catch (error) { deleteReview.disabled = false; toast(error.message); }
  }

  const deleteUser = event.target.closest('[data-delete-account]');
  if (deleteUser) {
    const name = deleteUser.dataset.accountName;
    const typed = await openAdminDialog({ kind: 'confirm-text', title: `Hapus akun ${name}?`, description: 'Ketik nama akun untuk konfirmasi.', confirmLabel: 'Hapus akun', requiredValue: name, value: name, destructive: true, eyebrow: 'AKUN' });
    if (typed === null) return;
    if (typed.trim() !== name.trim()) { toast('Nama tidak cocok, akun tidak dihapus.'); return; }
    deleteUser.disabled = true;
    try {
      await api(`/api/admin/users/${deleteUser.dataset.deleteAccount}`, { method: 'DELETE' });
      adminState.users = adminState.users.filter((u) => u.id !== deleteUser.dataset.deleteAccount);
      activeAccountId = adminState.users[0]?.id || '';
      render();
      toast('Akun berhasil dihapus permanen.');
    } catch (error) { deleteUser.disabled = false; toast(error.message); }
  }

  const editCustomerBtn = event.target.closest('[data-edit-customer]');
  if (editCustomerBtn) {
    const row = content.querySelector(`#edit-row-${CSS.escape(editCustomerBtn.dataset.editCustomer)}`);
    if (row) row.hidden = !row.hidden;
    return;
  }

  const cancelEditCustomerBtn = event.target.closest('[data-cancel-edit-customer]');
  if (cancelEditCustomerBtn) {
    const row = cancelEditCustomerBtn.closest('.customer-edit-row');
    if (row) row.hidden = true;
    return;
  }

  const llmDetail = event.target.closest('[data-llm-detail]');
  if (llmDetail) { activeLlmUserId = llmDetail.dataset.llmDetail; render(); return; }

  // Toggle Add form
  if (event.target.closest('#llmAddToggle')) {
    const wrap = content.querySelector('#llmAddFormWrap');
    if (wrap) wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
    return;
  }
  if (event.target.closest('#llmAddCancel')) {
    const wrap = content.querySelector('#llmAddFormWrap');
    if (wrap) wrap.style.display = 'none';
    return;
  }

  const regenKeyBtn = event.target.closest('[data-regen-llm]');
  if (regenKeyBtn) {
    const confirmed = await openAdminDialog({ kind: 'confirm', title: 'Regenerate API Key?', description: 'API Key lama akan tidak bisa digunakan setelah diganti.', confirmLabel: 'Regenerate', destructive: true, eyebrow: 'LLM USER' }); if (!confirmed) return;
    regenKeyBtn.disabled = true;
    try {
      const updated = await api(`/api/admin/llm-users/${regenKeyBtn.dataset.regenLlm}/regenerate-key`, { method: 'POST' });
      const user = adminState.llmUsers.find(u => u.id === updated.id);
      if (user) Object.assign(user, updated);
      render();
      toast('API Key berhasil dibuat ulang');
    } catch (e) { toast(e.message); regenKeyBtn.disabled = false; return; }
    return;
  }

  // Copy API Key handler
  const copyKeyBtn = event.target.closest('[data-copy-key]');
  if (copyKeyBtn) {
    const user = adminState.llmUsers.find(u => u.id === copyKeyBtn.dataset.copyKey);
    if (user) {
      navigator.clipboard.writeText(user.api_key).then(() => toast('API Key disalin')).catch(() => toast('Copy failed'));
    }
    return;
  }

  const deleteLlmUser = event.target.closest('[data-delete-llm]');
  if (deleteLlmUser) {
    const name = deleteLlmUser.dataset.llmName;
    const typed = await openAdminDialog({ kind: 'confirm-text', title: `Hapus LLM user ${name}?`, description: 'Ketik nama akun untuk konfirmasi.', confirmLabel: 'Hapus user', requiredValue: name, value: name, destructive: true, eyebrow: 'LLM USER' }); if (typed === null || typed.trim() !== name.trim()) { toast('Dibatalkan'); return; }
    deleteLlmUser.disabled = true;
    try {
      await api(`/api/admin/llm-users/${deleteLlmUser.dataset.deleteLlm}`, { method: 'DELETE' });
      adminState.llmUsers = adminState.llmUsers.filter(u => u.id !== deleteLlmUser.dataset.deleteLlm);
      activeLlmUserId = adminState.llmUsers[0]?.id || '';
      render();
      toast('User LLM dihapus');
    } catch (e) { toast(e.message); deleteLlmUser.disabled = false; }
    return;
  }

  const deleteMsg = event.target.closest('[data-delete-message]');
  if (deleteMsg) {
    const confirmed = await openAdminDialog({ kind: 'confirm', title: 'Hapus pesan ini?', description: 'Pesan yang dihapus tidak bisa dikembalikan.', confirmLabel: 'Hapus pesan', destructive: true, eyebrow: 'CHAT' }); if (!confirmed) return;
    deleteMsg.disabled = true;
    const chatId = deleteMsg.dataset.chatId;
    const messageId = deleteMsg.dataset.deleteMessage;
    try {
      const updated = await api(`/api/admin/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' });
      upsertChat(updated);
      render({ preserveScroll: true, scrollToEnd: false });
      toast('Pesan dihapus.');
    } catch (error) { deleteMsg.disabled = false; toast(error.message); }
  }

  const editMsg = event.target.closest('[data-edit-message]');
  if (editMsg) {
    const chatId = editMsg.dataset.chatId;
    const messageId = editMsg.dataset.editMessage;
    const bubble = editMsg.closest('[data-message-id]');
    if (!bubble) return;
    const currentText = bubble.querySelector('.message-text')?.textContent || '';
    const newText = await openAdminDialog({ kind: 'edit-message', title: 'Edit pesan', description: 'Perbarui isi pesan lalu simpan.', confirmLabel: 'Simpan perubahan', value: currentText, eyebrow: 'CHAT' });
    if (newText === null || newText.trim() === currentText.trim()) return;
    if (!newText.trim()) { toast('Pesan tidak boleh kosong.'); return; }
    editMsg.disabled = true;
    try {
      const updated = await api(`/api/admin/chats/${chatId}/messages/${messageId}`, { method: 'PUT', body: JSON.stringify({ text: newText.trim() }) });
      upsertChat(updated);
      render({ preserveScroll: true, scrollToEnd: false });
      toast('Pesan diperbarui.');
    } catch (error) { editMsg.disabled = false; toast(error.message); }
  }

  const saveVoucher = event.target.closest('[data-save-voucher]');
  if (saveVoucher) {
    const row = saveVoucher.closest('[data-voucher-row]');
    const voucher = adminState.vouchers.find((item) => item.code === saveVoucher.dataset.saveVoucher);
    if (!voucher) return;
    saveVoucher.disabled = true;
    try {
      const payload = {
        code: row.querySelector('[data-voucher-code]')?.value || voucher.code,
        description: row.querySelector('[data-voucher-description]')?.value || '',
        type: row.querySelector('[data-voucher-type]')?.value || voucher.type,
        value: Number(row.querySelector('[data-voucher-value]')?.value || 0),
        minSubtotal: Number(row.querySelector('[data-voucher-min-subtotal]')?.value || 0),
        minQuantity: Number(row.querySelector('[data-voucher-min-quantity]')?.value || 0),
        requiredCategory: row.querySelector('[data-voucher-category]')?.value || '',
        maxUses: Number(row.querySelector('[data-voucher-max-uses]')?.value || 0),
        used: Number(voucher.used || 0),
        expiresAt: row.querySelector('[data-voucher-expires]')?.value || '',
        requireSameProduct: Boolean(row.querySelector('[data-voucher-same-product]')?.checked),
        enabled: row.querySelector('[data-voucher-enabled]').checked
      };
      const updated = await api(`/api/admin/vouchers/${encodeURIComponent(voucher.code)}`, { method: 'PUT', body: JSON.stringify(payload) });
      Object.assign(voucher, updated);
      adminState.vouchers = adminState.vouchers.map((item) => item.code === saveVoucher.dataset.saveVoucher ? updated : item);
      render();
      toast('Voucher diperbarui');
    } catch (error) { saveVoucher.disabled = false; toast(error.message); }
  }

  const deleteVoucher = event.target.closest('[data-delete-voucher]');
  if (deleteVoucher) {
    const confirmed = await openAdminDialog({ kind: 'confirm', title: `Hapus voucher ${deleteVoucher.dataset.deleteVoucher}?`, description: 'Voucher yang dihapus tidak bisa dipakai lagi.', confirmLabel: 'Hapus voucher', destructive: true, eyebrow: 'VOUCHER' }); if (!confirmed) return;
    deleteVoucher.disabled = true;
    try { await api(`/api/admin/vouchers/${encodeURIComponent(deleteVoucher.dataset.deleteVoucher)}`, { method: 'DELETE' }); adminState.vouchers = adminState.vouchers.filter((voucher) => voucher.code !== deleteVoucher.dataset.deleteVoucher); render(); toast('Voucher dihapus'); }
    catch (error) { deleteVoucher.disabled = false; toast(error.message); }
  }
});

content.addEventListener('change', async (event) => {
  if (!event.target.matches('[data-order-status]')) return;
  const select = event.target;
  select.disabled = true;
  try {
    const updated = await api(`/api/admin/orders/${select.dataset.orderStatus}`, { method: 'PUT', body: JSON.stringify({ status: select.value }) });
    const order = adminState.orders.find((item) => item.id === updated.id);
    if (order) Object.assign(order, updated);
    select.dataset.previousStatus = updated.status;
    toast(updated.status === 'cancelled' ? 'Pesanan dibatalkan dan stok dikembalikan' : 'Status pesanan diperbarui');
    render();
  } catch (error) { select.value = select.dataset.previousStatus; select.disabled = false; toast(error.message); }
});

content.addEventListener('input', (event) => {
  if (event.target.matches('#adminReply textarea')) {
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
    return;
  }
  if (!['adminSearch', 'accountSearch', 'reviewSearch', 'voucherSearch'].includes(event.target.id)) return;
  const query = event.target.value.toLowerCase();
  const selector = event.target.id === 'adminSearch' ? '[data-product-row]' : event.target.id === 'accountSearch' ? '[data-account-row]' : event.target.id === 'voucherSearch' ? '[data-voucher-row]' : '[data-review-row]';
  content.querySelectorAll(selector).forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(query); });
});

content.addEventListener('keydown', (event) => {
  if (!event.target.matches('#adminReply textarea')) return;
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.target.closest('form')?.requestSubmit(); }
});

content.addEventListener('submit', async (event) => {
  // Add variant form
  if (event.target.matches('.add-variant-form')) {
    event.preventDefault();
    const productId = Number(event.target.dataset.productId);
    const product = adminState.products.find((item) => item.id === productId);
    if (!product) return;
    const form = Object.fromEntries(new FormData(event.target));
    const newVariant = { id: form.id.trim(), label: form.label.trim(), price: Number(form.price) || 0, duration: form.duration.trim(), warranty: form.warranty.trim() };
    if (!newVariant.id || !newVariant.label) { toast('ID dan label varian wajib diisi.'); return; }
    if ((product.variants || []).some((v) => v.id === newVariant.id)) { toast('ID varian sudah ada.'); return; }
    product.variants = [...(product.variants || []), newVariant];
    const editor = content.querySelector(`#variant-editor-${productId}`);
    if (editor) editor.innerHTML = variantEditorHtml(product);
    icons();
    event.target.reset();
    return;
  }

  if (event.target.id === 'voucherForm') {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const form = Object.fromEntries(new FormData(event.target));
      form.enabled = event.target.elements.enabled.checked;
      form.requireSameProduct = event.target.elements.requireSameProduct.checked;
      const voucher = await api('/api/admin/vouchers', { method: 'POST', body: JSON.stringify(form) });
      adminState.vouchers = [voucher, ...(adminState.vouchers || [])];
      event.target.reset();
      render();
      toast('Voucher dibuat');
    } catch (error) { button.disabled = false; toast(error.message); }
    return;
  }

  if (event.target.id === 'maintenanceForm') {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const form = new FormData(event.target);
      const updated = await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ maintenance: form.get('maintenance') === 'on', reviewsEnabled: form.get('reviewsEnabled') === 'on', maintenanceMessage: form.get('maintenanceMessage') }) });
      adminState.settings = updated;
      render();
      toast(updated.maintenance ? 'Maintenance mode diaktifkan' : 'Pengaturan disimpan');
    } catch (error) { toast(error.message); }
    button.disabled = false; button.textContent = 'Simpan Pengaturan';
  }

  // Send global notification
  if (event.target.id === 'adminNotificationForm') {
    event.preventDefault();
    const button = event.target.querySelector('button');
    const form = Object.fromEntries(new FormData(event.target));
    button.disabled = true; button.textContent = 'Mengirim...';
    try {
      await api('/api/admin/notifications', { method: 'POST', body: JSON.stringify(form) });
      toast('Notifikasi terkirim!');
      event.target.reset();
    } catch (error) { toast(error.message); }
    button.disabled = false; button.textContent = 'Kirim Notifikasi';
    return;
  }

  if (event.target.id !== 'adminReply') return;
  event.preventDefault();
  const button = event.target.querySelector('button');
  const input = event.target.querySelector('textarea[name="message"]');
  const message = input.value.trim();
  if (!activeChatId || !message) return;
  button.disabled = true;
  try {
    const updated = await api(`/api/admin/chats/${activeChatId}/reply`, { method: 'POST', body: JSON.stringify({ message }) });
    upsertChat(updated);
    input.value = '';
    input.style.height = 'auto';
    render({ preserveScroll: true, scrollToEnd: true });
  } catch (error) { button.disabled = false; toast(error.message); }
});

content.addEventListener('submit', async (event) => {
  if (event.target.matches('.customer-edit-form')) {
    event.preventDefault();
    const form = event.target;
    const orderId = form.dataset.orderId;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Menyimpan...';
    try {
      const data = Object.fromEntries(new FormData(form));
      const updated = await api(`/api/admin/orders/${orderId}/customer`, { method: 'PUT', body: JSON.stringify(data) });
      const order = adminState.orders.find((item) => item.id === updated.id);
      if (order) Object.assign(order, updated);
      render();
      toast(`Data customer ${updated.customer?.name} diperbarui. WA: ${updated.customer?.whatsapp}`);
    } catch (error) { button.disabled = false; button.textContent = 'Simpan perubahan'; toast(error.message); }
    return;
  }

  if (event.target.id === 'addLlmUserForm') {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      const user = await api('/api/admin/llm-users', { method: 'POST', body: JSON.stringify(data) });
      if (!adminState.llmUsers) adminState.llmUsers = [];
      adminState.llmUsers.unshift(user);
      activeLlmUserId = user.id;
      render();
      toast('Akun LLM berhasil dibuat');
    } catch (e) { button.disabled = false; toast(e.message); }
    return;
  }

  if (event.target.matches('.llm-edit-form')) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      data.activated = form.querySelector('[name="activated"]').checked;
      const updated = await api(`/api/admin/llm-users/${form.dataset.llmId}`, { method: 'PUT', body: JSON.stringify(data) });
      const user = adminState.llmUsers.find(u => u.id === updated.id);
      if (user) Object.assign(user, updated);
      render();
      toast('Perubahan disimpan');
    } catch (e) { button.disabled = false; toast(e.message); }
    return;
  }
});

setInterval(async () => {
  const draft = document.querySelector('#adminReply textarea');
  if (activeTab !== 'chats' || adminApp.hidden || draft?.value) return;
  try {
    adminState = await api('/api/admin/state');
    render({ preserveScroll: true });
    if (activeChatId) void loadChatDetail(activeChatId);
  } catch {}
}, 5000);

load();
icons();



