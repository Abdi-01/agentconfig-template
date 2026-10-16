# figma-design

Skill Claude Code: PRD → daftar layar → desain di Figma (lewat Figma MCP) → review → handoff ke repo. Alur lengkap di [`SKILL.md`](SKILL.md).

Urutan dengan skill lain: `prd-writer → agentconfig → figma-design → vibe coding`. Pilihan antara `figma-design` dan `stitch-design` ditanyakan di akhir `prd-writer`.

## Dua mode

| Mode | Siapa menggambar | Butuh |
|---|---|---|
| Gambar | Agent, langsung di canvas Figma | Server MCP **remote**, seat Dev/Full, akses edit file |
| Review | Desainer/user | Akses lihat file (atau screenshot manual) |

Seat Starter, View, atau Collab dibatasi 6 tool call per bulan — tidak cukup untuk skill ini. Detail setup dan pengecekan F1–F5: [`references/figma-setup.md`](references/figma-setup.md).

## Output di repo

```
docs/design/
  screens.md      daftar layar UI-NN (format sama dengan stitch-design)
  figma.md        link file, frame/node per UI-NN, log review
  build-plan.md   urutan build untuk coding agent
  export/         PNG frame final (referensi, tidak di-import)
```

## Bergantung pada `stitch-design`

Bagian tool-agnostik dipakai bersama: template `screens.md`, `scripts/check-design.mjs --stage screens`, `references/screen-inventory.md`, `references/review-checklist.md`, dan template build-plan di `references/handoff.md`. Keduanya dipasang bersama oleh `install.sh`.
