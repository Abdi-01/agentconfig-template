---
name: delivery-plan
description: Mengubah PRD (dan daftar layar) menjadi rencana delivery — estimasi kasar untuk penawaran, milestone dengan gate dan termin, task kecil per FR dengan estimasi hari kerja dan dependensi, proyeksi tanggal, serta GitHub Issues opsional. Pakai saat user minta "estimasi project", "breakdown task", "buat milestone/timeline", "rencana delivery", "update rencana setelah change request", atau "buat issue dari task".
---

# delivery-plan

Fase 0 dan 5 di `LIFECYCLE.md` (root repo skill): menjembatani PRD ke coding dan ke termin pembayaran. Output di `docs/delivery/`. Estimasi dalam **hari kerja efektif** (kelipatan 0,5) untuk satu developer.

`$SKILL_DIR` = folder tempat file ini berada. Script tanpa dependency (Node ≥18).

## Prinsip

- **Hanya scope PRD.** Setiap task merujuk FR/UI, atau bertipe non-fitur (setup, uat, release, docs, review). Tidak ada task "nice to have" yang tidak ada di PRD.
- **Task kecil.** Maksimal 2 hari per task; lebih dari itu dipecah. Judul berupa kata kerja + objek ("Buat endpoint daftar booking", bukan "Booking").
- **Pekerjaan non-coding ikut dihitung.** Setup repo, putaran review desain, test, UAT, deploy, serah terima, dan revisi dari feedback klien punya task sendiri — ini yang paling sering membuat jadwal molor.
- **Buffer terlihat, bukan disembunyikan.** Estimasi task jujur; buffer risiko ditulis terpisah di plan (default 20%, lebih besar untuk integrasi pihak ketiga atau requirement yang masih ada pertanyaan terbuka).
- **Sederhana dulu.** Estimasi mengasumsikan solusi paling sederhana yang memenuhi AC (`standards/coding-style.md` › Kesederhanaan). Jika task hanya masuk akal dengan solusi rumit, tandai dan tanyakan.
- **Harga hanya dari tarif user.** Skill tidak mengarang tarif. Nilai rupiah dihitung hanya jika user memberi tarif harian; termin pembayaran adalah usulan yang diputuskan user.
- Bahasa: Indonesia. Titik berhenti wajib ditandai ⛔.

## Mode

| Situasi | Mode |
|---|---|
| PRD belum final / perlu angka untuk penawaran | **estimasi** |
| PRD disepakati (idealnya desain + agentconfig sudah ada) | **rencana** |
| Change request, PRD direvisi, atau jadwal meleset | **update** |
| Rencana disetujui, task ingin jadi GitHub Issues | **issues** |

## Mode estimasi

1. Baca brief/PRD draft. Kelompokkan per modul; untuk tiap modul tulis asumsi utama dan rentang **min–maks hari**. Tambahkan baris non-fitur (setup, desain, testing/UAT, deploy, serah terima).
2. Tulis ke `docs/delivery/estimate.md` (template `templates/estimate.md.tmpl`; buat folder jika perlu). Nilai rupiah hanya jika user memberi tarif harian.
3. ⛔ Kirim ringkasan: total min–maks, 3 asumsi yang paling memengaruhi angka, dan pertanyaan yang bisa mempersempit rentang. Rentang lebar = sinyal PRD perlu dilengkapi lewat `prd-writer`.

## Mode rencana

1. **Input:** `docs/prd/prd.md` (wajib), `docs/design/screens.md` (jika ada), `agentconfig/project/` (stack, topologi), profil project dari `docs/prd/_discovery.md`. Tanyakan sekali: tanggal mulai, kapasitas (hari kerja efektif per minggu — part-time umumnya 2–3), tanggal tetap dari klien, tarif harian (opsional), pola termin yang diinginkan.
2. Kerangka:
   ```
   node $SKILL_DIR/scripts/new-plan.mjs --out docs/delivery --product "<nama>"
   ```
3. **Milestone** (ikuti `references/estimation.md` › Milestone): 2–5 milestone yang masing-masing bisa **didemokan** ke klien dan punya gate (umumnya UAT ditandatangani). Milestone pertama memuat setup + satu alur kritis end-to-end tipis.
4. **Task** per milestone di `tasks.md`: FR/UI yang dicakup, tipe, estimasi, dependensi. Ikuti `references/estimation.md` › Task.
5. Validasi dan proyeksi tanggal:
   ```
   node $SKILL_DIR/scripts/check-plan.mjs --dir docs/delivery --prd docs/prd/prd.md --start <YYYY-MM-DD> --capacity <hari/minggu> [--holidays <file>]
   ```
   Isi kolom Estimasi dan Target selesai di `plan.md` dari hasil `milestones`. File libur: satu tanggal `YYYY-MM-DD` per baris (libur nasional dan cuti bersama tahun berjalan — tanyakan atau cari sumber resmi; jangan menebak).
6. ⛔ Kirim ringkasan: milestone (isi, hari, tanggal proyeksi, gate, termin), total + buffer, FR MVP yang belum punya task, risiko jadwal. Revisi sampai disetujui; lalu Status plan → "Disetujui", versi `1.0`.

## Mode update

1. Baca perubahan (PRD versi baru, daftar FR terdampak, atau keterlambatan aktual).
2. Task untuk FR baru → nomor berikutnya; task untuk FR dibatalkan → Status `Batal` (tidak dihapus).
3. `check-plan` ulang dengan status aktual dan `--start <hari ini> --remaining` (proyeksi dari sisa pekerjaan); bandingkan tanggal proyeksi lama vs baru.
4. ⛔ Laporkan dampak: tambahan hari, milestone yang bergeser, usulan (tambah waktu, kurangi scope, atau pindahkan ke fase berikutnya). Setelah disetujui: naikkan versi plan + baris Riwayat versi.

## Mode issues

```
node $SKILL_DIR/scripts/to-issues.mjs --dir docs/delivery --repo <owner/repo>            # dry-run: tampilkan rencana
node $SKILL_DIR/scripts/to-issues.mjs --dir docs/delivery --repo <owner/repo> --apply    # membuat issue lewat gh
```
⛔ Tampilkan dry-run dan minta persetujuan sebelum `--apply`. Hanya task berstatus `Belum` tanpa nomor issue yang dibuat. Setelah apply, isi kolom Issue di `tasks.md` dari output script.

## Selama implementasi

Status task diperbarui di `tasks.md` (`Belum` → `Jalan` → `Selesai`). Milestone selesai = semua task-nya Selesai/Batal **dan** gate lolos (checklist UAT di `LIFECYCLE.md`).
