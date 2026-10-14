# Security Test

Standar menguji keamanan yang WAJIB mengacu ke standar OWASP edisi terbaru. Baca saat mengubah auth/otorisasi, sesi, endpoint yang menerima input, rendering konten dari user, data pribadi, integrasi pihak ketiga, atau dependency; aturan menulis kodenya ada di `../security.md`.

> Status di project asal: test otorisasi dasar (401/403, kepemilikan) ada di suite integration backend; sisanya `[TIDAK ADA — rekomendasi]`. Aturan umum ada di `README.md`.

## Acuan

- Kategori risiko: **OWASP Top 10:2025** dan **OWASP API Security Top 10:2023**; daftar kontrol: **OWASP ASVS 5.0.0** pada level target di `project/technical-requirements.md`; prosedur: **OWASP WSTG 4.2** (ID `WSTG-<KAT>-<NN>`). Versi baseline dan aturan pembaruannya ada di `../security.md` bagian "Acuan OWASP".
- Sebelum membuat atau mengubah rencana test security, cek edisi terbaru di owasp.org; jika berubah, perbarui tabel di bawah (dan naikkan versi template).
- Setiap test security diberi nama yang menyebut kategorinya, mis. `it("A01/API1: rejects access to another customer's order")`, agar cakupan per kategori bisa dihitung.

## Matriks minimum per kategori

| Kategori | Yang diuji | Jenis | Rujukan WSTG |
|---|---|---|---|
| A01 / API1 BOLA | Akses resource milik user lain (ganti id di path/query/body) → 403/404; list di-scope ke pemilik/role | integration (backend) | WSTG-ATHZ-04 |
| A01 / API5 BFLA | Matriks role × endpoint: setiap endpoint dipanggil dengan setiap role + tanpa token; hanya kombinasi yang tercatat di kontrak yang lolos | integration (backend), e2e (frontend: route terlarang dialihkan) | WSTG-ATHZ-02 |
| A01 / API3 BOPLA | Response tidak memuat field rahasia (hash password, token, id internal penyedia) termasuk di relasi; field yang tidak boleh diubah role itu (mis. pemilik, status final) ditolak/diabaikan (mass assignment) | integration (backend), unit (adapter frontend) | WSTG-INPV-20 (edisi `latest`, belum ada di 4.2) |
| A01 / API7 SSRF | Input URL tidak diambil server; host optimizer gambar di-allowlist | integration | WSTG-INPV-19 |
| A02 / API8 Misconfiguration | Security header ada; CORS hanya origin yang dikenal; tidak ada stack trace/pesan internal di response error | integration, e2e | WSTG-CONF-* |
| A03 Supply chain | `npm audit --omit=dev --audit-level=high` lulus; lockfile ter-commit | CI | — |
| A04 Cryptographic | Password tersimpan sebagai hash adaptif; secret tidak ada di bundle client/log/repo | unit, CI (gitleaks) | WSTG-CRYP-* |
| A05 Injection | Input berisi SQL/NoSQL meta-karakter, `<script>`, `<img onerror>` disimpan/dirender sebagai teks; template email meng-escape nilai | integration | WSTG-INPV-05, WSTG-INPV-02 |
| A06 / API6 Business flow | Nilai uang dari client diabaikan/ditolak; kuota dan cutoff tidak bisa dilewati (termasuk request bersamaan); klaim akun butuh bukti kepemilikan | integration | WSTG-BUSL-* |
| A07 / API2 Authentication | Login salah tidak membocorkan keberadaan akun; token invalid/kedaluwarsa → 401; akun nonaktif atau wajib ganti password ditolak; rate limit login | integration | WSTG-ATHN-* |
| A08 Integrity | Webhook/callback pihak ketiga diverifikasi tanda tangannya (jika ada); data dari API eksternal divalidasi bentuknya | integration | — |
| A09 Logging | Event keamanan (login gagal, akses ditolak, perubahan role) ter-log tanpa data pribadi/kredensial | integration (spy logger) | — |
| A10 Exceptional conditions | Error tak terduga (DB/upstream mati) → 500/502/503 generik; pemeriksaan keamanan gagal tertutup | integration | WSTG-ERRH-* |
| API4 Resource consumption | List terbatas dan terpaginasi; upload/body di atas batas → 413/422; endpoint mahal dibatasi kuota → 429 | integration | — |
| API9 Inventory | Daftar route aktif sama dengan kontrak kanonik (script pembanding) | CI/manual | — |
| API10 Unsafe consumption | Response pihak ketiga yang aneh (field hilang, tipe salah, timeout) tidak membuat crash atau data rusak | integration | — |
| Frontend: sesi | Token kedaluwarsa → dibersihkan dan diarahkan ke login, bukan error "tidak ditemukan"; parameter `redirect` eksternal ditolak | integration, unit | WSTG-SESS-* |

## Aturan

- Kegagalan test security memblokir merge.
- Temuan yang belum bisa diperbaiki dicatat sebagai risiko di `project/technical-requirements.md` beserta kategori OWASP, prioritas, dan mitigasinya.
- Penetration test/audit eksternal mengikuti jadwal di `project/technical-requirements.md` (requirement produk). `[TIDAK ADA — rekomendasi]`
- JANGAN menjalankan scanner aktif, fuzzing, atau brute force ke lingkungan produksi.
