#!/usr/bin/env node
// Membuat kerangka PRD dan log discovery. Tidak menimpa file yang sudah ada.
// Pakai: node new-prd.mjs --out <folder> --product "<nama>" [--client "<klien>"] [--author "<nama>"] [--version 0.1]
// Default --out: docs/prd di direktori kerja.
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

const out = path.resolve(args.out || "docs/prd");
const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const tokens = {
  PRODUCT_NAME: args.product,
  CLIENT: args.client || "TODO",
  AUTHOR: args.author || "TODO",
  VERSION: args.version || "0.1",
  DATE: date,
};
const render = (t) => t.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));

const result = { out, created: [], skipped: [] };
fs.mkdirSync(out, { recursive: true });

const prdPath = path.join(out, "prd.md");
if (fs.existsSync(prdPath)) result.skipped.push("prd.md (sudah ada — pakai mode revisi)");
else {
  fs.writeFileSync(prdPath, render(fs.readFileSync(path.join(SKILL_ROOT, "templates", "prd.md.tmpl"), "utf8")));
  result.created.push("prd.md");
}

const logPath = path.join(out, "_discovery.md");
if (fs.existsSync(logPath)) result.skipped.push("_discovery.md (sudah ada — lanjutkan log)");
else {
  fs.writeFileSync(logPath, `# Log discovery — ${tokens.PRODUCT_NAME}

Catatan kerja penyusunan PRD: jawaban per ronde, sumbernya, dan keputusan. Dibaca saat melanjutkan sesi atau merevisi PRD; bukan dokumen untuk klien.

Label sumber: [KLIEN] dari klien/brief · [USER] dari penyusun · [ASUMSI] default yang belum dikonfirmasi · [BAHAN] diekstrak dari dokumen (sebut file).

## Bahan masukan

| File / sumber | Isi | Tanggal |
|---|---|---|

## Ronde

<!-- Tambahkan per ronde: "### Ronde N — <topik> (${date})", lalu daftar "N. Pertanyaan → jawaban [label]". -->

## Keputusan outline

<!-- Modul + kode, FR per modul + prioritas, kategori NFR, metrik — versi yang disetujui user. -->
`);
  result.created.push("_discovery.md");
}

console.log(JSON.stringify(result, null, 2));
