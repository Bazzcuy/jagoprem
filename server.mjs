import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const projectRoot = process.cwd();
const root = join(projectRoot, 'public');
const port = Number(process.env.PORT || process.argv[2] || 8000);
const dataDir = join(projectRoot, 'data');
const storeFile = join(dataDir, 'store.json');
const adminPassword = process.env.ADMIN_PASSWORD;
const adminToken = randomBytes(24).toString('hex');
const loginAttempts = new Map();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const STORE_SCHEMA_VERSION = 13;
const OFFICIAL_PRIVATE_DESCRIPTION = 'Akun resmi dan bukan akun ilegal. Akses bersifat privat, bukan sharing, dengan garansi 30 hari sesuai ketentuan penggunaan JagoPrem.';
const CLAUDE_PRO_DESCRIPTION = 'Akun resmi Claude Pro login di claude.ai. Akun Vietnam dengan pembayaran credit card Vietnam, garansi 30 hari, dan dijamin aman dari deactive selama tidak mengubah pembayaran, info login seperti email dan password, serta tidak terlalu sering ganti device.';
const ORDER_RESERVATION_MS = 30 * 60 * 1000;
const DOLA_PRODUCT = { id: 91001, is_best_seller: false, title: 'DOLA AI 1 BULAN', cashback_amount: 0, cashback_type: 'amount', thumbnail: 'https://sf-sf-flow-web-cdn-nontt.ciciaicdn.com/obj/ocean-flow-web-sg/favicon/new-dola/192x192.png', price: 37000, available_stock: 8, sold: 34, total_stock: 42, has_wholesale: false, stock: 8, enabled: true, featuredRank: 5, duration: '1 bulan', warranty: 'Garansi akses', access: 'Dola AI', description: 'Dola AI adalah asisten chat AI untuk percakapan, menulis, menerjemahkan, coding, mencari inspirasi, dan membahas berbagai topik. Produk aktif 1 bulan sesuai ketentuan penggunaan JagoPrem.' };
const GPT_EDU_K12_DESCRIPTION = 'Akses GPT Edu K12 untuk kebutuhan belajar, membuat materi, merangkum, menulis, riset ringan, pendampingan tugas sekolah, dan penggunaan Codex untuk belajar coding. Produk tidak menyediakan opsi email sendiri; detail akses dan panduan penggunaan dikirim admin setelah pembayaran.';
const GPT_EDU_K12_PRODUCT = { id: 92000, is_best_seller: true, title: 'GPT EDU K12', cashback_amount: 0, cashback_type: 'amount', thumbnail: 'https://cdn.gradual.com/images/https://d2xo500swnpgl1.cloudfront.net/uploads/oaiacademy/EDU-Content-Covers-37--16823a96-45ae-4dac-b79e-5c805bf5c7c3-1780455465231.jpeg?fit=scale-down&width=900', price: 360000, available_stock: 8, sold: 0, total_stock: 8, has_wholesale: false, stock: 8, enabled: true, featuredRank: 1, duration: '1 tahun', warranty: '3 bulan', access: 'GPT Edu K12 + Codex', description: GPT_EDU_K12_DESCRIPTION, variants: [
  { id: '1y', label: '1 Tahun', price: 360000, duration: '1 tahun', warranty: '3 bulan' },
  { id: '2y', label: '2 Tahun', price: 675000, duration: '2 tahun', warranty: '8 bulan' }
] };
const GPT_EDU_K12_PRODUCTS = [GPT_EDU_K12_PRODUCT];
const SAMPLE_REVIEWS = [
  {
    "id": "sample-01",
    "productId": 90002,
    "customerName": "starlyy1",
    "rating": 5,
    "comment": "ChatGPT Plus 20 hari aman sih. Dipake ngerjain tugas sama coding kecil, instruksi loginnya jelas.",
    "createdAt": "2026-06-21T15:20:00.000Z"
  },
  {
    "id": "sample-02",
    "productId": 46473,
    "customerName": "bambas pamungkan9",
    "rating": 5,
    "comment": "Claude Pro enak buat baca file panjang. Gue masukin bahan laporan, rangkumannya rapi dan ga ngaco.",
    "createdAt": "2026-06-21T13:45:00.000Z"
  },
  {
    "id": "sample-03",
    "productId": 90001,
    "customerName": "vinzz",
    "rating": 5,
    "comment": "anjir cepet banget respon bot wa nya, baru chat bentar langsung diarahkan admin.",
    "createdAt": "2026-06-21T10:30:00.000Z"
  },
  {
    "id": "sample-04",
    "productId": 23843,
    "customerName": "rendi gntg",
    "rating": 5,
    "comment": "ChatGPT Go 3 bulan worth it. Buat belajar sama bikin rangkuman udh cukup banget.",
    "createdAt": "2026-06-20T16:15:00.000Z"
  },
  {
    "id": "sample-05",
    "productId": 91001,
    "customerName": "princes vini",
    "rating": 5,
    "comment": "Dola AI nya lucu juga buat nulis caption sama translate. Harga 37k buat sebulan menurutku masih masuk.",
    "createdAt": "2026-06-20T11:05:00.000Z"
  },
  {
    "id": "sample-06",
    "productId": 90002,
    "customerName": "febriola",
    "rating": 5,
    "comment": "Menurut gw udah oke sih, tapi buat juga kek opsi gmail sendiri gitu biar makin fleksibel.",
    "createdAt": "2026-06-19T18:40:00.000Z"
  },
  {
    "id": "sample-07",
    "productId": 23725,
    "customerName": "thmryyn",
    "rating": 5,
    "comment": "CapCut Pro aktif, template premium kebuka. Buat edit reels jualan aman bgt.",
    "createdAt": "2026-06-19T14:10:00.000Z"
  },
  {
    "id": "sample-08",
    "productId": 23915,
    "customerName": "nabilaaaa",
    "rating": 5,
    "comment": "Gemini Pro kepake buat riset ide konten. Awal login agak baca pelan2, abis itu lancar.",
    "createdAt": "2026-06-19T09:25:00.000Z"
  },
  {
    "id": "sample-09",
    "productId": 90001,
    "customerName": "skuy dim",
    "rating": 5,
    "comment": "kok disini murah2 banget lah cok, ChatGPT Plus nya masuk dan bisa langsung dipake.",
    "createdAt": "2026-06-18T17:55:00.000Z"
  },
  {
    "id": "sample-10",
    "productId": 46473,
    "customerName": "vaniya ct",
    "rating": 5,
    "comment": "Claude Pro buat bantu rewrite caption panjang hasilnya halus. Adminnya juga ga ribet.",
    "createdAt": "2026-06-18T13:30:00.000Z"
  },
  {
    "id": "sample-11",
    "productId": 23935,
    "customerName": "raka anak baik",
    "rating": 5,
    "comment": "Spotify Premium aman, playlist lama tetep ada. Kirimannya ga lama.",
    "createdAt": "2026-06-18T08:45:00.000Z"
  },
  {
    "id": "sample-12",
    "productId": 40213,
    "customerName": "queen nabila",
    "rating": 5,
    "comment": "HBO Max bisa login normal. Sempet nanya device, admin jelasin step by step.",
    "createdAt": "2026-06-17T19:35:00.000Z"
  },
  {
    "id": "sample-13",
    "productId": 90002,
    "customerName": "putra senja",
    "rating": 5,
    "comment": "ChatGPT Plus 20 hari cocok buat kerja harian. Codex muncul, akun kerasa privat.",
    "createdAt": "2026-06-17T15:05:00.000Z"
  },
  {
    "id": "sample-14",
    "productId": 91001,
    "customerName": "caaa",
    "rating": 5,
    "comment": "Dola AI lumayan smooth buat brainstorming ide tugas. UI nya simpel, jawabannya cepet.",
    "createdAt": "2026-06-17T10:15:00.000Z"
  },
  {
    "id": "sample-15",
    "productId": 31181,
    "customerName": "zaraa",
    "rating": 5,
    "comment": "Canva Pro aktif, elemen premium kebuka. Buat template IG jualan langsung jalan.",
    "createdAt": "2026-06-16T20:10:00.000Z"
  },
  {
    "id": "sample-16",
    "productId": 25754,
    "customerName": "mager ngetik",
    "rating": 5,
    "comment": "Grok bisa buat cari angle konten. Murah sih, admin juga fast respon.",
    "createdAt": "2026-06-16T16:50:00.000Z"
  },
  {
    "id": "sample-17",
    "productId": 23843,
    "customerName": "bang ipul",
    "rating": 5,
    "comment": "ChatGPT Go hemat buat sekolah. Buat parafrase sama latihan soal udh oke.",
    "createdAt": "2026-06-16T12:25:00.000Z"
  },
  {
    "id": "sample-18",
    "productId": 90001,
    "customerName": "rann",
    "rating": 5,
    "comment": "Plus 2 hari cocok buat deadline dadakan. Login cepet, ga banyak drama.",
    "createdAt": "2026-06-15T18:05:00.000Z"
  },
  {
    "id": "sample-19",
    "productId": 46473,
    "customerName": "no context bro",
    "rating": 5,
    "comment": "Claude Pro buat review tulisan panjang enak. Jawabannya nyambung terus.",
    "createdAt": "2026-06-15T13:40:00.000Z"
  },
  {
    "id": "sample-20",
    "productId": 23930,
    "customerName": "alvnn",
    "rating": 5,
    "comment": "YouTube Premium aktif. Bisa layar mati, no iklan, mantap lah.",
    "createdAt": "2026-06-15T09:10:00.000Z"
  },
  {
    "id": "sample-21",
    "productId": 40138,
    "customerName": "cacaay",
    "rating": 5,
    "comment": "Leonardo AI jalan buat generate gambar produk. Hasilnya oke buat bahan feed.",
    "createdAt": "2026-06-14T17:45:00.000Z"
  },
  {
    "id": "sample-22",
    "productId": 90002,
    "customerName": "gwenchana",
    "rating": 5,
    "comment": "Garansi 20 hari bikin lebih tenang. Dipake coding tiap malam masih aman.",
    "createdAt": "2026-06-14T11:35:00.000Z"
  },
  {
    "id": "sample-23",
    "productId": 91001,
    "customerName": "dinnnn",
    "rating": 4,
    "comment": "Dola AI oke buat ngobrol sama nulis ide. Cuma pengen ada contoh prompt di awal biar ga bingung.",
    "createdAt": "2026-06-14T07:50:00.000Z"
  },
  {
    "id": "sample-24",
    "productId": 40212,
    "customerName": "rafli aja",
    "rating": 5,
    "comment": "Kiro Power+ bantu nyusun spec fitur. Instruksi aksesnya jelas.",
    "createdAt": "2026-06-13T20:30:00.000Z"
  },
  {
    "id": "sample-25",
    "productId": 43262,
    "customerName": "milea",
    "rating": 5,
    "comment": "iQIYI VIP lancar buat nonton drama. Awalnya ragu, ternyata aman.",
    "createdAt": "2026-06-13T15:20:00.000Z"
  },
  {
    "id": "sample-26",
    "productId": 90001,
    "customerName": "ditzz",
    "rating": 5,
    "comment": "lumayn ok sh,tpi respon lbh cept lgi pas jam rame. produknya aman kok.",
    "createdAt": "2026-06-13T10:05:00.000Z"
  },
  {
    "id": "sample-27",
    "productId": 46473,
    "customerName": "tasyaaa",
    "rating": 5,
    "comment": "Claude Pro kepake buat rangkum meeting note. Hemat waktu banget.",
    "createdAt": "2026-06-12T18:15:00.000Z"
  },
  {
    "id": "sample-28",
    "productId": 90002,
    "customerName": "neo bukan matrix",
    "rating": 4,
    "comment": "ChatGPT Plus aktif lengkap. Pengiriman agak nunggu beberapa menit, tapi sesuai.",
    "createdAt": "2026-06-12T13:00:00.000Z"
  },
  {
    "id": "sample-29",
    "productId": 46473,
    "customerName": "vanoo",
    "rating": 4,
    "comment": "Claude lancar buat kerja dokumen. Awal login harus baca instruksi dulu.",
    "createdAt": "2026-06-12T09:45:00.000Z"
  },
  {
    "id": "sample-30",
    "productId": 23725,
    "customerName": "nayla edits",
    "rating": 4,
    "comment": "CapCut Pro jalan dan efek premium kebuka. Balasan admin malam agak lama, masih wajar.",
    "createdAt": "2026-06-11T21:10:00.000Z"
  },
  {
    "id": "sample-31",
    "productId": 23935,
    "customerName": "jovian",
    "rating": 4,
    "comment": "Spotify Premium jalan lancar. Sempet salah login, dibantu ulang.",
    "createdAt": "2026-06-11T16:25:00.000Z"
  },
  {
    "id": "sample-32",
    "productId": 40213,
    "customerName": "lunaaa",
    "rating": 3,
    "comment": "HBO Max akhirnya bisa dipakai, tapi proses awalnya lebih lama dari ekspektasi.",
    "createdAt": "2026-06-11T11:40:00.000Z"
  },
  {
    "id": "sample-33",
    "productId": 90002,
    "customerName": "arielzz",
    "rating": 5,
    "comment": "Plus 20 hari buat prompt image sama coding kecil oke. Stabil no drama.",
    "createdAt": "2026-06-10T20:15:00.000Z"
  },
  {
    "id": "sample-34",
    "productId": 46473,
    "customerName": "cleoo",
    "rating": 5,
    "comment": "Claude Pro buat rangkum jurnal enak. Bahasanya natural.",
    "createdAt": "2026-06-10T16:50:00.000Z"
  },
  {
    "id": "sample-35",
    "productId": 91001,
    "customerName": "vii anak baik",
    "rating": 5,
    "comment": "Dola AI buat translate indo-inggris lumayan rapi. Bisa jadi alternatif kalau lagi males buka banyak app.",
    "createdAt": "2026-06-10T13:30:00.000Z"
  },
  {
    "id": "sample-36",
    "productId": 46473,
    "customerName": "zidann",
    "rating": 5,
    "comment": "Claude Pro nyaman buat rewrite caption. Bisa diarahkan pelan2 hasilnya makin pas.",
    "createdAt": "2026-06-10T09:05:00.000Z"
  },
  {
    "id": "sample-37",
    "productId": 23843,
    "customerName": "meisya",
    "rating": 5,
    "comment": "ChatGPT Go pas buat belajar UTBK. Harga segini udh cakep.",
    "createdAt": "2026-06-09T21:20:00.000Z"
  },
  {
    "id": "sample-38",
    "productId": 90002,
    "customerName": "rioooo",
    "rating": 5,
    "comment": "ChatGPT Plus garansi 20 hari saya pakai buat kerja remote. Lumayan hemat dan performanya oke.",
    "createdAt": "2026-06-09T17:40:00.000Z"
  },
  {
    "id": "sample-39",
    "productId": 46473,
    "customerName": "maya",
    "rating": 5,
    "comment": "Claude Pro bantu banget bikin user story. Konteks panjangnya kerasa.",
    "createdAt": "2026-06-09T14:00:00.000Z"
  },
  {
    "id": "sample-40",
    "productId": 90001,
    "customerName": "ilham konten",
    "rating": 5,
    "comment": "Aktif cepat, cocok buat bikin skrip konten harian. Instruksi login gampang.",
    "createdAt": "2026-06-09T10:25:00.000Z"
  },
  {
    "id": "sample-41",
    "productId": 46473,
    "customerName": "rendi gntg",
    "rating": 5,
    "comment": "Claude Pro buat review CV hasilnya rapi. Admin juga jawabnya santai.",
    "createdAt": "2026-06-08T21:10:00.000Z"
  },
  {
    "id": "sample-42",
    "productId": 25754,
    "customerName": "dimas suka ai",
    "rating": 5,
    "comment": "Grok oke buat cari insight cepat. Produknya sesuai katalog.",
    "createdAt": "2026-06-08T18:05:00.000Z"
  },
  {
    "id": "sample-43",
    "productId": 31181,
    "customerName": "adittt",
    "rating": 5,
    "comment": "Canva Pro mantul buat desain poster event kampus. Background remover kebuka.",
    "createdAt": "2026-06-08T14:35:00.000Z"
  },
  {
    "id": "sample-44",
    "productId": 90002,
    "customerName": "yogz",
    "rating": 5,
    "comment": "ChatGPT Plus dipake refactor kode. Ngebantu nemu bug yg kelewat.",
    "createdAt": "2026-06-08T10:45:00.000Z"
  },
  {
    "id": "sample-45",
    "productId": 46473,
    "customerName": "tikaa",
    "rating": 5,
    "comment": "Claude Pro buat bikin thread edukasi enak. Output panjang tapi tetep nyambung.",
    "createdAt": "2026-06-07T22:00:00.000Z"
  },
  {
    "id": "sample-46",
    "productId": 23915,
    "customerName": "yudha",
    "rating": 5,
    "comment": "Gemini Pro kebuka. Cocok buat riset Google sama draft ide.",
    "createdAt": "2026-06-07T18:20:00.000Z"
  },
  {
    "id": "sample-47",
    "productId": 90001,
    "customerName": "hafizzz",
    "rating": 5,
    "comment": "Plus 2 hari buat tugas kelompok cepet aktif. Ga ada kendala login.",
    "createdAt": "2026-06-07T15:10:00.000Z"
  },
  {
    "id": "sample-48",
    "productId": 40212,
    "customerName": "liaa",
    "rating": 5,
    "comment": "Kiro Power+ berguna buat nyusun flow fitur. Instruksinya ga ribet.",
    "createdAt": "2026-06-07T11:55:00.000Z"
  },
  {
    "id": "sample-49",
    "productId": 91001,
    "customerName": "bayu random",
    "rating": 5,
    "comment": "Dola AI ternyata bisa buat nulis draft cerita pendek juga. Jawabannya ga kaku.",
    "createdAt": "2026-06-06T21:35:00.000Z"
  },
  {
    "id": "sample-50",
    "productId": 90002,
    "customerName": "sarahh",
    "rating": 5,
    "comment": "ChatGPT Plus stabil buat pair programming. Harga masuk akal buat sebulan.",
    "createdAt": "2026-06-06T17:15:00.000Z"
  },
  {
    "id": "sample-51",
    "productId": 23930,
    "customerName": "dewi podkes",
    "rating": 5,
    "comment": "YouTube Premium aktif, enak buat denger podcast tanpa iklan.",
    "createdAt": "2026-06-06T13:25:00.000Z"
  },
  {
    "id": "sample-52",
    "productId": 40138,
    "customerName": "arman visual",
    "rating": 5,
    "comment": "Leonardo AI cocok buat konsep visual produk. Output tajam.",
    "createdAt": "2026-06-06T09:40:00.000Z"
  },
  {
    "id": "sample-53",
    "productId": 90002,
    "customerName": "vinaaa",
    "rating": 5,
    "comment": "Plus 20 hari bikin yakin. Dipake analisis data kecil sama query aman.",
    "createdAt": "2026-06-05T22:10:00.000Z"
  },
  {
    "id": "sample-54",
    "productId": 46473,
    "customerName": "rezaa",
    "rating": 5,
    "comment": "Claude Pro buat QA dokumen panjang solid. Jarang keluar konteks.",
    "createdAt": "2026-06-05T18:45:00.000Z"
  },
  {
    "id": "sample-55",
    "productId": 23725,
    "customerName": "alya edits",
    "rating": 5,
    "comment": "CapCut Pro bantu edit konten jualan. Export aman.",
    "createdAt": "2026-06-05T14:30:00.000Z"
  },
  {
    "id": "sample-56",
    "productId": 90001,
    "customerName": "naufal",
    "rating": 5,
    "comment": "Plus aktif buat itinerary liburan. Jawabannya cepat dan detail.",
    "createdAt": "2026-06-05T10:05:00.000Z"
  },
  {
    "id": "sample-57",
    "productId": 46473,
    "customerName": "citraaa",
    "rating": 4,
    "comment": "Claude Pro bagus buat riset, cuma awalnya bingung step login. Setelah dibantu aman.",
    "createdAt": "2026-06-04T21:50:00.000Z"
  },
  {
    "id": "sample-58",
    "productId": 90002,
    "customerName": "yoga",
    "rating": 4,
    "comment": "ChatGPT Plus fiturnya lengkap. Pengiriman agak ngantri, tapi akhirnya lancar.",
    "createdAt": "2026-06-04T17:35:00.000Z"
  },
  {
    "id": "sample-59",
    "productId": 43262,
    "customerName": "miko drama",
    "rating": 4,
    "comment": "iQIYI VIP bisa dipakai nonton drama. Ada kendala kecil pas login pertama, dibantu sampai masuk.",
    "createdAt": "2026-06-04T13:20:00.000Z"
  },
  {
    "id": "sample-60",
    "productId": 31181,
    "customerName": "eka desain",
    "rating": 4,
    "comment": "Canva Pro aktif. Instruksi awal bisa dibuat lebih singkat, tapi produknya oke.",
    "createdAt": "2026-06-04T09:55:00.000Z"
  }
];

mkdirSync(dataDir, { recursive: true });

function syncProduct(product) { product.stock = Math.max(0, Math.min(49, Number(product.stock || 0))); product.available_stock = product.stock; product.total_stock = Number(product.sold || 0) + product.stock; }
function applyAutoRestock(store) { let changed = false; for (const product of store.products || []) if (product.autoRestock && product.enabled && product.stock < 2) { product.stock = Math.min(49, product.stock + 8); syncProduct(product); changed = true; } return changed; }
function releaseOrderStock(store, order) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (product) { product.stock += line.quantity; syncProduct(product); } } }
function reserveOrderStock(store, order) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (!product || product.stock < line.quantity) return false; } for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); product.stock -= line.quantity; syncProduct(product); } return true; }
function expirePendingOrders(store) { let changed = false; for (const order of store.orders || []) if (order.status === 'pending' && new Date(order.expiresAt || new Date(new Date(order.createdAt).getTime() + ORDER_RESERVATION_MS)) <= new Date()) { releaseOrderStock(store, order); order.status = 'expired'; order.expiredAt = new Date().toISOString(); changed = true; } return applyAutoRestock(store) || changed; }
function readStore() { const data = JSON.parse(readFileSync(storeFile, 'utf8')); data.orders ||= []; data.chats ||= []; data.users ||= []; data.userSessions ||= []; data.reviews ||= []; data.vouchers ||= []; let changed = false; data.settings ||= { maintenance: false, maintenanceMessage: 'JagoPrem sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.', reviewsEnabled: true }; if (typeof data.settings.reviewsEnabled !== 'boolean') { data.settings.reviewsEnabled = true; changed = true; } for (const product of data.products || []) if (typeof product.autoRestock !== 'boolean') { product.autoRestock = false; changed = true; } const claude = data.products.find((product) => product.id === 46473); if (claude && (claude.price !== 83000 || claude.description !== CLAUDE_PRO_DESCRIPTION)) { Object.assign(claude, { price: 83000, duration: '1 bulan', warranty: '30 hari', access: 'Akun resmi Claude Pro di claude.ai', description: CLAUDE_PRO_DESCRIPTION }); syncProduct(claude); changed = true; } if ((data.schemaVersion || 0) < 8) { if (!data.products.some((product) => product.id === DOLA_PRODUCT.id)) data.products.splice(Math.max(0, data.products.findIndex((product) => product.id === 23843)), 0, { ...DOLA_PRODUCT }); data.reviews = (data.reviews || []).filter((review) => !review.isSample && !String(review.id || '').startsWith('sample-')); data.reviews.push(...SAMPLE_REVIEWS.filter((review) => !data.reviews.some((item) => item.id === review.id))); for (const order of data.orders) if (order.status === 'completed' && !order.soldApplied) { for (const line of order.items || []) { const product = data.products.find((item) => item.id === line.id); if (product) { product.sold = Number(product.sold || 0) + Number(line.quantity || 0); syncProduct(product); } } order.soldApplied = true; } changed = true; } if ((data.schemaVersion || 0) < 9) { const chatgptIndex = data.products.findIndex((product) => product.id === 90002 || product.id === 23843); for (const product of GPT_EDU_K12_PRODUCTS.slice().reverse()) if (!data.products.some((item) => item.id === product.id)) data.products.splice(chatgptIndex >= 0 ? chatgptIndex : 0, 0, { ...product }); for (const product of data.products.filter((item) => GPT_EDU_K12_PRODUCTS.some((edu) => edu.id === item.id))) { const source = GPT_EDU_K12_PRODUCTS.find((edu) => edu.id === product.id); Object.assign(product, source, { stock: Number(product.stock ?? source.stock), sold: Number(product.sold ?? source.sold), enabled: product.enabled !== false }); syncProduct(product); } data.schemaVersion = STORE_SCHEMA_VERSION; changed = true; } if ((data.schemaVersion || 0) < 13) { const specialAiVoucher = (data.vouchers || []).find((voucher) => normalizeVoucherCode(voucher.code) === 'SPESIALAI07'); if (specialAiVoucher) Object.assign(specialAiVoucher, { description: 'Diskon 16% minimal 2 produk AI yang sama', requiredCategory: 'AI & produktivitas', minQuantity: 2, requireSameProduct: true }); data.schemaVersion = 13; changed = true; } if (!(data.vouchers || []).some((voucher) => normalizeVoucherCode(voucher.code) === 'SPESIALAI07')) { data.vouchers.unshift({ code: 'SPESIALAI07', description: 'Diskon 16% minimal 2 produk AI yang sama', type: 'percent', value: 16, minSubtotal: 0, maxUses: 0, used: 0, enabled: true, expiresAt: '', requiredCategory: 'AI & produktivitas', minQuantity: 2, requireSameProduct: true, createdAt: new Date().toISOString() }); changed = true; } if (data.schemaVersion !== STORE_SCHEMA_VERSION) { data.schemaVersion = STORE_SCHEMA_VERSION; changed = true; } if (expirePendingOrders(data)) changed = true; if (changed) writeStore(data); return data; }
function writeStore(data) { writeFileSync(storeFile, JSON.stringify(data, null, 2)); }
function sendJson(response, status, data, headers = {}) { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers }); response.end(JSON.stringify(data)); }
function readBody(request) { return new Promise((resolve, reject) => { let body = ''; request.on('data', (chunk) => { body += chunk; if (body.length > 1e6) request.destroy(); }); request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); } }); request.on('error', reject); }); }
function getCookie(request, name) { const part = (request.headers.cookie || '').split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`)); return part ? part.slice(name.length + 1) : ''; }
function isAdmin(request) { return getCookie(request, 'JagoPrem_admin') === adminToken; }
function hashPassword(password, salt) { return scryptSync(password, salt, 32).toString('hex'); }
function hashToken(token) { return createHash('sha256').update(token).digest('hex'); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function chatCustomer(user) { return { name: user?.name || '', email: user?.email || '' }; }
function chatMessageKey(message) { return message?.id || `${message?.sender || ''}:${message?.createdAt || ''}:${message?.text || ''}`; }
function latestTimestamp(...values) { return values.reduce((latest, value) => { const time = new Date(value || '').getTime(); return Number.isNaN(time) ? latest : Math.max(latest, time); }, 0); }
function chatUnreadCount(chat) { const lastReadAt = new Date(chat?.adminLastReadAt || 0).getTime() || 0; return (chat?.messages || []).filter((message) => message.sender !== 'admin' && new Date(message.createdAt || '').getTime() > lastReadAt).length; }
function summarizeChat(chat) { const messages = chat?.messages || []; const lastMessage = messages.at(-1) || null; return { id: chat.id, userId: chat.userId || '', orderId: chat.orderId || '', customer: chat.customer || {}, updatedAt: chat.updatedAt || lastMessage?.createdAt || '', adminLastReadAt: chat.adminLastReadAt || '', lastMessageAt: lastMessage?.createdAt || chat.updatedAt || '', lastMessageText: lastMessage?.text || '', lastMessageSender: lastMessage?.sender || '', unreadCount: chatUnreadCount(chat), messageCount: messages.length }; }
function mergeChatMessages(target, source) { const seen = new Set((target.messages || []).map(chatMessageKey)); for (const message of source.messages || []) { const key = chatMessageKey(message); if (!seen.has(key)) { target.messages ||= []; target.messages.push(message); seen.add(key); } } target.messages = (target.messages || []).sort((left, right) => String(left.createdAt || '').localeCompare(String(right.createdAt || ''))); }
function claimUserChat(store, user, preferredChatId = '', customer = {}) { store.chats ||= []; store.orders ||= []; const targetId = user.id; const email = normalizeEmail(user.email); const matching = store.chats.filter((chat) => chat.id === targetId || chat.id === preferredChatId || chat.userId === user.id || normalizeEmail(chat.customer?.email) === email); let target = matching.find((chat) => chat.id === targetId) || matching[0]; const sourceIds = new Set(matching.map((chat) => chat.id).filter(Boolean)); if (preferredChatId) sourceIds.add(preferredChatId); if (!target) { target = { id: targetId, customer: { ...chatCustomer(user), ...customer }, messages: [], updatedAt: new Date().toISOString() }; store.chats.unshift(target); } else { sourceIds.add(target.id); target.id = targetId; target.customer = { ...target.customer, ...chatCustomer(user), ...customer }; } target.userId = user.id; for (const chat of matching) { if (chat === target) continue; mergeChatMessages(target, chat); target.adminLastReadAt = latestTimestamp(target.adminLastReadAt, chat.adminLastReadAt) ? new Date(latestTimestamp(target.adminLastReadAt, chat.adminLastReadAt)).toISOString() : (target.adminLastReadAt || chat.adminLastReadAt || ''); target.customer = { ...chat.customer, ...target.customer, ...chatCustomer(user), ...customer }; if (chat.orderId && !target.orderId) target.orderId = chat.orderId; } target.updatedAt = new Date().toISOString(); store.chats = [target, ...store.chats.filter((chat) => chat !== target && !sourceIds.has(chat.id))]; for (const order of store.orders) if (order.userId === user.id || sourceIds.has(order.chatId)) order.chatId = targetId; return target; }
function resellerMinimum(price) { return Number(price) > 20000 ? 3 : 5; }
function resellerPrice(price) { return Math.round(Number(price) * 0.92); }
function productVariant(product, variantId) { return (product?.variants || []).find((variant) => variant.id === String(variantId || '')) || product?.variants?.[0] || null; }
function productBasePrice(product, variantId) { return Number(productVariant(product, variantId)?.price || product?.price || 0); }
function normalizeVoucherCode(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32); }
function productCategory(item) {
  if (item?.title?.includes('SALDO API')) return 'Developer API';
  const ai = /AI |GPT EDU|CHATGPT|CLAUDE|GROK|GEMINI|PERPLEXITY|KIRO|LEONARDO|KLING/.test(item.title);
  const streaming = /IQIYI|HBO|SPOTIFY|YOUTUBE|APPLE MUSIC|PRIME VIDEO|WETV|VIU|VIDIO|BSTATION|LOKLOK|DRAMABOX|REELSHORT/.test(item.title);
  return ai ? 'AI & produktivitas' : streaming ? 'Hiburan premium' : 'Aplikasi premium';
}
function sanitizeVoucher(input = {}) { const type = input.type === 'percent' ? 'percent' : 'amount'; return { code: normalizeVoucherCode(input.code), description: String(input.description || '').trim().slice(0, 120), type, value: Math.max(0, Math.floor(Number(input.value || 0))), minSubtotal: Math.max(0, Math.floor(Number(input.minSubtotal || 0))), maxUses: input.maxUses === '' || input.maxUses === null || input.maxUses === undefined ? 0 : Math.max(0, Math.floor(Number(input.maxUses || 0))), used: Math.max(0, Math.floor(Number(input.used || 0))), enabled: input.enabled !== false, expiresAt: String(input.expiresAt || '').trim(), requiredCategory: String(input.requiredCategory || '').trim(), minQuantity: Math.max(0, Math.floor(Number(input.minQuantity || 0))), requireSameProduct: Boolean(input.requireSameProduct) }; }
function voucherDiscount(voucher, subtotal) { const amount = voucher.type === 'percent' ? Math.floor(Number(subtotal || 0) * Math.min(100, Number(voucher.value || 0)) / 100) : Number(voucher.value || 0); return Math.max(0, Math.min(Number(subtotal || 0), amount)); }
function voucherQualifiedQuantity(store, voucher, items = []) { const requiredCategory = String(voucher.requiredCategory || '').trim(); const qualified = items.filter((item) => { const product = store.products.find((p) => p.id === Number(item.id)); return product && (!requiredCategory || productCategory(product) === requiredCategory); }); if (!voucher.requireSameProduct) return qualified.reduce((sum, item) => sum + Number(item.quantity || 0), 0); const byProduct = new Map(); for (const item of qualified) byProduct.set(Number(item.id), (byProduct.get(Number(item.id)) || 0) + Number(item.quantity || 0)); return Math.max(0, ...byProduct.values()); }
function voucherRequirementError(store, voucher, items = []) { const minQuantity = Number(voucher.minQuantity || 0); if (minQuantity <= 0) return ''; const qualifiedQuantity = voucherQualifiedQuantity(store, voucher, items); if (qualifiedQuantity >= minQuantity) return ''; const categoryText = voucher.requiredCategory ? ` kategori "${voucher.requiredCategory}"` : ''; const sameText = voucher.requireSameProduct ? ' yang sama' : ''; return `Voucher ini berlaku untuk minimal ${minQuantity} produk${categoryText}${sameText}. Saat ini kamu baru punya ${qualifiedQuantity} produk yang memenuhi syarat.`; }
function findValidVoucher(store, code, subtotal, items = []) { const normalized = normalizeVoucherCode(code); if (!normalized) return null; const voucher = (store.vouchers || []).find((item) => normalizeVoucherCode(item.code) === normalized); if (!voucher || voucher.enabled === false) return { error: ['Kode voucher tidak aktif atau tidak ditemukan.', 404] }; if (voucher.expiresAt && new Date(voucher.expiresAt).getTime() < Date.now()) return { error: ['Kode voucher sudah kedaluwarsa.', 410] }; if (Number(voucher.minSubtotal || 0) > subtotal) return { error: [`Minimal belanja voucher ini ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(voucher.minSubtotal || 0))}.`, 400] }; if (Number(voucher.maxUses || 0) > 0 && Number(voucher.used || 0) >= Number(voucher.maxUses || 0)) return { error: ['Kuota voucher sudah habis.', 409] }; const quantityError = voucherRequirementError(store, voucher, items); if (quantityError) return { error: [quantityError, 400] }; if (voucher.requiredCategory) { const hasCategory = items.some((item) => { const product = store.products.find((p) => p.id === item.id); return product && productCategory(product) === voucher.requiredCategory; }); if (!hasCategory) return { error: [`Voucher ini khusus untuk produk kategori: ${voucher.requiredCategory}.`, 400] }; } const discount = voucherDiscount(voucher, subtotal); if (discount <= 0) return { error: ['Voucher belum memberi potongan untuk pesanan ini.', 400] }; return { voucher, discount }; }
function currentLocalUser(request, store) { const token = getCookie(request, 'JagoPrem_user'); const session = store.userSessions.find((item) => item.tokenHash === hashToken(token) && new Date(item.expiresAt) > new Date()); const user = session && store.users.find((item) => item.id === session.userId); return user && !user.blocked ? user : null; }
function isRateLimited(key) { const item = loginAttempts.get(key); return Boolean(item && Date.now() - item.started < 900000 && item.count >= 5); }
function recordFailure(key) { const item = loginAttempts.get(key); loginAttempts.set(key, item && Date.now() - item.started < 900000 ? { ...item, count: item.count + 1 } : { count: 1, started: Date.now() }); }
function createUserSession(store, userId) { const token = randomBytes(32).toString('hex'); store.userSessions = store.userSessions.filter((item) => new Date(item.expiresAt) > new Date()); store.userSessions.push({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() }); return token; }

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/seed-store.json') { response.writeHead(404).end('Not found'); return; }
  if (pathname === '/bolehnihadmin') { response.writeHead(302, { Location: '/bolehdong' }); response.end(); return; }
  if (pathname === '/admin') { response.writeHead(302, { Location: '/admin.html' }); response.end(); return; }
  const adminAsset = ['/admin.html', '/admin.js', '/admin.css', '/admin-chat.css', '/admin-audit.css'].includes(pathname);
  if (pathname !== '/bolehdong' && !pathname.startsWith('/api/admin/') && !adminAsset) { const store = readStore(); if (store.settings.maintenance) { if (pathname.startsWith('/api/')) { sendJson(response, 503, { error: store.settings.maintenanceMessage, maintenance: true }); return; } response.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JagoPrem Maintenance</title><style>body{min-height:100vh;display:grid;place-items:center;margin:0;background:#eef8f6;font-family:Arial}.box{max-width:500px;padding:36px;text-align:center;background:white;border-radius:8px}.box p{line-height:1.7;color:#65736f}</style><main class="box"><h1>JagoPrem sedang dirawat</h1><p>${store.settings.maintenanceMessage}</p><button onclick="location.reload()">Coba lagi</button></main></html>`); return; } }
  if (pathname === '/api/auth/register' && request.method === 'POST') {
    try { const body = await readBody(request); const name = String(body.name || '').trim().slice(0, 80); const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || ''); const deviceId = String(body.deviceId || '').trim(); if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return sendJson(response, 400, { error: 'Nama, email, atau password belum valid. Password minimal 8 karakter.' }); if (!/^[a-zA-Z0-9-]{8,100}$/.test(deviceId)) return sendJson(response, 400, { error: 'Identitas perangkat tidak valid. Muat ulang halaman lalu coba lagi.' }); const store = readStore(); if (store.users.some((item) => item.email === email)) return sendJson(response, 409, { error: 'Email sudah terdaftar. Silakan masuk.' }); if (store.users.filter((item) => item.deviceId === deviceId).length >= 2) return sendJson(response, 403, { error: 'Perangkat ini sudah mencapai batas maksimal 2 akun.' }); const salt = randomBytes(16).toString('hex'); const user = { id: `usr-${randomBytes(12).toString('hex')}`, name, email, salt, passwordHash: hashPassword(password, salt), deviceId, blocked: false, createdAt: new Date().toISOString() }; store.users.push(user); const chat = claimUserChat(store, publicUser(user), String(body.chatId || '').trim(), chatCustomer(user)); const token = createUserSession(store, user.id); writeStore(store); sendJson(response, 201, { user: publicUser(user), chatId: chat.id }, { 'Set-Cookie': `JagoPrem_user=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` }); } catch { sendJson(response, 400, { error: 'Data pendaftaran tidak valid.' }); } return;
  }
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    try { const body = await readBody(request); const email = String(body.email || '').trim().toLowerCase(); const key = `user:${request.socket.remoteAddress}:${email}`; if (isRateLimited(key)) return sendJson(response, 429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }); const store = readStore(); const user = store.users.find((item) => item.email === email); const actual = user ? Buffer.from(hashPassword(String(body.password || ''), user.salt), 'hex') : Buffer.alloc(32); const expected = user ? Buffer.from(user.passwordHash, 'hex') : Buffer.alloc(32, 1); if (!user || !timingSafeEqual(actual, expected)) { recordFailure(key); return sendJson(response, 401, { error: 'Email atau password salah.' }); } if (user.blocked) return sendJson(response, 403, { error: 'Akun ini diblokir. Hubungi admin melalui chat bantuan.' }); loginAttempts.delete(key); const chat = claimUserChat(store, publicUser(user), String(body.chatId || '').trim(), chatCustomer(user)); const token = createUserSession(store, user.id); writeStore(store); sendJson(response, 200, { user: publicUser(user), chatId: chat.id }, { 'Set-Cookie': `JagoPrem_user=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` }); } catch { sendJson(response, 400, { error: 'Permintaan login tidak valid.' }); } return;
  }
  if (pathname === '/api/auth/me' && request.method === 'GET') { const store = readStore(); const user = currentLocalUser(request, store); if (!user) { sendJson(response, 401, { user: null }); return; } sendJson(response, 200, { user: publicUser(user), chatId: url.searchParams.get('chatId') || user.id }); return; }
  if (pathname === '/api/auth/logout' && request.method === 'POST') { const token = getCookie(request, 'JagoPrem_user'); const store = readStore(); store.userSessions = store.userSessions.filter((item) => item.tokenHash !== hashToken(token)); writeStore(store); sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'JagoPrem_user=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' }); return; }
  if (pathname === '/api/store' && request.method === 'GET') { const store = readStore(); sendJson(response, 200, { products: store.products, maintenance: store.settings.maintenance }); return; }
  if (pathname === '/api/reviews' && request.method === 'GET') { const store = readStore(); sendJson(response, 200, { reviews: [...store.reviews].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) }); return; }
  if (pathname === '/api/reviews' && request.method === 'POST') { try { const body = await readBody(request); const store = readStore(); const user = currentLocalUser(request, store); if (!user) return sendJson(response, 401, { error: 'Silakan masuk untuk memberi ulasan.' }); if (store.settings.reviewsEnabled === false) return sendJson(response, 403, { error: 'Ulasan baru sedang dinonaktifkan sementara.' }); const order = store.orders.find((item) => item.id === String(body.orderId) && item.userId === user.id); const productId = Number(body.productId); const rating = Number(body.rating); const comment = String(body.comment || '').trim().slice(0, 600); if (!order || order.status !== 'completed' || !order.items.some((line) => line.id === productId)) return sendJson(response, 403, { error: 'Ulasan hanya tersedia untuk pesanan yang sudah selesai.' }); if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 8) return sendJson(response, 400, { error: 'Pilih bintang dan tulis minimal 8 karakter.' }); if (store.reviews.some((item) => item.orderId === order.id && item.productId === productId)) return sendJson(response, 409, { error: 'Produk ini sudah kamu ulas.' }); const review = { id: `rev-${randomBytes(10).toString('hex')}`, orderId: order.id, productId, userId: user.id, customerName: user.name.split(' ')[0], rating, comment, verified: true, createdAt: new Date().toISOString() }; store.reviews.unshift(review); writeStore(store); sendJson(response, 201, review); } catch { sendJson(response, 400, { error: 'Ulasan tidak valid.' }); } return; }
  if (pathname === '/api/orders/me' && request.method === 'GET') { const store = readStore(); const user = currentLocalUser(request, store); if (!user) return sendJson(response, 401, { error: 'Silakan masuk untuk melihat pesanan.' }); sendJson(response, 200, { orders: store.orders.filter((order) => order.userId === user.id).sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))), reviews: store.reviews.filter((review) => review.userId === user.id) }); return; }
  if (pathname === '/api/sync' && request.method === 'GET') { const store = readStore(); const user = currentLocalUser(request, store); const chatId = user ? user.id : (url.searchParams.get('chatId') || ''); const userId = user?.id || url.searchParams.get('userId') || ''; const lastSync = new Date(url.searchParams.get('lastSync') || '').getTime() || 0; const chat = store.chats.find((item) => item.id === chatId); const newMessages = (chat?.messages || []).filter((message) => new Date(message.createdAt).getTime() > lastSync); const unreadChatCount = (chat?.messages || []).filter((message) => message.sender === 'admin' && !message.read).length; const newNotifications = (store.notifications || []).filter((notif) => new Date(notif.createdAt).getTime() > lastSync && (!notif.targetUserId || notif.targetUserId === userId)); sendJson(response, 200, { chatId, newMessages, unreadChatCount, newNotifications, timestamp: new Date().toISOString() }); return; }
  if (pathname === '/api/chat/resolve' && request.method === 'POST') { try { const body = await readBody(request); const store = readStore(); const user = currentLocalUser(request, store); if (!user) return sendJson(response, 401, { chatId: null, user: null }); const chat = claimUserChat(store, publicUser(user), String(body.chatId || '').trim(), body.customer || chatCustomer(user)); writeStore(store); sendJson(response, 200, { chatId: chat.id, chat }); } catch { sendJson(response, 400, { error: 'Chat tidak valid.' }); } return; }
  const readMatch = pathname.match(/^\/api\/chat\/((?:chat|usr)-[a-zA-Z0-9-]{3,80})\/read$/);
  if (readMatch && request.method === 'POST') { const store = readStore(); const user = currentLocalUser(request, store); const chatId = user ? claimUserChat(store, publicUser(user), readMatch[1], chatCustomer(user)).id : readMatch[1]; const chat = store.chats.find((item) => item.id === chatId); if (chat) for (const message of chat.messages || []) if (message.sender === 'admin') message.read = true; writeStore(store); sendJson(response, 200, { success: true }); return; }
  const chatMatch = pathname.match(/^\/api\/chat\/((?:chat|usr)-[a-zA-Z0-9-]{3,80})$/);
  if (chatMatch && request.method === 'GET') { const store = readStore(); const user = currentLocalUser(request, store); if (user) { const chat = claimUserChat(store, publicUser(user), chatMatch[1], chatCustomer(user)); writeStore(store); sendJson(response, 200, chat); return; } const chat = store.chats.find((item) => item.id === chatMatch[1]); sendJson(response, 200, chat || { id: chatMatch[1], messages: [] }); return; }
  if (chatMatch && request.method === 'POST') {
    try { const body = await readBody(request); const text = String(body.message || '').trim().slice(0, 1000); if (!text) return sendJson(response, 400, { error: 'Pesan kosong.' }); const store = readStore(); const user = currentLocalUser(request, store); const customer = user ? { ...body.customer, ...chatCustomer(user) } : (body.customer || {}); const chatId = user ? claimUserChat(store, publicUser(user), chatMatch[1], customer).id : chatMatch[1]; let chat = store.chats.find((item) => item.id === chatId); if (!chat) { chat = { id: chatId, customer, messages: [], updatedAt: new Date().toISOString() }; store.chats.unshift(chat); } chat.customer = { ...chat.customer, ...customer }; if (user) chat.userId = user.id; chat.messages.push({ id: randomBytes(8).toString('hex'), sender: 'customer', text, createdAt: new Date().toISOString() }); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 201, chat); } catch { sendJson(response, 400, { error: 'Pesan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/vouchers/validate' && request.method === 'POST') {
    try {
      const body = await readBody(request);
      const store = readStore();
      const code = String(body.code || '').trim();
      const items = Array.isArray(body.items) ? body.items : [];
      if (!code) return sendJson(response, 400, { error: 'Masukkan kode voucher.' });
      let subtotal = 0;
      const resolvedItems = [];
      for (const line of items) {
        const product = store.products.find((item) => item.id === Number(line.id));
        if (!product) continue;
        const variant = (product.variants || []).find((v) => v.id === String(line.variantId || '')) || product.variants?.[0] || null;
        const unitPrice = Number(variant?.price || product.price || 0);
        const qty = Number(line.quantity) || 1;
        subtotal += unitPrice * qty;
        resolvedItems.push({ id: product.id, quantity: qty });
      }
      const result = findValidVoucher(store, code, subtotal, resolvedItems);
      if (!result) return sendJson(response, 404, { error: 'Kode voucher tidak ditemukan.' });
      if (result.error) return sendJson(response, result.error[1], { error: result.error[0] });
      sendJson(response, 200, { ok: true, code: result.voucher.code, discount: result.discount, description: result.voucher.description || '' });
    } catch (e) {
      sendJson(response, 400, { error: e.message || 'Voucher tidak valid.' });
    }
    return;
  }

  if (pathname === '/api/orders' && request.method === 'POST') {
    try {
      const body = await readBody(request); const store = readStore(); const user = currentLocalUser(request, store);
      if (!user) return sendJson(response, 401, { error: 'Silakan masuk sebelum membuat pesanan.' });
      if (store.orders.filter((order) => order.userId === user.id && order.status === 'pending').length >= 2) return sendJson(response, 429, { error: 'Kamu masih punya 2 pesanan menunggu pembayaran.' });
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
        const reseller = Boolean(line.reseller); const minimum = resellerMinimum(product.price);
        if (reseller && quantity < minimum) return sendJson(response, 400, { error: `Harga reseller ${product.title} minimal ${minimum} item.` });
        const variant = productVariant(product, line.variantId); const basePrice = productBasePrice(product, variant?.id); const regularUnitPrice = basePrice + (ownGmail ? 5000 : 0); const unitPrice = reseller ? resellerPrice(regularUnitPrice) : regularUnitPrice; const lineTotal = unitPrice * quantity;
        subtotal += lineTotal;
        normalizedItems.push({ id: product.id, title: variant ? `${product.title} - ${variant.label}` : product.title, variantId: variant?.id || '', variantLabel: variant?.label || '', quantity, ownGmail, reseller, unitPrice, regularUnitPrice, lineTotal });
      }
      const appliedVoucher = findValidVoucher(store, body.voucherCode, subtotal, normalizedItems); if (appliedVoucher?.error) return sendJson(response, appliedVoucher.error[1], { error: appliedVoucher.error[0] }); if (appliedVoucher) appliedVoucher.voucher.used = Number(appliedVoucher.voucher.used || 0) + 1;
      const adminFee = 99; const discount = appliedVoucher?.discount || 0; const voucher = appliedVoucher ? { code: appliedVoucher.voucher.code, description: appliedVoucher.voucher.description, discount } : null; const total = Math.max(0, subtotal - discount) + adminFee;
      const customer = { name: user.name, email: user.email, whatsapp: String(body.customer?.whatsapp || '').trim().replace(/[\s-]/g, '').slice(0, 20), note: String(body.customer?.note || '').trim().slice(0, 500) }; if (!/^\+?[0-9]{9,15}$/.test(customer.whatsapp)) return sendJson(response, 400, { error: 'Nomor WhatsApp tidak valid. Isi hanya angka, panjang 9â€“15 digit, boleh diawali +.' });
      const chat = claimUserChat(store, publicUser(user), String(body.chatId || '').trim(), customer);
      const createdAt = new Date(); const order = { id: `DGP-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`, userId: user.id, customer, chatId: chat.id, items: normalizedItems, subtotal, adminFee, discount, voucher, total, status: 'pending', createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + ORDER_RESERVATION_MS).toISOString() };
      if (!reserveOrderStock(store, order)) return sendJson(response, 409, { error: 'Stok berubah dan tidak lagi mencukupi.' }); applyAutoRestock(store);
      chat.customer = { ...chat.customer, ...customer }; chat.orderId = order.id;
      store.orders.unshift(order); writeStore(store); sendJson(response, 201, order);
    } catch { sendJson(response, 400, { error: 'Data pesanan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/admin/login' && request.method === 'POST') {
    try { if (!adminPassword) return sendJson(response, 503, { error: 'ADMIN_PASSWORD belum dikonfigurasi.' }); const body = await readBody(request); const key = `admin:${request.socket.remoteAddress}`; if (isRateLimited(key)) return sendJson(response, 429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }); if (body.password !== adminPassword) { recordFailure(key); return sendJson(response, 401, { error: 'Password salah.' }); } loginAttempts.delete(key); sendJson(response, 200, { ok: true }, { 'Set-Cookie': `JagoPrem_admin=${adminToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800` }); } catch { sendJson(response, 400, { error: 'Permintaan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/admin/logout' && request.method === 'POST') { sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'JagoPrem_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' }); return; }
  if (pathname === '/api/admin/state' && request.method === 'GET') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); const store = readStore(); for (const user of store.users || []) { const email = normalizeEmail(user.email); const hasChat = (store.chats || []).some((chat) => chat.id === user.id || chat.userId === user.id || normalizeEmail(chat.customer?.email) === email); if (hasChat) claimUserChat(store, publicUser(user), '', chatCustomer(user)); } writeStore(store); const users = store.users.map(({ id, name, email, createdAt, blocked = false, deviceId = '' }) => { const orders = store.orders.filter((order) => order.userId === id); return { id, name, email, createdAt, blocked, deviceId, orderCount: orders.length, totalSpent: orders.filter((order) => ['paid', 'completed'].includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0), orders }; }); sendJson(response, 200, { products: store.products, orders: store.orders, chats: (store.chats || []).map(summarizeChat), users, reviews: store.reviews, vouchers: store.vouchers || [], settings: store.settings }); return; }
  const adminChatDetailMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})$/);
  if (adminChatDetailMatch && request.method === 'GET') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); const store = readStore(); const chat = store.chats.find((item) => item.id === adminChatDetailMatch[1]); if (!chat) return sendJson(response, 404, { error: 'Chat tidak ditemukan.' }); chat.adminLastReadAt = new Date().toISOString(); writeStore(store); return sendJson(response, 200, chat); }
  const adminChatReadMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/read$/);
  if (adminChatReadMatch && request.method === 'POST') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); const store = readStore(); const chat = store.chats.find((item) => item.id === adminChatReadMatch[1]); if (!chat) return sendJson(response, 404, { error: 'Chat tidak ditemukan.' }); chat.adminLastReadAt = new Date().toISOString(); writeStore(store); return sendJson(response, 200, { ok: true, chat: summarizeChat(chat) }); }

  const adminUserBlockMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/block$/);
  if (adminUserBlockMatch && request.method === 'PUT') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); try { const body = await readBody(request); const store = readStore(); const user = store.users.find((item) => item.id === adminUserBlockMatch[1]); if (!user) return sendJson(response, 404, { error: 'Akun tidak ditemukan.' }); user.blocked = Boolean(body.blocked); if (user.blocked) store.userSessions = store.userSessions.filter((item) => item.userId !== user.id); writeStore(store); sendJson(response, 200, { ok: true, blocked: user.blocked }); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); } return; }

  const adminUserDeleteMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (adminUserDeleteMatch && request.method === 'DELETE') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); try { const store = readStore(); const userId = adminUserDeleteMatch[1]; const user = store.users.find((item) => item.id === userId); if (!user) return sendJson(response, 404, { error: 'Akun tidak ditemukan.' }); store.users = store.users.filter((item) => item.id !== userId); store.userSessions = store.userSessions.filter((item) => item.userId !== userId); for (const order of store.orders) { if (order.userId === userId) { order.userId = null; order.deletedUser = { name: user.name, email: user.email, deletedAt: new Date().toISOString() }; } } writeStore(store); sendJson(response, 200, { ok: true, id: userId }); } catch { sendJson(response, 400, { error: 'Gagal menghapus akun.' }); } return; }

  const adminChatMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/reply$/);
  if (adminChatMatch && request.method === 'POST') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const text = String(body.message || '').trim().slice(0, 1000); if (!text) return sendJson(response, 400, { error: 'Pesan kosong.' }); const store = readStore(); const chat = store.chats.find((item) => item.id === adminChatMatch[1]); if (!chat) return sendJson(response, 404, { error: 'Chat tidak ditemukan.' }); chat.messages.push({ id: randomBytes(8).toString('hex'), sender: 'admin', text, createdAt: new Date().toISOString() }); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 201, chat); } catch { sendJson(response, 400, { error: 'Pesan tidak valid.' }); }
    return;
  }

  const adminChatMsgMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/messages\/([a-f0-9]{8,32})$/);
  if (adminChatMsgMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const text = String(body.text || '').trim().slice(0, 1000); if (!text) return sendJson(response, 400, { error: 'Teks pesan tidak boleh kosong.' }); const store = readStore(); const chat = store.chats.find((item) => item.id === adminChatMsgMatch[1]); if (!chat) return sendJson(response, 404, { error: 'Chat tidak ditemukan.' }); const message = chat.messages.find((item) => item.id === adminChatMsgMatch[2]); if (!message) return sendJson(response, 404, { error: 'Pesan tidak ditemukan.' }); message.text = text; message.editedAt = new Date().toISOString(); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 200, chat); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); }
    return;
  }
  if (adminChatMsgMatch && request.method === 'DELETE') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const store = readStore(); const chat = store.chats.find((item) => item.id === adminChatMsgMatch[1]); if (!chat) return sendJson(response, 404, { error: 'Chat tidak ditemukan.' }); const before = chat.messages.length; chat.messages = chat.messages.filter((item) => item.id !== adminChatMsgMatch[2]); if (chat.messages.length === before) return sendJson(response, 404, { error: 'Pesan tidak ditemukan.' }); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 200, chat); } catch { sendJson(response, 400, { error: 'Gagal menghapus pesan.' }); }
    return;
  }

  if (pathname === '/api/admin/chats/initiate' && request.method === 'POST') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try {
      const body = await readBody(request);
      const userId = String(body.userId || '').trim();
      const message = String(body.message || '').trim().slice(0, 1000);
      if (!userId) return sendJson(response, 400, { error: 'userId wajib diisi.' });
      if (!message) return sendJson(response, 400, { error: 'Pesan tidak boleh kosong.' });
      const store = readStore();
      const user = store.users.find((item) => item.id === userId);
      if (!user) return sendJson(response, 404, { error: 'Akun tidak ditemukan.' });
      const chatId = userId;
      let chat = store.chats.find((item) => item.id === chatId);
      if (!chat) {
        chat = { id: chatId, customer: { name: user.name, email: user.email }, messages: [], updatedAt: new Date().toISOString() };
        store.chats.unshift(chat);
      }
      chat.messages.push({ id: randomBytes(8).toString('hex'), sender: 'admin', text: message, createdAt: new Date().toISOString() });
      chat.updatedAt = new Date().toISOString();
      writeStore(store);
      sendJson(response, 201, chat);
    } catch {
      sendJson(response, 400, { error: 'Gagal menginisiasi chat.' });
    }
    return;
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (productMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try {
      const body = await readBody(request);
      const store = readStore();
      const product = store.products.find((item) => item.id === Number(productMatch[1]));
      if (!product) return sendJson(response, 404, { error: 'Produk tidak ditemukan.' });
      const stock = Number(body.stock);
      const price = Number(body.price);
      if (!Number.isInteger(stock) || stock < 0 || stock > 49 || !Number.isInteger(price) || price < 0) return sendJson(response, 400, { error: 'Harga atau stok tidak valid.' });
      const updates = { stock, price, enabled: Boolean(body.enabled), autoRestock: Boolean(body.autoRestock) };
      if (Array.isArray(body.variants)) {
        updates.variants = body.variants.map((v) => ({
          id: String(v.id || '').trim(),
          label: String(v.label || '').trim().slice(0, 80),
          price: Math.max(0, Number(v.price || 0)),
          duration: String(v.duration || '').trim().slice(0, 40),
          warranty: String(v.warranty || '').trim().slice(0, 40)
        })).filter((v) => v.id && v.label);
      }
      Object.assign(product, updates); syncProduct(product); applyAutoRestock(store); writeStore(store); sendJson(response, 200, product);
    } catch {
      sendJson(response, 400, { error: 'Data tidak valid.' });
    }
    return;
  }

  const voucherMatch = pathname.match(/^\/api\/admin\/vouchers\/([^/]+)$/);
  if (pathname === '/api/admin/vouchers' && request.method === 'POST') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); try { const body = await readBody(request); const store = readStore(); const voucher = sanitizeVoucher(body); if (!voucher.code) return sendJson(response, 400, { error: 'Kode voucher wajib diisi.' }); if (!voucher.value) return sendJson(response, 400, { error: 'Nilai diskon wajib lebih dari 0.' }); if ((store.vouchers || []).some((item) => normalizeVoucherCode(item.code) === voucher.code)) return sendJson(response, 409, { error: 'Kode voucher sudah ada.' }); store.vouchers ||= []; store.vouchers.unshift({ ...voucher, createdAt: new Date().toISOString() }); writeStore(store); sendJson(response, 201, store.vouchers[0]); } catch { sendJson(response, 400, { error: 'Voucher tidak valid.' }); } return; }
  if (voucherMatch && request.method === 'PUT') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); try { const body = await readBody(request); const store = readStore(); const voucher = (store.vouchers || []).find((item) => normalizeVoucherCode(item.code) === normalizeVoucherCode(voucherMatch[1])); if (!voucher) return sendJson(response, 404, { error: 'Voucher tidak ditemukan.' }); const next = sanitizeVoucher(body); if (!next.code) return sendJson(response, 400, { error: 'Kode voucher wajib diisi.' }); if (!next.value) return sendJson(response, 400, { error: 'Nilai diskon wajib lebih dari 0.' }); if (next.code !== normalizeVoucherCode(voucherMatch[1]) && (store.vouchers || []).some((item) => item !== voucher && normalizeVoucherCode(item.code) === next.code)) return sendJson(response, 409, { error: 'Kode voucher sudah dipakai.' }); Object.assign(voucher, next, { updatedAt: new Date().toISOString() }); writeStore(store); sendJson(response, 200, voucher); } catch { sendJson(response, 400, { error: 'Voucher tidak valid.' }); } return; }
  if (voucherMatch && request.method === 'DELETE') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); const store = readStore(); const before = (store.vouchers || []).length; store.vouchers = (store.vouchers || []).filter((item) => normalizeVoucherCode(item.code) !== normalizeVoucherCode(voucherMatch[1])); if (store.vouchers.length === before) return sendJson(response, 404, { error: 'Voucher tidak ditemukan.' }); writeStore(store); sendJson(response, 200, { ok: true }); return; }

  const orderCustomerMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/customer$/);
  if (orderCustomerMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const store = readStore(); const order = store.orders.find((item) => item.id === orderCustomerMatch[1]); if (!order) return sendJson(response, 404, { error: 'Pesanan tidak ditemukan.' }); if (!['pending', 'paid'].includes(order.status)) return sendJson(response, 400, { error: 'Data customer hanya bisa diubah pada pesanan pending atau paid.' }); const name = String(body.name || '').trim().slice(0, 80); const whatsapp = String(body.whatsapp || '').trim().replace(/[\s-]/g, '').slice(0, 20); const note = String(body.note || '').trim().slice(0, 500); if (name.length < 2) return sendJson(response, 400, { error: 'Nama minimal 2 karakter.' }); if (!/^\+?[0-9]{9,15}$/.test(whatsapp)) return sendJson(response, 400, { error: 'Nomor WhatsApp tidak valid.' }); order.customer = { ...order.customer, name, whatsapp, note }; order.customerEditedAt = new Date().toISOString(); order.updatedAt = new Date().toISOString(); if (order.chatId) { const chat = store.chats.find((item) => item.id === order.chatId); if (chat) chat.customer = { ...chat.customer, name, whatsapp }; } writeStore(store); sendJson(response, 200, order); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); }
    return;
  }

  const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if (orderMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const store = readStore(); const order = store.orders.find((item) => item.id === orderMatch[1]); if (!order) return sendJson(response, 404, { error: 'Pesanan tidak ditemukan.' }); if (!['pending', 'paid', 'completed', 'cancelled'].includes(body.status)) return sendJson(response, 400, { error: 'Status tidak valid.' }); const previous = order.status; const next = body.status; const released = ['cancelled', 'expired'].includes(previous); const willRelease = ['cancelled', 'expired'].includes(next); if (released && !willRelease && !reserveOrderStock(store, order)) return sendJson(response, 409, { error: 'Stok tidak cukup.' }); if (!released && willRelease) releaseOrderStock(store, order); if (next === 'completed' && !order.soldApplied) { for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Number(product.sold || 0) + line.quantity; syncProduct(product); } } order.soldApplied = true; } if (previous === 'completed' && next !== 'completed' && order.soldApplied) { for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Math.max(0, Number(product.sold || 0) - line.quantity); syncProduct(product); } } order.soldApplied = false; } order.status = next; order.updatedAt = new Date().toISOString(); if (next === 'completed') order.completedAt = order.updatedAt; applyAutoRestock(store); writeStore(store); sendJson(response, 200, order); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); }
    return;
  }

  const adminReviewMatch = pathname.match(/^\/api\/admin\/reviews\/([^/]+)$/);
  if (adminReviewMatch && request.method === 'DELETE') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); const store = readStore(); const reviewId = decodeURIComponent(adminReviewMatch[1]); const before = store.reviews.length; store.reviews = store.reviews.filter((review) => review.id !== reviewId); if (store.reviews.length === before) return sendJson(response, 404, { error: 'Ulasan tidak ditemukan.' }); writeStore(store); sendJson(response, 200, { ok: true, id: reviewId }); return; }

  if (pathname === '/api/admin/settings' && request.method === 'PUT') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); try { const body = await readBody(request); const store = readStore(); store.settings = { ...store.settings, maintenance: Boolean(body.maintenance), reviewsEnabled: body.reviewsEnabled !== false, maintenanceMessage: String(body.maintenanceMessage || '').trim().slice(0, 240) || 'JagoPrem sedang melakukan pemeliharaan singkat.' }; writeStore(store); sendJson(response, 200, store.settings); } catch { sendJson(response, 400, { error: 'Pengaturan tidak valid.' }); } return; }

  let requestedPath = pathname;
  if (pathname === '/bolehdong') requestedPath = '/admin.html';
  let file = normalize(join(root, requestedPath === '/' ? 'index.html' : requestedPath));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404).end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); createReadStream(file).pipe(response);
});

server.listen(port, '0.0.0.0', () => console.log(`JagoPrem running on port ${port}`));



