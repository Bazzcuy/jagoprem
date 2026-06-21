const STORE_CONFIG = {
  grokProxyUrl: '', // Isi URL backend proxy Grok nanti. Jangan taruh API key produksi di frontend.
  staticQris: '00020101021126570011ID.DANA.WWW011893600915303270621302090327062130303UMI51440014ID.CO.QRIS.WWW0215ID10265345984810303UMI5204481453033605802ID5914Webtokoku plus6014Kota Palembang61053026663040D38'
};

const CHATGPT_PLUS_DESCRIPTION = 'Akun ChatGPT Plus privat, bukan sharing, dengan dukungan Codex. Aktivasi menggunakan payment credit card pada akun privat agar akses lebih aman dan tidak bercampur dengan pengguna lain. Tersedia opsi aktivasi memakai Gmail sendiri dengan tambahan Rp5.000.';
const OFFICIAL_PRIVATE_DESCRIPTION = 'Akun resmi dan bukan akun ilegal. Akses bersifat privat, bukan sharing, dengan garansi 30 hari sesuai ketentuan penggunaan DigiePro.';
const PRODUCT_OVERRIDES = {
  46473: { stock: 13, available_stock: 13, warranty: '30 hari', access: 'Akun resmi privat', description: OFFICIAL_PRIVATE_DESCRIPTION },
  23915: { stock: 3, available_stock: 3, warranty: '30 hari', access: 'Akun resmi privat', description: OFFICIAL_PRIVATE_DESCRIPTION }
};
function applyCatalogDefaults(item) { return { ...item, ...(PRODUCT_OVERRIDES[item.id] || {}) }; }

const fallbackCatalog = (window.VIOLA_PRODUCTS || []).flatMap((item) => item.id === 23843 ? [
  { ...item, title: 'CHATGPT GO 3 BULAN', price: 25000, stock: 6, available_stock: 6, has_wholesale: false, featuredRank: 1, duration: '3 bulan', warranty: 'Garansi penuh', access: 'ChatGPT Go', description: 'Akses ChatGPT Go selama 3 bulan untuk chat AI, menulis, belajar, merangkum, dan membantu pekerjaan harian. Produk mendapat garansi penuh selama masa aktif dengan mengikuti ketentuan penggunaan.' },
  { ...item, id: 90001, title: 'CHATGPT PLUS 1 BULAN - GARANSI 2 HARI', price: 30000, stock: 5, available_stock: 5, sold: 86, has_wholesale: false, featuredRank: 2, duration: '1 bulan', warranty: '2 hari', access: 'Akun privat + Codex', description: CHATGPT_PLUS_DESCRIPTION },
  { ...item, id: 90002, title: 'CHATGPT PLUS 1 BULAN - GARANSI 20 HARI', price: 56000, stock: 7, available_stock: 7, sold: 151, has_wholesale: false, featuredRank: 3, duration: '1 bulan', warranty: '20 hari', access: 'Akun privat + Codex', description: CHATGPT_PLUS_DESCRIPTION }
] : [applyCatalogDefaults({ ...item, stock: Math.min(item.available_stock || 0, 49), enabled: true, featuredRank: item.id === 46473 ? 4 : 99 })]);
let products = fallbackCatalog.map((item) => ({ enabled: true, ...item }));
let validIds = new Set(products.map((item) => item.id));
const savedCart = JSON.parse(localStorage.getItem('digiepro_cart') || '[]');
const state = {
  cart: savedCart.map((line) => typeof line === 'number' ? { id: line, quantity: 1 } : line).filter((line) => validIds.has(line.id)),
  user: null,
  stock: 'all',
  best: false,
  wholesale: false,
  chatMode: 'bot',
  orders: [],
  reviews: [],
  deviceId: localStorage.getItem('digiepro_device_id') || (crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`),
  chatId: localStorage.getItem('digiepro_chat_id') || `chat-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
};
localStorage.setItem('digiepro_chat_id', state.chatId);
localStorage.setItem('digiepro_device_id', state.deviceId);

const productGrid = document.querySelector('#productGrid');
const cartDrawer = document.querySelector('#cartDrawer');
const overlay = document.querySelector('#overlay');
const modalLayer = document.querySelector('#modalLayer');
const modalContent = document.querySelector('#modalContent');
const toast = document.querySelector('#toast');
const chatPanel = document.querySelector('#chatPanel');
const chatMessages = document.querySelector('#chatMessages');

function rupiah(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); }
function icons() { if (window.lucide) window.lucide.createIcons(); }
function notify(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 2400); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character])); }
function getProduct(id) { return products.find((item) => item.id === Number(id)); }
function supportsOwnGmail(item) { return item?.title.includes('CHATGPT PLUS'); }
function resellerMinimum(item) { return Number(item?.price || 0) > 20000 ? 3 : 5; }
function regularUnitPrice(line) { const item = getProduct(line.id); return (item?.price || 0) + (supportsOwnGmail(item) && line.ownGmail ? 5000 : 0); }
function lineUnitPrice(line) { const price = regularUnitPrice(line); return line.reseller ? Math.round(price * 0.92) : price; }
function cartTotal() { return state.cart.reduce((total, line) => total + lineUnitPrice(line) * line.quantity, 0); }
function cartQuantityFor(id) { return state.cart.filter((line) => line.id === id).reduce((total, line) => total + line.quantity, 0); }
function persistCart() { localStorage.setItem('digiepro_cart', JSON.stringify(state.cart)); updateCart(); }

function filteredProducts() {
  const keyword = document.querySelector('#searchInput').value.trim().toLowerCase();
  let list = products.filter((item) => item.title.toLowerCase().includes(keyword));
  if (state.stock === 'ready') list = list.filter((item) => item.stock > 0 && item.enabled);
  if (state.stock === 'empty') list = list.filter((item) => item.stock === 0 || !item.enabled);
  if (state.best) list = list.filter((item) => item.is_best_seller);
  if (state.wholesale) list = list.filter((item) => item.has_wholesale);
  const sort = document.querySelector('#sortSelect').value;
  if (sort === 'sold') list.sort((a, b) => b.sold - a.sold);
  if (sort === 'low') list.sort((a, b) => a.price - b.price);
  if (sort === 'high') list.sort((a, b) => b.price - a.price);
  if (sort === 'default') list.sort((a, b) => a.featuredRank - b.featuredRank || b.id - a.id);
  return list;
}

function renderProducts() {
  const list = filteredProducts();
  document.querySelector('#resultCount').textContent = `${list.length} produk`;
  productGrid.innerHTML = list.length ? list.map((item) => `<article class="product-card" data-detail="${item.id}" tabindex="0"><div class="product-image"><img src="${item.thumbnail}" alt="${item.title}" loading="lazy"><span class="status-pill ${item.stock && item.enabled ? '' : 'empty'}">Sisa ${item.enabled ? item.stock : 0}</span>${item.featuredRank < 5 ? '<span class="best-pill">REKOMENDASI</span>' : item.is_best_seller ? '<span class="best-pill">TERLARIS</span>' : ''}${item.has_wholesale ? '<span class="wholesale-pill">GROSIR</span>' : ''}</div><div class="product-info"><h3>${item.title}</h3><div class="product-stats"><span>Terjual ${item.sold}</span><span>Stok ${item.stock}</span></div><div class="product-bottom"><strong>${rupiah(item.price)}</strong><button class="add-cart" type="button" data-add="${item.id}" ${item.stock && item.enabled ? '' : 'disabled'} aria-label="Tambah ${item.title}"><i data-lucide="shopping-cart"></i></button></div></div></article>`).join('') : '<div class="no-results">Produk tidak ditemukan. Coba ubah pencarian atau filter.</div>';
  renderActiveFilters(); icons();
}

function renderActiveFilters() {
  const labels = [];
  if (state.stock === 'ready') labels.push('Ready stock');
  if (state.stock === 'empty') labels.push('Stok habis');
  if (state.best) labels.push('Terlaris');
  if (state.wholesale) labels.push('Grosir');
  document.querySelector('#activeFilters').innerHTML = labels.map((label) => `<span class="filter-chip">${label}</span>`).join('');
}

function updateCart() {
  const usedStock = new Map();
  state.cart = state.cart.filter((line) => validIds.has(line.id) && line.quantity > 0).map((line) => {
    const item = getProduct(line.id); const used = usedStock.get(line.id) || 0; const minimum = line.reseller ? resellerMinimum(item) : 1; const quantity = Math.min(Math.max(line.quantity, minimum), Math.max(0, item.stock - used));
    usedStock.set(line.id, used + quantity); return { ...line, quantity };
  }).filter((line) => line.quantity > 0);
  document.querySelector('#cartCount').textContent = state.cart.reduce((total, line) => total + line.quantity, 0);
  const items = state.cart.map((line, index) => ({ ...getProduct(line.id), ...line, index }));
  document.querySelector('#cartItems').innerHTML = items.length ? items.map((item) => `<div class="cart-item"><img src="${item.thumbnail}" alt=""><div><h3>${item.title}</h3>${item.ownGmail ? '<small class="cart-variant">Pakai Gmail sendiri (+Rp5.000)</small>' : ''}${item.reseller ? `<small class="cart-variant reseller">Harga reseller -8% · min. ${resellerMinimum(item)}</small>` : ''}<p>${item.reseller ? `<s>${rupiah(regularUnitPrice(item) * item.quantity)}</s> ` : ''}${rupiah(lineUnitPrice(item) * item.quantity)}</p><div class="cart-quantity"><button type="button" data-cart-minus="${item.index}" ${(item.reseller && item.quantity <= resellerMinimum(item)) ? 'disabled' : ''}>−</button><span>${item.quantity}</span><button type="button" data-cart-plus="${item.index}" ${cartQuantityFor(item.id) >= item.stock ? 'disabled' : ''}>+</button></div></div><button class="remove-item" type="button" data-remove="${item.index}" aria-label="Hapus ${item.title}"><i data-lucide="trash-2"></i></button></div>`).join('') : '<div class="cart-empty"><i data-lucide="shopping-bag"></i><p>Keranjang masih kosong.</p></div>';
  document.querySelector('#cartTotal').textContent = rupiah(cartTotal());
  document.querySelector('#checkoutButton').disabled = !items.length;
  localStorage.setItem('digiepro_cart', JSON.stringify(state.cart)); icons();
}

function openCart() { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); overlay.classList.add('show'); }
function closeCart() { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); overlay.classList.remove('show'); }
function openModal(html) { closeChat(); modalContent.innerHTML = html; modalLayer.classList.add('open'); modalLayer.setAttribute('aria-hidden', 'false'); icons(); }
function closeModal() { modalLayer.classList.remove('open'); modalLayer.setAttribute('aria-hidden', 'true'); }
function modalHead(title) { return `<div class="modal-head"><h2>${title}</h2><button class="icon-button" type="button" data-close-modal aria-label="Tutup"><i data-lucide="x"></i></button></div>`; }

const PRODUCT_COPY = [
  ['CHATGPT', 'Akses fitur premium ChatGPT untuk membantu menulis, merangkum, mencari ide, belajar, dan menyelesaikan pekerjaan lebih cepat.'],
  ['CLAUDE', 'Akses Claude Pro untuk percakapan AI, analisis dokumen, penulisan, coding, dan pekerjaan dengan konteks panjang.'],
  ['GROK', 'Akses Grok untuk mencari ide, menjawab pertanyaan, membuat konten, dan membantu pekerjaan berbasis AI.'],
  ['GEMINI', 'Akses Gemini Pro untuk riset, penulisan, analisis, produktivitas, dan integrasi layanan Google yang didukung.'],
  ['PERPLEXITY', 'Akses Perplexity Pro untuk pencarian dan riset berbantuan AI dengan jawaban yang menyertakan sumber.'],
  ['KIRO', 'Akses Kiro Power+ untuk mendukung coding, penyusunan spesifikasi, dan workflow pengembangan berbantuan AI.'],
  ['LEONARDO', 'Akses Leonardo AI untuk membuat dan mengolah gambar dengan fitur premium sesuai paket yang tersedia.'],
  ['KLING', 'Akses Kling AI untuk pembuatan video dan konten visual berbasis AI sesuai kuota pada akun.'],
  ['CANVA', 'Akses Canva Pro untuk template premium, elemen desain, background remover, dan fitur kolaborasi.'],
  ['CAPCUT', 'Akses CapCut Pro untuk efek, filter, template, alat editing, dan aset premium yang tersedia.'],
  ['ALIGHT', 'Akses Alight Motion Pro untuk editing video, motion graphics, efek visual, dan ekspor premium.'],
  ['PICSART', 'Akses Picsart Pro untuk editing foto, template, efek, font, dan aset premium.'],
  ['LIGHTROOM', 'Akses Lightroom Pro untuk preset, masking, color grading, dan fitur penyuntingan foto premium.'],
  ['CAMSCNNER', 'Akses CamScanner Premium untuk scan dokumen, OCR, ekspor, dan pengelolaan dokumen.'],
  ['SPOTIFY', 'Akses Spotify Premium untuk mendengarkan musik tanpa iklan dan fitur premium yang tersedia.'],
  ['YOUTUBE', 'Akses YouTube Premium untuk menonton tanpa iklan, pemutaran latar belakang, dan fitur premium.'],
  ['APPLE MUSIC', 'Akses Apple Music Premium untuk menikmati katalog musik dan fitur dengar premium.'],
  ['IQIYI', 'Akses iQIYI VIP untuk menonton konten premium sesuai wilayah dan paket akun.'],
  ['HBO', 'Akses HBO Max untuk menikmati film dan serial premium yang tersedia pada akun.'],
  ['PRIME VIDEO', 'Akses Prime Video Premium untuk menonton film dan serial pada katalog yang tersedia.'],
  ['WETV', 'Akses WeTV VIP untuk menikmati drama, serial, dan tayangan premium.'],
  ['VIU', 'Akses VIU Premium untuk menikmati drama dan tayangan premium tanpa batasan akun gratis.'],
  ['VIDIO', 'Akses Vidio Platinum untuk menikmati konten premium sesuai paket dan wilayah akun.'],
  ['BSTATION', 'Akses Bstation Premium untuk menikmati anime dan konten premium yang tersedia.'],
  ['LOKLOK', 'Akses Loklok VIP untuk menikmati film dan serial premium pada katalog yang tersedia.'],
  ['DRAMABOX', 'Akses DramaBox VIP untuk menikmati serial pendek dan konten premium.'],
  ['REELSHORT', 'Akses ReelShort VIP untuk menikmati serial pendek dan konten premium yang tersedia.'],
  ['WINK', 'Akses Wink VIP untuk retouch, enhancement, dan penyuntingan video premium.'],
  ['ZOOM', 'Akses Zoom Pro untuk rapat online dengan fitur premium sesuai paket akun.'],
  ['DUOLINGO', 'Akses Duolingo Super untuk belajar bahasa tanpa iklan dan memakai fitur latihan premium.'],
  ['SCRIBD', 'Akses Scribd Premium untuk membaca dokumen, buku, dan konten digital yang tersedia.'],
  ['VPN', 'Akses layanan VPN Premium untuk koneksi privat ke server yang tersedia pada paket.'],
  ['AKUN KOPI', 'Produk akun digital bertema kopi. Detail akses dan cara penggunaan dikirimkan admin setelah pembayaran.']
];
function productProfile(item) {
  const match = PRODUCT_COPY.find(([keyword]) => item.title.includes(keyword));
  const ai = /AI |CHATGPT|CLAUDE|GROK|GEMINI|PERPLEXITY|KIRO|LEONARDO|KLING/.test(item.title);
  const streaming = /IQIYI|HBO|SPOTIFY|YOUTUBE|APPLE MUSIC|PRIME VIDEO|WETV|VIU|VIDIO|BSTATION|LOKLOK|DRAMABOX|REELSHORT/.test(item.title);
  const description = item.description || match?.[1] || `Akses premium ${item.title} dengan detail penggunaan yang dikirimkan langsung oleh admin DigiePro.`;
  return {
    description,
    benefits: [match?.[1] || description, `Jenis akses ${item.access || 'mengikuti varian produk'} dengan masa aktif ${item.duration || 'sesuai paket'}.`, `Detail login, aktivasi, dan petunjuk penggunaan dikirim admin ke WhatsApp setelah pesanan diproses.`, `Garansi ${item.warranty || 'mengikuti ketentuan produk'} untuk kendala akses yang memenuhi syarat.`],
    category: ai ? 'AI & produktivitas' : streaming ? 'Hiburan premium' : 'Aplikasi premium',
    delivery: 'Dikirim melalui WhatsApp',
    access: item.access || 'Sesuai varian yang tersedia',
    duration: item.duration || 'Sesuai varian',
    warranty: item.warranty || 'Sesuai ketentuan produk',
    terms: ['Pastikan nomor WhatsApp aktif dan dapat menerima pesan.', `Masa aktif: ${item.duration || 'mengikuti varian yang dikirimkan admin'}. Garansi: ${item.warranty || 'mengikuti ketentuan produk'}.`, 'Ikuti petunjuk login dan penggunaan yang dikirimkan admin.', 'Jangan mengubah email, password, PIN, profil, atau keamanan akun tanpa izin admin.', 'Garansi berlaku untuk kendala akses produk, bukan gangguan perangkat, jaringan, atau pelanggaran petunjuk penggunaan.', 'Simpan bukti pembayaran dan rekam kendala saat pertama kali login untuk proses bantuan.']
  };
}

function detailModal(id) {
  const item = getProduct(id); if (!item) return;
  const profile = productProfile(item);
  const resellerMin = resellerMinimum(item); const resellerAvailable = item.stock >= resellerMin && item.enabled;
  openModal(`${modalHead('Detail produk')}<div class="modal-body product-detail-body"><div class="detail-layout"><div class="detail-media"><img class="detail-image" src="${item.thumbnail}" alt="${item.title}"><div class="detail-facts"><div><i data-lucide="clock-3"></i><span>Masa aktif<b>${profile.duration}</b></span></div><div><i data-lucide="shield-check"></i><span>Garansi<b>${profile.warranty}</b></span></div><div><i data-lucide="key-round"></i><span>Akses produk<b>${profile.access}</b></span></div></div></div><div class="detail-content"><h2>${item.title}</h2><div class="detail-price-row"><strong class="detail-price" id="detailPrice">${rupiah(item.price)}</strong><s id="detailRegularPrice" hidden></s></div><div class="detail-tags">${item.featuredRank < 5 ? '<span>Rekomendasi</span>' : item.is_best_seller ? '<span>Terlaris</span>' : ''}<span>${item.stock && item.enabled ? 'Ready stock' : 'Stok habis'}</span></div><div class="detail-info"><div><span>Kategori</span><b>${profile.category}</b></div><div><span>Pengiriman</span><b>${profile.delivery}</b></div><div><span>Stok tersedia</span><b>${item.enabled ? item.stock : 0}</b></div><div><span>Terjual</span><b>${item.sold}</b></div></div><div class="detail-tabs"><button class="active" type="button" data-detail-tab="description">Deskripsi</button><button type="button" data-detail-tab="terms">S & K</button></div><div class="detail-tab-panel" data-detail-panel="description"><p>${profile.description}</p><ul class="product-benefits">${profile.benefits.map((benefit) => `<li><i data-lucide="check-circle-2"></i><span>${benefit}</span></li>`).join('')}</ul></div><div class="detail-tab-panel" data-detail-panel="terms" hidden><ol>${profile.terms.map((term) => `<li>${term}</li>`).join('')}</ol></div>${supportsOwnGmail(item) ? '<label class="detail-variant"><input id="detailOwnGmail" type="checkbox"><span><b>Pakai Gmail sendiri</b><small>Tambahan Rp5.000 per akun</small></span></label>' : ''}<label class="detail-variant reseller-option ${resellerAvailable ? '' : 'disabled'}"><input id="detailReseller" type="checkbox" ${resellerAvailable ? '' : 'disabled'}><span><b>Harga reseller · diskon 8%</b><small>${resellerAvailable ? `Minimal ${resellerMin} item. Harga menjadi ${rupiah(Math.round(item.price * 0.92))} per item.` : `Stok belum cukup untuk minimum ${resellerMin} item.`}</small></span></label><div class="detail-quantity"><span>Jumlah pembelian<small id="quantityHint">Maksimal ${item.stock} sesuai stok</small></span><div class="quantity-stepper"><button type="button" data-detail-minus disabled aria-label="Kurangi jumlah"><i data-lucide="minus"></i></button><input id="detailQuantity" type="number" inputmode="numeric" min="1" max="${item.stock}" value="1" aria-label="Jumlah pembelian" ${item.stock && item.enabled ? '' : 'disabled'}><button type="button" data-detail-plus ${item.stock > 1 && item.enabled ? '' : 'disabled'} aria-label="Tambah jumlah"><i data-lucide="plus"></i></button></div></div><div class="detail-actions"><button class="detail-buy secondary" type="button" data-add-detail="${item.id}" ${item.stock && item.enabled ? '' : 'disabled'}>Masukkan keranjang</button><button class="detail-buy" type="button" data-buy-now="${item.id}" ${item.stock && item.enabled ? '' : 'disabled'}>Beli sekarang</button></div></div></div></div>`);
}

function authModal(mode = 'login') {
  const register = mode === 'register';
  openModal(`${modalHead('Akun DigiePro')}<div class="modal-body"><div class="auth-tabs"><button class="${register ? '' : 'active'}" data-auth-tab="login" type="button">Masuk</button><button class="${register ? 'active' : ''}" data-auth-tab="register" type="button">Daftar</button></div><form id="authForm" data-mode="${mode}">${register ? '<div class="form-group"><label>NAMA</label><input name="name" required minlength="2" maxlength="80" autocomplete="name" placeholder="Nama kamu"></div>' : ''}<div class="form-group"><label>EMAIL</label><input name="email" type="email" required autocomplete="email" placeholder="nama@email.com"></div><div class="form-group"><label>PASSWORD</label><input name="password" type="password" minlength="8" required autocomplete="current-password" placeholder="Minimal 8 karakter"></div><p class="field-help">Akun tersimpan aman dan dapat dipakai kembali di perangkat lain.</p><button class="submit-button" type="submit">${register ? 'Buat akun' : 'Masuk sekarang'}</button></form></div>`);
}

function accountModal() {
  if (!state.user) return authModal();
  openModal(`${modalHead('Akun saya')}<div class="modal-body"><div class="account-card"><strong>${escapeHtml(state.user.name)}</strong><span>${escapeHtml(state.user.email)}</span></div><button class="logout-button" id="logoutButton" type="button">Keluar dari akun</button></div>`);
}

function checkoutModal() {
  closeCart();
  if (!state.user) { authModal('login'); notify('Masuk dulu sebelum membuat pesanan.'); return; }
  openModal(`${modalHead('Checkout')}<div class="modal-body"><div class="order-summary">${state.cart.map((line) => { const item = getProduct(line.id); return `<div><span>${item.title}${line.ownGmail ? '<small>Pakai Gmail sendiri</small>' : ''} × ${line.quantity}</span><b>${rupiah(lineUnitPrice(line) * line.quantity)}</b></div>`; }).join('')}<div><span>Biaya admin</span><b>${rupiah(99)}</b></div><div class="total"><span>Total pembayaran</span><b>${rupiah(cartTotal() + 99)}</b></div></div><form id="checkoutForm"><div class="form-group"><label>NAMA PENERIMA</label><input name="name" required value="${escapeHtml(state.user?.name || '')}" placeholder="Nama kamu"></div><div class="form-group"><label>NOMOR WHATSAPP</label><input name="whatsapp" inputmode="tel" required pattern="[0-9+ ]{9,16}" placeholder="Contoh: 081234567890"><p class="field-help">Nomor ini dipakai admin untuk menghubungi dan mengirim detail produk.</p></div><div class="form-group"><label>CATATAN (OPSIONAL)</label><textarea name="note" placeholder="Permintaan atau informasi tambahan"></textarea></div><button class="submit-button" type="submit">Lanjut ke pembayaran</button></form></div>`);
}

function paymentModal(customer, order) {
  if (['expired', 'cancelled'].includes(order.status)) { notify('Pesanan sudah tidak aktif dan stok telah dikembalikan.'); historyModal(); return; }
  const total = order.total; const orderId = order.id;
  const payload = QrisTools.dynamic(STORE_CONFIG.staticQris, total);
  state.orders = [order, ...state.orders.filter((item) => item.id !== order.id)];
  openModal(`${modalHead('Pembayaran QRIS')}<div class="modal-body payment"><span class="payment-status">${order.status === 'pending' ? 'MENUNGGU PEMBAYARAN' : order.status.toUpperCase()}</span><h2>Selesaikan pembayaran</h2><p>ID Pesanan: ${orderId}</p>${order.status === 'pending' && order.expiresAt ? `<div class="payment-expiry"><i data-lucide="timer"></i> Stok ditahan sampai ${new Date(order.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>` : ''}<div class="payment-card"><div class="qr-box" id="dynamicQr"></div><div class="payment-breakdown"><div><span>Subtotal</span><b>${rupiah(order.subtotal)}</b></div><div><span>Biaya admin</span><b>${rupiah(order.adminFee)}</b></div><div class="grand-total"><span>Total pembayaran</span><b>${rupiah(total)}</b></div></div><div class="payment-assurance"><i data-lucide="message-circle-check"></i><span>Setelah pembayaran selesai, Anda akan dihubungi langsung oleh admin melalui WhatsApp.</span></div></div><button class="confirm-button" id="confirmPayment" data-order-id="${order.id}" type="button">Pembayaran sudah selesai</button></div>`);
  new QRCode(document.querySelector('#dynamicQr'), { text: payload, width: 238, height: 238, correctLevel: QRCode.CorrectLevel.M });
  icons();
}

function orderMessage(order) {
  const lines = order.items.map((line) => `- ${line.title || getProduct(line.id)?.title || line.id} x${line.quantity}${line.reseller ? ' (Reseller -8%)' : ''}${line.ownGmail ? ' (Gmail sendiri)' : ''} = ${rupiah(line.lineTotal || lineUnitPrice(line) * line.quantity)}`);
  return `Konfirmasi pembayaran DigiePro\nID: ${order.id}\nWaktu pesan: ${new Date(order.createdAt).toLocaleString('id-ID')}\n\nDetail pesanan:\n${lines.join('\n')}\n\nSubtotal: ${rupiah(order.subtotal)}\nBiaya admin: ${rupiah(order.adminFee)}\nTotal: ${rupiah(order.total)}\n\nSaya sudah menyelesaikan pembayaran QRIS untuk pesanan ini.`;
}

async function historyModal() {
  if (!state.user) { authModal('login'); notify('Masuk untuk melihat riwayat pesanan.'); return; }
  openModal(`${modalHead('Riwayat pesanan')}<div class="modal-body"><div class="history-loading">Memuat pesanan...</div></div>`);
  try {
    const response = await fetch('/api/orders/me', { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Riwayat gagal dimuat.'); state.orders = result.orders || []; state.reviews = result.reviews || [];
    modalContent.innerHTML = `${modalHead('Riwayat pesanan')}<div class="modal-body order-history">${state.orders.length ? state.orders.map((order) => `<article class="history-order"><div class="history-order-head"><span><b>${order.id}</b><small>${new Date(order.createdAt).toLocaleString('id-ID')}</small></span><em class="order-status ${order.status}">${order.status}</em></div>${order.status === 'pending' && order.expiresAt ? `<p class="reservation-note">Reservasi stok berakhir ${new Date(order.expiresAt).toLocaleString('id-ID')}</p>` : ''}<div class="history-lines">${order.items.map((line) => `<div><span>${escapeHtml(line.title || getProduct(line.id)?.title || line.id)} × ${line.quantity}${line.reseller ? '<small>Reseller -8%</small>' : ''}</span><b>${rupiah(line.lineTotal || lineUnitPrice(line) * line.quantity)}</b></div>`).join('')}</div><div class="history-total"><span>Total termasuk admin</span><b>${rupiah(order.total)}</b></div><div class="history-actions">${['pending', 'paid'].includes(order.status) ? `<button type="button" data-reopen-payment="${order.id}"><i data-lucide="qr-code"></i> Lihat QR & total</button>` : ''}<button type="button" data-chat-order="${order.id}"><i data-lucide="message-circle"></i> Chat admin</button></div>${order.status === 'completed' ? `<div class="review-order-actions">${order.items.map((line) => state.reviews.some((review) => review.orderId === order.id && review.productId === line.id) ? `<span><i data-lucide="badge-check"></i> ${escapeHtml(line.title || getProduct(line.id)?.title)} sudah diulas</span>` : `<button type="button" data-review-order="${order.id}" data-review-product="${line.id}"><i data-lucide="star"></i> Ulas ${escapeHtml(line.title || getProduct(line.id)?.title)}</button>`).join('')}</div>` : ''}</article>`).join('') : '<div class="cart-empty"><i data-lucide="receipt-text"></i><p>Belum ada pesanan dari akun ini.</p></div>'}</div>`; icons();
  } catch (error) { notify(error.message); closeModal(); }
}

function reviewStars(rating) { return `<span class="review-stars" aria-label="${rating} dari 5 bintang">${Array.from({ length: 5 }, (_, index) => `<i data-lucide="star" class="${index < rating ? 'filled' : ''}"></i>`).join('')}</span>`; }
async function reviewsModal() {
  openModal(`${modalHead('Ulasan pembeli')}<div class="modal-body"><div class="history-loading">Memuat ulasan...</div></div>`);
  try { const response = await fetch('/api/reviews', { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Ulasan gagal dimuat.'); const reviews = result.reviews || []; const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0; modalContent.innerHTML = `${modalHead('Ulasan pembeli')}<div class="modal-body reviews-page"><div class="review-summary"><strong>${average.toFixed(1)}</strong>${reviewStars(Math.round(average))}<span>${reviews.length} ulasan produk</span></div><div class="review-notice"><i data-lucide="info"></i><span>Ulasan bertanda Terverifikasi berasal dari pesanan selesai. Ulasan awal bertanda Contoh ditampilkan sebagai data demo.</span></div><div class="review-list">${reviews.map((review) => { const product = getProduct(review.productId); return `<article class="review-card"><div class="review-card-head"><div class="review-avatar">${escapeHtml(review.customerName || 'P').charAt(0)}</div><span><b>${escapeHtml(review.customerName || 'Pembeli')}</b><small>${new Date(review.createdAt).toLocaleDateString('id-ID')} · ${escapeHtml(product?.title || 'Produk DigiePro')}</small></span>${review.verified ? '<em class="verified-review">Terverifikasi</em>' : '<em class="sample-review">Contoh</em>'}</div>${reviewStars(review.rating)}<p>${escapeHtml(review.comment)}</p></article>`; }).join('')}</div></div>`; icons(); } catch (error) { notify(error.message); closeModal(); }
}

function reviewForm(orderId, productId) { const product = getProduct(productId); openModal(`${modalHead('Tulis ulasan')}<div class="modal-body"><div class="review-product"><img src="${product.thumbnail}" alt=""><span><small>PRODUK YANG DIULAS</small><b>${escapeHtml(product.title)}</b></span></div><form id="reviewForm" data-order-id="${orderId}" data-product-id="${productId}"><fieldset class="rating-field"><legend>BERI BINTANG</legend>${[5,4,3,2,1].map((rating) => `<label><input type="radio" name="rating" value="${rating}" required><span>${rating}<i data-lucide="star"></i></span></label>`).join('')}</fieldset><div class="form-group"><label>KOMENTAR</label><textarea name="comment" minlength="8" maxlength="600" required placeholder="Ceritakan pengalamanmu menggunakan produk ini..."></textarea></div><button class="submit-button" type="submit">Kirim ulasan</button></form></div>`); }

function chatWelcome() { return '<div class="message bot">Hai! Saya bisa bantu cek stok, harga, varian, garansi, pembayaran, dan cara pemesanan.</div><div class="quick-chat"><button data-question="Produk apa yang ready?" type="button">Cek stok</button><button data-question="Tampilkan paket ChatGPT" type="button">Paket ChatGPT</button><button data-question="Bagaimana cara pesan?" type="button">Cara pesan</button><button data-question="Bagaimana pembayaran QRIS?" type="button">Pembayaran</button><button data-question="Bagaimana garansi produk?" type="button">Garansi</button><button data-question="Apa itu Gmail sendiri?" type="button">Gmail sendiri</button><button data-question="Bagaimana produk dikirim?" type="button">Pengiriman</button><button data-admin type="button">Chat admin</button></div>'; }
function openChat() { chatPanel.classList.add('open'); chatPanel.setAttribute('aria-hidden', 'false'); if (window.innerWidth > 760) document.querySelector('#chatInput').focus(); }
function closeChat() { chatPanel.classList.remove('open'); chatPanel.setAttribute('aria-hidden', 'true'); }
function addMessage(text, role) { const node = document.createElement('div'); node.className = `message ${role}`; node.textContent = text; chatMessages.appendChild(node); chatMessages.scrollTop = chatMessages.scrollHeight; }
function contactAdmin() { switchChatMode('admin'); }
function customerIdentity() { const last = JSON.parse(localStorage.getItem('digiepro_last_order') || 'null'); return last?.customer || state.user || {}; }
async function loadAdminChat() { try { const response = await fetch(`/api/chat/${state.chatId}`, { cache: 'no-store' }); const chat = await response.json(); if (state.chatMode !== 'admin') return; chatMessages.innerHTML = chat.messages?.length ? chat.messages.map((item) => `<div class="message ${item.sender === 'admin' ? 'bot' : 'user'}">${escapeHtml(item.text)}</div>`).join('') : '<div class="message bot">Kamu sudah masuk ke chat admin. Tulis pesan dan admin akan membalas dari dashboard.</div>'; chatMessages.scrollTop = chatMessages.scrollHeight; } catch {} }
function switchChatMode(mode) { state.chatMode = mode; document.querySelectorAll('[data-chat-mode]').forEach((button) => button.classList.toggle('active', button.dataset.chatMode === mode)); document.querySelector('#chatTitle').textContent = mode === 'admin' ? 'Admin DigiePro' : 'Asisten DigiePro'; if (mode === 'admin') loadAdminChat(); else chatMessages.innerHTML = chatWelcome(); }
async function sendAdminMessage(message) { const response = await fetch(`/api/chat/${state.chatId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, customer: customerIdentity() }) }); if (!response.ok) throw new Error('Pesan gagal dikirim.'); await loadAdminChat(); }
function localBotAnswer(question) {
  const text = question.toLowerCase();
  if (text.includes('stok') || text.includes('ready')) { const ready = products.filter((item) => item.stock > 0 && item.enabled).sort((a, b) => a.featuredRank - b.featuredRank || b.sold - a.sold).slice(0, 6); return `Produk ready yang direkomendasikan:\n${ready.map((item) => `• ${item.title} — ${rupiah(item.price)} (sisa ${item.stock})`).join('\n')}`; }
  if (text.includes('chatgpt')) { const matches = products.filter((item) => item.title.includes('CHATGPT')); return `Pilihan ChatGPT saat ini:\n${matches.map((item) => `• ${item.title} — ${rupiah(item.price)} (sisa ${item.stock})`).join('\n')}\n\nChatGPT Plus berupa akun privat, bukan sharing, dan mendukung Codex.`; }
  if (text.includes('gmail')) return 'Opsi “Pakai Gmail sendiri” tersedia untuk ChatGPT Plus dengan tambahan Rp5.000 per akun. Aktifkan opsi tersebut di halaman detail produk sebelum memasukkannya ke keranjang.';
  if (text.includes('garansi')) return 'Masa garansi berbeda pada setiap produk. Buka detail produk untuk melihat durasi dan syaratnya. Simpan bukti pembayaran serta rekam kendala saat pertama kali login.';
  if (text.includes('kirim') || text.includes('pengiriman')) return 'Setelah pembayaran selesai, admin akan menghubungi nomor WhatsApp yang kamu isi saat checkout dan mengirimkan detail akses produk.';
  if (text.includes('bayar') || text.includes('qris')) return 'Pembayaran menggunakan QRIS. Setelah checkout, sistem membuat QR sesuai nominal total belanja termasuk biaya admin Rp99. Scan QR tersebut lalu tekan “Pembayaran sudah selesai”.';
  if (text.includes('pesan') || text.includes('telegram') || text.includes('whatsapp')) return 'Cara pesan: cari produk, buka detail, pilih varian dan jumlah, masukkan ke keranjang, isi data checkout, lalu bayar melalui QRIS. Stok web, Telegram, dan WhatsApp memakai sumber data yang sama.';
  if (text.includes('privat') || text.includes('sharing') || text.includes('codex')) return 'Paket ChatGPT Plus DigiePro berupa akun privat, bukan akun sharing, mendukung Codex, dan diaktivasi menggunakan payment credit card.';
  if (text.includes('admin') || text.includes('manusia')) return 'Pilih mode "Chat Admin". Pesanmu akan masuk ke dashboard admin DigiePro.';
  const ignored = new Set(['berapa', 'harga', 'produk', 'paket', 'akun', 'yang', 'untuk', 'ada', 'apa']);
  const terms = text.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((term) => term.length > 2 && !ignored.has(term));
  const match = products.map((item) => ({ item, score: terms.filter((term) => item.title.toLowerCase().includes(term)).length })).sort((a, b) => b.score - a.score)[0];
  if (match?.score) return `${match.item.title}: ${rupiah(match.item.price)}, stok ${match.item.stock}, terjual ${match.item.sold}. ${match.item.stock && match.item.enabled ? 'Saat ini tersedia.' : 'Saat ini stok habis.'}`;
  return 'Saya belum memahami pertanyaan itu. Coba tulis nama produk, “cek stok”, “cara pesan”, “garansi”, “Gmail sendiri”, “pengiriman”, atau pilih Chat Admin.';
}
async function askBot(question) {
  if (!STORE_CONFIG.grokProxyUrl) return localBotAnswer(question);
  try {
    const response = await fetch(STORE_CONFIG.grokProxyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, products }) });
    if (!response.ok) throw new Error('Chat service error');
    const data = await response.json(); return data.answer || data.message || localBotAnswer(question);
  } catch { return `${localBotAnswer(question)}\n\nChat AI sedang tidak tersedia, tapi kamu tetap bisa menghubungi admin.`; }
}

document.querySelector('#searchInput').addEventListener('input', renderProducts);
document.querySelector('#sortSelect').addEventListener('change', renderProducts);
document.querySelector('#filterToggle').addEventListener('click', () => document.querySelector('#filterStrip').classList.toggle('open'));
document.querySelectorAll('[data-quick]').forEach((button) => button.addEventListener('click', () => {
  const value = button.dataset.quick;
  state.stock = value === 'ready' ? 'ready' : 'all'; state.best = value === 'best'; state.wholesale = value === 'wholesale';
  document.querySelector(`input[name="stock"][value="${state.stock}"]`).checked = true; document.querySelector('#bestFilter').checked = state.best; document.querySelector('#wholesaleFilter').checked = state.wholesale; renderProducts(); document.querySelector('#products').scrollIntoView();
}));
document.querySelectorAll('[data-search]').forEach((button) => button.addEventListener('click', () => { document.querySelector('#searchInput').value = button.dataset.search; renderProducts(); document.querySelector('#products').scrollIntoView(); }));
document.querySelector('#categoryHelp').addEventListener('click', openChat);
document.querySelectorAll('input[name="stock"]').forEach((input) => input.addEventListener('change', () => { state.stock = input.value; renderProducts(); }));
document.querySelector('#bestFilter').addEventListener('change', (event) => { state.best = event.target.checked; renderProducts(); });
document.querySelector('#wholesaleFilter').addEventListener('change', (event) => { state.wholesale = event.target.checked; renderProducts(); });
const carousel = document.querySelector('.promo-carousel');
if (carousel) {
  const track = carousel.querySelector('.promo-track'); const slides = [...carousel.querySelectorAll('.promo-banner')]; const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
  let carouselIndex = 0; let carouselTimer; let pointerStart = 0;
  const showSlide = (index) => { carouselIndex = (index + slides.length) % slides.length; track.style.transform = `translateX(-${carouselIndex * 100}%)`; dots.forEach((dot, dotIndex) => { dot.classList.toggle('active', dotIndex === carouselIndex); dot.setAttribute('aria-current', dotIndex === carouselIndex ? 'true' : 'false'); }); };
  const startCarousel = () => { clearInterval(carouselTimer); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) carouselTimer = setInterval(() => showSlide(carouselIndex + 1), 5200); };
  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => { showSlide(carouselIndex - 1); startCarousel(); });
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => { showSlide(carouselIndex + 1); startCarousel(); });
  dots.forEach((dot) => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.carouselDot)); startCarousel(); }));
  carousel.addEventListener('pointerdown', (event) => { pointerStart = event.clientX; clearInterval(carouselTimer); });
  carousel.addEventListener('pointerup', (event) => { const distance = event.clientX - pointerStart; if (Math.abs(distance) > 45) showSlide(carouselIndex + (distance < 0 ? 1 : -1)); startCarousel(); });
  carousel.addEventListener('mouseenter', () => clearInterval(carouselTimer)); carousel.addEventListener('mouseleave', startCarousel);
  carousel.querySelectorAll('[data-search-product]').forEach((button) => button.addEventListener('click', () => { document.querySelector('#searchInput').value = button.dataset.searchProduct; renderProducts(); document.querySelector('#products').scrollIntoView(); }));
  carousel.querySelector('[data-bot-order]').addEventListener('click', () => { openChat(); switchChatMode('bot'); chatMessages.innerHTML = '<div class="message bot">DigiePro Bot siap membantu kamu mencari produk dan memulai pesanan dari Telegram, WhatsApp, atau web.</div><div class="quick-chat"><button data-question="Pesan lewat Telegram" type="button">Telegram</button><button data-question="Pesan lewat WhatsApp" type="button">WhatsApp</button><button data-question="Cari paket ChatGPT" type="button">Cari ChatGPT</button><button data-admin type="button">Chat admin</button></div>'; });
  showSlide(0); startCarousel();
}
document.querySelector('#resetFilter').addEventListener('click', () => { state.stock = 'all'; state.best = false; state.wholesale = false; document.querySelector('input[name="stock"][value="all"]').checked = true; document.querySelector('#bestFilter').checked = false; document.querySelector('#wholesaleFilter').checked = false; document.querySelector('#searchInput').value = ''; renderProducts(); });
productGrid.addEventListener('click', (event) => { const add = event.target.closest('[data-add]'); if (add) { event.stopPropagation(); addToCart(Number(add.dataset.add), 1); return; } const card = event.target.closest('[data-detail]'); if (card) detailModal(card.dataset.detail); });
productGrid.addEventListener('keydown', (event) => { const card = event.target.closest('[data-detail]'); if (card && (event.key === 'Enter' || event.key === ' ')) detailModal(card.dataset.detail); });
document.querySelector('#cartItems').addEventListener('click', (event) => { const remove = event.target.closest('[data-remove]'); const plus = event.target.closest('[data-cart-plus]'); const minus = event.target.closest('[data-cart-minus]'); if (remove) state.cart.splice(Number(remove.dataset.remove), 1); if (plus) { const line = state.cart[Number(plus.dataset.cartPlus)]; if (cartQuantityFor(line.id) < getProduct(line.id).stock) line.quantity += 1; } if (minus) { const line = state.cart[Number(minus.dataset.cartMinus)]; const minimum = line.reseller ? resellerMinimum(getProduct(line.id)) : 1; if (line.quantity > minimum) line.quantity -= 1; } if (remove || plus || minus) persistCart(); });
document.querySelector('#cartButton').addEventListener('click', openCart); document.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', closeCart)); overlay.addEventListener('click', closeCart); document.querySelector('#checkoutButton').addEventListener('click', checkoutModal); document.querySelector('#accountButton').addEventListener('click', accountModal);
document.querySelector('#sideAccount').addEventListener('click', accountModal);
document.querySelector('#menuButton').addEventListener('click', () => { document.querySelector('#sidebar').classList.toggle('open'); document.querySelector('#sidebarOverlay').classList.toggle('show'); });
document.querySelector('#sidebarOverlay').addEventListener('click', () => { document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); });
document.querySelectorAll('.side-nav a').forEach((link) => link.addEventListener('click', () => { document.querySelectorAll('.side-nav a').forEach((item) => item.classList.remove('active')); link.classList.add('active'); document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); }));
document.querySelector('#chatBubble').addEventListener('click', openChat); document.querySelector('#openChatSide').addEventListener('click', openChat); document.querySelector('#closeChat').addEventListener('click', closeChat);
document.querySelectorAll('[data-chat-mode]').forEach((button) => button.addEventListener('click', () => switchChatMode(button.dataset.chatMode)));
chatMessages.addEventListener('click', (event) => { const question = event.target.closest('[data-question]'); if (question) { document.querySelector('#chatInput').value = question.dataset.question; document.querySelector('#chatForm').requestSubmit(); } if (event.target.closest('[data-admin]')) contactAdmin(); });
document.querySelector('#chatForm').addEventListener('submit', async (event) => { event.preventDefault(); const input = document.querySelector('#chatInput'); const question = input.value.trim(); if (!question) return; input.value = ''; if (state.chatMode === 'admin') { try { await sendAdminMessage(question); } catch (error) { notify(error.message); } return; } addMessage(question, 'user'); const answer = await askBot(question); addMessage(answer, 'bot'); });

function setDetailQuantity(value) {
  const input = document.querySelector('#detailQuantity'); if (!input) return;
  const min = Number(input.min) || 1; const max = Number(input.max) || 1; const quantity = Math.max(min, Math.min(Number(value) || min, max));
  input.value = quantity;
  const minus = document.querySelector('[data-detail-minus]'); const plus = document.querySelector('[data-detail-plus]');
  if (minus) minus.disabled = quantity <= min; if (plus) plus.disabled = quantity >= max;
}

modalLayer.addEventListener('click', async (event) => {
  if (event.target === modalLayer || event.target.closest('[data-close-modal]')) closeModal();
  if (event.target.closest('[data-detail-minus]')) setDetailQuantity(Number(document.querySelector('#detailQuantity').value) - 1);
  if (event.target.closest('[data-detail-plus]')) setDetailQuantity(Number(document.querySelector('#detailQuantity').value) + 1);
  const detailTab = event.target.closest('[data-detail-tab]'); if (detailTab) { document.querySelectorAll('[data-detail-tab]').forEach((button) => button.classList.toggle('active', button === detailTab)); document.querySelectorAll('[data-detail-panel]').forEach((panel) => { panel.hidden = panel.dataset.detailPanel !== detailTab.dataset.detailTab; }); }
  const authTab = event.target.closest('[data-auth-tab]'); if (authTab) authModal(authTab.dataset.authTab);
  const addDetail = event.target.closest('[data-add-detail]'); if (addDetail) { const quantity = Number(document.querySelector('#detailQuantity').value); addToCart(Number(addDetail.dataset.addDetail), quantity, Boolean(document.querySelector('#detailOwnGmail')?.checked), Boolean(document.querySelector('#detailReseller')?.checked)); closeModal(); openCart(); }
  const buyNow = event.target.closest('[data-buy-now]'); if (buyNow) { const id = Number(buyNow.dataset.buyNow); const product = getProduct(id); const reseller = Boolean(document.querySelector('#detailReseller')?.checked); const minimum = reseller ? resellerMinimum(product) : 1; const quantity = Math.max(minimum, Math.min(Number(document.querySelector('#detailQuantity').value) || minimum, product.stock)); state.cart = [{ id, quantity, ownGmail: Boolean(document.querySelector('#detailOwnGmail')?.checked), reseller }]; persistCart(); closeModal(); checkoutModal(); }
  if (event.target.closest('#logoutButton')) { await fetch('/api/auth/logout', { method: 'POST' }); state.user = null; document.querySelector('#accountButton span').textContent = 'Masuk'; closeModal(); notify('Kamu sudah keluar'); }
  if (event.target.closest('#confirmPayment')) { const button = event.target.closest('#confirmPayment'); const order = state.orders.find((item) => item.id === button.dataset.orderId); if (!order) return notify('Detail pesanan tidak ditemukan.'); button.disabled = true; button.textContent = 'Mengirim konfirmasi...'; await sendAdminMessage(orderMessage(order)).catch(() => {}); closeModal(); openChat(); switchChatMode('admin'); notify('Detail pembayaran dikirim ke admin.'); }
  const reopen = event.target.closest('[data-reopen-payment]'); if (reopen) { const order = state.orders.find((item) => item.id === reopen.dataset.reopenPayment); if (order) paymentModal(order.customer, order); }
  const chatOrder = event.target.closest('[data-chat-order]'); if (chatOrder) { const order = state.orders.find((item) => item.id === chatOrder.dataset.chatOrder); closeModal(); openChat(); switchChatMode('admin'); if (order) sendAdminMessage(`Saya ingin menanyakan pesanan ${order.id}, dibuat ${new Date(order.createdAt).toLocaleString('id-ID')}.`).catch(() => {}); }
  const reviewOrder = event.target.closest('[data-review-order]'); if (reviewOrder) reviewForm(reviewOrder.dataset.reviewOrder, Number(reviewOrder.dataset.reviewProduct));
});

modalLayer.addEventListener('change', (event) => {
  if (event.target.id === 'detailOwnGmail' || event.target.id === 'detailReseller') {
    const item = getProduct(document.querySelector('[data-add-detail]')?.dataset.addDetail);
    const ownGmail = Boolean(document.querySelector('#detailOwnGmail')?.checked); const reseller = Boolean(document.querySelector('#detailReseller')?.checked); const regular = item.price + (ownGmail ? 5000 : 0);
    document.querySelector('#detailPrice').textContent = rupiah(reseller ? Math.round(regular * 0.92) : regular);
    const crossed = document.querySelector('#detailRegularPrice'); if (crossed) { crossed.hidden = !reseller; crossed.textContent = rupiah(regular); }
    const input = document.querySelector('#detailQuantity'); input.min = reseller ? resellerMinimum(item) : 1; if (reseller && Number(input.value) < Number(input.min)) input.value = input.min; document.querySelector('#quantityHint').textContent = reseller ? `Minimum reseller ${input.min}, maksimal ${item.stock}` : `Maksimal ${item.stock} sesuai stok`; setDetailQuantity(input.value);
  }
});
modalLayer.addEventListener('input', (event) => { if (event.target.id === 'detailQuantity') setDetailQuantity(event.target.value); });

modalLayer.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (event.target.id === 'authForm') {
    const button = event.target.querySelector('button[type="submit"]'); const mode = event.target.dataset.mode; button.disabled = true; button.textContent = mode === 'register' ? 'Membuat akun...' : 'Memeriksa akun...';
    try { const credentials = Object.fromEntries(new FormData(event.target)); if (mode === 'register') credentials.deviceId = state.deviceId; const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Autentikasi gagal.'); state.user = result.user; document.querySelector('#accountButton span').textContent = state.user.name.split(' ')[0]; closeModal(); notify(mode === 'register' ? 'Akun berhasil dibuat' : 'Berhasil masuk'); }
    catch (error) { notify(error.message); button.disabled = false; button.textContent = mode === 'register' ? 'Buat akun' : 'Masuk sekarang'; }
  }
  if (event.target.id === 'checkoutForm') {
    const button = event.target.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Memvalidasi stok...';
    try { const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: Object.fromEntries(new FormData(event.target)), items: state.cart, chatId: state.chatId }) }); const order = await response.json(); if (!response.ok) throw new Error(order.error || 'Pesanan gagal dibuat.'); await loadStore(); state.cart = []; persistCart(); paymentModal(order.customer, order); } catch (error) { notify(error.message); button.disabled = false; button.textContent = 'Lanjut ke pembayaran'; }
  }
  if (event.target.id === 'reviewForm') {
    const button = event.target.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Mengirim ulasan...';
    try { const body = Object.fromEntries(new FormData(event.target)); body.orderId = event.target.dataset.orderId; body.productId = Number(event.target.dataset.productId); body.rating = Number(body.rating); const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const review = await response.json(); if (!response.ok) throw new Error(review.error || 'Ulasan gagal dikirim.'); state.reviews.unshift(review); notify('Terima kasih, ulasanmu sudah diterbitkan.'); historyModal(); } catch (error) { notify(error.message); button.disabled = false; button.textContent = 'Kirim ulasan'; }
  }
});

function addToCart(id, quantity, ownGmail = false, reseller = false) {
  const product = getProduct(id); const selectedReseller = Boolean(reseller); const minimum = selectedReseller ? resellerMinimum(product) : 1; const amount = Math.max(minimum, Math.min(Number(quantity) || minimum, product.stock));
  const selectedOwnGmail = supportsOwnGmail(product) && Boolean(ownGmail);
  const existing = state.cart.find((line) => line.id === id && Boolean(line.ownGmail) === selectedOwnGmail && Boolean(line.reseller) === selectedReseller);
  const otherQuantity = state.cart.filter((line) => line.id === id && line !== existing).reduce((total, line) => total + line.quantity, 0);
  const available = Math.max(0, product.stock - otherQuantity);
  if (!available) return notify('Stok produk sudah habis di keranjang');
  if (available < minimum) return notify(`Harga reseller membutuhkan minimal ${minimum} stok.`);
  if (existing) existing.quantity = Math.min(existing.quantity + amount, available); else state.cart.push({ id, quantity: Math.min(amount, available), ownGmail: selectedOwnGmail, reseller: selectedReseller });
  persistCart(); notify('Produk masuk ke keranjang');
}

async function loadStore() {
  try { const response = await fetch('/api/store', { cache: 'no-store' }); if (!response.ok) throw new Error(); const data = await response.json(); products = data.products.map((item) => supportsOwnGmail(item) ? { ...item, access: 'Akun privat + Codex', description: CHATGPT_PLUS_DESCRIPTION } : item); validIds = new Set(products.map((item) => item.id)); }
  catch { notify('Menggunakan data katalog lokal.'); }
  renderProducts(); updateCart();
}

async function loadUserSession() {
  localStorage.removeItem('digiepro_user');
  Object.keys(localStorage).filter((key) => key.startsWith('digiepro_account_')).forEach((key) => localStorage.removeItem(key));
  try { const response = await fetch('/api/auth/me', { cache: 'no-store' }); if (!response.ok) return; const result = await response.json(); state.user = result.user; document.querySelector('#accountButton span').textContent = state.user.name.split(' ')[0]; } catch {}
}

document.querySelector('#historyButton').addEventListener('click', historyModal);
document.querySelector('#reviewsButton').addEventListener('click', reviewsModal);
document.querySelector('#infoButton').addEventListener('click', () => { document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); openModal(`${modalHead('Informasi DigiePro')}<div class="modal-body"><div class="about-profile"><div class="about-photo"><img src="assets/afran-ronaldi-v2.png" alt="Afran Ronaldi"></div><div><small>PENGELOLA DIGIEPRO</small><h3>Afran Ronaldi</h3><p>DigiePro dibangun untuk mempermudah pembelian akun digital premium dengan katalog yang jelas, stok konsisten, dan proses transaksi yang sederhana.</p></div></div><div class="about-points"><div><i data-lucide="package-check"></i><span><b>Stok terpantau</b><small>Jumlah pembelian mengikuti stok yang tersedia.</small></span></div><div><i data-lucide="qr-code"></i><span><b>QRIS sesuai tagihan</b><small>Nominal pembayaran dibuat sesuai total checkout.</small></span></div><div><i data-lucide="message-circle"></i><span><b>Bantuan langsung</b><small>Produk dikirim dan kendala dibantu melalui WhatsApp.</small></span></div></div><button class="submit-button" type="button" data-open-admin-chat>Hubungi admin</button></div>`); });
modalLayer.addEventListener('click', (event) => { if (event.target.closest('[data-open-admin-chat]')) { closeModal(); openChat(); switchChatMode('admin'); } });
setInterval(() => { if (state.chatMode === 'admin' && chatPanel.classList.contains('open')) loadAdminChat(); }, 5000);

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeModal(); closeChat(); } });
loadStore(); loadUserSession(); icons();
