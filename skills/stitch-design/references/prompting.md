# Menulis prompt Stitch

Dibaca di Fase 3 dan saat menulis prompt perbaikan di Fase 4.

## Aturan umum

- Bahasa Inggris, kalimat konkret. Sebut kolom tabel, field form, isi stat card, dan nama tombol secara eksplisit. "Make a dashboard" menghasilkan layar generik; "Table: Student, Cohort, Mentor, Quota (x/12 bar), Status" menghasilkan layar yang bisa dipakai.
- Maksimal 5 layar per prompt. Lebih dari itu kualitas dan konsistensi turun.
- Jangan pakai kata yang memancing fitur di luar PRD: "calendar editor", "drag to", "booking", "chart", "analytics", "notifications", "smart", "AI-powered". Jika FR tidak menuntutnya, jangan sebut.
- Pakai data contoh realistis dari domain produk (nama orang lokal, kode, tanggal format produk).
- Platform tetap sama dalam satu project Stitch.
- Prompt tidak bisa menghapus layar; tulis instruksi hapus manual di bagian Cara pakai, bukan di prompt.

## Batch 1 — design system

Struktur:

```
Design a <desktop web app | mobile app> called "<nama>" for <organisasi>. <1–2 kalimat: apa fungsinya, untuk siapa>. Roles: <daftar role>.

Visual style (match our existing <produk referensi> if a reference is given):
- <layout: topbar, sidebar lebar ±280px, item aktif, latar konten, kartu utama>
- <page title, filter bar, tinggi input, radius>
- <tabel: header uppercase kecil, tinggi baris, divider, truncation, tint baris status>
- <tipografi: satu font>
- <warna: primary hex, netral, semantic>

Create the design system: color tokens, type scale, spacing, radius, buttons (primary, secondary outline, ghost, destructive), text input, select, date-time picker, tabs, pill badges for statuses (<status dari PRD>), data table, stat card, progress bar, modal, toast, empty state.

<Simplicity rules atau Public page rules sesuai profil layar kunci — blok di bawah>

Screens:
1. <layar kunci 1: elemen konkret>
2. <layar kunci 2: elemen konkret>

Use realistic <bahasa/negara> names and codes like <contoh dari PRD>.
```

## Blok wajib batch 2…n

Satu batch = satu profil. Profil ditentukan kolom Tipe di `screens.md`: semua layar `public` → profil publik; selain itu → profil dashboard. Batch campuran ditandai warning oleh checker; pisahkan.

Selalu di awal prompt (checker mencari frasa `Edit the selected screens in place`):

```
Using the existing <nama> design system.
Edit the selected screens in place. Do not create new versions or duplicates of them; only create new screens for items that do not exist yet.
```

Lalu satu dari dua blok berikut.

**Profil dashboard** (`page`/`modal`; checker mencari `Simplicity rules`):

```
Simplicity rules: one main task per screen, max one primary button. Use tables, forms and modals only; no calendars, drag-and-drop, charts, legends, breadcrumbs or explanatory banners. Max 6 table columns. Do not add any feature I did not list. Show rules only as inline validation errors.
```

Jika FR MVP memang butuh chart atau kalender, hapus kata itu dari daftar larangan **khusus untuk batch tersebut** dan sebutkan FR-nya di baris `Layar:`.

**Profil publik** (`public`; checker mencari `Public page rules`):

```
Public page rules: mobile-first, one primary call-to-action per section. Only the sections I list; no testimonials, pricing tiers, newsletter, chat widget, statistics or FAQ unless listed. Use realistic content structure (no lorem ipsum) and clearly marked image placeholders. Do not add any feature I did not list. Show rules only as inline validation errors.
```

Komponen yang dituntut FR (mis. kalender pilih jadwal di halaman booking, galeri foto) ditulis eksplisit di daftar layar.

## Pola layar

| Pola | Isi prompt |
|---|---|
| List | search + ≤2 filter, tabel ≤6 kolom, satu tombol utama, aksi baris |
| Detail | ringkasan di atas (≤6 field), tab (≤3), tabel anak, satu tombol utama |
| Form/modal | field berurutan dengan tanda wajib, pesan validasi inline, Save |
| Home | ≤3 stat card + 1 tabel antrean |
| Publik | tanpa sidebar, filter chip, grid kartu, satu CTA per kartu |

## Prompt perbaikan (Fase 4)

- Satu layar, satu perubahan: `On the "<nama layar>" screen, remove <X>.` atau `… replace <X> with <Y>.`
- Redesign beberapa layar: pilih layarnya di canvas, lalu batch baru dengan blok wajib + deskripsi ulang tiap layar, ditutup kalimat `Remove: <daftar elemen yang harus hilang>.`
