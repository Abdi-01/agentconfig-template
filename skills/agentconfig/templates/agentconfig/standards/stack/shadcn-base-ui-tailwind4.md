# shadcn/ui (Base UI) + Tailwind CSS v4

Aturan UI: konvensi komponen React, komponen shadcn berbasis Base UI, styling dengan token Tailwind v4, form, ikon, loading state, dan aksesibilitas. Baca sebelum membuat atau mengubah komponen React/UI, styling, atau form.

## Konvensi komponen React (S-18)

- Deklarasi: `const Name: React.FunctionComponent<INameProps> = (props) => …`. `React.FC` hanya untuk page/wrapper tanpa props.
- Props: `interface I<Name>Props`. Tipe data/domain tetap memakai `type`.
- Import React: `import * as React from "react";`, lalu panggil `React.useState`, `React.useMemo`, dst.
- Export: `export default Name;` di baris paling bawah; satu komponen utama per file.
- Pengecualian yang diizinkan:
  - Special file Next (`layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`) boleh `export default function`.
  - File provider memakai named export untuk Provider dan hook-nya (`export function XProvider`, `export function useX`).
  - Sub-komponen kecil yang privat untuk satu file boleh tidak di-export.
- Penamaan file: komponen `PascalCase.tsx`; view `kebab-case-view.tsx`; hook buatan sendiri `useCamelCase.ts`; file hasil generate shadcn dibiarkan sesuai generator.
- `"use client"` hanya di file yang memakai state, effect, event handler, atau API browser.

## Komponen `components/ui` (S-03)

- Ditambahkan lewat CLI: `npx shadcn@latest add <component>`; konfigurasi di `components.json` (preset `base-*` = primitive Base UI).
- JANGAN menulis ulang file hasil generate. Tambahan kecil di file `ui/` (helper, varian) atau primitive baru buatan sendiri (mis. input mata uang) WAJIB dicatat di `project/design-system.md`.
- JANGAN mengimpor Radix secara langsung; primitive berasal dari `@base-ui/react` lewat wrapper di `ui/`.
- File hasil generate boleh berbeda gaya (mis. tanpa titik koma). Jangan diformat manual; serahkan ke formatter.

## Perilaku Base UI yang wajib diingat

- **Select (S-11):** `SelectValue` tidak otomatis menampilkan label item terpilih; tanpa render-prop, trigger menampilkan value mentah. WAJIB memakai helper:

  ```tsx
  <SelectValue>{selectValueLabel(STATUS_OPTIONS, "Pilih status")}</SelectValue>
  ```

  `selectValueLabel(source, fallback)` didefinisikan di `components/ui/select.tsx` dan menerima array `{ value, label }` atau `Record<string, string>`. Jika belum ada di project, tambahkan dan catat di `project/design-system.md`.
- **Checkbox/Radio:** merender elemen ber-role ditambah input tersembunyi. Test memakai `getByRole`, bukan `getByLabel` (lihat `../testing/integration.md`).

## Styling & token (S-10)

- Warna hanya lewat token semantik yang didefinisikan di `src/app/globals.css` (`:root`/`.dark` + `@theme inline`): `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, dst. JANGAN memakai hex arbitrer (`text-[#xxxxxx]`) atau menimpa token dengan warna literal di CSS. Warna baru = token baru di `globals.css` + catatan di `project/design-system.md`.
- Ukuran memakai skala Tailwind; nilai arbitrer (`text-[13px]`) hanya jika skala tidak memadai.
- Class kondisional/gabungan WAJIB lewat `cn()` dari `@/lib/utils`, bukan template literal.
- Tailwind v4 hanya mengompilasi class yang tertulis utuh di source. Class dinamis (warna kategori, varian status) disimpan sebagai string lengkap di konstanta (`"bg-emerald-100 text-emerald-700"`); JANGAN dirakit (`` `bg-${color}-100` ``).
- **Tidak ada kelas mati (S-21).** Tailwind v4 diam-diam tidak menghasilkan CSS untuk kelas yang tidak dikenalnya. Setiap kelas berbasis token (`text-<token>`, `font-<token>`, `bg-<token>`) WAJIB punya token di `@theme`. Kelas dari hasil export alat desain (mis. `text-on-surface`, `font-body-md`) WAJIB dipetakan ke token project sebelum dipakai. JANGAN memakai sintaks Tailwind v3 (`bg-opacity-*`, `text-opacity-*`); pakai modifier opacity (`bg-black/90`). Verifikasi lewat computed style di DevTools jika ragu.
- Varian komponen memakai `class-variance-authority`.
- Mobile-first. Pola tabel di desktop + kartu di mobile boleh dipakai, tapi aksi baris (menu, badge status) diekstrak ke satu komponen yang dipakai kedua layout.

## Ikon

- `lucide-react` adalah satu-satunya library ikon UI. Logo brand pihak ketiga yang tidak tersedia di lucide (mis. WhatsApp, Instagram) boleh dari `react-icons`. JANGAN memakai icon font.

## Form (standar utama)

- JANGAN memakai `react-hook-form`, `zod`, atau `framer-motion` kecuali ada keputusan tercatat di `project/decisions.md`.
- Pola form:
  1. State berupa satu objek `draft` dari `buildEmptyDraft(entity?)`, dipakai untuk create maupun edit.
  2. `draft` dan error di-reset setiap kali dialog dibuka (`React.useEffect` pada `open`).
  3. `isValid` diturunkan dari `draft` (field wajib terisi); tombol submit `disabled={!isValid || mutation.isPending}`.
  4. Setiap input punya `id`, `<Label htmlFor>`, serta atribut `required`/`type` yang sesuai.
  5. Saat submit: `trim()`, string kosong → `undefined`, lalu konversi ke tipe payload (mis. parse mata uang ke number).
  6. Error API ditampilkan di dalam form lewat state `error` (`getApiErrorMessage`).
  7. Validasi yang meniru kebijakan server memakai helper bersama di `lib/utils.ts` (mis. `isValidPassword`).
- Input uang memakai komponen input mata uang bersama (memformat saat mengetik), bukan `<Input type="number">`.
- Aksi destruktif selalu melewati dialog konfirmasi bersama.

## Loading, kosong, error (keputusan audit frontend INK-19)

- List/kartu: `Skeleton` selama `isLoading`. Tombol: spinner + `disabled` selama `isPending`.
- Data kosong: teks empty state yang eksplisit. Error: pesan dan, jika relevan, aksi coba lagi.

## Aksesibilitas

- Tombol yang hanya berisi ikon WAJIB punya `aria-label`. Gambar bermakna WAJIB punya `alt` deskriptif; gambar dekoratif `alt=""`.
- Setiap input terhubung dengan label. Urutan heading tidak melompat.
- Elemen interaktif dapat dijangkau keyboard: pakai `<button>`/`<a>`/`Link`, bukan `div` dengan `onClick`.
- Target kepatuhan (mis. WCAG 2.1 AA) ditetapkan di `project/technical-requirements.md`.
