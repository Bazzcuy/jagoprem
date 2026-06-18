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
