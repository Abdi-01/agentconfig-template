# Testing

Prinsip bersama untuk semua jenis test, beserta peta sub-file per jenis test. Baca sebelum menulis, mengubah, atau menjalankan test.

> Status di project asal (lihat `project/technical-requirements.md`): project frontend asal belum punya test; project backend asal punya suite integration HTTP dan unit. Bagian berlabel `[TIDAK ADA — rekomendasi]` adalah standar yang direkomendasikan; terapkan bertahap, mulai dari logika murni dan alur kritis.

## Tool per stack

Pilihan tool, lokasi file, dan command test ditetapkan per stack, karena bergantung pada runtime dan compiler:

| Tipe project | Unit & integration | E2E | Performance | Detail |
|---|---|---|---|---|
| Frontend (Next.js) | Vitest + Testing Library + MSW `[TIDAK ADA — rekomendasi]` | Playwright `[TIDAK ADA — rekomendasi]` | Lighthouse CI + bundle analyzer | `../stack/README.md` |
| Backend (Express + Prisma + TS7) | Jest + `@swc/jest` + supertest `[TERBUKTI]` | Jest + supertest terhadap server dengan DB test `[TIDAK ADA — rekomendasi]` | autocannon / k6 | `../stack/node-ts7-jest-vercel.md` |
| Semua | — | — | — | Security: `npm audit`, secret scanner (gitleaks), test otorisasi — `security.md` |

Jalankan test dengan `TZ=UTC` (atau timezone yang dikunci) agar logika tanggal deterministik.

## Aturan bersama

- **Lokasi & naming file** mengikuti file stack; nama file `<unit-atau-fitur>.test.ts(x)`, e2e `<alur>.spec.ts`. Setup, fixture, dan mock bersama di satu folder test helper per repo.
- **Nama test** berbahasa Inggris dan menjelaskan perilaku: `describe("<unit>")` atau `describe("<METHOD> <path>")` + `it("returns 403 when the patient belongs to another doctor")`.
- **Pola AAA:** Arrange → Act → Assert, dipisah baris kosong (boleh diberi komentar `// Arrange` dst.). Satu perilaku per `it`.
- **Mocking policy:**
  - Mock di boundary: jaringan keluar (MSW di frontend), client database dan modul integrasi pihak ketiga (backend). JANGAN me-mock modul internal di antara boundary (service, hook, helper) kecuali tidak ada alternatif, dan tulis alasannya.
  - JANGAN me-mock unit yang sedang diuji.
  - Mock database WAJIB diperbarui setiap kali kode baru membaca/menulis model lain (mis. middleware yang mulai membaca tabel user) — test yang merah karena mock basi adalah bug test, bukan untuk di-skip.
  - Waktu dikunci dengan fake timer untuk logika yang bergantung pada "sekarang".
  - JANGAN memanggil API pihak ketiga berbayar/berkuota dari test; ganti dengan mock modul atau mock server lokal.
- **Data uji:** dibuat lewat factory/fixture yang mengikuti bentuk data asli (dari kontrak API/schema, bukan dikarang). Lingkungan bersama atau produksi JANGAN dipakai untuk test; jika terpaksa memakai DB dev bersama, pakai data yang jelas palsu (prefix `TEST - `), bersihkan setelahnya, dan JANGAN menjalankan aksi destruktif pada data milik orang lain.
- **Regresi:** setiap perbaikan bug menambah test yang mereproduksi bug tersebut, begitu infrastruktur test tersedia.
- **Coverage:** tanpa threshold global di awal. Target ≥80% line coverage untuk modul logika murni (adapter, formatter, validator, kalkulasi bisnis, helper waktu). Alur kritis yang didaftar di `project/prd.md` WAJIB punya test integration atau e2e.
- **Determinisme:** test tidak bergantung pada urutan eksekusi, jaringan nyata, atau waktu nyata. Test flaky diperbaiki atau di-skip dengan catatan alasan; JANGAN di-retry diam-diam.
- **Artefak build** (mis. `dist/`) WAJIB dikecualikan dari pencarian test runner.

## Peta sub-file

| Baca | Saat |
|---|---|
| `unit.md` | menguji fungsi murni: adapter, formatter, validator, util, kalkulasi/scoring bisnis, state machine, helper waktu, query key factory |
| `integration.md` | menguji komponen bersama hook/provider/mock jaringan (frontend), atau endpoint HTTP lewat app sungguhan dengan DB di-mock/DB test (backend) |
| `e2e.md` | menguji alur user lengkap di browser, atau alur multi-endpoint end-to-end di API |
| `performance.md` | mengukur atau menjaga performa halaman, ukuran bundle, atau latency endpoint |
| `security.md` | menguji otorisasi, sesi, input berbahaya, kebocoran data, dependency, dan secret sesuai OWASP terbaru |
