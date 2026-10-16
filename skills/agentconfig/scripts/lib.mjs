// Helper bersama untuk script agentconfig. Tanpa dependency eksternal (Node >= 18).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const TEMPLATES = path.join(SKILL_ROOT, "templates");
export const TEMPLATE_VERSION = "v" + fs.readFileSync(path.join(SKILL_ROOT, "VERSION"), "utf8").trim();

export const TYPES = ["frontend-web", "backend", "fullstack"];

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

export function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(2);
}

export function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

export function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

export function walk(dir, base = dir) {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out.sort();
}

export function sha(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function today() {
  // Tanggal lokal mesin user, format YYYY-MM-DD.
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function majorOf(range) {
  if (!range || typeof range !== "string") return null;
  const m = range.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export function allDeps(pkg) {
  return { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}), ...(pkg?.peerDependencies || {}) };
}

export function packageManager(target) {
  if (exists(path.join(target, "pnpm-lock.yaml"))) return "pnpm";
  if (exists(path.join(target, "yarn.lock"))) return "yarn";
  if (exists(path.join(target, "bun.lockb")) || exists(path.join(target, "bun.lock"))) return "bun";
  return "npm";
}

export function runScript(pm, name) {
  return pm === "npm" ? (name === "test" ? "npm test" : `npm run ${name}`) : `${pm} ${name}`;
}

// Blok yang ditulis otomatis oleh framework (mis. `next dev`) di AGENTS.md.
// Blok milik template sendiri (`agentconfig-*`) bukan blok framework.
const FRAMEWORK_BLOCK = /<!-- BEGIN:((?!agentconfig-)[\w-]+) -->[\s\S]*?<!-- END:\1 -->/g;

export function frameworkBlocks(text) {
  return text ? [...text.matchAll(FRAMEWORK_BLOCK)].map((m) => m[0]) : [];
}

export function stripFrameworkBlocks(text) {
  return text.replace(FRAMEWORK_BLOCK, "").trim();
}

export function render(text, tokens) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (all, key) => (key in tokens ? tokens[key] : all));
}

export function readAgentconfigVersion(target) {
  const readme = path.join(target, "agentconfig", "README.md");
  if (!exists(readme)) return null;
  const text = fs.readFileSync(readme, "utf8");
  const m = text.match(/Versi template[^:]*:\*{0,2}\s*`?(v\d+\.\d+(?:\.\d+)?)/i);
  return m ? m[1] : "tidak terbaca";
}
