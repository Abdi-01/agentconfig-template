# Stack

Indeks aturan spesifik stack beserta kebijakan tooling yang berlaku untuk semua stack. Baca sebelum memakai framework/library dari stack project, mengubah tooling (lint, format, test, build), atau menyalin template ke project dengan stack lain.

## Aturan bersama semua stack

- Setiap file stack mencantumkan **baseline versi**. Jika versi mayor di `package.json` project berbeda dari baseline, verifikasi ulang aturan terhadap dokumentasi versi tersebut sebelum mengikutinya.
- Project hanya membaca file stack yang dipakainya; stack yang dipakai repo dicatat di `project/architecture.md`.
- Stack baru = file baru di folder ini + baris baru di tabel peta; aturan universal di luar `stack/` tidak diubah untuk mengakomodasi satu stack.
- ID aturan stack memakai prefix project audit asal (`S-` frontend, `BS-` backend; lihat `../README.md`).

## Tooling

Status di project asal: lint dan format **belum dikonfigurasi** `[TIDAK ADA]`. Definition of Done memperlakukan lint sebagai TODO sampai config ditambahkan.

Kebijakan agar lint tidak mengganggu build dan type-check:

- **Gerbang wajib adalah type-check** (`tsc --noEmit`). Error TypeScript tetap menggagalkan build dan JANGAN dimatikan (`ignoreBuildErrors`, `// @ts-ignore` massal).
- Lint dijalankan sebagai command terpisah dan **tidak pernah** menjadi bagian dari build.
- Hanya aturan yang menandakan bug nyata yang bernilai `error`. Aturan lain yang terlalu bising diturunkan ke `warn` di config beserta komentar alasan, bukan dimatikan inline. JANGAN memakai `--max-warnings 0`.
- Gaya kode diserahkan ke Prettier; `eslint-config-prettier` mematikan aturan gaya ESLint agar keduanya tidak bentrok. Format seluruh repo sekali dalam commit `style:` tersendiri.
- Config ESLint per stack ada di file stack masing-masing.

Script `package.json` yang disarankan untuk semua stack:

```json
{
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

## Peta file

| Tipe project | Baca | Saat |
|---|---|---|
| Frontend (Next.js) | `nextjs-16-app-router.md` | membuat/mengubah struktur folder, route, page, layout, Server/Client Component, metadata, proxy, server action, gambar, font, env, atau config ESLint frontend |
| Frontend (Next.js) | `tanstack-query-axios.md` | memanggil API, menulis service/adapter, query hook, mutation, upload, atau menangani error API |
| Frontend (Next.js) | `shadcn-base-ui-tailwind4.md` | membuat/mengubah komponen React, UI shadcn, styling & token, form, Select/Checkbox, ikon, loading state, aksesibilitas |
| Backend (Express) | `express-5-layered-api.md` | membuat/mengubah fitur, route, controller, service, repository, validasi, middleware auth, upload, atau error handling |
| Backend (Prisma) | `prisma-7-postgres.md` | mengubah schema, migration, seed, query, transaksi, atau SQL mentah |
| Backend (runtime & tooling) | `node-ts7-jest-vercel.md` | menulis/menjalankan test, mengubah tsconfig/build/script, logging, cache, atau deploy serverless |
