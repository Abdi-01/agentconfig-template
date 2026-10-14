# Coding Style

Aturan penulisan kode yang tidak bergantung pada framework. Baca sebelum menulis, mengubah, atau me-review kode; aturan yang bergantung pada stack ada di `stack/`.

## Yang ditegakkan tool (tidak ditulis ulang di sini)

| Aspek | Sumber | Command |
|---|---|---|
| Type safety (`strict`, path alias) | `tsconfig.json` | `npx tsc --noEmit` |
| Lint | config ESLint project — `[TIDAK ADA — rekomendasi]`, lihat `stack/README.md` bagian Tooling | `npm run lint` |
| Format | config Prettier project — `[TIDAK ADA — rekomendasi]` | `npm run format` |

Selama lint/format belum dikonfigurasi: ikuti gaya file di sekitarnya (kutip ganda, titik koma) dan JANGAN memformat ulang file yang tidak diubah.

## Prinsip umum

1. **Reuse dulu, baru tulis (U-02).** WAJIB mencari helper/modul yang sudah ada (grep nama fungsi; cek folder util, lib, hooks, components, middleware) sebelum menulis yang baru. Saat logika yang sama muncul untuk kedua kalinya, ekstrak ke modul bersama di commit yang sama. JANGAN membuat abstraksi generik sebelum dipakai di ≥2 tempat.
2. **Batas adapter (U-04).** Data dari sistem eksternal (API, storage, SDK, layanan pihak ketiga) punya tipe "wire" sendiri dan dipetakan ke tipe internal di satu fungsi per domain. Kode lain JANGAN membaca bentuk wire secara langsung. Adapter WAJIB memetakan semua field wire yang dibutuhkan, dan setiap ketidakcocokan bentuk (mis. string → number, nama field lama vs baru) diberi komentar.
3. **Tidak ada silent failure (U-05).** Kegagalan operasi tulis WAJIB terlihat oleh pemanggilnya: di UI sebagai pesan yang bisa ditindaklanjuti, di API sebagai response error. Hanya side-effect non-kritis (mis. kirim email, unggah salinan foto) yang boleh ditelan agar tidak menggagalkan operasi utama, dan WAJIB di-log dengan konteks.
4. **Tanggal, waktu, angka, mata uang (U-03).** Pertukaran data memakai ISO-8601 UTC. Parsing WAJIB eksplisit soal zona waktu — JANGAN `new Date("YYYY-MM-DDTHH:mm")` tanpa offset. Formatting WAJIB lewat satu modul berbasis `Intl` dengan locale dan timezone produk (ditetapkan di `project/technical-requirements.md`); JANGAN menulis array nama bulan/hari manual. Bedakan *instant* (momen absolut, mis. `createdAt`) dari *wall-clock* (jam jadwal lokal tanpa zona, mis. slot praktik): instant diformat ke timezone produk; wall-clock ditampilkan apa adanya dan dibandingkan dengan "sekarang" dalam timezone produk. Logika "sekarang / hari ini / bulan ini" di server (kuota harian, cutoff, laporan bulanan) WAJIB memakai timezone produk lewat satu modul waktu. Cara backend mengodekan keduanya dicatat di `project/api-contract.md`.
5. **Komentar menjelaskan *kenapa* (U-10).** Tulis komentar untuk hal yang tidak terlihat dari kode: alasan, batasan eksternal, rujukan ke `project/decisions.md` atau dokumen kontrak. JANGAN mengomentari hal yang sudah jelas dari kode. Bahasa komentar mengikuti `project/technical-requirements.md`.
6. **Dokumentasi dan kontrak ikut kode (U-14, BU-11).** Perubahan yang membuat isi `project/`, `standards/`, atau dokumen kontrak kanonik tidak lagi benar WAJIB memperbaruinya di commit yang sama. Endpoint atau model data baru ditulis di kontrak kanonik lebih dulu atau bersamaan, tidak menyusul.
7. **Dependensi eksternal (U-11, BU-09).** Setiap panggilan ke layanan pihak ketiga: satu modul client per layanan, base URL/kredensial dari env, timeout eksplisit, error dipetakan ke error internal yang jelas, bentuk response dinormalisasi di boundary (poin 2). Layanan berbayar/berkuota dijaga kuota di server dan JANGAN dipanggil dari test.

## Frontend

- **Tidak ada elemen interaktif mati (U-01).** Tombol, link, dan menu WAJIB punya perilaku. Fitur yang belum siap ditampilkan `disabled` dengan keterangan, bukan tombol aktif tanpa aksi.
- **Tidak ada artefak debug di UI (U-12).** JANGAN merender ID requirement, label debug, atau data mentah. JANGAN meninggalkan `console.log`; `console.error`/`console.warn` hanya untuk kegagalan nyata dengan prefix konteks: `console.error("<NamaUnit>: failed to <aksi>", error)`.
- **Fail-soft di jalur render (U-11).** Jika satu bagian halaman gagal memuat data eksternal, sembunyikan bagian itu atau tampilkan fallback; JANGAN membuat seluruh halaman crash. Kebijakan fail-open/fail-closed WAJIB dikomentari di tempatnya.

## Backend

- **Integritas dan konkurensi di database (BU-04).** Aturan "tidak boleh ganda" atau "hanya sekali" ditegakkan oleh constraint (unique/partial unique index), update bersyarat (compare-and-set), lock, atau transaksi. Pengecekan di aplikasi (mis. endpoint ketersediaan) hanya sinyal untuk UI. Pelanggaran constraint diterjemahkan ke error 409 yang ramah.
- **Multi-write atomik (BU-05).** Operasi yang menulis lebih dari satu baris/tabel (mis. replace-all relasi anak, buat order lalu kosongkan keranjang) WAJIB berada dalam satu transaksi.
- **Siklus status eksplisit (BU-07).** Entitas berstatus memakai tabel transisi yang diizinkan dan status terminal. Transisi yang punya efek samping (mis. pembayaran → selesai) hanya lewat aksi khususnya, bukan update status bebas.
- **Hapus aman (BU-08).** Entitas yang masih direferensikan JANGAN di-hard-delete: tolak dengan 409 dan arahkan ke penonaktifan (`isActive`). Saat menambah relasi/foreign key baru ke suatu entitas, guard penghitung pemakaiannya WAJIB ikut diperbarui.
- **Logging (BU-12).** Semua output log lewat satu logger (bukan `console.*`), dengan konteks unit dan aksi. Level: 4xx yang diharapkan → `warn`/`info`, 5xx/exception → `error` dengan stack. JANGAN me-log data pribadi, token, password, atau secret.
- **Fitur nonaktif dinyatakan eksplisit.** Kode yang disiapkan tapi belum diaktifkan diberi komentar yang menyebut keputusan dan cara mengaktifkannya; JANGAN membuat endpoint palsu yang tampak berfungsi.

## Penamaan & typing

- Tipe data/domain memakai `type`; konstanta data tingkat modul `UPPER_SNAKE_CASE`; fungsi dan variabel `camelCase`; tipe dan class `PascalCase`. `[TERBUKTI di project asal]`
- Boolean diawali `is`/`has`/`can`/`should` (`isValid`, `isAllowed`). `[DISIMPULKAN]`
- JANGAN memakai `any`; pakai `unknown` lalu narrowing. JANGAN memakai `@ts-ignore`; `@ts-expect-error` hanya dengan komentar alasan.
- Nilai "tidak ada" yang disengaja memakai `null`; `undefined` hanya untuk field opsional yang tidak diisi.
- Import antar-folder memakai path alias project jika tersedia; konvensi import relatif dicatat di file stack.
- Satu konsep = satu nama di seluruh codebase. Nilai enumerasi (role, status, sumber lead, kategori) disimpan di satu konstanta per domain; JANGAN menulis literal string yang sama di tempat lain. Jika label tampilan berbeda dari nilai mentah, pemetaannya juga di satu konstanta.

## Error handling

- Error dari sistem eksternal dinormalisasi di satu boundary menjadi satu kelas error (pesan yang aman ditampilkan + status/kode). Implementasi per stack: lihat `stack/README.md`.
- Pesan error untuk user memakai bahasa produk, spesifik pada aksi ("Gagal menyimpan …", "Slot ini sudah dipesan …"), tanpa stack trace atau detail internal. Bentuk error API: `api-design.md`.

## Dependency (U-13)

- Dependency baru WAJIB punya alasan di body commit. Cek dulu apakah kebutuhan sudah terpenuhi dependency yang ada, dan cek kompatibilitasnya dengan tooling project (mis. format modul ESM/CJS, versi TypeScript).
- CLI/tool build-time (generator, codegen, builder platform, watcher) masuk `devDependencies`, bukan `dependencies`.
- Dependency yang tidak lagi di-import dihapus.
- Versi dependency bersama antar-repo dalam satu produk SEBAIKNYA disamakan.
