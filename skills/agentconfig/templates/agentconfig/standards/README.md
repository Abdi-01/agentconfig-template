# Standards

Aturan reusable yang berlaku untuk project apa pun yang memakai template ini, tanpa menyebut produk, entitas bisnis, atau path project tertentu. Baca file ini untuk menentukan sub-file mana yang relevan sebelum menulis, mengubah, atau me-review kode.

## Aturan bersama

- **Prioritas sumber aturan:** config tool (tsconfig, lint, formatter) > `../project/` > `standards/`. Jika `project/` sengaja menyimpang dari `standards/`, penyimpangan itu WAJIB dicatat di `project/decisions.md`.
- **Tingkat kewajiban:** **WAJIB** = harus dipatuhi; **SEBAIKNYA** = default, boleh dilanggar dengan alasan tertulis (komentar kode atau `project/decisions.md`); **JANGAN** = dilarang.
- **Cakupan tipe project:** aturan tanpa keterangan berlaku untuk semua tipe project. Bagian yang diberi judul **Frontend** atau **Backend** hanya berlaku untuk tipe itu; project fullstack memakai keduanya.
- **Label status** mengikuti legenda di `../README.md`. Aturan berlabel `[TIDAK ADA — rekomendasi]` belum diterapkan di project asal; terapkan begitu project punya infrastrukturnya.
- Aturan yang sudah ditegakkan tool tidak ditulis ulang dalam prosa; cukup rujuk config dan command-nya.
- Bahasa dokumen: Bahasa Indonesia; istilah teknis tetap Bahasa Inggris.
- `standards/` WAJIB identik di semua repo yang memakai versi template yang sama. Perubahan dilakukan di satu repo, disalin ke repo lain, lalu versi di `../README.md` dinaikkan.

## ID aturan

ID merujuk ke katalog kandidat di laporan audit project asal dan dipakai untuk membandingkan audit antar-project. Prefix menandai **project audit asal**; kategori universal/stack mengikuti prefix. ID JANGAN diubah atau dipakai ulang, meskipun aturannya dipindah ke file lain. "Project asal" di label status (mis. `[TIDAK ADA — rekomendasi]` "di project asal") berarti project audit pemilik prefix, bukan repo ini; status di repo ini dicatat di `project/technical-requirements.md`.

| Prefix | Project audit asal | Kategori |
|---|---|---|
| `U-` | audit frontend #1 (2 app Next.js), 2026-10-13 | universal |
| `S-` | idem | spesifik stack |
| `BU-` | audit backend #1 (Express + Prisma), 2026-10-13 | universal |
| `BS-` | idem | spesifik stack |
| `TU-` | keputusan pemilik template (bukan dari audit), 2026-10-15 | universal |

Indeks ID → file ada di `skills/agentconfig/registry/rules.md` repo template (`agentconfig-template`). Laporan audit lengkap tidak disalin ke template karena berisi detail klien; laporan tetap di `_audit/` repo project asal.

Audit project baru mendaftarkan prefix baru di tabel ini dan di registry template (mis. `CU-`/`CS-`). Aturan yang sama dengan aturan yang sudah ada memakai ID lama dan menambah bukti, bukan ID baru.

## Peta file

| Baca | Saat |
|---|---|
| `coding-style.md` | sebelum menulis, mengubah, atau me-review kode apa pun |
| `security.md` | sebelum menyentuh auth/otorisasi, input user, data pribadi, secret/env, upload, konten remote, integrasi pihak ketiga, atau dependency |
| `api-design.md` | sebelum membuat/mengubah endpoint, bentuk request/response, status code, atau pagination (backend/fullstack) |
| `git-workflow.md` | sebelum membuat branch, commit, PR, atau perubahan yang menyentuh lebih dari satu repo |
| `definition-of-done.md` | sebelum menyatakan tugas selesai |
| `testing/README.md` | sebelum menulis, mengubah, atau menjalankan test |
| `stack/README.md` | sebelum memakai framework/library dari stack project (routing, data, UI, ORM, tooling, deploy) |
