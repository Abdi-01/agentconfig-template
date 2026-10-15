---
name: figma-design
description: Menurunkan daftar layar dari PRD lalu mendesainnya di Figma lewat Figma MCP — agent menggambar layar di canvas dari design system, atau mereview desain buatan desainer — kemudian menyerahkan token, screenshot, dan pemetaan layar ke repo. Pakai saat user memilih Figma sebagai tool desain, memberi link Figma, atau minta "desain di Figma", "review desain Figma", "bawa desain Figma ke repo".
---

# figma-design

Menjembatani PRD dan kode lewat Figma: **daftar layar → desain di Figma → review → handoff ke repo**. Berbeda dengan Stitch, Figma MCP bisa **menulis ke canvas**, jadi agent dapat menggambar layar langsung; user tetap mereview di Figma.

`$SKILL_DIR` = folder tempat file ini berada. `$STITCH` = `$SKILL_DIR/../stitch-design` — skill ini memakai bagian tool-agnostik dari sana: `templates/screens.md.tmpl` (lewat script), `scripts/check-design.mjs --stage screens`, `references/screen-inventory.md`, `references/review-checklist.md`, dan bagian "Isi design-system.md" + "Template build-plan.md" di `references/handoff.md`. Keduanya dipasang bersama oleh `install.sh`. Output di `docs/design/`.

## Prinsip

- **PRD adalah batas.** Setiap layar merujuk ke ID FR; fitur di desain yang tidak ada di PRD dibuang, atau menjadi revisi PRD lewat `prd-writer`.
- **Design system dulu, layar kemudian.** Variables (warna, tipografi, radius, spacing) dan komponen dasar dibuat/dipakai sebelum layar. Tidak ada warna/ukuran literal di frame jika ada variable-nya.
- **Profil layar** sama dengan `stitch-design`: `page`/`modal` = dashboard (tabel, form, modal, stat card; tanpa kalender, chart, banner kecuali FR menuntut); `public` = publik (hero, galeri, komponen yang dituntut FR; tanpa section karangan).
- **Maksimal 5 layar per putaran kerja**, lalu berhenti untuk review. Lebih mudah dikoreksi dan hemat kuota.
- **Figma adalah sumber visual, bukan kode.** Output `get_design_context` adalah referensi untuk diadaptasi ke stack repo (sesuai `agentconfig/`), bukan disalin ke `src/`.
- **Ikuti skill resmi Figma jika ada.** Jika plugin Figma untuk Claude Code terpasang, muat skill-nya sebelum memanggil tool terkait (mis. skill penggunaan canvas sebelum menulis ke canvas, skill design-to-code sebelum `get_design_context`). Aturan skill resmi menang untuk cara memakai tool; skill ini mengatur alur dan batas PRD.
- **Nama tool bisa berubah.** Percayai tool yang benar-benar terdaftar di sesi; nama di file ini hanya contoh.
- Bahasa dokumen: Indonesia. Label UI mengikuti bahasa produk.

Titik berhenti wajib ditandai ⛔.

## Mode

| Situasi | Mode |
|---|---|
| Belum ada desain; agent yang menggambar di Figma | **gambar** (Fase 0–6) |
| Desainer/user menggambar sendiri di Figma (atau sudah ada file Figma) | **review** (Fase 0–1, lalu Fase 4–6) |
| Desain final, mau dibawa ke repo | **handoff** (Fase 5–6) |
| PRD berubah setelah desain dibuat | **revisi** (Langkah R) |

## Fase 0 — Prasyarat

1. **PRD:** `docs/prd/prd.md` atau file dari user. Tidak ada → sarankan `prd-writer` dulu.
2. **agentconfig:** dibutuhkan untuk Fase 5–6. Belum ada → sarankan skill `agentconfig` (urutan baku: `prd-writer → agentconfig → figma-design`).
3. **Integrasi Figma:** jalankan pengecekan F1–F5 di `references/figma-setup.md`, termasuk **jenis seat** (Starter/View/Collab hanya 6 tool call per bulan — tidak cukup untuk skill ini) dan akses ke file. Gagal → diagnosis + panduan setup; mode review/handoff masih bisa jalan manual (user kirim screenshot + export variables).
4. **File Figma:** minta link file (atau buat file baru jika tool tersedia dan user setuju). Catat di `figma.md`.
5. Kerangka:
   ```
   node $SKILL_DIR/scripts/new-design.mjs --out docs/design --product "<nama>" --figma-url "<link>"
   ```
   Membuat `screens.md` (format bersama), `figma.md`, `export/README.md`. Tidak menimpa file yang ada.

## Fase 1 — Daftar layar

Sama dengan `stitch-design` Fase 1: ikuti `$STITCH/references/screen-inventory.md`, isi `screens.md`, lalu:
```
node $STITCH/scripts/check-design.mjs --dir docs/design --prd docs/prd/prd.md
```
Mode review: daftar layar diturunkan dari PRD **dan** dicocokkan dengan frame yang ada di file Figma (`get_metadata`); frame tanpa FR dan FR MVP tanpa frame dicatat.

⛔ Kirim ringkasan (layar per role, putaran kerja, FR MVP tanpa layar, layar ditunda) dan tunggu persetujuan.

## Fase 2 — Brief visual & design system

Tanyakan dalam satu pesan (dengan default): referensi gaya, warna utama (hex resmi?), font, bahasa label UI, platform (desktop web default untuk dashboard), dark mode (default: tidak di MVP). Lalu, mengikuti `references/figma-workflow.md` › Design system:
- cek library/design system yang sudah ada di file atau tim (tool pencarian design system jika tersedia) — pakai ulang sebelum membuat baru;
- buat/rapikan **variables** dan komponen dasar (button, input, select, table row, badge status sesuai status di PRD, modal, stat card).

⛔ Tampilkan ringkasan variables dan komponen (dan screenshot halaman design system) sebelum menggambar layar.

## Fase 3 — Gambar layar (mode gambar)

Per putaran (≤5 layar, satu profil, urut kolom Batch di `screens.md`), ikuti `references/figma-workflow.md` › Menggambar layar: satu frame per `UI-xx` dengan nama frame diawali ID (`UI-03 Pilih slot`), komponen dan variables dari Fase 2, data contoh realistis, isi sesuai FR. Catat node-id frame di `figma.md`. Update Status di `screens.md` (`Draft`).

⛔ Setelah setiap putaran: kirim screenshot frame (`get_screenshot`) dan tunggu review.

## Fase 4 — Review

Periksa screenshot frame dengan `$STITCH/references/review-checklist.md` (Buang · Tambah · Sederhanakan · Konsistensi) terhadap baris `screens.md` dan FR-nya. Mode gambar: perbaiki langsung di canvas setelah user setuju. Mode review: tulis temuan untuk desainer (per frame, dengan link node). FR yang ambigu → usulkan revisi lewat `prd-writer`. Catat di `figma.md` › Log review; update Status.

⛔ Berhenti setiap putaran sampai user menyatakan layar Final.

## Fase 5 — Handoff ke repo

Ikuti `references/figma-workflow.md` › Handoff:
1. **Token:** `get_variable_defs` → tabel token (light/dark) di `agentconfig/project/design-system.md`, label `[DESAIN]` + link file/node.
2. **Screenshot:** `get_screenshot` per frame Final → `docs/design/export/batch-N/UI-xx-<slug>.png`.
3. **Konteks per layar:** catat node-id/link per `UI-xx` di `figma.md` (agent coding memanggil `get_design_context` saat membangun layar itu). Simpan output `get_design_context` ke `export/` hanya jika user ingin snapshot offline.
4. **Komponen:** komponen Figma → komponen repo yang direncanakan (tabel Komponen reusable, Lokasi `TODO`). Code Connect opsional, hanya jika user minta dan seat/plan mendukung.
5. Lengkapi `design-system.md` sesuai `$STITCH/references/handoff.md` › Isi design-system.md.

⛔ Tampilkan tabel token dan pemetaan komponen sebelum menulis.

## Fase 6 — Urutan build

Tulis `docs/design/build-plan.md` dari `$STITCH/references/handoff.md` › Template build-plan, dengan dua penyesuaian: referensi visual = link frame di `figma.md` + PNG di `export/`; Langkah 4–5 menyebut "panggil `get_design_context` untuk node layar tersebut, lalu adaptasi ke komponen repo". Skill ini tidak menulis kode aplikasi.

## Langkah R — PRD berubah

1. `check-design.mjs` membandingkan FR di PRD dengan `screens.md`.
2. ⛔ Tampilkan dampak: layar baru/diubah/dihapus dan frame Figma yang terdampak.
3. Update `screens.md`; frame yang diganti diberi nama `[Diganti] UI-xx …` dan dipindah ke halaman Arsip, bukan dihapus.
