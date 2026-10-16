# Changelog

Riwayat versi `templates/agentconfig/standards/` dan kerangka `project/`. Setiap versi menyebut apa yang perlu dilakukan di repo saat sync.

## v0.5.0 — 2026-10-16

OWASP diterapkan di seluruh siklus, bukan hanya saat coding.

- `standards/security.md`: acuan baru **OWASP Top 10 for LLM Applications 2026** dan **Top 10 for Agentic Applications (Des 2025)** — berlaku hanya jika project memakai LLM/agent; bagian baru **Fitur AI/LLM** (TU-08, LLM01–LLM10); bagian penerapan di requirement, desain (**threat model**, TU-07), dan rilis.
- `standards/testing/security.md`: baris matriks untuk LLM01, LLM02/LLM10, LLM06; aturan setiap ancaman `TM-xx` punya test.
- `standards/definition-of-done.md`: perubahan alur kritis/auth/data sensitif/AI → perbarui `project/threat-model.md`.
- Baru: `project/threat-model.md.tmpl` (aset, ancaman per alur kritis → kategori OWASP → kontrol → test, risiko yang diterima), dibuat oleh scaffold untuk semua tipe project.
- `technical-requirements.md.tmpl`: baris Fitur AI/LLM dan Threat model di Baseline security; Syarat go-live merujuk threat model dan checklist keamanan.
- `references/prd-to-docs.md`: gap check level ASVS dengan default per jenis data, pertanyaan fitur AI; pemetaan AC penyalahgunaan → threat model.

**Saat sync dari v0.4.x:** `standards/security.md`, `testing/security.md`, `definition-of-done.md` berubah. Buat `agentconfig/project/threat-model.md` dari template (`templates/agentconfig/project/threat-model.md.tmpl`) dan tambahkan barisnya ke `project/README.md` › Peta file. Repo yang sudah punya audit security (mis. daftar P0) bisa langsung memindahkan temuannya menjadi baris `TM-xx`.

## v0.4.0 — 2026-10-15

Prinsip **kesederhanaan kode** menjadi aturan standar (prefix baru `TU-` = keputusan pemilik template).

- `standards/coding-style.md`: bagian baru **Kesederhanaan (prioritas pertama)** — TU-01 pendekatan dulu (berhenti jika >5 file atau >~200 baris per FR), TU-02 hanya yang diminta (YAGNI), TU-03 pakai yang sudah ada, TU-04 abstraksi menunggu ≥2 pemakaian, TU-05 ukuran fungsi/file/nesting, TU-06 efisien tanpa optimasi prematur.
- `standards/definition-of-done.md`: langkah 7a Kesederhanaan (review diff) dan ringkasan diff di laporan akhir.
- `standards/README.md` + registry: prefix `TU-`.
- `AGENTS.md.tmpl`: satu baris prinsip kode di router.
- Alur skill: Langkah 6 menawarkan `delivery-plan`.

**Saat sync dari v0.3.x:** `standards/coding-style.md`, `definition-of-done.md`, dan `README.md` berubah (konflik diharapkan jika tanpa lock; aman ditimpa). Tambahkan baris **Prinsip kode** ke `AGENTS.md` repo (lihat `templates/root/AGENTS.md.tmpl`), tepat sebelum kalimat Definition of Done.

## v0.3.1 — 2026-10-15

Dukungan skill desain kedua `figma-design`. `standards/` tidak berubah.

- Alur skill: Langkah 4 dan 6 membaca pilihan tool di `docs/prd/_discovery.md` › Keputusan desain (`stitch-design` / `figma-design`); jika belum ada, menanyakan preferensi dengan pilihan yang sama seperti `prd-writer`.
- `design-system.md.tmpl`: Sumber desain mencatat tool + link Figma; tabel pemetaan juga untuk nama variable Figma. Legenda `[DESAIN]` mencakup variables/frame Figma.

**Saat sync dari v0.3.0:** tidak ada perubahan wajib di repo.

## v0.3.0 — 2026-10-15

Integrasi dengan skill baru `stitch-design` (desain UI dari PRD lewat Google Stitch, output `docs/design/`). `standards/` tidak berubah.

- `project/design-system.md.tmpl`: bagian baru **Sumber desain** dan **Pemetaan kelas export** (kelas kustom dari HTML export → token `globals.css`, melengkapi aturan S-21).
- Legenda `agentconfig/README.md.tmpl`: label `[DESAIN]`.
- Alur skill: Langkah 4 mengisi `design-system.md` dari `docs/design/` jika ada; Langkah 6 menawarkan `stitch-design` untuk frontend/fullstack tanpa desain. `references/prd-to-docs.md`: baris pemetaan desain.

**Saat sync dari v0.2.x:** tidak ada konflik di `standards/`. Di repo frontend/fullstack: tambahkan heading `## Sumber desain` (sebelum Brand) dan `## Pemetaan kelas export` (sebelum Komponen reusable) ke `project/design-system.md`, isi `—` jika belum memakai desain export; tambahkan baris `[DESAIN]` ke legenda `agentconfig/README.md`.

## v0.2.2 — 2026-10-15

Integrasi dengan skill `prd-writer` (repo menjadi multi-skill: `skills/agentconfig/`, `skills/prd-writer/`, `install.sh`).

- Alur skill: Langkah 1 mengenali `docs/prd/prd.md`; jika PRD belum ada, menyarankan `prd-writer` dulu. Langkah 2 menambah **cek kualitas PRD** (script `check-prd` untuk PRD format `prd-writer`, checklist manual untuk PRD lain) dan pilihan melengkapi PRD sebelum lanjut.
- `references/prd-to-docs.md`: bagian "Cek kualitas PRD" dan pemetaan PRD format `prd-writer` → `project/`.
- `project/prd.md.tmpl`: bagian **Metrik keberhasilan** (dengan kolom "yang perlu disiapkan di kode") dan kolom **Acceptance criteria** di tabel Fitur (rujuk PRD kanonik; ditulis di sini hanya jika PRD tidak punya AC).
- `standards/README.md`: path registry dikoreksi ke `skills/agentconfig/registry/rules.md`. Isi aturan lain tidak berubah.

**Saat sync dari v0.2.x:** konflik hanya di `standards/README.md` (aman ditimpa). Untuk repo yang sudah ada: tambahkan bagian "Metrik keberhasilan" dan kolom "Acceptance criteria" ke `project/prd.md` saat PRD berikutnya disentuh — tidak wajib segera.

## v0.2.1 — 2026-10-14

Template dipindah ke repo sendiri dan dibungkus sebagai skill `agentconfig`.

- `standards/README.md`: tabel registry ID tidak lagi menunjuk `_audit/audit-report.md` "di repo asal" (tidak ada di project baru); diganti rujukan ke `registry/rules.md` template. Ditambah klarifikasi bahwa "project asal" di label status berarti project audit pemilik prefix.
- Selain itu `standards/` identik dengan v0.2.
- Baru: kerangka `project/*.tmpl`, `AGENTS.md.tmpl`, label `[PRD]` dan `[KEPUTUSAN]` di legenda, `agentconfig/.template-lock.json`, script `detect`/`scaffold`/`check`/`build-registry`, `registry/rules.md`.

**Saat sync dari v0.2:** jalankan sync (konflik di `standards/README.md` diharapkan — aman ditimpa). Tambahkan baris "Versi template yang dipakai" di `agentconfig/README.md` jika belum ada (dilakukan otomatis oleh sync). Opsional: tambahkan label `[PRD]`/`[KEPUTUSAN]` ke legenda `agentconfig/README.md`.

## v0.2 — 2026-10-14

Netral tipe project (frontend/backend/fullstack), berdasarkan audit backend #1: `api-design.md` baru; tiga file stack backend (`express-5-layered-api.md`, `prisma-7-postgres.md`, `node-ts7-jest-vercel.md`); `standards/stack/README.md` menjadi indeks multi-stack; `security.md` + `testing/security.md` berbasis OWASP Top 10:2025, API Security Top 10:2023, ASVS 5.0; testing dan Definition of Done mencakup backend; registry prefix ID (`BU-`, `BS-`).

## v0.1.1 — 2026-10-13

Klarifikasi U-03 di `coding-style.md`: bedakan instant dan wall-clock.

## v0.1 — 2026-10-13

Versi awal, diekstrak dari audit frontend #1 (2 app Next.js 16).
