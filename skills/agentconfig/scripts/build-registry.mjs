#!/usr/bin/env node
// Membangun registry/rules.md: indeks ID aturan → file & bagian di standards/.
// Jalankan setiap kali standards/ berubah: node scripts/build-registry.mjs
import fs from "node:fs";
import path from "node:path";
import { SKILL_ROOT, TEMPLATES, TEMPLATE_VERSION, walk } from "./lib.mjs";

const STD = path.join(TEMPLATES, "agentconfig", "standards");
const ID = /\b(?:U|S|BU|BS|TU|[A-Z]{1,3}U|[A-Z]{1,3}S)-\d{2}\b/g;
const PREFIXES = {
  U: "universal — audit frontend #1 (2026-10-13)",
  S: "stack — audit frontend #1 (2026-10-13)",
  BU: "universal — audit backend #1 (2026-10-13)",
  BS: "stack — audit backend #1 (2026-10-13)",
  TU: "universal — keputusan pemilik template (2026-10-15)",
};

const index = new Map();
for (const f of walk(STD)) {
  let heading = "";
  for (const line of fs.readFileSync(path.join(STD, f), "utf8").split("\n")) {
    const h = line.match(/^#{1,3}\s+(.*)/);
    if (h) heading = h[1].replace(/\s*\((?:[^)]*)\)\s*$/, "").trim();
    for (const id of line.match(ID) || []) {
      if (!index.has(id)) index.set(id, new Set());
      index.get(id).add(`\`${f}\` › ${heading}`);
    }
  }
}

const sortKey = (id) => { const [p, n] = id.split("-"); return [p, Number(n)]; };
const ids = [...index.keys()].sort((a, b) => {
  const [pa, na] = sortKey(a); const [pb, nb] = sortKey(b);
  return pa === pb ? na - nb : pa.localeCompare(pb);
});

const lines = [
  "# Registry ID aturan",
  "",
  `Indeks ID aturan → lokasi di \`templates/agentconfig/standards/\` (template ${TEMPLATE_VERSION}). Dibuat otomatis oleh \`scripts/build-registry.mjs\`; jangan diedit manual. Baca saat membandingkan audit project baru dengan aturan yang sudah ada, atau saat mencari di mana suatu ID diterapkan.`,
  "",
  "## Prefix",
  "",
  "| Prefix | Asal |",
  "|---|---|",
  ...Object.entries(PREFIXES).map(([p, d]) => `| \`${p}-\` | ${d} |`),
  "",
  "Prefix baru didaftarkan di `PREFIXES` script ini dan di `standards/README.md`. Bukti lengkap tiap ID ada di `_audit/` repo project asal (tidak disalin ke template karena berisi detail klien).",
  "",
  "## Indeks",
  "",
  "| ID | Dipakai di |",
  "|---|---|",
  ...ids.map((id) => `| ${id} | ${[...index.get(id)].join("<br>")} |`),
  "",
];
const missing = [];
for (const [p] of Object.entries(PREFIXES)) {
  const nums = ids.filter((i) => i.split("-")[0] === p).map((i) => Number(i.split("-")[1]));
  if (!nums.length) continue;
  for (let n = 1; n <= Math.max(...nums); n++) if (!nums.includes(n)) missing.push(`${p}-${String(n).padStart(2, "0")}`);
}
if (missing.length) {
  lines.push("## ID tanpa rujukan di standards/", "", "Kandidat audit yang tidak dirujuk dengan ID di standards/: bisa diterapkan tanpa label ID, digabung ke aturan lain, atau ditolak. Cek laporan audit asal sebelum memakai ulang nomornya (nomor tidak boleh dipakai ulang).", "", missing.map((m) => `\`${m}\``).join(", "), "");
}

fs.mkdirSync(path.join(SKILL_ROOT, "registry"), { recursive: true });
fs.writeFileSync(path.join(SKILL_ROOT, "registry", "rules.md"), lines.join("\n"));
console.log(`registry/rules.md: ${ids.length} ID${missing.length ? `, ${missing.length} tidak dipakai` : ""}`);
