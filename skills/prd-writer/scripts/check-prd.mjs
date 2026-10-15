#!/usr/bin/env node
// Memeriksa kelengkapan dan kualitas PRD Markdown (format templates/prd.md.tmpl). Read-only.
// Pakai: node check-prd.mjs --file docs/prd/prd.md
// Exit 0 = tidak ada error (warning boleh), 1 = ada error.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const idx = argv.indexOf("--file");
const file = path.resolve(idx >= 0 ? argv[idx + 1] : "docs/prd/prd.md");
if (!fs.existsSync(file)) { console.error(`ERROR: file tidak ditemukan: ${file}`); process.exit(2); }

const raw = fs.readFileSync(file, "utf8");
// Komentar HTML (termasuk contoh di dalam penanda AI) tidak dihitung sebagai isi.
const text = raw.replace(/<!--[\s\S]*?-->/g, "");
const lines = text.split("\n");
const errors = [];
const warnings = [];

// --- Penanda & placeholder --------------------------------------------------
const aiMarks = (raw.match(/<!-- AI:/g) || []).length;
if (aiMarks) errors.push(`${aiMarks} penanda <!-- AI: … --> belum diganti isi.`);
const tokens = text.match(/\{\{[A-Z_]+\}\}/g);
if (tokens) errors.push(`Placeholder belum diisi: ${[...new Set(tokens)].join(", ")}`);

// --- Bagian wajib -----------------------------------------------------------
const REQUIRED = [
  [1, "Ringkasan eksekutif"], [2, "Latar belakang"], [3, "Tujuan & metrik"], [4, "Target pengguna"],
  [5, "Ruang lingkup"], [6, "Alur pengguna"], [7, "Timeline"], [8, "Role"], [9, "Functional requirements"],
  [10, "Non-functional"], [11, "Data"], [12, "Integrasi"], [13, "Asumsi"], [14, "Pertanyaan terbuka"],
];
const h2 = lines.filter((l) => /^## /.test(l));
for (const [n, title] of REQUIRED) {
  if (!h2.some((l) => l.startsWith(`## ${n}.`))) errors.push(`Bagian wajib hilang: §${n} ${title}`);
}

function section(n) {
  const start = lines.findIndex((l) => l.startsWith(`## ${n}.`));
  if (start < 0) return [];
  let end = lines.findIndex((l, i) => i > start && /^#{1,2} /.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start + 1, end);
}
const tableRows = (sec) => sec.filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1); // tanpa header
const isEmptyRow = (r) => r.split("|").slice(1, -1).every((c) => !c.trim());

// --- Versi & status ---------------------------------------------------------
const version = (text.match(/\*\*Versi\*\*\s*\|\s*([0-9]+\.[0-9]+)/) || [])[1] || null;
const status = (text.match(/\*\*Status\*\*\s*\|\s*([^|\n]+)/) || [])[1]?.trim() || null;
if (!version) errors.push("Versi tidak terbaca di tabel metadata (format `0.1`, `1.0`).");

// --- Metrik -----------------------------------------------------------------
const metrics = tableRows(section(3)).filter((r) => !isEmptyRow(r));
if (!metrics.length) errors.push("§3 belum punya metrik keberhasilan.");
for (const r of metrics) {
  const cells = r.split("|").slice(1, -1).map((c) => c.trim());
  if (!/\d/.test(cells[2] || "") && !/baseline/i.test(cells[2] || "")) warnings.push(`§3 target tanpa angka: "${cells[1] || cells[0]}"`);
}

// --- Ruang lingkup ----------------------------------------------------------
const scope = section(5).join("\n");
const outOfScope = scope.split(/### Di luar cakupan/i)[1] || "";
if (!/^\s*[-*]\s+\S/m.test(outOfScope)) warnings.push("§5 'Di luar cakupan' kosong — tulis minimal satu butir untuk mencegah scope creep.");

// --- Role ----------------------------------------------------------------------
const roles = tableRows(section(8)).filter((r) => !isEmptyRow(r)).map((r) => r.split("|")[1].trim().replace(/[`*]/g, "").toLowerCase());
if (!roles.length) errors.push("§8 belum mendefinisikan role.");

// --- Functional requirements ---------------------------------------------------
const FR_HEAD = /^#### (~~)?(FR-([A-Z0-9]{2,10})-(\d{3}))(~~)?\s*·\s*(.+)$/;
const frs = [];
let cur = null;
for (const l of section(9)) {
  const m = l.match(FR_HEAD);
  if (m) {
    cur = { id: m[2], module: m[3], cancelled: Boolean(m[1]) || /dibatalkan/i.test(m[6]), title: m[6], priority: null, story: null, ac: 0 };
    frs.push(cur);
    continue;
  }
  if (/^#{1,4} /.test(l)) { cur = null; continue; }
  if (!cur) continue;
  const p = l.match(/\*\*Prioritas:\*\*\s*(MVP|Fase 2|Nanti)\b/i);
  if (p) cur.priority = p[1].toUpperCase() === "MVP" ? "MVP" : p[1][0].toUpperCase() + p[1].slice(1).toLowerCase();
  const s = l.match(/\*\*User story:\*\*\s*(.+)/);
  if (s) cur.story = s[1];
  if (/^\s*[-*]\s*\[AC-\d+\]/.test(l)) cur.ac += 1;
}
const malformed = section(9).filter((l) => /^####\s+/.test(l) && !FR_HEAD.test(l));
for (const l of malformed) errors.push(`Judul FR tidak sesuai format \`#### FR-<MODUL>-<NNN> · <judul>\`: ${l.trim()}`);

const active = frs.filter((f) => !f.cancelled);
if (!active.length) errors.push("§9 belum punya functional requirement.");
const seen = new Map();
for (const f of frs) {
  if (seen.has(f.id)) errors.push(`ID FR ganda: ${f.id}`);
  seen.set(f.id, true);
}
for (const f of active) {
  if (!f.priority) errors.push(`${f.id}: prioritas tidak ada / tidak valid (MVP, Fase 2, Nanti).`);
  if (!f.story) errors.push(`${f.id}: user story tidak ada.`);
  else {
    const sm = f.story.match(/^Sebagai\s+(.+?),\s*saya ingin/i);
    if (!sm) warnings.push(`${f.id}: user story tidak memakai pola "Sebagai …, saya ingin … agar …".`);
    else if (roles.length && !roles.some((r) => sm[1].toLowerCase().includes(r))) warnings.push(`${f.id}: aktor "${sm[1]}" tidak cocok dengan role di §8.`);
  }
  if (f.ac === 0) errors.push(`${f.id}: tidak punya acceptance criteria.`);
  else if (f.priority === "MVP" && f.ac < 2) warnings.push(`${f.id}: FR MVP sebaiknya punya ≥2 AC (jalur sukses + gagal).`);
}
// Nomor urut per modul.
const byModule = {};
for (const f of frs) (byModule[f.module] ||= []).push(Number(f.id.slice(-3)));
for (const [mod, nums] of Object.entries(byModule)) {
  const sorted = [...nums].sort((a, b) => a - b);
  sorted.forEach((n, i) => { if (n !== i + 1) warnings.push(`Modul ${mod}: nomor FR melompat/tidak urut (${sorted.join(", ")}).`); });
}
// AC tanpa pola Diberikan/ketika/maka.
const acLines = section(9).filter((l) => /^\s*[-*]\s*\[AC-\d+\]/.test(l));
const looseAc = acLines.filter((l) => !/diberikan/i.test(l) || !/ketika/i.test(l) || !/maka/i.test(l)).length;
if (looseAc) warnings.push(`${looseAc} AC tidak memakai pola "Diberikan … ketika … maka …".`);

// --- NFR ------------------------------------------------------------------------
const VAGUE = /\b(cepat|aman|mudah|user[- ]friendly|responsif|nyaman|modern|handal|andal)\b/i;
const nfrRows = tableRows(section(10)).filter((r) => !isEmptyRow(r));
const nfrIds = [];
for (const r of nfrRows) {
  const cells = r.split("|").slice(1, -1).map((c) => c.trim());
  const id = cells[0].replace(/[`*~]/g, "");
  if (!/^NFR-(PERF|SEC|PRIV|AVAIL|A11Y|SEO|LOC|USAB|MAINT|COMP|OBS)-\d{3}$/.test(id)) errors.push(`ID NFR tidak valid: "${cells[0]}"`);
  if (nfrIds.includes(id)) errors.push(`ID NFR ganda: ${id}`);
  nfrIds.push(id);
  const target = cells[3] || "";
  if (!target || /^(todo|-|—)$/i.test(target)) errors.push(`${id}: target terukur kosong.`);
  else if (VAGUE.test(target) && !/\d|WCAG|ISO|OWASP|UU|ASVS|id-ID|Asia\//.test(target)) warnings.push(`${id}: target terdengar kabur ("${target}").`);
  if (!cells[4] || /^(todo|-|—)$/i.test(cells[4])) warnings.push(`${id}: cara verifikasi kosong.`);
}
if (!nfrRows.length) errors.push("§10 belum punya NFR.");
const sensitive = tableRows(section(11)).some((r) => /\|\s*ya\b/i.test(r));
if (sensitive && !nfrIds.some((i) => i.startsWith("NFR-PRIV"))) warnings.push("§11 ada data sensitif, tetapi belum ada NFR-PRIV (consent, akses, retensi, hak hapus).");
if (sensitive && !nfrIds.some((i) => i.startsWith("NFR-SEC"))) warnings.push("§11 ada data sensitif, tetapi belum ada NFR-SEC.");

// --- Rujukan ID ------------------------------------------------------------------
const allIds = new Set([...frs.map((f) => f.id), ...nfrIds]);
const referenced = new Set((text.match(/\b(?:N?FR)-[A-Z0-9]{2,10}-\d{3}\b/g) || []));
const dangling = [...referenced].filter((id) => !allIds.has(id) && !/–|-$/.test(id));
if (dangling.length) warnings.push(`ID dirujuk tapi tidak didefinisikan: ${dangling.join(", ")}`);
const mvpIds = active.filter((f) => f.priority === "MVP").map((f) => f.id);
const mvpScope = (scope.split(/### Fase berikutnya/i)[0] || "");
const mvpUnmentioned = mvpIds.filter((id) => !mvpScope.includes(id) && !rangeCovers(mvpScope, id));
if (mvpUnmentioned.length) warnings.push(`FR MVP tidak disebut di §5 MVP: ${mvpUnmentioned.join(", ")}`);

function rangeCovers(txt, id) {
  // Mendukung rentang "FR-BOOK-001 – FR-BOOK-004".
  const [, mod, num] = id.match(/FR-([A-Z0-9]+)-(\d{3})/);
  const re = new RegExp(`FR-${mod}-(\\d{3})\\s*[–-]\\s*FR-${mod}-(\\d{3})`, "g");
  for (const m of txt.matchAll(re)) if (Number(num) >= Number(m[1]) && Number(num) <= Number(m[2])) return true;
  return false;
}

// --- Asumsi & pertanyaan terbuka ------------------------------------------------
const assumptionTags = (text.match(/\[ASUMSI\]/g) || []).length;
const assumptionRows = tableRows(section(13)).filter((r) => !isEmptyRow(r)).length;
if (assumptionTags && !assumptionRows) warnings.push(`${assumptionTags} label [ASUMSI] di dokumen, tetapi §13 kosong.`);
const openQs = tableRows(section(14)).filter((r) => !isEmptyRow(r) && /terbuka/i.test(r)).length;
if (version && Number(version) >= 1 && openQs) warnings.push(`Versi ${version} (disetujui) masih punya ${openQs} pertanyaan terbuka.`);

const priorities = { MVP: 0, "Fase 2": 0, Nanti: 0 };
for (const f of active) if (f.priority) priorities[f.priority] += 1;
const result = {
  file, version, status, ok: errors.length === 0,
  stats: {
    modules: Object.keys(byModule).length, fr: active.length, frCancelled: frs.length - active.length, priorities,
    acceptanceCriteria: active.reduce((s, f) => s + f.ac, 0), nfr: nfrIds.length, metrics: metrics.length,
    roles: roles.length, assumptions: assumptionRows, openQuestions: openQs,
  },
  errors, warnings,
};
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length ? 1 : 0);
