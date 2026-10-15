# Changelog — stitch-design

## v0.2.3 — 2026-10-15

Template `build-plan.md` menekankan kode paling sederhana (`coding-style.md` › Kesederhanaan) dan mengikuti urutan `docs/delivery/tasks.md` jika ada. Berlaku juga untuk `figma-design`.

## v0.2.2 — 2026-10-15

Bagian tool-agnostik (template `screens.md`, `check-design --stage screens`, `screen-inventory.md`, `review-checklist.md`, template build-plan) kini dipakai bersama oleh skill baru `figma-design`; teksnya dibuat netral tool. Tidak ada perubahan perilaku.

## v0.2.1 — 2026-10-15

Perbaikan hasil review.

- **Jalur export otomatis dirombak** (`references/mcp-setup.md`). Default untuk Claude Code sekarang **CLI resmi Google `@google/stitch`** (v0.11.1, di-pin; login OAuth `stitch login`) yang dipanggil lewat shell, dengan opsi MCP stdio `stitch mcp start`. MCP remote `stitch.googleapis.com/mcp` + header `X-Goog-Api-Key` tidak disarankan: dilaporkan gagal di Claude Code (*"Incompatible auth server: does not support dynamic client registration"*, issue #41664) dan menyimpan key sebagai teks biasa di `~/.claude.json`. Proxy komunitas turun menjadi cadangan terakhir dengan versi di-pin (`0.9.0`), bukan `@latest`. Pengecekan C1–C5 dan diagnosis diperbarui (termasuk `MISSING_CANVAS_CREDENTIALS` dan error DCR).
- **Dua profil layar.** `page`/`modal` = profil dashboard (blok **Simplicity rules**, seperti sebelumnya); `public` = profil publik (blok baru **Public page rules**: boleh hero, galeri, dan komponen yang dituntut FR, tanpa section karangan). Satu batch = satu profil. `check-design` mewajibkan blok sesuai profil dan memberi warning untuk batch campuran.
- Contoh di SKILL, template, dan checklist dibuat generik (tidak lagi memakai istilah satu domain).
- `check-design`: pengecualian layar login juga mengenali "Masuk", "Sign in", "Daftar", "Register".

## v0.2 — 2026-10-15

- Fase 5: pilihan jalur export **manual** (default) atau **MCP**.
- `references/mcp-setup.md` baru: pengecekan integrasi C1–C5 (tool terdaftar → server merespons → akun Google sama dengan pemilik project → layar terbaca → aset terambil), tabel diagnosis (termasuk akun berbeda dan API key ditolak), panduan setup Jalur A (remote + API key) dan Jalur B (gcloud + proxy lokal), pemasangan di scope user tanpa kredensial di repo. Hanya tool baca yang dipakai.
- `export/README.md` (dari `new-design`): tabel Integrasi untuk mencatat jalur dan hasil cek.
- Catatan: endpoint dan nama tool belum diverifikasi ke server live dari lingkungan pembuat skill; skill memprioritaskan tool yang benar-benar terdaftar di sesi.

## v0.1 — 2026-10-15

Versi awal, dari pengalaman mendesain dashboard internal dengan Google Stitch: daftar layar dari PRD (`UI-NN` dirujuk ke `FR-…`), prompt per batch (≤5 layar, blok Simplicity rules + Edit in place), checklist review terhadap PRD, handoff ke `docs/design/export/` dan `agentconfig/project/design-system.md`, template `build-plan.md`; script `new-design` dan `check-design`.
