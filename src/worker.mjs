const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const STORE_SCHEMA_VERSION = 12;
const OFFICIAL_PRIVATE_DESCRIPTION = 'Akun resmi dan bukan akun ilegal. Akses bersifat privat, bukan sharing, dengan garansi 30 hari sesuai ketentuan penggunaan DigiePro.';
const CLAUDE_PRO_DESCRIPTION = 'Akun resmi Claude Pro login di claude.ai. Akun Vietnam dengan pembayaran credit card Vietnam, garansi 30 hari, dan dijamin aman dari deactive selama tidak mengubah pembayaran, info login seperti email dan password, serta tidak terlalu sering ganti device.';
const ORDER_RESERVATION_MS = 30 * 60 * 1000;
const DOLA_PRODUCT = { id: 91001, is_best_seller: false, title: 'DOLA AI 1 BULAN', cashback_amount: 0, cashback_type: 'amount', thumbnail: 'https://sf-sf-flow-web-cdn-nontt.ciciaicdn.com/obj/ocean-flow-web-sg/favicon/new-dola/192x192.png', price: 37000, available_stock: 8, sold: 34, total_stock: 42, has_wholesale: false, stock: 8, enabled: true, featuredRank: 5, duration: '1 bulan', warranty: 'Garansi akses', access: 'Dola AI', description: 'Dola AI adalah asisten chat AI untuk percakapan, menulis, menerjemahkan, coding, mencari inspirasi, dan membahas berbagai topik. Produk aktif 1 bulan sesuai ketentuan penggunaan DigiePro.' };
const GPT_EDU_K12_DESCRIPTION = 'Akses GPT Edu K12 untuk kebutuhan belajar, membuat materi, merangkum, menulis, riset ringan, pendampingan tugas sekolah, dan penggunaan Codex untuk belajar coding. Produk tidak menyediakan opsi email sendiri; detail akses dan panduan penggunaan dikirim admin setelah pembayaran.';
const GPT_EDU_K12_PRODUCT = { id: 92000, is_best_seller: true, title: 'GPT EDU K12', cashback_amount: 0, cashback_type: 'amount', thumbnail: 'https://cdn.gradual.com/images/https://d2xo500swnpgl1.cloudfront.net/uploads/oaiacademy/EDU-Content-Covers-37--16823a96-45ae-4dac-b79e-5c805bf5c7c3-1780455465231.jpeg?fit=scale-down&width=900', price: 360000, available_stock: 8, sold: 0, total_stock: 8, has_wholesale: false, stock: 8, enabled: true, featuredRank: 1, duration: '1 tahun', warranty: '3 bulan', access: 'GPT Edu K12 + Codex', description: GPT_EDU_K12_DESCRIPTION, variants: [
  { id: '1y', label: '1 Tahun', price: 360000, duration: '1 tahun', warranty: '3 bulan' },
  { id: '2y', label: '2 Tahun', price: 675000, duration: '2 tahun', warranty: '8 bulan' }
] };
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
  },
  {
    "id": "sample-61",
    "productId": 90002,
    "customerName": "starlyy1",
    "rating": 5,
    "comment": "mantap",
    "createdAt": "2026-07-18T11:30:00.000Z"
  },
  {
    "id": "sample-62",
    "productId": 46473,
    "customerName": "rioooo",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-18T09:15:00.000Z"
  },
  {
    "id": "sample-63",
    "productId": 90001,
    "customerName": "vaniya ct",
    "rating": 5,
    "comment": "bagus, awet juga",
    "createdAt": "2026-07-18T07:40:00.000Z"
  },
  {
    "id": "sample-64",
    "productId": 23843,
    "customerName": "meisya",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-17T21:20:00.000Z"
  },
  {
    "id": "sample-65",
    "productId": 46473,
    "customerName": "dinnnn",
    "rating": 4,
    "comment": "web llm nya kapan selesai maintenance bang?",
    "createdAt": "2026-07-17T18:55:00.000Z"
  },
  {
    "id": "sample-66",
    "productId": 90002,
    "customerName": "sarahh",
    "rating": 5,
    "comment": "akun gpt kena deactived langsung gercep diganti admin, sip lah",
    "createdAt": "2026-07-17T16:10:00.000Z"
  },
  {
    "id": "sample-67",
    "productId": 23725,
    "customerName": "no context bro",
    "rating": 5,
    "comment": "oke",
    "createdAt": "2026-07-17T13:05:00.000Z"
  },
  {
    "id": "sample-68",
    "productId": 91001,
    "customerName": "hafizzz",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-17T10:30:00.000Z"
  },
  {
    "id": "sample-69",
    "productId": 31181,
    "customerName": "bang ipul",
    "rating": 5,
    "comment": "mantap",
    "createdAt": "2026-07-17T08:00:00.000Z"
  },
  {
    "id": "sample-70",
    "productId": 46473,
    "customerName": "tikaa",
    "rating": 4,
    "comment": "lumayan, tapi pengirimannya agak lama dikit",
    "createdAt": "2026-07-16T22:45:00.000Z"
  },
  {
    "id": "sample-71",
    "productId": 90002,
    "customerName": "yogz",
    "rating": 5,
    "comment": "bagus",
    "createdAt": "2026-07-16T20:10:00.000Z"
  },
  {
    "id": "sample-72",
    "productId": 23935,
    "customerName": "zaraa",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-16T17:30:00.000Z"
  },
  {
    "id": "sample-73",
    "productId": 90001,
    "customerName": "cleoo",
    "rating": 5,
    "comment": "cepet aktifnya, makasih",
    "createdAt": "2026-07-16T14:55:00.000Z"
  },
  {
    "id": "sample-74",
    "productId": 25754,
    "customerName": "arielzz",
    "rating": 5,
    "comment": "sip",
    "createdAt": "2026-07-16T11:20:00.000Z"
  },
  {
    "id": "sample-75",
    "productId": 43262,
    "customerName": "bayu random",
    "rating": 4,
    "comment": "agak nunggu tapi akhirnya masuk juga",
    "createdAt": "2026-07-16T08:40:00.000Z"
  },
  {
    "id": "sample-76",
    "productId": 46473,
    "customerName": "maya",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-15T22:00:00.000Z"
  },
  {
    "id": "sample-77",
    "productId": 90002,
    "customerName": "jovian",
    "rating": 5,
    "comment": "rekomen bgt deh buat yang butuh cepet",
    "createdAt": "2026-07-15T19:25:00.000Z"
  },
  {
    "id": "sample-78",
    "productId": 23843,
    "customerName": "putra senja",
    "rating": 3,
    "comment": "sempet error pas login, tapi dibantu sampe beres",
    "createdAt": "2026-07-15T16:50:00.000Z"
  },
  {
    "id": "sample-79",
    "productId": 46473,
    "customerName": "rezaa",
    "rating": 5,
    "comment": "bagus awet juga",
    "createdAt": "2026-07-15T13:15:00.000Z"
  },
  {
    "id": "sample-80",
    "productId": 90001,
    "customerName": "rann",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-15T10:00:00.000Z"
  },
  {
    "id": "sample-81",
    "productId": 40138,
    "customerName": "arman visual",
    "rating": 5,
    "comment": "mantap",
    "createdAt": "2026-07-14T22:30:00.000Z"
  },
  {
    "id": "sample-82",
    "productId": 90002,
    "customerName": "citraaa",
    "rating": 5,
    "comment": "akun gpt kena deactived langsung gercep diganti admin",
    "createdAt": "2026-07-14T19:45:00.000Z"
  },
  {
    "id": "sample-83",
    "productId": 23930,
    "customerName": "zidann",
    "rating": 4,
    "comment": "oke lah",
    "createdAt": "2026-07-14T16:20:00.000Z"
  },
  {
    "id": "sample-84",
    "productId": 31181,
    "customerName": "dimas suka ai",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-14T13:10:00.000Z"
  },
  {
    "id": "sample-85",
    "productId": 46473,
    "customerName": "vinaaa",
    "rating": 5,
    "comment": "bagus",
    "createdAt": "2026-07-14T10:00:00.000Z"
  },
  {
    "id": "sample-86",
    "productId": 91001,
    "customerName": "alya edits",
    "rating": 5,
    "comment": "web llm nya kapan selesai maintenance bang?",
    "createdAt": "2026-07-13T21:40:00.000Z"
  },
  {
    "id": "sample-87",
    "productId": 90002,
    "customerName": "rendi gntg",
    "rating": 5,
    "comment": "mantap brooo",
    "createdAt": "2026-07-13T18:05:00.000Z"
  },
  {
    "id": "sample-88",
    "productId": 23843,
    "customerName": "yoga",
    "rating": 5,
    "comment": "",
    "createdAt": "2026-07-13T14:30:00.000Z"
  },
  {
    "id": "sample-89",
    "productId": 90001,
    "customerName": "princes vini",
    "rating": 5,
    "comment": "sip, langsung aktif",
    "createdAt": "2026-07-13T11:00:00.000Z"
  },
  {
    "id": "sample-90",
    "productId": 46473,
    "customerName": "febriola",
    "rating": 4,
    "comment": "bagus awet juga, dipake skripsi aman",
    "createdAt": "2026-07-12T22:15:00.000Z"
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
  store.orders ||= []; store.chats ||= []; store.reviews ||= []; store.vouchers ||= []; store.notifications ||= [];
  store.settings ||= { maintenance: false, maintenanceMessage: 'DigiePro sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.', reviewsEnabled: true };
  if (typeof store.settings.reviewsEnabled !== 'boolean') { store.settings.reviewsEnabled = true; changed = true; }
  for (const product of store.products || []) if (typeof product.autoRestock !== 'boolean') product.autoRestock = false;
  const claude = store.products.find((product) => product.id === 46473);
  if (claude && (claude.price !== 83000 || claude.description !== CLAUDE_PRO_DESCRIPTION)) { Object.assign(claude, { price: 83000, duration: '1 bulan', warranty: '30 hari', access: 'Akun resmi Claude Pro di claude.ai', description: CLAUDE_PRO_DESCRIPTION }); syncProduct(claude); changed = true; }
  if ((store.schemaVersion || 0) < 8) {
    if (!store.products.some((product) => product.id === DOLA_PRODUCT.id)) store.products.splice(Math.max(0, store.products.findIndex((product) => product.id === 23843)), 0, { ...DOLA_PRODUCT });
    store.reviews = (store.reviews || []).filter((review) => !review.isSample && !String(review.id || '').startsWith('sample-'));
    store.reviews.push(...SAMPLE_REVIEWS.filter((review) => !store.reviews.some((item) => item.id === review.id)));
    for (const order of store.orders) if (order.status === 'completed' && !order.soldApplied) { for (const line of order.items || []) { const product = store.products.find((item) => item.id === line.id); if (product) { product.sold = Number(product.sold || 0) + Number(line.quantity || 0); syncProduct(product); } } order.soldApplied = true; }
    changed = true;
  }
  if ((store.schemaVersion || 0) < 9) {
    const chatgptIndex = store.products.findIndex((product) => product.id === 90002 || product.id === 23843);
    if (!store.products.some((item) => item.id === GPT_EDU_K12_PRODUCT.id)) store.products.splice(chatgptIndex >= 0 ? chatgptIndex : 0, 0, { ...GPT_EDU_K12_PRODUCT });
    changed = true;
  }
  if ((store.schemaVersion || 0) < 10) {
    const oldEdu = store.products.filter((product) => product.id === 92001 || product.id === 92002);
    const oldStock = oldEdu.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    const oldSold = oldEdu.reduce((sum, product) => sum + Number(product.sold || 0), 0);
    store.products = store.products.filter((product) => product.id !== 92001 && product.id !== 92002);
    let product = store.products.find((item) => item.id === GPT_EDU_K12_PRODUCT.id);
    if (!product) {
      const chatgptIndex = store.products.findIndex((item) => item.id === 90002 || item.id === 23843);
      product = { ...GPT_EDU_K12_PRODUCT };
      store.products.splice(chatgptIndex >= 0 ? chatgptIndex : 0, 0, product);
    }
    Object.assign(product, GPT_EDU_K12_PRODUCT, { stock: oldStock || Number(product.stock || GPT_EDU_K12_PRODUCT.stock), sold: oldSold || Number(product.sold || 0), enabled: product.enabled !== false });
    syncProduct(product);
    for (const order of store.orders || []) {
      for (const line of order.items || []) {
        if (line.id === 92001 || line.id === 92002) {
          line.variantId = line.id === 92002 ? '2y' : '1y';
          line.variantLabel = line.id === 92002 ? '2 Tahun' : '1 Tahun';
          line.id = GPT_EDU_K12_PRODUCT.id;
          line.title = `${GPT_EDU_K12_PRODUCT.title} - ${line.variantLabel}`;
        }
      }
    }
    changed = true;
  }
  if ((store.schemaVersion || 0) < 11) {
    store.reviews.push(...SAMPLE_REVIEWS.filter((review) => !store.reviews.some((item) => item.id === review.id)));
    store.schemaVersion = 11;
    changed = true;
  }
  if ((store.schemaVersion || 0) < 12) {
    // Replace sample-61..90 with updated natural versions
    store.reviews = store.reviews.filter((r) => !String(r.id).match(/^sample-(6[1-9]|[7-8][0-9]|90)$/));
    store.reviews.push(...SAMPLE_REVIEWS.filter((r) => String(r.id).match(/^sample-(6[1-9]|[7-8][0-9]|90)$/)));
    store.schemaVersion = 12;
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
  seed.settings ||= { maintenance: false, maintenanceMessage: 'DigiePro sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.', reviewsEnabled: true };
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
    env.DB.prepare('CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start INTEGER NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS llm_users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, api_key TEXT NOT NULL UNIQUE, balance_usd REAL NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT "", created_at TEXT NOT NULL, activated INTEGER NOT NULL DEFAULT 0, suspend_message TEXT NOT NULL DEFAULT "maaf limit api key ini sudah habis")')
  ]);
  const columns = await env.DB.prepare('PRAGMA table_info(users)').all();
  const names = new Set((columns.results || []).map((column) => column.name));
  if (!names.has('device_id')) await env.DB.prepare("ALTER TABLE users ADD COLUMN device_id TEXT NOT NULL DEFAULT ''").run();
  if (!names.has('blocked')) await env.DB.prepare('ALTER TABLE users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0').run();
  
  const llmColumns = await env.DB.prepare('PRAGMA table_info(llm_users)').all();
  const llmNames = new Set((llmColumns.results || []).map((column) => column.name));
  if (!llmNames.has('suspend_message')) await env.DB.prepare("ALTER TABLE llm_users ADD COLUMN suspend_message TEXT NOT NULL DEFAULT 'maaf limit api key ini sudah habis'").run();
  if (!llmNames.has('total_requests')) await env.DB.prepare("ALTER TABLE llm_users ADD COLUMN total_requests INTEGER NOT NULL DEFAULT 0").run();
  if (!llmNames.has('failed_requests')) await env.DB.prepare("ALTER TABLE llm_users ADD COLUMN failed_requests INTEGER NOT NULL DEFAULT 0").run();
  if (!llmNames.has('total_tokens')) await env.DB.prepare("ALTER TABLE llm_users ADD COLUMN total_tokens TEXT NOT NULL DEFAULT '0'").run();
  
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
function chatCustomer(user) { return { name: user?.name || '', email: user?.email || '' }; }
function chatMessageKey(message) { return message?.id || `${message?.sender || ''}:${message?.createdAt || ''}:${message?.text || ''}`; }
function mergeChatMessages(target, source) {
  const seen = new Set((target.messages || []).map(chatMessageKey));
  for (const message of source.messages || []) {
    const key = chatMessageKey(message);
    if (!seen.has(key)) {
      target.messages ||= [];
      target.messages.push(message);
      seen.add(key);
    }
  }
  target.messages = (target.messages || []).sort((left, right) => String(left.createdAt || '').localeCompare(String(right.createdAt || '')));
}
function claimUserChat(store, user, preferredChatId = '', customer = {}) {
  store.chats ||= [];
  store.orders ||= [];
  const targetId = user.id;
  const email = normalizeEmail(user.email);
  const matching = store.chats.filter((chat) => chat.id === targetId || chat.id === preferredChatId || chat.userId === user.id || normalizeEmail(chat.customer?.email) === email);
  let target = matching.find((chat) => chat.id === targetId) || matching[0];
  const sourceIds = new Set(matching.map((chat) => chat.id).filter(Boolean));
  if (preferredChatId) sourceIds.add(preferredChatId);
  if (!target) {
    target = { id: targetId, customer: { ...chatCustomer(user), ...customer }, messages: [], updatedAt: new Date().toISOString() };
    store.chats.unshift(target);
  } else {
    sourceIds.add(target.id);
    target.id = targetId;
    target.customer = { ...target.customer, ...chatCustomer(user), ...customer };
  }
  target.userId = user.id;
  for (const chat of matching) {
    if (chat === target) continue;
    mergeChatMessages(target, chat);
    target.customer = { ...chat.customer, ...target.customer, ...chatCustomer(user), ...customer };
    if (chat.orderId && !target.orderId) target.orderId = chat.orderId;
  }
  target.updatedAt = new Date().toISOString();
  store.chats = [target, ...store.chats.filter((chat) => chat !== target && !sourceIds.has(chat.id))];
  for (const order of store.orders) {
    if (order.userId === user.id || sourceIds.has(order.chatId)) order.chatId = targetId;
  }
  return target;
}
function resellerMinimum(price) { return Number(price) > 20000 ? 3 : 5; }
function resellerPrice(price) { return Math.round(Number(price) * 0.92); }
function productVariant(product, variantId) { return (product?.variants || []).find((variant) => variant.id === String(variantId || '')) || product?.variants?.[0] || null; }
function productBasePrice(product, variantId) { return Number(productVariant(product, variantId)?.price || product?.price || 0); }
function normalizeVoucherCode(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32); }
function productCategory(item) {
  if (item?.title?.includes('SALDO API')) return 'Developer API';
  const ai = /AI |GPT EDU|CHATGPT|CLAUDE|GROK|GEMINI|PERPLEXITY|KIRO|LEONARDO|KLING|DOLA/.test(item.title);
  const streaming = /IQIYI|HBO|SPOTIFY|YOUTUBE|APPLE MUSIC|PRIME VIDEO|WETV|VIU|VIDIO|BSTATION|LOKLOK|DRAMABOX|REELSHORT/.test(item.title);
  return ai ? 'AI & produktivitas' : streaming ? 'Hiburan premium' : 'Aplikasi premium';
}
function sanitizeVoucher(input = {}) {
  const type = input.type === 'percent' ? 'percent' : 'amount';
  const value = Math.max(0, Math.floor(Number(input.value || 0)));
  const minSubtotal = Math.max(0, Math.floor(Number(input.minSubtotal || 0)));
  const maxUses = input.maxUses === '' || input.maxUses === null || input.maxUses === undefined ? 0 : Math.max(0, Math.floor(Number(input.maxUses || 0)));
  const expiresAt = String(input.expiresAt || '').trim();
  return { code: normalizeVoucherCode(input.code), description: String(input.description || '').trim().slice(0, 120), type, value, minSubtotal, maxUses, used: Math.max(0, Math.floor(Number(input.used || 0))), enabled: input.enabled !== false, expiresAt, requiredCategory: String(input.requiredCategory || '').trim(), minQuantity: Math.max(0, Math.floor(Number(input.minQuantity || 0))) };
}
function voucherDiscount(voucher, subtotal) {
  const amount = voucher.type === 'percent' ? Math.floor(Number(subtotal || 0) * Math.min(100, Number(voucher.value || 0)) / 100) : Number(voucher.value || 0);
  return Math.max(0, Math.min(Number(subtotal || 0), amount));
}
function validateVoucher(store, code, subtotal, items = []) {
  const normalized = normalizeVoucherCode(code);
  if (!normalized) return null;
  const voucher = (store.vouchers || []).find((item) => normalizeVoucherCode(item.code) === normalized);
  if (!voucher || voucher.enabled === false) stopMutation(json({ error: 'Kode voucher tidak aktif atau tidak ditemukan.' }, 404));
  if (voucher.expiresAt && new Date(voucher.expiresAt).getTime() < Date.now()) stopMutation(json({ error: 'Kode voucher sudah kedaluwarsa.' }, 410));
  if (Number(voucher.minSubtotal || 0) > subtotal) stopMutation(json({ error: `Minimal belanja voucher ini ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(voucher.minSubtotal || 0))}.` }, 400));
  if (Number(voucher.maxUses || 0) > 0 && Number(voucher.used || 0) >= Number(voucher.maxUses || 0)) stopMutation(json({ error: 'Kuota voucher sudah habis.' }, 409));
  if (Number(voucher.minQuantity || 0) > 0) {
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQty < Number(voucher.minQuantity)) stopMutation(json({ error: `Voucher ini mensyaratkan minimal pembelian ${voucher.minQuantity} produk.` }, 400));
  }
  if (voucher.requiredCategory) {
    const hasCategory = items.some((item) => {
      const product = store.products.find((p) => p.id === item.id);
      return product && productCategory(product) === voucher.requiredCategory;
    });
    if (!hasCategory) stopMutation(json({ error: `Voucher ini khusus untuk produk kategori: ${voucher.requiredCategory}.` }, 400));
  }
  const discount = voucherDiscount(voucher, subtotal);
  if (discount <= 0) stopMutation(json({ error: 'Voucher belum memberi potongan untuk pesanan ini.' }, 400));
  return { voucher, discount };
}
function previewVoucher(store, code, subtotal, items = []) {
  const normalized = normalizeVoucherCode(code);
  if (!normalized) return { error: 'Kode voucher tidak valid.' };
  const voucher = (store.vouchers || []).find((item) => normalizeVoucherCode(item.code) === normalized);
  if (!voucher || voucher.enabled === false) return { error: 'Kode voucher tidak aktif atau tidak ditemukan.' };
  if (voucher.expiresAt && new Date(voucher.expiresAt).getTime() < Date.now()) return { error: 'Kode voucher sudah kedaluwarsa.' };
  if (Number(voucher.minSubtotal || 0) > subtotal) return { error: `Minimal belanja voucher ini ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(voucher.minSubtotal || 0))}.` };
  if (Number(voucher.maxUses || 0) > 0 && Number(voucher.used || 0) >= Number(voucher.maxUses || 0)) return { error: 'Kuota voucher sudah habis.' };
  if (Number(voucher.minQuantity || 0) > 0) {
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const cat = voucher.requiredCategory;
    const catQty = cat ? items.filter((item) => { const product = store.products.find((p) => p.id === item.id); return product && productCategory(product) === cat; }).reduce((sum, item) => sum + item.quantity, 0) : totalQty;
    if (catQty < Number(voucher.minQuantity)) return { error: `Voucher ini berlaku untuk minimal ${voucher.minQuantity} produk${cat ? ` kategori "${cat}"` : ''}. Saat ini kamu baru punya ${catQty} produk yang memenuhi syarat.` };
  }
  if (voucher.requiredCategory) {
    const hasCategory = items.some((item) => { const product = store.products.find((p) => p.id === item.id); return product && productCategory(product) === voucher.requiredCategory; });
    if (!hasCategory) return { error: `Voucher ini khusus untuk produk kategori: ${voucher.requiredCategory}. Tambahkan produk AI seperti ChatGPT, Claude, atau Grok ke keranjang.` };
  }
  const discount = voucherDiscount(voucher, subtotal);
  if (discount <= 0) return { error: 'Voucher belum memberi potongan untuk pesanan ini.' };
  return { ok: true, voucher, discount };
}

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
    try {
      await env.DB.prepare('INSERT INTO users (id, name, email, password_hash, salt, created_at, device_id, blocked) VALUES (?, ?, ?, ?, ?, ?, ?, 0)').bind(id, name, email, await hashPassword(password, salt), salt, createdAt, deviceId).run();
    } catch (error) {
      if (String(error?.message || error).toLowerCase().includes('unique')) return json({ error: 'Email sudah terdaftar. Silakan masuk.' }, 409);
      throw error;
    }
    const user = { id, name, email };
    const chatId = String(body.chatId || '').trim();
    let resolvedChatId = id;
    if (chatId) {
      await mutateStore(env, (store) => {
        resolvedChatId = claimUserChat(store, user, chatId, chatCustomer(user)).id;
        return json({ ok: true });
      });
    }
    return json({ user, chatId: resolvedChatId }, 201, { 'Set-Cookie': await createUserSession(env, id) });
  }
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request); const email = normalizeEmail(body.email); const password = String(body.password || ''); const ip = request.headers.get('CF-Connecting-IP') || 'unknown'; const key = `user:${ip}:${email}`;
    if (await rateLimited(env, key)) return json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }, 429);
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user || !safeEqual(await hashPassword(password, user.salt), user.password_hash)) { await recordFailure(env, key); return json({ error: 'Email atau password salah.' }, 401); }
    if (Number(user.blocked)) return json({ error: 'Akun ini diblokir. Hubungi admin melalui chat bantuan.' }, 403);
    await clearFailures(env, key);
    const publicAccount = publicUser(user);
    const chatId = String(body.chatId || '').trim();
    let resolvedChatId = user.id;
    await mutateStore(env, (store) => {
      resolvedChatId = claimUserChat(store, publicAccount, chatId, chatCustomer(publicAccount)).id;
      return json({ ok: true });
    });
    return json({ user: publicAccount, chatId: resolvedChatId }, 200, { 'Set-Cookie': await createUserSession(env, user.id) });
  }
  if (pathname === '/api/auth/me' && request.method === 'GET') {
    const user = await currentUser(request, env);
    if (!user) return json({ user: null }, 401);
    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId') || '';
    let resolvedChatId = user.id;
    await mutateStore(env, (store) => {
      resolvedChatId = claimUserChat(store, user, chatId, chatCustomer(user)).id;
      return json({ ok: true });
    });
    return json({ user, chatId: resolvedChatId });
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
      if (store.settings?.reviewsEnabled === false) stopMutation(json({ error: 'Ulasan baru sedang dinonaktifkan sementara.' }, 403));
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

  if (pathname === '/api/sync' && request.method === 'GET') {
    const url = new URL(request.url);
    let chatId = url.searchParams.get('chatId') || '';
    const userId = url.searchParams.get('userId') || '';
    const lastSyncStr = url.searchParams.get('lastSync') || '';
    const lastSync = lastSyncStr ? new Date(lastSyncStr).getTime() : 0;
    const user = await currentUser(request, env);
    if (user) chatId = user.id;
    
    const store = await ensureStore(env);
    
    // Find unread chat messages from admin
    const chat = store.chats.find(c => c.id === chatId);
    const newMessages = [];
    let unreadChatCount = 0;
    if (chat) {
      chat.messages.forEach(msg => {
        const msgTime = new Date(msg.createdAt).getTime();
        if (msgTime > lastSync) {
          newMessages.push(msg);
        }
        if (msg.sender === 'admin' && !msg.read) {
          unreadChatCount++;
        }
      });
    }

    // Find new notifications
    const newNotifications = (store.notifications || []).filter(notif => {
      const notifTime = new Date(notif.createdAt).getTime();
      if (notifTime <= lastSync) return false;
      // If it's a direct notification, check userId
      if (notif.targetUserId && notif.targetUserId !== userId) return false;
      return true;
    });

    return json({
      chatId,
      newMessages,
      unreadChatCount,
      newNotifications,
      timestamp: new Date().toISOString()
    });
  }

  const readMatch = pathname.match(/^\/api\/chat\/((?:chat|usr)-[a-zA-Z0-9-]{3,80})\/read$/);
  if (readMatch && request.method === 'POST') {
    const user = await currentUser(request, env);
    return await mutateStore(env, (store) => {
      const resolvedChatId = user ? claimUserChat(store, user, readMatch[1], chatCustomer(user)).id : readMatch[1];
      let chat = store.chats.find((item) => item.id === resolvedChatId);
      if (chat) {
        chat.messages.forEach(msg => {
          if (msg.sender === 'admin') msg.read = true;
        });
      }
      return json({ success: true });
    });
  }

  const chatMatch = pathname.match(/^\/api\/chat\/((?:chat|usr)-[a-zA-Z0-9-]{3,80})$/);
  if (chatMatch && request.method === 'GET') {
    const user = await currentUser(request, env);
    if (user) {
      let resolved = null;
      await mutateStore(env, (store) => {
        resolved = claimUserChat(store, user, chatMatch[1], chatCustomer(user));
        return json({ ok: true });
      });
      return json(resolved || { id: user.id, messages: [] });
    }
    const store = await ensureStore(env);
    return json(store.chats.find((item) => item.id === chatMatch[1]) || { id: chatMatch[1], messages: [] });
  }
  if (chatMatch && request.method === 'POST') {
    const user = await currentUser(request, env);
    const body = await readBody(request);
    const text = String(body.message || '').trim().slice(0, 1000);
    if (!text) return json({ error: 'Pesan kosong.' }, 400);
    return await mutateStore(env, (store) => {
      const customer = user ? { ...body.customer, ...chatCustomer(user) } : (body.customer || {});
      const resolvedChatId = user ? claimUserChat(store, user, chatMatch[1], customer).id : chatMatch[1];
      let chat = store.chats.find((item) => item.id === resolvedChatId);
      if (!chat) {
        chat = { id: resolvedChatId, customer, messages: [], updatedAt: new Date().toISOString() };
        store.chats.unshift(chat);
      }
      chat.customer = { ...chat.customer, ...customer };
      if (user) chat.userId = user.id;
      chat.messages.push({ id: randomId(), sender: 'customer', text, createdAt: new Date().toISOString() });
      chat.updatedAt = new Date().toISOString();
      return json(chat, 201);
    });
  }

  if (pathname === '/api/chat/resolve' && request.method === 'POST') {
    const user = await currentUser(request, env);
    if (!user) return json({ chatId: null, user: null }, 401);
    const body = await readBody(request);
    let chat = null;
    await mutateStore(env, (store) => {
      chat = claimUserChat(store, user, String(body.chatId || '').trim(), body.customer || chatCustomer(user));
      return json({ ok: true });
    });
    return json({ chatId: chat.id, chat });
  }

  // Voucher preview/validate without creating order
  if (pathname === '/api/vouchers/validate' && request.method === 'POST') {
    const body = await readBody(request);
    const store = await ensureStore(env);
    const code = String(body.code || '').trim();
    const items = Array.isArray(body.items) ? body.items : [];
    if (!code) return json({ error: 'Masukkan kode voucher.' }, 400);
    // Calculate subtotal from items
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
    try {
      const result = previewVoucher(store, code, subtotal, resolvedItems);
      if (result.error) return json({ error: result.error }, 400);
      return json({ ok: true, code: result.voucher.code, discount: result.discount, description: result.voucher.description || '' });
    } catch (e) {
      return json({ error: e.message || 'Voucher tidak valid.' }, 400);
    }
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
        const variant = productVariant(product, line.variantId);
        const ownGmail = product.title.includes('CHATGPT PLUS') && Boolean(line.ownGmail);
        const reseller = Boolean(line.reseller);
        const basePrice = productBasePrice(product, variant?.id);
        const minimum = resellerMinimum(basePrice);
        if (reseller && quantity < minimum) stopMutation(json({ error: `Harga reseller ${product.title} minimal ${minimum} item.` }, 400));
        const regularUnitPrice = basePrice + (ownGmail ? 5000 : 0);
        const unitPrice = reseller ? resellerPrice(regularUnitPrice) : regularUnitPrice;
        const lineTotal = unitPrice * quantity;
        subtotal += lineTotal;
        normalizedItems.push({ id: product.id, title: variant ? `${product.title} - ${variant.label}` : product.title, variantId: variant?.id || '', variantLabel: variant?.label || '', quantity, ownGmail, reseller, unitPrice, regularUnitPrice, lineTotal });
      }
      const appliedVoucher = validateVoucher(store, body.voucherCode, subtotal, normalizedItems);
      if (appliedVoucher) appliedVoucher.voucher.used = Number(appliedVoucher.voucher.used || 0) + 1;
      const adminFee = 99;
      const createdAt = new Date();
      const discount = appliedVoucher?.discount || 0;
      const voucher = appliedVoucher ? { code: appliedVoucher.voucher.code, description: appliedVoucher.voucher.description, discount } : null;
      const chat = claimUserChat(store, user, String(body.chatId || '').trim(), customer);
      const order = { id: `DGP-${Date.now()}-${randomId(2).toUpperCase()}`, userId: user.id, customer, chatId: chat.id, items: normalizedItems, subtotal, adminFee, discount, voucher, total: Math.max(0, subtotal - discount) + adminFee, status: 'pending', createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + ORDER_RESERVATION_MS).toISOString() };
      if (!reserveOrderStock(store, order)) stopMutation(json({ error: 'Stok berubah dan tidak lagi mencukupi. Muat ulang keranjang.' }, 409));
      applyAutoRestock(store);
      chat.customer = { ...chat.customer, ...customer };
      chat.orderId = order.id;
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
    let store = await ensureStore(env);
    const rows = await env.DB.prepare('SELECT id, name, email, created_at, blocked, device_id FROM users ORDER BY created_at DESC').all();
    if ((rows.results || []).length) {
      await mutateStore(env, (state) => {
        for (const row of rows.results || []) {
          const email = normalizeEmail(row.email);
          const hasChat = (state.chats || []).some((chat) => chat.id === row.id || chat.userId === row.id || normalizeEmail(chat.customer?.email) === email);
          if (hasChat) claimUserChat(state, { id: row.id, name: row.name, email: row.email }, '', chatCustomer(row));
        }
        return json({ ok: true });
      });
      store = await ensureStore(env);
    }
    const users = (rows.results || []).map((user) => {
      const orders = store.orders.filter((order) => order.userId === user.id);
      return { id: user.id, name: user.name, email: user.email, createdAt: user.created_at, blocked: Boolean(user.blocked), deviceId: user.device_id, orderCount: orders.length, totalSpent: orders.filter((order) => ['paid', 'completed'].includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0), orders };
    });
    const llmRows = await env.DB.prepare('SELECT * FROM llm_users ORDER BY created_at DESC').all();
    const llmUsers = llmRows.results || [];
    return json({ ...store, users, llmUsers });
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

  // Admin: delete a user account
  const adminUserDeleteMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (adminUserDeleteMatch && request.method === 'DELETE') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    await ensureAuthTables(env);
    const userId = adminUserDeleteMatch[1];
    const userRow = await env.DB.prepare('SELECT id, name, email FROM users WHERE id = ?').bind(userId).first();
    if (!userRow) return json({ error: 'Akun tidak ditemukan.' }, 404);
    await env.DB.prepare('DELETE FROM user_sessions WHERE user_id = ?').bind(userId).run();
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    await mutateStore(env, (store) => {
      for (const order of store.orders) {
        if (order.userId === userId) {
          order.userId = null;
          order.deletedUser = { name: userRow.name, email: userRow.email, deletedAt: new Date().toISOString() };
        }
      }
      store.chats = store.chats.filter((c) => c.id !== userId);
      return json({ ok: true, id: userId });
    });
    return json({ ok: true, id: userId });
  }

  // Admin: edit/delete chat messages
  const adminChatMsgMatch = pathname.match(/^\/api\/admin\/chats\/([a-zA-Z0-9-]{6,80})\/messages\/([a-f0-9]{8,32})$/);
  if (adminChatMsgMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const text = String(body.text || '').trim().slice(0, 1000);
    if (!text) return json({ error: 'Teks pesan tidak boleh kosong.' }, 400);
    return await mutateStore(env, (store) => {
      const chat = store.chats.find((item) => item.id === adminChatMsgMatch[1]);
      if (!chat) stopMutation(json({ error: 'Chat tidak ditemukan.' }, 404));
      const message = chat.messages.find((item) => item.id === adminChatMsgMatch[2]);
      if (!message) stopMutation(json({ error: 'Pesan tidak ditemukan.' }, 404));
      message.text = text;
      message.editedAt = new Date().toISOString();
      chat.updatedAt = new Date().toISOString();
      return json(chat);
    });
  }
  if (adminChatMsgMatch && request.method === 'DELETE') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    return await mutateStore(env, (store) => {
      const chat = store.chats.find((item) => item.id === adminChatMsgMatch[1]);
      if (!chat) stopMutation(json({ error: 'Chat tidak ditemukan.' }, 404));
      const before = chat.messages.length;
      chat.messages = chat.messages.filter((item) => item.id !== adminChatMsgMatch[2]);
      if (chat.messages.length === before) stopMutation(json({ error: 'Pesan tidak ditemukan.' }, 404));
      chat.updatedAt = new Date().toISOString();
      return json(chat);
    });
  }

  // Admin: edit order customer (WA/Nama)
  const orderCustomerMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/customer$/);
  if (orderCustomerMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const name = String(body.name || '').trim().slice(0, 80);
    const whatsapp = String(body.whatsapp || '').trim().replace(/[\s-]/g, '').slice(0, 20);
    const note = String(body.note || '').trim().slice(0, 500);
    if (name.length < 2) return json({ error: 'Nama minimal 2 karakter.' }, 400);
    if (!/^\+?[0-9]{9,15}$/.test(whatsapp)) return json({ error: 'Nomor WhatsApp tidak valid.' }, 400);
    return await mutateStore(env, (store) => {
      const order = store.orders.find((item) => item.id === orderCustomerMatch[1]);
      if (!order) stopMutation(json({ error: 'Pesanan tidak ditemukan.' }, 404));
      if (!['pending', 'paid'].includes(order.status)) stopMutation(json({ error: 'Data customer hanya bisa diubah pada pesanan pending atau paid.' }, 400));
      order.customer = { ...order.customer, name, whatsapp, note };
      order.customerEditedAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      if (order.chatId) {
        const chat = store.chats.find((item) => item.id === order.chatId);
        if (chat) chat.customer = { ...chat.customer, name, whatsapp };
      }
      return json(order);
    });
  }

  // Admin: initiate a new chat with any registered user
  if (pathname === '/api/admin/notifications' && request.method === 'POST') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    await ensureAuthTables(env);
    const body = await readBody(request);
    const title = String(body.title || '').trim().slice(0, 100);
    const text = String(body.text || '').trim().slice(0, 500);
    const targetUserId = String(body.targetUserId || '').trim(); // empty means all users

    if (!title || !text) return json({ error: 'Judul dan isi notifikasi wajib diisi.' }, 400);

    return await mutateStore(env, (store) => {
      store.notifications ||= [];
      const notif = {
        id: `notif-${randomId(8)}`,
        title,
        text,
        targetUserId: targetUserId || null,
        createdAt: new Date().toISOString()
      };
      store.notifications.unshift(notif);
      return json(notif, 201);
    });
  }

  if (pathname === '/api/admin/chats/initiate' && request.method === 'POST') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    await ensureAuthTables(env);
    const body = await readBody(request);
    const userId = String(body.userId || '').trim();
    const message = String(body.message || '').trim().slice(0, 1000);
    if (!userId) return json({ error: 'userId wajib diisi.' }, 400);
    if (!message) return json({ error: 'Pesan tidak boleh kosong.' }, 400);
    const userRow = await env.DB.prepare('SELECT id, name, email FROM users WHERE id = ?').bind(userId).first();
    if (!userRow) return json({ error: 'Akun tidak ditemukan.' }, 404);
    // Use userId as chatId so it links to user
    const chatId = userId;
    return await mutateStore(env, (store) => {
      let chat = store.chats.find((item) => item.id === chatId);
      if (!chat) {
        chat = { id: chatId, customer: { name: userRow.name, email: userRow.email }, messages: [], updatedAt: new Date().toISOString() };
        store.chats.unshift(chat);
      }
      chat.messages.push({ id: randomId(), sender: 'admin', text: message, createdAt: new Date().toISOString() });
      chat.updatedAt = new Date().toISOString();
      return json(chat, 201);
    });
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
      const updates = { stock, price, enabled: Boolean(body.enabled), autoRestock: Boolean(body.autoRestock) };
      // Support updating variants
      if (Array.isArray(body.variants)) {
        updates.variants = body.variants.map((v) => ({
          id: String(v.id || '').trim(),
          label: String(v.label || '').trim().slice(0, 80),
          price: Math.max(0, Number(v.price || 0)),
          duration: String(v.duration || '').trim().slice(0, 40),
          warranty: String(v.warranty || '').trim().slice(0, 40)
        })).filter((v) => v.id && v.label);
      }
      Object.assign(product, updates); syncProduct(product); applyAutoRestock(store);
      return json(product);
    });
  }

  const voucherMatch = pathname.match(/^\/api\/admin\/vouchers\/([^/]+)$/);
  if (pathname === '/api/admin/vouchers' && request.method === 'POST') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const voucher = sanitizeVoucher(body);
    if (!voucher.code) return json({ error: 'Kode voucher wajib diisi.' }, 400);
    if (!voucher.value) return json({ error: 'Nilai diskon wajib lebih dari 0.' }, 400);
    return await mutateStore(env, (store) => {
      store.vouchers ||= [];
      if (store.vouchers.some((item) => normalizeVoucherCode(item.code) === voucher.code)) stopMutation(json({ error: 'Kode voucher sudah ada.' }, 409));
      store.vouchers.unshift({ ...voucher, createdAt: new Date().toISOString() });
      return json(store.vouchers[0], 201);
    });
  }
  if (voucherMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const next = sanitizeVoucher({ ...body, code: voucherMatch[1] });
    if (!next.value) return json({ error: 'Nilai diskon wajib lebih dari 0.' }, 400);
    return await mutateStore(env, (store) => {
      const voucher = (store.vouchers || []).find((item) => normalizeVoucherCode(item.code) === normalizeVoucherCode(voucherMatch[1]));
      if (!voucher) stopMutation(json({ error: 'Voucher tidak ditemukan.' }, 404));
      Object.assign(voucher, next, { code: voucher.code, updatedAt: new Date().toISOString() });
      return json(voucher);
    });
  }
  if (voucherMatch && request.method === 'DELETE') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    return await mutateStore(env, (store) => {
      const before = (store.vouchers || []).length;
      store.vouchers = (store.vouchers || []).filter((item) => normalizeVoucherCode(item.code) !== normalizeVoucherCode(voucherMatch[1]));
      if (store.vouchers.length === before) stopMutation(json({ error: 'Voucher tidak ditemukan.' }, 404));
      return json({ ok: true });
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

  const adminReviewMatch = pathname.match(/^\/api\/admin\/reviews\/([^/]+)$/);
  if (adminReviewMatch && request.method === 'DELETE') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const reviewId = decodeURIComponent(adminReviewMatch[1]);
    return await mutateStore(env, (store) => {
      const before = store.reviews.length;
      store.reviews = store.reviews.filter((review) => review.id !== reviewId);
      if (store.reviews.length === before) stopMutation(json({ error: 'Ulasan tidak ditemukan.' }, 404));
      return json({ ok: true, id: reviewId });
    });
  }

  if (pathname === '/api/admin/settings' && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    return await mutateStore(env, (store) => {
      store.settings = { ...store.settings, maintenance: Boolean(body.maintenance), reviewsEnabled: body.reviewsEnabled !== false, maintenanceMessage: String(body.maintenanceMessage || '').trim().slice(0, 240) || 'DigiePro sedang melakukan pemeliharaan singkat. Silakan kembali beberapa saat lagi.' };
      return json(store.settings);
    });
  }

  // LLM Users Endpoints
  if (pathname === '/api/admin/llm-users' && request.method === 'POST') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    await ensureAuthTables(env);
    const body = await readBody(request);
    const name = String(body.name || '').trim().slice(0, 80);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 80);
    if (!name || !email) return json({ error: 'Nama dan email wajib diisi.' }, 400);
    const id = randomId();
    const apiKey = `sk-dpe-${randomId(32)}`;
    try {
      await env.DB.prepare('INSERT INTO llm_users (id, name, email, api_key, balance_usd, notes, created_at, activated, suspend_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, name, email, apiKey, 0, '', new Date().toISOString(), 0, 'maaf limit api key ini sudah habis').run();
      const user = await env.DB.prepare('SELECT * FROM llm_users WHERE id = ?').bind(id).first();
      return json(user, 201);
    } catch (e) {
      if (e.message.includes('UNIQUE')) return json({ error: 'Email sudah terdaftar.' }, 409);
      throw e;
    }
  }

  const llmUserMatch = pathname.match(/^\/api\/admin\/llm-users\/([a-zA-Z0-9-]{6,80})$/);
  if (llmUserMatch && request.method === 'PUT') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const body = await readBody(request);
    const name = String(body.name || '').trim().slice(0, 80);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 80);
    const balance = Math.max(0, Number(body.balance_usd) || 0);
    const notes = String(body.notes || '').trim().slice(0, 500);
    const suspendMessage = String(body.suspend_message || 'maaf limit api key ini sudah habis').trim().slice(0, 500);
    const activated = body.activated ? 1 : 0;
    if (!name || !email) return json({ error: 'Nama dan email wajib diisi.' }, 400);
    const totalRequests = Math.max(0, Number(body.total_requests) || 0);
    const failedRequests = Math.max(0, Number(body.failed_requests) || 0);
    const totalTokens = String(body.total_tokens || '0').trim().slice(0, 30);
    try {
      const update = await env.DB.prepare('UPDATE llm_users SET name = ?, email = ?, balance_usd = ?, notes = ?, activated = ?, suspend_message = ?, total_requests = ?, failed_requests = ?, total_tokens = ? WHERE id = ?').bind(name, email, balance, notes, activated, suspendMessage, totalRequests, failedRequests, totalTokens, llmUserMatch[1]).run();
      if (!update.meta?.changes) return json({ error: 'User tidak ditemukan.' }, 404);
      const user = await env.DB.prepare('SELECT * FROM llm_users WHERE id = ?').bind(llmUserMatch[1]).first();
      return json(user);
    } catch (e) {
      if (e.message.includes('UNIQUE')) return json({ error: 'Email sudah dipakai.' }, 409);
      throw e;
    }
  }
  if (llmUserMatch && request.method === 'DELETE') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const res = await env.DB.prepare('DELETE FROM llm_users WHERE id = ?').bind(llmUserMatch[1]).run();
    if (!res.meta?.changes) return json({ error: 'User tidak ditemukan.' }, 404);
    return json({ ok: true, id: llmUserMatch[1] });
  }

  const llmRegenMatch = pathname.match(/^\/api\/admin\/llm-users\/([a-zA-Z0-9-]{6,80})\/regenerate-key$/);
  if (llmRegenMatch && request.method === 'POST') {
    if (!(await isAdmin(request, env))) return json({ error: 'Unauthorized' }, 401);
    const apiKey = `sk-dpe-${randomId(32)}`;
    const update = await env.DB.prepare('UPDATE llm_users SET api_key = ? WHERE id = ?').bind(apiKey, llmRegenMatch[1]).run();
    if (!update.meta?.changes) return json({ error: 'User tidak ditemukan.' }, 404);
    const user = await env.DB.prepare('SELECT * FROM llm_users WHERE id = ?').bind(llmRegenMatch[1]).first();
    return json(user);
  }

  if (pathname === '/api/llm/me' && request.method === 'GET') {
    const auth = request.headers.get('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'Missing API Key.' }, 401);
    await ensureAuthTables(env);
    const user = await env.DB.prepare('SELECT * FROM llm_users WHERE api_key = ?').bind(token).first();
    if (!user) return json({ error: 'Invalid API Key.' }, 401);
    return json({
      id: user.id,
      customer_name: user.name,
      email: user.email,
      balance: user.balance_usd,
      balance_usd: user.balance_usd,
      activated: Boolean(user.activated),
      suspend_message: user.suspend_message || 'maaf limit api key ini sudah habis',
      total_requests: user.total_requests || 0,
      failed_requests: user.failed_requests || 0,
      total_tokens: user.total_tokens || '0'
    });
  }

  return json({ error: 'Endpoint tidak ditemukan.' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'digiepro.my.id' || url.hostname === 'www.digiepro.my.id' || url.hostname === 'www.digiepro.store') {
      url.hostname = 'digiepro.store';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/robots.txt') {
      return new Response("User-agent: *\nAllow: /\n\nSitemap: https://digiepro.store/sitemap.xml", { headers: { 'Content-Type': 'text/plain' } });
    }

    if (url.pathname === '/sitemap.xml') {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://digiepro.store/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://digiepro.store/api-llm</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
      return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
    }
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
  },
  async scheduled(event, env, ctx) {
    try {
      await mutateStore(env, (store) => {
        let changed = false;
        for (const product of store.products || []) {
          if (product.autoRestock && product.enabled) {
            // ~20% chance every hour to increment sold by 1 (avg 4.8 per day)
            if (Math.random() < 0.20) {
              product.sold = Number(product.sold || 0) + 1;
              syncProduct(product);
              changed = true;
            }
          }
        }
        return changed; // Return value doesn't matter, mutateStore checks if it needs to save
      });
    } catch (e) {
      console.error('Scheduled error:', e);
    }
  }
};
