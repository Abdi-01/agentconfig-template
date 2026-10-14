# Performance Test

Standar ringkas untuk mengukur dan menjaga performa halaman dan API. Baca saat mengubah halaman publik, endpoint yang sering dipanggil, query database berat, atau menambah dependency besar, gambar, atau font, dan saat ada laporan lambat.

> `[TIDAK ADA — rekomendasi]` sebagai pengukuran rutin di project asal (backend asal punya script load test manual). Target angka diambil dari NFR di `project/technical-requirements.md`; aturan umum ada di `README.md`.

## Yang diukur

| Metrik | Tool | Kapan |
|---|---|---|
| LCP, CLS, INP, TBT pada halaman kunci | Lighthouse CI (preset mobile) | setiap PR yang mengubah halaman publik |
| Ukuran bundle per route | bundle analyzer framework | saat menambah dependency atau komponen berat |
| Latency p50/p95 dan error rate endpoint kritis di bawah beban | autocannon / k6 | saat mengubah endpoint kritis, query, index, atau cache |
| Waktu query database untuk operasi kritis | log/EXPLAIN ANALYZE di DB test | saat menambah filter, join, atau index |

## Aturan

- Daftar halaman/endpoint kunci dan budget-nya ditetapkan di `project/technical-requirements.md`. PR yang melewati budget WAJIB menjelaskan alasannya.
- Load test dijalankan ke instance dengan **database terpisah** yang skala datanya representatif; JANGAN ke database dev bersama atau produksi.
- Klaim "memenuhi NFR performa" hanya sah jika didukung angka hasil pengukuran (tool, skenario, jumlah koneksi, durasi, p95), bukan dari membaca kode. Angka dicatat di body commit `perf:` atau di `project/technical-requirements.md`.
- Frontend: gambar lewat komponen gambar framework; font lewat loader font framework; JANGAN `@import` font eksternal di CSS. Sebelum menambah `React.memo`/`useMemo`/`useCallback` demi performa, buktikan masalahnya dengan React Profiler.
- Backend: setiap list dibatasi (lihat `../api-design.md`); query yang sering dipanggil punya index yang sesuai; cache in-memory hanya untuk data publik yang jarang berubah dan dicatat batas konsistensinya.
- Ukur di build production (`npm run build && npm start`, atau lingkungan deploy preview), bukan di dev server.
