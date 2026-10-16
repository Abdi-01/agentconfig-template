# Integrasi Figma MCP

Dibaca di Fase 0. Berisi prasyarat akun, pengecekan integrasi (wajib setiap sesi), diagnosis, dan panduan setup untuk Claude Code.

> **Status sumber (dicek 2026-10-15).** Dari halaman server MCP resmi Figma di GitHub MCP registry (`com.figma.mcp/mcp`): endpoint remote `https://mcp.figma.com/mcp`; plugin Claude Code `figma@claude-plugins-official`; batas pemakaian per seat; fitur *write to canvas* hanya di server remote, beta, gratis selama beta dan nantinya berbayar per pemakaian. Nama tool tulis tidak disebut di halaman itu. Selalu percayai tool yang benar-benar terdaftar di sesi dan dokumentasi developer Figma terbaru.

## Prasyarat akun

| Kebutuhan | Kenapa |
|---|---|
| Seat **Dev** atau **Full** di plan Professional/Organization/Enterprise | Seat Starter, View, atau Collab dibatasi **6 tool call per bulan** — habis dalam satu putaran kerja |
| Akses edit ke file Figma tujuan (mode gambar) / akses lihat (mode review/handoff) | Tool baca/tulis memakai izin akun yang login |
| Server **remote** (bukan desktop) untuk mode gambar | *Write to canvas* hanya tersedia di server remote |
| Akun Figma yang sama dengan pemilik/anggota file | Sama seperti Stitch: login MCP akun lain → file tidak terbaca |

Jika seat tidak memenuhi: mode gambar tidak dipakai. Alternatif: desainer menggambar (mode review dengan screenshot manual), pakai `stitch-design`, atau user meng-upgrade seat.

## Pengecekan integrasi (F1–F5)

| Langkah | Cara | Lolos jika |
|---|---|---|
| F1. Tool terdaftar | Cari tool berawalan `mcp__figma__` / `mcp__Figma__` (atau cari "figma" lewat pencarian tool) | Ada tool baca (`get_metadata`, `get_screenshot`, `get_design_context`, `get_variable_defs`); mode gambar: ada tool tulis canvas |
| F2. Terautentikasi | Panggil tool identitas jika ada (mis. `whoami`); jika tidak, F3 sekaligus menguji | Tidak error auth |
| F3. Akun & seat | Tampilkan akun/plan/seat dari F2 ke user; tanyakan jenis seat jika tidak terbaca | Seat Dev/Full di plan berbayar (lihat Prasyarat) |
| F4. File terbaca | `get_metadata` pada link file/halaman dari user | Struktur halaman/frame cocok dengan yang user lihat |
| F5. Tulis (mode gambar saja) | Setelah user setuju: buat satu frame uji kecil di halaman `_agent-test`, lalu hapus | Frame tercipta di canvas |

Catat hasil di `docs/design/export/README.md` › Integrasi (tanggal, server remote/desktop, jenis seat, hasil F1–F5). **Jangan menulis email atau token ke repo.**

⛔ F1–F5 lolos → ringkas ke user dan minta konfirmasi sebelum lanjut. Ada yang gagal → diagnosis + panduan.

## Diagnosis

| Gejala | Kemungkinan penyebab | Tindakan |
|---|---|---|
| F1: tidak ada tool figma | MCP/plugin belum dipasang, atau Claude Code belum direstart | Setup › Langkah 1; `claude mcp list` |
| F1: hanya tool baca | Terhubung ke server desktop, atau fitur tulis belum aktif untuk akun | Pakai server remote; mode review tetap bisa |
| F2: meminta login / 401 | OAuth belum selesai atau token kedaluwarsa | `/mcp` di Claude Code → autentikasi ulang server figma |
| Error batas/kuota setelah beberapa panggilan | Seat Starter/View/Collab (6 call/bulan) atau batas per menit | Cek seat; kurangi panggilan (batch ≤5, screenshot hanya frame final) |
| F4: file tidak ditemukan / 403 | Akun login bukan anggota file, atau link ke file lain | Minta akses ke pemilik file, atau login dengan akun yang benar |
| F5: tulis gagal, baca berhasil | Fitur beta tidak aktif, izin file hanya view | Minta akses edit; atau pindah ke mode review |

## Panduan setup

Pasang di scope user, bukan `.mcp.json` repo klien.

### Langkah 1 — Pasang

Pilihan yang disarankan, plugin resmi (MCP + skill Figma):
```bash
claude plugin install figma@claude-plugins-official
```

Atau server saja:
```bash
claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp
```

### Langkah 2 — Autentikasi

Restart Claude Code → `/mcp` → pilih `figma` → login OAuth di browser dengan akun Figma yang memiliki seat Dev/Full. Tidak ada API key yang disimpan di config.

### Langkah 3 — Cek

Jalankan F1–F5. Jika plugin terpasang, skill-skill Figma ikut tersedia; muat yang relevan sebelum memanggil tool (lihat SKILL.md › Prinsip).
