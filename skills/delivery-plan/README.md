# delivery-plan

Skill Claude Code: PRD (+ daftar layar) → estimasi kasar → milestone, task, dan proyeksi tanggal → GitHub Issues (opsional). Alur lengkap di [`SKILL.md`](SKILL.md); posisinya di siklus project ada di [`LIFECYCLE.md`](../../LIFECYCLE.md) (fase 0 dan 5).

## Output di repo

```
docs/delivery/
  estimate.md   rentang min–maks per modul untuk penawaran (mode estimasi)
  plan.md       milestone, gate, termin, buffer, risiko jadwal
  tasks.md      task T-NNN: milestone, tipe, FR/UI, estimasi, dependensi, status, issue
```

## Script (Node ≥18, tanpa dependency)

| Script | Fungsi |
|---|---|
| `scripts/new-plan.mjs --product "<nama>" [--out docs/delivery] [--estimate]` | Kerangka plan+tasks, atau estimate saja |
| `scripts/check-plan.mjs [--prd …] [--screens …] [--start YYYY-MM-DD] [--capacity N] [--holidays file] [--remaining]` | Validasi + proyeksi tanggal per milestone |
| `scripts/to-issues.mjs --repo <owner/repo> [--apply]` | Task `Belum` → GitHub Issues (dry-run tanpa `--apply`) |

Estimasi dalam hari kerja efektif satu developer (kelipatan 0,5; maksimal 2 per task). `--capacity` = hari efektif per minggu (part-time umumnya 2–3).
