const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
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
let authTablesReady = false;
class ApiResult extends Error { constructor(response) { super('api-result'); this.response = response; } }

function migrateStore(store) {
  let changed = false;
  const overrides = { 46473: { stock: 13, available_stock: 13 }, 23915: { stock: 3, available_stock: 3 } };
  if ((store.schemaVersion || 0) < 3) {
    for (const product of store.products || []) {
      const override = overrides[product.id];
      if (override) {
        Object.assign(product, override, { warranty: '30 hari', access: 'Akun resmi privat', description: OFFICIAL_PRIVATE_DESCRIPTION });
        product.total_stock = Number(product.sold || 0) + product.stock;
      }
    }
    changed = true;
  }
  store.orders ||= []; store.chats ||= []; store.reviews ||= [];
  store.settings ||= { maintenance: false, maintenanceMessage: 'DigiePro sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.' };
  for (const product of store.products || []) if (typeof product.autoRestock !== 'boolean') product.autoRestock = false;
  if ((store.schemaVersion || 0) < 6) {
    store.reviews = (store.reviews || []).filter((review) => !review.isSample && !String(review.id || '').startsWith('sample-'));
    store.reviews.push(...SAMPLE_REVIEWS.filter((review) => !store.reviews.some((item) => item.id === review.id)));
    for (const order of store.orders) if (order.status === 'completed' && !order.soldApplied) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Number(product.sold || 0) + Number(line.quantity || 0); syncProduct(product); } } order.soldApplied = true; }
    changed = true;
  }
  if (store.schemaVersion !== STORE_SCHEMA_VERSION) { store.schemaVersion = STORE_SCHEMA_VERSION; changed = true; }
  return changed;
}

function syncProduct(product) { product.stock = Math.max(0, Math.min(49, Number(product.stock || 0))); product.available_stock = product.stock; product.total_stock = Number(product.sold || 0) + product.stock; }
function applyAutoRestock(store) { let changed = false; for (const product of store.products || []) { if (product.autoRestock && product.enabled && product.stock < 2) { product.stock = Math.min(49, product.stock + 8); syncProduct(product); changed = true; } } return changed; }
function releaseOrderStock(store, order) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (product) { product.stock = Math.min(49, product.stock + Number(line.quantity || 0)); syncProduct(product); } } }
function reserveOrderStock(store, order) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (!product || product.stock < line.quantity) return false; } for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); product.stock -= line.quantity; syncProduct(product); } return true; }
function expirePendingOrders(store) { let changed = false; const now = Date.now(); for (const order of store.orders || []) { if (order.status === 'pending' && new Date(order.expiresAt || new Date(new Date(order.createdAt).getTime() + ORDER_RESERVATION_MS)).getTime() <= now) { releaseOrderStock(store, order); order.status = 'expired'; order.expiredAt = new Date().toISOString(); changed = true; } } if (applyAutoRestock(store)) changed = true; return changed; }

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...jsonHeaders, ...headers } });
}

function randomId(bytes = 8) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function stateVersion() { return `${new Date().toISOString()}-${randomId(4)}`; }
function attachStoreVersion(store, version) { Object.defineProperty(store, '__version', { value: version, writable: true, enumerable: false }); return store; }
function stopMutation(response) { throw new ApiResult(response); }

async function ensureStore(env) {
  if (!env.DB) throw new Error('D1 binding DB belum dikonfigurasi.');
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at TEXT NOT NULL)').run();
  const row = await env.DB.prepare('SELECT data, updated_at FROM app_state WHERE id = 1').first();
  if (row?.data) {
    const store = attachStoreVersion(JSON.parse(row.data), row.updated_at);
    const changed = migrateStore(store);
    if ((expirePendingOrders(store) || changed) && !(await saveStore(env, store))) return await ensureStore(env);
    return store;
  }

  const seedResponse = await env.ASSETS.fetch(new Request('https://assets.local/seed-store.json'));
  if (!seedResponse.ok) throw new Error('Seed katalog tidak ditemukan.');
  const seed = await seedResponse.json();
  seed.orders = [];
  seed.chats = [];
  seed.reviews = [];
  seed.settings ||= { maintenance: false, maintenanceMessage: 'DigiePro sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.' };
  migrateStore(seed);
  const version = stateVersion();
  const insert = await env.DB.prepare('INSERT OR IGNORE INTO app_state (id, data, updated_at) VALUES (1, ?, ?)').bind(JSON.stringify(seed), version).run();
  if (!insert.meta?.changes) return await ensureStore(env);
  return attachStoreVersion(seed, version);
}

async function saveStore(env, store) {
  const version = stateVersion();
  const expected = store.__version;
  const result = expected
    ? await env.DB.prepare('UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1 AND updated_at = ?').bind(JSON.stringify(store), version, expected).run()
    : await env.DB.prepare('UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1').bind(JSON.stringify(store), version).run();
  if (!result.meta?.changes) return false;
  store.__version = version;
  return true;
}

async function mutateStore(env, mutator) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const store = await ensureStore(env);
    try {
      const result = await mutator(store);
      if (await saveStore(env, store)) return result;
    } catch (error) {
      if (error instanceof ApiResult) return error.response;
      throw error;
    }
  }
  return json({ error: 'Data toko sedang diperbarui. Coba ulangi beberapa detik lagi.' }, 409);
}

async function ensureAuthTables(env) {
  if (authTablesReady) return;
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS user_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start INTEGER NOT NULL)')
  ]);
  const columns = await env.DB.prepare('PRAGMA table_info(users)').all();
  const names = new Set((columns.results || []).map((column) => column.name));
  if (!names.has('device_id')) await env.DB.prepare("ALTER TABLE users ADD COLUMN device_id TEXT NOT NULL DEFAULT ''").run();
  if (!names.has('blocked')) await env.DB.prepare('ALTER TABLE users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0').run();
  authTablesReady = true;
}

function bytesToHex(value) { return Array.from(new Uint8Array(value), (byte) => byte.toString(16).padStart(2, '0')).join(''); }
async function sha256(value) { return bytesToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))); }
async function hashPassword(password, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return bytesToHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, material, 256));
}
function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}
function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function resellerMinimum(price) { return Number(price) > 20000 ? 3 : 5; }
function resellerPrice(price) { return Math.round(Number(price) * 0.92); }

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
  const user = await env.DB.prepare('SELECT users.id, users.name, users.email, users.blocked FROM user_sessions JOIN users ON users.id = user_sessions.user_id WHERE user_sessions.token_hash = ? AND user_sessions.expires_at > ?').bind(await sha256(token), new Date().toISOString()).first();
  return user && !Number(user.blocked) ? publicUser(user) : null;
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
    const body = await readBody(request); const name = String(body.name || '').trim().slice(0, 80); const email = normalizeEmail(body.email); const password = String(body.password || ''); const deviceId = String(body.deviceId || '').trim();
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return json({ error: 'Nama, email, atau password belum valid. Password minimal 8 karakter.' }, 400);
    if (!/^[a-zA-Z0-9-]{8,100}$/.test(deviceId)) return json({ error: 'Identitas perangkat tidak valid. Muat ulang halaman lalu coba lagi.' }, 400);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return json({ error: 'Email sudah terdaftar. Silakan masuk.' }, 409);
    const deviceCount = await env.DB.prepare('SELECT COUNT(*) AS total FROM users WHERE device_id = ?').bind(deviceId).first();
    if (Number(deviceCount?.total || 0) >= 2) return json({ error: 'Perangkat ini sudah mencapai batas maksimal 2 akun.' }, 403);
    const id = `usr-${randomId(12)}`; const salt = randomId(16); const createdAt = new Date().toISOString();
    await env.DB.prepare('INSERT INTO users (id, name, email, password_hash, salt, created_at, device_id, blocked) VALUES (?, ?, ?, ?, ?, ?, ?, 0)').bind(id, name, email, await hashPassword(password, salt), salt, createdAt, deviceId).run();
    const user = { id, name, email }; return json({ user }, 201, { 'Set-Cookie': await createUserSession(env, id) });
  }
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request); const email = normalizeEmail(body.email); const password = String(body.password || ''); const ip = request.headers.get('CF-Connecting-IP') || 'unknown'; const key = `user:${ip}:${email}`;
    if (await rateLimited(env, key)) return json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }, 429);
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user || !safeEqual(await hashPassword(password, user.salt), user.password_hash)) { await recordFailure(env, key); return json({ error: 'Email atau password salah.' }, 401); }
    if (Number(user.blocked)) return json({ error: 'Akun ini diblokir. Hubungi admin melalui chat bantuan.' }, 403);
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
    return json({ products: store.products, maintenance: store.settings?.maintenance || false });
  }

  if (pathname === '/api/reviews' && request.method === 'GET') {
    const store = await ensureStore(env);
    return json({ reviews: [...store.reviews].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))) });
  }

  if (pathname === '/api/reviews' && request.method === 'POST') {
    const user = await currentUser(request, env); if (!user) return json({ error: 'Silakan masuk untuk memberi ulasan.' }, 401);
    const body = await readBody(request); const orderId = String(body.orderId || ''); const productId = Number(body.productId); const rating = Number(body.rating); const comment = String(body.comment || '').trim().slice(0, 600);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 8) return json({ error: 'Pilih 1-5 bintang dan tulis komentar minimal 8 karakter.' }, 400);
    return await mutateStore(env, (store) => {
      const order = store.orders.find((item) => item.id === orderId && item.userId === user.id);
      if (!order || order.status !== 'completed' || !order.items.some((line) => line.id === productId)) stopMutation(json({ error: 'Ulasan hanya tersedia untuk produk dari pesanan yang sudah selesai.' }, 403));
      if (store.reviews.some((review) => review.orderId === orderId && review.productId === productId)) stopMutation(json({ error: 'Produk ini sudah kamu ulas.' }, 409));
      const review = { id: `rev-${randomId(10)}`, orderId, productId, userId: user.id, customerName: user.name.split(' ')[0], rating, comment, verified: true, createdAt: new Date().toISOString() };
      store.reviews.unshift(review);
      return json(review, 201);
    });
  }

  if (pathname === '/api/orders/me' && request.method === 'GET') {
    const user = await currentUser(request, env);
    if (!user) return json({ error: 'Silakan masuk untuk melihat pesanan.' }, 401);
    const store = await ensureStore(env);
    return json({ orders: store.orders.filter((order) => order.userId === user.id).sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))), reviews: store.reviews.filter((review) => review.userId === user.id) });
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
    return await mutateStore(env, (store) => {
      let chat = store.chats.find((item) => item.id === chatMatch[1]);
      if (!chat) {
        chat = { id: chatMatch[1], customer: body.customer || {}, messages: [], updatedAt: new Date().toISOString() };
        store.chats.unshift(chat);
      }
      if (body.customer) chat.customer = { ...chat.customer, ...body.customer };
      chat.messages.push({ id: randomId(), sender: 'customer', text, createdAt: new Date().toISOString() });
      chat.updatedAt = new Date().toISOString();
      return json(chat, 201);
    });
  }

  if (pathname === '/api/orders' && request.method === 'POST') {
    const user = await currentUser(request, env);
    if (!user) return json({ error: 'Silakan masuk sebelum membuat pesanan.' }, 401);
    const body = await readBody(request);
    if (!Array.isArray(body.items) || !body.items.length) return json({ error: 'Keranjang kosong.' }, 400);
    const customer = { name: user.name, email: user.email, whatsapp: String(body.customer?.whatsapp || '').trim().slice(0, 30), note: String(body.customer?.note || '').trim().slice(0, 500) };
    if (!/^\+?[0-9\s-]{8,20}$/.test(customer.whatsapp)) return json({ error: 'Nomor WhatsApp belum valid.' }, 400);
    return await mutateStore(env, (store) => {
      const pendingOrders = store.orders.filter((order) => order.userId === user.id && order.status === 'pending');
      if (pendingOrders.length >= 2) stopMutation(json({ error: 'Kamu masih punya 2 pesanan menunggu pembayaran. Bayar atau tunggu pesanan kedaluwarsa sebelum membuat pesanan baru.' }, 429));
      let subtotal = 0;
      const normalizedItems = [];
      const requestedStock = new Map();
      for (const line of body.items) {
        const product = store.products.find((item) => item.id === Number(line.id));
        const quantity = Number(line.quantity);
        if (!product || !product.enabled) stopMutation(json({ error: 'Produk tidak tersedia.' }, 400));
        const requested = (requestedStock.get(product.id) || 0) + quantity;
        if (!Number.isInteger(quantity) || quantity < 1 || requested > product.stock) stopMutation(json({ error: `Stok ${product.title} tidak mencukupi.` }, 409));
        requestedStock.set(product.id, requested);
        const ownGmail = product.title.includes('CHATGPT PLUS') && Boolean(line.ownGmail);
        const reseller = Boolean(line.reseller);
        const minimum = resellerMinimum(product.price);
        if (reseller && quantity < minimum) stopMutation(json({ error: `Harga reseller ${product.title} minimal ${minimum} item.` }, 400));
        const regularUnitPrice = product.price + (ownGmail ? 5000 : 0);
        const unitPrice = reseller ? resellerPrice(regularUnitPrice) : regularUnitPrice;
        const lineTotal = unitPrice * quantity;
        subtotal += lineTotal;
        normalizedItems.push({ id: product.id, title: product.title, quantity, ownGmail, reseller, unitPrice, regularUnitPrice, lineTotal });
      }
      const adminFee = 99;
      const createdAt = new Date();
      const order = { id: `DGP-${Date.now()}-${randomId(2).toUpperCase()}`, userId: user.id, customer, chatId: body.chatId || '', items: normalizedItems, subtotal, adminFee, total: subtotal + adminFee, status: 'pending', createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + ORDER_RESERVATION_MS).toISOString() };
      if (!reserveOrderStock(store, order)) stopMutation(json({ error: 'Stok berubah dan tidak lagi mencukupi. Muat ulang keranjang.' }, 409));
      applyAutoRestock(store);
      if (body.chatId) {
        let chat = store.chats.find((item) => item.id === body.chatId);
        if (!chat) {
          chat = { id: body.chatId, customer, messages: [], updatedAt: new Date().toISOString() };
          store.chats.unshift(chat);
        }
        chat.customer = { ...chat.customer, ...customer };
        chat.orderId = order.id;
      }
      store.orders.unshift(order);
      return json(order, 201);
    });
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
    await ensureAuthTables(env);
    const store = await ensureStore(env);
    const rows = await env.DB.prepare('SELECT id, name, email, created_at, blocked, device_id FROM users ORDER BY created_at DESC').all();
    const users = (rows.results || []).map((user) => {
      const orders = store.orders.filter((order) => order.userId === user.id);
      return { id: user.id, name: user.name, email: user.email, createdAt: user.created_at, blocked: Boolean(user.blocked), deviceId: user.device_id, orderCount: orders.length, totalSpent: orders.filter((order) => ['paid', 'completed'].includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0), orders };
    });
    return json({ ...store, users });
  }

  const adminUserBlockMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/block$/);
  if (adminUserBlockMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    await ensureAuthTables(env);
    const body = await readBody(request);
    const blocked = Boolean(body.blocked);
    const result = await env.DB.prepare('UPDATE users SET blocked = ? WHERE id = ?').bind(blocked ? 1 : 0, adminUserBlockMatch[1]).run();
    if (!result.meta?.changes) return json({ error: 'Akun tidak ditemukan.' }, 404);
    if (blocked) await env.DB.prepare('DELETE FROM user_sessions WHERE user_id = ?').bind(adminUserBlockMatch[1]).run();
    return json({ ok: true, blocked });
  }

  const adminChatMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/reply$/);
  if (adminChatMatch && request.method === 'POST') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const text = String(body.message || '').trim().slice(0, 1000);
    if (!text) return json({ error: 'Pesan kosong.' }, 400);
    return await mutateStore(env, (store) => {
      const chat = store.chats.find((item) => item.id === adminChatMatch[1]);
      if (!chat) stopMutation(json({ error: 'Chat tidak ditemukan.' }, 404));
      chat.messages.push({ id: randomId(), sender: 'admin', text, createdAt: new Date().toISOString() });
      chat.updatedAt = new Date().toISOString();
      return json(chat, 201);
    });
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (productMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const stock = Number(body.stock);
    const price = Number(body.price);
    if (!Number.isInteger(stock) || stock < 0 || stock > 49 || !Number.isInteger(price) || price < 0) return json({ error: 'Harga atau stok tidak valid.' }, 400);
    return await mutateStore(env, (store) => {
      const product = store.products.find((item) => item.id === Number(productMatch[1]));
      if (!product) stopMutation(json({ error: 'Produk tidak ditemukan.' }, 404));
      Object.assign(product, { stock, price, enabled: Boolean(body.enabled), autoRestock: Boolean(body.autoRestock) }); syncProduct(product); applyAutoRestock(store);
      return json(product);
    });
  }

  const orderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if (orderMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    if (!['pending', 'paid', 'completed', 'cancelled'].includes(body.status)) return json({ error: 'Status tidak valid.' }, 400);
    return await mutateStore(env, (store) => {
      const order = store.orders.find((item) => item.id === orderMatch[1]);
      if (!order) stopMutation(json({ error: 'Pesanan tidak ditemukan.' }, 404));
      const previous = order.status; const next = body.status; const released = ['cancelled', 'expired'].includes(previous); const willRelease = ['cancelled', 'expired'].includes(next);
      if (released && !willRelease && !reserveOrderStock(store, order)) stopMutation(json({ error: 'Stok tidak cukup untuk mengaktifkan kembali pesanan.' }, 409));
      if (!released && willRelease) releaseOrderStock(store, order);
      if (next === 'completed' && !order.soldApplied) { for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Number(product.sold || 0) + line.quantity; syncProduct(product); } } order.soldApplied = true; }
      if (previous === 'completed' && next !== 'completed' && order.soldApplied) { for (const line of order.items) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Math.max(0, Number(product.sold || 0) - line.quantity); syncProduct(product); } } order.soldApplied = false; }
      order.status = next; order.updatedAt = new Date().toISOString(); if (next === 'completed') order.completedAt = order.updatedAt;
      applyAutoRestock(store);
      return json(order);
    });
  }

  if (pathname === '/api/admin/settings' && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    return await mutateStore(env, (store) => {
      store.settings = { ...store.settings, maintenance: Boolean(body.maintenance), maintenanceMessage: String(body.maintenanceMessage || '').trim().slice(0, 240) || 'DigiePro sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.' };
      return json(store.settings);
    });
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
      const adminAsset = ['/admin.html', '/admin.js', '/admin.css', '/admin-chat.css', '/admin-audit.css'].includes(url.pathname);
      if (!url.pathname.startsWith('/api/admin/') && !adminAsset) {
        const store = await ensureStore(env);
        if (store.settings?.maintenance) {
          if (url.pathname.startsWith('/api/')) return json({ error: store.settings.maintenanceMessage, maintenance: true }, 503);
          const message = String(store.settings.maintenanceMessage || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
          return new Response(`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DigiePro Maintenance</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#eef8f6;color:#17211f;font-family:Arial,sans-serif}.box{width:min(520px,100%);background:#fff;border:1px solid #cee2dd;border-radius:8px;padding:36px;text-align:center;box-shadow:0 18px 55px #183c3420}.logo{width:52px;height:52px;margin:auto;display:grid;place-items:center;border-radius:8px;background:#17211f;color:#42d5ae;font-weight:900}.box h1{font-size:25px;margin:20px 0 10px}.box p{color:#60706c;line-height:1.7}.box button{margin-top:16px;height:42px;padding:0 20px;border:0;border-radius:5px;background:#0b9474;color:#fff;font-weight:700}</style><main class="box"><div class="logo">DP</div><h1>Sedang dalam pemeliharaan</h1><p>${message}</p><button onclick="location.reload()">Coba lagi</button></main></html>`, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
        }
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
