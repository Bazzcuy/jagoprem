# DigiePro

Toko akun digital dengan katalog produk, keranjang, checkout QRIS, chat pembeli-admin, dan dashboard admin.

## Menjalankan lokal

```bash
npm start
```

Buka `http://127.0.0.1:8000`. Dashboard admin tersedia melalui `/bolehdong`.

## Environment

- `PORT`: port server, otomatis disediakan oleh hosting.
- `ADMIN_PASSWORD`: password dashboard admin. Wajib diatur saat deployment.

## Deployment

Repository menyertakan `render.yaml` untuk deployment sebagai Render Web Service.

## Cloudflare Workers

Cloudflare memakai `src/worker.mjs` untuk API, static assets dari `public`, dan database D1 melalui binding bernama `DB`.

1. Buat database D1 bernama `digiepro-db`.
2. Hubungkan D1 ke Worker dengan variable name `DB`.
3. Tambahkan secret `ADMIN_PASSWORD`.
4. Deploy dengan `npm run deploy:cloudflare` atau Workers Builds dari GitHub.
