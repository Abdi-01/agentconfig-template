# Express 5 — Layered Feature API

Aturan backend REST dengan Express 5: struktur folder fitur, tanggung jawab tiap layer, validasi, middleware auth, upload, dan error handling. Baca sebelum membuat atau mengubah fitur, route, controller, service, repository, validasi, middleware, atau error handling.

## Baseline versi

Express 5.2 · express-validator 7 · jsonwebtoken 9 · bcrypt 6 · multer 2 · helmet 8 · cors 2 · Node 22 · TypeScript 7 (lihat `node-ts7-jest-vercel.md`) · Prisma 7 (lihat `prisma-7-postgres.md`)

## Struktur folder (BS-01)

```
src/
  index.ts                         # entrypoint: load env, buat App, listen (di luar serverless), export app
  app.ts                           # class App: middleware global, mount router, satu error handler
  features/<feature-kebab>/
    <feature>.router.ts            # class: daftar endpoint + middleware per route
    <feature>.controller.ts        # class: baca request → panggil service → bentuk response
    <feature>.service.ts           # fungsi: business logic, otorisasi objek, AppError
    <feature>.repository.ts        # fungsi: query database saja
    <feature>.validation.ts        # array rule express-validator (jika ada input)
  config/                          # inisialisasi client: database, storage, mail
  middleware/                      # auth, validation handler, uploader
  services/                        # client integrasi pihak ketiga (bukan business logic)
  jobs/                            # entrypoint job terjadwal
  utils/                           # helper murni lintas fitur (AppError, waktu, token, sanitasi)
  types/                           # deklarasi tipe tambahan (.d.ts)
```

- Fitur baru = folder baru dengan pola 5 file. JANGAN menaruh logic di `app.ts`.
- Nama file `<feature>.<layer>.ts`; folder fitur kebab-case; named export camelCase; file yang mengekspor class memakai PascalCase (`AppError.ts`).
- Import memakai path relatif (tanpa alias) kecuali `tsconfig` mendefinisikan `paths`.

## Tanggung jawab layer (BS-02 – BS-04)

`router` → (middleware: auth → role → upload → validation) → `controller` → `service` → `repository` → database.

```ts
class ItemsRouter {
  private router: Router;
  private controller: ItemsController;

  constructor() {
    this.router = Router();
    this.controller = new ItemsController();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.router.get("/me", verifyToken, verifyRole("customer"), this.controller.listMine.bind(this.controller));
    this.router.patch("/:id", verifyToken, verifyRole("admin"), updateItemValidation, this.controller.update.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}
```

- **Router (BS-02):** class dengan `private initializeRoute()` dan `public getRouter()`, handler di-`bind` ke controller, di-mount di `app.ts` dengan `new XRouter().getRouter()`. Guard ditulis **per route**; `router.use(...)` hanya jika semua route modul memakai guard identik, dengan komentar. Satu router per prefix.
- **Controller (BS-03):** class; setiap method `async` dengan `try { … } catch (error) { next(error); }`. Tugasnya hanya: ambil data tervalidasi (`matchedData(req)`), ambil pemanggil dari `res.locals["user"]`, panggil satu fungsi service dengan `caller` sebagai parameter, lalu `res.status(n).send({ isSuccess: true, data })`. Controller JANGAN memuat aturan bisnis, cek kepemilikan, atau query database.
- **Service (BS-04):** modul fungsi (named export), diimpor sebagai namespace (`import * as itemsService from "./items.service"`). Semua aturan bisnis, keberadaan data (404), konflik (409), transisi status, dan otorisasi objek lewat helper `assertXxx(resource, caller)`. Service menyusun objek tulis database secara eksplisit dari field yang diizinkan.
- **Repository (BS-04):** modul fungsi; satu-satunya layer yang mengimpor client database. Murni query; konstanta `select`/`include` per entitas didefinisikan di sini (lihat `prisma-7-postgres.md`).
- **Lintas fitur:** panggil fungsi service milik fitur pemilik. Pengecualian: konstanta `select` boleh diimpor dari repository pemiliknya. Controller tidak mengimpor fitur lain; validation tidak mengimpor controller/service.
- Middleware yang butuh data (mis. status akun) membaca lewat fungsi repository/service, bukan client database langsung.

## Error (BS-05)

- Lempar `new AppError(message, statusCode)` dari service (atau dari middleware/validation handler). `AppError` SEBAIKNYA `extends Error` agar punya stack trace. `[TIDAK ADA — rekomendasi]` jika project asal masih class biasa.
- Satu error handler global di `app.ts`: `AppError` → status dan body sesuai envelope; error lain → 500 generik `{ isSuccess: false, code: 500, message }` tanpa detail; log level mengikuti status (4xx `warn`, 5xx `error` + stack).
- Error dari library dipetakan di tempat terdekat (mis. kode error ORM → 409/404 di service, `MulterError` → 413/422 di middleware upload).
- Express 5 meneruskan rejection dari handler `async` ke error handler secara otomatis; pola `try/catch → next(error)` tetap dipertahankan agar seragam dan eksplisit.

## Validasi (BS-06)

- Rule di `<feature>.validation.ts` memakai `body`/`param`/`query`; setiap array diakhiri `validationHandler` generik. Validasi dipasang di router sebelum controller.
- `validationHandler` menghasilkan satu error 400 dengan `message` kalimat (error pertama) dan `errors: [{ field, message }]` — JANGAN `JSON.stringify` array error ke `message`. `[TIDAK ADA — rekomendasi]` jika project asal belum.
- Controller membaca input lewat `matchedData(req, { locations: [...] })` sehingga field yang tidak divalidasi tidak ikut (anti mass-assignment). Di Express 5 `req.query` adalah getter — jangan mengandalkan sanitizer yang mengubah `req.query`; ambil nilai tersanitasi dari `matchedData` dan konversi eksplisit.
- Teks bebas yang disimpan diberi `.customSanitizer(sanitizeFreeText)`; field enum memakai `.isIn(CONSTANT_VALUES)` dari konstanta domain, bukan literal ulang.
- Pesan `withMessage` memakai bahasa produk (lihat `project/technical-requirements.md`).

## Auth middleware (BS-19)

- `verifyToken`: baca `Authorization: Bearer <token>`, `jwt.verify` dengan secret dari env, simpan payload di `res.locals["user"]`. Token tidak ada/invalid → 401. Untuk akun staf, periksa status akun dari database setiap request (aktif, wajib ganti password); akun nonaktif → 401/403.
- `verifyRole(...roles)`: role tidak termasuk → 403. Daftar role berasal dari konstanta, bukan literal di setiap router.
- `attachUserIfPresent`: untuk endpoint yang melayani guest maupun user login; tidak pernah menolak, hanya menyediakan identitas terverifikasi jika ada. Service menentukan pemilik dari identitas ini, bukan dari body (BU-01).
- Route statis didaftarkan sebelum route berparameter (`/me` sebelum `/:id`), dengan komentar (BS-07). Sintaks path Express 5: wildcard harus bernama (`/*splat`), segmen opsional memakai kurung kurawal (`/:file{.:ext}`).

## Upload (BS-08)

- Satu factory uploader di `middleware/`: `multer({ storage: memoryStorage(), limits: { fileSize } })` dengan batas per endpoint, plus pemetaan `MulterError` (`LIMIT_FILE_SIZE` → 413 atau 422) ke `AppError`. JANGAN membuat instance multer inline di router.
- Validasi mimetype di server; batas ukuran mengikuti batas body platform deploy (lihat `node-ts7-jest-vercel.md`).

## Middleware global

- `helmet()` dengan penyesuaian yang dikomentari (mis. `crossOriginResourcePolicy: "cross-origin"` untuk API lintas origin).
- `cors({ origin: <daftar origin dari env> })` — JANGAN `cors()` tanpa opsi di production. `[TIDAK ADA — rekomendasi]` jika project asal masih terbuka.
- `express.json({ limit })` dengan batas eksplisit; `app.set("trust proxy", 1)` di belakang proxy platform jika memakai rate limit berbasis IP.
- Rate limit (mis. `express-rate-limit`) untuk login, registrasi, dan endpoint publik yang mahal. `[TIDAK ADA — rekomendasi]`
