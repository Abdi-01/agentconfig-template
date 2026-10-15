# Panduan menulis PRD

Aturan isi dan gaya PRD hasil skill `prd-writer`. Dibaca di Fase 3–4 SKILL.md dan saat merevisi PRD. Format teknisnya mengikuti `templates/prd.md.tmpl` dan diperiksa oleh `scripts/check-prd.mjs`.

## Bahasa & nada

- Bahasa Indonesia baku tapi tidak kaku; istilah teknis yang lazim tetap Inggris (login, dashboard, upload).
- **Bagian 1** ditulis untuk pemilik bisnis: tanpa jargon teknis, kalimat pendek, fokus pada masalah, hasil, dan ruang lingkup.
- **Bagian 2** ditulis untuk developer dan QA: presisi, atomik, bisa diuji.
- Jangan mengarang angka. Angka dari klien ditulis apa adanya; perkiraan diberi `[ASUMSI]` dan masuk §13.

## Modul & ID

- Modul = kelompok fitur dari sudut pandang pengguna (Booking, Katalog, Akun, Laporan), bukan layer teknis. Kode 2–8 huruf kapital: `BOOK`, `CAT`, `ACC`, `RPT`, `GLOBAL` (fitur lintas halaman).
- ID `FR-<MODUL>-<NNN>` dan `NFR-<KAT>-<NNN>`, nomor tiga digit berurutan per modul/kategori.
- **ID tidak pernah dipakai ulang.** FR yang dibatalkan ditandai `~~FR-…~~ (dibatalkan vX.Y: alasan)`, bukan dihapus. FR baru selalu mengambil nomor berikutnya.
- ID ini dirujuk oleh `agentconfig/project/prd.md`, test, commit, dan komentar kode — stabilitasnya penting.

## Functional requirement yang baik

- **Satu FR = satu kemampuan** yang bisa didemokan. "Customer bisa booking dan bayar dan dapat reminder" dipecah tiga.
- **User story:** *Sebagai <role>, saya ingin <kemampuan> agar <manfaat>.* Role harus ada di §8.
- **Apa, bukan bagaimana.** Tulis perilaku yang terlihat pengguna; hindari menyebut tabel, endpoint, atau library — kecuali memang batasan dari klien.
- **Acceptance criteria:** pola *Diberikan <kondisi>, ketika <aksi>, maka <hasil yang bisa diamati>.*
  - Minimal 2 AC untuk FR prioritas MVP: satu jalur sukses, satu jalur gagal/edge case.
  - Hasil harus bisa dicek tanpa menafsirkan ("pesan error tampil dan booking tidak tersimpan", bukan "sistem menangani dengan baik").
  - Angka eksplisit: batas waktu, jumlah, format.
- **Prioritas** wajib: MVP / Fase 2 / Nanti. MVP = dibutuhkan agar alur utama di §6 berjalan end-to-end.

## Non-functional requirement yang baik

- Setiap NFR punya **target terukur** dan **cara verifikasi**. Kata seperti "cepat", "aman", "mudah", "user-friendly", "responsif" tanpa angka/standar tidak lolos.
- Contoh target: `LCP ≤ 2,5 s (p75, mobile) di halaman beranda dan katalog — Lighthouse/RUM`; `WCAG 2.1 AA — audit axe + uji keyboard`; `Data kesehatan hanya terlihat oleh role dokter dan admin — test otorisasi`; `Format tanggal id-ID, zona Asia/Jakarta — review UI`.
- Data pribadi/kesehatan/keuangan → minimal satu NFR `PRIV` (consent, akses, retensi, hak hapus) dan satu `SEC`.

## Metrik keberhasilan

- Hubungkan setiap metrik ke tujuan bisnis di §3, bukan ke aktivitas tim ("website rilis" bukan metrik).
- Format: metrik + target angka + jangka waktu + sumber data. Jika belum ada baseline, targetnya boleh "baseline diukur 4 minggu pertama" — tulis jujur.

## Ruang lingkup & scope creep

- "Di luar cakupan" minimal satu butir. Permintaan baru setelah PRD disetujui → revisi PRD (versi naik) dengan dampak ke timeline dicatat di Riwayat versi.

## Versi

| Kondisi | Versi |
|---|---|
| Draft selama discovery/review internal | `0.1`, `0.2`, … |
| Disetujui klien (tabel Persetujuan terisi) | `1.0` |
| Perubahan setelah disetujui | `1.1`, `1.2`, … (minor); `2.0` jika ruang lingkup MVP berubah besar |

Setiap kenaikan versi: baris baru di Riwayat versi berisi ringkasan perubahan dan daftar FR/NFR terdampak.
