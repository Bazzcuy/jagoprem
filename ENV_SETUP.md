# Memasang `.env` JagoPrem di Hostinger

JagoPrem membaca key hanya dari backend PHP. Key tidak boleh ditempel di HTML, `script.js`, localStorage, GitHub, atau file publik.

## Lokasi file

Di File Manager Hostinger, buka direktori home yang berisi folder `public_html`. Buat file `.env` **sejajar dengan `public_html`**, bukan di dalamnya.

```text
/home/username/
├── .env                 <- buat di sini
└── public_html/         <- hasil deploy GitHub
    ├── api.php
    ├── index.html
    └── ...
```

## Langkah pemasangan

1. Buka Hostinger hPanel → **Files** → **File Manager**.
2. Pastikan posisi berada satu tingkat di atas `public_html`.
3. Klik **New file**, beri nama `.env`.
4. Buka `.env.example` dari repository ini, salin seluruh isinya ke `.env`.
5. Ganti `PASTE_PREMZONE_API_KEY_DI_SINI` dengan key Premzone yang baru dan ganti password admin.
6. Simpan. Jika Hostinger menyediakan pengaturan permission, gunakan `600` atau `640`.
7. Buka `https://jagoprem.shop/api/ai/health`. Nilai `configured` harus `true`; endpoint ini tidak pernah menampilkan key.

`api.php` mencari `.env` di home Hostinger terlebih dahulu. File `.env` di root proyek hanya menjadi fallback untuk development lokal dan tetap diabaikan Git. Adapter memakai endpoint OpenAI-compatible Premzone `https://api.premzone.co/v1/chat/completions`.

Jika key atau password pernah terlihat di screenshot, GitHub, HTML, atau JavaScript frontend, segera rotasi dari dashboard penyedia. Jangan gunakan kembali key yang sudah terekspos.
