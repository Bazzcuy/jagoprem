# JagoPrem

Toko akun digital berbasis PHP, HTML, CSS, dan JavaScript untuk shared hosting Hostinger.

## Kebutuhan hosting

- PHP 8.1 atau lebih baru dengan ekstensi `mbstring`
- Apache dengan `mod_rewrite`
- Izin tulis PHP pada direktori home hosting. Data aktif disimpan di
  `.jagoprem-data/store.json`, sejajar dengan `public_html`, bukan di dalam
  folder deployment.

Tidak ada proses Node.js, build step, atau package manager yang diperlukan saat runtime.

## Konfigurasi

Buat file `.env` pada direktori home Hostinger, sejajar dengan `public_html`:

```env
ADMIN_PASSWORD=ganti-dengan-password-yang-kuat
PREMZONE_API_KEY=paste-key-premzone-di-sini
PREMZONE_BASE_URL=https://api.premzone.co/v1
PREMZONE_MODEL=gpt-5.5
OPENAI_MAX_OUTPUT_TOKENS=160
AI_CHAT_RATE_LIMIT_PER_MINUTE=3
AI_CHAT_DAILY_LIMIT_PER_VISITOR=10
AI_CHAT_DAILY_LIMIT_PER_USER=24
AI_CHAT_DAILY_LIMIT_PER_IP=30
AI_CHAT_GLOBAL_DAILY_LIMIT=300
```

Ikuti panduan lengkap pada `ENV_SETUP.md`. File `.env` diabaikan Git dan tidak boleh ditempatkan di `public_html`.

AI chat dipanggil hanya dari backend PHP. Frontend tidak pernah menerima API key. Endpoint membatasi panjang pesan, jumlah permintaan per sesi, waktu respons, dan output model untuk mencegah penyalahgunaan saldo.

## Deployment Hostinger dari GitHub

Hubungkan repository ke Git deployment Hostinger, gunakan branch `main`, dan arahkan deployment ke root website (`public_html`). File entrypoint utama adalah `index.html`; request `/api/*` diteruskan oleh Apache ke `api.php`.

Saat pertama dijalankan, aplikasi memindahkan data awal ke
`~/.jagoprem-data/store.json` dan membuat
`~/.jagoprem-data/store.backup.json` pada perubahan berikutnya. Karena kedua
file berada di luar `public_html`, commit atau redeploy Git tidak menimpa data
produk, akun, pesanan, maupun chat yang sudah ada. Dashboard admin tersedia di
`/bolehdong`.
