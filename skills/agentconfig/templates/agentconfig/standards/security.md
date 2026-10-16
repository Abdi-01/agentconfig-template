# Security — Menulis Kode yang Aman

Aturan menulis kode yang aman untuk aplikasi web dan API, berbasis standar OWASP terbaru. Baca sebelum menyentuh autentikasi/otorisasi, input user, data pribadi, secret/env, upload, konten remote, integrasi pihak ketiga, atau dependency; cara mengujinya ada di `testing/security.md`.

## Acuan OWASP (WAJIB versi terbaru)

| Standar | Versi baseline | Dipakai untuk |
|---|---|---|
| OWASP Top 10 | **2025** (rilis November 2025) | kategori risiko aplikasi web — semua project |
| OWASP API Security Top 10 | **2023** (edisi terbaru per 2026-10-14) | risiko API — backend/fullstack |
| OWASP ASVS | **5.0.0** (2025) | daftar kontrol yang diverifikasi; level target per project di `project/technical-requirements.md` |
| OWASP WSTG | **4.2** (stabil; 5.0 masih dikembangkan) | prosedur pengujian — lihat `testing/security.md` |
| OWASP Cheat Sheet Series | terbaru | detail implementasi per topik |
| OWASP Top 10 for LLM Applications | **2026** (dipublikasikan Agustus 2026) | **hanya jika** project memakai LLM/GenAI (chat, ringkasan, klasifikasi, RAG, analisis gambar dengan model) — bagian "Fitur AI/LLM" |
| OWASP Top 10 for Agentic Applications | **Desember 2025** | **hanya jika** LLM boleh memanggil tool/aksi (agent, function calling) |

- Sebelum audit security, rilis besar, atau penambahan fitur yang menyentuh auth/data pribadi: cek owasp.org apakah ada edisi baru. Jika ada, perbarui tabel ini dan pemetaan di `testing/security.md`, lalu naikkan versi template.
- Setiap temuan security dicatat dengan rujukan kategori, mis. `A01:2025`, `API3:2023`, atau nomor requirement ASVS.

Penerapan di luar fase coding (dirujuk `LIFECYCLE.md`):
- **Requirement:** level ASVS target dipilih saat PRD (`project/technical-requirements.md` › Baseline security); FR yang menyentuh data milik user lain, uang, atau role punya acceptance criteria penyalahgunaan.
- **Desain (TU-07):** `project/threat-model.md` memetakan setiap alur kritis ke ancaman → kategori OWASP → kontrol → test, sebelum alur itu dibangun. Profil S boleh ringkas (satu tabel); profil M/L wajib per alur kritis.
- **Rilis:** checklist keamanan go-live di `LIFECYCLE.md` fase 8.

Peta kategori ke bagian file ini:

| OWASP Top 10:2025 | API Security Top 10:2023 | Bagian |
|---|---|---|
| A01 Broken Access Control (termasuk SSRF) | API1 BOLA, API3 BOPLA, API5 BFLA, API7 SSRF | Otorisasi; Input & output; Konten remote |
| A02 Security Misconfiguration | API8 Security Misconfiguration | Header, transport & CORS; Secret |
| A03 Software Supply Chain Failures | API10 Unsafe Consumption of APIs | Dependency & integrasi |
| A04 Cryptographic Failures | — | Autentikasi & sesi; Data pribadi |
| A05 Injection | — | Input & output |
| A06 Insecure Design | API6 Unrestricted Access to Sensitive Business Flows | Logika bisnis |
| A07 Authentication Failures | API2 Broken Authentication | Autentikasi & sesi |
| A08 Software or Data Integrity Failures | — | Dependency & integrasi; Logika bisnis |
| A09 Security Logging & Alerting Failures | — | Logging |
| A10 Mishandling of Exceptional Conditions | — | Error & kondisi tak terduga |
| — | API4 Unrestricted Resource Consumption | Konsumsi resource |
| — | API9 Improper Inventory Management | Kontrak & inventaris endpoint |

## Secret & environment (U-07, BU-13)

- Secret (API key server, service-role key, JWT/session secret, kredensial DB/SMTP) hanya dibaca oleh kode yang berjalan di server. Variabel yang terekspos ke browser hanya yang memakai prefix publik framework, dan prefix itu JANGAN dipakai untuk secret.
- Modul yang membaca secret di project frontend WAJIB ditandai server-only (cara per stack ada di `stack/`). Konstanta yang juga dibutuhkan client dipisah ke modul tanpa secret.
- File contoh env WAJIB memuat semua variabel yang dibaca kode (tanpa nilai, dengan komentar singkat) dan tidak memuat variabel yang tidak dibaca. Variabel baru = update file ini di commit yang sama.
- Backend SEBAIKNYA memvalidasi env wajib saat startup (fail fast dengan pesan yang menyebut nama variabelnya), bukan meng-cast `as string` lalu gagal saat request. `[TIDAK ADA — rekomendasi]`
- File `.env*` berisi nilai JANGAN di-commit. JANGAN menyalin nilai secret ke dokumen, komentar, log, atau pesan commit.

## Autentikasi & sesi (A07, API2)

- Password di-hash dengan algoritma adaptif (bcrypt/argon2) dan cost yang tercatat; kebijakan password berada di satu helper yang dipakai semua endpoint pembuat/pengganti password.
- Login, registrasi, reset password, dan endpoint lain yang menerima kredensial SEBAIKNYA punya rate limit/lockout. `[TIDAK ADA — rekomendasi]`
- Pesan gagal login tidak membedakan "akun tidak ada" dan "password salah".
- Token: masa berlaku ditentukan eksplisit; status akun (aktif, wajib ganti password) diperiksa dari sumber data saat request, bukan hanya saat login; ada cara mencabut akses akun yang dinonaktifkan sebelum token kedaluwarsa.
- Frontend: token sesi SEBAIKNYA di cookie `httpOnly` + `Secure` + `SameSite`. Jika memakai `localStorage`, catat sebagai risiko yang diterima di `project/decisions.md` dan patuhi ketat aturan XSS. Penanganan 401 dilakukan terpusat.
- Cookie sesi buatan sendiri: ditandatangani HMAC, dibandingkan dengan `timingSafeEqual`, masa berlaku di payload, `httpOnly`, `secure` di production, minimal `sameSite: "lax"`.
- Akses administratif SEBAIKNYA memakai MFA jika diminta requirement produk. `[TIDAK ADA — rekomendasi]`

## Otorisasi (U-06, BU-01, BU-02 — A01, API1, API5)

- Guard di client (redirect, menyembunyikan menu) hanya untuk UX. Enforcement WAJIB ada di server untuk setiap endpoint dan aksi; server action/route handler memverifikasi ulang sesi di dalam fungsinya sendiri.
- **Identitas dari kredensial (BU-01).** Siapa pemanggilnya selalu diambil dari token/sesi yang terverifikasi. Id user/pemilik dari body atau query hanya diterima dari role yang memang boleh bertindak atas nama orang lain, dan tetap divalidasi.
- **Level fungsi (API5).** Setiap endpoint menyatakan role yang boleh memanggilnya secara eksplisit. Satu matriks role × endpoint menjadi sumber kebenaran (di `project/api-contract.md`) dan diselaraskan dengan menu/guard frontend.
- **Level objek (BU-02, API1).** Setiap baca/tulis resource milik user memeriksa kepemilikan atau scope di lapisan bisnis (bukan hanya role). Endpoint list di-scope sesuai role (mis. staf hanya melihat data yang ditanganinya).
- Permission granular yang bisa diatur admin WAJIB ditegakkan di server; jika belum, UI pengaturannya diberi keterangan bahwa permission belum berlaku.

## Input & output (A05, API3)

- Validasi di client hanya untuk UX; server tetap sumber kebenaran. Setiap field body/param/query divalidasi tipe, format, dan rentangnya di edge.
- **Anti mass-assignment (BU-19).** Hanya field yang tervalidasi yang diteruskan ke lapisan bisnis dan database; JANGAN meneruskan objek body mentah ke ORM.
- **Allowlist output (BU-03).** Response hanya memuat field yang dibutuhkan konsumen; field rahasia (hash password, token, secret, id internal penyedia) JANGAN pernah ikut, termasuk lewat relasi. Gunakan pemilihan field eksplisit, bukan menghapus field setelahnya.
- Query database hanya lewat query builder/ORM atau parameter; JANGAN menyusun SQL dari string input.
- Teks bebas yang disimpan lalu ditampilkan pihak lain disanitasi di server; frontend JANGAN merender HTML mentah (`dangerouslySetInnerHTML`, `innerHTML`) tanpa sanitasi dan keputusan tercatat. Template email/HTML di server meng-escape nilai dinamis.
- Nilai dari URL, query string, dan storage diperlakukan sebagai input tidak tepercaya, mis. parameter `redirect` hanya menerima path internal.

## Logika bisnis (BU-06, A06, API6)

- Harga, total, diskon, pajak, dan ongkir dihitung di server dari data tepercaya; nilai uang dari client hanya boleh berupa pilihan (mis. metode pengiriman), bukan angka final.
- Alur sensitif (checkout, booking, upload berbiaya, klaim akun) dibatasi kuota/rate dan diproteksi dari pengulangan (constraint atau update bersyarat).

## Konsumsi resource (API4)

- Setiap list dibatasi dan dipaginasi (`api-design.md`); ukuran body dan upload dibatasi; panggilan ke layanan eksternal punya timeout.

## Konten remote, upload & SSRF (A01, API7)

- Server JANGAN mengambil URL bebas dari input user. Optimizer/proxy gambar memakai allowlist host spesifik; JANGAN wildcard.
- Upload divalidasi tipe dan ukuran di server; file sensitif (data biometrik/medis) disimpan privat dan dibuka lewat URL bertanda tangan yang kedaluwarsa.
- Fitur yang memproses foto/data biometrik WAJIB meminta consent eksplisit; versi consent dinaikkan setiap teks consent berubah.

## Header, transport & CORS (A02, API8)

- Semua traffic memakai HTTPS. Security header (CSP untuk halaman, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`) dikonfigurasi di framework atau middleware.
- API SEBAIKNYA membatasi CORS ke origin frontend yang dikenal (dari env). `[TIDAK ADA — rekomendasi]`
- Konfigurasi default framework yang membuka akses (CORS `*`, debug mode, stack trace di response) diperiksa sebelum rilis.

## Error & kondisi tak terduga (A10)

- Exception yang tidak dikenali menghasilkan response generik (500) tanpa detail internal, dan di-log lengkap di server.
- Kegagalan pemeriksaan keamanan (verifikasi token, cek kepemilikan, layanan otorisasi down) WAJIB gagal tertutup (menolak), bukan meloloskan.

## Logging (A09, BU-12)

- Event keamanan (login gagal, akses ditolak, perubahan role/permission, reset password) di-log dengan id pelaku, tanpa data pribadi atau kredensial. Alerting `[TIDAK ADA — rekomendasi]`.

## Dependency & integrasi (A03, A08, API10)

- Jalankan `npm audit --omit=dev` sebelum rilis dan setiap menambah dependency. Advisory **critical/high** pada dependency produksi WAJIB ditindaklanjuti: upgrade, atau catat mitigasinya di `project/technical-requirements.md`.
- Tool/CLI JANGAN berada di `dependencies` produksi; lockfile di-commit.
- Response dari API pihak ketiga divalidasi bentuknya seperti input user (BU-09); JANGAN meneruskan pesan error mentah pihak ketiga ke user tanpa pemetaan.

## Kontrak & inventaris endpoint (API9)

- Semua endpoint yang aktif tercatat di kontrak kanonik beserta guard-nya; endpoint lama yang tidak dipakai dihapus, bukan dibiarkan.

## Fitur AI/LLM (TU-08, jika ada — LLM Top 10:2026)

Berlaku jika project mengirim data ke model bahasa/visi atau menampilkan keluarannya. Layanan AI pihak ketiga juga tunduk pada bagian Dependency & integrasi.

| Risiko | Aturan |
|---|---|
| LLM01 Prompt Injection | Input user dan konten eksternal (dokumen, halaman web, hasil retrieval) diperlakukan sebagai data, bukan instruksi: dipisah dari system prompt dengan pembatas yang jelas. Keputusan otorisasi dan aturan bisnis JANGAN diserahkan ke model. |
| LLM02 Sensitive Information Disclosure / LLM08 Hidden Context Exposure | Kirim ke model hanya field yang dibutuhkan (minimisasi); JANGAN menaruh secret, kredensial, atau data user lain di prompt/system prompt. Anggap isi system prompt bisa bocor. |
| LLM03 Excessive Agency | Model hanya boleh memanggil tool yang diperlukan, dengan izin pemanggil (bukan izin service), dan aksi yang mengubah data atau berbiaya butuh konfirmasi user atau validasi server. Rujuk Top 10 for Agentic Applications bila memakai agent. |
| LLM04 Supply Chain / LLM05 Data and Model Poisoning | Model, SDK, dan dataset dari sumber resmi dengan versi tercatat; data untuk fine-tuning/RAG berasal dari sumber tepercaya dan bisa ditelusuri. |
| LLM06 Unbounded Consumption | Batas panjang input/output, timeout, kuota per user per hari, dan batas biaya bulanan di sisi server. |
| LLM07 Misinformation | Keluaran yang memengaruhi keputusan (kesehatan, keuangan, hukum) ditandai sebagai hasil AI, disertai disclaimer, dan tidak menggantikan keputusan profesional; tampilkan sumber bila memakai RAG. |
| LLM09 Vector and Embedding Weaknesses | Index vektor dipisah/difilter per tenant atau per izin akses; retrieval menegakkan izin yang sama dengan data aslinya. |
| LLM10 Improper Output Handling | Keluaran model divalidasi seperti input user sebelum dipakai: skema JSON dicek, teks di-escape sebelum dirender, JANGAN dieksekusi sebagai kode/SQL/perintah, URL di-allowlist. |

## Data pribadi & lingkungan (BU-10)

- Data pribadi, medis, dan finansial mengikuti regulasi yang ditetapkan di `project/technical-requirements.md`. JANGAN menaruh data pribadi di log, URL, atau event analytics.
- Database produksi JANGAN dipakai bersama untuk development, test, atau load test. Seed dengan password bawaan, reset/migrasi destruktif, dan load test hanya dijalankan ke database non-produksi, dan agent tidak menjalankannya tanpa konfirmasi eksplisit.
