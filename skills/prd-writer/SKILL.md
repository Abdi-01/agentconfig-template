---
name: prd-writer
description: Menyusun, melengkapi, atau merevisi PRD (Product Requirements Document) untuk klien dan developer — dari ide, brief, transkrip meeting, atau PRD format lain — dengan ID FR/NFR, acceptance criteria, dan metrik keberhasilan. Pakai saat user minta "buat PRD", "susun PRD dari brief/meeting ini", "lengkapi PRD", "revisi PRD", atau saat skill agentconfig menemukan PRD belum ada/belum lengkap.
---

# prd-writer

Menghasilkan PRD dua lapis: **Bagian 1** untuk stakeholder (masalah, tujuan, metrik, scope, alur, timeline) dan **Bagian 2** untuk developer (role, FR dengan acceptance criteria, NFR terukur, data, integrasi, asumsi, pertanyaan terbuka). Markdown di repo adalah **sumber kebenaran**; dokumen untuk klien adalah turunannya.

`$SKILL_DIR` = folder tempat file ini berada. Script tanpa dependency (Node ≥18).

## Prinsip

- **Bertahap dan disetujui.** PRD dibangun lewat ronde tanya-jawab dan outline yang disetujui user sebelum draft lengkap ditulis. Titik berhenti wajib ditandai ⛔.
- **Tidak mengarang.** Fakta dari klien/bahan diberi sumber; default yang dipakai karena user belum tahu diberi `[ASUMSI]` dan masuk §13; yang harus dijawab klien masuk §14.
- **Apa, bukan bagaimana.** PRD tidak memilih framework/database; itu tugas skill `agentconfig` setelah PRD ada. Batasan teknis dari klien boleh dicatat.
- Bahasa: Indonesia; istilah teknis lazim tetap Inggris. Aturan isi lengkap: `references/writing-guide.md`.

## Mode

| Situasi | Mode |
|---|---|
| Baru ada ide/obrolan | **baru** (Fase 1–6) |
| Ada bahan: brief, notulen, transkrip, PRD format lain (PDF/DOCX), atau laporan gap dari `agentconfig` | **susun dari bahan** (Fase 1–6; Fase 1–2 dimulai dari ekstraksi bahan) |
| Sudah ada `docs/prd/prd.md` dari skill ini + permintaan perubahan | **revisi** (Langkah R) |

Lokasi output: di dalam git repo → `docs/prd/`; di luar repo → tanyakan, default `./prd/<slug-produk>/`.

## Fase 1 — Intake

Mode baru: tanyakan dalam satu pesan — nama produk & klien, masalah utama, target pengguna, tujuan bisnis, batasan (deadline, anggaran kasar, platform, bahasa), dan **profil project** S/M/L (`LIFECYCLE.md` di root repo skill; usulkan berdasarkan jawaban). Profil S boleh berhenti di discovery ronde 1–3. Jika user butuh angka untuk penawaran sebelum PRD selesai, tawarkan `delivery-plan` mode estimasi.

Mode susun dari bahan: baca semua bahan sampai habis (PDF/DOCX lewat skill pembaca file yang tersedia), lalu tampilkan tabel ringkas `Topik → Isi dari bahan → Sumber` dan kontradiksi yang ditemukan.

Lalu jalankan:
```
node $SKILL_DIR/scripts/new-prd.mjs --out <folder> --product "<nama>" --client "<klien>" --author "<penyusun>"
```
Ini membuat `prd.md` (kerangka) dan `_discovery.md` (log kerja). Catat bahan dan jawaban intake di log.

## Fase 2 — Discovery

Ikuti `references/discovery-questions.md` ronde 1→6. Per ronde: hanya pertanyaan yang belum terjawab, maksimal 8, masing-masing dengan rekomendasi default.

⛔ **Kirim satu ronde, berhenti, tunggu jawaban.** Setelah dijawab, catat ke `_discovery.md` dengan label sumber, lalu lanjut ronde berikutnya. Ronde yang tidak relevan (mis. integrasi untuk landing page sederhana) dilewati dengan menyebutnya. User boleh mempercepat ("sisanya pakai default") — semua default itu menjadi `[ASUMSI]`.

## Fase 3 — Outline

Susun dan kirim ke user dalam bentuk ringkas:
- modul + kode (`BOOK`, `CAT`, …);
- daftar judul FR per modul + prioritas (MVP / Fase 2 / Nanti);
- kategori NFR yang akan diisi;
- 2–5 metrik keberhasilan dengan target;
- butir "di luar cakupan";
- asumsi dan pertanyaan terbuka yang sudah terkumpul.

⛔ **Minta persetujuan outline.** Mengubah outline jauh lebih murah daripada mengubah draft. Simpan versi yang disetujui di `_discovery.md` › Keputusan outline.

## Fase 4 — Draft

Isi setiap penanda `<!-- AI: … -->` di `prd.md` sesuai outline dan `references/writing-guide.md`, hapus penandanya. Tulis per bagian, Bagian 2 §9 per modul. Lalu:
```
node $SKILL_DIR/scripts/check-prd.mjs --file <folder>/prd.md
```
Perbaiki semua `errors`; tinjau `warnings` — perbaiki atau biarkan dengan alasan yang disebut di laporan.

## Fase 5 — Review

Laporkan ke user secara ringkas (bukan isi PRD): statistik dari `check-prd` (modul, FR per prioritas, AC, NFR, metrik), daftar `[ASUMSI]`, pertanyaan terbuka untuk klien, dan warning yang dibiarkan. ⛔ Iterasi sampai user puas; setiap putaran revisi menaikkan versi draft (`0.1` → `0.2`) dengan baris Riwayat versi.

## Fase 6 — Dokumen klien & serah ke agentconfig

1. **Dokumen klien:** jika sesi punya tool dokumen bersama (mis. Claude Docs atau konektor Google Docs), buat dokumen dari `prd.md` yang final; jika tidak, tawarkan file `.docx`/`.pdf` lewat skill dokumen yang tersedia. Markdown tetap sumber kebenaran — perubahan berikutnya dilakukan di Markdown lalu dokumen dibuat ulang. Claude tidak mengirim apa pun ke klien; user yang mengirim.
2. **Persetujuan:** saat klien menyetujui, isi tabel Persetujuan, ubah Status ke "Disetujui", naikkan versi ke `1.0`.
3. **Gate fase 1** (`LIFECYCLE.md`): PRD v1.0 disetujui dan `check-prd` tanpa error.
4. **Serah ke agentconfig:** jika repo sudah punya `agentconfig/`, tawarkan memperbarui `agentconfig/project/prd.md` (status per FR). Jika belum, tawarkan menjalankan skill `agentconfig` mode init dengan PRD ini.
5. **Preferensi desain** (produk ber-UI, setelah PRD disepakati): ⛔ tanyakan satu pertanyaan, catat jawabannya di `_discovery.md` › Keputusan desain:

   | Pilihan | Lanjut ke | Cocok jika |
   |---|---|---|
   | **Google Stitch** | `stitch-design` | Butuh desain cepat dari prompt; user menjalankan prompt di Stitch |
   | **Figma — agent menggambar** | `figma-design` mode gambar | Punya seat Figma Dev/Full; ingin file Figma yang bisa diedit desainer/klien |
   | **Figma — desainer menggambar / desain sudah ada** | `figma-design` mode review | Ada desainer atau file Figma dari klien |
   | **Tanpa desain khusus** | langsung `agentconfig` | Prototipe/internal tool; cukup preset UI library, brand minimal di `design-system.md` |

   Default saran: Stitch untuk dashboard internal dan MVP cepat; Figma jika klien/desainer akan ikut mengedit desain. Urutannya tetap `agentconfig` dulu, lalu skill desain. Jika `docs/design/` sudah ada dan PRD direvisi, tawarkan Langkah R di skill desain yang tercatat.

## Langkah R — Revisi PRD yang sudah ada

1. Baca `prd.md`, `_discovery.md`, dan permintaan perubahan. Petakan dampaknya: FR/NFR baru, diubah, dibatalkan; dampak ke §5 scope, §6 alur, §7 timeline.
2. ⛔ Tampilkan daftar dampak dan usulan versi baru (aturan versi di writing-guide), tunggu persetujuan.
3. Terapkan. FR baru mengambil nomor berikutnya di modulnya; FR yang dibatalkan dicoret (`~~FR-…~~`), tidak dihapus atau dipakai ulang. Tambah baris Riwayat versi dengan daftar ID terdampak.
4. `check-prd.mjs`, lalu Fase 6 langkah 1 dan 4 (buat ulang dokumen klien; sinkronkan `agentconfig/project/prd.md` jika ada).
