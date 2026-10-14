# PRD → agentconfig/project/

Panduan menurunkan isi `project/` dari PRD dan daftar keputusan teknis yang harus ditanyakan ke user. Dibaca di Langkah 2 dan 4 SKILL.md.

## Pemetaan isi PRD

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
