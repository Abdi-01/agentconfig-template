#!/usr/bin/env node
// Validasi docs/delivery/ terhadap PRD (+ screens.md) dan proyeksi tanggal milestone. Read-only.
// Pakai: node check-plan.mjs [--dir docs/delivery] [--prd docs/prd/prd.md] [--screens docs/design/screens.md]
//                           [--start YYYY-MM-DD] [--capacity 5] [--holidays file] [--remaining]
// Exit 0 = tanpa error, 1 = ada error, 2 = input tidak ditemukan.
import fs from "node:fs";
import path from "node:path";
import { TYPES, STATUSES, readTasks, readPlan, expandIds } from "./tasks.mjs";

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) args[argv[i].slice(2)] = true;
  else { args[argv[i].slice(2)] = next; i++; }
}
const dir = path.resolve(args.dir || "docs/delivery");
const prdPath = path.resolve(args.prd || "docs/prd/prd.md");
const screensPath = path.resolve(args.screens || "docs/design/screens.md");
const tasksPath = path.join(dir, "tasks.md");
const planPath = path.join(dir, "plan.md");
for (const p of [tasksPath, planPath]) if (!fs.existsSync(p)) { console.error(`ERROR: tidak ditemukan: ${p}`); process.exit(2); }

const errors = [];
const warnings = [];
const tasks = readTasks(tasksPath);
const plan = readPlan(planPath);
const tasksAi = (fs.readFileSync(tasksPath, "utf8").match(/<!-- AI:/g) || []).length;
if (tasksAi + plan.aiMarks) warnings.push(`${tasksAi + plan.aiMarks} penanda <!-- AI: … --> belum diganti isi (wajar sebelum kolom Estimasi/Target diisi dari output ini).`);

// --- Task -----------------------------------------------------------------------
const byId = new Map();
for (const t of tasks) {
  if (!/^T-\d{3}$/.test(t.id)) errors.push(`ID task tidak valid: "${t.id}" (format T-NNN).`);
  if (byId.has(t.id)) errors.push(`ID task ganda: ${t.id}`);
  byId.set(t.id, t);
  if (!t.title) errors.push(`${t.id}: judul kosong.`);
  if (!TYPES.includes(t.type)) errors.push(`${t.id}: tipe "${t.type}" tidak valid.`);
  if (!STATUSES.includes(t.status)) errors.push(`${t.id}: status "${t.status}" tidak valid.`);
  if (!(t.estimate > 0) || (t.estimate * 2) % 1 !== 0) errors.push(`${t.id}: estimasi "${t.estimateRaw}" harus kelipatan 0,5 dan > 0.`);
  else if (t.estimate > 2) errors.push(`${t.id}: estimasi ${t.estimate} hari > 2 — pecah task.`);
  if (["fe", "be", "fullstack"].includes(t.type) && !t.refs.length) warnings.push(`${t.id}: task fitur tanpa rujukan FR/UI.`);
}
const milestoneIds = plan.milestones.map((m) => m.id);
if (!milestoneIds.length) errors.push("plan.md: tabel Milestone kosong.");
for (const m of plan.milestones) {
  if (!/^M\d+$/.test(m.id)) errors.push(`ID milestone tidak valid: "${m.id}".`);
  if (!m.gate || /^(todo|—|-)$/i.test(m.gate)) errors.push(`${m.id}: gate kosong.`);
}
const active = tasks.filter((t) => t.status !== "Batal");
for (const t of active) {
  if (!milestoneIds.includes(t.milestone)) errors.push(`${t.id}: milestone "${t.milestone}" tidak ada di plan.md.`);
  for (const dep of t.deps) {
    const d = byId.get(dep);
    if (!d) errors.push(`${t.id}: bergantung pada ${dep} yang tidak ada.`);
    else if (d.status === "Batal") warnings.push(`${t.id}: bergantung pada ${dep} yang dibatalkan.`);
    else if (milestoneIds.indexOf(d.milestone) > milestoneIds.indexOf(t.milestone)) errors.push(`${t.id} (${t.milestone}) bergantung pada ${dep} di milestone setelahnya (${d.milestone}).`);
  }
}
// Siklus dependensi.
const state = new Map();
const visit = (id, stack) => {
  if (state.get(id) === "done") return;
  if (state.get(id) === "visiting") { errors.push(`Siklus dependensi: ${[...stack, id].join(" → ")}`); return; }
  state.set(id, "visiting");
  for (const dep of byId.get(id)?.deps || []) if (byId.has(dep)) visit(dep, [...stack, id]);
  state.set(id, "done");
};
for (const t of tasks) visit(t.id, []);
if (!active.some((t) => /security|keamanan|threat/i.test(t.title))) warnings.push("Tidak ada task security (threat model, test security, scan CI, checklist go-live) — lihat references/estimation.md › Security wajib di rencana.");
for (const type of ["uat", "release"]) if (!active.some((t) => t.type === type)) warnings.push(`Tidak ada task bertipe "${type}" — pekerjaan ${type === "uat" ? "UAT" : "deploy/serah terima"} belum dihitung.`);

// --- Cakupan PRD & layar ------------------------------------------------------------
const covered = new Set(active.flatMap((t) => t.refs));
let uncoveredFr = [];
if (fs.existsSync(prdPath)) {
  const frs = new Map();
  let cur = null;
  for (const l of fs.readFileSync(prdPath, "utf8").replace(/<!--[\s\S]*?-->/g, "").split("\n")) {
    const m = l.match(/^#### (~~)?(FR-[A-Z0-9]{2,10}-\d{3})(~~)?\s*·\s*(.+)$/);
    if (m) { cur = { id: m[2], cancelled: Boolean(m[1]) || /dibatalkan/i.test(m[4]), priority: null }; frs.set(cur.id, cur); continue; }
    if (/^#{1,4} /.test(l)) { cur = null; continue; }
    const p = cur && l.match(/\*\*Prioritas:\*\*\s*(MVP|Fase 2|Nanti)\b/i);
    if (p) cur.priority = p[1].toUpperCase() === "MVP" ? "MVP" : p[1];
  }
  if (!frs.size) warnings.push("PRD tidak memakai format FR prd-writer — cakupan FR tidak dicek.");
  for (const id of covered) {
    if (!id.startsWith("FR-")) continue;
    const f = frs.get(id);
    if (frs.size && !f) errors.push(`${id} dirujuk task tetapi tidak ada di PRD.`);
    else if (f?.cancelled) warnings.push(`${id} dirujuk task tetapi sudah dibatalkan di PRD.`);
    else if (f && f.priority !== "MVP") warnings.push(`${id} berprioritas ${f.priority} — pastikan memang masuk rencana.`);
  }
  uncoveredFr = [...frs.values()].filter((f) => !f.cancelled && f.priority === "MVP" && !covered.has(f.id)).map((f) => f.id);
  if (uncoveredFr.length) errors.push(`FR MVP tanpa task: ${uncoveredFr.join(", ")}`);
} else warnings.push(`PRD tidak ditemukan di ${prdPath} — cakupan FR tidak dicek.`);

let uncoveredUi = [];
if (fs.existsSync(screensPath)) {
  const text = fs.readFileSync(screensPath, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const live = [...text.matchAll(/^\|\s*(UI-\d{2,3})\s*\|(?:[^|]*\|){5}\s*([A-Za-z]+)\s*\|/gm)].filter((m) => m[2] !== "Diganti").map((m) => m[1]);
  uncoveredUi = live.filter((id) => !covered.has(id));
  if (uncoveredUi.length) warnings.push(`Layar tanpa task: ${uncoveredUi.join(", ")}`);
}

// --- Jadwal ---------------------------------------------------------------------------
const factor = 1 + plan.buffer / 100;
const milestones = plan.milestones.map((m) => {
  const own = active.filter((t) => t.milestone === m.id);
  const raw = own.reduce((s, t) => s + (t.estimate || 0), 0);
  const remaining = own.filter((t) => t.status !== "Selesai").reduce((s, t) => s + (t.estimate || 0), 0);
  return { id: m.id, name: m.name, tasks: own.length, rawDays: raw, days: Math.ceil(raw * factor * 2) / 2, remainingDays: Math.ceil(remaining * factor * 2) / 2, target: m.target };
});
for (const m of milestones) if (!m.tasks) warnings.push(`${m.id}: belum punya task.`);

if (args.start) {
  const capacity = Number(args.capacity || 5);
  if (!(capacity > 0 && capacity <= 7)) errors.push("--capacity harus 0 < n ≤ 7 (hari efektif per minggu).");
  const holidays = new Set(args.holidays && fs.existsSync(args.holidays) ? fs.readFileSync(args.holidays, "utf8").match(/\d{4}-\d{2}-\d{2}/g) || [] : []);
  if (args.holidays && !holidays.size) warnings.push(`File libur ${args.holidays} kosong atau tidak ditemukan.`);
  const iso = (d) => d.toISOString().slice(0, 10);
  let cursor = new Date(`${args.start}T00:00:00Z`);
  if (Number.isNaN(cursor.getTime())) errors.push(`--start tidak valid: ${args.start}`);
  else {
    // Hari kerja kalender (Sen–Jum, bukan libur) yang dibutuhkan = hari efektif × 5 / kapasitas.
    const advance = (workdays) => {
      let left = Math.ceil(workdays);
      while (left > 0) {
        const day = cursor.getUTCDay();
        if (day !== 0 && day !== 6 && !holidays.has(iso(cursor))) left -= 1;
        if (left > 0) cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      const end = iso(cursor);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      return end;
    };
    for (const m of milestones) {
      // --remaining: proyeksi dari sisa pekerjaan (mode update, --start = hari ini).
      m.calendarWorkdays = Math.ceil(((args.remaining ? m.remainingDays : m.days) * 5) / capacity);
      m.projectedEnd = m.calendarWorkdays ? advance(m.calendarWorkdays) : null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(m.target || "") && m.projectedEnd && m.target < m.projectedEnd) warnings.push(`${m.id}: target ${m.target} lebih awal dari proyeksi ${m.projectedEnd}.`);
    }
    if (!holidays.size) warnings.push("Proyeksi belum memperhitungkan libur nasional/cuti bersama (pakai --holidays).");
  }
}

const total = active.reduce((s, t) => s + (t.estimate || 0), 0);
const result = {
  ok: errors.length === 0,
  stats: { tasks: active.length, cancelled: tasks.length - active.length, done: active.filter((t) => t.status === "Selesai").length,
    rawDays: total, buffer: `${plan.buffer}%`, totalDays: Math.ceil(total * factor * 2) / 2 },
  milestones, uncoveredFr, uncoveredUi, errors, warnings,
};
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length ? 1 : 0);
