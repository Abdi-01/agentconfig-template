# Checklist review hasil desain

Dipakai bersama oleh `stitch-design` dan `figma-design` (tool-agnostik).

Dibaca di fase review. Bandingkan screenshot dengan baris layar di `screens.md` dan FR yang dirujuk.

## Buang (tidak ada di PRD)

- Alur yang bertentangan dengan keputusan PRD (mis. customer bisa memesan sendiri padahal PRD menyatakan staf yang membuat jadwal; tombol auto-approve yang tidak ada di FR).
- Angka/aturan karangan (minimum jam, target, skor) yang tidak ada di PRD/SOP.
- Data milik role lain yang tidak berhak dilihat (cocokkan §8; contoh: harga modal atau data pasien lain di layar customer).
- Notifikasi, chat, pencarian global, pengaturan profil, dark mode toggle — kecuali ada FR-nya.
- Data dari layar lain yang ikut tercampur (mis. jadwal sesi di halaman availability).

## Tambah (FR tidak terwakili)

- Kolom/field yang disebut FR atau entitas §11 tetapi tidak tampil.
- Aksi FR (ubah status, verifikasi, tutup) tanpa tombol/aksi baris.
- Pesan validasi untuk aturan bisnis penting (jam operasional, H-24, kapasitas, duplikat).
- Empty state dan state error untuk tabel utama.

## Sederhanakan

Profil dashboard (`page`/`modal`):


- Lebih dari satu tombol utama, atau tombol sekunder yang tidak dipakai FR (Reset, Export ganda).
- Tabel >6 kolom; kalender/grid jam; legend; breadcrumb; banner penjelasan aturan; badge dekoratif.
- Kartu bertumpuk di dalam kartu; ringkasan yang mengulang isi tabel.

Profil publik (`public`):

- Section karangan: testimoni, paket harga, newsletter, chat widget, statistik, FAQ — kecuali ada di PRD.
- Lebih dari satu CTA utama per section; CTA yang tidak mengarah ke FR (mis. "Download app" tanpa app).
- Teks lorem ipsum atau klaim marketing yang tidak diberikan klien.

## Konsistensi

- Sidebar dan topbar sama dengan Batch 1; item sidebar sesuai `screens.md` › Navigasi.
- Nama status dan warna pill sama di semua layar.
- Istilah sama dengan glosarium PRD.

## Format laporan

```
UI-xx <nama layar>
- Buang: …
- Tambah: … (FR-…)
- Sederhanakan: …
Prompt perbaikan: (blok kode)
```

Jika satu temuan muncul di banyak layar, perbaiki sumbernya: kata pemicu di prompt (lihat `prompting.md`) atau kalimat FR yang ambigu (usulkan revisi lewat `prd-writer`).
