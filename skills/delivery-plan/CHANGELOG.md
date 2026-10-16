# Changelog — delivery-plan

## v0.1.1 — 2026-10-16

Pekerjaan security dihitung di rencana: patokan estimasi (threat model + test security per milestone, CI audit + scan secret, checklist go-live, pentest profil L) dan bagian "Security wajib di rencana". `check-plan` memberi warning jika tidak ada task security.

## v0.1 — 2026-10-15

Versi awal (fase 0 dan 5 di `LIFECYCLE.md`). Mode estimasi (rentang per modul untuk penawaran), rencana (milestone dengan gate dan termin, task ≤2 hari per FR/UI, buffer terpisah), update (change request/keterlambatan, proyeksi dari sisa pekerjaan), dan issues (GitHub Issues lewat `gh`, dry-run dulu). Script `new-plan`, `check-plan` (validasi cakupan FR MVP dan layar, dependensi dan siklus, ukuran task, proyeksi tanggal dengan kapasitas per minggu dan file libur), `to-issues`.
