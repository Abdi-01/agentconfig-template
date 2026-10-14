# Prisma 7 + PostgreSQL

Aturan akses data dengan Prisma 7 di PostgreSQL: konfigurasi, penamaan schema, query, transaksi, SQL mentah, migration, dan seed. Baca sebelum mengubah `schema.prisma`, membuat migration, menulis repository/query, atau menjalankan seed.

## Baseline versi

Prisma 7.10 · `@prisma/adapter-pg` + `pg` · PostgreSQL (termasuk penyedia terkelola dengan connection pooler)

## Konfigurasi (BS-10)

- Prisma 7 WAJIB memakai driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. `new PrismaClient()` tanpa adapter gagal saat runtime.
- Konfigurasi CLI ada di `prisma.config.ts` (`schema`, `migrations.path`, `migrations.seed`, `datasource.url`), bukan blok `datasource` di schema.
- Dua URL: `DATABASE_URL` (runtime, boleh lewat pooler mode transaksi) dan `DIRECT_URL` (CLI migrate, koneksi sesi/langsung, fallback ke `DATABASE_URL`).
- Client di-generate ke folder di dalam `src/` yang di-gitignore (mis. `src/generated/prisma`) lewat `postinstall: prisma generate`; folder itu dikecualikan dari tsconfig, watcher, dan test.
- Satu instance client per proses di `src/config/`; hanya repository yang mengimpornya.

## Penamaan schema (BS-09)

- Model PascalCase singular + `@@map("snake_case_plural")`; field camelCase + `@map("snake_case")` untuk nama lebih dari satu kata; enum PascalCase dengan nilai snake_case.
- Primary key `String @id @default(uuid())` kecuali tabel kunci-alami (mis. key config).
- `createdAt DateTime @default(now()) @map("created_at")` dan `updatedAt DateTime @updatedAt @map("updated_at")` pada entitas yang bisa diubah.
- Uang `Decimal @db.Decimal(12, 2)`, persentase `Decimal @db.Decimal(5, 2)`; tanggal kalender `@db.Date`; jam dinding `@db.Time` — cara pengodeannya di wire dicatat di kontrak (BU-20).
- Soft-disable dengan `isActive Boolean @default(true)` untuk entitas yang direferensikan riwayat (BU-08); `onDelete: Cascade` hanya untuk anak yang tidak punya arti tanpa induknya.
- Komentar dokumentasi schema memakai `///` agar ikut ke tipe yang di-generate.

## Query (BS-13)

- Relasi di response selalu memakai `select` eksplisit untuk entitas yang punya field rahasia (hash password, token); JANGAN `include: { relation: true }` untuk entitas seperti itu, dan JANGAN mengembalikan baris penuh entitas ber-secret dari repository (BU-03). Konstanta select per entitas (`<entity>PublicSelect`) didefinisikan sekali di repository pemiliknya.
- `Decimal` terserialisasi sebagai string di JSON. Perhitungan uang di server memakai `Decimal`/integer satuan terkecil, bukan `Number` float, jika hasilnya disimpan atau ditagihkan.
- Setiap `findMany` untuk list punya `take` (batas aman atau pagination; BU-17) dan `orderBy` yang deterministik.
- Filter opsional memakai conditional spread (`...(filter.x ? { x: filter.x } : {})`), sesuai idiom `exactOptionalPropertyTypes`.

## Transaksi, konkurensi & error (BS-12)

- Multi-write memakai `prisma.$transaction(async (tx) => { … })`; replace-all relasi anak (`deleteMany` + `createMany`) selalu di dalam transaksi (BU-05).
- Pola konkurensi (BU-04): unique/partial unique index untuk "tidak boleh ganda"; `updateMany({ where: { id, status: "pending" } })` + cek `count` sebagai compare-and-set; `pg_advisory_xact_lock(hashtext(<kunci>))` di dalam transaksi untuk kuota per user.
- Pemetaan error Prisma di service: `P2002` (unique) → 409; `P2003` (foreign key) → 409; `P2025` (record tidak ada) → 404. Error Prisma lain dibiarkan ke error handler global (500 generik).

## SQL mentah

- Hanya tagged template `$queryRaw\`…\`` / `$executeRaw\`…\`` (parameterized). JANGAN `$queryRawUnsafe`/`$executeRawUnsafe` dengan input user.
- Objek database yang tidak bisa dinyatakan di schema (partial index, index GIN/trigram, extension, trigger) ditulis manual di migration SQL dengan komentar alasan, dan dicatat di `project/data-model.md`.

## Migration (BS-11)

- Satu migration per perubahan schema, dibuat dengan `prisma migrate dev --name <deskripsi_snake>` **di database lokal/dev pribadi**, di-commit bersama perubahan schema dan kode.
- SQL yang dihasilkan WAJIB dibaca sebelum commit: tidak ada `DROP` yang tidak disengaja — `migrate dev` cenderung menghapus objek SQL manual yang tidak dikenal schema; hapus baris itu dari migration.
- Database bersama/produksi hanya menerima `prisma migrate deploy` dengan migration aditif, dijalankan manusia atau pipeline. `prisma migrate reset`, `db push --force-reset`, dan migration destruktif ke database bersama/produksi JANGAN dijalankan agent (Prisma juga memblokir reset dari AI agent tanpa consent eksplisit).
- Perubahan breaking pada kolom (rename, ubah tipe, NOT NULL baru) memakai langkah bertahap: tambah kolom → backfill → pindahkan kode → hapus kolom lama di migration berikutnya.

## Seed

- Seed idempotent (`upsert`), dengan tanggal relatif terhadap hari ini agar data contoh selalu masuk akal.
- Data referensi yang berasal dari sumber eksternal (sheet, katalog) disimpan sebagai snapshot yang di-generate di `prisma/seed-data/`; JANGAN diedit manual.
- Klausa `update` pada `upsert` menimpa data yang sudah diubah lewat aplikasi; pakai `update: {}` untuk data yang boleh dikelola user.
- Seed dengan password bawaan dan data contoh JANGAN dijalankan ke database produksi (BU-10).
