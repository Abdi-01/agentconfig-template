# Next.js 16 App Router

Aturan spesifik Next.js 16 (App Router) untuk routing, rendering, dan konfigurasi. Baca sebelum membuat atau mengubah struktur folder, route, page, layout, Server/Client Component, metadata, proxy, server action, gambar, font, atau env.

## Baseline versi

Next 16.3 · React 19.2 · TypeScript 5.9 · Tailwind CSS 4.3 · `@base-ui/react` 1.7 · shadcn CLI 4.x · `@tanstack/react-query` 5 · axios 1.x · npm

## Struktur folder standar (S-02, S-03)

```
src/
  app/                          # routing saja: page.tsx tipis, layout.tsx, special file, route handler, server action, proxy
  proxy.ts                      # opsional, pengganti middleware.ts
  views/<feature>/
    <feature>-view.tsx          # komposisi halaman
    sections/<Name>Section.tsx  # potongan halaman
  components/
    ui/                         # hasil generate shadcn
    custom/                     # komponen reusable lintas halaman
    client/                     # komponen interaktif khusus: dialog, form, drawer
    providers/                  # context provider: query client, sesi, locale, …
  services/<domain>Service.ts   # akses API + adapter
  hooks/
    queries/use<Domain>.ts      # hook useQuery per domain
    mutations/use<Action><Domain>.ts  # hanya mutation yang dipakai ≥2 komponen
    use<Name>.ts                # hook UI umum
  lib/
    api/client.ts               # axios instance
    api/queryKeys.ts            # query key factory
    data/<domain>.ts            # tipe UI + konstanta tampilan/konten statis per domain
    format.ts                   # formatter tanggal/angka/mata uang (satu-satunya)
    utils.ts                    # cn() dan helper murni kecil
public/images/<feature>/        # aset gambar lokal
```

Folder fitur tambahan di `components/` (mis. `cart/`, `auth/`) boleh dipakai jika berisi provider + komponen untuk satu fitur; catat di `project/architecture.md`.

## Wajib dibaca dulu (S-01)

- Next 16 punya breaking change dibanding versi yang mungkin dikenal agent. Sebelum memakai API Next, baca panduan terkait di `node_modules/next/dist/docs/` dan patuhi deprecation notice.
- `AGENTS.md` memuat blok `<!-- BEGIN:nextjs-agent-rules --> … <!-- END:nextjs-agent-rules -->` yang ditulis ulang otomatis oleh `next dev`. Blok itu WAJIB dipertahankan apa adanya.
- `middleware.ts` sudah diganti `proxy.ts` (export `proxy` + `config.matcher`).
- `params`, `searchParams`, `cookies()`, dan `headers()` bersifat async (`await`).
- Tipe props route memakai helper global `PageProps<"/route/[id]">` dan `LayoutProps<"/route">` (S-15), bukan tipe manual seperti `{ params: Promise<…> }`.

## Page → View → Sections (S-02)

`src/app/**/page.tsx` hanya merender satu View:

```tsx
import * as React from "react";
import ItemDetailView from "@/views/items/item-detail-view";

const ItemDetailPage: React.FC<PageProps<"/items/[id]">> = async ({ params }) => {
  const { id } = await params;

  return <ItemDetailView itemId={id} />;
};

export default ItemDetailPage;
```

- State, effect, dan markup halaman berada di View/sections, bukan di `page.tsx`.
- Pengecualian: page server yang mengambil data publik untuk SEO lalu merender satu komponen; isinya maksimal fetch, penanganan error, dan render.
- Logika bersama antarhalaman (label status, formatter, pagination "load more") masuk helper/hook, bukan disalin ke setiap page.

## Server vs Client (S-13, S-14)

| Kebutuhan | Pola |
|---|---|
| Halaman publik yang butuh SEO dan memakai data API publik | Async Server Component memanggil service langsung |
| Halaman terautentikasi/interaktif (token ada di browser) | Client Component + React Query |
| Aksi server yang memakai secret | Server Action yang memverifikasi sesi di dalam fungsinya |

- Server Component yang fetch WAJIB memakai `try/catch`: section → `console.error` berkonteks lalu `return null`; page yang tidak berarti tanpa datanya → `redirect` ke halaman fallback atau `notFound()`.
- Route yang fetch backend saat request diberi `export const dynamic = "force-dynamic"` agar build tidak bergantung pada ketersediaan backend.
- Page yang berupa Client Component tidak bisa mengekspor `metadata`; taruh `generateMetadata` di `layout.tsx` segmen yang sama.
- Metadata multi-bahasa memakai satu helper, bukan ternary locale di setiap file.

## Special file

- WAJIB: `app/error.tsx` sebagai boundary terakhir (tawarkan "coba lagi" dan kembali ke beranda; jangan menebak jenis error).
- SEBAIKNYA: `app/not-found.tsx`, dan `loading.tsx` untuk segmen yang fetch di server.
- App publik: `sitemap.ts` dan `robots.ts`, dengan URL absolut dari env site URL (fallback `http://localhost:3000`).

## Proxy (`src/proxy.ts`)

- Hanya untuk redirect/rewrite ringan (gating fitur, proteksi area internal).
- Lookup eksternal di proxy WAJIB di-cache dengan TTL dan punya kebijakan fail-open/fail-closed yang dikomentari.
- `matcher` mengecualikan `api`, `_next/static`, `_next/image`, dan aset statis.
- Proxy bukan pengganti verifikasi sesi di server action/route handler.

## Gambar & font (S-12)

- `next/image` untuk semua gambar lokal (`public/images/<feature>/`) dan host yang di-allowlist.
- Gambar LCP (hero, gambar utama halaman detail) memakai prop `preload`; prop `priority` sudah deprecated sejak Next 16. Selalu isi `sizes` untuk gambar `fill`/responsif.
- `images.remotePatterns` hanya berisi host spesifik; JANGAN wildcard. Alasan setiap host dikomentari di `next.config.ts`.
- `<img>` hanya untuk URL bebas yang tidak bisa di-allowlist, dengan `// eslint-disable-next-line @next/next/no-img-element -- <alasan>` dan `alt` yang bermakna.
- Font hanya lewat `next/font`; variabel CSS-nya dipetakan di `@theme`. JANGAN `@import` Google Fonts di CSS.

## Env & modul server (S-16)

- Hanya `NEXT_PUBLIC_*` yang boleh dibaca dari Client Component.
- Modul yang membaca secret diawali `import "server-only";`. Konstanta yang juga dibutuhkan client (mis. peta route → flag) dipisah ke modul tanpa secret.
- Variabel wajib divalidasi saat dipakai di server: `if (!value) throw new Error("X is not set")`.

## Server Action

- File diawali `"use server"`. Setiap action yang di-export memverifikasi sesi/izin di baris pertama fungsinya.
- Kembalikan objek hasil sederhana (mis. `{ ok: boolean }`); JANGAN meneruskan detail error internal ke client.

## Tooling ESLint & Prettier (frontend)

Kebijakan umum tooling ada di `README.md` bagian Tooling. Kekhususan Next 16:

- Next 16 **tidak lagi menjalankan lint saat `next build`**, dan perintah `next lint` sudah dihapus (lihat `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`). Lint dijalankan dengan `eslint .`.
- Error TypeScript tetap menggagalkan `next build`; JANGAN dimatikan (`typescript.ignoreBuildErrors`).

`eslint.config.mjs` yang disarankan (dev dependency: `eslint`, `eslint-config-next`, `eslint-config-prettier`; belum diuji di project asal):

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // Kualitas, bukan bug: jadi peringatan agar tidak menghambat kerja.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

Prettier: dev dependency `prettier` + `prettier-plugin-tailwindcss`, config `{ "plugins": ["prettier-plugin-tailwindcss"] }`.
