# Prompt audit project

Prompt untuk mengaudit project lama (dibangun dengan AI agent atau manual) sebelum agentconfig dipasang. Dipakai di Langkah A SKILL.md, atau ditempel langsung ke agent lain. Hanya Fase 1–2; penulisan file dilakukan skill (scaffold + pengisian `project/`).

---

````markdown
# Tugas: Audit project untuk agentconfig

## Konteks
- Tipe project: <frontend-web | backend | fullstack> (hasil detect, dikonfirmasi user)
- Stack: <ringkasan dari detect>
- Template agentconfig: <versi>; registry ID aturan: <path ke registry/rules.md>

Konvensi project ini kemungkinan tersebar, implisit, dan tidak konsisten. Tugasmu:
memetakan konvensi aktual, inkonsistensi, dan gap; membandingkannya dengan
standar template; lalu berhenti untuk keputusan user.

## Aturan umum
- READ-ONLY. Jangan mengubah source code, config, test, atau .gitignore.
  Satu-satunya file yang boleh ditulis: `agentconfig/_audit/audit-report.md`.
- Command yang boleh dijalankan: type-check (`tsc --noEmit`, tanpa menulis cache),
  `npm audit --omit=dev`, `git log`/`git show`. Jangan build, dev, migrate, seed,
  atau apa pun yang menyentuh database/layanan eksternal.
- Setiap klaim berbasis bukti dengan path file (dan baris/commit bila perlu). Label:
  [TERBUKTI] konsisten · [DISIMPULKAN] dominan dengan pengecualian ·
  [TIDAK ADA] belum ada (jangan dikarang) · [DEFAULT] sama dengan boilerplate
  framework/tool · [KUSTOM] menyimpang dari default (kemungkinan keputusan sadar).
- Jangan menulis ulang dalam prosa aturan yang sudah ditegakkan tool; rujuk config-nya.
- Bahasa laporan: Indonesia; istilah teknis Inggris.

## Fase 1 — Discovery
Umum:
1. Instruksi agent yang ada (AGENTS.md, CLAUDE.md, .claude/, .cursorrules, .cursor/,
   .github/copilot-instructions.md, sejenisnya): relevan, usang, atau bertentangan
   dengan kode. Cek juga apakah file itu di-ignore git.
2. README, docs/, spec/kontrak, .env.example (bandingkan dengan env yang dibaca kode).
3. Stack & tooling: package.json (scripts, dependency + versi), lint/format, tsconfig,
   build, CI/CD, Docker, deploy.
4. Struktur folder & layering, error handling, logging, konfigurasi env.
5. Gaya kode aktual dari beberapa modul berbeda: naming, struktur function/komponen,
   import, typing, error, komentar.
6. Testing: framework, lokasi, pola, mocking, coverage, jenis test yang ada/tidak.
7. Security: validasi input, authn/authz (server-side), secret, data pribadi di
   response/log, dependency (`npm audit`).
8. Git (±50 commit terakhir): format commit, branching, area yang berulang di-fix
   (indikasi aturan yang hilang).
9. Domain: entitas, role, alur utama (untuk prd.md).
10. Lingkungan: apakah dev memakai database/layanan yang sama dengan production?
    Tanyakan jika tidak bisa dipastikan dari repo — jangan menyimpulkan sendiri.

Frontend/fullstack: routing, server vs client component, data fetching & cache, state,
form & validasi, UI kit, design token (cari hex arbitrer dan kelas tanpa token),
ikon, gambar, loading/empty/error state, aksesibilitas, performa.

Backend/fullstack: desain API (endpoint, envelope, status code, error, pagination,
versioning), layering route→controller→service→repository, validasi, ORM/schema/
migration/seed/transaksi/konkurensi, auth middleware, rate limit, upload, job/queue.

## Fase 2 — Laporan, lalu BERHENTI
Tulis `agentconfig/_audit/audit-report.md`, tampilkan ringkasannya di chat:
1. Ringkasan stack & arsitektur (maks. 10 poin).
2. Status instruksi agent lama (tabel: file, isi, status) + aturan usang/bertentangan.
3. Konvensi TERBUKTI (tabel `K-xx`, dengan [DEFAULT]/[KUSTOM]).
4. Inkonsistensi (`INK-xx`): contoh path, rekomendasi pola, alasan. Jangan memutuskan.
5. Gap (`GAP-xx`), termasuk "area yang berulang di-fix" dari git.
6. Perbandingan dengan template: untuk tiap aturan di registry yang relevan dengan
   stack ini — project sudah patuh / menyimpang (path) / belum ada.
7. Kandidat aturan BARU untuk template (belum ada di registry), dikelompokkan
   universal vs spesifik stack, dengan keyakinan tinggi/sedang/rendah. Pakai ID
   sementara `NEW-xx`; ID final diberikan saat template diperbarui.
8. Temuan security dengan prioritas P0/P1/P2.
9. Pertanyaan bernomor untuk user (termasuk yang berlabel [DEFAULT]: "pilihan sadar
   atau kebetulan bawaan?").

Setelah itu BERHENTI dan tunggu jawaban. Jawaban user ditambahkan sebagai bagian
"Keputusan" bertanggal di akhir laporan.
````
