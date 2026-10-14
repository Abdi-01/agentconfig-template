# Katalog stack

Daftar file stack di template, cara skill mencocokkannya dengan `package.json`, dan cara menambah stack baru. Baca saat `detect.mjs` melaporkan `uncatalogued` atau `versionNotes`, atau saat project memakai stack yang belum ada filenya.

## Stack yang tersedia

| File | Sisi | Cocok jika ada dependency | Baseline |
|---|---|---|---|
| `nextjs-16-app-router.md` | frontend | `next` | Next 16 |
| `tanstack-query-axios.md` | frontend | `@tanstack/react-query` atau `axios` | Query 5, axios 1 |
| `shadcn-base-ui-tailwind4.md` | frontend | (`@base-ui/react` / `shadcn`) + `tailwindcss` | Tailwind 4 |
| `express-5-layered-api.md` | backend | `express` | Express 5 |
| `prisma-7-postgres.md` | backend | `prisma` / `@prisma/client` | Prisma 7 |
| `node-ts7-jest-vercel.md` | backend | `jest` | Jest 30, TypeScript 7 |

Sumber kebenaran pencocokan: `scripts/stack-catalog.json`.

## Versi mayor berbeda dari baseline

File stack tetap dipakai, tetapi aturan yang bergantung pada API framework diverifikasi ulang ke dokumentasi versi yang terpasang. Catat di `project/decisions.md`: versi terpasang, aturan yang tidak berlaku/berubah, dan rencana (upgrade project atau usulan file stack versi baru).

## Dependency tanpa file stack (`uncatalogued`)

Tidak semua butuh file stack. Panduan:

| Situasi | Tindakan |
|---|---|
| Library kecil yang aturannya muat 1–3 kalimat (mis. `zustand`, `swr`) | Catat aturan pakainya di `project/decisions.md` |
| Library yang dilarang template (mis. `react-hook-form`, `zod`) | Tanyakan user; jika tetap dipakai, catat pengecualian di `decisions.md` |
| Framework/ORM utama baru (mis. `fastify`, `@nestjs/core`, `mongoose`, `drizzle-orm`, `vue`) | Usulkan file stack baru ke user (lihat bawah). Sementara: aturan universal di `standards/` tetap berlaku; konvensi framework dicatat di `project/architecture.md` dengan label `[TIDAK ADA — rekomendasi]` |

## Menambah file stack baru (perubahan template)

Dilakukan di repo template, bukan di repo project:

1. Sumbernya audit project nyata (`references/audit-prompt.md`), bukan tebakan. Daftarkan prefix ID baru.
2. Buat `templates/agentconfig/standards/stack/<framework>-<versi-mayor>-<ringkas>.md`: kalimat pembuka (tujuan + kapan dibaca), **baseline versi**, aturan dengan ID dan label status, config tool yang disarankan.
3. Tambah baris di `templates/agentconfig/standards/stack/README.md` (peta file) dan entri di `scripts/stack-catalog.json`.
4. `node scripts/build-registry.mjs`, naikkan `VERSION` (minor), tulis `CHANGELOG.md`.
