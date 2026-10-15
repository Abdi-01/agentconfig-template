# Integrasi Stitch MCP

Dibaca di Fase 5 saat user memilih jalur MCP. Berisi pengecekan integrasi (wajib setiap sesi), diagnosis masalah, dan panduan setup. Jalur manual (export zip) selalu tersedia sebagai cadangan; jangan memaksa MCP.

> Status sumber: endpoint dan nama tool berasal dari panduan komunitas dan laporan forum Google per Oktober 2026, bukan dokumentasi resmi yang terverifikasi. Selalu percayai **tool yang benar-benar terdaftar di sesi**, bukan daftar di file ini. Jika user menemukan dokumentasi resmi yang berbeda, ikuti dokumentasi itu dan usulkan pembaruan file ini.

## Pengecekan integrasi (C1–C5)

Jalankan berurutan. Berhenti di langkah pertama yang gagal, lalu buka bagian Diagnosis.

| Langkah | Cara | Lolos jika |
|---|---|---|
| C1. Tool terdaftar | Cari tool berawalan `mcp__stitch__` (atau nama server lain yang memuat "stitch") di daftar tool sesi; jika ada tool pencarian tool (ToolSearch), cari kata "stitch" | Ada minimal tool untuk daftar project dan ambil layar |
| C2. Server merespons | Panggil tool daftar project (mis. `list_projects`) | Tidak error koneksi/auth |
| C3. Akun benar | Tampilkan nama project yang dikembalikan ke user, lalu tanya: "Project desain ini ada di daftar? Nama project di Stitch: …" | Project yang dipakai di Fase 3 ada di daftar |
| C4. Layar terbaca | Panggil tool daftar layar (mis. `list_screens`) untuk project itu | Jumlah dan nama layar cocok dengan canvas Stitch |
| C5. Aset bisa diambil | Panggil tool ambil layar (mis. `get_screen`) untuk satu layar | Ada HTML/kode atau URL aset yang bisa disimpan |

Hasil cek dicatat di `docs/design/export/README.md` › Integrasi (jalur, tanggal, nama project Stitch, hasil C1–C5). **Jangan menulis email atau API key ke repo.** Cukup "akun pemilik project Stitch: pribadi/kantor".

⛔ Jika C1–C5 lolos: tampilkan ringkasannya ke user dan minta konfirmasi sebelum menyimpan file. Jika ada yang gagal: tampilkan diagnosis + panduan, dan tawarkan jalur manual sambil menunggu.

## Diagnosis

| Gejala | Kemungkinan penyebab | Tindakan |
|---|---|---|
| C1: tidak ada tool stitch | MCP belum dipasang, dipasang di scope project lain, atau Claude Code belum direstart | Panduan setup › Langkah 1–3; cek `claude mcp list` di terminal |
| C1: server terdaftar tapi status gagal di `/mcp` | Header/kredensial salah, atau proxy lokal tidak jalan | Ulangi pemasangan; lihat Jalur A/B |
| C2: error "API keys are not supported" / meminta OAuth | Endpoint menolak API key untuk akun/region itu (dilaporkan di forum Google) | Pindah ke Jalur B (gcloud) |
| C2: 401/403 | Key tidak valid, dicabut, atau Stitch API belum aktif di Google Cloud project | Buat key baru; aktifkan Stitch API (Jalur B langkah 3) |
| C2 lolos, **C3: daftar kosong atau project tidak ada** | **Akun berbeda:** kredensial MCP milik akun Google lain dari akun yang login di stitch.withgoogle.com (mis. akun pribadi vs akun kantor/Workspace) | Lihat bagian Akun berbeda |
| C3 lolos, C4 jumlah layar beda | Layar lama/duplikat belum dihapus, atau project Stitch berbeda dengan nama mirip | Minta user membersihkan canvas atau memilih project yang benar |
| C5: tool generate/edit gagal, tool baca berhasil | Dilaporkan terjadi pada sebagian akun | Tidak masalah untuk skill ini: Fase 5 hanya butuh tool baca |

## Akun berbeda

Project Stitch milik akun Google yang sedang login di stitch.withgoogle.com. Kredensial MCP (API key atau login gcloud) harus berasal dari **akun yang sama**.

Langkah memastikan:
1. Di stitch.withgoogle.com, klik avatar kanan atas → catat email akun yang memiliki project desain.
2. Jalur A (API key): buat ulang key dari pengaturan Stitch **sambil login dengan akun itu**.
3. Jalur B (gcloud): di terminal, `gcloud auth list` → akun bertanda `*` harus sama. Jika beda: `gcloud auth application-default login` lalu pilih akun yang benar di browser.
4. Jika project dibuat di akun lain dan tidak bisa dipindah: jalankan ulang pengecekan dengan kredensial akun itu, atau pakai jalur manual (export dari akun yang memiliki project).

Peringatan untuk user: akun kantor (Google Workspace) bisa dibatasi admin untuk Stitch atau Google Cloud. Jika akun kantor ditolak, pilih salah satu akun dan buat ulang project desain di akun tersebut, atau tetap di jalur manual.

## Panduan setup

Pemasangan selalu di **scope user**, bukan `.mcp.json` repo, supaya kredensial tidak ikut ter-commit ke repo klien. Kredensial disimpan sebagai environment variable di shell profile, bukan di file repo.

### Langkah 1 — Pilih jalur

| Jalur | Kapan | Kelebihan | Risiko |
|---|---|---|---|
| A. Remote + API key | Default; coba dulu | Tanpa proxy lokal, satu perintah | Sebagian akun dilaporkan ditolak (minta OAuth) |
| B. gcloud + proxy lokal | Jalur A ditolak | Memakai login Google akun yang jelas | Butuh Google Cloud CLI dan paket proxy komunitas (`@_davideast/stitch-mcp`); kode pihak ketiga masuk ke mesin |

### Jalur A — Remote + API key

1. Login stitch.withgoogle.com dengan akun pemilik project → pengaturan → buat API key Stitch. (Key Stitch berbeda dengan key Gemini API.)
2. Simpan di shell profile (`~/.zshrc` / `~/.bashrc`): `export STITCH_API_KEY="…"`, lalu buka terminal baru.
3. Pasang:
   ```bash
   claude mcp add --transport http --scope user stitch https://stitch.googleapis.com/mcp \
     --header "X-Goog-Api-Key: $STITCH_API_KEY"
   ```
4. Restart Claude Code → `/mcp` → server `stitch` harus berstatus terhubung. Lalu jalankan C1–C5.

### Jalur B — gcloud + proxy lokal

1. Pasang Google Cloud CLI, lalu `gcloud auth application-default login` dengan akun pemilik project Stitch.
2. Pilih Google Cloud project: `gcloud config set project <PROJECT_ID>` dan `gcloud auth application-default set-quota-project <PROJECT_ID>`.
3. Aktifkan API: `gcloud services enable stitch.googleapis.com`.
4. Tinjau paket proxy sebelum dipakai (repo, maintainer, versi). Pasang di scope user dengan env `STITCH_USE_SYSTEM_GCLOUD=1`, `GOOGLE_CLOUD_PROJECT=<PROJECT_ID>`, `DOTENV_QUIET=true`; perintah server: `npx -y @_davideast/stitch-mcp@latest proxy`.
5. Restart Claude Code → `/mcp` → jalankan C1–C5.

Jika keduanya gagal setelah diagnosis: pakai jalur manual. Desain tetap bisa dibawa ke repo tanpa MCP; MCP hanya mempercepat export.

## Setelah integrasi lolos

- Untuk setiap layar `UI-xx` berstatus Final di `screens.md`: ambil lewat tool ambil layar, simpan HTML/kode ke `docs/design/export/batch-N/UI-xx-<slug>.html` dan gambar ke `.png` jika tersedia. Ambil juga design system/DESIGN.md jika tool menyediakannya; jika tidak, minta user export DESIGN.md manual.
- Pemetaan layar Stitch → `UI-xx` berdasarkan nama layar; yang tidak cocok ditanyakan ke user, jangan ditebak.
- Skill ini **hanya memakai tool baca**. Tool generate/edit tidak dipakai: setiap batch tetap direview user di canvas.
