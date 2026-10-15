# Handoff desain ke repo

Dibaca di Fase 5–6.

## Struktur di repo

```
docs/design/
  screens.md        ← daftar layar (sumber kebenaran)
  prompts.md        ← prompt per batch + log review
  build-plan.md     ← prompt build untuk coding agent (Fase 6)
  export/
    README.md
    DESIGN.md       ← dari Stitch, apa adanya
    batch-1/UI-01-login.html, UI-01-login.png, …
```

`docs/design/export/` adalah **referensi**. Tidak di-import oleh kode, tidak diformat, tidak diedit. Jika export diperbarui, timpa file lama.

## Cara export

| Cara | Kapan | Catatan |
|---|---|---|
| Multi-select layar di canvas → download zip (HTML + gambar), plus DESIGN.md | Default | Satu kali per batch final; ganti nama file ke ID `UI-xx` |
| Export per layar | Revisi satu layar | |
| Stitch MCP server di coding agent | Jika user sudah memasangnya | Masih beta; ikuti dokumentasi resmi, jangan tulis konfigurasi dari ingatan |

## Ekstraksi token

Dari DESIGN.md (utama) dan HTML (cek nilai yang benar-benar dipakai):

| Ambil | Ke |
|---|---|
| Warna primary, netral, semantic (success/warning/danger/info), tint baris | tabel token `design-system.md` + `globals.css` |
| Font family, skala ukuran | token font |
| Radius, tinggi input/baris, lebar sidebar | token radius/spacing atau catatan layout |
| Kelas kustom Tailwind dari export (`text-on-surface`, `bg-surface-container`, `font-body-md`, …) | tabel **Pemetaan kelas export** → token project |

Nilai yang hanya muncul sekali di satu layar biasanya bukan token; jangan dipromosikan.

## Isi `agentconfig/project/design-system.md`

- **Sumber desain:** path `docs/design/screens.md`, `docs/design/export/`, versi/tanggal export.
- **Brand:** label `[DESAIN]` + path DESIGN.md; jika warna perkiraan dari screenshot, label `[KEPUTUSAN]` setelah user konfirmasi.
- **Token:** light (dan dark jika ada di DESIGN.md; jika tidak, `TODO` atau "tidak ada dark mode" sebagai `[KEPUTUSAN]`).
- **Pemetaan kelas export:** `kelas export → token/kelas project`.
- **Komponen reusable:** daftar komponen gabungan yang direncanakan, Lokasi `TODO` sampai dibuat.

## Template `build-plan.md`

```markdown
# Rencana build UI — <produk>

Baca `AGENTS.md` dulu dan ikuti `agentconfig/` (terutama `project/design-system.md` dan file stack UI).
Referensi visual: `docs/design/export/` (HTML + PNG per layar, ID UI-xx sesuai `docs/design/screens.md`). Jangan menyalin HTML export ke src/; pakai hanya sebagai acuan tampilan.

Langkah 1 — Token. Terapkan token dari `project/design-system.md` ke `src/app/globals.css` (:root/.dark + @theme inline). Tidak ada hex literal di komponen.
Langkah 2 — Komponen dasar. Tambahkan lewat CLI UI library: <daftar, mis. button input select table dialog tabs badge card skeleton sonner>. Jangan menulis ulang file hasil generate.
Langkah 3 — Shell & komponen gabungan. Buat AppShell per role (<role → item sidebar dari screens.md › Navigasi>) dan: <PageHeader, FilterBar, DataTable, StatCard, StatusPill, QuotaBar, …>. Catat lokasinya di `project/design-system.md`.
Langkah 4 — Layar kunci dengan data mock: <4–5 ID UI>. Bandingkan dengan PNG export; perbedaan yang disengaja dicatat.
Langkah 5 — Layar sisanya: <ID UI>, dirakit hanya dari komponen langkah 2–3.
Langkah 6 — Data. Ganti mock dengan API/database per modul sesuai `project/architecture.md`; satu modul per PR.

Jangan menambah fitur yang tidak ada di `docs/design/screens.md`. Berhenti dan tanya jika layar butuh komponen baru di luar daftar langkah 3.
```

Isi `<…>` dari `screens.md` dan `design-system.md`. Komponen yang disebut harus sesuai UI library di file stack repo (mis. shadcn/Base UI); jangan menyebut library lain.
