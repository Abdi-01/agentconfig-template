#!/usr/bin/env node
// Membuat GitHub Issues dari task berstatus "Belum" yang belum punya nomor issue.
// Default dry-run (hanya menampilkan rencana). --apply menjalankan `gh issue create`.
// Pakai: node to-issues.mjs --repo <owner/repo> [--dir docs/delivery] [--apply]
import path from "node:path";
import { execFileSync } from "node:child_process";
import { readTasks } from "./tasks.mjs";

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) args[argv[i].slice(2)] = true;
  else { args[argv[i].slice(2)] = next; i++; }
}
if (!args.repo) { console.error("ERROR: --repo <owner/repo> wajib"); process.exit(2); }
const dir = path.resolve(args.dir || "docs/delivery");
const tasks = readTasks(path.join(dir, "tasks.md"));
const todo = tasks.filter((t) => t.status === "Belum" && !/#?\d+/.test(t.issue));

const plan = todo.map((t) => ({
  task: t.id,
  title: `[${t.milestone}] ${t.id} · ${t.title}`,
  body: [
    `Task **${t.id}** dari \`docs/delivery/tasks.md\` (milestone ${t.milestone}).`,
    "",
    `- Tipe: ${t.type}`,
    `- Rujukan: ${t.refs.length ? t.refs.join(", ") : "—"} (acceptance criteria di \`docs/prd/prd.md\` §9)`,
    `- Estimasi: ${t.estimate} hari`,
    `- Bergantung pada: ${t.deps.length ? t.deps.join(", ") : "—"}`,
    "",
    "Selesai = Definition of Done di `agentconfig/standards/definition-of-done.md`. Tulis solusi paling sederhana yang memenuhi AC.",
  ].join("\n"),
}));

if (!args.apply) {
  console.log(JSON.stringify({ dryRun: true, repo: args.repo, count: plan.length, issues: plan.map(({ task, title }) => ({ task, title })) }, null, 2));
  process.exit(0);
}

const created = [];
for (const p of plan) {
  try {
    const url = execFileSync("gh", ["issue", "create", "--repo", args.repo, "--title", p.title, "--body", p.body], { encoding: "utf8" }).trim();
    created.push({ task: p.task, issue: `#${url.split("/").pop()}`, url });
  } catch (e) {
    console.log(JSON.stringify({ created, failedAt: p.task, error: String(e.stderr || e.message).trim() }, null, 2));
    process.exit(1);
  }
}
console.log(JSON.stringify({ created }, null, 2));
