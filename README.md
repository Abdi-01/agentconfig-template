# agentconfig-template

Kumpulan skill Claude Code untuk alur kerja project dengan AI coding agent: dari PRD sampai aturan agent di repo.

| Skill | Versi | Untuk |
|---|---|---|
| [`prd-writer`](skills/prd-writer/SKILL.md) | lihat `skills/prd-writer/VERSION` | Menyusun, melengkapi, atau merevisi PRD (klien + developer) dari ide, brief, transkrip, atau PRD format lain |
| [`agentconfig`](skills/agentconfig/SKILL.md) | lihat `skills/agentconfig/VERSION` | Memasang/sync `AGENTS.md` + `agentconfig/` (standards reusable + project dari PRD) ke repo, atau mengaudit project lama |
| [`stitch-design`](skills/stitch-design/SKILL.md) | lihat `skills/stitch-design/VERSION` | Daftar layar dari PRD, prompt Google Stitch per batch, review desain, dan handoff token/export ke repo |
| [`figma-design`](skills/figma-design/SKILL.md) | lihat `skills/figma-design/VERSION` | Daftar layar dari PRD, desain di Figma lewat Figma MCP (agent menggambar atau desainer menggambar), review, dan handoff variables/frame ke repo |

## Alur

```
Ide / brief / meeting ──► prd-writer ──► docs/prd/prd.md (+ dokumen untuk klien)
                                               │
PRD dari klien (PDF/DOCX) ─────────────────────┤  (kurang lengkap? → prd-writer mode "susun dari bahan")
                                               ▼
                                    PRD disepakati → pilih tool desain: Stitch · Figma · tanpa desain
                                               ▼
                 create-next-app / init backend ──► agentconfig ──► stitch-design ─┬─► vibe coding
                                                                    figma-design  ─┘   (produk ber-UI)
                                                       ▲
                       template versi baru ── sync ────┘
```

Semua skill memakai skema ID yang sama — `FR-<MODUL>-<NNN>` dan `NFR-<KAT>-<NNN>` — sehingga requirement di PRD bisa dilacak sampai layar desain (`UI-NN` di `docs/design/screens.md`, format sama untuk Stitch dan Figma), `agentconfig/project/prd.md`, test, dan commit.

## Instalasi

```bash
git clone git@github.com:Abdi-01/agentconfig-template.git ~/.claude/agentconfig-template
~/.claude/agentconfig-template/install.sh
```

`install.sh` membuat symlink `~/.claude/skills/<skill>` → `skills/<skill>` untuk setiap skill, jadi `git pull` langsung memperbarui semuanya. Restart Claude Code, lalu cek dengan `/prd-writer`, `/agentconfig`, `/stitch-design`, dan `/figma-design`.

| Kebutuhan | Perintah |
|---|---|
| Update | `git -C ~/.claude/agentconfig-template pull` |
| Symlink tidak didukung (mis. Windows tanpa Developer Mode) | `./install.sh --copy` (ulangi setelah setiap `pull`) |
| Lokasi skill lain | `CLAUDE_SKILLS_DIR=/path ./install.sh` |
| Copot | `./install.sh --uninstall` |

**Pindah dari instalasi lama** (clone langsung ke `~/.claude/skills/agentconfig`): `rm -rf ~/.claude/skills/agentconfig`, lalu jalankan langkah di atas.

## Struktur

```
install.sh
skills/
  prd-writer/    SKILL.md, VERSION, CHANGELOG.md, templates/, references/, scripts/
  agentconfig/   SKILL.md, VERSION, CHANGELOG.md, templates/, references/, registry/, scripts/
  stitch-design/ SKILL.md, VERSION, CHANGELOG.md, templates/, references/, scripts/
  figma-design/  SKILL.md, VERSION, CHANGELOG.md, templates/, references/, scripts/  (memakai bagian bersama dari stitch-design)
```

Setiap skill punya `VERSION` dan `CHANGELOG.md` sendiri. Skill baru = folder baru di `skills/` dengan `SKILL.md`; `install.sh` memasangnya otomatis.

Script semua skill memakai Node ≥18 tanpa dependency, sehingga bisa juga dijalankan langsung oleh agent lain atau manual (lihat README masing-masing skill).
