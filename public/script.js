const STORE_CONFIG = {
  grokProxyUrl: '', // Isi URL backend proxy Grok nanti. Jangan taruh API key produksi di frontend.
  staticQris: '00020101021126570011ID.DANA.WWW011893600915303270621302090327062130303UMI51440014ID.CO.QRIS.WWW0215ID10265345984810303UMI5204481453033605802ID5914Webtokoku plus6014Kota Palembang61053026663040D38'
};

const CHATGPT_PLUS_DESCRIPTION = 'Akun ChatGPT Plus privat, bukan sharing, dengan dukungan Codex. Aktivasi menggunakan payment credit card pada akun privat agar akses lebih aman dan tidak bercampur dengan pengguna lain. Tersedia opsi aktivasi memakai Gmail sendiri dengan tambahan Rp5.000.';
const OFFICIAL_PRIVATE_DESCRIPTION = 'Akun resmi dan bukan akun ilegal. Akses bersifat privat, bukan sharing, dengan garansi 30 hari sesuai ketentuan penggunaan JagoPrem.';
const CLAUDE_PRO_DESCRIPTION = 'Akun resmi Claude Pro login di claude.ai. Akun Vietnam dengan pembayaran credit card Vietnam, garansi 30 hari, dan dijamin aman dari deactive selama tidak mengubah pembayaran, info login seperti email dan password, serta tidak terlalu sering ganti device.';
const GPT_EDU_K12_DESCRIPTION = 'Akses GPT Edu K12 untuk kebutuhan belajar, membuat materi, merangkum, menulis, riset ringan, pendampingan tugas sekolah, dan penggunaan Codex untuk belajar coding. Produk tidak menyediakan opsi email sendiri; detail akses dan panduan penggunaan dikirim admin setelah pembayaran.';
const PRODUCT_OVERRIDES = {
  46473: { price: 83000, stock: 13, available_stock: 13, duration: '1 bulan', warranty: '30 hari', access: 'Akun resmi Claude Pro di claude.ai', description: CLAUDE_PRO_DESCRIPTION },
  23915: { stock: 3, available_stock: 3, warranty: '30 hari', access: 'Akun resmi privat', description: OFFICIAL_PRIVATE_DESCRIPTION }
};
function applyCatalogDefaults(item, isFallback = false) {
  const override = PRODUCT_OVERRIDES[item.id];
  if (!override) return item;
  const result = { ...item };
  if (override.duration !== undefined) result.duration = override.duration;
  if (override.warranty !== undefined) result.warranty = override.warranty;
  if (override.access !== undefined) result.access = override.access;
  if (override.description !== undefined) result.description = override.description;
  if (isFallback) {
    if (override.price !== undefined) result.price = override.price;
    if (override.stock !== undefined) result.stock = override.stock;
    if (override.available_stock !== undefined) result.available_stock = override.available_stock;
  }
  return result;
}
const DOLA_PRODUCT = { id: 91001, is_best_seller: false, title: 'DOLA AI 1 BULAN', cashback_amount: 0, cashback_type: 'amount', thumbnail: 'https://sf-sf-flow-web-cdn-nontt.ciciaicdn.com/obj/ocean-flow-web-sg/favicon/new-dola/192x192.png', price: 37000, available_stock: 8, sold: 34, total_stock: 42, has_wholesale: false, stock: 8, enabled: true, featuredRank: 5, duration: '1 bulan', warranty: 'Garansi akses', access: 'Dola AI', description: 'Dola AI adalah asisten chat AI untuk percakapan, menulis, menerjemahkan, coding, mencari inspirasi, dan membahas berbagai topik. Produk aktif 1 bulan sesuai ketentuan penggunaan JagoPrem.' };
const GPT_EDU_K12_PRODUCT = { id: 92000, is_best_seller: true, title: 'GPT EDU K12', cashback_amount: 0, cashback_type: 'amount', thumbnail: 'https://cdn.gradual.com/images/https://d2xo500swnpgl1.cloudfront.net/uploads/oaiacademy/EDU-Content-Covers-37--16823a96-45ae-4dac-b79e-5c805bf5c7c3-1780455465231.jpeg?fit=scale-down&width=900', price: 360000, available_stock: 8, sold: 0, total_stock: 8, has_wholesale: false, stock: 8, enabled: true, featuredRank: 1, duration: '1 tahun', warranty: '3 bulan', access: 'GPT Edu K12 + Codex', description: GPT_EDU_K12_DESCRIPTION, variants: [
  { id: '1y', label: '1 Tahun', price: 360000, duration: '1 tahun', warranty: '3 bulan' },
  { id: '2y', label: '2 Tahun', price: 675000, duration: '2 tahun', warranty: '8 bulan' }
] };

const fallbackCatalog = [...(window.VIOLA_PRODUCTS || []).flatMap((item) => item.id === 23843 ? [
  GPT_EDU_K12_PRODUCT,
  { ...item, title: 'CHATGPT GO 3 BULAN', price: 25000, stock: 6, available_stock: 6, has_wholesale: false, featuredRank: 1, duration: '3 bulan', warranty: 'Garansi penuh', access: 'ChatGPT Go', description: 'Akses ChatGPT Go selama 3 bulan untuk chat AI, menulis, belajar, merangkum, dan membantu pekerjaan harian. Produk mendapat garansi penuh selama masa aktif dengan mengikuti ketentuan penggunaan.' },
  { ...item, id: 90001, title: 'CHATGPT PLUS 1 BULAN - GARANSI 2 HARI', price: 30000, stock: 5, available_stock: 5, sold: 86, has_wholesale: false, featuredRank: 2, duration: '1 bulan', warranty: '2 hari', access: 'Akun privat + Codex', description: CHATGPT_PLUS_DESCRIPTION },
  { ...item, id: 90002, title: 'CHATGPT PLUS 1 BULAN - GARANSI 20 HARI', price: 56000, stock: 7, available_stock: 7, sold: 151, has_wholesale: false, featuredRank: 3, duration: '1 bulan', warranty: '20 hari', access: 'Akun privat + Codex', description: CHATGPT_PLUS_DESCRIPTION }
] : [applyCatalogDefaults({ ...item, stock: Math.min(item.available_stock || 0, 49), enabled: true, featuredRank: item.id === 46473 ? 4 : 99 }, true)]), DOLA_PRODUCT];
let products = fallbackCatalog.map((item) => ({ enabled: true, ...item }));
let validIds = new Set(products.map((item) => item.id));
const savedCart = JSON.parse(localStorage.getItem('jagoprem_cart') || '[]');
const state = {
  cart: savedCart.map((line) => typeof line === 'number' ? { id: line, quantity: 1 } : line).filter((line) => validIds.has(line.id)),
  user: null,
  stock: 'all',
  best: false,
  wholesale: false,
  category: '',
  chatMode: 'bot',
  orders: [],
  reviews: [],
  reviewFilter: 'all',
  deviceId: localStorage.getItem('jagoprem_device_id') || (crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`),
  chatId: localStorage.getItem('jagoprem_chat_id') || `chat-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`
};
localStorage.setItem('jagoprem_device_id', state.deviceId);

function setChatId(chatId) {
  const next = String(chatId || '').trim();
  if (!next || next === state.chatId) return;
  state.chatId = next;
  localStorage.setItem('jagoprem_chat_id', state.chatId);
}
localStorage.setItem('jagoprem_chat_id', state.chatId);

const productGrid = document.querySelector('#productGrid');
const cartDrawer = document.querySelector('#cartDrawer');
const overlay = document.querySelector('#overlay');
const modalLayer = document.querySelector('#modalLayer');
const modalContent = document.querySelector('#modalContent');
const toast = document.querySelector('#toast');
const chatPanel = document.querySelector('#chatPanel');
const chatMessages = document.querySelector('#chatMessages');
const chatInput = document.querySelector('#chatInput');

function rupiah(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); }
function productCategory(item) {
  if (item?.title?.includes('SALDO API')) return 'Developer API';
  const ai = /AI |GPT EDU|CHATGPT|CLAUDE|GROK|GEMINI|PERPLEXITY|KIRO|LEONARDO|KLING|DOLA/.test(item?.title || '');
  const streaming = /IQIYI|HBO|SPOTIFY|YOUTUBE|APPLE MUSIC|PRIME VIDEO|WETV|VIU|VIDIO|BSTATION|LOKLOK|DRAMABOX|REELSHORT/.test(item?.title || '');
  return ai ? 'AI & produktivitas' : streaming ? 'Hiburan premium' : 'Aplikasi premium';
}
function icons() { if (window.lucide) window.lucide.createIcons(); }
function notify(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 2400); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character])); }
function formatChatDateTime(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function messageBubble(text, role, createdAt = new Date().toISOString()) { return `<div class="message ${role}"><span class="message-text">${escapeHtml(text)}</span><time class="message-meta">${formatChatDateTime(createdAt)}</time></div>`; }
function resizeChatComposer() { const input = document.querySelector('#chatInput'); if (!input) return; input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 120)}px`; }
function getProduct(id) { return products.find((item) => item.id === Number(id)); }
function supportsOwnGmail(item) { return item?.title.includes('CHATGPT PLUS'); }
function productVariant(item, variantId) { return (item?.variants || []).find((variant) => variant.id === String(variantId || '')) || item?.variants?.[0] || null; }
function lineVariant(line) { return productVariant(getProduct(line.id), line.variantId); }
function lineTitle(line) { const item = getProduct(line.id); const variant = productVariant(item, line.variantId); return `${item?.title || line.id}${variant ? ` - ${variant.label}` : ''}`; }
function resellerMinimum(item) { return Number(item?.price || 0) > 20000 ? 3 : 5; }
function regularUnitPrice(line) { const item = getProduct(line.id); const variant = productVariant(item, line.variantId); return (variant?.price || item?.price || 0) + (supportsOwnGmail(item) && line.ownGmail ? 5000 : 0); }
function lineUnitPrice(line) { const price = regularUnitPrice(line); return line.reseller ? Math.round(price * 0.92) : price; }
function cartTotal() { return state.cart.reduce((total, line) => total + lineUnitPrice(line) * line.quantity, 0); }
function cartQuantityFor(id) { return state.cart.filter((line) => line.id === id).reduce((total, line) => total + line.quantity, 0); }
function persistCart() { localStorage.setItem('jagoprem_cart', JSON.stringify(state.cart)); updateCart(); }

function filteredProducts() {
  const keyword = document.querySelector('#searchInput').value.trim().toLowerCase();
  let list = products.filter((item) => item.title.toLowerCase().includes(keyword));
  if (state.stock === 'ready') list = list.filter((item) => item.stock > 0 && item.enabled);
  if (state.stock === 'empty') list = list.filter((item) => item.stock === 0 || !item.enabled);
  if (state.best) list = list.filter((item) => item.is_best_seller);
  if (state.wholesale) list = list.filter((item) => item.has_wholesale);
  if (state.category) list = list.filter((item) => productCategory(item) === state.category);
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
  if (state.category) labels.push(state.category);
  document.querySelector('#activeFilters').innerHTML = labels.map((label) => `<span class="filter-chip">${label}</span>`).join('');
  // Update active category button highlight
  document.querySelectorAll('[data-category]').forEach((btn) => btn.classList.toggle('active-cat', btn.dataset.category === state.category));
}

function updateCart() {
  const usedStock = new Map();
  state.cart = state.cart.filter((line) => validIds.has(line.id) && line.quantity > 0).map((line) => {
    const item = getProduct(line.id); const used = usedStock.get(line.id) || 0;
    const minQty = item.title.includes('SALDO API') ? 5 : 1;
    const minimum = line.reseller ? resellerMinimum(item) : minQty;
    const quantity = Math.min(Math.max(line.quantity, minimum), Math.max(0, item.stock - used));
    usedStock.set(line.id, used + quantity); return { ...line, quantity };
  }).filter((line) => line.quantity > 0);
  document.querySelector('#cartCount').textContent = state.cart.reduce((total, line) => total + line.quantity, 0);
  const items = state.cart.map((line, index) => ({ ...getProduct(line.id), ...line, index }));
  document.querySelector('#cartItems').innerHTML = items.length ? items.map((item) => {
    const minQty = item.title.includes('SALDO API') ? 5 : 1;
    const minLimit = item.reseller ? resellerMinimum(item) : minQty;
    return `<div class="cart-item"><img src="${item.thumbnail}" alt=""><div><h3>${lineTitle(item)}</h3>${item.ownGmail ? '<small class="cart-variant">Pakai Gmail sendiri (+Rp5.000)</small>' : ''}${item.reseller ? `<small class="cart-variant reseller">Harga reseller -8% Â· min. ${resellerMinimum(item)}</small>` : ''}<p>${item.reseller ? `<s>${rupiah(regularUnitPrice(item) * item.quantity)}</s> ` : ''}${rupiah(lineUnitPrice(item) * item.quantity)}</p><div class="cart-quantity"><button type="button" data-cart-minus="${item.index}" ${item.quantity <= minLimit ? 'disabled' : ''}>âˆ’</button><span>${item.quantity}</span><button type="button" data-cart-plus="${item.index}" ${cartQuantityFor(item.id) >= item.stock ? 'disabled' : ''}>+</button></div></div><button class="remove-item" type="button" data-remove="${item.index}" aria-label="Hapus ${lineTitle(item)}"><i data-lucide="trash-2"></i></button></div>`;
  }).join('') : '<div class="cart-empty"><i data-lucide="shopping-bag"></i><p>Keranjang masih kosong.</p></div>';
  document.querySelector('#cartTotal').textContent = rupiah(cartTotal());
  document.querySelector('#checkoutButton').disabled = !items.length;
  localStorage.setItem('jagoprem_cart', JSON.stringify(state.cart)); icons();
}

function openCart() { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); overlay.classList.add('show'); }
function closeCart() { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); overlay.classList.remove('show'); }
function openModal(html) { closeChat(); modalContent.innerHTML = html; modalLayer.classList.add('open'); modalLayer.setAttribute('aria-hidden', 'false'); icons(); }
function closeModal() { modalLayer.classList.remove('open'); modalLayer.setAttribute('aria-hidden', 'true'); }
function modalHead(title) { return `<div class="modal-head"><h2>${title}</h2><button class="icon-button" type="button" data-close-modal aria-label="Tutup"><i data-lucide="x"></i></button></div>`; }

const PRODUCT_COPY = [
  ['GPT EDU', 'Akses GPT Edu K12 untuk pelajar dan kebutuhan pendidikan K-12: bantu belajar, membuat materi, menyusun ringkasan, menulis, pendampingan tugas, dan support Codex untuk belajar coding.'],
  ['CHATGPT', 'Akses fitur premium ChatGPT untuk membantu menulis, merangkum, mencari ide, belajar, dan menyelesaikan pekerjaan lebih cepat.'],
  ['CLAUDE', 'Akses Claude Pro untuk percakapan AI, analisis dokumen, penulisan, coding, dan pekerjaan dengan konteks panjang.'],
  ['GROK', 'Akses Grok untuk mencari ide, menjawab pertanyaan, membuat konten, dan membantu pekerjaan berbasis AI.'],
  ['GEMINI', 'Akses Gemini Pro untuk riset, penulisan, analisis, produktivitas, dan integrasi layanan Google yang didukung.'],
  ['PERPLEXITY', 'Akses Perplexity Pro untuk pencarian dan riset berbantuan AI dengan jawaban yang menyertakan sumber.'],
  ['KIRO', 'Akses Kiro Power+ untuk mendukung coding, penyusunan spesifikasi, dan workflow pengembangan berbantuan AI.'],
  ['LEONARDO', 'Akses Leonardo AI untuk membuat dan mengolah gambar dengan fitur premium sesuai paket yang tersedia.'],
  ['KLING', 'Akses Kling AI untuk pembuatan video dan konten visual berbasis AI sesuai kuota pada akun.'],
  ['DOLA', 'Dola AI membantu percakapan, menulis, menerjemahkan, coding, mencari inspirasi, dan membahas berbagai topik dalam satu asisten chat.'],
  ['CANVA', 'Akses Canva Pro untuk template premium, elemen desain, background remover, dan fitur kolaborasi.'],
  ['CAPCUT', 'Akses CapCut Pro untuk efek, filter, template, alat editing, dan aset premium yang tersedia.'],
  ['ALIGHT', 'Akses Alight Motion Pro untuk editing video, motion graphics, efek visual, dan ekspor premium.'],
  ['PICSART', 'Akses Picsart Pro untuk editing foto, template, efek, font, dan aset premium.'],
  ['LIGHTROOM', 'Akses Lightroom Pro untuk preset, masking, color grading, dan fitur penyuntingan foto premium.'],
  ['CAMSCANNER', 'Akses CamScanner Premium untuk scan dokumen, OCR, ekspor, dan pengelolaan dokumen.'],
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
  ['AKUN KOPI', 'Produk akun digital bertema kopi. Detail akses dan cara penggunaan dikirimkan admin setelah pembayaran.'],
  ['SALDO API', 'Top-up saldo API JagoPrem LLM untuk mengakses 100+ model AI (GPT-4o, Claude, Gemini, DeepSeek, dll) melalui endpoint yang kompatibel OpenAI. Kurs tetap Rp12.300/$1. Akun dan API Key akan dibuatkan oleh admin setelah pembayaran dikonfirmasi.']
];
function productProfile(item) {
  const match = PRODUCT_COPY.find(([keyword]) => item.title.includes(keyword));
  const cat = productCategory(item);
  const description = item.description || match?.[1] || `Akses premium ${item.title} dengan detail penggunaan yang dikirimkan langsung oleh admin JagoPrem.`;
  const isDevApi = cat === 'Developer API';
  return {
    description,
    benefits: isDevApi
      ? [
          'Akses 100+ model AI terbaik dunia: GPT-4o, Claude, Gemini 2.5, DeepSeek R1, Llama, dan masih banyak lagi.',
          'Satu API Key untuk semua model — endpoint kompatibel 100% dengan OpenAI SDK.',
          'Kurs tetap Rp12.300/$1 — tidak ada biaya berlangganan bulanan.',
          'Saldo tidak ada expiry date selama akun JagoPrem LLM aktif.',
          'Admin JagoPrem LLM akan mengaktifkan akun dan memberikan API Key ke WhatsApp kamu setelah pembayaran dikonfirmasi.'
        ]
      : [match?.[1] || description, `Jenis akses ${item.access || 'mengikuti varian produk'} dengan masa aktif ${item.duration || 'sesuai paket'}.`, `Detail login, aktivasi, dan petunjuk penggunaan dikirim admin ke WhatsApp setelah pesanan diproses.`, supportsOwnGmail(item) ? 'Opsi Gmail sendiri tersedia di halaman detail produk.' : 'Tidak tersedia opsi email sendiri untuk produk ini.', `Garansi ${item.warranty || 'mengikuti ketentuan produk'} untuk kendala akses yang memenuhi syarat.`],
    category: cat,
    delivery: isDevApi ? 'API Key via WhatsApp' : 'Dikirim melalui WhatsApp',
    access: item.access || (isDevApi ? 'API Key JagoPrem LLM (api.jagoprem.shop)' : 'Sesuai varian yang tersedia'),
    duration: item.duration || (isDevApi ? 'Pay-as-you-go (tidak ada expiry)' : 'Sesuai varian'),
    warranty: item.warranty || (isDevApi ? 'Garansi saldo masuk' : 'Sesuai ketentuan produk'),
    terms: isDevApi
      ? [
          'Pastikan nomor WhatsApp yang kamu isi saat checkout sudah benar.',
          'Admin JagoPrem LLM akan mendaftarkan akun untukmu dan mengirim API Key via WhatsApp.',
          'Aktivasi API Key diproses admin dalam 1–3 jam di jam aktif (08.00–21.00 WIB).',
          'Saldo bersifat non-refundable setelah API Key diaktivasi.',
          'Satu akun (satu email) berlaku untuk satu API Key. Jika butuh lebih dari satu, infokan di catatan.',
          'Hubungi admin jika API Key belum diterima dalam 24 jam setelah pembayaran dikonfirmasi.'
        ]
      : ['Pastikan nomor WhatsApp aktif dan dapat menerima pesan.', `Masa aktif: ${item.duration || 'mengikuti varian yang dikirimkan admin'}. Garansi: ${item.warranty || 'mengikuti ketentuan produk'}.`, 'Ikuti petunjuk login dan penggunaan yang dikirimkan admin.', 'Jangan mengubah email, password, PIN, profil, atau keamanan akun tanpa izin admin.', 'Garansi berlaku untuk kendala akses produk, bukan gangguan perangkat, jaringan, atau pelanggaran petunjuk penggunaan.', 'Simpan bukti pembayaran dan rekam kendala saat pertama kali login untuk proses bantuan.']
  };
}

function detailModal(id) {
  const item = getProduct(id); if (!item) return;
  const profile = productProfile(item);
  const defaultVariant = productVariant(item);
  const resellerMin = resellerMinimum(item); const resellerAvailable = item.stock >= resellerMin && item.enabled;
  const isSaldoApi = item.title.includes('SALDO API');
  const minQty = isSaldoApi ? 5 : 1;
  openModal(`${modalHead('Detail produk')}<div class="modal-body product-detail-body"><div class="detail-layout"><div class="detail-media"><img class="detail-image" src="${item.thumbnail}" alt="${item.title}"><div class="detail-facts"><div><i data-lucide="clock-3"></i><span>Masa aktif<b id="detailDuration">${defaultVariant?.duration || profile.duration}</b></span></div><div><i data-lucide="shield-check"></i><span>Garansi<b id="detailWarranty">${defaultVariant?.warranty || profile.warranty}</b></span></div><div><i data-lucide="key-round"></i><span>Akses produk<b>${profile.access}</b></span></div></div></div><div class="detail-content"><h2>${item.title}</h2><div class="detail-price-row"><strong class="detail-price" id="detailPrice">${rupiah(defaultVariant?.price || item.price)}</strong><s id="detailRegularPrice" hidden></s></div><div class="detail-tags">${item.featuredRank < 5 ? '<span>Rekomendasi</span>' : item.is_best_seller ? '<span>Terlaris</span>' : ''}<span>${item.stock && item.enabled ? 'Ready stock' : 'Stok habis'}</span></div><div class="detail-info"><div><span>Kategori</span><b>${profile.category}</b></div><div><span>Pengiriman</span><b>${profile.delivery}</b></div><div><span>Stok tersedia</span><b>${item.enabled ? item.stock : 0}</b></div><div><span>Terjual</span><b>${item.sold}</b></div></div>${item.variants?.length ? `<div class="variant-picker"><span>Pilih durasi</span>${item.variants.map((variant, index) => `<label><input type="radio" name="detailVariant" value="${variant.id}" ${index === 0 ? 'checked' : ''}><b>${variant.label}</b><small>${rupiah(variant.price)} Â· Garansi ${variant.warranty}</small></label>`).join('')}</div>` : ''}<div class="detail-tabs"><button class="active" type="button" data-detail-tab="description">Deskripsi</button><button type="button" data-detail-tab="terms">S & K</button></div><div class="detail-tab-panel" data-detail-panel="description"><p>${profile.description}</p><ul class="product-benefits">${profile.benefits.map((benefit) => `<li><i data-lucide="check-circle-2"></i><span>${benefit}</span></li>`).join('')}</ul></div><div class="detail-tab-panel" data-detail-panel="terms" hidden><ol>${profile.terms.map((term) => `<li>${term}</li>`).join('')}</ol></div>${supportsOwnGmail(item) ? '<label class="detail-variant"><input id="detailOwnGmail" type="checkbox"><span><b>Pakai Gmail sendiri</b><small>Tambahan Rp5.000 per akun</small></span></label>' : ''}<label class="detail-variant reseller-option ${resellerAvailable ? '' : 'disabled'}"><input id="detailReseller" type="checkbox" ${resellerAvailable ? '' : 'disabled'}><span><b>Harga reseller Â· diskon 8%</b><small>${resellerAvailable ? `Minimal ${resellerMin} item. Harga menjadi ${rupiah(Math.round((defaultVariant?.price || item.price) * 0.92))} per item.` : `Stok belum cukup untuk minimum ${resellerMin} item.`}</small></span></label><div class="detail-quantity"><span>Jumlah pembelian<small id="quantityHint">${isSaldoApi ? 'Minimal 5 dollar' : `Maksimal ${item.stock} sesuai stok`}</small></span><div class="quantity-stepper"><button type="button" data-detail-minus disabled aria-label="Kurangi jumlah"><i data-lucide="minus"></i></button><input id="detailQuantity" type="number" inputmode="numeric" min="${minQty}" max="${item.stock}" value="${minQty}" aria-label="Jumlah pembelian" ${item.stock && item.enabled ? '' : 'disabled'}><button type="button" data-detail-plus ${item.stock > minQty && item.enabled ? '' : 'disabled'} aria-label="Tambah jumlah"><i data-lucide="plus"></i></button></div></div><div class="detail-actions"><button class="detail-buy secondary" type="button" data-add-detail="${item.id}" ${item.stock && item.enabled ? '' : 'disabled'}>Masukkan keranjang</button><button class="detail-buy" type="button" data-buy-now="${item.id}" ${item.stock && item.enabled ? '' : 'disabled'}>Beli sekarang</button></div></div></div></div>`);
}

function authModal(mode = 'login') {
  const register = mode === 'register';
  openModal(`${modalHead('Akun JagoPrem')}<div class="modal-body auth-modal-body"><div class="auth-hero"><div class="auth-hero-bg"></div><div class="auth-hero-content"><div class="auth-logo-mark"><i></i><b></b></div><h2>JagoPrem</h2><p>Akun digital premium, harga terjangkau</p></div></div><div class="auth-form-section"><div class="auth-tabs"><button class="${register ? '' : 'active'}" data-auth-tab="login" type="button">Masuk</button><button class="${register ? 'active' : ''}" data-auth-tab="register" type="button">Daftar</button></div><form id="authForm" data-mode="${mode}">${register ? '<div class="form-group"><label>NAMA LENGKAP</label><div class="input-icon-wrap"><i data-lucide="user"></i><input name="name" required minlength="2" maxlength="80" autocomplete="name" placeholder="Nama kamu"></div></div>' : ''}<div class="form-group"><label>EMAIL</label><div class="input-icon-wrap"><i data-lucide="mail"></i><input name="email" type="email" required autocomplete="email" placeholder="nama@email.com"></div></div><div class="form-group"><label>PASSWORD</label><div class="input-icon-wrap"><i data-lucide="lock"></i><input name="password" type="password" minlength="8" required autocomplete="current-password" placeholder="Minimal 8 karakter"></div></div><button class="submit-button auth-submit" type="submit"><span>${register ? 'Buat akun gratis' : 'Masuk ke akun'}</span></button></form><div class="auth-divider"><span>atau</span></div><button class="google-auth-btn" id="googleAuthBtn" type="button"><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Lanjutkan dengan Google</button><div id="googleAuthError" style="display:none;color:var(--error);font-size:0.85rem;margin-top:10px;justify-content:center;text-align:center"></div><p class="auth-footer-note">Akun tersimpan aman dan dapat dipakai di perangkat lain.</p></div></div>`);
  document.querySelector('#googleAuthBtn')?.addEventListener('click', function () {
    const btn = this;
    const isRegisterMode = document.querySelector('[data-auth-tab="register"]')?.classList.contains('active');
    const label = isRegisterMode ? 'Daftar' : 'Masuk';
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="animation:spin 1s linear infinite;flex-shrink:0"><circle cx="12" cy="12" r="10" stroke="#dadce0" stroke-width="2.5"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4" stroke-width="2.5" stroke-linecap="round"/></svg>${label} melalui Google...`;
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      const errEl = document.getElementById('googleAuthError');
      if (errEl) { errEl.textContent = `${label} melalui Google sedang mengalami gangguan. Silakan gunakan email & password.`; errEl.style.display = 'flex'; }
    }, 3000);
  });
}

function accountModal() {
  if (!state.user) return authModal();
  openModal(`${modalHead('Akun saya')}<div class="modal-body"><div class="account-card"><strong>${escapeHtml(state.user.name)}</strong><span>${escapeHtml(state.user.email)}</span></div><button class="logout-button" id="logoutButton" type="button">Keluar dari akun</button></div>`);
}

function checkoutModal() {
  closeCart();
  if (!state.user) { authModal('login'); notify('Masuk dulu sebelum membuat pesanan.'); return; }
  const cartItemsHtml = state.cart.map((line) => `<div><span>${lineTitle(line)}${line.ownGmail ? '<small>Pakai Gmail sendiri</small>' : ''} x ${line.quantity}</span><b>${rupiah(lineUnitPrice(line) * line.quantity)}</b></div>`).join('');
  const hasDevApi = state.cart.some((line) => productCategory(getProduct(line.id)) === 'Developer API');
  const devApiField = hasDevApi ? `
    <div class="form-group">
      <label>EMAIL UNTUK AKUN JAGOPREM LLM <span style="color:var(--accent)">*WAJIB</span></label>
      <input name="llm_email" type="email" required value="${escapeHtml(state.user?.email || '')}" placeholder="Contoh: emailkamu@domain.com">
      <p class="field-help">Email ini akan didaftarkan oleh admin sebagai identitas akun JagoPrem LLM kamu. API Key akan dikirimkan ke WhatsApp.</p>
    </div>
  ` : '';
  openModal(`${modalHead('Checkout')}<div class="modal-body"><div class="order-summary">${cartItemsHtml}<div><span>Biaya admin</span><b>${rupiah(99)}</b></div><div class="total" id="checkoutTotalRow"><span>Total sebelum voucher</span><b>${rupiah(cartTotal() + 99)}</b></div></div><form id="checkoutForm"><div class="form-group voucher-field"><label>KODE VOUCHER (OPSIONAL)</label><div class="voucher-input-row"><div class="voucher-input-wrap"><i data-lucide="ticket-percent"></i><input id="voucherInput" name="voucherCode" autocomplete="off" maxlength="32" placeholder="Contoh: SPESIALAI07"></div><button class="voucher-apply-btn" type="button" id="applyVoucher">Gunakan</button></div><div id="voucherFeedback" class="voucher-feedback"></div><p class="field-help" id="voucherHint">Voucher SPESIALAI07: diskon 16% untuk minimal 2 produk AI yang sama</p></div><div class="form-group"><label>NAMA PENERIMA</label><input name="name" required value="${escapeHtml(state.user?.name || '')}" placeholder="Nama kamu"></div><div class="form-group"><label>NOMOR WHATSAPP</label><input name="whatsapp" inputmode="tel" required pattern="\\+?[0-9]{9,15}" placeholder="Contoh: 081234567890 atau +6281234567890"><p class="field-help">Nomor ini dipakai admin untuk menghubungi dan mengirim detail produk.</p></div>${devApiField}<div class="form-group"><label>CATATAN (OPSIONAL)</label><textarea name="note" placeholder="Permintaan atau informasi tambahan"></textarea></div><button class="submit-button" type="submit">Lanjut ke pembayaran</button></form></div>`);
  // Voucher apply button handler
  document.querySelector('#applyVoucher')?.addEventListener('click', async () => {
    const code = document.querySelector('#voucherInput')?.value.trim();
    const feedback = document.querySelector('#voucherFeedback');
    const btn = document.querySelector('#applyVoucher');
    if (!feedback) return;
    if (!code) { feedback.className = 'voucher-feedback error'; feedback.innerHTML = '<i data-lucide="alert-circle"></i> Masukkan kode voucher dulu.'; icons(); return; }
    btn.disabled = true; btn.textContent = 'Mengecek...';
    feedback.className = 'voucher-feedback'; feedback.innerHTML = '';
    try {
      const res = await fetch('/api/vouchers/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, items: state.cart }) });
      const data = await res.json();
      if (!res.ok) { feedback.className = 'voucher-feedback error'; feedback.innerHTML = `<i data-lucide="alert-circle"></i> ${escapeHtml(data.error || 'Voucher tidak valid.')}`; }
      else { feedback.className = 'voucher-feedback success'; feedback.innerHTML = `<i data-lucide="check-circle-2"></i> Diskon <strong>${rupiah(data.discount)}</strong> berhasil diterapkan!`; document.querySelector('#checkoutTotalRow')?.querySelector('span')?.textContent && (document.querySelector('#checkoutTotalRow b').textContent = rupiah(cartTotal() + 99 - data.discount)); }
    } catch { feedback.className = 'voucher-feedback error'; feedback.innerHTML = '<i data-lucide="alert-circle"></i> Gagal menghubungi server. Coba lagi.'; }
    btn.disabled = false; btn.textContent = 'Gunakan'; icons();
  });
}

function paymentModal(customer, order) {
  if (order.status === 'expired') {
    openModal(`${modalHead('Pesanan Belum Selesai')}<div class="modal-body"><div class="order-alert expired-alert"><div class="alert-icon"><i data-lucide="clock-alert"></i></div><h3>Waktu Pembayaran Habis</h3><p>Pesanan <strong>${order.id}</strong> belum diselesaikan. Harap lakukan pembayaran segera agar bot kami langsung menghubungi kamu.</p><button class="submit-button" type="button" data-close-modal>Tutup &amp; Pesan Ulang</button></div></div>`);
    icons(); return;
  }
  if (order.status === 'cancelled') {
    openModal(`${modalHead('Pesanan Dibatalkan')}<div class="modal-body"><div class="order-alert cancelled-alert"><div class="alert-icon"><i data-lucide="x-circle"></i></div><h3>Pesanan Kamu Gagal</h3><p>Pesanan <strong>${order.id}</strong> telah dibatalkan. Harap melakukan pemesanan ulang.</p><p class="alert-refund"><i data-lucide="wallet"></i> Pembayaran yang sudah masuk akan otomatis dikembalikan ke rekening kamu dalam <strong>1Ã—24 jam</strong>.</p><button class="submit-button" type="button" data-close-modal>Tutup &amp; Pesan Ulang</button></div></div>`);
    icons(); return;
  }
  const total = order.total; const orderId = order.id;
  const payload = QrisTools.dynamic(STORE_CONFIG.staticQris, total);
  state.orders = [order, ...state.orders.filter((item) => item.id !== order.id)];
  openModal(`${modalHead('Pembayaran QRIS')}<div class="modal-body payment"><span class="payment-status">${order.status === 'pending' ? 'MENUNGGU PEMBAYARAN' : order.status.toUpperCase()}</span><h2>Selesaikan pembayaran</h2><p>ID Pesanan: ${orderId}</p>${order.status === 'pending' && order.expiresAt ? `<div class="payment-expiry"><i data-lucide="timer"></i> Stok ditahan sampai ${new Date(order.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>` : ''}<div class="payment-card"><div class="qr-box" id="dynamicQr"></div><div class="payment-breakdown"><div><span>Subtotal</span><b>${rupiah(order.subtotal)}</b></div>${order.discount ? `<div class="discount-line"><span>Voucher ${escapeHtml(order.voucher?.code || '')}</span><b>- ${rupiah(order.discount)}</b></div>` : ''}<div><span>Biaya admin</span><b>${rupiah(order.adminFee)}</b></div><div class="grand-total"><span>Total pembayaran</span><b>${rupiah(total)}</b></div></div><div class="payment-assurance"><i data-lucide="message-circle-check"></i><span>Setelah pembayaran selesai, Anda akan dihubungi langsung oleh admin melalui WhatsApp.</span></div></div><button class="confirm-button" id="confirmPayment" data-order-id="${order.id}" type="button">Pembayaran sudah selesai</button></div>`);
  new QRCode(document.querySelector('#dynamicQr'), { text: payload, width: 238, height: 238, correctLevel: QRCode.CorrectLevel.M });
  icons();
}

function orderMessage(order) {
  const lines = order.items.map((line) => `- ${line.title || getProduct(line.id)?.title || line.id} x${line.quantity}${line.reseller ? ' (Reseller -8%)' : ''}${line.ownGmail ? ' (Gmail sendiri)' : ''} = ${rupiah(line.lineTotal || lineUnitPrice(line) * line.quantity)}`);
  return `Konfirmasi pembayaran JagoPrem\nID: ${order.id}\nWaktu pesan: ${new Date(order.createdAt).toLocaleString('id-ID')}\n\nDetail pesanan:\n${lines.join('\n')}\n\nSubtotal: ${rupiah(order.subtotal)}${order.discount ? `\nVoucher ${order.voucher?.code || ''}: -${rupiah(order.discount)}` : ''}\nBiaya admin: ${rupiah(order.adminFee)}\nTotal: ${rupiah(order.total)}\n\nSaya sudah menyelesaikan pembayaran QRIS untuk pesanan ini.`;
}

async function historyModal() {
  if (!state.user) { authModal('login'); notify('Masuk untuk melihat riwayat pesanan.'); return; }
  openModal(`${modalHead('Riwayat pesanan')}<div class="modal-body"><div class="history-loading">Memuat pesanan...</div></div>`);
  try {
    const response = await fetch('/api/orders/me', { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Riwayat gagal dimuat.'); state.orders = result.orders || []; state.reviews = result.reviews || [];
    modalContent.innerHTML = `${modalHead('Riwayat pesanan')}<div class="modal-body order-history">${state.orders.length ? state.orders.map((order) => `<article class="history-order"><div class="history-order-head"><span><b>${order.id}</b><small>${new Date(order.createdAt).toLocaleString('id-ID')}</small></span><em class="order-status ${order.status}">${order.status}</em></div>${order.status === 'pending' && order.expiresAt ? `<p class="reservation-note">Reservasi stok berakhir ${new Date(order.expiresAt).toLocaleString('id-ID')}</p>` : ''}<div class="history-lines">${order.items.map((line) => `<div><span>${escapeHtml(line.title || getProduct(line.id)?.title || line.id)} Ã— ${line.quantity}${line.reseller ? '<small>Reseller -8%</small>' : ''}</span><b>${rupiah(line.lineTotal || lineUnitPrice(line) * line.quantity)}</b></div>`).join('')}</div><div class="history-total"><span>Total termasuk admin</span><b>${rupiah(order.total)}</b></div><div class="history-actions">${['pending', 'paid'].includes(order.status) ? `<button type="button" data-reopen-payment="${order.id}"><i data-lucide="qr-code"></i> Lihat QR & total</button>` : ''}<button type="button" data-chat-order="${order.id}"><i data-lucide="message-circle"></i> Chat admin</button></div>${order.status === 'completed' ? `<div class="review-order-actions">${order.items.map((line) => state.reviews.some((review) => review.orderId === order.id && review.productId === line.id) ? `<span><i data-lucide="badge-check"></i> ${escapeHtml(line.title || getProduct(line.id)?.title)} sudah diulas</span>` : `<button type="button" data-review-order="${order.id}" data-review-product="${line.id}"><i data-lucide="star"></i> Ulas ${escapeHtml(line.title || getProduct(line.id)?.title)}</button>`).join('')}</div>` : ''}</article>`).join('') : '<div class="cart-empty"><i data-lucide="receipt-text"></i><p>Belum ada pesanan dari akun ini.</p></div>'}</div>`; icons();
  } catch (error) { notify(error.message); closeModal(); }
}

function reviewStars(rating) { return `<span class="review-stars" aria-label="${rating} dari 5 bintang">${Array.from({ length: 5 }, (_, index) => `<i data-lucide="star" class="${index < rating ? 'filled' : ''}"></i>`).join('')}</span>`; }
function renderReviewsContent(reviews) {
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const counts = [5, 4, 3, 2, 1].reduce((result, rating) => ({ ...result, [rating]: reviews.filter((review) => review.rating === rating).length }), {});
  const visible = state.reviewFilter === 'all' ? reviews : reviews.filter((review) => review.rating === Number(state.reviewFilter));
  return `${modalHead('Ulasan pembeli')}<div class="modal-body reviews-page"><div class="review-summary"><strong>${average.toFixed(1)}</strong>${reviewStars(Math.round(average))}<span>${reviews.length} ulasan produk</span></div><div class="review-notice"><i data-lucide="info"></i><span>Pembeli bisa memberi ulasan dari menu Riwayat setelah pesanan berstatus selesai. Setiap produk dalam pesanan hanya bisa diulas satu kali.</span></div><div class="review-filters"><button class="${state.reviewFilter === 'all' ? 'active' : ''}" type="button" data-review-filter="all">Semua</button>${[5, 4, 3, 2, 1].map((rating) => `<button class="${state.reviewFilter === String(rating) ? 'active' : ''}" type="button" data-review-filter="${rating}">${rating} bintang <span>${counts[rating]}</span></button>`).join('')}</div><div class="review-list">${visible.length ? visible.map((review) => { const product = getProduct(review.productId); return `<article class="review-card"><div class="review-card-head"><div class="review-avatar">${escapeHtml(review.customerName || 'P').charAt(0)}</div><span><b>${escapeHtml(review.customerName || 'Pembeli')}</b><small>${new Date(review.createdAt).toLocaleDateString('id-ID')} Â· ${escapeHtml(product?.title || 'Produk JagoPrem')}</small></span></div>${reviewStars(review.rating)}<p>${escapeHtml(review.comment)}</p></article>`; }).join('') : '<div class="cart-empty"><i data-lucide="star"></i><p>Belum ada ulasan dengan rating ini.</p></div>'}</div></div>`;
}
async function reviewsModal() {
  openModal(`${modalHead('Ulasan pembeli')}<div class="modal-body"><div class="history-loading">Memuat ulasan...</div></div>`);
  try { const response = await fetch('/api/reviews', { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Ulasan gagal dimuat.'); state.reviews = result.reviews || []; state.reviewFilter = 'all'; modalContent.innerHTML = renderReviewsContent(state.reviews); icons(); } catch (error) { notify(error.message); closeModal(); }
}

function reviewForm(orderId, productId) { const product = getProduct(productId); openModal(`${modalHead('Tulis ulasan')}<div class="modal-body"><div class="review-product"><img src="${product.thumbnail}" alt=""><span><small>PRODUK YANG DIULAS</small><b>${escapeHtml(product.title)}</b></span></div><form id="reviewForm" data-order-id="${orderId}" data-product-id="${productId}"><fieldset class="rating-field"><legend>BERI BINTANG</legend>${[5,4,3,2,1].map((rating) => `<label><input type="radio" name="rating" value="${rating}" required><span>${rating}<i data-lucide="star"></i></span></label>`).join('')}</fieldset><div class="form-group"><label>KOMENTAR</label><textarea name="comment" minlength="8" maxlength="600" required placeholder="Ceritakan pengalamanmu menggunakan produk ini..."></textarea></div><button class="submit-button" type="submit">Kirim ulasan</button></form></div>`); }

function chatWelcome() { return '<div class="message bot">Hai! Saya bisa bantu cek stok, harga, varian, garansi, pembayaran, dan cara pemesanan.</div><div class="quick-chat"><button data-question="Produk apa yang ready?" type="button">Cek stok</button><button data-question="Tampilkan paket ChatGPT" type="button">Paket ChatGPT</button><button data-question="Bagaimana cara pesan?" type="button">Cara pesan</button><button data-question="Bagaimana pembayaran QRIS?" type="button">Pembayaran</button><button data-question="Bagaimana garansi produk?" type="button">Garansi</button><button data-question="Apa itu Gmail sendiri?" type="button">Gmail sendiri</button><button data-question="Bagaimana produk dikirim?" type="button">Pengiriman</button><button data-admin type="button">Chat admin</button></div>'; }
function openChat() { chatPanel.classList.add('open'); chatPanel.setAttribute('aria-hidden', 'false'); requestAnimationFrame(() => { chatInput?.focus(); resizeChatComposer(); }); chatMessages.scrollTop = chatMessages.scrollHeight; }
function closeChat() { chatPanel.classList.remove('open'); chatPanel.setAttribute('aria-hidden', 'true'); }
function addMessage(text, role) { chatMessages.insertAdjacentHTML('beforeend', messageBubble(text, role)); chatMessages.scrollTop = chatMessages.scrollHeight; }
function contactAdmin() { switchChatMode('admin'); }
function customerIdentity() { const last = JSON.parse(localStorage.getItem('jagoprem_last_order') || 'null'); return last?.customer || state.user || {}; }
async function loadAdminChat() {
  try {
    const response = await fetch(`/api/chat/${state.chatId}`, { cache: 'no-store' });
    const chat = await response.json();
    if (chat?.id) setChatId(chat.id);
    if (state.chatMode !== 'admin') return;
    chatMessages.innerHTML = chat.messages?.length ? chat.messages.map((item) => messageBubble(item.text, item.sender === 'admin' ? 'bot' : 'user', item.createdAt)).join('') : '<div class="message bot">Kamu sudah masuk ke chat admin. Tulis pesan dan admin akan membalas dari dashboard.</div>';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // Mark as read
    fetch(`/api/chat/${state.chatId}/read`, { method: 'POST' }).catch(()=>{});
    updateChatBadge(0);
  } catch {}
}
function switchChatMode(mode) {
  state.chatMode = mode;
  document.querySelectorAll('[data-chat-mode]').forEach((button) => button.classList.toggle('active', button.dataset.chatMode === mode));
  document.querySelector('#chatTitle').textContent = mode === 'admin' ? 'Admin JagoPrem' : 'Asisten JagoPrem';
  if (mode === 'admin') loadAdminChat(); else chatMessages.innerHTML = chatWelcome(); resizeChatComposer();
}
async function sendAdminMessage(message) { const response = await fetch(`/api/chat/${state.chatId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, customer: customerIdentity() }) }); const chat = await response.json().catch(() => null); if (!response.ok) throw new Error(chat?.error || 'Pesan gagal dikirim.'); if (chat?.id) setChatId(chat.id); await loadAdminChat(); }
function localBotAnswer(question) {
  const text = question.toLowerCase();
  if (text.includes('stok') || text.includes('ready')) { const ready = products.filter((item) => item.stock > 0 && item.enabled).sort((a, b) => a.featuredRank - b.featuredRank || b.sold - a.sold).slice(0, 6); return `Produk ready yang direkomendasikan:\n${ready.map((item) => `• ${item.title} — ${rupiah(item.price)} (sisa ${item.stock})`).join('\n')}`; }
  if (text.includes('chatgpt')) { const matches = products.filter((item) => item.title.includes('CHATGPT')); return `Pilihan ChatGPT saat ini:\n${matches.map((item) => `• ${item.title} — ${rupiah(item.price)} (sisa ${item.stock})`).join('\n')}\n\nChatGPT Plus berupa akun privat, bukan sharing, dan mendukung Codex.`; }
  if (text.includes('gmail')) return 'Opsi “Pakai Gmail sendiri” tersedia untuk ChatGPT Plus dengan tambahan Rp5.000 per akun. Aktifkan opsi tersebut di halaman detail produk sebelum memasukkannya ke keranjang.';
  if (text.includes('garansi')) return 'Masa garansi berbeda pada setiap produk. Buka detail produk untuk melihat durasi dan syaratnya. Simpan bukti pembayaran serta rekam kendala saat pertama kali login.';
  if (text.includes('kirim') || text.includes('pengiriman')) return 'Setelah pembayaran selesai, admin akan menghubungi nomor WhatsApp yang kamu isi saat checkout dan mengirimkan detail akses produk.';
  if (text.includes('bayar') || text.includes('qris')) return 'Pembayaran menggunakan QRIS. Setelah checkout, sistem membuat QR sesuai nominal total belanja termasuk biaya admin Rp99. Scan QR tersebut lalu tekan “Pembayaran sudah selesai”.';
  if (text.includes('pesan') || text.includes('telegram') || text.includes('whatsapp')) return 'Cara pesan: cari produk, buka detail, pilih varian dan jumlah, masukkan ke keranjang, isi data checkout, lalu bayar melalui QRIS. Stok web, Telegram, dan WhatsApp memakai sumber data yang sama.';
  if (text.includes('privat') || text.includes('sharing') || text.includes('codex')) return 'Paket ChatGPT Plus JagoPrem berupa akun privat, bukan akun sharing, mendukung Codex, dan diaktivasi menggunakan payment credit card.';
  if (text.includes('admin') || text.includes('manusia')) return 'Pilih mode "Chat Admin". Pesanmu akan masuk ke dashboard admin JagoPrem.';
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
document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
  state.category = button.dataset.category || '';
  document.querySelector('#searchInput').value = '';
  renderProducts();
  document.querySelector('#products').scrollIntoView();
}));
document.querySelectorAll('[data-search]').forEach((button) => button.addEventListener('click', () => { document.querySelector('#searchInput').value = button.dataset.search; state.category = ''; renderProducts(); document.querySelector('#products').scrollIntoView(); }));
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
  carousel.querySelectorAll('[data-search-product]').forEach((button) => button.addEventListener('click', () => { document.querySelector('#searchInput').value = button.dataset.searchProduct.toLowerCase(); renderProducts(); document.querySelector('#products').scrollIntoView(); }));
  carousel.querySelector('[data-bot-order]').addEventListener('click', () => { openChat(); switchChatMode('bot'); chatMessages.innerHTML = '<div class="message bot">JagoPrem Bot siap membantu kamu mencari produk dan memulai pesanan dari Telegram, WhatsApp, atau web.</div><div class="quick-chat"><button data-question="Pesan lewat Telegram" type="button">Telegram</button><button data-question="Pesan lewat WhatsApp" type="button">WhatsApp</button><button data-question="Cari paket ChatGPT" type="button">Cari ChatGPT</button><button data-admin type="button">Chat admin</button></div>'; });
  showSlide(0); startCarousel();
}
document.querySelector('#resetFilter').addEventListener('click', () => { state.stock = 'all'; state.best = false; state.wholesale = false; state.category = ''; document.querySelector('input[name="stock"][value="all"]').checked = true; document.querySelector('#bestFilter').checked = false; document.querySelector('#wholesaleFilter').checked = false; document.querySelector('#searchInput').value = ''; renderProducts(); });
productGrid.addEventListener('click', (event) => { const add = event.target.closest('[data-add]'); if (add) { event.stopPropagation(); addToCart(Number(add.dataset.add), 1); return; } const card = event.target.closest('[data-detail]'); if (card) detailModal(card.dataset.detail); });
productGrid.addEventListener('keydown', (event) => { const card = event.target.closest('[data-detail]'); if (card && (event.key === 'Enter' || event.key === ' ')) detailModal(card.dataset.detail); });
document.querySelector('#cartItems').addEventListener('click', (event) => { const remove = event.target.closest('[data-remove]'); const plus = event.target.closest('[data-cart-plus]'); const minus = event.target.closest('[data-cart-minus]'); if (remove) state.cart.splice(Number(remove.dataset.remove), 1); if (plus) { const line = state.cart[Number(plus.dataset.cartPlus)]; if (cartQuantityFor(line.id) < getProduct(line.id).stock) line.quantity += 1; } if (minus) { const line = state.cart[Number(minus.dataset.cartMinus)]; const minimum = line.reseller ? resellerMinimum(getProduct(line.id)) : 1; if (line.quantity > minimum) line.quantity -= 1; } if (remove || plus || minus) persistCart(); });
document.querySelector('#cartButton').addEventListener('click', openCart); document.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', closeCart)); overlay.addEventListener('click', closeCart); document.querySelector('#checkoutButton').addEventListener('click', checkoutModal); document.querySelector('#accountButton').addEventListener('click', accountModal);
document.querySelector('#sideAccount').addEventListener('click', accountModal);
document.querySelector('#menuButton').addEventListener('click', () => { document.querySelector('#sidebar').classList.toggle('open'); document.querySelector('#sidebarOverlay').classList.toggle('show'); });
document.querySelector('#sidebarOverlay').addEventListener('click', () => { document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); });
document.querySelectorAll('.side-nav a').forEach((link) => link.addEventListener('click', () => { document.querySelectorAll('.side-nav a').forEach((item) => item.classList.remove('active')); link.classList.add('active'); document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); }));
document.querySelector('#chatBubble').addEventListener('click', openChat); document.querySelector('#openChatSide').addEventListener('click', openChat); document.querySelector('#closeChat').addEventListener('click', closeChat);
chatInput?.addEventListener('input', resizeChatComposer);
chatInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); document.querySelector('#chatForm').requestSubmit(); } });
document.querySelectorAll('[data-chat-mode]').forEach((button) => button.addEventListener('click', () => switchChatMode(button.dataset.chatMode)));
chatMessages.addEventListener('click', (event) => { const question = event.target.closest('[data-question]'); if (question) { chatInput.value = question.dataset.question; resizeChatComposer(); document.querySelector('#chatForm').requestSubmit(); } if (event.target.closest('[data-admin]')) contactAdmin(); });
document.querySelector('#chatForm').addEventListener('submit', async (event) => { event.preventDefault(); const input = chatInput; const question = input.value.trim(); if (!question) return; input.value = ''; resizeChatComposer(); if (state.chatMode === 'admin') { try { await sendAdminMessage(question); } catch (error) { notify(error.message); } return; } addMessage(question, 'user'); const answer = await askBot(question); addMessage(answer, 'bot'); });

function setDetailQuantity(value) {
  const input = document.querySelector('#detailQuantity'); if (!input) return;
  const min = Number(input.min) || 1; const max = Number(input.max) || 1; const quantity = Math.max(min, Math.min(Number(value) || min, max));
  input.value = quantity;
  const minus = document.querySelector('[data-detail-minus]'); const plus = document.querySelector('[data-detail-plus]');
  if (minus) minus.disabled = quantity <= min; if (plus) plus.disabled = quantity >= max;
}

function selectedDetailVariant(item) { return productVariant(item, document.querySelector('input[name="detailVariant"]:checked')?.value); }
function updateDetailPricing() {
  const item = getProduct(document.querySelector('[data-add-detail]')?.dataset.addDetail); if (!item) return;
  const variant = selectedDetailVariant(item);
  const ownGmail = Boolean(document.querySelector('#detailOwnGmail')?.checked); const reseller = Boolean(document.querySelector('#detailReseller')?.checked); const regular = (variant?.price || item.price) + (ownGmail ? 5000 : 0);
  document.querySelector('#detailPrice').textContent = rupiah(reseller ? Math.round(regular * 0.92) : regular);
  const crossed = document.querySelector('#detailRegularPrice'); if (crossed) { crossed.hidden = !reseller; crossed.textContent = rupiah(regular); }
  const duration = document.querySelector('#detailDuration'); if (duration && variant) duration.textContent = variant.duration;
  const warranty = document.querySelector('#detailWarranty'); if (warranty && variant) warranty.textContent = variant.warranty;
}

modalLayer.addEventListener('click', async (event) => {
  if (event.target === modalLayer || event.target.closest('[data-close-modal]')) closeModal();
  if (event.target.closest('[data-detail-minus]')) setDetailQuantity(Number(document.querySelector('#detailQuantity').value) - 1);
  if (event.target.closest('[data-detail-plus]')) setDetailQuantity(Number(document.querySelector('#detailQuantity').value) + 1);
  const detailTab = event.target.closest('[data-detail-tab]'); if (detailTab) { document.querySelectorAll('[data-detail-tab]').forEach((button) => button.classList.toggle('active', button === detailTab)); document.querySelectorAll('[data-detail-panel]').forEach((panel) => { panel.hidden = panel.dataset.detailPanel !== detailTab.dataset.detailTab; }); }
  const authTab = event.target.closest('[data-auth-tab]'); if (authTab) authModal(authTab.dataset.authTab);
  const addDetail = event.target.closest('[data-add-detail]'); if (addDetail) { const product = getProduct(addDetail.dataset.addDetail); const quantity = Number(document.querySelector('#detailQuantity').value); addToCart(Number(addDetail.dataset.addDetail), quantity, Boolean(document.querySelector('#detailOwnGmail')?.checked), Boolean(document.querySelector('#detailReseller')?.checked), selectedDetailVariant(product)?.id || ''); closeModal(); openCart(); }
  const buyNow = event.target.closest('[data-buy-now]'); if (buyNow) { const id = Number(buyNow.dataset.buyNow); const product = getProduct(id); const reseller = Boolean(document.querySelector('#detailReseller')?.checked); const minimum = reseller ? resellerMinimum(product) : 1; const quantity = Math.max(minimum, Math.min(Number(document.querySelector('#detailQuantity').value) || minimum, product.stock)); state.cart = [{ id, quantity, ownGmail: Boolean(document.querySelector('#detailOwnGmail')?.checked), reseller, variantId: selectedDetailVariant(product)?.id || '' }]; persistCart(); closeModal(); checkoutModal(); }
  if (event.target.closest('#logoutButton')) { await fetch('/api/auth/logout', { method: 'POST' }); state.user = null; document.querySelector('#accountButton span').textContent = 'Masuk'; closeModal(); notify('Kamu sudah keluar'); }
  if (event.target.closest('#confirmPayment')) { const button = event.target.closest('#confirmPayment'); const order = state.orders.find((item) => item.id === button.dataset.orderId); if (!order) return notify('Detail pesanan tidak ditemukan.'); button.disabled = true; button.textContent = 'Mengirim konfirmasi...'; await sendAdminMessage(orderMessage(order)).catch(() => {}); closeModal(); openChat(); switchChatMode('admin'); notify('Detail pembayaran dikirim ke admin.'); }
  const reopen = event.target.closest('[data-reopen-payment]'); if (reopen) { const order = state.orders.find((item) => item.id === reopen.dataset.reopenPayment); if (order) paymentModal(order.customer, order); }
  const chatOrder = event.target.closest('[data-chat-order]'); if (chatOrder) { const order = state.orders.find((item) => item.id === chatOrder.dataset.chatOrder); closeModal(); openChat(); switchChatMode('admin'); if (order) sendAdminMessage(`Saya ingin menanyakan pesanan ${order.id}, dibuat ${new Date(order.createdAt).toLocaleString('id-ID')}.`).catch(() => {}); }
  const reviewOrder = event.target.closest('[data-review-order]'); if (reviewOrder) reviewForm(reviewOrder.dataset.reviewOrder, Number(reviewOrder.dataset.reviewProduct));
  const reviewFilter = event.target.closest('[data-review-filter]'); if (reviewFilter) { state.reviewFilter = reviewFilter.dataset.reviewFilter; modalContent.innerHTML = renderReviewsContent(state.reviews); icons(); }
});

modalLayer.addEventListener('change', (event) => {
  if (event.target.id === 'detailOwnGmail' || event.target.id === 'detailReseller' || event.target.name === 'detailVariant') {
    const item = getProduct(document.querySelector('[data-add-detail]')?.dataset.addDetail);
    updateDetailPricing();
    const reseller = Boolean(document.querySelector('#detailReseller')?.checked);
    const isSaldoApi = item.title.includes('SALDO API');
    const defaultMin = isSaldoApi ? 5 : 1;
    const input = document.querySelector('#detailQuantity'); input.min = reseller ? resellerMinimum(item) : defaultMin; if (reseller && Number(input.value) < Number(input.min)) input.value = input.min; document.querySelector('#quantityHint').textContent = reseller ? `Minimum reseller ${input.min}, maksimal ${item.stock}` : (isSaldoApi ? 'Minimal 5 dollar' : `Maksimal ${item.stock} sesuai stok`); setDetailQuantity(input.value);
  }
});
modalLayer.addEventListener('input', (event) => { if (event.target.id === 'detailQuantity') setDetailQuantity(event.target.value); });

modalLayer.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (event.target.id === 'authForm') {
    const button = event.target.querySelector('button[type="submit"]'); const mode = event.target.dataset.mode; button.disabled = true; button.textContent = mode === 'register' ? 'Membuat akun...' : 'Memeriksa akun...';
    try { const credentials = Object.fromEntries(new FormData(event.target)); credentials.chatId = state.chatId; if (mode === 'register') credentials.deviceId = state.deviceId; const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Autentikasi gagal.'); state.user = result.user; if (result.chatId) setChatId(result.chatId); document.querySelector('#accountButton span').textContent = state.user.name.split(' ')[0]; closeModal(); if (state.chatMode === 'admin') loadAdminChat(); notify(mode === 'register' ? 'Akun berhasil dibuat' : 'Berhasil masuk'); }
    catch (error) { notify(error.message); button.disabled = false; button.textContent = mode === 'register' ? 'Buat akun' : 'Masuk sekarang'; }
  }
  if (event.target.id === 'checkoutForm') {
    const button = event.target.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Memvalidasi stok...';
    try {
      const form = Object.fromEntries(new FormData(event.target));
      const { voucherCode, ...customer } = form;
      if (form.llm_email) {
        customer.note = `[Email LLM: ${form.llm_email.trim()}] ${customer.note || ''}`.trim();
        delete form.llm_email;
      }
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, voucherCode, items: state.cart, chatId: state.chatId }) });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Pesanan gagal dibuat.');
      await loadStore(); state.cart = []; persistCart(); paymentModal(order.customer, order);
    } catch (error) {
      notify(error.message); button.disabled = false; button.textContent = 'Lanjut ke pembayaran';
    }
  }
  if (event.target.id === 'reviewForm') {
    const button = event.target.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Mengirim ulasan...';
    try { const body = Object.fromEntries(new FormData(event.target)); body.orderId = event.target.dataset.orderId; body.productId = Number(event.target.dataset.productId); body.rating = Number(body.rating); const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const review = await response.json(); if (!response.ok) throw new Error(review.error || 'Ulasan gagal dikirim.'); state.reviews.unshift(review); notify('Terima kasih, ulasanmu sudah diterbitkan.'); historyModal(); } catch (error) { notify(error.message); button.disabled = false; button.textContent = 'Kirim ulasan'; }
  }
});

function addToCart(id, quantity, ownGmail = false, reseller = false, variantId = '') {
  const product = getProduct(id); const selectedReseller = Boolean(reseller);
  const minQty = product.title.includes('SALDO API') ? 5 : 1;
  const minimum = selectedReseller ? resellerMinimum(product) : minQty;
  const amount = Math.max(minimum, Math.min(Number(quantity) || minimum, product.stock));
  const selectedOwnGmail = supportsOwnGmail(product) && Boolean(ownGmail);
  const selectedVariant = productVariant(product, variantId)?.id || '';
  const existing = state.cart.find((line) => line.id === id && (line.variantId || '') === selectedVariant && Boolean(line.ownGmail) === selectedOwnGmail && Boolean(line.reseller) === selectedReseller);
  const otherQuantity = state.cart.filter((line) => line.id === id && line !== existing).reduce((total, line) => total + line.quantity, 0);
  const available = Math.max(0, product.stock - otherQuantity);
  if (!available) return notify('Stok produk sudah habis di keranjang');
  if (available < minimum) return notify(`Harga reseller membutuhkan minimal ${minimum} stok.`);
  if (existing) existing.quantity = Math.min(existing.quantity + amount, available); else state.cart.push({ id, quantity: Math.min(amount, available), ownGmail: selectedOwnGmail, reseller: selectedReseller, variantId: selectedVariant });
  persistCart(); notify('Produk masuk ke keranjang');
}

async function loadStore() {
  try { const response = await fetch('/api/store', { cache: 'no-store' }); if (!response.ok) throw new Error(); const data = await response.json(); products = data.products.map((item) => { const base = supportsOwnGmail(item) ? { ...item, access: 'Akun privat + Codex', description: CHATGPT_PLUS_DESCRIPTION } : item; return applyCatalogDefaults(base, false); }); validIds = new Set(products.map((item) => item.id)); }
  catch { notify('Menggunakan data katalog lokal.'); }
  renderProducts(); updateCart();
}

async function loadUserSession() {
  localStorage.removeItem('jagoprem_user');
  Object.keys(localStorage).filter((key) => key.startsWith('jagoprem_account_')).forEach((key) => localStorage.removeItem(key));
  try { const response = await fetch(`/api/auth/me?chatId=${encodeURIComponent(state.chatId)}`, { cache: 'no-store' }); if (!response.ok) return; const result = await response.json(); state.user = result.user; if (result.chatId) setChatId(result.chatId); document.querySelector('#accountButton span').textContent = state.user.name.split(' ')[0]; } catch {}
}

document.querySelector('#historyButton').addEventListener('click', historyModal);
document.querySelector('#reviewsButton').addEventListener('click', reviewsModal);
document.querySelector('#infoButton').addEventListener('click', () => { document.querySelector('#sidebar').classList.remove('open'); document.querySelector('#sidebarOverlay').classList.remove('show'); openModal(`${modalHead('Informasi JagoPrem')}<div class="modal-body"><div class="about-profile"><div class="about-photo"><img src="assets/afran-ronaldi-v2.png" alt="Afran Ronaldi"></div><div><small>PENGELOLA JAGOPREM</small><h3>Afran Ronaldi</h3><p>JagoPrem dibangun untuk mempermudah pembelian akun digital premium dengan katalog yang jelas, stok konsisten, dan proses transaksi yang sederhana.</p></div></div><div class="about-points"><div><i data-lucide="package-check"></i><span><b>Stok terpantau</b><small>Jumlah pembelian mengikuti stok yang tersedia.</small></span></div><div><i data-lucide="qr-code"></i><span><b>QRIS sesuai tagihan</b><small>Nominal pembayaran dibuat sesuai total checkout.</small></span></div><div><i data-lucide="message-circle"></i><span><b>Bantuan langsung</b><small>Produk dikirim dan kendala dibantu melalui WhatsApp.</small></span></div></div><button class="submit-button" type="button" data-open-admin-chat>Hubungi admin</button></div>`); });
modalLayer.addEventListener('click', (event) => { if (event.target.closest('[data-open-admin-chat]')) { closeModal(); openChat(); switchChatMode('admin'); } });
// ---- SYNC SYSTEM ----
let lastSyncTime = new Date().toISOString();
let notifications = JSON.parse(localStorage.getItem('jagoprem_notifs') || '[]');
let unreadNotifCount = 0;

function updateNotifBadge() {
  const badge = document.querySelector('#notifBadge');
  if (badge) {
    badge.textContent = unreadNotifCount;
    badge.style.display = unreadNotifCount > 0 ? 'flex' : 'none';
  }
}

function updateChatBadge(count) {
  const bubble = document.querySelector('#chatBadge');
  const side = document.querySelector('#sideChatBadge');
  if (bubble) { bubble.textContent = count; bubble.style.display = count > 0 ? 'flex' : 'none'; }
  if (side) { side.textContent = count; side.style.display = count > 0 ? 'flex' : 'none'; }
}

async function syncUser() {
  try {
    const userId = state.user?.id || '';
    const res = await fetch(`/api/sync?chatId=${state.chatId}&userId=${userId}&lastSync=${encodeURIComponent(lastSyncTime)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.chatId) setChatId(data.chatId);

    // Update lastSyncTime to now (provided by server)
    if (data.timestamp) lastSyncTime = data.timestamp;

    let shouldShowToast = false;

    // Chat updates
    if (data.unreadChatCount > 0) {
      if (state.chatMode === 'admin' && chatPanel.classList.contains('open')) {
        loadAdminChat(); // this will also mark as read
      } else {
        updateChatBadge(data.unreadChatCount);
        if (data.newMessages?.length) {
          shouldShowToast = true;
          notify(`Pesan baru dari Admin: "${data.newMessages[data.newMessages.length-1].text}"`);
        }
      }
    }

    // Notification updates
    if (data.newNotifications?.length) {
      notifications.unshift(...data.newNotifications);
      localStorage.setItem('jagoprem_notifs', JSON.stringify(notifications.slice(0, 50)));
      unreadNotifCount += data.newNotifications.length;
      updateNotifBadge();
      if (!shouldShowToast) {
        notify(`Notifikasi baru: ${data.newNotifications[0].title}`);
      }
    }

  } catch (e) {}
}

setInterval(syncUser, 5000);

document.querySelector('#notifButton').addEventListener('click', () => {
  unreadNotifCount = 0;
  updateNotifBadge();
  const notifHtml = notifications.length
    ? notifications.map(n => `<div class="notif-modal-item"><h4>${escapeHtml(n.title)}</h4><p>${escapeHtml(n.text)}</p><time>${formatChatDateTime(n.createdAt)}</time></div>`).join('')
    : '<div style="padding:24px;text-align:center;color:var(--muted)">Belum ada notifikasi</div>';
  openModal(`${modalHead('Notifikasi')}<div class="modal-body" style="padding:0;max-height:400px;overflow-y:auto">${notifHtml}</div>`);
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeModal(); closeChat(); } });
loadStore(); loadUserSession(); icons();

function showPromoPopup() {
  openModal(`${modalHead('<i data-lucide="ticket-percent" style="vertical-align:middle;margin-right:8px;color:#10b981;"></i>Promo Eksklusif')}
    <div class="modal-body promo-popup">
      <div class="promo-popup-card">
        <div class="promo-anime-bg">
          <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80&fit=crop" alt="" class="promo-bg-img" onerror="this.style.display='none'">
          <div class="promo-anime-overlay"></div>
        </div>
        <div class="promo-card-content">
          <div class="promo-brand">
            <span class="brand-symbol"><i></i><b></b></span>
            <span>JagoPrem</span>
          </div>
          <div class="promo-header-row">
            <div class="promo-badge">TERBATAS</div>
            <div class="promo-badge secondary-badge">Juli 2026</div>
          </div>
          <h3 class="promo-title">DISKON <span>16%</span></h3>
          <p class="promo-subtitle">Khusus Produk <strong>AI &amp; Produktivitas</strong></p>

          <div class="promo-desc-block">
            <div class="promo-desc-item"><i data-lucide="zap"></i><span>Berlaku untuk ChatGPT, Claude, Grok, GPT Edu, Dola AI, dll.</span></div>
            <div class="promo-desc-item"><i data-lucide="shopping-cart"></i><span>Minimal beli <strong>2 produk AI yang sama</strong> dalam 1 transaksi</span></div>
            <div class="promo-desc-item"><i data-lucide="tag"></i><span>Masukkan kode saat checkout, diskon langsung terpotong</span></div>
          </div>

          <div class="promo-collage">
            <img src="https://s3.xoftware.id/f/23843_ChatGpt_997_1780629550891.png" alt="ChatGPT">
            <img src="https://s3.xoftware.id/f/46473_claude1b_997_1780858031695.png" alt="Claude">
            <img src="https://s3.xoftware.id/f/25754_grok_997_1780655477114.png" alt="Grok">
            <img src="https://cdn.gradual.com/images/https://d2xo500swnpgl1.cloudfront.net/uploads/oaiacademy/EDU-Content-Covers-37--16823a96-45ae-4dac-b79e-5c805bf5c7c3-1780455465231.jpeg?fit=scale-down&width=900" alt="GPT Edu">
          </div>

          <div class="promo-code-box">
            <span class="promo-label">Kode Voucher Eksklusif</span>
            <div class="promo-code-row">
              <div class="promo-code" id="promoCodeText">SPESIALAI07</div>
              <button class="promo-copy-btn" type="button" id="promoCodeCopy"><i data-lucide="copy"></i> Salin</button>
            </div>
          </div>
        </div>
      </div>
      <button class="confirm-button" type="button" data-close-modal id="promoShopNow"><i data-lucide="shopping-bag" style="width:16px;height:16px;margin-right:6px;vertical-align:middle;"></i>Belanja Sekarang</button>
    </div>
  `);
  document.querySelector('#promoCodeCopy')?.addEventListener('click', () => {
    navigator.clipboard?.writeText('SPESIALAI07').catch(() => {});
    const btn = document.querySelector('#promoCodeCopy');
    if (btn) { btn.innerHTML = '<i data-lucide="check"></i> Disalin!'; icons(); setTimeout(() => { if (btn) { btn.innerHTML = '<i data-lucide="copy"></i> Salin'; icons(); } }, 2000); }
  });
  icons();
}

// Show the promo popup on page load
setTimeout(() => {
  const params = new URLSearchParams(window.location.search);
  const buyProductId = params.get('product');
  const buyQty = Number(params.get('qty'));

  if (buyProductId && !isNaN(Number(buyProductId)) && buyQty && !isNaN(buyQty)) {
    // If URL has ?product=X&qty=Y, skip promo popup and go straight to checkout
    const p = getProduct(Number(buyProductId));
    if (p) {
      state.cart = [{
        id: p.id,
        variantId: '',
        quantity: buyQty,
        ownGmail: false,
        reseller: false
      }];
      persistCart();
      checkoutModal();
    }
  } else {
    showPromoPopup();
  }
}, 1200);

