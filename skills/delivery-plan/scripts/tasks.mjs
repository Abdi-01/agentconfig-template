// Parser bersama untuk tasks.md dan plan.md.
import fs from "node:fs";

export const TYPES = ["setup", "design", "fe", "be", "fullstack", "test", "infra", "docs", "review", "uat", "release"];
export const STATUSES = ["Belum", "Jalan", "Selesai", "Batal"];

const strip = (t) => t.replace(/<!--[\s\S]*?-->/g, "");
const cells = (row) => row.split("|").slice(1, -1).map((c) => c.trim());

// Baris data tabel pertama setelah heading `## <title>`.
export function table(text, title) {
  const lines = strip(text).split("\n");
  const start = lines.findIndex((l) => l.trim().toLowerCase().startsWith(`## ${title.toLowerCase()}`));
  if (start < 0) return null;
  const rows = [];
  let header = null;
  for (const l of lines.slice(start + 1)) {
    if (/^#{1,2} /.test(l)) break;
    if (!/^\|/.test(l)) continue;
    if (/^\|\s*:?-/.test(l)) continue;
    if (!header) { header = cells(l); continue; }
    const c = cells(l);
    if (c.some(Boolean)) rows.push(c);
  }
  return rows;
}

// "FR-A-001, FR-B-002 – FR-B-004, UI-03" → daftar ID.
export function expandIds(txt) {
  const ids = new Set();
  for (const m of (txt || "").matchAll(/(N?FR)-([A-Z0-9]{2,10})-(\d{3})\s*[–-]\s*\1-\2-(\d{3})/g)) {
    for (let n = Number(m[3]); n <= Number(m[4]); n++) ids.add(`${m[1]}-${m[2]}-${String(n).padStart(3, "0")}`);
  }
  for (const m of (txt || "").matchAll(/\b(?:N?FR-[A-Z0-9]{2,10}-\d{3}|UI-\d{2,3})\b/g)) ids.add(m[0]);
  return [...ids];
}

export function readTasks(file) {
  const rows = table(fs.readFileSync(file, "utf8"), "Task") || [];
  return rows.map(([id, title, milestone, type, refs, estimate, deps, status, issue]) => ({
    id, title, milestone, type, refs: expandIds(refs), estimateRaw: estimate,
    estimate: Number(String(estimate).replace(",", ".")),
    deps: (deps || "").match(/T-\d{3}/g) || [], status, issue: issue || "",
  }));
}

export function readPlan(file) {
  const text = fs.readFileSync(file, "utf8");
  const buffer = Number(((strip(text).match(/\*\*Buffer\*\*\s*\|\s*(\d+(?:[.,]\d+)?)\s*%/) || [])[1] || "20").replace(",", "."));
  const milestones = (table(text, "Milestone") || []).map(([id, name, scope, , target, gate, term]) => ({ id, name, scope, target, gate, term }));
  return { buffer, milestones, aiMarks: (text.match(/<!-- AI:/g) || []).length };
}
