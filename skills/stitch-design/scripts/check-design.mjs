#!/usr/bin/env node
// Memeriksa docs/design/ terhadap PRD. Read-only.
// Pakai: node check-design.mjs [--dir docs/design] [--prd docs/prd/prd.md] [--stage screens|prompts]
//   --stage screens (default): cek screens.md + cakupan FR MVP.
//   --stage prompts: juga cek prompts.md (batch ≤5 layar, blok wajib, setiap layar masuk batch).
// Exit 0 = tidak ada error (warning boleh), 1 = ada error, 2 = input tidak ditemukan.
import fs from "node:fs";
import path from "node:path";

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) args[argv[i].slice(2)] = true;
  else { args[argv[i].slice(2)] = next; i++; }
}
const dir = path.resolve(args.dir || "docs/design");
const prdPath = path.resolve(args.prd || "docs/prd/prd.md");
const stage = args.stage || "screens";
const MAX_PER_BATCH = 5;
const TYPES = ["page", "modal", "public"];
const STATUSES = ["Belum", "Draft", "Final", "Diganti"];

const errors = [];
const warnings = [];
const read = (p) => fs.readFileSync(p, "utf8");
const strip = (t) => t.replace(/<!--[\s\S]*?-->/g, "");
const cells = (row) => row.split("|").slice(1, -1).map((c) => c.trim());

function sectionLines(text, heading) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.trim().toLowerCase().startsWith(heading.toLowerCase()));
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && /^#{1,2} /.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start + 1, end);
}
const dataRows = (lines) => (lines || []).filter((l) => /^\|/.test(l) && !/^\|\s*:?-/.test(l)).slice(1)
  .filter((r) => cells(r).some((c) => c));

// Ekspansi rujukan FR, termasuk rentang "FR-BOOK-001 – FR-BOOK-004".
function expandFr(txt) {
  const ids = new Set();
  for (const m of txt.matchAll(/FR-([A-Z0-9]{2,10})-(\d{3})\s*[–-]\s*FR-\1-(\d{3})/g)) {
    for (let n = Number(m[2]); n <= Number(m[3]); n++) ids.add(`FR-${m[1]}-${String(n).padStart(3, "0")}`);
  }
  for (const m of txt.matchAll(/\bFR-[A-Z0-9]{2,10}-\d{3}\b/g)) ids.add(m[0]);
  return [...ids];
}

// --- screens.md ---------------------------------------------------------------
const screensPath = path.join(dir, "screens.md");
if (!fs.existsSync(screensPath)) { console.error(`ERROR: tidak ditemukan: ${screensPath}`); process.exit(2); }
const screensRaw = read(screensPath);
const screensText = strip(screensRaw);
const aiScreens = (screensRaw.match(/<!-- AI:/g) || []).length;
if (aiScreens) errors.push(`screens.md: ${aiScreens} penanda <!-- AI: … --> belum diganti isi.`);

const screens = [];
const table = sectionLines(screensText, "## Layar MVP");
if (!table) errors.push("screens.md: bagian '## Layar MVP' tidak ada.");
for (const r of dataRows(table)) {
  const [id, name, role, type, fr, batch, status, note] = cells(r);
  const s = { id, name, role, type, fr: expandFr(fr || ""), frRaw: fr || "", batch: Number(batch), status, note: note || "" };
  screens.push(s);
  if (!/^UI-\d{2,3}$/.test(id)) errors.push(`ID layar tidak valid: "${id}" (format UI-NN).`);
  if (!name) errors.push(`${id}: nama layar kosong.`);
  if (!role) errors.push(`${id}: role kosong.`);
  if (!TYPES.includes(type)) errors.push(`${id}: tipe "${type}" tidak valid (${TYPES.join(", ")}).`);
  if (!Number.isInteger(s.batch) || s.batch < 1) errors.push(`${id}: batch "${batch}" bukan angka ≥1.`);
  if (!STATUSES.includes(status)) errors.push(`${id}: status "${status}" tidak valid (${STATUSES.join(", ")}).`);
  if (!s.fr.length && !/\[ASUMSI\]/.test(s.note) && !/log ?in|sign ?in|masuk|daftar|register/i.test(name)) warnings.push(`${id} ${name}: tidak merujuk FR — hapus layar atau tulis FR-nya.`);
}
const seen = new Set();
for (const s of screens) { if (seen.has(s.id)) errors.push(`ID layar ganda: ${s.id}`); seen.add(s.id); }
const byId = new Map(screens.map((s) => [s.id, s]));
const live = screens.filter((s) => s.status !== "Diganti");
if (!live.length) errors.push("screens.md: belum ada layar.");

const batches = {};
for (const s of live) if (Number.isInteger(s.batch)) (batches[s.batch] ||= []).push(s.id);
for (const [b, ids] of Object.entries(batches)) {
  if (ids.length > MAX_PER_BATCH) errors.push(`Batch ${b} berisi ${ids.length} layar (maks ${MAX_PER_BATCH}): ${ids.join(", ")}`);
}
const batchNums = Object.keys(batches).map(Number).sort((a, b) => a - b);
batchNums.forEach((n, i) => { if (n !== i + 1) warnings.push(`Nomor batch melompat: ${batchNums.join(", ")}`); });
if (live.length > 30) warnings.push(`${live.length} layar untuk MVP — cek ulang references/screen-inventory.md (gabungkan atau tunda).`);
const nav = dataRows(sectionLines(screensText, "## Navigasi"));
if (!nav.length) warnings.push("screens.md: tabel 'Navigasi per role' kosong.");

// --- PRD ------------------------------------------------------------------------
let prd = null;
if (fs.existsSync(prdPath)) {
  const lines = strip(read(prdPath)).split("\n");
  const frs = new Map();
  let cur = null;
  for (const l of lines) {
    const m = l.match(/^#### (~~)?(FR-[A-Z0-9]{2,10}-\d{3})(~~)?\s*·\s*(.+)$/);
    if (m) { cur = { id: m[2], cancelled: Boolean(m[1]) || /dibatalkan/i.test(m[4]), priority: null }; frs.set(cur.id, cur); continue; }
    if (/^#{1,4} /.test(l)) { cur = null; continue; }
    const p = cur && l.match(/\*\*Prioritas:\*\*\s*(MVP|Fase 2|Nanti)\b/i);
    if (p) cur.priority = p[1].toUpperCase() === "MVP" ? "MVP" : p[1];
  }
  prd = { path: prdPath, frs };
  if (!frs.size) warnings.push(`PRD ${prdPath} tidak memakai format FR prd-writer — cakupan FR tidak dicek.`);
} else {
  warnings.push(`PRD tidak ditemukan di ${prdPath} — cakupan FR tidak dicek (pakai --prd <path>).`);
}

let uncoveredMvp = [];
if (prd && prd.frs.size) {
  const referenced = new Set(live.flatMap((s) => s.fr));
  for (const s of live) {
    for (const id of s.fr) {
      const f = prd.frs.get(id);
      if (!f) errors.push(`${s.id}: ${id} tidak ada di PRD.`);
      else if (f.cancelled) warnings.push(`${s.id}: ${id} sudah dibatalkan di PRD.`);
      else if (f.priority && f.priority !== "MVP") warnings.push(`${s.id}: ${id} berprioritas ${f.priority} — pindahkan layar ke 'Ditunda' jika hanya untuk FR ini.`);
    }
  }
  // FR backend murni (mis. job terjadwal) boleh tanpa layar; dilaporkan sebagai warning untuk ditinjau.
  uncoveredMvp = [...prd.frs.values()].filter((f) => !f.cancelled && f.priority === "MVP" && !referenced.has(f.id)).map((f) => f.id);
  if (uncoveredMvp.length) warnings.push(`FR MVP tanpa layar (tinjau: perlu layar, atau proses tanpa UI): ${uncoveredMvp.join(", ")}`);
}

// --- prompts.md ------------------------------------------------------------------
const promptStats = { batches: 0 };
if (stage === "prompts") {
  const promptsPath = path.join(dir, "prompts.md");
  if (!fs.existsSync(promptsPath)) errors.push(`prompts.md tidak ditemukan di ${dir}.`);
  else {
    const raw = read(promptsPath);
    const aiPrompts = (raw.match(/<!-- AI:/g) || []).length;
    if (aiPrompts) errors.push(`prompts.md: ${aiPrompts} penanda <!-- AI: … --> belum diganti isi.`);
    const text = strip(raw);
    const parts = text.split(/^## Batch /m).slice(1);
    const inPrompts = new Set();
    for (const part of parts) {
      const head = part.split("\n")[0];
      const n = Number((head.match(/^(\d+)/) || [])[1]);
      const label = `Batch ${n || head.trim()}`;
      const replaced = /Diganti oleh Batch/i.test(part);
      const listed = ((part.match(/^Layar:\s*(.+)$/m) || [])[1] || "").match(/UI-\d{2,3}/g) || [];
      const code = [...part.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1]).join("\n");
      promptStats.batches += 1;
      if (!listed.length) errors.push(`${label}: baris "Layar: UI-…" tidak ada.`);
      if (listed.length > MAX_PER_BATCH) errors.push(`${label}: ${listed.length} layar (maks ${MAX_PER_BATCH}).`);
      if (!code.trim()) errors.push(`${label}: blok kode prompt kosong.`);
      if (!replaced) listed.forEach((id) => inPrompts.add(id));
      for (const id of listed) if (!seen.has(id)) errors.push(`${label}: ${id} tidak ada di screens.md.`);
      if (replaced) continue;
      // Profil batch dari kolom Tipe: semua `public` → publik; selain itu → dashboard.
      const types = listed.map((id) => byId.get(id)?.type).filter(Boolean);
      const publicCount = types.filter((t) => t === "public").length;
      const profile = types.length && publicCount === types.length ? "public" : "dashboard";
      const hasSimplicity = /simplicity rules/i.test(code);
      const hasPublic = /public page rules/i.test(code);
      if (n === 1) {
        if (!/design system/i.test(code)) warnings.push("Batch 1: prompt tidak meminta design system.");
        if (!hasSimplicity && !hasPublic) warnings.push("Batch 1: tanpa blok Simplicity rules / Public page rules.");
      } else {
        if (publicCount && publicCount < types.length) warnings.push(`${label}: campuran layar public dan dashboard — pisahkan ke batch berbeda.`);
        if (profile === "public" && !hasPublic) errors.push(`${label}: batch publik tanpa blok "Public page rules".`);
        if (profile === "dashboard" && !hasSimplicity) errors.push(`${label}: batch dashboard tanpa blok "Simplicity rules".`);
        if (!/edit the selected screens in place/i.test(code)) warnings.push(`${label}: tanpa instruksi "Edit the selected screens in place".`);
      }
      const expected = (batches[n] || []).slice().sort().join(",");
      if (n && expected && expected !== [...listed].sort().join(",")) warnings.push(`${label}: daftar layar beda dengan kolom Batch di screens.md (screens.md: ${expected}).`);
    }
    if (!parts.length) errors.push("prompts.md: belum ada '## Batch N · …'.");
    const missing = live.map((s) => s.id).filter((id) => !inPrompts.has(id));
    if (missing.length) errors.push(`Layar belum masuk prompt batch mana pun: ${missing.join(", ")}`);
  }
}

const byRole = {};
for (const s of live) byRole[s.role] = (byRole[s.role] || 0) + 1;
const result = {
  dir, prd: prd ? prd.path : null, stage, ok: errors.length === 0,
  stats: {
    screens: live.length, replaced: screens.length - live.length, byRole,
    batches: Object.fromEntries(batchNums.map((n) => [n, batches[n].length])),
    final: live.filter((s) => s.status === "Final").length, promptBatches: promptStats.batches,
  },
  uncoveredMvp, errors, warnings,
};
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length ? 1 : 0);
