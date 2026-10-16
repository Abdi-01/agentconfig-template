---
name: agentconfig
description: Pasang, perbarui, atau audit folder agentconfig/ (AGENTS.md router + standards/ reusable + project/ dari PRD) di repo JS/TS. Pakai saat user minta "buat/generate agentconfig", "setup guideline agent", "pasang standards", "sync standards ke versi baru", atau "audit project untuk agentconfig" — termasuk tepat setelah create-next-app atau init backend baru.
---

# agentconfig

Memasang aturan AI coding agent ke repo: `AGENTS.md` (router ≤100 baris), `CLAUDE.md` (`@AGENTS.md`), `agentconfig/standards/` (disalin **identik** dari template, tidak pernah ditulis ulang), dan `agentconfig/project/` (ditulis dari PRD + jawaban user, atau dari audit kode).

`$SKILL_DIR` = folder tempat file ini berada. Semua script: `node $SKILL_DIR/scripts/<nama>.mjs --target <root repo>`. Script tidak butuh dependency.

## Prinsip

- **standards/ tidak dikarang.** Hanya disalin oleh `scaffold.mjs`. Jika aturan template terasa salah untuk repo ini, catat penyimpangannya di `project/decisions.md` dan usulkan perubahan template ke user — jangan edit `standards/`.
- **project/ tidak dikarang.** Setiap isi bersumber dari PRD, jawaban user, atau kode (dengan label status, legenda di `agentconfig/README.md`). Yang belum diketahui ditulis `TODO` + pertanyaannya, bukan ditebak.
- **Tiga titik berhenti wajib** (tandai ⛔ di bawah): jangan lanjut sebelum user menjawab.
- Bahasa dokumen: Bahasa Indonesia, istilah teknis Bahasa Inggris. Bahasa percakapan mengikuti user.

## Langkah 1 — Deteksi

Jalankan `detect.mjs`. Dari hasilnya tentukan mode:

| Kondisi | Mode |
|---|---|
| `existing.agentconfigVersion` ada | **sync** (Langkah S) |
| belum ada agentconfig, `sourceFiles` > 40 atau user menyebut project lama | **audit** (Langkah A), lalu init |
| selain itu | **init** (Langkah 2–6) |

⛔ **Konfirmasi ke user dalam satu pesan ringkas:**
- mode;
- tipe project (`typeGuess`; jika `typeAmbiguous`, tanyakan pertanyaannya);
- file stack yang cocok + `versionNotes` (versi mayor beda dari baseline → aturan stack perlu diverifikasi ulang);
- `uncatalogued` (dependency penting tanpa file stack — lihat `references/stack-catalog.md`);
- `existing`: blok framework di AGENTS.md (dipertahankan), AGENTS.md/CLAUDE.md lama (dicadangkan), file instruksi agent lain, file yang di-ignore git;
- topologi: repo tunggal, atau ada repo sibling (FE/BE lain)? Repo mana pemilik kontrak API?
- sumber PRD: `docs/prd/prd.md` (cek otomatis — hasil skill `prd-writer`), path file lain, teks tempelan, atau belum ada.

**Jika PRD belum ada:** sarankan menjalankan skill `prd-writer` dulu, lalu kembali ke skill ini. Hanya jika user menolak (mis. prototipe cepat), lanjut dengan pertanyaan minimum: ringkasan produk, pengguna/role, fitur MVP beserta 1–2 acceptance criteria per fitur, dan metrik keberhasilan — semuanya berlabel `[KEPUTUSAN]` di `project/prd.md`.

## Langkah 2 — Baca PRD, cek kualitas & gap check

Baca PRD sampai habis (PDF/DOCX: pakai skill pembaca file yang tersedia). Lalu ikuti `references/prd-to-docs.md`:
1. **Cek kualitas PRD.** PRD Markdown format `prd-writer`: jalankan `node $SKILL_DIR/../prd-writer/scripts/check-prd.mjs --file <path>`. PRD lain (PDF, DOCX, format bebas): periksa dengan checklist "Cek kualitas PRD" di reference.
2. Petakan isi PRD ke file `project/` (tabel di reference).
3. Susun daftar **gap teknis**: keputusan teknis yang PRD tidak jawab, dari checklist di reference, hanya yang relevan dengan tipe project. Sertakan rekomendasi default untuk tiap pertanyaan supaya user cukup menjawab "ya".

⛔ **Kirim dalam satu pesan, lalu berhenti:**
- hasil cek kualitas PRD (yang kurang: acceptance criteria, metrik, role, NFR terukur, scope);
- jika kekurangannya berat (mis. FR MVP tanpa acceptance criteria, tidak ada role/metrik): tawarkan pilihan — **(a)** lengkapi dulu lewat `prd-writer` mode "susun dari bahan", atau **(b)** lanjut; kekurangan menjadi pertanyaan di bawah dan TODO di `project/prd.md`;
- daftar gap teknis bernomor.

## Langkah 3 — Scaffold

```
node $SKILL_DIR/scripts/scaffold.mjs --target <repo> --type <frontend-web|backend|fullstack> --repo-name <nama> --dry-run
```

Periksa rencananya, lalu jalankan tanpa `--dry-run`. Script tidak menimpa file `project/` yang sudah ada dan mencadangkan AGENTS.md/CLAUDE.md lama ke `agentconfig/_audit/legacy/`.

Jika `.gitignore` mengabaikan `AGENTS.md`, `CLAUDE.md`, atau `agentconfig/`: ⛔ tanyakan user sebelum mengubah `.gitignore`.

## Langkah 4 — Isi project/ dan AGENTS.md

Ganti setiap penanda `<!-- AI: … -->` dengan isi (instruksi ada di dalam penanda), lalu hapus penandanya. Urutan: `prd.md` → `technical-requirements.md` → `architecture.md` → `threat-model.md` → `decisions.md` (satu entri per jawaban gap) → file per tipe (`design-system.md`, `api-contract.md`, `data-model.md`) → `project/README.md` → `agentconfig/README.md` (topologi) → `AGENTS.md` (overview, peringatan, env).

Aturan pengisian:
- Label: `[PRD]` untuk yang berasal dari PRD, `[KEPUTUSAN]` untuk jawaban user, `[TERBUKTI]`/`[DISIMPULKAN]`/`[TIDAK ADA]` + path untuk yang dibaca dari kode.
- Jangan menyalin isi `standards/` ke `project/`; rujuk saja. `project/` hanya memuat yang spesifik repo ini atau penyimpangan.
- Bagian yang tidak relevan: tulis `—`, jangan hapus heading (kecuali instruksi penanda menyuruh menghapus file).
- `threat-model.md` (TU-07): satu baris ancaman per penyalahgunaan yang masuk akal untuk setiap alur kritis di `prd.md` (minimal: akses data milik user lain, eskalasi role, manipulasi nilai/kuota, data sensitif bocor lewat response/log; plus LLM01/LLM02/LLM06/LLM10 jika ada fitur AI). Setiap ancaman punya kontrol yang merujuk `standards/security.md` dan test yang direncanakan. Profil S boleh satu tabel ringkas.
- `design-system.md`: jika `docs/design/` sudah ada (hasil skill `stitch-design` atau `figma-design`), ambil Brand, token, dan pemetaan kelas export/variable dari sana dengan label `[DESAIN]`. Jika belum ada, isi yang diketahui dari PRD, tulis `TODO` untuk token, dan sarankan skill desain sesuai pilihan di `docs/prd/_discovery.md` › Keputusan desain.
- Jika ada cadangan di `_audit/legacy/`: pindahkan aturan lama yang masih benar ke file `project/` yang sesuai (atau catat sebagai usulan template), lalu laporkan daftar aturan yang dibuang beserta alasannya.

## Langkah 5 — Validasi

```
node $SKILL_DIR/scripts/check.mjs --target <repo>
```

Perbaiki sampai `ok: true`. `todoCount` boleh > 0 — semuanya harus berupa pertanyaan/pekerjaan nyata, bukan isi yang malas diisi.

## Langkah 6 — Laporan

Ringkas ke user:
1. File yang dibuat (kelompokkan: router, standards (n file, versi), project).
2. Keputusan yang tercatat (`D-xx`, satu baris per keputusan).
3. TODO yang perlu user isi/putuskan, dikelompokkan per file.
4. Untuk tipe `frontend-web`/`fullstack` tanpa `docs/design/`: lanjut ke skill desain yang tercatat di `docs/prd/_discovery.md` › Keputusan desain (`stitch-design` atau `figma-design`). Jika belum tercatat, tanyakan preferensinya dengan pilihan yang sama seperti `prd-writer` Fase 6 › Preferensi desain (Stitch · Figma agent menggambar · Figma desainer/desain sudah ada · tanpa desain khusus).
5. Rencana delivery: jika `docs/delivery/plan.md` belum ada, tawarkan skill `delivery-plan` (milestone + task per FR) setelah desain.
6. Langkah berikutnya yang konkret, mis. tambah script `typecheck`/`test`, pasang Vitest/Playwright sesuai `standards/testing/README.md`, commit di branch `docs/agentconfig`.

Jangan commit atau push kecuali user minta. Jika diminta, satu commit `docs: add agentconfig from template <versi>`.

## Langkah S — Sync (repo sudah punya agentconfig/)

1. `scaffold.mjs --mode sync --dry-run`. Bandingkan versi repo dengan template; baca `CHANGELOG.md` template untuk versi di antaranya.
2. Jika ada `conflicts`: tampilkan `git diff --no-index <repo>/agentconfig/standards/<file> $SKILL_DIR/templates/agentconfig/standards/<file>` per file. Isi berbeda bisa berarti (a) versi lama — aman ditimpa, atau (b) editan lokal — harus dipindah ke `project/decisions.md` dulu. ⛔ Minta persetujuan, lalu jalankan dengan `--force`.
3. Terapkan hal yang CHANGELOG minta di `project/` (mis. bagian baru di technical-requirements), catat `D-xx · Sync template ke <versi>` di `decisions.md`, jalankan `check.mjs`.
4. Multi-repo: ulangi untuk setiap repo sibling agar `standards/` identik.

## Langkah A — Audit (project lama tanpa agentconfig)

1. Jalankan prompt di `references/audit-prompt.md` (Fase 1–2, read-only). Laporan ke `agentconfig/_audit/audit-report.md`.
2. ⛔ Berhenti di akhir Fase 2 sampai user menjawab pertanyaan audit.
3. Lanjut Langkah 3 (scaffold), lalu Langkah 4 dengan sumber utama kode + audit (PRD jika ada).
4. Bagian "Kandidat template" di laporan dibandingkan dengan `$SKILL_DIR/registry/rules.md`: aturan yang sudah ada → sebut ID lama; aturan baru → usulkan ke user untuk template versi berikutnya (jangan masukkan sendiri ke `standards/` repo ini).

## Mengubah template (bukan bagian alur di atas)

Hanya jika user minta memperbarui template: edit di `$SKILL_DIR/templates/`, jalankan `node $SKILL_DIR/scripts/build-registry.mjs`, naikkan `VERSION` (patch = koreksi, minor = aturan baru/berubah), tulis `CHANGELOG.md` termasuk "yang harus dilakukan di repo saat sync", lalu sync ke repo yang memakai template.
