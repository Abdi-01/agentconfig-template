# Siklus project (SDLC)

Peta standar dari ide sampai serah terima: fase → artefak → skill → **gate** (kriteria keluar). Setiap skill di repo ini merujuk ke peta ini. Baca saat memulai project baru, saat bingung "sekarang di fase apa", atau sebelum menambah skill baru.

## Prinsip lintas fase

1. **Satu rantai ID.** `FR-…`/`NFR-…` (PRD) → `UI-NN` (layar) → `T-NNN` (task) → test → commit/PR → release. Setiap artefak merujuk ID fase sebelumnya; tidak ada pekerjaan tanpa rujukan.
2. **Gate eksplisit.** Fase berikutnya dimulai setelah gate fase sebelumnya lolos, atau user memutuskan melewatinya (dicatat di `docs/prd/_discovery.md` atau `agentconfig/project/decisions.md`).
3. **Security sejak requirement.** Acuan OWASP (Top 10:2025, API Security Top 10:2023, ASVS 5.0, WSTG; LLM Top 10:2026 bila ada fitur AI) dipakai di setiap fase: level ASVS + AC penyalahgunaan di PRD, threat model di desain teknis, test security per milestone, checklist keamanan sebelum go-live. Rincian: `agentconfig` › `standards/security.md`.
4. **Paling sederhana dulu.** Dokumen secukupnya untuk profil project; kode paling sederhana yang memenuhi acceptance criteria (`agentconfig` › `standards/coding-style.md` › Kesederhanaan).
5. **Perubahan masuk lewat pintu depan.** Fitur baru/berubah → revisi PRD (`prd-writer`), lalu turun ke layar, task, dan test. Bug → laporan bug dengan rujukan FR/AC.

## Fase

| # | Fase | Artefak (lokasi) | Skill | Gate |
|---|---|---|---|---|
| 0 | Discovery & estimasi | brief, `docs/delivery/estimate.md` | `prd-writer` (intake), `delivery-plan` mode estimasi | User/klien setuju lanjut menyusun PRD dan kisaran biaya/waktu |
| 1 | Requirement | `docs/prd/prd.md`, `_discovery.md` | `prd-writer` | PRD **v1.0 disetujui** (tabel Persetujuan terisi), `check-prd` tanpa error, level OWASP ASVS dipilih, tool desain dipilih |
| 2 | Setup repo & aturan agent | `AGENTS.md`, `agentconfig/` | `agentconfig` | `check.mjs` ok; keputusan teknis gap-check tercatat `D-xx` |
| 3 | Desain UI | `docs/design/` | `stitch-design` / `figma-design` | Semua layar MVP berstatus **Final**; token di `project/design-system.md` |
| 4 | Desain teknis | `project/architecture.md`, `api-contract.md`, `data-model.md`, `threat-model.md`, `decisions.md` | `agentconfig` (Langkah 4) | Kontrak API + data model untuk modul milestone pertama disetujui; setiap alur kritis milestone itu punya ancaman → kontrol → test di `threat-model.md` |
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
| 4 Desain teknis | `architecture.md` + threat model satu tabel | per modul + threat model per alur kritis | per modul + threat model + review keamanan |
| 5 Delivery plan | 1–2 milestone | wajib | wajib + staging |
| 7 UAT | checklist ringkas | per milestone | per milestone + regresi |
| 8 Release | checklist go-live | checklist + serah terima | + rollback teruji, monitoring |

## Checklist sementara (fase tanpa skill)

**UAT per milestone (fase 7)**
- [ ] Setiap AC dari FR di milestone ini dicoba di staging/preview dan dicatat lulus/gagal (rujuk ID AC).
- [ ] Alur kritis (PRD §6) yang tersentuh milestone ini dijalankan end-to-end.
- [ ] Bug dicatat dengan: langkah reproduksi, hasil diharapkan vs aktual, FR/AC terkait, screenshot.
- [ ] Test security untuk ancaman `TM-xx` milestone ini lulus (matriks `testing/security.md`).
- [ ] Klien menandatangani (nama, tanggal, keputusan: diterima / diterima dengan catatan / ditolak).

**Keamanan sebelum go-live (fase 8, acuan OWASP)**
- [ ] `npm audit --omit=dev --audit-level=high` bersih, atau mitigasi tercatat di `technical-requirements.md`.
- [ ] Scan secret di repo dan riwayat git (mis. gitleaks) bersih; secret production hanya di platform deploy.
- [ ] Checklist OWASP ASVS 5.0 untuk level target ditinjau; item yang belum terpenuhi tercatat sebagai risiko + rencana.
- [ ] Semua ancaman di `threat-model.md` berstatus [TERBUKTI] atau tercatat di Risiko yang diterima dengan persetujuan klien.
- [ ] Security header dan CORS dicek di URL staging; tidak ada stack trace/pesan internal di response error.
- [ ] Scan baseline (mis. OWASP ZAP baseline) ke **staging**, bukan production; temuan high ditindaklanjuti.
- [ ] Tidak ada akun dengan password bawaan/seed di production; akun admin memakai password kuat (dan MFA jika diminta PRD).
- [ ] Fitur AI (jika ada): kuota, batas input/output, dan uji prompt injection dasar sudah dilakukan (LLM Top 10:2026).
- [ ] Profil L: pentest/audit eksternal selesai dan temuan high/critical ditutup.

**Release & serah terima (fase 8)**
- [ ] Semua `Syarat go-live` di `agentconfig/project/technical-requirements.md` tercentang.
- [ ] Env production terpisah dari dev; secret hanya di platform deploy.
- [ ] Backup database dan cara restore dicoba sekali.
- [ ] Release notes untuk klien: fitur (bahasa non-teknis + ID FR), yang ditunda, cara melapor bug.
- [ ] Serah terima: akses akun (hosting, domain, database, layanan pihak ketiga) dipindah/dibagikan ke klien; dokumentasi admin singkat; masa garansi bug disepakati.
