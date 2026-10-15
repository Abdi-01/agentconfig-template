#!/usr/bin/env node
// Deteksi tipe project, stack, command, dan kondisi instruksi agent yang sudah ada.
// Read-only. Output: JSON ke stdout.
// Pakai: node detect.mjs --target <dir>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  SKILL_ROOT, TEMPLATE_VERSION, parseArgs, fail, readJson, exists, allDeps, majorOf,
  packageManager, runScript, frameworkBlocks, stripFrameworkBlocks, readAgentconfigVersion,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const target = path.resolve(args.target || process.cwd());
if (!exists(target)) fail(`target tidak ditemukan: ${target}`);

const catalog = readJson(path.join(SKILL_ROOT, "scripts", "stack-catalog.json"));
const pkg = readJson(path.join(target, "package.json"));
const deps = allDeps(pkg);
const has = (d) => d in deps;

// --- Tipe project ---------------------------------------------------------
const fe = catalog.frontendSignals.filter(has);
const be = catalog.backendSignals.filter(has);
const routeHandlerDirs = ["src/app/api", "app/api", "src/pages/api", "pages/api"].filter((d) => exists(path.join(target, d)));
let typeGuess = null;
const reasons = [];
let typeAmbiguous = false;
if (fe.length && be.length) {
  typeGuess = "fullstack";
  reasons.push(`frontend: ${fe.join(", ")}`, `backend: ${be.join(", ")}`);
} else if (fe.length) {
  typeGuess = "frontend-web";
  reasons.push(`frontend: ${fe.join(", ")}`);
  if (routeHandlerDirs.length) {
    // Route handler kecil (proxy, revalidate, flag) belum tentu berarti fullstack.
    typeAmbiguous = true;
    reasons.push(`ada route handler (${routeHandlerDirs.join(", ")}) tanpa dependency backend — tanyakan: hanya BFF/proxy (frontend-web) atau API milik sendiri (fullstack)?`);
  }
} else if (be.length) {
  typeGuess = "backend";
  reasons.push(`backend: ${be.join(", ")}`);
} else {
  reasons.push(pkg ? "tidak ada sinyal framework di package.json" : "package.json tidak ada");
}
const sides = typeGuess === "fullstack" ? ["frontend", "backend"] : typeGuess === "frontend-web" ? ["frontend"] : typeGuess === "backend" ? ["backend"] : [];

// --- Stack -------------------------------------------------------------------
const stacks = [];
for (const s of catalog.stacks) {
  const all = s.match.all || [];
  const any = s.match.any || [];
  const ok = all.every(has) && (any.length === 0 || any.some(has));
  if (!ok) continue;
  if (s.requiresSide && !sides.includes(s.requiresSide)) continue;
  const versionNotes = [];
  for (const [dep, baseMajor] of Object.entries(s.baseline || {})) {
    if (!has(dep)) continue;
    const major = majorOf(deps[dep]);
    if (major !== null && major !== baseMajor) versionNotes.push(`${dep} ${deps[dep]} ≠ baseline ${baseMajor}.x`);
  }
  stacks.push({ file: s.file, side: s.side, versionMatch: versionNotes.length === 0, versionNotes });
}
const uncatalogued = catalog.uncataloguedNotable.filter(has).map((d) => `${d}@${deps[d]}`);

// --- Command --------------------------------------------------------------
const pm = packageManager(target);
const scripts = pkg?.scripts || {};
const hasTsconfig = exists(path.join(target, "tsconfig.json"));
const cmd = (name, fallback = null) => (scripts[name] ? runScript(pm, name) : fallback);
const commands = {
  install: pkg ? `${pm} install` : null,
  dev: cmd("dev"),
  build: cmd("build"),
  start: cmd("start"),
  typecheck: cmd("typecheck", hasTsconfig ? "npx tsc --noEmit" : null),
  lint: cmd("lint"),
  test: scripts.test && !/no test specified/.test(scripts.test) ? runScript(pm, "test") : null,
  e2e: cmd("test:e2e"),
  format: cmd("format"),
};

// --- Instruksi agent yang sudah ada ---------------------------------------
const read = (f) => (exists(path.join(target, f)) ? fs.readFileSync(path.join(target, f), "utf8") : null);
const agents = read("AGENTS.md");
const claude = read("CLAUDE.md");
const otherInstructionFiles = [
  ".cursorrules", ".cursor", ".github/copilot-instructions.md", ".windsurfrules", "GEMINI.md", ".claude/CLAUDE.md", "docs/AGENTS.md",
].filter((f) => exists(path.join(target, f)));

let gitignored = [];
let isGitRepo = false;
try {
  execFileSync("git", ["-C", target, "rev-parse", "--is-inside-work-tree"], { stdio: "pipe" });
  isGitRepo = true;
  const probe = ["AGENTS.md", "CLAUDE.md", "agentconfig/README.md", "agentconfig/standards/README.md"];
  for (const p of probe) {
    try {
      execFileSync("git", ["-C", target, "check-ignore", "-q", p], { stdio: "pipe" });
      gitignored.push(p);
    } catch { /* tidak di-ignore */ }
  }
} catch { /* bukan git repo */ }

// --- Ukuran kode (untuk menyarankan mode audit) ---------------------------
function countSource(dir, depth = 0) {
  if (depth > 6 || !exists(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".next", "dist", "build", "coverage", "agentconfig"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) n += countSource(full, depth + 1);
    else if (/\.(tsx?|jsx?|mjs|cjs|vue|svelte|py|go)$/.test(e.name)) n += 1;
  }
  return n;
}
const sourceFiles = countSource(target);

const existingVersion = readAgentconfigVersion(target);
let suggestedMode = "init";
if (existingVersion) suggestedMode = "sync";
else if (sourceFiles > 40) suggestedMode = "audit";

const result = {
  target,
  templateVersion: TEMPLATE_VERSION,
  suggestedMode,
  package: pkg ? { name: pkg.name, engines: pkg.engines || null, packageManager: pm } : null,
  typeGuess,
  typeAmbiguous,
  typeReasons: reasons,
  stacks,
  uncatalogued,
  commands,
  sourceFiles,
  existing: {
    agentconfigVersion: existingVersion,
    agentsMd: agents === null ? null : {
      frameworkBlocks: frameworkBlocks(agents).map((b) => b.match(/BEGIN:([\w-]+)/)[1]),
      otherContentLines: stripFrameworkBlocks(agents).split("\n").filter((l) => l.trim()).length,
    },
    claudeMd: claude === null ? null : { isRouterOnly: claude.trim() === "@AGENTS.md", lines: claude.split("\n").length },
    otherInstructionFiles,
    isGitRepo,
    gitignored,
  },
};
console.log(JSON.stringify(result, null, 2));
