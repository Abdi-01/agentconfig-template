# stitch-design

Skill Claude Code: PRD → daftar layar → prompt Google Stitch per batch → review → handoff desain ke repo. Alur lengkap di [`SKILL.md`](SKILL.md).

Urutan dengan skill lain: `prd-writer → agentconfig → stitch-design → vibe coding`.

## Output di repo

```
docs/design/
  screens.md      daftar layar UI-NN → role, tipe, FR, batch, status
  prompts.md      brief + prompt per batch + log review
  build-plan.md   prompt urutan build untuk coding agent
  export/         HTML/PNG/DESIGN.md dari Stitch (referensi, tidak di-import)
```

## Export: manual atau otomatis

Default manual (download zip dari canvas). Jalur otomatis opsional lewat CLI resmi Google `@google/stitch` (versi di-pin, login OAuth), langsung dari shell atau sebagai MCP stdio. MCP remote dengan header API key tidak disarankan untuk Claude Code (dilaporkan gagal karena Claude Code mencoba OAuth). Skill menjalankan pengecekan integrasi C1–C5 (tersedia, terautentikasi, akun Google sama dengan pemilik project, layar terbaca, aset terambil) dan memberi panduan setup jika belum terpasang. Lihat [`references/mcp-setup.md`](references/mcp-setup.md).

## Script (Node ≥18, tanpa dependency)

| Script | Fungsi |
|---|---|
| `scripts/new-design.mjs --product "<nama>" [--out docs/design] [--prd docs/prd/prd.md]` | Kerangka `docs/design/`; tidak menimpa |
| `scripts/check-design.mjs [--dir docs/design] [--prd docs/prd/prd.md] [--stage screens\|prompts]` | Validasi ID/batch/status, cakupan FR MVP, dan prompt (≤5 layar, blok wajib) |

Skill ini khusus Stitch. Tool desain lain sebaiknya dibuat sebagai skill terpisah dengan pola yang sama; `screens.md` bisa dipakai ulang.
