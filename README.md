# agentconfig-template

Template master + skill Claude Code untuk memasang aturan AI coding agent ke repo JS/TS: `AGENTS.md` sebagai router, `agentconfig/standards/` yang reusable lintas project, dan `agentconfig/project/` yang diturunkan dari PRD atau audit kode.

Versi saat ini: lihat `VERSION` dan `CHANGELOG.md`.

## Hasil di repo project

```
AGENTS.md                 ← router ≤100 baris (blok framework seperti Next.js dipertahankan)
CLAUDE.md                 ← @AGENTS.md
agentconfig/
  README.md               ← versi template, legenda label, topologi
  .template-lock.json     ← hash standards/ (untuk sync)
  standards/              ← disalin identik dari templates/ — JANGAN diedit per project
  project/                ← prd, technical-requirements, architecture, decisions,
                            + design-system (FE), api-contract, data-model (BE)
  _audit/                 ← laporan audit (project lama) + cadangan instruksi lama
```

Hasilnya Markdown biasa, jadi bisa dibaca agent apa pun (Claude Code, Codex, Cursor, Copilot) lewat `AGENTS.md`. Skill-nya sendiri khusus Claude Code; agent lain bisa memakai script di `scripts/` secara langsung.

## Instalasi (Claude Code)

```bash
git clone git@github.com:Abdi-01/agentconfig-template.git ~/.claude/skills/agentconfig
```

Skill tersedia di semua project. Update: `git -C ~/.claude/skills/agentconfig pull`.

## Pemakaian

Di Claude Code, dari root repo project:

| Situasi | Ketik |
|---|---|
| Project baru (mis. setelah `create-next-app`) | "jalankan skill agentconfig, PRD-nya di `docs/prd.pdf`" |
| Project lama tanpa agentconfig | "audit project ini lalu pasang agentconfig" |
| Template punya versi baru | "sync agentconfig ke versi terbaru" |

Alur init: deteksi stack → konfirmasi → baca PRD → daftar pertanyaan gap (berhenti) → scaffold → isi `project/` → validasi → laporan. Detail: `SKILL.md`.

Tanpa skill (agent lain atau manual):

```bash
node scripts/detect.mjs   --target ../my-app
node scripts/scaffold.mjs --target ../my-app --type frontend-web --repo-name my-app
# isi semua penanda <!-- AI: … --> di AGENTS.md dan agentconfig/project/
node scripts/check.mjs    --target ../my-app
```

## Isi repo

| Path | Isi |
|---|---|
| `SKILL.md` | instruksi skill (alur init/sync/audit) |
| `templates/agentconfig/standards/` | standar reusable — **sumber kebenaran** |
| `templates/agentconfig/project/*.tmpl` | kerangka dokumen per project |
| `templates/root/` | `AGENTS.md.tmpl` |
| `references/` | PRD → dokumen + checklist gap, prompt audit, katalog stack |
| `registry/rules.md` | indeks ID aturan → lokasi (dibuat oleh script) |
| `scripts/` | `detect`, `scaffold`, `check`, `build-registry` (Node ≥18, tanpa dependency) |

## Mengubah standar

1. Edit file di `templates/agentconfig/standards/` (aturan baru sebaiknya berasal dari audit project nyata).
2. `node scripts/build-registry.mjs`
3. Naikkan `VERSION` (patch = koreksi kata/contoh, minor = aturan baru/berubah, mayor = struktur berubah) dan tulis `CHANGELOG.md`, termasuk bagian **Saat sync** (apa yang perlu dilakukan di `project/` repo).
4. Commit, lalu sync ke repo yang memakai template.

Laporan audit lengkap tidak disimpan di repo ini karena berisi detail klien; tetap di `_audit/` repo project masing-masing.
