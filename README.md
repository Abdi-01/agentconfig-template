# agentconfig-template

A set of Claude Code skills that take a project from **idea → PRD → design → delivery plan → code written by AI agents under clear rules → release**. Each skill produces plain Markdown files in your repo, so the output also works with other coding agents (Codex, Cursor, Copilot) through `AGENTS.md`.

| Skill | Version | What it does |
|---|---|---|
| [`prd-writer`](skills/prd-writer/SKILL.md) | `skills/prd-writer/VERSION` | Writes, completes, or revises a PRD for clients and developers, with requirement IDs, acceptance criteria, and success metrics |
| [`agentconfig`](skills/agentconfig/SKILL.md) | `skills/agentconfig/VERSION` | Installs or syncs `AGENTS.md` + `agentconfig/` (reusable coding/security/testing standards + project docs derived from the PRD), or audits an existing project |
| [`stitch-design`](skills/stitch-design/SKILL.md) | `skills/stitch-design/VERSION` | Screen list from the PRD → Google Stitch prompts per batch → design review → hand-off of tokens and exports to the repo |
| [`figma-design`](skills/figma-design/SKILL.md) | `skills/figma-design/VERSION` | Same flow in Figma through the Figma MCP: the agent draws on the canvas, or reviews a designer's file |
| [`delivery-plan`](skills/delivery-plan/SKILL.md) | `skills/delivery-plan/VERSION` | Rough estimate for quotes, milestones with gates and payment terms, small tasks per requirement, date projection, optional GitHub Issues |

The full lifecycle — phases, artifacts, exit gates, and S/M/L project profiles — is in [`LIFECYCLE.md`](LIFECYCLE.md).

> **Language note.** This README is in English. The skills talk to you in your language and write the project documents in **Bahasa Indonesia** by default (technical terms stay in English).

---

## Contents

1. [How the skills fit together](#1-how-the-skills-fit-together)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [Quick start](#4-quick-start)
5. [Skill guides](#5-skill-guides) — [prd-writer](#51-prd-writer) · [agentconfig](#52-agentconfig) · [stitch-design](#53-stitch-design) · [figma-design](#54-figma-design) · [delivery-plan](#55-delivery-plan)
6. [Shared conventions](#6-shared-conventions)
7. [Using other coding agents](#7-using-other-coding-agents)
8. [Using the scripts without Claude Code](#8-using-the-scripts-without-claude-code)
9. [Maintaining the templates](#9-maintaining-the-templates)
10. [Troubleshooting](#10-troubleshooting)
11. [Repository layout](#11-repository-layout)

---

## 1. How the skills fit together

```
Idea / brief / meeting ──► (delivery-plan: rough estimate) ──► prd-writer ──► docs/prd/prd.md (+ client document)
                                                 │
Client PRD (PDF/DOCX) ───────────────────────────┤  incomplete? → prd-writer "from materials" mode
                                                 ▼
                                PRD approved → choose design tool: Stitch · Figma · none
                                                 ▼
   create-next-app / backend init ──► agentconfig ──► stitch-design ─┬─► delivery-plan ──► coding agent ──► UAT ──► release
                                                      figma-design  ─┘   (milestones, tasks)   (per milestone)
                                         ▲
             new template version ── sync┘
```

Every skill uses the same ID chain, so any line of work can be traced back to a requirement:

`FR-<MODULE>-<NNN>` / `NFR-<CAT>-<NNN>` (PRD) → `UI-NN` (screen) → `TM-NN` (threat) → `T-NNN` (task) → test → commit/PR → release.

What each phase leaves in the project repo:

```
AGENTS.md                      router for coding agents (≤100 lines)
CLAUDE.md                      contains only: @AGENTS.md
agentconfig/
  standards/                   reusable rules — identical in every project on the same template version
  project/                     this repo's PRD summary, tech requirements, architecture, threat model, decisions, …
  _audit/                      audit reports (existing projects) and backups of old agent instructions
docs/
  prd/prd.md, _discovery.md    PRD (source of truth) and the discovery log
  design/                      screens.md, prompts.md or figma.md, export/, build-plan.md
  delivery/                    estimate.md, plan.md, tasks.md
```

---

## 2. Requirements

| Need | For |
|---|---|
| [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) | Running the skills |
| Node.js ≥ 18 (≥ 20 if you use the Stitch CLI) | All skill scripts (no npm dependencies) |
| git | Installing and updating the skills; most checks |
| GitHub CLI `gh` (optional) | `delivery-plan` issues mode |
| Google Stitch account (optional) | `stitch-design` |
| Figma **Dev or Full seat** on a paid plan (optional) | `figma-design` drawing mode — Starter/View/Collab seats are limited to 6 MCP tool calls per month |

---

## 3. Installation

### Install

The repo is private, so you must be signed in to GitHub. The easiest way is the GitHub CLI (no SSH key needed):

```bash
gh auth login        # GitHub.com → HTTPS → Login with a web browser (once)
gh repo clone Abdi-01/agentconfig-template ~/.claude/agentconfig-template
~/.claude/agentconfig-template/install.sh
```

Do **not** use `sudo`: it runs as root (which has no GitHub credentials) and leaves root-owned files in `~/.claude`.

Alternatives for the clone step:

| Method | Command | Notes |
|---|---|---|
| HTTPS | `git clone https://github.com/Abdi-01/agentconfig-template.git ~/.claude/agentconfig-template` | When asked for a password, use a [Personal Access Token](https://github.com/settings/tokens), not your GitHub password |
| SSH | `git clone git@github.com:Abdi-01/agentconfig-template.git ~/.claude/agentconfig-template` | Needs an SSH key added at GitHub → Settings → SSH and GPG keys; verify with `ssh -T git@github.com`. `Permission denied (publickey)` means no key is registered |
| ZIP | Download the ZIP from the repo page, unzip to `~/.claude/agentconfig-template`, run `install.sh --copy` | No `git pull`; re-download to update |

`install.sh` creates one symlink per skill: `~/.claude/skills/<skill>` → `skills/<skill>`. Restart Claude Code, then check that `/prd-writer`, `/agentconfig`, `/stitch-design`, `/figma-design`, and `/delivery-plan` are available (or ask Claude "which skills are available?").

### Update, alternatives, uninstall

| Need | Command |
|---|---|
| Update all skills | `git -C ~/.claude/agentconfig-template pull` (symlinks pick it up immediately) |
| Symlinks not supported (e.g. Windows without Developer Mode) or skills don't show up after restart | `~/.claude/agentconfig-template/install.sh --copy` — repeat after every `pull` |
| Install to another skills folder | `CLAUDE_SKILLS_DIR=/path ~/.claude/agentconfig-template/install.sh` |
| Uninstall | `~/.claude/agentconfig-template/install.sh --uninstall` (only removes what this script installed) |

### Migrating from an old install

If you previously cloned this repo directly into `~/.claude/skills/agentconfig`, the installer will warn you and skip it. Remove it first:

```bash
rm -rf ~/.claude/skills/agentconfig
~/.claude/agentconfig-template/install.sh
```

---

## 4. Quick start

Talk to Claude Code from the **root of the project repo**. You can invoke a skill by name (`/prd-writer`) or just describe what you want; the examples below show both.

### A. New product, starting from an idea

1. **PRD** — `/prd-writer` → "Create a PRD for an online booking system for a beauty clinic." Answer the intake and discovery rounds, approve the outline, review the draft, and pick a design tool at the end.
2. **Repo** — create the app (`npx create-next-app@latest …` or your backend init), then `/agentconfig` → "Set up agentconfig; the PRD is in docs/prd/prd.md." Answer the gap questions.
3. **Design** — `/stitch-design` or `/figma-design` (whichever you chose) → screen list → prompts or Figma frames → review → hand-off.
4. **Plan** — `/delivery-plan` → "Make the delivery plan. Start date 2026-11-02, 3 days a week." Approve milestones and tasks.
5. **Build** — ask the coding agent to work through `docs/delivery/tasks.md` in order. It follows `AGENTS.md`, keeps code simple, and runs the Definition of Done for every task.
6. **UAT & release** — use the checklists in [`LIFECYCLE.md`](LIFECYCLE.md) (phases 7–8).

### B. The client already sent a PRD

1. `/agentconfig` → "Set up agentconfig using the PRD at ~/Downloads/client-prd.pdf." The skill runs a **PRD quality check** first. If the PRD is weak (no acceptance criteria, no roles, no measurable NFRs), it offers to complete it with `prd-writer` in "from materials" mode.
2. Continue with steps 3–6 of scenario A.

### C. Existing project built without these rules

1. `/agentconfig` → "Audit this project and install agentconfig." It runs a read-only audit, writes `agentconfig/_audit/audit-report.md`, stops for your decisions, then installs the standards and fills `project/` from the code.
2. Optionally reconstruct the PRD with `prd-writer` ("from materials" mode, using the audit) and plan the remaining work with `delivery-plan`.

### D. The template got a new version

In each project repo: `/agentconfig` → "Sync agentconfig to the latest template version." Review the reported conflicts and the "When syncing" notes in [`skills/agentconfig/CHANGELOG.md`](skills/agentconfig/CHANGELOG.md).

---

## 5. Skill guides

Every skill follows the same pattern: **detect → ask → write a skeleton with a script → fill it in → validate with a script → report**. Steps marked ⛔ in each `SKILL.md` are hard stops: the skill waits for your answer before continuing. Scripts never overwrite existing files unless you explicitly allow it.

### 5.1 prd-writer

**Use it when** you need a PRD, want to turn a brief/meeting transcript/foreign-format PRD into a proper one, or need to revise an approved PRD.

**Example prompts**
- "Create a PRD for …" (new mode)
- "Turn this meeting transcript and brief into a PRD" + attach files (from-materials mode)
- "Revise the PRD: add WhatsApp reminders and drop the loyalty program" (revise mode)

**Flow**

| Phase | What happens | Your part |
|---|---|---|
| 1 Intake | Product, client, problem, users, goals, constraints, **project profile S/M/L**; creates `docs/prd/prd.md` and `_discovery.md` | Answer one message |
| 2 Discovery | Up to 6 rounds (business, users & roles, features & scope, flows & business rules, NFRs incl. **OWASP ASVS level** and AI usage, integrations & release), max 8 questions per round, each with a recommended default | ⛔ Answer each round, or say "use the defaults" (logged as `[ASUMSI]`) |
| 3 Outline | Modules with codes, FR titles with priority, NFR categories, metrics, out-of-scope | ⛔ Approve |
| 4 Draft | Full PRD, then `check-prd` | — |
| 5 Review | Stats, assumptions, open questions | ⛔ Iterate; each round bumps the draft version |
| 6 Hand-off | Client document (if a shared-doc tool is available, otherwise .docx/.pdf), approval → v1.0, then **design-tool choice**: Stitch · Figma (agent draws) · Figma (designer draws / existing design) · no custom design | ⛔ Choose |

**Output**
- `docs/prd/prd.md` — Part 1 for stakeholders (summary, problem, goals & metrics, personas, scope, user flows, timeline); Part 2 for developers (roles, functional requirements with user stories and Given/When/Then acceptance criteria including **misuse cases**, measurable NFRs, data, integrations, assumptions, open questions).
- `docs/prd/_discovery.md` — answers per round with sources, profile, outline decision, design decision.

**Validation:** `node ~/.claude/skills/prd-writer/scripts/check-prd.mjs --file docs/prd/prd.md` — errors for missing sections, FRs without acceptance criteria, invalid IDs, NFRs without measurable targets; warnings for vague targets, actors not in the role table, missing ASVS level, AI features without LLM NFRs, multi-role products without misuse criteria.

### 5.2 agentconfig

**Use it when** a repo exists (new or old) and you want coding agents to follow consistent standards plus project-specific knowledge.

**Example prompts:** "Set up agentconfig, the PRD is in docs/prd/prd.md" · "Audit this project and install agentconfig" · "Sync agentconfig to the latest version".

**Modes** (chosen automatically by `detect.mjs`, confirmed with you)

| Mode | When | Result |
|---|---|---|
| init | No `agentconfig/` yet | Standards copied, `project/` filled from the PRD and your answers |
| audit → init | Existing code (>40 source files) without `agentconfig/` | Read-only audit report first, then init from code + audit |
| sync | `agentconfig/` exists from an older template version | `standards/` updated to the template version; local edits reported as conflicts |

**Init flow**

1. **Detect** — project type (frontend-web / backend / fullstack), matching stack files, existing `AGENTS.md`/`CLAUDE.md`, git-ignored files. ⛔ Confirm type, stack, topology (sibling repos, API contract owner), PRD location.
2. **PRD quality check + technical gap check** — ⛔ answer numbered questions (database, auth, hosting, environments, ASVS level, AI usage, locale/timezone, testing tools, …), each with a default.
3. **Scaffold** — copies `standards/`, creates `project/` skeletons, backs up old agent instructions to `agentconfig/_audit/legacy/`, keeps framework-managed blocks (e.g. Next.js) in `AGENTS.md`.
4. **Fill** — `prd.md` → `technical-requirements.md` → `architecture.md` → `threat-model.md` → `decisions.md` → `design-system.md` / `api-contract.md` / `data-model.md` → `AGENTS.md`.
5. **Validate** — `check.mjs` until it passes.
6. **Report** — files, decisions (`D-xx`), TODOs, next steps (design skill, delivery plan).

**What the standards enforce (highlights)**
- **Simplicity first** (`coding-style.md`, `TU-01`–`TU-06`): state the approach before coding; stop and propose if a change touches >5 files or >~200 lines for one requirement; no unrequested options or abstractions; reuse before writing; size limits; efficient without premature optimization.
- **Security** (`security.md`, `testing/security.md`): OWASP Top 10:2025, API Security Top 10:2023, ASVS 5.0, WSTG; OWASP LLM Top 10:2026 and Agentic Top 10 when the product uses AI; a threat model per critical flow; security tests named by category.
- **Definition of Done**: type-check, lint, full test suite, build when needed, manual verification, simplicity review of the diff, docs updated.
- **Critical rules** in `AGENTS.md`: the 7 rules every agent must see even if it never opens the sub-files; copied to `.github/copilot-instructions.md` for Copilot (see [section 7](#7-using-other-coding-agents)).

**Scripts** (run from the repo root; `S=~/.claude/skills/agentconfig/scripts`)

```bash
node $S/detect.mjs   --target .
node $S/scaffold.mjs --target . --type fullstack --repo-name my-app --dry-run   # preview
node $S/scaffold.mjs --target . --type fullstack --repo-name my-app
node $S/scaffold.mjs --target . --mode sync --dry-run                           # sync preview
node $S/scaffold.mjs --target . --mode sync --force                             # after reviewing conflicts
node $S/scaffold.mjs --target . --mode agent-files                             # rewrite .github/copilot-instructions.md from AGENTS.md
node $S/check.mjs    --target .
```

### 5.3 stitch-design

**Use it when** the product has a UI and you chose Google Stitch.

**Example prompts:** "Create the Stitch prompts from the PRD" · "Review this Stitch result" + screenshot · "Bring the final Stitch design into the repo".

| Phase | What happens | Your part |
|---|---|---|
| 0 Prerequisites | Finds the PRD and `agentconfig/`; creates `docs/design/` | — |
| 1 Screen list | `screens.md`: one row per screen/modal with role, type (`page`/`modal` = dashboard, `public` = public page), FRs, batch | ⛔ Approve |
| 2 Visual brief | Style reference, primary color, font, UI language, platform | Answer |
| 3 Prompts | Batch 1 = design system + 1–2 key screens; later batches ≤5 screens with **Simplicity rules** (dashboard) or **Public page rules** (public) | Run the prompts in Stitch |
| 4 Review | Checks screenshots against the PRD: remove · add · simplify, with fix prompts | ⛔ Send screenshots until screens are Final |
| 5 Hand-off | Export (manual zip by default, or automated through the official `@google/stitch` CLI), tokens and class mapping into `agentconfig/project/design-system.md` | ⛔ Choose export path; approve tokens |
| 6 Build plan | `docs/design/build-plan.md` for the coding agent | — |

**Validation:** `node ~/.claude/skills/stitch-design/scripts/check-design.mjs --dir docs/design --prd docs/prd/prd.md [--stage prompts]` — screen IDs, batch size, MVP FRs without a screen, prompts containing the right rule block.

Automated export details and troubleshooting: [`skills/stitch-design/references/mcp-setup.md`](skills/stitch-design/references/mcp-setup.md). The remote Stitch MCP endpoint with an API-key header is **not** recommended for Claude Code.

### 5.4 figma-design

**Use it when** you chose Figma, or a designer/client already has a Figma file.

**Setup (once):**

```bash
claude plugin install figma@claude-plugins-official      # recommended: MCP + Figma's own skills
# or
claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp
```

Restart Claude Code → `/mcp` → authenticate `figma` in the browser. The skill runs integration checks F1–F5 (tools present, authenticated, **seat type**, file readable, write test) before doing any work.

| Mode | Who draws | Flow |
|---|---|---|
| Draw | The agent, on the Figma canvas | Screen list → design system (variables named like your code tokens + base components) → screens in rounds of ≤5 with screenshot review → hand-off |
| Review | A designer / existing file | Screen list matched against frames → findings per frame → hand-off |

**Output:** `docs/design/screens.md` (same format as Stitch), `figma.md` (file link, frame/node per screen, review log), `export/` (PNG of final frames), `build-plan.md`; tokens from Figma variables into `agentconfig/project/design-system.md`. The coding agent later calls `get_design_context` for each screen's node and adapts it to the repo's components — it never pastes generated code.

### 5.5 delivery-plan

**Use it when** you need numbers for a quote, a milestone plan with payment terms, a task breakdown for the coding agent, or a re-plan after a change request.

| Mode | Prompt example | Output |
|---|---|---|
| Estimate | "Give me a rough estimate for a quote; my day rate is …" | `docs/delivery/estimate.md` — min–max days per module (+ value only if you give a rate) |
| Plan | "Make the delivery plan. Start 2026-11-02, 3 days/week, DP 30%." | `plan.md` (2–5 demo-able milestones, gate, payment term, buffer) and `tasks.md` (`T-NNN`, ≤2 days each, FR/UI refs, dependencies) |
| Update | "The client added FR-BOOK-005; update the plan" | New tasks, cancelled tasks, new date projection, impact report |
| Issues | "Create GitHub issues for the open tasks" | Dry-run list first, then issues via `gh` after you approve |

The plan always counts non-coding work (setup, design review rounds, UAT, deploy, hand-over) and **security work** (CI dependency/secret scan, threat model and security tests per milestone, go-live security checklist).

**Scripts** (`D=~/.claude/skills/delivery-plan/scripts`)

```bash
node $D/new-plan.mjs  --product "Clinic Booking"            # plan.md + tasks.md
node $D/new-plan.mjs  --product "Clinic Booking" --estimate # estimate.md only
node $D/check-plan.mjs --prd docs/prd/prd.md --start 2026-11-02 --capacity 3 --holidays holidays-2026.txt
node $D/check-plan.mjs --start 2026-11-20 --capacity 3 --remaining   # re-project from remaining work
node $D/to-issues.mjs  --repo owner/repo            # dry-run
node $D/to-issues.mjs  --repo owner/repo --apply    # create issues
```

`--capacity` is effective working days per week (part-time is usually 2–3). The holidays file is one `YYYY-MM-DD` per line (national holidays and collective leave).

---

## 6. Shared conventions

**Status labels** (used in `agentconfig/` docs)

| Label | Meaning |
|---|---|
| `[TERBUKTI]` | Verified in code (with path) |
| `[DISIMPULKAN]` | Dominant pattern with exceptions |
| `[TIDAK ADA]` | Does not exist yet (TODO, never invented) |
| `[DEFAULT]` / `[KUSTOM]` | Same as framework boilerplate / deliberate deviation |
| `[PRD]` | Comes from the PRD, not built yet |
| `[KEPUTUSAN]` | Decided by you during setup or work |
| `[DESAIN]` | Comes from the final design (Stitch export or Figma) |
| `[ASUMSI]` | Default you accepted without confirmation |

**Project profiles** — S (landing page/prototype/small internal tool), M (MVP app, 1–3 months), L (multi-repo, sensitive data, >3 months). The profile decides which phases are mandatory; see [`LIFECYCLE.md`](LIFECYCLE.md).

**Rule IDs** — standards cite IDs (`U-`, `S-`, `BU-`, `BS-`, `TU-`) so every rule can be traced to the audit or decision that created it. Index: [`skills/agentconfig/registry/rules.md`](skills/agentconfig/registry/rules.md).

**Precedence** — tool config (tsconfig, lint) > `agentconfig/project/` > `agentconfig/standards/`. Any project-level deviation is recorded in `project/decisions.md`; `standards/` is never edited per project.

---

## 7. Using other coding agents

The files the skills produce are plain Markdown, so other agents can work in the same repo:

| Agent | What it reads | Set up by `agentconfig` |
|---|---|---|
| Claude Code | `CLAUDE.md` → `@AGENTS.md` | `CLAUDE.md` |
| Cline | `AGENTS.md` directly (also `.clinerules/`, `.cursorrules`, `.windsurfrules`) | nothing extra |
| GitHub Copilot | `.github/copilot-instructions.md` (most reliable across Copilot features) | `.github/copilot-instructions.md`: pointer to `AGENTS.md` + a copy of the **Critical rules** block |

- The **Critical rules** block in `AGENTS.md` (7 rules: read the referenced docs, simplest code, server-side authorization and no secrets, no risky DB operations without confirmation, don't edit `standards/`, run the Definition of Done, stop at every ⛔) is the single source. After editing it, run `node ~/.claude/skills/agentconfig/scripts/scaffold.mjs --target . --mode agent-files`; `check.mjs` fails if the Copilot copy drifts.
- Keep one set of rules per repo: `check.mjs` warns when `.cursorrules`, `.windsurfrules`, `.clinerules`, or `GEMINI.md` contain their own rules instead of pointing to `AGENTS.md`. In Cline, make sure the `AGENTS.md` rule is toggled on in the Rules panel.
- The skills themselves (`SKILL.md` flows) are written for Claude Code. In other agents, ask: *"Read `~/.claude/agentconfig-template/skills/<skill>/SKILL.md` and follow it step by step, stopping at every ⛔."* Slash commands like `/agentconfig` won't exist there, and some agents tend to skip stops — remind them.

## 8. Using the scripts without Claude Code

All scripts are plain Node (≥18) with no dependencies, so other agents or humans can run them directly — see the command blocks in each skill guide above. The `<!-- AI: … -->` markers in generated skeletons describe what to write in each section; `check*.mjs` fails while any marker remains.

---

## 9. Maintaining the templates

1. Edit files under `skills/<skill>/` (standards live in `skills/agentconfig/templates/agentconfig/standards/`). New rules should come from a real audit or an explicit decision.
2. If standards changed: `node skills/agentconfig/scripts/build-registry.mjs`.
3. Bump the skill's `VERSION` (patch = wording/examples, minor = new or changed rules, major = structure change) and add a `CHANGELOG.md` entry including **"When syncing"** instructions for existing repos.
4. Open a PR, merge, then run `agentconfig` sync in each project repo.

Adding a new skill: create `skills/<name>/SKILL.md` (+ `VERSION`, `CHANGELOG.md`, `README.md`); `install.sh` picks it up automatically. Add it to the table at the top of this README and to `LIFECYCLE.md`.

---

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| Skills don't appear after restart | Run `install.sh --copy` (symlinks may not be followed), restart again |
| Installer prints "clone lama" warning | Remove the old `~/.claude/skills/agentconfig` clone, rerun `install.sh` |
| `scaffold` says `agentconfig/standards/` already exists | Use sync mode instead of init |
| Sync reports conflicts | Expected for repos created before `.template-lock.json` or after a standards change; review the diff, move any intentional local rule to `project/decisions.md`, then rerun with `--force` |
| `check.mjs` says the Copilot instructions differ from `AGENTS.md` | Run `scaffold.mjs --target . --mode agent-files` |
| `check.mjs` fails on `<!-- AI:` markers | Ask Claude to finish filling the listed files |
| `AGENTS.md`/`agentconfig/` ignored by git | Remove the matching lines from `.gitignore` (the skill asks before touching it) |
| Stitch export error *"Incompatible auth server: does not support dynamic client registration"* | Don't use the remote Stitch MCP with an API key; use the official CLI path in `mcp-setup.md` |
| Figma MCP stops working after a few calls | Your seat is Starter/View/Collab (6 calls/month); use a Dev/Full seat or review mode with manual screenshots |

---

## 11. Repository layout

```
README.md            this guide
LIFECYCLE.md         phases, artifacts, gates, profiles, interim UAT/release checklists
install.sh           installs every skills/* folder into ~/.claude/skills
skills/
  prd-writer/        SKILL.md, templates/, references/, scripts/ (new-prd, check-prd)
  agentconfig/       SKILL.md, templates/ (standards + project skeletons), references/, registry/, scripts/ (detect, scaffold, check, build-registry)
  stitch-design/     SKILL.md, templates/, references/, scripts/ (new-design, check-design) — shared screen tooling
  figma-design/      SKILL.md, templates/, references/, scripts/ (new-design) — reuses stitch-design's shared parts
  delivery-plan/     SKILL.md, templates/, references/, scripts/ (new-plan, check-plan, to-issues)
```

Each skill has its own `VERSION` and `CHANGELOG.md`.
