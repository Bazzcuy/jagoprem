const STORE_CONFIG = {
  grokProxyUrl: '', // Isi URL backend proxy Grok nanti. Jangan taruh API key produksi di frontend.
  staticQris: '00020101021126570011ID.DANA.WWW011893600915303270621302090327062130303UMI51440014ID.CO.QRIS.WWW0215ID10265345984810303UMI5204481453033605802ID5914Webtokoku plus6014Kota Palembang61053026663040D38'
};

const fallbackCatalog = (window.VIOLA_PRODUCTS || []).flatMap((item) => item.id === 23843 ? [
  { ...item, title: 'CHATGPT GO 3 BULAN', price: 25000, stock: 6, available_stock: 6, has_wholesale: false, featuredRank: 1, duration: '3 bulan', warranty: 'Garansi penuh', access: 'ChatGPT Go', description: 'Akses ChatGPT Go selama 3 bulan untuk chat AI, menulis, belajar, merangkum, dan membantu pekerjaan harian. Produk mendapat garansi penuh selama masa aktif dengan mengikuti ketentuan penggunaan.' },
  { ...item, id: 90001, title: 'CHATGPT PLUS 1 BULAN - GARANSI 2 HARI', price: 30000, stock: 5, available_stock: 5, sold: 86, has_wholesale: false, featuredRank: 2, duration: '1 bulan', warranty: '2 hari', access: 'ChatGPT Plus', description: 'Akses ChatGPT Plus selama 1 bulan dengan garansi akses 2 hari. Cocok untuk kebutuhan singkat dengan harga lebih hemat.' },
  { ...item, id: 90002, title: 'CHATGPT PLUS 1 BULAN - GARANSI 20 HARI', price: 56000, stock: 7, available_stock: 7, sold: 151, has_wholesale: false, featuredRank: 3, duration: '1 bulan', warranty: '20 hari', access: 'ChatGPT Plus', description: 'Akses ChatGPT Plus selama 1 bulan dengan perlindungan garansi akses hingga 20 hari untuk pemakaian yang lebih tenang.' }
] : [{ ...item, stock: Math.min(item.available_stock || 0, 49), enabled: true, featuredRank: item.id === 46473 ? 4 : 99 }]);
let products = fallbackCatalog.map((item) => ({ enabled: true, ...item }));
let validIds = new Set(products.map((item) => item.id));
const savedCart = JSON.parse(localStorage.getItem('digiepro_cart') || '[]');
const state = {
  cart: savedCart.map((line) => typeof line === 'number' ? { id: line, quantity: 1 } : line).filter((line) => validIds.has(line.id)),
  user: JSON.parse(localStorage.getItem('digiepro_user') || 'null'),
  stock: 'all',
  best: false,
  wholesale: false,
  chatMode: 'bot',
  chatId: localStorage.getItem('digiepro_chat_id') || `chat-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
};
localStorage.setItem('digiepro_chat_id', state.chatId);

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
function getProduct(id) { return products.find((item) => item.id === Number(id)); }
function cartTotal() { return state.cart.reduce((total, line) => total + (getProduct(line.id)?.price || 0) * line.quantity, 0); }
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
  state.cart = state.cart.filter((line) => validIds.has(line.id) && line.quantity > 0).map((line) => ({ ...line, quantity: Math.min(line.quantity, getProduct(line.id).stock) })).filter((line) => line.quantity > 0);
  document.querySelector('#cartCount').textContent = state.cart.reduce((total, line) => total + line.quantity, 0);
  const items = state.cart.map((line, index) => ({ ...getProduct(line.id), quantity: line.quantity, index }));
  document.querySelector('#cartItems').innerHTML = items.length ? items.map((item) => `<div class="cart-item"><img src="${item.thumbnail}" alt=""><div><h3>${item.title}</h3><p>${rupiah(item.price * item.quantity)}</p><div class="cart-quantity"><button type="button" data-cart-minus="${item.index}">−</button><span>${item.quantity}</span><button type="button" data-cart-plus="${item.index}" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button></div></div><button class="remove-item" type="button" data-remove="${item.index}" aria-label="Hapus ${item.title}"><i data-lucide="trash-2"></i></button></div>`).join('') : '<div class="cart-empty"><i data-lucide="shopping-bag"></i><p>Keranjang masih kosong.</p></div>';
  document.querySelector('#cartTotal').textContent = rupiah(cartTotal());
  document.querySelector('#checkoutButton').disabled = !items.length;
  localStorage.setItem('digiepro_cart', JSON.stringify(state.cart)); icons();
}

function openCart() { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); overlay.classList.add('show'); }
function closeCart() { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); overlay.classList.remove('show'); }
function openModal(html) { modalContent.innerHTML = html; modalLayer.classList.add('open'); modalLayer.setAttribute('aria-hidden', 'false'); icons(); }
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
  return {
    description: item.description || match?.[1] || `Akses premium ${item.title} dengan detail penggunaan yang dikirimkan langsung oleh admin DigiePro.`,
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
  openModal(`${modalHead('Detail produk')}<div class="modal-body product-detail-body"><div class="detail-layout"><div class="detail-media"><img class="detail-image" src="${item.thumbnail}" alt="${item.title}"><div class="detail-facts"><div><i data-lucide="clock-3"></i><span>Masa aktif<b>${profile.duration}</b></span></div><div><i data-lucide="shield-check"></i><span>Garansi<b>${profile.warranty}</b></span></div><div><i data-lucide="key-round"></i><span>Akses produk<b>${profile.access}</b></span></div></div></div><div class="detail-content"><h2>${item.title}</h2><strong class="detail-price">${rupiah(item.price)}</strong><div class="detail-tags">${item.featuredRank < 5 ? '<span>Rekomendasi</span>' : item.is_best_seller ? '<span>Terlaris</span>' : ''}${item.has_wholesale ? '<span>Tersedia grosir</span>' : ''}<span>${item.stock && item.enabled ? 'Ready stock' : 'Stok habis'}</span></div><div class="detail-info"><div><span>Kategori</span><b>${profile.category}</b></div><div><span>Pengiriman</span><b>${profile.delivery}</b></div><div><span>Stok tersedia</span><b>${item.enabled ? item.stock : 0}</b></div><div><span>Terjual</span><b>${item.sold}</b></div></div><div class="detail-tabs"><button class="active" type="button" data-detail-tab="description">Deskripsi</button><button type="button" data-detail-tab="terms">S & K</button></div><div class="detail-tab-panel" data-detail-panel="description"><p>${profile.description}</p></div><div class="detail-tab-panel" data-detail-panel="terms" hidden><ol>${profile.terms.map((term) => `<li>${term}</li>`).join('')}</ol></div><label class="detail-quantity"><span>Jumlah pembelian</span><input id="detailQuantity" type="number" min="1" max="${item.stock}" value="1" ${item.stock && item.enabled ? '' : 'disabled'}></label><div class="detail-actions"><button class="detail-buy secondary" type="button" data-add-detail="${item.id}" ${item.stock && item.enabled ? '' : 'disabled'}>Masukkan keranjang</button><button class="detail-buy" type="button" data-buy-now="${item.id}" ${item.stock && item.enabled ? '' : 'disabled'}>Beli sekarang</button></div></div></div></div>`);
}

function authModal(mode = 'login') {
  const register = mode === 'register';
  openModal(`${modalHead('Akun DigiePro')}<div class="modal-body"><div class="auth-tabs"><button class="${register ? '' : 'active'}" data-auth-tab="login" type="button">Masuk</button><button class="${register ? 'active' : ''}" data-auth-tab="register" type="button">Daftar</button></div><form id="authForm" data-mode="${mode}">${register ? '<div class="form-group"><label>NAMA</label><input name="name" required placeholder="Nama kamu"></div>' : ''}<div class="form-group"><label>EMAIL</label><input name="email" type="email" required placeholder="nama@email.com"></div><div class="form-group"><label>PASSWORD</label><input name="password" type="password" minlength="4" required placeholder="Minimal 4 karakter"></div><button class="submit-button" type="submit">${register ? 'Buat akun' : 'Masuk sekarang'}</button></form></div>`);
}

function accountModal() {
  if (!state.user) return authModal();
  openModal(`${modalHead('Akun saya')}<div class="modal-body"><div class="account-card"><strong>${state.user.name}</strong><span>${state.user.email}</span></div><button class="logout-button" id="logoutButton" type="button">Keluar dari akun</button></div>`);
}

function checkoutModal() {
  closeCart();
  openModal(`${modalHead('Checkout')}<div class="modal-body"><div class="order-summary">${state.cart.map((line) => { const item = getProduct(line.id); return `<div><span>${item.title} × ${line.quantity}</span><b>${rupiah(item.price * line.quantity)}</b></div>`; }).join('')}<div><span>Biaya admin</span><b>${rupiah(99)}</b></div><div class="total"><span>Total pembayaran</span><b>${rupiah(cartTotal() + 99)}</b></div></div><form id="checkoutForm"><div class="form-group"><label>NAMA PENERIMA</label><input name="name" required value="${state.user?.name || ''}" placeholder="Nama kamu"></div><div class="form-group"><label>NOMOR WHATSAPP</label><input name="whatsapp" inputmode="tel" required pattern="[0-9+ ]{9,16}" placeholder="Contoh: 081234567890"><p class="field-help">Nomor ini dipakai admin untuk menghubungi dan mengirim detail produk.</p></div><div class="form-group"><label>CATATAN (OPSIONAL)</label><textarea name="note" placeholder="Permintaan atau informasi tambahan"></textarea></div><button class="submit-button" type="submit">Lanjut ke pembayaran</button></form></div>`);
}

function paymentModal(customer, order) {
  const total = order.total; const orderId = order.id;
  const payload = QrisTools.dynamic(STORE_CONFIG.staticQris, total);
  localStorage.setItem('digiepro_last_order', JSON.stringify(order));
  openModal(`${modalHead('Pembayaran QRIS')}<div class="modal-body payment"><span class="payment-status">MENUNGGU PEMBAYARAN</span><h2>Selesaikan pembayaran</h2><p>ID Pesanan: ${orderId}</p><div class="payment-card"><div class="qr-box" id="dynamicQr"></div><div class="payment-breakdown"><div><span>Subtotal</span><b>${rupiah(order.subtotal)}</b></div><div><span>Biaya admin</span><b>${rupiah(order.adminFee)}</b></div><div class="grand-total"><span>Total pembayaran</span><b>${rupiah(total)}</b></div></div><div class="payment-assurance"><i data-lucide="message-circle-check"></i><span>Setelah pembayaran selesai, Anda akan dihubungi langsung oleh admin melalui WhatsApp.</span></div></div><button class="confirm-button" id="confirmPayment" type="button">Pembayaran sudah selesai</button></div>`);
  new QRCode(document.querySelector('#dynamicQr'), { text: payload, width: 238, height: 238, correctLevel: QRCode.CorrectLevel.M });
  icons();
}

function openChat() { chatPanel.classList.add('open'); chatPanel.setAttribute('aria-hidden', 'false'); document.querySelector('#chatInput').focus(); }
function closeChat() { chatPanel.classList.remove('open'); chatPanel.setAttribute('aria-hidden', 'true'); }
function addMessage(text, role) { const node = document.createElement('div'); node.className = `message ${role}`; node.textContent = text; chatMessages.appendChild(node); chatMessages.scrollTop = chatMessages.scrollHeight; }
function contactAdmin() { switchChatMode('admin'); }
function customerIdentity() { const last = JSON.parse(localStorage.getItem('digiepro_last_order') || 'null'); return last?.customer || state.user || {}; }
async function loadAdminChat() { try { const response = await fetch(`/api/chat/${state.chatId}`, { cache: 'no-store' }); const chat = await response.json(); if (state.chatMode !== 'admin') return; chatMessages.innerHTML = chat.messages?.length ? chat.messages.map((item) => `<div class="message ${item.sender === 'admin' ? 'bot' : 'user'}">${item.text.replace(/[<>]/g, '')}</div>`).join('') : '<div class="message bot">Kamu sudah masuk ke chat admin. Tulis pesan dan admin akan membalas dari dashboard.</div>'; chatMessages.scrollTop = chatMessages.scrollHeight; } catch {} }
function switchChatMode(mode) { state.chatMode = mode; document.querySelectorAll('[data-chat-mode]').forEach((button) => button.classList.toggle('active', button.dataset.chatMode === mode)); document.querySelector('#chatTitle').textContent = mode === 'admin' ? 'Admin DigiePro' : 'Asisten DigiePro'; if (mode === 'admin') loadAdminChat(); else chatMessages.innerHTML = '<div class="message bot">Hai! Mau cari produk, tanya cara bayar, atau terhubung ke admin?</div><div class="quick-chat"><button data-question="Produk apa yang ready?" type="button">Cek stok</button><button data-question="Bagaimana cara bayar?" type="button">Cara bayar</button><button data-admin type="button">Chat admin</button></div>'; }
async function sendAdminMessage(message) { const response = await fetch(`/api/chat/${state.chatId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, customer: customerIdentity() }) }); if (!response.ok) throw new Error('Pesan gagal dikirim.'); await loadAdminChat(); }
function localBotAnswer(question) {
  const text = question.toLowerCase();
  if (text.includes('stok') || text.includes('ready')) { const ready = products.filter((item) => item.stock > 0 && item.enabled).sort((a, b) => a.featuredRank - b.featuredRank || b.sold - a.sold).slice(0, 5); return `Produk ready yang populer:\n${ready.map((item) => `• ${item.title} - ${rupiah(item.price)} (sisa ${item.stock})`).join('\n')}`; }
  if (text.includes('bayar') || text.includes('qris')) return 'Setelah checkout, sistem membuat QRIS dengan nominal persis sesuai total belanja. Scan QR tersebut, lalu konfirmasi ke admin.';
  if (text.includes('admin') || text.includes('manusia')) return 'Tekan tombol "Hubungi admin" untuk melanjutkan lewat WhatsApp.';
  const match = products.find((item) => text.includes(item.title.toLowerCase().split(' ')[0]));
  if (match) return `${match.title}: ${rupiah(match.price)}, stok ${match.stock}, terjual ${match.sold}. ${match.stock && match.enabled ? 'Saat ini tersedia.' : 'Saat ini stok habis.'}`;
  return 'Aku bisa membantu cek stok, harga produk, cara pembayaran QRIS, atau menghubungkan kamu ke admin.';
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
  carousel.querySelector('[data-search-product]').addEventListener('click', () => { document.querySelector('#searchInput').value = 'CHATGPT'; renderProducts(); document.querySelector('#products').scrollIntoView(); });
  showSlide(0); startCarousel();
}
document.querySelector('#resetFilter').addEventListener('click', () => { state.stock = 'all'; state.best = false; state.wholesale = false; document.querySelector('input[name="stock"][value="all"]').checked = true; document.querySelector('#bestFilter').checked = false; document.querySelector('#wholesaleFilter').checked = false; document.querySelector('#searchInput').value = ''; renderProducts(); });
productGrid.addEventListener('click', (event) => { const add = event.target.closest('[data-add]'); if (add) { event.stopPropagation(); addToCart(Number(add.dataset.add), 1); return; } const card = event.target.closest('[data-detail]'); if (card) detailModal(card.dataset.detail); });
productGrid.addEventListener('keydown', (event) => { const card = event.target.closest('[data-detail]'); if (card && (event.key === 'Enter' || event.key === ' ')) detailModal(card.dataset.detail); });
document.querySelector('#cartItems').addEventListener('click', (event) => { const remove = event.target.closest('[data-remove]'); const plus = event.target.closest('[data-cart-plus]'); const minus = event.target.closest('[data-cart-minus]'); if (remove) state.cart.splice(Number(remove.dataset.remove), 1); if (plus) state.cart[Number(plus.dataset.cartPlus)].quantity += 1; if (minus) state.cart[Number(minus.dataset.cartMinus)].quantity -= 1; if (remove || plus || minus) persistCart(); });
document.querySelector('#cartButton').addEventListener('click', openCart); document.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', closeCart)); overlay.addEventListener('click', closeCart); document.querySelector('#checkoutButton').addEventListener('click', checkoutModal); document.querySelector('#accountButton').addEventListener('click', accountModal);
document.querySelector('#sideAccount').addEventListener('click', accountModal);
document.querySelector('#menuButton').addEventListener('click', () => { document.querySelector('#sidebar').classList.toggle('open'); document.querySelector('#sidebarOverlay').classList.toggle('show'); });
document.querySelector('#sidebarOverlay').addEventListener('click', () => { document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); });
document.querySelectorAll('.side-nav a').forEach((link) => link.addEventListener('click', () => { document.querySelectorAll('.side-nav a').forEach((item) => item.classList.remove('active')); link.classList.add('active'); document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); }));
document.querySelector('#chatBubble').addEventListener('click', openChat); document.querySelector('#openChatSide').addEventListener('click', openChat); document.querySelector('#closeChat').addEventListener('click', closeChat);
document.querySelectorAll('[data-chat-mode]').forEach((button) => button.addEventListener('click', () => switchChatMode(button.dataset.chatMode)));
chatMessages.addEventListener('click', (event) => { const question = event.target.closest('[data-question]'); if (question) { document.querySelector('#chatInput').value = question.dataset.question; document.querySelector('#chatForm').requestSubmit(); } if (event.target.closest('[data-admin]')) contactAdmin(); });
document.querySelector('#chatForm').addEventListener('submit', async (event) => { event.preventDefault(); const input = document.querySelector('#chatInput'); const question = input.value.trim(); if (!question) return; input.value = ''; if (state.chatMode === 'admin') { try { await sendAdminMessage(question); } catch (error) { notify(error.message); } return; } addMessage(question, 'user'); const answer = await askBot(question); addMessage(answer, 'bot'); });

modalLayer.addEventListener('click', (event) => {
  if (event.target === modalLayer || event.target.closest('[data-close-modal]')) closeModal();
  const detailTab = event.target.closest('[data-detail-tab]'); if (detailTab) { document.querySelectorAll('[data-detail-tab]').forEach((button) => button.classList.toggle('active', button === detailTab)); document.querySelectorAll('[data-detail-panel]').forEach((panel) => { panel.hidden = panel.dataset.detailPanel !== detailTab.dataset.detailTab; }); }
  const authTab = event.target.closest('[data-auth-tab]'); if (authTab) authModal(authTab.dataset.authTab);
  const addDetail = event.target.closest('[data-add-detail]'); if (addDetail) { const quantity = Number(document.querySelector('#detailQuantity').value); addToCart(Number(addDetail.dataset.addDetail), quantity); closeModal(); openCart(); }
  const buyNow = event.target.closest('[data-buy-now]'); if (buyNow) { const id = Number(buyNow.dataset.buyNow); const product = getProduct(id); const quantity = Math.max(1, Math.min(Number(document.querySelector('#detailQuantity').value) || 1, product.stock)); state.cart = [{ id, quantity }]; persistCart(); closeModal(); checkoutModal(); }
  if (event.target.closest('#logoutButton')) { state.user = null; localStorage.removeItem('digiepro_user'); document.querySelector('#accountButton span').textContent = 'Masuk'; closeModal(); notify('Kamu sudah keluar'); }
  if (event.target.closest('#confirmPayment')) { const order = JSON.parse(localStorage.getItem('digiepro_last_order')); closeModal(); openChat(); switchChatMode('admin'); sendAdminMessage(`Saya sudah menyelesaikan pembayaran untuk pesanan ${order.id}.`).catch(() => {}); notify('Admin akan menghubungi kamu melalui WhatsApp.'); }
});

modalLayer.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (event.target.id === 'authForm') { const data = Object.fromEntries(new FormData(event.target)); if (event.target.dataset.mode === 'register') localStorage.setItem(`digiepro_account_${data.email}`, JSON.stringify(data)); const saved = JSON.parse(localStorage.getItem(`digiepro_account_${data.email}`) || 'null'); if (!saved && event.target.dataset.mode === 'login') return notify('Akun belum ditemukan. Silakan daftar.'); if (saved && saved.password !== data.password) return notify('Password belum sesuai.'); state.user = saved || data; localStorage.setItem('digiepro_user', JSON.stringify(state.user)); document.querySelector('#accountButton span').textContent = state.user.name.split(' ')[0]; closeModal(); notify('Berhasil masuk'); }
  if (event.target.id === 'checkoutForm') {
    const button = event.target.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Memvalidasi stok...';
    try { const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: Object.fromEntries(new FormData(event.target)), items: state.cart, chatId: state.chatId }) }); const order = await response.json(); if (!response.ok) throw new Error(order.error || 'Pesanan gagal dibuat.'); await loadStore(); state.cart = []; persistCart(); paymentModal(order.customer, order); } catch (error) { notify(error.message); button.disabled = false; button.textContent = 'Lanjut ke pembayaran'; }
  }
});

function addToCart(id, quantity) {
  const product = getProduct(id); const amount = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
  const existing = state.cart.find((line) => line.id === id);
  if (existing) existing.quantity = Math.min(existing.quantity + amount, product.stock); else state.cart.push({ id, quantity: amount });
  persistCart(); notify('Produk masuk ke keranjang');
}

async function loadStore() {
  try { const response = await fetch('/api/store', { cache: 'no-store' }); if (!response.ok) throw new Error(); const data = await response.json(); products = data.products; validIds = new Set(products.map((item) => item.id)); }
  catch { notify('Menggunakan data katalog lokal.'); }
  renderProducts(); updateCart();
}

document.querySelector('#historyButton').addEventListener('click', () => { const order = JSON.parse(localStorage.getItem('digiepro_last_order') || 'null'); openModal(`${modalHead('Riwayat pesanan')}<div class="modal-body">${order ? `<div class="order-summary"><div><span>ID pesanan</span><b>${order.id}</b></div><div><span>Status</span><b>${order.status || 'pending'}</b></div><div><span>Total</span><b>${rupiah(order.total)}</b></div><div><span>Dibuat</span><b>${new Date(order.createdAt).toLocaleString('id-ID')}</b></div></div><button class="submit-button" type="button" data-open-admin-chat>Chat admin tentang pesanan</button>` : '<div class="cart-empty"><p>Belum ada pesanan.</p></div>'}</div>`); });
document.querySelector('#infoButton').addEventListener('click', () => openModal(`${modalHead('Informasi DigiePro')}<div class="modal-body"><div class="detail-note">DigiePro menyediakan akun digital premium dengan stok real-time, pembayaran QRIS sesuai nominal, dan pengiriman produk melalui WhatsApp pembeli.</div><button class="submit-button" type="button" data-open-admin-chat>Hubungi admin</button></div>`));
modalLayer.addEventListener('click', (event) => { if (event.target.closest('[data-open-admin-chat]')) { closeModal(); openChat(); switchChatMode('admin'); } });
setInterval(() => { if (state.chatMode === 'admin' && chatPanel.classList.contains('open')) loadAdminChat(); }, 5000);

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeModal(); closeChat(); } });
loadStore(); if (state.user) document.querySelector('#accountButton span').textContent = state.user.name.split(' ')[0]; icons();
