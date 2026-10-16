# Siklus project (SDLC)

Peta standar dari ide sampai serah terima: fase → artefak → skill → **gate** (kriteria keluar). Setiap skill di repo ini merujuk ke peta ini. Baca saat memulai project baru, saat bingung "sekarang di fase apa", atau sebelum menambah skill baru.

## Prinsip lintas fase

1. **Satu rantai ID.** `FR-…`/`NFR-…` (PRD) → `UI-NN` (layar) → `T-NNN` (task) → test → commit/PR → release. Setiap artefak merujuk ID fase sebelumnya; tidak ada pekerjaan tanpa rujukan.
2. **Gate eksplisit.** Fase berikutnya dimulai setelah gate fase sebelumnya lolos, atau user memutuskan melewatinya (dicatat di `docs/prd/_discovery.md` atau `agentconfig/project/decisions.md`).
3. **Paling sederhana dulu.** Dokumen secukupnya untuk profil project; kode paling sederhana yang memenuhi acceptance criteria (`agentconfig` › `standards/coding-style.md` › Kesederhanaan).
4. **Perubahan masuk lewat pintu depan.** Fitur baru/berubah → revisi PRD (`prd-writer`), lalu turun ke layar, task, dan test. Bug → laporan bug dengan rujukan FR/AC.

## Fase

| # | Fase | Artefak (lokasi) | Skill | Gate |
|---|---|---|---|---|
| 0 | Discovery & estimasi | brief, `docs/delivery/estimate.md` | `prd-writer` (intake), `delivery-plan` mode estimasi | User/klien setuju lanjut menyusun PRD dan kisaran biaya/waktu |
| 1 | Requirement | `docs/prd/prd.md`, `_discovery.md` | `prd-writer` | PRD **v1.0 disetujui** (tabel Persetujuan terisi), `check-prd` tanpa error, tool desain dipilih |
| 2 | Setup repo & aturan agent | `AGENTS.md`, `agentconfig/` | `agentconfig` | `check.mjs` ok; keputusan teknis gap-check tercatat `D-xx` |
| 3 | Desain UI | `docs/design/` | `stitch-design` / `figma-design` | Semua layar MVP berstatus **Final**; token di `project/design-system.md` |
| 4 | Desain teknis | `project/architecture.md`, `api-contract.md`, `data-model.md`, `decisions.md` | `agentconfig` (Langkah 4) | Kontrak API + data model untuk modul milestone pertama disetujui |
| 5 | Perencanaan delivery | `docs/delivery/plan.md`, `tasks.md` | `delivery-plan` | Milestone, termin, dan gate per milestone **disetujui klien**; `check-plan` tanpa error |
| 6 | Implementasi | kode, PR | coding agent + `agentconfig` | Per task: Definition of Done; per milestone: semua task Selesai |
| 7 | Testing & UAT | test, checklist UAT | *(belum ada skill — pakai checklist di bawah)* | UAT milestone **ditandatangani klien** |
| 8 | Release & serah terima | release notes, checklist go-live, paket serah terima | *(belum ada skill — pakai checklist di bawah)* | Syarat go-live (`technical-requirements.md`) terpenuhi; serah terima diterima |
| 9 | Maintenance | laporan bug, change request | `prd-writer` (revisi) → fase 3–8 | — |

Fase 6–7 berulang per milestone. Fase 3 dan 4 boleh berjalan paralel.

## Profil project

Pilih di intake `prd-writer` (dicatat di `_discovery.md`). Profil menentukan fase mana yang wajib.

| Fase | S — landing/prototipe/internal kecil (≤2 minggu) | M — MVP aplikasi (1–3 bulan) | L — multi-repo, data sensitif, >3 bulan |
|---|---|---|---|
| 0 Estimasi | opsional | wajib | wajib |
| 1 PRD | ringkas (ronde 1–3) | penuh | penuh + review klien formal |
| 2 agentconfig | wajib | wajib | wajib, per repo |
| 3 Desain UI | opsional (preset UI library) | Stitch atau Figma | Figma atau Stitch + review klien |
| 4 Desain teknis | dalam `architecture.md` saja | per modul | per modul + review keamanan |
| 5 Delivery plan | 1–2 milestone | wajib | wajib + staging |
| 7 UAT | checklist ringkas | per milestone | per milestone + regresi |
| 8 Release | checklist go-live | checklist + serah terima | + rollback teruji, monitoring |

## Checklist sementara (fase tanpa skill)

**UAT per milestone (fase 7)**
- [ ] Setiap AC dari FR di milestone ini dicoba di staging/preview dan dicatat lulus/gagal (rujuk ID AC).
- [ ] Alur kritis (PRD §6) yang tersentuh milestone ini dijalankan end-to-end.
- [ ] Bug dicatat dengan: langkah reproduksi, hasil diharapkan vs aktual, FR/AC terkait, screenshot.
- [ ] Klien menandatangani (nama, tanggal, keputusan: diterima / diterima dengan catatan / ditolak).

**Release & serah terima (fase 8)**
- [ ] Semua `Syarat go-live` di `agentconfig/project/technical-requirements.md` tercentang.
- [ ] Env production terpisah dari dev; secret hanya di platform deploy.
- [ ] Backup database dan cara restore dicoba sekali.
- [ ] Release notes untuk klien: fitur (bahasa non-teknis + ID FR), yang ditunda, cara melapor bug.
- [ ] Serah terima: akses akun (hosting, domain, database, layanan pihak ketiga) dipindah/dibagikan ke klien; dokumentasi admin singkat; masa garansi bug disepakati.
