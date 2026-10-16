# Integrasi Stitch (CLI resmi / MCP)

Dibaca di Fase 5 saat user memilih jalur otomatis. Berisi urutan jalur yang disarankan untuk Claude Code, pengecekan integrasi (wajib setiap sesi), diagnosis masalah, dan panduan setup. Jalur manual (export zip dari canvas) selalu tersedia sebagai cadangan; jangan memaksa jalur otomatis.

> **Status sumber (dicek 2026-10-15).** Paket `@google/stitch` v0.11.1 diterbitkan oleh Google Labs (repo `google-labs-code/stitch-sdk`, maintainer akun Google); perintah di bawah diambil dari README paket itu. Halaman resmi `stitch.withgoogle.com/docs/mcp/setup` belum bisa dibaca isinya dari lingkungan pembuat skill. Nama tool MCP dan bentuk output belum diuji pada akun nyata. Selalu percayai **perintah `--help`/`--schema` dan tool yang benar-benar terdaftar di sesi**, bukan file ini; jika berbeda, ikuti yang nyata dan usulkan pembaruan file ini.

## Jalur

| Jalur | Untuk Claude Code | Auth | Catatan |
|---|---|---|---|
| **C. CLI resmi** (`@google/stitch`) dipanggil lewat shell | **Default** | `stitch login` (OAuth di browser), plus `STITCH_API_KEY` jika diminta | Tidak butuh MCP sama sekali; agent menjalankan `stitch find … --json` / `stitch get … --json` |
| **M. MCP stdio dari CLI resmi** (`stitch mcp start`) | Opsional, jika ingin tool MCP | sama dengan C | Server lokal; tidak ada header/token di config Claude Code |
| R. MCP remote `https://stitch.googleapis.com/mcp` + header `X-Goog-Api-Key` | **Tidak disarankan** | API key di header | Dilaporkan gagal di Claude Code: header diabaikan, Claude Code mencoba OAuth lalu error *"Incompatible auth server: does not support dynamic client registration"* (issue #41664, ditutup "not planned"). Selain itu key tersimpan sebagai teks biasa di `~/.claude.json` |
| P. Proxy komunitas (`@_davideast/stitch-mcp`) | Cadangan terakhir | gcloud | Kode pihak ketiga; hanya versi yang di-pin dan sudah ditinjau |

## Pengecekan integrasi (C1–C5)

Jalankan berurutan. Berhenti di langkah pertama yang gagal, lalu buka bagian Diagnosis.

| Langkah | Jalur C (CLI) | Jalur M (MCP) | Lolos jika |
|---|---|---|---|
| C1. Tersedia | `stitch --version` | Tool berawalan `mcp__stitch__` terdaftar di sesi (cari "stitch" lewat pencarian tool jika ada) | Versi tercetak / tool ada |
| C2. Terautentikasi | `stitch status --json` | Panggil tool daftar project | Kredensial aktif, tanpa error auth |
| C3. Akun benar | `stitch find projects --limit 20 --json` → tampilkan nama project ke user | sama, lewat tool | User mengonfirmasi project desain dari Fase 3 ada di daftar |
| C4. Layar terbaca | `stitch find screen --project <id> --json` (cek opsi lewat `stitch find --help`) | tool daftar layar | Jumlah dan nama layar cocok dengan canvas |
| C5. Aset terambil | `stitch get screen <screen-id> --project <id> --json` untuk satu layar | tool ambil layar | Ada HTML/kode atau URL aset yang bisa disimpan |

Hasil cek dicatat di `docs/design/export/README.md` › Integrasi (jalur, tanggal, nama project Stitch, hasil C1–C5). **Jangan menulis email, token, atau API key ke repo.** Cukup "akun pemilik project Stitch: pribadi/kantor".

⛔ Jika C1–C5 lolos: tampilkan ringkasannya ke user dan minta konfirmasi sebelum menyimpan file. Jika ada yang gagal: tampilkan diagnosis + panduan, dan tawarkan jalur manual sambil menunggu.

## Diagnosis

| Gejala | Kemungkinan penyebab | Tindakan |
|---|---|---|
| C1: `stitch: command not found` | CLI belum dipasang, atau dipasang dengan Node versi lain (nvm) | Setup › Langkah 1; cek `node -v` (≥20) |
| C1 (MCP): tool tidak ada | Server belum didaftarkan di scope user, atau Claude Code belum direstart | Setup › Jalur M; `claude mcp list` |
| C2: belum login / token kedaluwarsa | Belum `stitch login`, atau login di mesin lain | `stitch login`, lalu `stitch status` |
| C2/C4: `MISSING_CANVAS_CREDENTIALS` | Sebagian operasi canvas butuh API key selain OAuth (keterbatasan yang disebut README CLI) | Buat API key Stitch dari akun yang sama, `export STITCH_API_KEY=…` di shell profile, buka terminal baru |
| Jalur R: *"Incompatible auth server: does not support dynamic client registration"* | Claude Code mengabaikan header API key dan mencoba OAuth DCR | Hapus server remote (`claude mcp remove stitch`), pakai Jalur C atau M |
| C2: 401 / `AUTH_FAILED` | Kredensial salah, dicabut, atau milik akun lain | `stitch logout` → `stitch login` dengan akun yang benar; buat ulang API key |
| C2 lolos, **C3: daftar kosong atau project tidak ada** | **Akun berbeda:** login CLI/API key milik akun Google lain dari akun yang login di stitch.withgoogle.com | Lihat Akun berbeda |
| C3 lolos, C4 jumlah layar beda | Layar lama/duplikat belum dihapus, atau project lain dengan nama mirip | Minta user membersihkan canvas atau memilih project yang benar |
| C5: output tanpa HTML/aset | Bentuk output `get screen` berbeda dari dugaan | Cek `stitch get screen --help` / `--schema`; jika tetap tidak ada HTML, export manual untuk file HTML dan pakai CLI hanya untuk daftar layar |

## Akun berbeda

Project Stitch milik akun Google yang sedang login di stitch.withgoogle.com. Login CLI (`stitch login`) dan API key harus berasal dari **akun yang sama**.

1. Di stitch.withgoogle.com, klik avatar kanan atas → catat akun yang memiliki project desain.
2. `stitch status --json` → cocokkan akun yang aktif. Jika beda: `stitch logout`, lalu `stitch login` dan pilih akun yang benar di browser.
3. API key (jika dipakai) dibuat ulang **sambil login dengan akun itu**.
4. Jika project dibuat di akun lain dan tidak bisa dipindah: login dengan akun itu, atau pakai jalur manual (export dari akun pemilik).

Akun kantor (Google Workspace) bisa dibatasi admin untuk Stitch. Jika ditolak: pilih satu akun dan buat ulang project desain di sana, atau tetap di jalur manual.

## Panduan setup

Prinsip: pasang di **scope user**, bukan `.mcp.json` repo; tidak ada kredensial di file repo maupun di config MCP. Versi paket di-pin; naikkan versi secara sadar setelah membaca changelog-nya.

### Langkah 1 — CLI resmi (Jalur C)

```bash
npm install -g @google/stitch@0.11.1   # Node ≥20; versi yang ditinjau 2026-10-15
stitch login                            # OAuth di browser, akun pemilik project Stitch
stitch status
stitch find projects --limit 10         # project desain harus muncul
```

Jika muncul `MISSING_CANVAS_CREDENTIALS`: buat API key Stitch (pengaturan akun di stitch.withgoogle.com, akun yang sama), lalu di shell profile (`~/.zshrc` / `~/.bashrc`):

```bash
export STITCH_API_KEY="…"   # jangan commit file ini; buka terminal baru setelahnya
```

Selesai — Jalur C tidak butuh langkah lain. Jalankan C1–C5.

### Langkah 2 — MCP stdio (Jalur M, opsional)

```bash
claude mcp add --scope user stitch -- stitch mcp start
```

Server berjalan sebagai proses lokal dan mewarisi environment shell yang menjalankan Claude Code, sehingga `STITCH_API_KEY` tidak perlu (dan jangan) ditulis ke config. README CLI juga menyediakan `stitch mcp install`; jika memakainya, cek dengan `claude mcp list` bahwa server terdaftar di scope user, bukan di file project. Restart Claude Code → `/mcp` → jalankan C1–C5.

### Cadangan — proxy komunitas (Jalur P)

Hanya jika Jalur C/M gagal setelah diagnosis. Tinjau repo dan isi paket lebih dulu; pakai versi tetap, bukan `@latest`:

```bash
npx @_davideast/stitch-mcp@0.9.0 init   # versi yang ada di npm per 2026-10-15; tinjau sebelum dipakai
```

Ikuti instruksi `init`-nya (gcloud ADC), daftarkan di scope user, lalu C1–C5.

## Setelah integrasi lolos

- Untuk setiap layar `UI-xx` berstatus Final di `screens.md`: ambil layar (CLI `get screen` atau tool MCP), simpan HTML/kode ke `docs/design/export/batch-N/UI-xx-<slug>.html` dan gambar ke `.png` jika tersedia. Ambil design system jika tersedia (`stitch find design-system …`); jika tidak, minta user export DESIGN.md manual.
- Pemetaan layar Stitch → `UI-xx` berdasarkan nama layar; yang tidak cocok ditanyakan ke user, jangan ditebak.
- Skill ini **hanya memakai operasi baca** (`find`, `get`, tool daftar/ambil). `generate`, `edit`, `create`, `delete`, `upload`, dan `capture` tidak dipakai: setiap batch tetap dibuat dan direview user di canvas.
