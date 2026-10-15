# Changelog — figma-design

## v0.1 — 2026-10-15

Versi awal. Alur PRD → daftar layar → desain di Figma lewat Figma MCP → review → handoff, dengan dua mode: **gambar** (agent menulis ke canvas lewat server remote) dan **review** (desainer menggambar, agent mereview). Memakai bagian tool-agnostik `stitch-design` (format `screens.md`, `check-design --stage screens`, screen inventory, review checklist, template build-plan). Pengecekan integrasi F1–F5 termasuk jenis seat (Starter/View/Collab dibatasi 6 tool call per bulan) dan panduan setup (plugin resmi `figma@claude-plugins-official` atau `claude mcp add` ke `https://mcp.figma.com/mcp`, OAuth). Script `new-design` (screens.md + figma.md + export/README.md).
