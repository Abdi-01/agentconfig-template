#!/usr/bin/env node
// Membuat kerangka docs/design/ untuk alur Figma: screens.md (format bersama dari stitch-design),
// figma.md, export/README.md. Tidak menimpa file yang sudah ada.
// Pakai: node new-design.mjs --product "<nama>" [--out docs/design] [--prd docs/prd/prd.md] [--figma-url <link>]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = path.resolve(SKILL_ROOT, "..", "stitch-design", "templates", "screens.md.tmpl");
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) args[argv[i].slice(2)] = true;
  else { args[argv[i].slice(2)] = next; i++; }
}
if (!args.product) { console.error("ERROR: --product wajib"); process.exit(2); }
if (!fs.existsSync(SHARED)) { console.error(`ERROR: template bersama tidak ditemukan: ${SHARED} (pasang skill stitch-design dari repo yang sama)`); process.exit(2); }

const out = path.resolve(args.out || "docs/design");
const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const tokens = {
  PRODUCT_NAME: args.product,
  PRD_PATH: args.prd || "docs/prd/prd.md",
  FIGMA_URL: args["figma-url"] || "TODO — link file Figma",
  DATE: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
};
const render = (t) => t.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));

const result = { out, created: [], skipped: [] };
fs.mkdirSync(path.join(out, "export"), { recursive: true });

const files = [
  ["screens.md", SHARED],
  ["figma.md", path.join(SKILL_ROOT, "templates", "figma.md.tmpl")],
];
for (const [name, src] of files) {
  const dest = path.join(out, name);
  if (fs.existsSync(dest)) { result.skipped.push(`${name} (sudah ada)`); continue; }
  fs.writeFileSync(dest, render(fs.readFileSync(src, "utf8")));
  result.created.push(name);
}

const exportReadme = path.join(out, "export", "README.md");
if (fs.existsSync(exportReadme)) result.skipped.push("export/README.md (sudah ada)");
else {
  fs.writeFileSync(exportReadme, `# Export desain — ${tokens.PRODUCT_NAME}

Screenshot frame Figma (dan snapshot \`get_design_context\` bila diminta) sebagai **referensi visual**. Tidak di-import oleh kode dan tidak diedit; timpa file saat desain diperbarui. Sumber utama tetap file Figma (link per layar di \`../figma.md\`).

- Satu subfolder per batch/putaran: \`batch-1/\`, \`batch-2/\`, …
- Nama file diawali ID layar dari \`../screens.md\`: \`UI-01-login.png\`.
- Token dan pemetaan nama variable → token project ada di \`agentconfig/project/design-system.md\`.

## Integrasi

Jangan menulis email atau token di sini.

| Tanggal | Tool | Server (remote/desktop) | Jenis seat | Hasil cek F1–F5 |
|---|---|---|---|---|
`);
  result.created.push("export/README.md");
}

console.log(JSON.stringify(result, null, 2));
