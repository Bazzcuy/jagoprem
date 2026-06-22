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
const STORE_SCHEMA_VERSION = 6;
const OFFICIAL_PRIVATE_DESCRIPTION = 'Akun resmi dan bukan akun ilegal. Akses bersifat privat, bukan sharing, dengan garansi 30 hari sesuai ketentuan penggunaan DigiePro.';
const ORDER_RESERVATION_MS = 30 * 60 * 1000;
const SAMPLE_REVIEWS = [
  {
    id: "sample-01",
    productId: 90002,
    customerName: "Raka",
    rating: 5,
    comment: "ChatGPT Plus garansi 20 hari masuk cepat. Dipakai buat coding dan ngerangkum dokumen kerja lancar.",
    createdAt: "2026-06-21T15:20:00.000Z"
  },
  {
    id: "sample-02",
    productId: 46473,
    customerName: "Nadia",
    rating: 5,
    comment: "Claude Pro enak buat baca file panjang. Jawabannya rapi dan cocok buat bantu bikin draft laporan.",
    createdAt: "2026-06-21T13:45:00.000Z"
  },
  {
    id: "sample-03",
    productId: 90001,
    customerName: "Fajar",
    rating: 5,
    comment: "ChatGPT Plus garansi 2 hari aktif sesuai instruksi. Codex bisa dipakai dan akun terasa privat.",
    createdAt: "2026-06-21T10:30:00.000Z"
  },
  {
    id: "sample-04",
    productId: 23843,
    customerName: "Bagus",
    rating: 5,
    comment: "ChatGPT Go 3 bulan worth it buat belajar. Buat rangkum materi kuliah dan latihan soal sudah cukup banget.",
    createdAt: "2026-06-20T16:15:00.000Z"
  },
  {
    id: "sample-05",
    productId: 46473,
    customerName: "Kevin",
    rating: 5,
    comment: "Claude Pro masih aman setelah beberapa hari. Saya pakai buat analisis kontrak panjang, konteksnya kuat.",
    createdAt: "2026-06-20T11:05:00.000Z"
  },
  {
    id: "sample-06",
    productId: 90002,
    customerName: "Sinta",
    rating: 5,
    comment: "Paket ChatGPT Plus yang 20 hari garansi paling cocok buat kerja harian. Login jelas dan admin responsif.",
    createdAt: "2026-06-19T18:40:00.000Z"
  },
  {
    id: "sample-07",
    productId: 23725,
    customerName: "Dimas",
    rating: 5,
    comment: "CapCut Pro aktif dan template premiumnya kebuka. Buat edit konten pendek jadi lebih cepat.",
    createdAt: "2026-06-19T14:10:00.000Z"
  },
  {
    id: "sample-08",
    productId: 23915,
    customerName: "Adit",
    rating: 5,
    comment: "Gemini Pro aktif sesuai petunjuk. Enak buat riset cepat dan nyusun outline konten.",
    createdAt: "2026-06-19T09:25:00.000Z"
  },
  {
    id: "sample-09",
    productId: 90001,
    customerName: "Maya",
    rating: 5,
    comment: "ChatGPT Plus masuk tanpa ribet. Saya pakai buat bikin caption, ide campaign, dan revisi copywriting.",
    createdAt: "2026-06-18T17:55:00.000Z"
  },
  {
    id: "sample-10",
    productId: 46473,
    customerName: "Ilham",
    rating: 5,
    comment: "Claude Pro bagus buat brainstorming kode dan nulis dokumentasi. Akunnya privat jadi lebih nyaman dipakai.",
    createdAt: "2026-06-18T13:30:00.000Z"
  },
  {
    id: "sample-11",
    productId: 23935,
    customerName: "Rio",
    rating: 5,
    comment: "Spotify Premium aman, playlist lama bisa lanjut dan tidak ada iklan. Instruksi login mudah.",
    createdAt: "2026-06-18T08:45:00.000Z"
  },
  {
    id: "sample-12",
    productId: 40213,
    customerName: "Tika",
    rating: 5,
    comment: "HBO Max lancar buat nonton serial. Akun dikirim lewat WhatsApp dan bisa langsung dipakai.",
    createdAt: "2026-06-17T19:35:00.000Z"
  },
  {
    id: "sample-13",
    productId: 90002,
    customerName: "Reno",
    rating: 5,
    comment: "ChatGPT Plus saya pakai buat bantu debug project. Responnya stabil dan akses Codex muncul.",
    createdAt: "2026-06-17T15:05:00.000Z"
  },
  {
    id: "sample-14",
    productId: 46473,
    customerName: "Putri",
    rating: 5,
    comment: "Claude Pro cocok buat nulis email formal dan meringkas PDF. Pengiriman akunnya cepat.",
    createdAt: "2026-06-17T10:15:00.000Z"
  },
  {
    id: "sample-15",
    productId: 31181,
    customerName: "Yudha",
    rating: 5,
    comment: "Canva Pro aktif, semua elemen premium yang saya butuhkan kebuka. Cocok buat desain jualan.",
    createdAt: "2026-06-16T20:10:00.000Z"
  },
  {
    id: "sample-16",
    productId: 25754,
    customerName: "Hafiz",
    rating: 5,
    comment: "Grok bisa dipakai untuk cari ide dan baca isu terbaru. Admin juga bantu kalau bingung akses awal.",
    createdAt: "2026-06-16T16:50:00.000Z"
  },
  {
    id: "sample-17",
    productId: 23843,
    customerName: "Lia",
    rating: 5,
    comment: "ChatGPT Go hemat buat pemakaian ringan. Buat parafrase dan bikin rangkuman sekolah sudah memadai.",
    createdAt: "2026-06-16T12:25:00.000Z"
  },
  {
    id: "sample-18",
    productId: 90001,
    customerName: "Bayu",
    rating: 5,
    comment: "ChatGPT Plus aktif cepat. Saya pilih garansi 2 hari karena cuma butuh buat sprint kerja singkat.",
    createdAt: "2026-06-15T18:05:00.000Z"
  },
  {
    id: "sample-19",
    productId: 46473,
    customerName: "Sarah",
    rating: 5,
    comment: "Claude Pro membantu banget untuk review tulisan panjang. Jawabannya tidak gampang keluar konteks.",
    createdAt: "2026-06-15T13:40:00.000Z"
  },
  {
    id: "sample-20",
    productId: 23930,
    customerName: "Dewi",
    rating: 5,
    comment: "YouTube Premium aktif dan bisa dipakai tanpa iklan. Cocok buat belajar sambil layar mati.",
    createdAt: "2026-06-15T09:10:00.000Z"
  },
  {
    id: "sample-21",
    productId: 40138,
    customerName: "Arman",
    rating: 5,
    comment: "Leonardo AI jalan untuk generate gambar produk. Kuota dan fiturnya sesuai deskripsi.",
    createdAt: "2026-06-14T17:45:00.000Z"
  },
  {
    id: "sample-22",
    productId: 90002,
    customerName: "Gilang",
    rating: 5,
    comment: "ChatGPT Plus garansi 20 hari terasa lebih aman. Dipakai tiap hari buat coding dan riset kecil.",
    createdAt: "2026-06-14T11:35:00.000Z"
  },
  {
    id: "sample-23",
    productId: 46473,
    customerName: "Vina",
    rating: 5,
    comment: "Claude Pro responsnya cepat untuk bikin kerangka artikel. Akun tidak sharing jadi tidak saling ganggu.",
    createdAt: "2026-06-14T07:50:00.000Z"
  },
  {
    id: "sample-24",
    productId: 40212,
    customerName: "Reza",
    rating: 5,
    comment: "Kiro Power+ membantu buat nyusun spec fitur. Akses masuk dan instruksi dari admin jelas.",
    createdAt: "2026-06-13T20:30:00.000Z"
  },
  {
    id: "sample-25",
    productId: 43262,
    customerName: "Alya",
    rating: 5,
    comment: "iQIYI VIP lancar buat nonton drama. Kualitas video bagus dan akun langsung bisa dipakai.",
    createdAt: "2026-06-13T15:20:00.000Z"
  },
  {
    id: "sample-26",
    productId: 90001,
    customerName: "Naufal",
    rating: 5,
    comment: "ChatGPT Plus cocok buat bantu tugas kantor. Ada sedikit tanya jawab dulu, tapi admin jelasin sampai beres.",
    createdAt: "2026-06-13T10:05:00.000Z"
  },
  {
    id: "sample-27",
    productId: 46473,
    customerName: "Citra",
    rating: 5,
    comment: "Claude Pro saya pakai untuk rangkum meeting note. Hasilnya enak dibaca dan hemat waktu.",
    createdAt: "2026-06-12T18:15:00.000Z"
  },
  {
    id: "sample-28",
    productId: 90002,
    customerName: "Yoga",
    rating: 4,
    comment: "ChatGPT Plus aktif dan fiturnya lengkap. Pengiriman agak menunggu beberapa menit, tapi hasilnya sesuai.",
    createdAt: "2026-06-12T13:00:00.000Z"
  },
  {
    id: "sample-29",
    productId: 46473,
    customerName: "Miko",
    rating: 4,
    comment: "Claude Pro lancar untuk kerja dokumen. Awal login perlu baca instruksi pelan-pelan, setelah itu aman.",
    createdAt: "2026-06-12T09:45:00.000Z"
  },
  {
    id: "sample-30",
    productId: 23725,
    customerName: "Eka",
    rating: 4,
    comment: "CapCut Pro jalan dan efek premium kebuka. Balasan admin tidak instan, tapi tetap dibantu sampai bisa.",
    createdAt: "2026-06-11T21:10:00.000Z"
  },
  {
    id: "sample-31",
    productId: 23935,
    customerName: "Oki",
    rating: 4,
    comment: "Spotify Premium aktif. Sempat salah langkah login, untung instruksi ulang dari admin cukup jelas.",
    createdAt: "2026-06-11T16:25:00.000Z"
  },
  {
    id: "sample-32",
    productId: 40213,
    customerName: "Anisa",
    rating: 3,
    comment: "HBO Max akhirnya bisa dipakai, tapi proses awalnya lebih lama dari ekspektasi. Setelah aktif kualitasnya oke.",
    createdAt: "2026-06-11T11:40:00.000Z"
  },
  {
    id: "sample-33",
    productId: 90002,
    customerName: "Kenzi",
    rating: 5,
    comment: "ChatGPT Plus dipakai buat bikin prompt image dan coding kecil. Aksesnya stabil, no drama.",
    createdAt: "2026-06-10T20:15:00.000Z"
  },
  {
    id: "sample-34",
    productId: 46473,
    customerName: "Zea",
    rating: 5,
    comment: "Claude Pro kepake banget buat bikin rangkuman jurnal. Bahasanya natural dan tidak kaku.",
    createdAt: "2026-06-10T16:50:00.000Z"
  },
  {
    id: "sample-35",
    productId: 90001,
    customerName: "Bima",
    rating: 5,
    comment: "ChatGPT Plus buat ngerjain proposal cepat banget. Admin kirim detail login dengan jelas.",
    createdAt: "2026-06-10T13:30:00.000Z"
  },
  {
    id: "sample-36",
    productId: 46473,
    customerName: "Kayla",
    rating: 5,
    comment: "Claude Pro nyaman buat rewrite caption panjang. Hasilnya lebih halus daripada tool yang biasa saya pakai.",
    createdAt: "2026-06-10T09:05:00.000Z"
  },
  {
    id: "sample-37",
    productId: 23843,
    customerName: "Daffa",
    rating: 5,
    comment: "ChatGPT Go pas buat belajar UTBK. Buat tanya konsep dan latihan penjelasan sudah lebih dari cukup.",
    createdAt: "2026-06-09T21:20:00.000Z"
  },
  {
    id: "sample-38",
    productId: 90002,
    customerName: "Nara",
    rating: 5,
    comment: "ChatGPT Plus garansi 20 hari saya pakai buat kerja remote. Lumayan hemat dan performanya oke.",
    createdAt: "2026-06-09T17:40:00.000Z"
  },
  {
    id: "sample-39",
    productId: 46473,
    customerName: "Aksa",
    rating: 5,
    comment: "Claude Pro bantu banget buat bikin user story dan acceptance criteria. Konteks panjangnya kerasa.",
    createdAt: "2026-06-09T14:00:00.000Z"
  },
  {
    id: "sample-40",
    productId: 90001,
    customerName: "Shafa",
    rating: 5,
    comment: "ChatGPT Plus aktif cepat, cocok buat bikin skrip konten harian. Instruksi loginnya gampang diikuti.",
    createdAt: "2026-06-09T10:25:00.000Z"
  },
  {
    id: "sample-41",
    productId: 46473,
    customerName: "Rizky",
    rating: 5,
    comment: "Claude Pro buat review CV dan surat lamaran hasilnya rapi. Aksesnya privat, jadi lebih tenang.",
    createdAt: "2026-06-08T21:10:00.000Z"
  },
  {
    id: "sample-42",
    productId: 25754,
    customerName: "Juna",
    rating: 5,
    comment: "Grok oke buat cari insight cepat dan bahan diskusi. Produknya sesuai katalog, admin responsif.",
    createdAt: "2026-06-08T18:05:00.000Z"
  },
  {
    id: "sample-43",
    productId: 31181,
    customerName: "Nay",
    rating: 5,
    comment: "Canva Pro mantul buat desain poster event kampus. Elemen premium langsung kebuka.",
    createdAt: "2026-06-08T14:35:00.000Z"
  },
  {
    id: "sample-44",
    productId: 90002,
    customerName: "Alvin",
    rating: 5,
    comment: "ChatGPT Plus dipakai buat refactor kode. Lumayan ngebantu nemu bug yang kelewat.",
    createdAt: "2026-06-08T10:45:00.000Z"
  },
  {
    id: "sample-45",
    productId: 46473,
    customerName: "Caca",
    rating: 5,
    comment: "Claude Pro buat bikin thread edukasi enak banget. Hasilnya panjang tapi tetap nyambung.",
    createdAt: "2026-06-07T22:00:00.000Z"
  },
  {
    id: "sample-46",
    productId: 23915,
    customerName: "Ghea",
    rating: 5,
    comment: "Gemini Pro kebuka dan sinkron sama kebutuhan riset Google. Cocok buat cari draft ide.",
    createdAt: "2026-06-07T18:20:00.000Z"
  },
  {
    id: "sample-47",
    productId: 90001,
    customerName: "Fay",
    rating: 5,
    comment: "ChatGPT Plus buat bikin outline tugas kelompok. Cepat aktif dan tidak ada kendala login.",
    createdAt: "2026-06-07T15:10:00.000Z"
  },
  {
    id: "sample-48",
    productId: 40212,
    customerName: "Rafli",
    rating: 5,
    comment: "Kiro Power+ berguna buat nyusun flow fitur. Saya suka karena instruksi aksesnya tidak ribet.",
    createdAt: "2026-06-07T11:55:00.000Z"
  },
  {
    id: "sample-49",
    productId: 46473,
    customerName: "Milea",
    rating: 5,
    comment: "Claude Pro saya pakai untuk nulis draft novel pendek. Gaya bahasanya bisa diarahin pelan-pelan.",
    createdAt: "2026-06-06T21:35:00.000Z"
  },
  {
    id: "sample-50",
    productId: 90002,
    customerName: "Dito",
    rating: 5,
    comment: "ChatGPT Plus stabil buat pair programming. Harga masuk akal untuk pemakaian sebulan.",
    createdAt: "2026-06-06T17:15:00.000Z"
  },
  {
    id: "sample-51",
    productId: 23930,
    customerName: "Tasya",
    rating: 5,
    comment: "YouTube Premium aktif, enak buat denger podcast tanpa iklan. Akun dikirim cukup cepat.",
    createdAt: "2026-06-06T13:25:00.000Z"
  },
  {
    id: "sample-52",
    productId: 40138,
    customerName: "Neo",
    rating: 5,
    comment: "Leonardo AI cocok buat bikin konsep visual produk. Outputnya tajam dan fiturnya sesuai.",
    createdAt: "2026-06-06T09:40:00.000Z"
  },
  {
    id: "sample-53",
    productId: 90002,
    customerName: "Vano",
    rating: 5,
    comment: "ChatGPT Plus garansi 20 hari bikin lebih yakin. Saya pakai buat analisis data kecil dan bikin query.",
    createdAt: "2026-06-05T22:10:00.000Z"
  },
  {
    id: "sample-54",
    productId: 46473,
    customerName: "Naya",
    rating: 5,
    comment: "Claude Pro buat QA dokumen panjang hasilnya solid. Jarang melenceng dari konteks utama.",
    createdAt: "2026-06-05T18:45:00.000Z"
  },
  {
    id: "sample-55",
    productId: 23725,
    customerName: "Jovian",
    rating: 5,
    comment: "CapCut Pro membantu edit konten jualan. Fitur premium aktif dan export aman.",
    createdAt: "2026-06-05T14:30:00.000Z"
  },
  {
    id: "sample-56",
    productId: 90001,
    customerName: "Luna",
    rating: 5,
    comment: "ChatGPT Plus aktif buat bantu bikin itinerary liburan. Jawaban cepat dan detail.",
    createdAt: "2026-06-05T10:05:00.000Z"
  },
  {
    id: "sample-57",
    productId: 46473,
    customerName: "Arka",
    rating: 4,
    comment: "Claude Pro bagus buat riset, cuma awalnya saya sempat bingung step login. Setelah dibantu aman.",
    createdAt: "2026-06-04T21:50:00.000Z"
  },
  {
    id: "sample-58",
    productId: 90002,
    customerName: "Cleo",
    rating: 4,
    comment: "ChatGPT Plus fiturnya lengkap. Pengiriman akun agak ngantri, tapi masih wajar dan akhirnya lancar.",
    createdAt: "2026-06-04T17:35:00.000Z"
  },
  {
    id: "sample-59",
    productId: 43262,
    customerName: "Rani",
    rating: 4,
    comment: "iQIYI VIP bisa dipakai nonton drama. Ada kendala kecil saat login pertama, admin bantu sampai masuk.",
    createdAt: "2026-06-04T13:20:00.000Z"
  },
  {
    id: "sample-60",
    productId: 31181,
    customerName: "Zidan",
    rating: 4,
    comment: "Canva Pro aktif dan desain premium kebuka. Instruksi awal bisa dibuat lebih singkat, tapi produknya oke.",
    createdAt: "2026-06-04T09:55:00.000Z"
  },
  {
    id: "sample-61",
    productId: 23935,
    customerName: "Meisya",
    rating: 4,
    comment: "Spotify Premium jalan lancar. Balasan admin agak telat karena malam, tapi akun tetap beres.",
    createdAt: "2026-06-03T20:25:00.000Z"
  },
  {
    id: "sample-62",
    productId: 40213,
    customerName: "Ariel",
    rating: 4,
    comment: "HBO Max aktif dan bisa nonton normal. Prosesnya tidak instan, tapi masih sesuai ekspektasi.",
    createdAt: "2026-06-03T16:05:00.000Z"
  }
];

mkdirSync(dataDir, { recursive: true });

function syncProduct(product) { product.stock = Math.max(0, Math.min(49, Number(product.stock || 0))); product.available_stock = product.stock; product.total_stock = Number(product.sold || 0) + product.stock; }
function applyAutoRestock(store) { let changed = false; for (const product of store.products || []) if (product.autoRestock && product.enabled && product.stock < 2) { product.stock = Math.min(49, product.stock + 8); syncProduct(product); changed = true; } return changed; }
function releaseOrderStock(store, order) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (product) { product.stock += line.quantity; syncProduct(product); } } }
function reserveOrderStock(store, order) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (!product || product.stock < line.quantity) return false; } for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); product.stock -= line.quantity; syncProduct(product); } return true; }
function expirePendingOrders(store) { let changed = false; for (const order of store.orders || []) if (order.status === 'pending' && new Date(order.expiresAt || new Date(new Date(order.createdAt).getTime() + ORDER_RESERVATION_MS)) <= new Date()) { releaseOrderStock(store, order); order.status = 'expired'; order.expiredAt = new Date().toISOString(); changed = true; } return applyAutoRestock(store) || changed; }
function readStore() { const data = JSON.parse(readFileSync(storeFile, 'utf8')); data.orders ||= []; data.chats ||= []; data.users ||= []; data.userSessions ||= []; data.reviews ||= []; data.settings ||= { maintenance: false, maintenanceMessage: 'DigiePro sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.' }; let changed = false; for (const product of data.products || []) if (typeof product.autoRestock !== 'boolean') { product.autoRestock = false; changed = true; } if ((data.schemaVersion || 0) < 6) { data.reviews = (data.reviews || []).filter((review) => !review.isSample && !String(review.id || '').startsWith('sample-')); data.reviews.push(...SAMPLE_REVIEWS.filter((review) => !data.reviews.some((item) => item.id === review.id))); for (const order of data.orders) if (order.status === 'completed' && !order.soldApplied) { for (const line of order.items || []) { const product = data.products.find((item) => item.id === line.id); if (product) { product.sold = Number(product.sold || 0) + Number(line.quantity || 0); syncProduct(product); } } order.soldApplied = true; } data.schemaVersion = STORE_SCHEMA_VERSION; changed = true; } if (expirePendingOrders(data)) changed = true; if (changed) writeStore(data); return data; }
function writeStore(data) { writeFileSync(storeFile, JSON.stringify(data, null, 2)); }
function sendJson(response, status, data, headers = {}) { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers }); response.end(JSON.stringify(data)); }
function readBody(request) { return new Promise((resolve, reject) => { let body = ''; request.on('data', (chunk) => { body += chunk; if (body.length > 1e6) request.destroy(); }); request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); } }); request.on('error', reject); }); }
function getCookie(request, name) { const part = (request.headers.cookie || '').split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`)); return part ? part.slice(name.length + 1) : ''; }
function isAdmin(request) { return getCookie(request, 'digiepro_admin') === adminToken; }
function hashPassword(password, salt) { return scryptSync(password, salt, 32).toString('hex'); }
function hashToken(token) { return createHash('sha256').update(token).digest('hex'); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function resellerMinimum(price) { return Number(price) > 20000 ? 3 : 5; }
function resellerPrice(price) { return Math.round(Number(price) * 0.92); }
function currentLocalUser(request, store) { const token = getCookie(request, 'digiepro_user'); const session = store.userSessions.find((item) => item.tokenHash === hashToken(token) && new Date(item.expiresAt) > new Date()); const user = session && store.users.find((item) => item.id === session.userId); return user && !user.blocked ? user : null; }
function isRateLimited(key) { const item = loginAttempts.get(key); return Boolean(item && Date.now() - item.started < 900000 && item.count >= 5); }
function recordFailure(key) { const item = loginAttempts.get(key); loginAttempts.set(key, item && Date.now() - item.started < 900000 ? { ...item, count: item.count + 1 } : { count: 1, started: Date.now() }); }
function createUserSession(store, userId) { const token = randomBytes(32).toString('hex'); store.userSessions = store.userSessions.filter((item) => new Date(item.expiresAt) > new Date()); store.userSessions.push({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() }); return token; }

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/seed-store.json') { response.writeHead(404).end('Not found'); return; }
  if (pathname === '/bolehnihadmin') { response.writeHead(302, { Location: '/bolehdong' }); response.end(); return; }
  const adminAsset = ['/admin.html', '/admin.js', '/admin.css', '/admin-chat.css', '/admin-audit.css'].includes(pathname);
  if (pathname !== '/bolehdong' && !pathname.startsWith('/api/admin/') && !adminAsset) { const store = readStore(); if (store.settings.maintenance) { if (pathname.startsWith('/api/')) { sendJson(response, 503, { error: store.settings.maintenanceMessage, maintenance: true }); return; } response.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DigiePro Maintenance</title><style>body{min-height:100vh;display:grid;place-items:center;margin:0;background:#eef8f6;font-family:Arial}.box{max-width:500px;padding:36px;text-align:center;background:white;border-radius:8px}.box p{line-height:1.7;color:#65736f}</style><main class="box"><h1>DigiePro sedang dirawat</h1><p>${store.settings.maintenanceMessage}</p><button onclick="location.reload()">Coba lagi</button></main></html>`); return; } }
  if (pathname === '/api/auth/register' && request.method === 'POST') {
    try { const body = await readBody(request); const name = String(body.name || '').trim().slice(0, 80); const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || ''); const deviceId = String(body.deviceId || '').trim(); if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return sendJson(response, 400, { error: 'Nama, email, atau password belum valid. Password minimal 8 karakter.' }); if (!/^[a-zA-Z0-9-]{8,100}$/.test(deviceId)) return sendJson(response, 400, { error: 'Identitas perangkat tidak valid. Muat ulang halaman lalu coba lagi.' }); const store = readStore(); if (store.users.some((item) => item.email === email)) return sendJson(response, 409, { error: 'Email sudah terdaftar. Silakan masuk.' }); if (store.users.filter((item) => item.deviceId === deviceId).length >= 2) return sendJson(response, 403, { error: 'Perangkat ini sudah mencapai batas maksimal 2 akun.' }); const salt = randomBytes(16).toString('hex'); const user = { id: `usr-${randomBytes(12).toString('hex')}`, name, email, salt, passwordHash: hashPassword(password, salt), deviceId, blocked: false, createdAt: new Date().toISOString() }; store.users.push(user); const token = createUserSession(store, user.id); writeStore(store); sendJson(response, 201, { user: publicUser(user) }, { 'Set-Cookie': `digiepro_user=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` }); } catch { sendJson(response, 400, { error: 'Data pendaftaran tidak valid.' }); } return;
  }
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    try { const body = await readBody(request); const email = String(body.email || '').trim().toLowerCase(); const key = `user:${request.socket.remoteAddress}:${email}`; if (isRateLimited(key)) return sendJson(response, 429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }); const store = readStore(); const user = store.users.find((item) => item.email === email); const actual = user ? Buffer.from(hashPassword(String(body.password || ''), user.salt), 'hex') : Buffer.alloc(32); const expected = user ? Buffer.from(user.passwordHash, 'hex') : Buffer.alloc(32, 1); if (!user || !timingSafeEqual(actual, expected)) { recordFailure(key); return sendJson(response, 401, { error: 'Email atau password salah.' }); } if (user.blocked) return sendJson(response, 403, { error: 'Akun ini diblokir. Hubungi admin melalui chat bantuan.' }); loginAttempts.delete(key); const token = createUserSession(store, user.id); writeStore(store); sendJson(response, 200, { user: publicUser(user) }, { 'Set-Cookie': `digiepro_user=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` }); } catch { sendJson(response, 400, { error: 'Permintaan login tidak valid.' }); } return;
  }
  if (pathname === '/api/auth/me' && request.method === 'GET') { const store = readStore(); const user = currentLocalUser(request, store); sendJson(response, user ? 200 : 401, { user: user ? publicUser(user) : null }); return; }
  if (pathname === '/api/auth/logout' && request.method === 'POST') { const token = getCookie(request, 'digiepro_user'); const store = readStore(); store.userSessions = store.userSessions.filter((item) => item.tokenHash !== hashToken(token)); writeStore(store); sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'digiepro_user=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' }); return; }
  if (pathname === '/api/store' && request.method === 'GET') { const store = readStore(); sendJson(response, 200, { products: store.products, maintenance: store.settings.maintenance }); return; }
  if (pathname === '/api/reviews' && request.method === 'GET') { const store = readStore(); sendJson(response, 200, { reviews: [...store.reviews].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) }); return; }
  if (pathname === '/api/reviews' && request.method === 'POST') { try { const body = await readBody(request); const store = readStore(); const user = currentLocalUser(request, store); if (!user) return sendJson(response, 401, { error: 'Silakan masuk untuk memberi ulasan.' }); const order = store.orders.find((item) => item.id === String(body.orderId) && item.userId === user.id); const productId = Number(body.productId); const rating = Number(body.rating); const comment = String(body.comment || '').trim().slice(0, 600); if (!order || order.status !== 'completed' || !order.items.some((line) => line.id === productId)) return sendJson(response, 403, { error: 'Ulasan hanya tersedia untuk pesanan yang sudah selesai.' }); if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 8) return sendJson(response, 400, { error: 'Pilih bintang dan tulis minimal 8 karakter.' }); if (store.reviews.some((item) => item.orderId === order.id && item.productId === productId)) return sendJson(response, 409, { error: 'Produk ini sudah kamu ulas.' }); const review = { id: `rev-${randomBytes(10).toString('hex')}`, orderId: order.id, productId, userId: user.id, customerName: user.name.split(' ')[0], rating, comment, verified: true, createdAt: new Date().toISOString() }; store.reviews.unshift(review); writeStore(store); sendJson(response, 201, review); } catch { sendJson(response, 400, { error: 'Ulasan tidak valid.' }); } return; }
  if (pathname === '/api/orders/me' && request.method === 'GET') { const store = readStore(); const user = currentLocalUser(request, store); if (!user) return sendJson(response, 401, { error: 'Silakan masuk untuk melihat pesanan.' }); sendJson(response, 200, { orders: store.orders.filter((order) => order.userId === user.id).sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))), reviews: store.reviews.filter((review) => review.userId === user.id) }); return; }
  const chatMatch = pathname.match(/^\/api\/chat\/([a-zA-Z0-9-]{6,80})$/);
  if (chatMatch && request.method === 'GET') { const store = readStore(); const chat = store.chats.find((item) => item.id === chatMatch[1]); sendJson(response, 200, chat || { id: chatMatch[1], messages: [] }); return; }
  if (chatMatch && request.method === 'POST') {
    try { const body = await readBody(request); const text = String(body.message || '').trim().slice(0, 1000); if (!text) return sendJson(response, 400, { error: 'Pesan kosong.' }); const store = readStore(); let chat = store.chats.find((item) => item.id === chatMatch[1]); if (!chat) { chat = { id: chatMatch[1], customer: body.customer || {}, messages: [], updatedAt: new Date().toISOString() }; store.chats.unshift(chat); } if (body.customer) chat.customer = { ...chat.customer, ...body.customer }; chat.messages.push({ id: randomBytes(8).toString('hex'), sender: 'customer', text, createdAt: new Date().toISOString() }); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 201, chat); } catch { sendJson(response, 400, { error: 'Pesan tidak valid.' }); }
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
        const regularUnitPrice = product.price + (ownGmail ? 5000 : 0); const unitPrice = reseller ? resellerPrice(regularUnitPrice) : regularUnitPrice; const lineTotal = unitPrice * quantity;
        subtotal += lineTotal;
        normalizedItems.push({ id: product.id, title: product.title, quantity, ownGmail, reseller, unitPrice, regularUnitPrice, lineTotal });
      }
      const adminFee = 99; const total = subtotal + adminFee;
      const customer = { name: user.name, email: user.email, whatsapp: String(body.customer?.whatsapp || '').trim().slice(0, 30), note: String(body.customer?.note || '').trim().slice(0, 500) }; if (!/^\+?[0-9\s-]{8,20}$/.test(customer.whatsapp)) return sendJson(response, 400, { error: 'Nomor WhatsApp belum valid.' });
      const createdAt = new Date(); const order = { id: `DGP-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`, userId: user.id, customer, chatId: body.chatId || '', items: normalizedItems, subtotal, adminFee, total, status: 'pending', createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + ORDER_RESERVATION_MS).toISOString() };
      if (!reserveOrderStock(store, order)) return sendJson(response, 409, { error: 'Stok berubah dan tidak lagi mencukupi.' }); applyAutoRestock(store);
      if (body.chatId) { let chat = store.chats.find((item) => item.id === body.chatId); if (!chat) { chat = { id: body.chatId, customer, messages: [], updatedAt: new Date().toISOString() }; store.chats.unshift(chat); } chat.customer = { ...chat.customer, ...customer }; chat.orderId = order.id; }
      store.orders.unshift(order); writeStore(store); sendJson(response, 201, order);
    } catch { sendJson(response, 400, { error: 'Data pesanan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/admin/login' && request.method === 'POST') {
    try { if (!adminPassword) return sendJson(response, 503, { error: 'ADMIN_PASSWORD belum dikonfigurasi.' }); const body = await readBody(request); const key = `admin:${request.socket.remoteAddress}`; if (isRateLimited(key)) return sendJson(response, 429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }); if (body.password !== adminPassword) { recordFailure(key); return sendJson(response, 401, { error: 'Password salah.' }); } loginAttempts.delete(key); sendJson(response, 200, { ok: true }, { 'Set-Cookie': `digiepro_admin=${adminToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800` }); } catch { sendJson(response, 400, { error: 'Permintaan tidak valid.' }); }
    return;
  }
  if (pathname === '/api/admin/logout' && request.method === 'POST') { sendJson(response, 200, { ok: true }, { 'Set-Cookie': 'digiepro_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' }); return; }
  if (pathname === '/api/admin/state' && request.method === 'GET') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); const store = readStore(); const users = store.users.map(({ id, name, email, createdAt, blocked = false, deviceId = '' }) => { const orders = store.orders.filter((order) => order.userId === id); return { id, name, email, createdAt, blocked, deviceId, orderCount: orders.length, totalSpent: orders.filter((order) => ['paid', 'completed'].includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0), orders }; }); sendJson(response, 200, { products: store.products, orders: store.orders, chats: store.chats, users, reviews: store.reviews, settings: store.settings }); return; }

  const adminUserBlockMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/block$/);
  if (adminUserBlockMatch && request.method === 'PUT') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); try { const body = await readBody(request); const store = readStore(); const user = store.users.find((item) => item.id === adminUserBlockMatch[1]); if (!user) return sendJson(response, 404, { error: 'Akun tidak ditemukan.' }); user.blocked = Boolean(body.blocked); if (user.blocked) store.userSessions = store.userSessions.filter((item) => item.userId !== user.id); writeStore(store); sendJson(response, 200, { ok: true, blocked: user.blocked }); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); } return; }

  const adminChatMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/reply$/);
  if (adminChatMatch && request.method === 'POST') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const text = String(body.message || '').trim().slice(0, 1000); if (!text) return sendJson(response, 400, { error: 'Pesan kosong.' }); const store = readStore(); const chat = store.chats.find((item) => item.id === adminChatMatch[1]); if (!chat) return sendJson(response, 404, { error: 'Chat tidak ditemukan.' }); chat.messages.push({ id: randomBytes(8).toString('hex'), sender: 'admin', text, createdAt: new Date().toISOString() }); chat.updatedAt = new Date().toISOString(); writeStore(store); sendJson(response, 201, chat); } catch { sendJson(response, 400, { error: 'Pesan tidak valid.' }); }
    return;
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (productMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const store = readStore(); const product = store.products.find((item) => item.id === Number(productMatch[1])); if (!product) return sendJson(response, 404, { error: 'Produk tidak ditemukan.' }); const stock = Number(body.stock); const price = Number(body.price); if (!Number.isInteger(stock) || stock < 0 || stock > 49 || !Number.isInteger(price) || price < 0) return sendJson(response, 400, { error: 'Harga atau stok tidak valid.' }); Object.assign(product, { stock, price, enabled: Boolean(body.enabled), autoRestock: Boolean(body.autoRestock) }); syncProduct(product); applyAutoRestock(store); writeStore(store); sendJson(response, 200, product); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); }
    return;
  }

  const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if (orderMatch && request.method === 'PUT') {
    if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' });
    try { const body = await readBody(request); const store = readStore(); const order = store.orders.find((item) => item.id === orderMatch[1]); if (!order) return sendJson(response, 404, { error: 'Pesanan tidak ditemukan.' }); if (!['pending', 'paid', 'completed', 'cancelled'].includes(body.status)) return sendJson(response, 400, { error: 'Status tidak valid.' }); const previous = order.status; const next = body.status; const released = ['cancelled', 'expired'].includes(previous); const willRelease = ['cancelled', 'expired'].includes(next); if (released && !willRelease && !reserveOrderStock(store, order)) return sendJson(response, 409, { error: 'Stok tidak cukup.' }); if (!released && willRelease) releaseOrderStock(store, order); if (next === 'completed' && !order.soldApplied) { for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Number(product.sold || 0) + line.quantity; syncProduct(product); } } order.soldApplied = true; } if (previous === 'completed' && next !== 'completed' && order.soldApplied) { for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Math.max(0, Number(product.sold || 0) - line.quantity); syncProduct(product); } } order.soldApplied = false; } order.status = next; order.updatedAt = new Date().toISOString(); if (next === 'completed') order.completedAt = order.updatedAt; applyAutoRestock(store); writeStore(store); sendJson(response, 200, order); } catch { sendJson(response, 400, { error: 'Data tidak valid.' }); }
    return;
  }

  if (pathname === '/api/admin/settings' && request.method === 'PUT') { if (!isAdmin(request)) return sendJson(response, 401, { error: 'Unauthorized' }); try { const body = await readBody(request); const store = readStore(); store.settings = { ...store.settings, maintenance: Boolean(body.maintenance), maintenanceMessage: String(body.maintenanceMessage || '').trim().slice(0, 240) || 'DigiePro sedang melakukan pemeliharaan singkat.' }; writeStore(store); sendJson(response, 200, store.settings); } catch { sendJson(response, 400, { error: 'Pengaturan tidak valid.' }); } return; }

  let requestedPath = pathname;
  if (pathname === '/bolehdong') requestedPath = '/admin.html';
  let file = normalize(join(root, requestedPath === '/' ? 'index.html' : requestedPath));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) { response.writeHead(404).end('Not found'); return; }
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); createReadStream(file).pipe(response);
});

server.listen(port, '0.0.0.0', () => console.log(`DigiePro running on port ${port}`));
