# Changelog — stitch-design

## v0.2 — 2026-10-15

- Fase 5: pilihan jalur export **manual** (default) atau **MCP**.
- `references/mcp-setup.md` baru: pengecekan integrasi C1–C5 (tool terdaftar → server merespons → akun Google sama dengan pemilik project → layar terbaca → aset terambil), tabel diagnosis (termasuk akun berbeda dan API key ditolak), panduan setup Jalur A (remote + API key) dan Jalur B (gcloud + proxy lokal), pemasangan di scope user tanpa kredensial di repo. Hanya tool baca yang dipakai.
- `export/README.md` (dari `new-design`): tabel Integrasi untuk mencatat jalur dan hasil cek.
- Catatan: endpoint dan nama tool belum diverifikasi ke server live dari lingkungan pembuat skill; skill memprioritaskan tool yang benar-benar terdaftar di sesi.

## v0.1 — 2026-10-15

Versi awal, dari pengalaman mendesain dashboard internal dengan Google Stitch: daftar layar dari PRD (`UI-NN` dirujuk ke `FR-…`), prompt per batch (≤5 layar, blok Simplicity rules + Edit in place), checklist review terhadap PRD, handoff ke `docs/design/export/` dan `agentconfig/project/design-system.md`, template `build-plan.md`; script `new-design` dan `check-design`.
