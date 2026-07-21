# JagoPrem

Toko akun digital berbasis PHP, HTML, CSS, dan JavaScript untuk shared hosting Hostinger.

## Kebutuhan hosting

- PHP 8.1 atau lebih baru dengan ekstensi `mbstring`
- Apache dengan `mod_rewrite`
- Izin tulis PHP pada `data/store.json`

Tidak ada proses Node.js, build step, atau package manager yang diperlukan saat runtime.

## Konfigurasi

Buat file `.env` di root hosting:

```env
ADMIN_PASSWORD=ganti-dengan-password-yang-kuat
```

File `.env` diabaikan oleh Git dan diblokir oleh `.htaccess`, sehingga kredensial tidak ikut masuk repository.

## Deployment Hostinger dari GitHub

Hubungkan repository ke Git deployment Hostinger, gunakan branch `main`, dan arahkan deployment ke root website (`public_html`). File entrypoint utama adalah `index.html`; request `/api/*` diteruskan oleh Apache ke `api.php`.

Setelah deployment, pastikan `data/store.json` tetap dapat ditulis oleh PHP. Dashboard admin tersedia di `/bolehdong`.
