#!/usr/bin/env node
// Menyalin template agentconfig ke project.
//
// Mode init (project belum punya agentconfig/):
//   node scaffold.mjs --target <dir> --type <frontend-web|backend|fullstack> --repo-name <nama> [--dry-run]
// Mode sync (project sudah punya agentconfig/, perbarui standards/ ke versi template ini):
//   node scaffold.mjs --target <dir> --mode sync [--force] [--dry-run]
//
// Aturan: tidak pernah menimpa file project/ atau file yang sudah ada tanpa izin.
// AGENTS.md/CLAUDE.md lama dicadangkan ke agentconfig/_audit/legacy/ sebelum diganti.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  SKILL_ROOT, TEMPLATES, TEMPLATE_VERSION, TYPES, parseArgs, fail, exists, walk, sha, today,
  frameworkBlocks, render, readJson,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const target = path.resolve(args.target || process.cwd());
const mode = args.mode || "init";
const dryRun = Boolean(args["dry-run"]);
const force = Boolean(args.force);
if (!exists(target)) fail(`target tidak ditemukan: ${target}`);

const summary = { mode, dryRun, templateVersion: TEMPLATE_VERSION, created: [], updated: [], skipped: [], backedUp: [], conflicts: [], notes: [] };
const SRC_STANDARDS = path.join(TEMPLATES, "agentconfig", "standards");
const DST_AC = path.join(target, "agentconfig");
const DST_STANDARDS = path.join(DST_AC, "standards");
const LOCK = path.join(DST_AC, ".template-lock.json");

function write(rel, content) {
  const full = path.join(target, rel);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
}
function copy(srcFull, rel) {
  write(rel, fs.readFileSync(srcFull));
}
function writeLock() {
  const files = {};
  for (const f of walk(SRC_STANDARDS)) files[f] = sha(path.join(SRC_STANDARDS, f));
  const lock = { templateVersion: TEMPLATE_VERSION, writtenAt: today(), standards: files };
  write("agentconfig/.template-lock.json", JSON.stringify(lock, null, 2) + "\n");
}

function detect() {
  const out = execFileSync(process.execPath, [path.join(SKILL_ROOT, "scripts", "detect.mjs"), "--target", target], { encoding: "utf8" });
  return JSON.parse(out);
}

function commandsTable(c) {
  const rows = [
    ["Install", c.install], ["Dev", c.dev], ["Build", c.build], ["Start (production)", c.start],
    ["Type-check", c.typecheck], ["Lint", c.lint], ["Test", c.test], ["Test e2e", c.e2e], ["Format", c.format],
  ];
  const lines = ["| Tujuan | Command |", "|---|---|"];
  for (const [label, value] of rows) {
    if (value) lines.push(`| ${label} | \`${value}\` |`);
    else if (["Type-check", "Lint", "Test"].includes(label)) lines.push(`| ${label} | TODO — belum dikonfigurasi |`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
if (mode === "init") {
  const type = args.type;
  if (!TYPES.includes(type)) fail(`--type wajib salah satu: ${TYPES.join(", ")}`);
  const repoName = args["repo-name"] || readJson(path.join(target, "package.json"))?.name || path.basename(target);
  if (exists(DST_STANDARDS)) fail("agentconfig/standards/ sudah ada. Pakai --mode sync untuk memperbarui.");

  const d = detect();
  const stackFiles = d.stacks.map((s) => s.file);
  const tokens = {
    REPO_NAME: repoName,
    DATE: today(),
    TEMPLATE_VERSION,
    PROJECT_TYPE: type,
    COMMANDS_TABLE: commandsTable(d.commands),
    STACK_FILES: stackFiles.length ? stackFiles.map((f) => `- \`standards/stack/${f}\``).join("\n") : "- TODO — belum ada file stack yang cocok (lihat `standards/stack/README.md`)",
    STACK_FILE_NAMES: stackFiles.length ? stackFiles.map((f) => `\`${f}\``).join(", ") : "TODO",
    FRAMEWORK_BLOCKS: "",
  };

  // 1. standards/ — salin utuh, identik dengan template.
  for (const f of walk(SRC_STANDARDS)) {
    copy(path.join(SRC_STANDARDS, f), `agentconfig/standards/${f}`);
    summary.created.push(`agentconfig/standards/${f}`);
  }
  writeLock();
  summary.created.push("agentconfig/.template-lock.json");

  // 2. File agentconfig lain + project/ sesuai tipe.
  const projectFiles = {
    base: ["README.md", "prd.md", "technical-requirements.md", "architecture.md", "threat-model.md", "decisions.md"],
    "frontend-web": ["design-system.md", "api-contract.consumer.md"],
    backend: ["api-contract.owner.md", "data-model.md"],
    fullstack: ["design-system.md", "api-contract.owner.md", "data-model.md"],
  };
  const mapRows = {
    "prd.md": "sebelum menambah/mengubah fitur atau alur user; saat menentukan alur kritis yang wajib diuji",
    "technical-requirements.md": "saat butuh env var, versi, lingkungan, locale, NFR, baseline security, syarat go-live, atau daftar P0/P1/P2",
    "architecture.md": "sebelum menambah file/folder/fitur/provider/middleware/integrasi, atau mengubah alur data, auth, logging, deploy",
    "threat-model.md": "sebelum membangun/mengubah alur kritis, auth/otorisasi, data sensitif, pembayaran, upload, atau fitur AI",
    "design-system.md": "sebelum mengubah UI, warna, font, atau menambah komponen reusable",
    "api-contract.consumer.md": "sebelum memanggil endpoint baru atau mengubah service/adapter",
    "api-contract.owner.md": "sebelum membuat/mengubah endpoint, guard role, bentuk request/response, atau konstanta yang dipakai konsumen",
    "data-model.md": "sebelum mengubah schema, membuat migration, menulis query, atau menjalankan seed",
    "decisions.md": "sebelum mengubah pola yang sudah ada, atau saat mengambil keputusan teknis baru",
  };
  const selected = [...projectFiles.base.filter((f) => f !== "README.md"), ...projectFiles[type]];
  const order = Object.keys(mapRows);
  tokens.PROJECT_MAP_ROWS = selected
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((f) => `| \`${f.replace(/\.(consumer|owner)\.md$/, ".md")}\` | ${mapRows[f]} |`)
    .join("\n");

  const plan = [
    ["agentconfig/README.md.tmpl", "agentconfig/README.md"],
    ["agentconfig/_audit/README.md.tmpl", "agentconfig/_audit/README.md"],
    ...[...projectFiles.base, ...projectFiles[type]].map((f) => [
      `agentconfig/project/${f}.tmpl`,
      `agentconfig/project/${f.replace(/\.(consumer|owner)\.md$/, ".md")}`,
    ]),
  ];
  for (const [src, dst] of plan) {
    if (exists(path.join(target, dst))) { summary.skipped.push(`${dst} (sudah ada)`); continue; }
    write(dst, render(fs.readFileSync(path.join(TEMPLATES, src), "utf8"), tokens));
    summary.created.push(dst);
  }

  // 3. AGENTS.md — pertahankan blok framework, cadangkan versi lama.
  const agentsPath = path.join(target, "AGENTS.md");
  if (exists(agentsPath)) {
    const old = fs.readFileSync(agentsPath, "utf8");
    tokens.FRAMEWORK_BLOCKS = frameworkBlocks(old).join("\n\n");
    write("agentconfig/_audit/legacy/AGENTS.md", old);
    summary.backedUp.push("AGENTS.md → agentconfig/_audit/legacy/AGENTS.md");
  }
  const agentsTmpl = render(fs.readFileSync(path.join(TEMPLATES, "root", "AGENTS.md.tmpl"), "utf8"), tokens)
    .replace(/^\n+/, "");
  write("AGENTS.md", agentsTmpl);
  summary.created.push("AGENTS.md");

  // 4. CLAUDE.md — hanya router.
  const claudePath = path.join(target, "CLAUDE.md");
  if (exists(claudePath) && fs.readFileSync(claudePath, "utf8").trim() !== "@AGENTS.md") {
    write("agentconfig/_audit/legacy/CLAUDE.md", fs.readFileSync(claudePath));
    summary.backedUp.push("CLAUDE.md → agentconfig/_audit/legacy/CLAUDE.md");
  }
  write("CLAUDE.md", "@AGENTS.md\n");
  summary.created.push("CLAUDE.md");

  summary.detected = { type: d.typeGuess, stacks: d.stacks, uncatalogued: d.uncatalogued, gitignored: d.existing.gitignored, otherInstructionFiles: d.existing.otherInstructionFiles };
  if (d.existing.gitignored.length) summary.notes.push(`File berikut di-ignore git: ${d.existing.gitignored.join(", ")}. Tanyakan user sebelum mengubah .gitignore.`);
  if (d.uncatalogued.length) summary.notes.push(`Dependency tanpa file stack: ${d.uncatalogued.join(", ")}. Lihat references/stack-catalog.md.`);
  if (summary.backedUp.length) summary.notes.push("Instruksi lama dicadangkan di agentconfig/_audit/legacy/. Pindahkan aturan yang masih relevan, lalu tanyakan user sebelum menghapus cadangan.");
}

// ---------------------------------------------------------------------------
else if (mode === "sync") {
  if (!exists(DST_STANDARDS)) fail("agentconfig/standards/ belum ada. Pakai --mode init.");
  const lock = readJson(LOCK);
  if (!lock) summary.notes.push("Tidak ada agentconfig/.template-lock.json (project dibuat sebelum skill ini). Perubahan lokal di standards/ tidak bisa dibedakan dari versi lama; tinjau daftar 'conflicts' lalu ulangi dengan --force.");

  const srcFiles = walk(SRC_STANDARDS);
  const dstFiles = walk(DST_STANDARDS);
  const actions = [];
  for (const f of srcFiles) {
    const src = path.join(SRC_STANDARDS, f);
    const dst = path.join(DST_STANDARDS, f);
    const rel = `agentconfig/standards/${f}`;
    if (!exists(dst)) { actions.push([src, rel, "created"]); continue; }
    const dstSha = sha(dst);
    if (dstSha === sha(src)) continue;
    const lockedSha = lock?.standards?.[f];
    // Tanpa lock, atau isi berbeda dari yang tercatat di lock → kemungkinan diedit lokal.
    if (!lockedSha || lockedSha !== dstSha) summary.conflicts.push(rel);
    actions.push([src, rel, "updated"]);
  }
  for (const f of dstFiles.filter((f) => !srcFiles.includes(f))) {
    summary.notes.push(`agentconfig/standards/${f} tidak ada di template ${TEMPLATE_VERSION} (dihapus/dipindah di template, atau tambahan lokal). Tidak dihapus otomatis.`);
  }

  // Semua atau tidak sama sekali: jika ada konflik tanpa --force, tidak ada file yang ditulis.
  const apply = summary.conflicts.length === 0 || force;
  if (apply) {
    for (const [src, rel, kind] of actions) { copy(src, rel); summary[kind].push(rel); }
    writeLock();
    // Catat versi di agentconfig/README.md.
    const readmePath = path.join(DST_AC, "README.md");
    if (exists(readmePath)) {
      let text = fs.readFileSync(readmePath, "utf8");
      const re = /(Versi template yang dipakai:\*{0,2}\s*)`?v\d+\.\d+(?:\.\d+)?`?/;
      if (re.test(text)) text = text.replace(re, `$1${TEMPLATE_VERSION}`);
      else text = text.replace(/\n## /, `\n- **Versi template yang dipakai:** ${TEMPLATE_VERSION} (sync ${today()}).\n\n## `);
      write("agentconfig/README.md", text);
      summary.updated.push("agentconfig/README.md (versi template)");
    }
  } else {
    summary.planned = actions.map(([, rel, kind]) => `${kind}: ${rel}`);
    summary.notes.push(`${summary.conflicts.length} file berbeda dari template dan mungkin diedit lokal. Tidak ada file yang ditulis. Tampilkan diff ke user (lihat 'planned'); jika setuju, ulangi dengan --force.`);
  }
} else {
  fail("--mode harus init atau sync");
}

console.log(JSON.stringify(summary, null, 2));
