# Alur kerja di Figma

Dibaca di Fase 2–5. Cara menyusun file Figma, menggambar layar dari `screens.md`, dan menyerahkan desain ke repo. Jika skill resmi Figma tersedia di sesi, cara memanggil tool mengikuti skill itu; file ini mengatur struktur dan batasnya.

## Struktur file Figma

| Halaman | Isi |
|---|---|
| `00 Cover` | nama produk, versi PRD, link ke repo/PRD |
| `01 Design system` | variables (dokumentasi visual), komponen dasar, status badge |
| `02 <Role/area>` … | satu halaman per role atau area (Publik, Customer, Admin); frame per layar |
| `99 Arsip` | frame `[Diganti] UI-xx …` |

Nama frame selalu diawali ID: `UI-05 Daftar booking`. Modal = frame terpisah di samping layar induk, nama `UI-06 Detail booking (modal)`.

## Design system

1. **Pakai ulang dulu.** Cari library tim / design system yang sudah ada (tool pencarian design system jika tersedia, atau tanya user). Jika repo memakai shadcn/Base UI, utamakan kit Figma yang padanannya ada di kode.
2. **Variables** (collection `Tokens`, mode `Light` [+ `Dark` jika disepakati]):
   - warna semantik dengan nama sama seperti token repo: `background`, `foreground`, `primary`, `primary-foreground`, `muted`, `muted-foreground`, `border`, `destructive`, `success`, `warning`;
   - tipografi (font family, skala), radius, spacing.
   Nama yang sama dengan token `globals.css` membuat handoff hampir 1:1 dan menghindari kelas tanpa token (aturan S-21).
3. **Komponen dasar** dengan variant/property: Button (primary, secondary, ghost, destructive × default, disabled, loading), Input, Select, Textarea, Checkbox, Table header/row, Badge status (status dari PRD), Modal, Toast, Empty state, Stat card. Profil publik menambah Hero, Card bergambar, CTA section bila dibutuhkan FR.
4. Semua isi frame memakai komponen + variables. Warna literal hanya untuk ilustrasi/placeholder gambar.

## Menggambar layar

Per putaran (≤5 layar, satu profil):
1. Baca baris `screens.md` + FR terkait (user story, AC, entitas §11) — elemen layar diturunkan dari sana.
2. Pola layar (sama dengan Stitch): List = search + ≤2 filter, tabel ≤6 kolom, satu tombol utama; Detail = ringkasan ≤6 field, tab ≤3; Form/modal = field berurutan, validasi inline; Home = ≤3 stat card + 1 tabel; Publik = hero/section sesuai FR, satu CTA utama per section.
3. Gunakan auto layout; lebar frame desktop 1440 (dashboard) atau 390 (mobile); data contoh realistis dari domain produk.
4. State penting cukup sebagai frame tambahan bila FR/AC menuntutnya (kosong, error validasi), bukan untuk semua layar.
5. Catat node-id/link frame di `figma.md` dan ubah Status `screens.md` → `Draft`.
6. Kirim screenshot frame untuk review (⛔).

Jangan menambah layar, section, atau fitur yang tidak ada di `screens.md`. Jika menurutmu layar butuh elemen di luar FR, tanyakan dulu.

## Handoff

| Ambil | Tool (contoh) | Ke |
|---|---|---|
| Variables | `get_variable_defs` | tabel token di `agentconfig/project/design-system.md` (+ nilai Dark jika ada) |
| Screenshot frame Final | `get_screenshot` | `docs/design/export/batch-N/UI-xx-<slug>.png` |
| Struktur & konteks layar | `get_metadata`, `get_design_context` | link/node-id di `figma.md`; dipanggil ulang oleh agent coding saat membangun layar |
| Komponen | `get_metadata` pada halaman Design system | tabel Komponen reusable (Lokasi `TODO`) |

- Nama variable Figma → token repo dicatat di tabel **Pemetaan kelas export** `design-system.md` jika namanya berbeda.
- Output `get_design_context` biasanya berupa kode contoh (mis. React + Tailwind); perlakukan sebagai referensi dan adaptasi ke komponen/token repo, jangan disalin.
- Hemat kuota: ambil screenshot hanya frame berstatus Final; satu `get_variable_defs` untuk halaman Design system.
