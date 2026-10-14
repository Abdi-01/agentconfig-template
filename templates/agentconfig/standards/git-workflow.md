# Git Workflow

Aturan branching, commit, Pull Request, dan perubahan lintas repo. Baca sebelum membuat branch, commit, atau PR, dan saat satu fitur menyentuh lebih dari satu repo.

## Branch

- `main` = kode yang dideploy. JANGAN commit atau push langsung ke `main`.
- Kerja dilakukan di branch terpisah lalu digabung lewat Pull Request dengan merge commit (U-09). `[TERBUKTI di project asal]`
- Nama branch: `<type>/<deskripsi-kebab>` (mis. `feat/order-history`, `fix/date-timezone`), dengan `type` dari daftar tipe commit di bawah. `[DISIMPULKAN — project asal juga memakai branch integrasi jangka panjang tanpa prefix]`
- Perubahan lintas repo untuk satu fitur memakai **nama branch yang sama** di semua repo yang terlibat.
- Agent hanya membuat commit dan push jika diminta. Agent JANGAN merge ke `main`, men-deploy, atau menjalankan perintah yang mengubah database bersama/produksi (migrate, reset, seed) kecuali diminta eksplisit; deploy dan konfigurasi env di platform hosting dilakukan manusia.

## Commit (U-08)

- Format Conventional Commits: `<type>(<scope>): <subject>` (scope opsional).
  - `type`: `feat`, `fix`, `refactor`, `perf`, `chore`, `docs`, `test`, `style`, `build`, `ci`. JANGAN membuat tipe baru (mis. `revamp`) atau prefix lain (mis. `Batch 5:`).
  - `scope`: nama domain/fitur dalam kebab-case.
  - `subject`: Bahasa Inggris, imperatif, diawali huruf kecil, tanpa titik di akhir, ≤72 karakter.
- Body (dipisah satu baris kosong) menjelaskan **kenapa** dan dampaknya, termasuk cara verifikasi (mis. "diverifikasi via Playwright", "diverifikasi dengan request staff dan customer"). Body boleh Bahasa Indonesia.
- Satu commit = satu perubahan logis. Refactor besar boleh dipecah menjadi "tambah helper" lalu "pakai helper" agar mudah di-review. Migration database berada di commit yang sama dengan perubahan schema dan kode yang memakainya.
- Commit yang dibuat dengan bantuan AI agent diberi trailer `Co-Authored-By:` sesuai agent.
- JANGAN meng-commit artefak build/cache/generate (mis. `.next/`, `dist/`, `*.tsbuildinfo`, client ORM yang di-generate) atau file env yang berisi nilai.

Contoh:

```
fix(schedule): parse event time as UTC

Waktu dari API sudah UTC, tapi diparse tanpa "Z" sehingga dianggap jam
lokal browser dan jadwal hari ini tampil sebagai "sudah lewat".
Diverifikasi manual di zona UTC+7.
```

## Pull Request

- Satu PR per fitur/perbaikan; judul mengikuti format commit.
- Deskripsi minimal: ringkasan, alasan, cara verifikasi, dampak ke repo lain/kontrak API, migration database (ada/tidak, aditif/destruktif), dan dokumen `project/` yang diperbarui. Template PR `[TIDAK ADA — rekomendasi]`.

## Perubahan lintas repo

- Topologi yang didukung template: 1 frontend; frontend + backend; 2 frontend + 1 backend; 2 frontend + 2 backend. Setiap repo menyimpan salinan `standards/` yang identik dan `project/` miliknya sendiri.
- Kontrak API kanonik berada di repo backend pemiliknya, atau di satu dokumen spec bersama jika backend belum ada. Frontend merujuk path dokumen kanonik itu dari `project/api-contract.md`; JANGAN menyalin isinya.
- Urutan kerja: ubah kontrak kanonik → implementasi backend → frontend. Urutan deploy: backend lebih dulu, lalu frontend.
- Konstanta yang harus bernilai sama di dua repo (mis. parameter request yang memengaruhi hasil, batas kuota, kebijakan password) WAJIB diberi komentar yang menyebut padanannya di repo lain, dan dicatat di `project/api-contract.md` masing-masing.
