# Node 22 + TypeScript 7 + Jest + Vercel

Aturan runtime, compiler, test, logging, cache, dan deploy serverless untuk backend Node dengan TypeScript 7. Baca sebelum menulis/menjalankan test, mengubah `tsconfig`/build/script, menambah dependency, menyentuh logging/cache, atau mengubah konfigurasi deploy.

## Baseline versi

Node 22 LTS · TypeScript 7.0 (compiler native) · tsx 4 · nodemon 3 · Jest 30 + `@swc/jest` · supertest 7 · winston 3 · Vercel (`@vercel/node`)

## TypeScript 7 (BS-14)

- tsconfig mengikuti template `tsc --init` modern: `strict`, `module`/`moduleResolution: nodenext`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `isolatedModules`. Opsi ini dipertahankan; JANGAN dilonggarkan untuk mengatasi error.
- Idiom wajib:
  - field opsional diteruskan dengan conditional spread: `...(input.notes !== undefined ? { notes: input.notes } : {})`, bukan `notes: input.notes`;
  - kolom nullable diisi `null` eksplisit, bukan `undefined`;
  - hasil index access (`arr[i]`, `record[key]`, `req.params["id"]`) bisa `undefined` — tangani atau validasi dulu, jangan di-cast `as string` tanpa validasi;
  - `catch (error)` bertipe `unknown`; narrowing dengan `instanceof` sebelum membaca properti;
  - tanpa `any` kecuali di signature error handler framework, dengan komentar.
- `tsc --noEmit` adalah gerbang wajib DoD. Test ikut di-type-check, tapi `build` hanya mengompilasi `src/` (test dikecualikan).
- Tooling berbasis compiler API TypeScript (ts-node, ts-jest, sebagian plugin lint type-aware) belum tentu kompatibel dengan TS7; cek kompatibilitas sebelum menambahkannya.

## Runtime & script (BS-15)

- Dev: `tsx` (dijalankan nodemon dengan `watch: ["src"]`, `ignore: ["src/generated"]`). JANGAN ts-node.
- Script yang disarankan: `dev` (nodemon), `typecheck` (`tsc --noEmit`), `test` (`jest`), `build` (hanya jika artefak `dist/` benar-benar dipakai), `start` (runtime produksi, bukan nodemon), `db:seed`. `[DISIMPULKAN — project asal belum lengkap]`
- `tsc-alias` hanya dipakai jika tsconfig punya `paths`. `engines.node` dan `.nvmrc` mengunci major Node.
- Dependency baru dicek kompatibilitasnya dengan Jest CJS + `@swc/jest`: paket ESM-only bisa merusak test; pilih alternatif CJS atau konfigurasi transform, dan tulis alasannya di body commit.

## Test (BS-16, BS-18)

- Jest + `@swc/jest` (bukan ts-jest, yang mengunci peer `typescript <7`), `testEnvironment: "node"`, transform `.ts` → CommonJS.
- `testPathIgnorePatterns: ["/node_modules/", "/dist/"]` WAJIB; tanpa itu Jest ikut menjalankan hasil build lama di `dist/`.
- Lokasi default stack ini: folder test di root repo (mis. `__test__/<feature>.test.ts`), satu file per fitur atau per kelompok endpoint; helper/fixture bersama di subfolder helper. Lokasi aktual project dicatat di `project/architecture.md`.
- Pola integration HTTP: lihat `../testing/integration.md` bagian Backend. Ringkasnya: set env test sebelum import app; `jest.mock` modul client database dan modul integrasi; instance app tanpa `listen`; token dari helper pembuat token app; `describe("<METHOD> <path>")`.
- Mock client database dideklarasikan per model yang disentuh request, termasuk yang dibaca middleware (mis. status akun di `verifyToken`).
- Fake timer: `jest.useFakeTimers({ now: <tanggal>, doNotFake: ["nextTick", "setImmediate"] })` agar supertest tetap berjalan.
- Script `test:coverage` (`jest --coverage`) untuk modul logika murni. `[TIDAK ADA — rekomendasi]`

## Logging (BU-12)

- winston: transport Console selalu; transport file hanya di luar serverless (filesystem serverless read-only). Format menyertakan timestamp, level, dan stack.
- Error handler global menentukan level dari status (4xx `warn`, 5xx `error`). `console.*` hanya di entrypoint lokal.

## Deploy Vercel serverless (BS-17)

- `src/index.ts` mengekspor app; `listen` hanya jika `process.env.VERCEL !== "1"`.
- Tidak ada penulisan ke filesystem saat runtime (log file, upload sementara); upload diproses di memori lalu dikirim ke storage.
- Batas body request ±4.5 MB: batas upload di aplikasi di bawah angka ini.
- `@vercel/node` dipakai builder Vercel; jika tidak di-import kode, letakkan di `devDependencies` dan verifikasi build preview setelah memindahkannya.
- Env diatur di dashboard Vercel oleh manusia; file contoh env di repo tetap lengkap. Urutan deploy lintas repo: backend dulu.
- Job terjadwal memakai mekanisme platform (mis. Vercel Cron memanggil endpoint internal yang dilindungi secret) — dipilih eksplisit dan dicatat di `project/decisions.md`. `[TIDAK ADA — rekomendasi]`

## Cache in-memory (BS-20)

- Cache TTL in-memory hanya untuk data publik yang jarang berubah (daftar kategori, profil publik, feature flag), dengan invalidasi eksplisit di jalur mutasi pada instance yang sama.
- Di serverless setiap instance punya cache sendiri: konsistensi antar-instance hanya dijamin oleh TTL (pendek, mis. 60 s). JANGAN memakai cache in-memory untuk data per user, kuota, atau apa pun yang butuh konsistensi kuat.

## Lint (backend)

Kebijakan umum di `README.md` bagian Tooling. Untuk stack ini: ESLint flat config + `typescript-eslint` tanpa aturan type-aware sampai kompatibilitasnya dengan TS7 terverifikasi, ditambah `eslint-config-prettier`. `[TIDAK ADA — rekomendasi, belum diuji]`
