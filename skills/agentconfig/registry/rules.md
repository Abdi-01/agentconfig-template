# Registry ID aturan

Indeks ID aturan → lokasi di `templates/agentconfig/standards/` (template v0.3.0). Dibuat otomatis oleh `scripts/build-registry.mjs`; jangan diedit manual. Baca saat membandingkan audit project baru dengan aturan yang sudah ada, atau saat mencari di mana suatu ID diterapkan.

## Prefix

| Prefix | Asal |
|---|---|
| `U-` | universal — audit frontend #1 (2026-10-13) |
| `S-` | stack — audit frontend #1 (2026-10-13) |
| `BU-` | universal — audit backend #1 (2026-10-13) |
| `BS-` | stack — audit backend #1 (2026-10-13) |

Prefix baru didaftarkan di `PREFIXES` script ini dan di `standards/README.md`. Bukti lengkap tiap ID ada di `_audit/` repo project asal (tidak disalin ke template karena berisi detail klien).

## Indeks

| ID | Dipakai di |
|---|---|
| BS-01 | `stack/express-5-layered-api.md` › Struktur folder |
| BS-02 | `stack/express-5-layered-api.md` › Tanggung jawab layer |
| BS-03 | `stack/express-5-layered-api.md` › Tanggung jawab layer |
| BS-04 | `stack/express-5-layered-api.md` › Tanggung jawab layer |
| BS-05 | `stack/express-5-layered-api.md` › Error |
| BS-06 | `stack/express-5-layered-api.md` › Validasi |
| BS-07 | `stack/express-5-layered-api.md` › Auth middleware |
| BS-08 | `stack/express-5-layered-api.md` › Upload |
| BS-09 | `stack/prisma-7-postgres.md` › Penamaan schema |
| BS-10 | `stack/prisma-7-postgres.md` › Konfigurasi |
| BS-11 | `stack/prisma-7-postgres.md` › Migration |
| BS-12 | `stack/prisma-7-postgres.md` › Transaksi, konkurensi & error |
| BS-13 | `stack/prisma-7-postgres.md` › Query |
| BS-14 | `stack/node-ts7-jest-vercel.md` › TypeScript 7 |
| BS-15 | `stack/node-ts7-jest-vercel.md` › Runtime & script |
| BS-16 | `stack/node-ts7-jest-vercel.md` › Test |
| BS-17 | `stack/node-ts7-jest-vercel.md` › Deploy Vercel serverless |
| BS-18 | `stack/node-ts7-jest-vercel.md` › Test |
| BS-19 | `stack/express-5-layered-api.md` › Auth middleware |
| BS-20 | `stack/node-ts7-jest-vercel.md` › Cache in-memory |
| BU-01 | `security.md` › Otorisasi<br>`stack/express-5-layered-api.md` › Auth middleware |
| BU-02 | `security.md` › Otorisasi |
| BU-03 | `security.md` › Input & output<br>`stack/prisma-7-postgres.md` › Query |
| BU-04 | `coding-style.md` › Backend<br>`stack/prisma-7-postgres.md` › Transaksi, konkurensi & error |
| BU-05 | `coding-style.md` › Backend<br>`stack/prisma-7-postgres.md` › Transaksi, konkurensi & error |
| BU-06 | `security.md` › Logika bisnis |
| BU-07 | `coding-style.md` › Backend |
| BU-08 | `coding-style.md` › Backend<br>`stack/prisma-7-postgres.md` › Penamaan schema |
| BU-09 | `coding-style.md` › Prinsip umum<br>`security.md` › Dependency & integrasi |
| BU-10 | `security.md` › Data pribadi & lingkungan<br>`stack/prisma-7-postgres.md` › Seed |
| BU-11 | `api-design.md` › Kontrak & dokumentasi<br>`coding-style.md` › Prinsip umum |
| BU-12 | `coding-style.md` › Backend<br>`security.md` › Logging<br>`stack/node-ts7-jest-vercel.md` › Logging |
| BU-13 | `security.md` › Secret & environment |
| BU-14 | `api-design.md` › Envelope |
| BU-15 | `api-design.md` › Status code |
| BU-16 | `api-design.md` › Penamaan resource |
| BU-17 | `api-design.md` › List & pagination<br>`stack/prisma-7-postgres.md` › Query |
| BU-18 | `api-design.md` › Semantik PATCH |
| BU-19 | `api-design.md` › Validasi input<br>`security.md` › Input & output |
| BU-20 | `api-design.md` › Encoding data<br>`stack/prisma-7-postgres.md` › Penamaan schema |
| BU-21 | `api-design.md` › Pesan error |
| BU-22 | `api-design.md` › Perubahan kontrak & versioning |
| BU-23 | `api-design.md` › Status code<br>`api-design.md` › Operasi asinkron |
| S-01 | `stack/nextjs-16-app-router.md` › Wajib dibaca dulu |
| S-02 | `stack/nextjs-16-app-router.md` › Struktur folder standar<br>`stack/nextjs-16-app-router.md` › Page → View → Sections |
| S-03 | `stack/nextjs-16-app-router.md` › Struktur folder standar<br>`stack/shadcn-base-ui-tailwind4.md` › Komponen `components/ui` |
| S-04 | `stack/tanstack-query-axios.md` › API client (S-04) — `src/lib/api/client.ts` |
| S-05 | `stack/tanstack-query-axios.md` › Query key (S-05) — `src/lib/api/queryKeys.ts` |
| S-06 | `stack/tanstack-query-axios.md` › Query hook (S-06) — `src/hooks/queries/use<Domain>.ts` |
| S-07 | `stack/tanstack-query-axios.md` › Service & adapter (U-04) — `src/services/<domain>Service.ts` |
| S-08 | `stack/tanstack-query-axios.md` › QueryClient |
| S-09 | `stack/tanstack-query-axios.md` › Mutation |
| S-10 | `stack/shadcn-base-ui-tailwind4.md` › Styling & token |
| S-11 | `stack/shadcn-base-ui-tailwind4.md` › Perilaku Base UI yang wajib diingat |
| S-12 | `stack/nextjs-16-app-router.md` › Gambar & font |
| S-13 | `stack/nextjs-16-app-router.md` › Server vs Client |
| S-14 | `stack/nextjs-16-app-router.md` › Server vs Client |
| S-15 | `stack/nextjs-16-app-router.md` › Wajib dibaca dulu |
| S-16 | `stack/nextjs-16-app-router.md` › Env & modul server |
| S-17 | `stack/tanstack-query-axios.md` › Upload |
| S-18 | `stack/shadcn-base-ui-tailwind4.md` › Konvensi komponen React |
| S-21 | `stack/shadcn-base-ui-tailwind4.md` › Styling & token |
| U-01 | `coding-style.md` › Frontend |
| U-02 | `coding-style.md` › Prinsip umum |
| U-03 | `coding-style.md` › Prinsip umum<br>`stack/tanstack-query-axios.md` › Tanggal & angka dari API |
| U-04 | `coding-style.md` › Prinsip umum<br>`stack/tanstack-query-axios.md` › Service & adapter (U-04) — `src/services/<domain>Service.ts` |
| U-05 | `coding-style.md` › Prinsip umum<br>`stack/tanstack-query-axios.md` › Mutation |
| U-06 | `security.md` › Otorisasi |
| U-07 | `security.md` › Secret & environment |
| U-08 | `git-workflow.md` › Commit |
| U-09 | `git-workflow.md` › Branch |
| U-10 | `coding-style.md` › Prinsip umum |
| U-11 | `coding-style.md` › Prinsip umum<br>`coding-style.md` › Frontend |
| U-12 | `coding-style.md` › Frontend |
| U-13 | `coding-style.md` › Dependency |
| U-14 | `coding-style.md` › Prinsip umum |

## ID tanpa rujukan di standards/

Kandidat audit yang tidak dirujuk dengan ID di standards/: bisa diterapkan tanpa label ID, digabung ke aturan lain, atau ditolak. Cek laporan audit asal sebelum memakai ulang nomornya (nomor tidak boleh dipakai ulang).

`S-19`, `S-20`
