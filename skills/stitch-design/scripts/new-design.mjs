#!/usr/bin/env node
// Membuat kerangka docs/design/: screens.md, prompts.md, export/README.md. Tidak menimpa file yang sudah ada.
// Pakai: node new-design.mjs --product "<nama>" [--out docs/design] [--prd docs/prd/prd.md]
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

const out = path.resolve(args.out || "docs/design");
const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const tokens = {
  PRODUCT_NAME: args.product,
  PRD_PATH: args.prd || "docs/prd/prd.md",
  DATE: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
};
const render = (t) => t.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));

const result = { out, created: [], skipped: [] };
fs.mkdirSync(path.join(out, "export"), { recursive: true });

for (const name of ["screens.md", "prompts.md"]) {
  const dest = path.join(out, name);
  if (fs.existsSync(dest)) { result.skipped.push(`${name} (sudah ada)`); continue; }
  fs.writeFileSync(dest, render(fs.readFileSync(path.join(SKILL_ROOT, "templates", `${name}.tmpl`), "utf8")));
  result.created.push(name);
}

const exportReadme = path.join(out, "export", "README.md");
if (fs.existsSync(exportReadme)) result.skipped.push("export/README.md (sudah ada)");
else {
  fs.writeFileSync(exportReadme, `# Export desain — ${tokens.PRODUCT_NAME}

Hasil export Google Stitch (HTML, PNG, DESIGN.md) sebagai **referensi visual**. Tidak di-import oleh kode dan tidak diedit; timpa file saat export diperbarui.

- Satu subfolder per batch: \`batch-1/\`, \`batch-2/\`, …
- Nama file diawali ID layar dari \`../screens.md\`: \`UI-01-login.html\`, \`UI-01-login.png\`.
- \`DESIGN.md\` dari Stitch disimpan di folder ini apa adanya.
- Token dan pemetaan kelas export ke token project ada di \`agentconfig/project/design-system.md\`.

## Integrasi

Jangan menulis email atau kredensial di sini.

| Tanggal | Jalur (manual / MCP-A / MCP-B) | Project Stitch | Akun pemilik (pribadi/kantor) | Hasil cek C1–C5 |
|---|---|---|---|---|
`);
  result.created.push("export/README.md");
}

console.log(JSON.stringify(result, null, 2));
