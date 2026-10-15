# PRD → agentconfig/project/

Panduan memeriksa kualitas PRD, menurunkan isinya ke `project/`, dan daftar keputusan teknis yang harus ditanyakan ke user. Dibaca di Langkah 2 dan 4 SKILL.md.

## Cek kualitas PRD

PRD format skill `prd-writer` (`docs/prd/prd.md`): pakai `../prd-writer/scripts/check-prd.mjs` — hasilnya sudah mencakup checklist di bawah. PRD lain: periksa manual dan laporkan per butir (ada / sebagian / tidak ada):

| # | Butir | Kenapa penting untuk agent | Berat? |
|---|---|---|---|
| 1 | Role & hak akses jelas | Dasar otorisasi dan matriks akses | ya |
| 2 | Fitur punya prioritas (MVP vs nanti) | Agent tahu apa yang dikerjakan dulu | ya |
| 3 | Fitur MVP punya acceptance criteria yang bisa diuji | Definisi "selesai" untuk agent dan test | ya |
| 4 | Metrik keberhasilan dengan target | Data apa yang harus dicatat sejak awal | sedang |
| 5 | NFR terukur (performa, aksesibilitas, privasi) | Budget performa, baseline security | sedang |
| 6 | Di luar cakupan disebut | Mencegah agent membangun hal yang tidak diminta | sedang |
| 7 | Alur utama end-to-end | Kandidat e2e test | sedang |
| 8 | Data sensitif diidentifikasi | Level ASVS, regulasi (UU PDP), logging | ya jika ada data pribadi |
| 9 | ID requirement stabil | Rujukan di test, commit, dan `project/prd.md` | ringan — bisa dibuat saat setup |

Butir "ya" yang tidak ada → tawarkan melengkapi lewat `prd-writer` (mode susun dari bahan) sebelum lanjut. PRD eksternal tanpa ID: buat ID `FR-<MODUL>-<NNN>` saat setup dan catat pemetaannya di `project/prd.md` › Sumber.

## Pemetaan PRD format `prd-writer`

| Bagian PRD | Masuk ke |
|---|---|
| §1–2 Ringkasan, latar belakang | `prd.md` › Ringkasan produk |
| §3 Tujuan & metrik | `prd.md` › Metrik keberhasilan (+ kolom "yang perlu disiapkan di kode") |
| §4 Persona, §8 Role | `prd.md` › Pengguna & role; `api-contract.md` › Matriks akses (backend) |
| §5 Ruang lingkup | `prd.md` › Fitur (prioritas) dan Di luar cakupan |
| §6 Alur pengguna | `prd.md` › Alur kritis |
| §7 Timeline | `technical-requirements.md` › Syarat go-live |
| §9 FR + AC | `prd.md` › Fitur — ID, prioritas, status; AC cukup dirujuk ("PRD §9") |
| §10 NFR | `technical-requirements.md` › NFR, Baseline security, Locale |
| §11 Data & entitas | `data-model.md` (backend); data sensitif → Baseline security |
| §12 Integrasi | `architecture.md` › Integrasi; env di `technical-requirements.md` |
| §13 Asumsi/risiko | `decisions.md` jika menyangkut teknis; sisanya cukup dirujuk |
| §14 Pertanyaan terbuka | `prd.md` › Pertanyaan terbuka (rujuk nomornya) |

## Pemetaan PRD format lain

| Bagian PRD (nama bisa beda) | Masuk ke | Catatan |
|---|---|---|
| Latar belakang, tujuan, value proposition | `prd.md` › Ringkasan produk | 2–4 kalimat, jangan salin paragraf |
| Persona, user, role | `prd.md` › Pengguna & role; `api-contract.md` › Matriks akses (backend) | Role = hak akses nyata, bukan persona marketing |
| Functional requirement / user story / fitur | `prd.md` › Fitur | Pakai ID PRD; prioritas MVP/berikutnya/nanti |
| Out of scope, fase berikutnya | `prd.md` › Di luar cakupan | |
| User flow / journey | `prd.md` › Alur kritis | Pilih 3–7 yang menyangkut uang, data pribadi, akses, atau inti produk |
| NFR performa, uptime, SEO, aksesibilitas | `technical-requirements.md` › NFR | Ubah ke target terukur |
| Security, privasi, regulasi | `technical-requirements.md` › Baseline security | Level ASVS + regulasi |
| Bahasa, wilayah, mata uang | `technical-requirements.md` › Locale & format | Timezone produk wajib eksplisit |
| Brand, warna, font, moodboard, Figma | `design-system.md` › Brand | Frontend/fullstack |
| Daftar layar, wireframe, desain Stitch (`docs/design/`) | `design-system.md` › Sumber desain, token, pemetaan kelas export | Label `[DESAIN]`; desain belum ada → skill `stitch-design` |
| Integrasi (payment, email, WA, maps, AI, analytics) | `architecture.md` › Integrasi; env di `technical-requirements.md` | |
| Entitas data, laporan, dashboard | `data-model.md` › Kelompok model (backend); `prd.md` › Fitur | Entitas dari kata benda di FR |
| Aturan bisnis (kuota, jadwal, status, harga) | `data-model.md` › Invariant (backend); `prd.md` | Setiap invariant butuh cara penegakan di DB |
| Timeline, milestone, go-live | `technical-requirements.md` › Syarat go-live | |

PRD sering mencampur keinginan desain dengan requirement. Yang tidak bisa diuji (mis. "modern dan elegan") masuk `design-system.md` sebagai arahan, bukan ke tabel fitur.

## Checklist gap (tanyakan yang tidak dijawab PRD)

Tanyakan hanya yang relevan dengan tipe project, bernomor, masing-masing dengan **rekomendasi default** dan alasan satu kalimat. Jawaban dicatat sebagai `D-xx` di `decisions.md`.

### Semua tipe

1. **Topologi & kontrak:** repo tunggal atau ada repo sibling? Siapa pemilik kontrak API dan di file apa? (Default: backend memegang `docs/api-spec.md`.)
2. **Hosting & lingkungan:** platform deploy; apakah ada staging; apakah dev dan production memakai database/layanan terpisah? (Default: terpisah — dev tidak pernah menyentuh data nyata.)
3. **Auth:** metode login (email/HP + password, OAuth, magic link), penyimpanan sesi (cookie `httpOnly` vs token di storage), masa berlaku, reset password. (Default: cookie `httpOnly`, lihat `standards/security.md`.)
4. **Role & akses:** daftar role dan siapa boleh apa — minimal per domain.
5. **Data pribadi & regulasi:** data apa yang disimpan (identitas, kesehatan, keuangan, anak)? Regulasi (UU PDP)? Level ASVS target? (Default: L2 jika ada data pribadi.)
6. **Locale:** bahasa UI dan pesan error, apakah multi-bahasa, locale format, mata uang, **timezone produk**, bahasa komentar kode dan commit.
7. **Waktu:** ada jadwal/slot/jam operasional? Jika ya, tegaskan beda *instant* vs *wall-clock* (lihat `standards/coding-style.md` U-03).
8. **Integrasi pihak ketiga:** layanan apa saja, siapa pemegang akun/kunci, ada kuota/biaya per panggilan?
9. **Testing:** tool sesuai `standards/testing/README.md` diterima? Alur kritis mana yang wajib e2e sebelum go-live?
10. **Tooling:** lint/format dipasang sekarang atau TODO? CI (GitHub Actions) sekarang atau nanti?
11. **Node & package manager:** versi Node (Default: LTS aktif, `engines` + `.nvmrc`), npm/pnpm.

### Frontend / fullstack

12. **Rendering:** halaman mana butuh SEO (render di server) vs interaktif di belakang login (client + query library)? (Lihat file stack Next.js.)
13. **UI kit & brand:** preset shadcn/base color, font, palet; ada Figma? Dark mode?
14. **Form:** form kompleks/multi-step? Template melarang RHF/zod kecuali dicatat di `decisions.md` — konfirmasi atau catat pengecualian.
15. **State & data:** sumber data (API sendiri, BaaS, CMS)? Ada state global selain sesi/keranjang?
16. **Gambar & media:** sumber (lokal, CDN, upload user); host remote yang diizinkan.
17. **Analytics & tracking:** tool, event penting, consent.

### Backend / fullstack

18. **Database & ORM:** engine, ORM, penyedia (managed/self-hosted), strategi migration per lingkungan.
19. **Bentuk API:** REST dengan envelope standar (`standards/api-design.md`)? Format error + `errorCode` untuk i18n di frontend?
20. **Invariant bisnis:** aturan "tidak boleh ganda"/kuota/transisi status — bagaimana ditegakkan (constraint/lock)?
21. **File upload:** jenis, ukuran maksimum, penyimpanan (publik/privat), URL bertanda tangan?
22. **Job & notifikasi:** email/WA/reminder terjadwal? Mekanisme cron?
23. **Logging & monitoring:** logger, error reporting, retensi log; data apa yang dilarang masuk log.
24. **Seed:** data contoh untuk dev; larangan seed ke production; akun bawaan.

## Kualitas isi

- Satu fakta di satu tempat. Jika sudah ada di PRD resmi atau spec kanonik, rujuk path/ID-nya.
- Target harus terukur (angka + metode ukur). "Cepat" bukan target; "LCP ≤ 2,5 s p75 mobile di halaman X" adalah target.
- Pertanyaan yang belum dijawab tetap di dokumen sebagai `TODO — <pertanyaan> (pemilik: user/klien)`, bukan dihapus.
