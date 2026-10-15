# Menurunkan daftar layar dari PRD

Dibaca di Fase 1. Tujuannya daftar layar yang **cukup untuk semua FR MVP dan tidak lebih**.

## Langkah

1. **Role → shell.** Setiap role di PRD §8 yang login mendapat satu shell (sidebar + topbar). Role publik (tanpa login) memakai layout tanpa sidebar.
2. **Modul → layar list + detail.** Untuk tiap modul di §9: biasanya satu layar list (tabel + filter + satu tombol utama), satu layar detail jika entitasnya punya anak (mis. enrollment → sesi), dan form/modal untuk create/edit.
3. **FR → elemen.** Setiap FR MVP harus terlihat di minimal satu layar: kolom tabel, field form, aksi baris, atau stat card. Tulis ID FR di kolom FR.
4. **Home per role.** Hanya jika ada FR/metrik yang menuntut ringkasan (antrean kerja, item terlambat). Maksimal 3 stat card + 1 tabel.
5. **Gabungkan sebelum menambah.** Role yang hanya memantau memakai layar role lain dengan hak baca (catat di kolom Catatan). Approval kecil = filter + aksi di layar list, bukan halaman antrean terpisah. Form pendek (≤5 field) = modal, bukan halaman.
6. **Tunda.** FR Fase 2/Nanti, grafik/analitik, import massal, kalender interaktif → bagian "Ditunda" kecuali FR MVP menuntutnya secara eksplisit.

## Pengelompokan batch

- **Batch 1:** design system + 1–2 layar yang paling mewakili pola (biasanya Login + Home role utama, atau list + detail modul inti).
- **Batch berikutnya:** ≤5 layar, dikelompokkan per role atau per modul supaya konteks prompt utuh. Modal ikut batch layar induknya.
- Layar publik (katalog, landing) di batch terpisah karena layoutnya beda.

## Tanda daftar layar terlalu besar

- Lebih dari ~30 layar untuk MVP dashboard internal.
- Ada layar tanpa FR (kolom FR kosong) → hapus atau tunjukkan FR-nya.
- Dua layar dengan tabel yang hampir sama untuk role berbeda → satu layar, beda hak akses.
