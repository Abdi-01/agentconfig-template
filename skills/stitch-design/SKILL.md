---
name: stitch-design
description: Menurunkan daftar layar dari PRD, menyusun prompt Google Stitch per batch (design system + layar), mereview hasil desain terhadap PRD, lalu menyerahkan desain ke repo (export ke docs/design/, token ke agentconfig/project/design-system.md, urutan build untuk coding agent). Pakai saat user minta "buat prompt Stitch", "desain layar dari PRD", "redesign/sederhanakan desain Stitch", "review hasil Stitch", atau "bawa desain Stitch ke VS Code/repo" — biasanya setelah prd-writer dan agentconfig.
---

# stitch-design

Menjembatani PRD dan kode lewat Google Stitch: **daftar layar → prompt per batch → review → handoff ke repo**. Skill ini tidak membuka Stitch; user yang menjalankan prompt di Stitch dan mengirim balik screenshot atau file export.

`$SKILL_DIR` = folder tempat file ini berada. Script tanpa dependency (Node ≥18). Output di `docs/design/` (sejajar `docs/prd/`).

## Prinsip

- **PRD adalah batas.** Setiap layar merujuk ke ID FR. Fitur yang muncul di desain tetapi tidak ada di PRD dibuang dari desain, bukan ditambahkan diam-diam ke scope. Jika user ingin mempertahankannya, itu revisi PRD lewat `prd-writer`.
- **Sederhana dulu, sesuai jenis layar.** Dua profil, ditentukan kolom Tipe di `screens.md`:
  - **Dashboard** (`page`, `modal`): tabel, form, modal, dan stat card. Tanpa kalender interaktif, drag-and-drop, grafik, legend, breadcrumb, atau banner aturan, kecuali FR menuntutnya. Aturan bisnis tampil sebagai validasi di form. Blok prompt: **Simplicity rules**.
  - **Publik** (`public`: landing, katalog, detail produk/layanan, checkout, login): boleh hero, galeri, kartu bergambar, dan komponen yang dituntut FR (mis. kalender booking), tetapi tanpa section karangan (testimoni, paket harga, newsletter, chat widget, statistik) yang tidak ada di PRD. Blok prompt: **Public page rules**.
- **Maksimal 5 layar per prompt.** Stitch tidak stabil di atas itu (gaya melenceng, layar terlewat). Satu revisi kecil = satu perubahan per prompt.
- **Export adalah referensi, bukan kode.** HTML Stitch tidak disalin ke `src/`. Yang dibawa ke repo: token, screenshot/HTML sebagai acuan visual, dan pemetaan kelas export ke token project (aturan S-21 di `standards/stack/shadcn-base-ui-tailwind4.md` jika repo memakai agentconfig).
- **Tool lain = skill lain.** Skill ini khusus Stitch; untuk Figma pakai skill `figma-design`. Keduanya memakai `docs/design/screens.md`, `check-design.mjs` (stage screens), `screen-inventory.md`, dan `review-checklist.md` dari skill ini. Jika user belum memilih tool, tanyakan dulu (lihat `prd-writer` Fase 6).
- Bahasa dokumen: Indonesia; prompt Stitch: Inggris (hasil Stitch lebih konsisten). Label UI di prompt mengikuti bahasa produk (tanyakan di Fase 2).

Titik berhenti wajib ditandai ⛔.

## Mode

| Situasi | Mode |
|---|---|
| Belum ada `docs/design/` | **baru** (Fase 1–6) |
| Ada `docs/design/` + user kirim screenshot/keluhan desain | **review** (Fase 4) |
| Desain sudah final, mau dibawa ke repo | **handoff** (Fase 5–6) |
| PRD berubah setelah desain dibuat | **revisi** (Langkah R) |

## Fase 0 — Prasyarat

1. Cari PRD: `docs/prd/prd.md` (format `prd-writer`), atau file lain dari user. Jika tidak ada: sarankan `prd-writer` dulu. Jika user menolak, minta minimal daftar role + fitur MVP dan catat sebagai `[ASUMSI]` di `screens.md`.
2. Cek `agentconfig/`. Jika belum ada dan repo sudah dibuat: sarankan menjalankan skill `agentconfig` dulu (urutan baku: `prd-writer → agentconfig → stitch-design`). Fase 1–4 tetap bisa jalan tanpa agentconfig; Fase 5–6 butuh.
3. Buat kerangka:
   ```
   node $SKILL_DIR/scripts/new-design.mjs --out docs/design --product "<nama>"
   ```
   Membuat `screens.md`, `prompts.md`, `export/README.md`. Tidak menimpa file yang sudah ada.

## Fase 1 — Daftar layar

Baca PRD sampai habis (§8 role, §9 FR, §5 scope, §6 alur). Isi tabel `screens.md` sesuai `references/screen-inventory.md`:
- satu baris per layar/modal, kolom Role, Tipe, FR, Batch;
- hanya FR **MVP**; FR Fase 2/Nanti dicatat di bagian "Ditunda";
- satu role yang hanya memantau (mis. "Manajer: baca semua") tidak mendapat layar sendiri jika layar role lain sudah cukup; catat aksesnya di kolom Catatan.

Jalankan:
```
node $SKILL_DIR/scripts/check-design.mjs --dir docs/design --prd docs/prd/prd.md
```

⛔ **Kirim ringkasan ke user dan berhenti:** jumlah layar per role, rencana batch (≤5 layar/batch), FR MVP yang belum punya layar (dari `uncoveredMvp`), dan layar yang sengaja ditunda. Tunggu persetujuan.

## Fase 2 — Brief visual

Tanyakan dalam satu pesan (dengan default):
1. Referensi gaya: screenshot dashboard/produk yang sudah ada (paling efektif), URL, atau deskripsi.
2. Warna utama (hex resmi jika ada; jika diambil dari screenshot, beri label perkiraan).
3. Bahasa label UI.
4. Platform: desktop web (default untuk dashboard internal), mobile, atau keduanya. Satu project Stitch = satu platform.

Tulis jawabannya ke bagian **Brief** di `prompts.md`.

## Fase 3 — Prompt

Ikuti `references/prompting.md`. Tulis ke `prompts.md`:
- **Batch 1:** design system lengkap (token, komponen, status pill sesuai status di PRD) + 1–2 layar kunci. Disertai instruksi: cek dan rapikan panel Design System di Stitch sebelum batch berikutnya.
- **Batch 2…n:** maksimal 5 layar dengan satu profil per batch (dashboard **atau** publik, jangan dicampur), diawali blok **Simplicity rules** (dashboard) atau **Public page rules** (publik) dan **Edit in place**, layar ditulis dengan kolom/field konkret dari FR dan data model PRD, data contoh realistis.
- Setiap batch mencantumkan baris `Layar: UI-01, UI-02, …` sesuai `screens.md`.

Jalankan `check-design.mjs … --stage prompts` sampai `ok: true`. Lalu kirim prompt ke user per batch, dengan cara pakai: buat project Stitch (mode Web/App sesuai Fase 2) → jalankan Batch 1 → rapikan Design System → batch berikutnya. Untuk redesign: pilih layar lama di canvas dulu, jalankan prompt, hapus layar lama secara manual jika Stitch tetap membuat versi baru (prompt tidak bisa menghapus layar).

## Fase 4 — Review hasil

Saat user mengirim screenshot hasil Stitch, periksa dengan `references/review-checklist.md`:
- elemen/fitur yang tidak ada di PRD (paling sering: booking mandiri, auto-accept, notifikasi, angka komitmen, chart);
- field/kolom/aksi FR yang hilang;
- kompleksitas melebihi prinsip (kalender, legend, banner, >6 kolom tabel, >1 tombol utama);
- data sensitif yang tampil ke role yang tidak berhak (cocokkan dengan §8 PRD).

Laporkan temuan dalam tiga kelompok (Buang · Tambah · Sederhanakan), lalu beri prompt perbaikan per layar. Jika masalahnya berasal dari PRD/FR yang ambigu (mis. FR menyebut "tampilan kalender"), usulkan revisi kalimat FR dan arahkan ke `prd-writer` mode revisi. Catat ringkas di `prompts.md` › Log review. Update kolom Status di `screens.md`.

⛔ Berhenti setiap putaran review sampai user mengirim hasil berikutnya atau menyatakan desain final.

## Fase 5 — Handoff ke repo

Ikuti `references/handoff.md`.

⛔ **Tanyakan jalur export:** **manual** (user download zip dari canvas, default) atau **otomatis** (agent mengambil layar lewat CLI resmi `@google/stitch`, atau MCP stdio dari CLI yang sama).

1. Ambil desain ke `docs/design/export/` (satu subfolder per batch, nama file diawali ID `UI-xx`):
   - **Manual:** user multi-select layar final → download zip HTML + gambar, plus DESIGN.md, lalu letakkan di folder itu.
   - **Otomatis:** ikuti `references/mcp-setup.md`. Default untuk Claude Code adalah **Jalur C** (CLI resmi lewat shell, tanpa MCP); MCP remote dengan header API key **tidak dipakai** karena dilaporkan gagal di Claude Code. Jalankan pengecekan integrasi C1–C5 lebih dulu, termasuk memastikan login CLI milik **akun Google yang sama** dengan pemilik project Stitch. Jika belum terpasang atau ada langkah gagal: tampilkan diagnosis + panduan setup dan tawarkan jalur manual sambil menunggu. Hanya operasi baca yang dipakai.
   - Catat jalur dan hasil cek di `docs/design/export/README.md` › Integrasi. Jangan menulis email atau kredensial ke repo.
2. Baca DESIGN.md + beberapa HTML: ekstrak warna, font, radius, spacing, dan kelas kustom yang dipakai export.
3. Isi `agentconfig/project/design-system.md`: Brand, tabel token (light/dark), **Pemetaan kelas export → token project**, komponen gabungan yang direncanakan (AppShell, PageHeader, FilterBar, DataTable, StatCard, StatusPill, …) dengan kolom Lokasi `TODO` sampai dibuat. Label `[DESAIN]` + path file export.
4. Komponen gabungan yang bukan bawaan UI library dicatat sebagai `D-xx` di `project/decisions.md` hanya jika menyimpang dari standards.

⛔ Tampilkan tabel token dan pemetaan kelas ke user sebelum menulis.

## Fase 6 — Urutan build

Tulis prompt build untuk coding agent ke `docs/design/build-plan.md` (template di `references/handoff.md`), lalu kirim ke user. Urutan baku:
1. Token ke `globals.css` (`:root`/`.dark` + `@theme inline`) sesuai design-system.md.
2. Komponen dasar lewat CLI UI library (`npx shadcn@latest add …`), tidak ditulis ulang.
3. AppShell per role + komponen gabungan; dicatat di design-system.md.
4. 4–5 layar kunci dengan data mock; bandingkan dengan screenshot export.
5. Layar sisanya dirakit dari komponen yang sama.
6. Sambungkan data (API/database) per modul, mengikuti `agentconfig/`.

Skill ini tidak menulis kode aplikasi. Jika user minta Claude langsung membangun, itu pekerjaan coding biasa yang mengikuti `AGENTS.md`.

## Langkah R — PRD berubah

1. Bandingkan FR di PRD dengan kolom FR `screens.md` (`check-design.mjs` melaporkan FR yang hilang/dibatalkan).
2. ⛔ Tampilkan dampak: layar baru, layar diubah, layar dihapus, batch prompt yang perlu dijalankan ulang.
3. Update `screens.md` dan tulis batch revisi baru di `prompts.md` (jangan ubah batch lama; tandai `Diganti oleh Batch N`).
