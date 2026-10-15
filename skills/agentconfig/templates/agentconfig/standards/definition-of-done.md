# Definition of Done

Checklist yang WAJIB dijalankan agent sebelum menyatakan tugas selesai. Baca sebelum melapor "selesai", termasuk untuk perubahan kecil.

## Checklist

| # | Langkah | Command / cara | Syarat lulus |
|---|---|---|---|
| 1 | Type-check | `npm run typecheck` jika ada; selain itu `npx tsc --noEmit` | 0 error. Gagal = tugas belum selesai. |
| 2 | Lint | `npm run lint` jika script tersedia | 0 error; warning boleh tapi disebutkan di laporan. Jika script belum ada: tulis "lint: TODO — belum dikonfigurasi" di laporan; jangan dianggap lulus. |
| 3 | Test | Jika project punya suite test: jalankan **seluruh suite** (`npm test`), bukan hanya area yang diubah; tambah/ubah test untuk perilaku yang berubah. E2E jika alur user berubah (`npm run test:e2e`). | Semua lulus. Jika infrastruktur test belum ada: tulis "test: TODO — belum ada", lalu wajib langkah 6. Test yang sudah merah sebelum tugas dimulai disebutkan di laporan, tidak disembunyikan. |
| 4 | Build | `npm run build` jika mengubah config framework/compiler, struktur route, dependency, atau entrypoint | Build sukses |
| 5 | Migration (jika schema DB berubah) | Baca SQL migration yang dihasilkan; pastikan tidak ada `DROP` yang tidak disengaja (termasuk objek SQL manual); migration hanya diterapkan ke DB lokal/dev | SQL sesuai niat; tidak ada perintah ke DB produksi tanpa konfirmasi manusia |
| 6 | Verifikasi manual | Frontend: jalankan app dan coba alur yang diubah (atau script Playwright), termasuk state loading, kosong, dan error. Backend: panggil endpoint di server lokal dengan token setiap role yang relevan, termasuk kasus ditolak (401/403/409) | Perilaku sesuai; tidak ada error baru di console/log |
| 7 | Kebersihan | Tidak ada `console.log`, label debug, elemen interaktif mati, kode mati, field rahasia di response, atau TODO tanpa konteks | — |
| 7a | Kesederhanaan | Baca ulang diff (`git diff --stat` lalu isi diff) dengan aturan `coding-style.md` › Kesederhanaan: tidak ada kode/opsi/abstraksi yang tidak dipakai FR ini, tidak ada perubahan di luar tugas, tidak ada dependency baru tanpa alasan | Setiap file baru dan setiap abstraksi baru bisa dijelaskan dalam satu kalimat |
| 8 | Dokumen | Update file yang terdampak (tabel di bawah) | Dokumen sesuai kode |
| 9 | Env | Variabel env baru masuk file contoh env | — |

## Kapan dokumen wajib diperbarui

| Perubahan | File |
|---|---|
| Fitur baru, atau status fitur berubah | `project/prd.md` |
| Keputusan teknis baru, atau penyimpangan dari `standards/` | `project/decisions.md` |
| Endpoint, payload, guard, atau bentuk response berubah | `project/api-contract.md` dan dokumen kontrak kanonik di repo pemiliknya |
| Model, kolom, constraint, atau migration berubah | `project/data-model.md` (backend) dan ERD di kontrak kanonik |
| Folder, layer, middleware, provider, atau alur data baru | `project/architecture.md` |
| Token warna/font atau komponen reusable baru | `project/design-system.md` (frontend) |
| Dependency, env var, NFR, temuan security, atau tech debt berubah | `project/technical-requirements.md` |

## Laporan akhir

Sebutkan: command yang dijalankan beserta hasilnya, ringkasan diff (jumlah file dan baris ditambah/dihapus), langkah yang dilewati beserta alasannya, dan dokumen yang diperbarui. JANGAN menyatakan selesai jika langkah 1 gagal, jika test yang ada gagal karena perubahan tugas ini, atau jika langkah 3/6 tidak dilakukan sama sekali.
