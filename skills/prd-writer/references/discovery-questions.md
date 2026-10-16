# Pertanyaan discovery

Bank pertanyaan untuk menyusun PRD, dikelompokkan per ronde. Dibaca di Fase 2 SKILL.md. Ini bank, bukan kuesioner: tanyakan hanya yang belum terjawab oleh bahan yang ada, maksimal 8 per ronde, dan selalu sertakan **rekomendasi default** supaya user cukup menjawab "ya" atau "default".

## Cara bertanya

- Bernomor, satu kalimat per pertanyaan, diikuti `→ Default: …` dan alasan singkat jika perlu.
- Untuk pilihan tertutup, beri 2–4 opsi.
- Jawaban "default" / "terserah" dicatat sebagai `[ASUMSI]` dan masuk §13 PRD — bukan dianggap keputusan klien.
- Jawaban yang bergantung pada klien tetapi user belum tahu → masuk §14 Pertanyaan terbuka dengan pemilik "klien".
- Jangan menanyakan detail teknis implementasi (framework, database) di sini; itu urusan skill `agentconfig`. Kecuali klien punya batasan teknis (mis. "harus pakai server sendiri").

## Ronde 1 — Bisnis & masalah (selalu)

1. Produk ini untuk siapa (nama klien/brand, bidang usaha, lokasi)?
2. Masalah utama apa yang mau diselesaikan? Bagaimana proses sekarang berjalan (manual, WA, Excel, sistem lama)?
3. Ada angka kondisi sekarang? (mis. jumlah transaksi/bulan, waktu proses, keluhan) → Default: tidak ada; metrik ditetapkan sebagai baseline setelah rilis.
4. Apa yang dianggap "berhasil" 3–6 bulan setelah rilis? → bantu ubah jadi metrik + target.
5. Batasan: deadline, anggaran kasar, platform (web, mobile web, aplikasi), bahasa.
6. Ada sistem/aplikasi lain yang harus tetap dipakai atau digantikan?
7. Ada referensi/kompetitor yang disukai atau dihindari?

## Ronde 2 — Pengguna & role

1. Siapa saja yang memakai sistem? (publik, customer terdaftar, admin, staf, manajer, mitra) → bedakan persona (siapa orangnya) dan role (hak akses).
2. Untuk tiap role: apa yang boleh dilihat/diubah? Milik sendiri atau semua data?
3. Cara masuk: tanpa akun, daftar sendiri, dibuatkan admin? Login pakai apa (email, nomor HP, Google)? → Default: email/HP + password; akun staf dibuat admin.
4. Ada tamu (guest) yang boleh bertransaksi tanpa akun?
5. Perangkat utama tiap persona (HP/desktop) dan kemampuan digitalnya.

## Ronde 3 — Fitur & ruang lingkup

1. Daftar semua fitur yang terpikir (brain dump), lalu kelompokkan ke modul dengan kode 2–8 huruf.
2. Prioritaskan: MVP / Fase 2 / Nanti. → Default: MVP hanya yang dibutuhkan alur utama berjalan end-to-end.
3. Apa yang eksplisit TIDAK dikerjakan di rilis pertama?
4. Konten: siapa yang menyiapkan teks, foto, data produk/layanan? Kapan siap?
5. Ada laporan/dashboard yang dibutuhkan? Angka apa yang dilihat, oleh siapa, seberapa sering?
6. Notifikasi: ke siapa, lewat apa (email, WhatsApp, in-app), kapan?

## Ronde 4 — Alur & aturan bisnis

1. Jalankan alur utama langkah demi langkah dari sudut pandang pengguna (mis. cari → pilih → bayar → konfirmasi).
2. Status apa saja yang dilalui entitas utama (mis. booking: menunggu → dikonfirmasi → selesai / batal)? Siapa yang mengubah status?
3. Aturan "tidak boleh": ganda, melebihi kuota, di luar jam operasional, batas waktu pembatalan.
4. Pembayaran: online/offline, metode, refund, invoice. → Default MVP: konfirmasi manual oleh admin, payment gateway di Fase 2.
5. Data apa yang dicatat dan berapa lama disimpan? Ada data yang harus bisa diekspor?
6. Edge case yang pernah jadi masalah di proses sekarang.

## Ronde 5 — Non-functional

1. Bahasa UI (satu atau multi-bahasa), format tanggal, mata uang, zona waktu. → Default: Bahasa Indonesia, `id-ID`, Rupiah, `Asia/Jakarta`.
2. Data pribadi apa yang disimpan? Ada data kesehatan, keuangan, atau anak? → menentukan kewajiban UU PDP (consent, hak hapus data) dan **level OWASP ASVS** target. → Default: L1 tanpa data pribadi; **L2** jika ada data pribadi/kesehatan/keuangan; L3 hanya jika diminta regulasi/klien.
2a. Ada fitur AI (chatbot, ringkasan, analisis foto/dokumen dengan model)? Data apa yang dikirim ke penyedia AI, dan apakah AI boleh memicu aksi (mengirim pesan, mengubah data)? → menentukan NFR untuk LLM Top 10:2026.
2b. Siapa yang **tidak boleh** melihat atau mengubah apa? (mis. customer lain, staf di cabang lain, role tertentu) → bahan AC penyalahgunaan.
3. Performa: perkiraan jumlah pengguna/transaksi; halaman yang harus cepat. → Default: target Core Web Vitals "Good" di halaman publik.
4. SEO penting? Halaman mana yang harus muncul di Google?
5. Aksesibilitas. → Default: WCAG 2.1 AA untuk halaman publik.
6. Ketersediaan & dukungan: jam layanan, toleransi downtime, backup. → Default: tanpa SLA formal di MVP; backup database harian.
7. Siapa yang mengelola hosting, domain, dan akun pihak ketiga setelah serah terima?

## Ronde 6 — Integrasi, data awal & rilis

1. Layanan pihak ketiga yang wajib (payment, WhatsApp, email, maps, storage, AI, analytics). Siapa pemilik akunnya? Ada biaya/kuota per pemakaian?
2. Data awal: migrasi dari sistem lama/Excel? Siapa yang menyiapkan, formatnya apa?
3. Milestone dan cara review (demo per milestone, UAT oleh siapa, berapa lama).
4. Kriteria go-live: apa yang harus sudah benar sebelum dipakai publik/data nyata?
5. Pelatihan dan dokumentasi untuk pengguna internal.

## Jika bahannya sudah ada (mode "susun dari bahan")

Ekstrak dulu jawaban dari bahan (brief, transkrip meeting, PRD format lain), tampilkan sebagai tabel `Pertanyaan → Jawaban dari bahan → Sumber`, lalu tanyakan hanya yang kosong atau bertentangan.
