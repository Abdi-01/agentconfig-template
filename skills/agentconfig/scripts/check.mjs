#!/usr/bin/env node
// Validasi hasil agentconfig di project. Read-only.
// Pakai: node check.mjs --target <dir>
// Exit 0 = lulus (boleh ada warning), 1 = ada error.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { TEMPLATES, TEMPLATE_VERSION, parseArgs, fail, exists, walk, sha, stripFrameworkBlocks, readAgentconfigVersion } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const target = path.resolve(args.target || process.cwd());
if (!exists(target)) fail(`target tidak ditemukan: ${target}`);

const errors = [];
const warnings = [];
const read = (rel) => fs.readFileSync(path.join(target, rel), "utf8");

// 1. File wajib.
for (const f of ["AGENTS.md", "CLAUDE.md", "agentconfig/README.md", "agentconfig/standards/README.md", "agentconfig/project/README.md"]) {
  if (!exists(path.join(target, f))) errors.push(`File wajib tidak ada: ${f}`);
}

// 2. CLAUDE.md hanya router.
if (exists(path.join(target, "CLAUDE.md")) && read("CLAUDE.md").trim() !== "@AGENTS.md") {
  errors.push("CLAUDE.md harus hanya berisi `@AGENTS.md`.");
}

// 3. AGENTS.md ringkas (di luar blok framework).
if (exists(path.join(target, "AGENTS.md"))) {
  const lines = stripFrameworkBlocks(read("AGENTS.md")).split("\n").length;
  if (lines > 100) errors.push(`AGENTS.md ${lines} baris (maks. 100 di luar blok framework).`);
}

// 3b. Blok aturan kritis dan salinannya untuk agent lain.
const CRITICAL = /<!-- BEGIN:agentconfig-critical -->[\s\S]*?<!-- END:agentconfig-critical -->/;
const agentsBlock = exists(path.join(target, "AGENTS.md")) ? (read("AGENTS.md").match(CRITICAL) || [])[0] : null;
if (exists(path.join(target, "AGENTS.md")) && !agentsBlock) warnings.push("AGENTS.md belum punya blok aturan kritis (template v0.6.0) — salin dari templates/root/AGENTS.md.tmpl.");
const copilot = ".github/copilot-instructions.md";
if (exists(path.join(target, copilot))) {
  const copy = (read(copilot).match(CRITICAL) || [])[0];
  if (!copy) warnings.push(`${copilot} tidak memuat blok aturan kritis — jalankan scaffold.mjs --mode agent-files.`);
  else if (agentsBlock && copy !== agentsBlock) errors.push(`${copilot} berbeda dari blok aturan kritis di AGENTS.md — jalankan scaffold.mjs --mode agent-files.`);
}
// Cline juga membaca .cursorrules/.windsurfrules; aturan di sana bisa bertentangan dengan AGENTS.md.
for (const f of [".cursorrules", ".windsurfrules", ".clinerules", "GEMINI.md"]) {
  const p = path.join(target, f);
  if (exists(p) && fs.statSync(p).isFile() && !/AGENTS\.md/.test(fs.readFileSync(p, "utf8"))) warnings.push(`${f} berisi aturan sendiri tanpa merujuk AGENTS.md — pindahkan aturannya ke agentconfig/ dan isi file ini dengan rujukan ke AGENTS.md.`);
}

// 4. standards/ identik dengan template.
const srcStd = path.join(TEMPLATES, "agentconfig", "standards");
const dstStd = path.join(target, "agentconfig", "standards");
if (exists(dstStd)) {
  const src = walk(srcStd);
  const dst = walk(dstStd);
  const missing = src.filter((f) => !dst.includes(f));
  const extra = dst.filter((f) => !src.includes(f));
  const changed = src.filter((f) => dst.includes(f) && sha(path.join(srcStd, f)) !== sha(path.join(dstStd, f)));
  const version = readAgentconfigVersion(target);
  const label = `standards/ vs template ${TEMPLATE_VERSION} (project mencatat ${version ?? "tanpa versi"})`;
  if (missing.length) errors.push(`${label}: file hilang: ${missing.join(", ")}`);
  if (changed.length) errors.push(`${label}: isi berbeda: ${changed.join(", ")}. Jangan edit standards/ per project; catat penyimpangan di project/decisions.md, atau jalankan sync.`);
  if (extra.length) warnings.push(`${label}: file tambahan: ${extra.join(", ")}`);
}

// 5. Placeholder/penanda AI yang tertinggal + format pembuka file.
const docFiles = ["AGENTS.md", ...walk(path.join(target, "agentconfig")).map((f) => `agentconfig/${f}`)]
  .filter((f) => f.endsWith(".md") && !f.includes("/_audit/legacy/") && exists(path.join(target, f)));
let todoCount = 0;
for (const f of docFiles) {
  const text = read(f);
  const tokens = text.match(/\{\{[A-Z_]+\}\}/g);
  if (tokens) errors.push(`${f}: placeholder belum diisi: ${[...new Set(tokens)].join(", ")}`);
  const aiMarks = (text.match(/<!-- AI:/g) || []).length;
  if (aiMarks) errors.push(`${f}: ${aiMarks} penanda <!-- AI: ... --> belum diganti isi.`);
  todoCount += (text.match(/\bTODO\b/g) || []).length;
  if (f.startsWith("agentconfig/") && !f.startsWith("agentconfig/standards/")) {
    const body = stripFrameworkBlocks(text).split("\n").filter((l) => l.trim());
    if (!body[0]?.startsWith("# ")) warnings.push(`${f}: baris pertama sebaiknya judul H1.`);
    else if (!body[1] || body[1].startsWith("#") || body[1].startsWith("|")) warnings.push(`${f}: setelah judul, tulis 1–2 kalimat tujuan file dan kapan dibaca.`);
  }
}

// 6. architecture.md mencatat file stack yang dipakai, dan file itu ada.
const arch = path.join(target, "agentconfig/project/architecture.md");
if (exists(arch)) {
  const refs = [...read("agentconfig/project/architecture.md").matchAll(/stack\/([\w.-]+\.md)/g)].map((m) => m[1]);
  if (!refs.length) warnings.push("project/architecture.md belum menyebut file `standards/stack/*.md` yang dipakai repo ini.");
  for (const r of refs) if (!exists(path.join(dstStd, "stack", r))) errors.push(`project/architecture.md merujuk stack/${r} yang tidak ada.`);
}

// 7. Tidak di-ignore git.
try {
  execFileSync("git", ["-C", target, "rev-parse", "--is-inside-work-tree"], { stdio: "pipe" });
  for (const p of ["AGENTS.md", "CLAUDE.md", "agentconfig/README.md", "agentconfig/standards/README.md", "agentconfig/project/README.md"]) {
    try { execFileSync("git", ["-C", target, "check-ignore", "-q", p], { stdio: "pipe" }); errors.push(`${p} di-ignore oleh .gitignore.`); } catch { /* ok */ }
  }
} catch { warnings.push("Bukan git repo; pengecekan .gitignore dilewati."); }

const result = { target, templateVersion: TEMPLATE_VERSION, ok: errors.length === 0, errors, warnings, todoCount };
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length ? 1 : 0);
