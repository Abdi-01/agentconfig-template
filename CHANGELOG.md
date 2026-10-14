# Changelog

Riwayat versi `templates/agentconfig/standards/` dan kerangka `project/`. Setiap versi menyebut apa yang perlu dilakukan di repo saat sync.

## v0.2.1 — 2026-10-14

Template dipindah ke repo sendiri dan dibungkus sebagai skill `agentconfig`.

- `standards/README.md`: tabel registry ID tidak lagi menunjuk `_audit/audit-report.md` "di repo asal" (tidak ada di project baru); diganti rujukan ke `registry/rules.md` template. Ditambah klarifikasi bahwa "project asal" di label status berarti project audit pemilik prefix.
- Selain itu `standards/` identik dengan v0.2.
- Baru: kerangka `project/*.tmpl`, `AGENTS.md.tmpl`, label `[PRD]` dan `[KEPUTUSAN]` di legenda, `agentconfig/.template-lock.json`, script `detect`/`scaffold`/`check`/`build-registry`, `registry/rules.md`.

**Saat sync dari v0.2:** jalankan sync (konflik di `standards/README.md` diharapkan — aman ditimpa). Tambahkan baris "Versi template yang dipakai" di `agentconfig/README.md` jika belum ada (dilakukan otomatis oleh sync). Opsional: tambahkan label `[PRD]`/`[KEPUTUSAN]` ke legenda `agentconfig/README.md`.

## v0.2 — 2026-10-14

Netral tipe project (frontend/backend/fullstack), berdasarkan audit backend #1: `api-design.md` baru; tiga file stack backend (`express-5-layered-api.md`, `prisma-7-postgres.md`, `node-ts7-jest-vercel.md`); `standards/stack/README.md` menjadi indeks multi-stack; `security.md` + `testing/security.md` berbasis OWASP Top 10:2025, API Security Top 10:2023, ASVS 5.0; testing dan Definition of Done mencakup backend; registry prefix ID (`BU-`, `BS-`).

## v0.1.1 — 2026-10-13

Klarifikasi U-03 di `coding-style.md`: bedakan instant dan wall-clock.

## v0.1 — 2026-10-13

Versi awal, diekstrak dari audit frontend #1 (2 app Next.js 16).
