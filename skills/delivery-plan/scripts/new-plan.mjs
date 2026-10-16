#!/usr/bin/env node
// Membuat kerangka docs/delivery/. Tidak menimpa file yang sudah ada.
// Pakai: node new-plan.mjs --product "<nama>" [--out docs/delivery] [--estimate]
//   tanpa --estimate: plan.md + tasks.md (mode rencana)
//   dengan --estimate: estimate.md saja (mode estimasi)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) args[argv[i].slice(2)] = true;
  else { args[argv[i].slice(2)] = next; i++; }
}
if (!args.product) { console.error("ERROR: --product wajib"); process.exit(2); }

const out = path.resolve(args.out || "docs/delivery");
const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const tokens = { PRODUCT_NAME: args.product, DATE: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` };
const render = (t) => t.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));

const names = args.estimate ? ["estimate.md"] : ["plan.md", "tasks.md"];
const result = { out, created: [], skipped: [] };
fs.mkdirSync(out, { recursive: true });
for (const name of names) {
  const dest = path.join(out, name);
  if (fs.existsSync(dest)) { result.skipped.push(`${name} (sudah ada)`); continue; }
  fs.writeFileSync(dest, render(fs.readFileSync(path.join(SKILL_ROOT, "templates", `${name}.tmpl`), "utf8")));
  result.created.push(name);
}
console.log(JSON.stringify(result, null, 2));
