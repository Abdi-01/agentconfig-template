# API Design

Aturan desain HTTP API (REST/JSON): penamaan resource, envelope, status code, error, pagination, validasi, encoding, dan perubahan kontrak. Baca sebelum membuat atau mengubah endpoint, bentuk request/response, atau dokumen kontrak; berlaku untuk project backend dan fullstack.

Bentuk konkret (nama field envelope, daftar endpoint, matriks akses) ada di `project/api-contract.md` dan dokumen kontrak kanonik yang dirujuknya. Implementasi per framework ada di `stack/`.

## Kontrak & dokumentasi (BU-11)

- Setiap endpoint tercatat di kontrak kanonik: method, path, guard/role, parameter, body, bentuk response, dan error khusus. Endpoint baru atau perubahan bentuk ditulis di kontrak lebih dulu atau di commit yang sama.
- Kontrak mesin-baca (OpenAPI) SEBAIKNYA dibuat agar bisa di-diff dan dipakai contract test. `[TIDAK ADA — rekomendasi]`

## Penamaan resource (BU-16)

- Prefix tunggal (mis. `/api`), lalu kata benda jamak kebab-case: `/api/<resources>`, `/api/<resources>/:id`.
- Sub-resource bersarang di bawah pemiliknya: `/api/<parents>/:id/<children>`.
- Aksi yang bukan CRUD murni memakai `POST /api/<resources>/:id/<kata-kerja>` (mis. `check-in`, `payment`, `reset-password`).
- Resource milik pemanggil memakai alias `me` (`/api/<resources>/me`) yang di-scope dari token, bukan dari parameter.
- Satu prefix dilayani satu router/modul; jangan memecah prefix yang sama ke beberapa modul tanpa alasan tertulis.
- Setiap endpoint menyatakan guard-nya secara eksplisit di definisi route-nya (bukan tersembunyi di level modul), kecuali seluruh route modul memakai guard identik dan diberi komentar.

## Envelope (BU-14)

- Semua response memakai satu envelope, sukses maupun error. Bentuk yang direkomendasikan:

```json
{ "isSuccess": true, "data": { } }
{ "isSuccess": false, "code": 400, "message": "Nomor HP wajib diisi", "errors": [{ "field": "phone", "message": "Nomor HP wajib diisi" }] }
```

- `message` selalu kalimat yang bisa ditampilkan ke user; JANGAN berisi JSON yang di-stringify. Rincian per field masuk `errors`.
- Response hapus/aksi tanpa data memakai `200` + `data: { message }` atau `204` tanpa body — pilih satu per project dan catat di `project/api-contract.md`.

## Status code (BU-15)

| Status | Kapan |
|---|---|
| 200 / 201 | sukses baca/ubah / resource baru dibuat |
| 202 | proses asinkron diterima (BU-23) |
| 400 | input tidak valid atau melanggar aturan bisnis (termasuk password lama salah saat ganti password) |
| 401 | **hanya** token/sesi tidak ada, tidak valid, kedaluwarsa, atau kredensial login salah — frontend menafsirkannya sebagai "logout" |
| 403 | terautentikasi tapi role/kepemilikan tidak mengizinkan, atau akun wajib menyelesaikan langkah lain (mis. ganti password) |
| 404 | resource tidak ada (atau sengaja disamarkan untuk resource milik orang lain) |
| 409 | konflik: nilai unik bentrok, slot sudah terpakai, resource masih direferensikan |
| 413 / 422 | payload terlalu besar / bentuk benar tapi tidak bisa diproses (mis. foto ditolak layanan analisis) |
| 429 | kuota atau rate limit habis |
| 500 | error tak terduga — pesan generik, detail hanya di log |
| 502 / 503 / 504 | layanan upstream gagal / belum dikonfigurasi atau tidak tersedia / timeout |

## Pesan error (BU-21)

- Satu bahasa untuk semua pesan yang ditampilkan ke user (ditetapkan di `project/technical-requirements.md`); spesifik pada aksi dan memberi arahan ("Slot ini sudah dipesan, silakan pilih jadwal lain").
- JANGAN meneruskan pesan error mentah dari ORM, database, atau layanan pihak ketiga.

## Validasi input (BU-19)

- Setiap field body, path param, dan query divalidasi di edge (tipe, format, rentang, enum) sebelum mencapai logika bisnis. Query param angka/boolean dikonversi eksplisit.
- Hanya field yang lolos validasi yang diteruskan; field tak dikenal diabaikan atau ditolak (pilih satu per project). Lapisan bisnis menyusun objek tulis database secara eksplisit.
- Aturan yang bergantung pada data (unik, kepemilikan, transisi status) divalidasi di lapisan bisnis dan menghasilkan status code dari tabel di atas.

## List & pagination (BU-17)

- Setiap endpoint list dibatasi jumlah barisnya; tidak ada list tanpa batas.
- Koleksi yang terus tumbuh (transaksi, jadwal, pelanggan, riwayat) memakai envelope pagination:

```json
{ "items": [], "pagination": { "page": 1, "pageSize": 20, "total": 134, "totalPages": 7 } }
```

- Pagination boleh opt-in demi kompatibilitas (tanpa `page` → satu halaman berisi seluruh hasil sampai batas aman), tapi perilakunya dicatat di kontrak.
- Filter dan pencarian lewat query param bernama jelas (`search`, `status`, `categoryId`, `from`, `to`); sort lewat `sort` dengan nilai yang di-allowlist.

## Semantik PATCH (BU-18)

- Field yang tidak dikirim = tidak diubah. `null` eksplisit = kosongkan (hanya untuk field nullable).
- Array relasi anak yang dikirim = replace-all (hapus lalu buat ulang) dalam satu transaksi; perilaku ini dicatat per endpoint di kontrak.

## Encoding data (BU-20)

- Instant: ISO-8601 UTC (`2026-10-14T03:00:00.000Z`).
- Tanggal kalender dan jam dinding (tanpa zona) didokumentasikan cara pengodeannya di kontrak; konsumen tidak boleh menebak.
- Nilai uang dan desimal presisi dikirim sebagai string desimal atau integer satuan terkecil — pilih satu per project, catat di kontrak.
- Field multi-bahasa memakai pola nama yang konsisten (mis. `title` + `titleEn` nullable dengan fallback ke bahasa utama).

## Operasi asinkron (BU-23)

- Proses yang lama (analisis, pemrosesan berbayar) mengembalikan `202` + id, lalu konsumen polling endpoint status sampai status final (`pending` → `completed`/`failed`).
- Penyelesaian idempotent: polling bersamaan tidak boleh menggandakan hasil (update bersyarat pada status `pending`).

## Perubahan kontrak & versioning (BU-22)

- Selama semua konsumen internal dan di-deploy bersama, API tanpa versi di path. Perubahan breaking (hapus/ubah nama field, ubah makna status) dikoordinasi: update kontrak → backend menerima bentuk lama dan baru bila perlu → frontend → hapus bentuk lama.
- Urutan deploy: backend lebih dulu, lalu frontend.
- Jika API dibuka untuk pihak ketiga, perkenalkan versi (`/api/v1`) sebelum perubahan breaking berikutnya. `[TIDAK ADA — rekomendasi]`
