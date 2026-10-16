# Estimasi, milestone, dan task

Dibaca di mode estimasi dan rencana. Angka di sini titik awal untuk satu developer berpengalaman dengan bantuan AI coding agent; sesuaikan dengan data aktual project sebelumnya jika ada.

## Task

- **Ukuran:** 0,5 / 1 / 1,5 / 2 hari. >2 hari → pecah (mis. per endpoint, per layar, per alur).
- **Tipe:** `setup`, `design`, `fe`, `be`, `fullstack`, `test`, `infra`, `docs`, `review`, `uat`, `release`.
- **Rujukan:** kolom FR/UI berisi ID dari PRD dan `screens.md`. Task non-fitur boleh `—`.
- **Dependensi:** hanya yang benar-benar memblokir (endpoint sebelum layar yang memakainya, migration sebelum endpoint).
- **Satu task = satu PR** idealnya; deskripsi PR merujuk ID task dan FR.

Patokan kasar (hari), untuk solusi paling sederhana yang memenuhi AC:

| Pekerjaan | Hari |
|---|---|
| Setup repo + agentconfig + deploy preview pertama | 1–1,5 |
| Token desain + komponen dasar + shell/layout per role | 1–2 |
| Layar list sederhana (tabel + filter + data mock) | 0,5–1 |
| Form/modal dengan validasi | 0,5–1 |
| Endpoint CRUD satu entitas (validasi, otorisasi, test integration) | 1–1,5 |
| Integrasi pihak ketiga (payment, WA, storage) | 1,5–3 (pecah) |
| Auth (login, sesi, role guard) | 1,5–2 |
| UAT satu milestone (persiapan data, sesi bersama klien, perbaikan kecil) | 1–1,5 |
| Deploy production + checklist go-live | 1 |
| Serah terima (dokumentasi admin, transfer akun) | 0,5–1 |

## Buffer

| Kondisi | Buffer |
|---|---|
| PRD v1.0, stack sudah dikuasai, tanpa integrasi baru | 15% |
| Default | 20% |
| Ada integrasi pihak ketiga baru, data migrasi, atau >3 pertanyaan terbuka di PRD | 30% |

Buffer ditulis di `plan.md` dan dibagi proporsional ke milestone saat proyeksi tanggal.

## Milestone

- 2–5 milestone. Masing-masing **bisa didemokan** dan punya **gate** yang bisa dicek (UAT ditandatangani, deploy staging berjalan, data migrasi diverifikasi).
- **M1 = fondasi + satu irisan tipis end-to-end** (mis. login + satu alur kritis sampai database), bukan "semua backend dulu". Klien melihat hasil nyata sejak awal dan risiko integrasi ketahuan cepat.
- Milestone terakhir memuat UAT final, deploy production, dan serah terima.
- FR "Fase 2/Nanti" tidak masuk milestone; catat di bagian Di luar rencana.

## Termin (usulan, diputuskan user)

Pola yang umum untuk proyek bertermin: DP di awal, termin per milestone yang lolos gate, pelunasan setelah go-live/serah terima. Kolom Termin di `plan.md` berisi persentase atau "—"; nilai rupiah hanya jika user memberi tarif atau nilai kontrak.

## Estimasi kasar (mode estimasi)

- Per modul: rentang min–maks dengan asumsi eksplisit ("min: login email saja; maks: + Google OAuth").
- Tambahkan baris non-fitur (setup, desain, UAT, deploy, serah terima) — biasanya 25–35% dari total.
- Rentang total yang lebih lebar dari ±40% berarti requirement belum cukup jelas untuk penawaran harga tetap.
