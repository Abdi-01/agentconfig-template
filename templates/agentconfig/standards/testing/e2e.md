# End-to-End Test

Standar test alur lengkap: alur user di browser nyata (frontend), atau alur multi-endpoint terhadap server dan database test (backend). Baca saat menambah atau mengubah alur kritis (login, transaksi, pemesanan, form multi-langkah), atau saat memverifikasi fitur sebelum dinyatakan selesai.

> `[TIDAK ADA — rekomendasi]` sebagai suite otomatis di project asal; Playwright baru dipakai untuk verifikasi manual dan screenshot. Aturan umum ada di `README.md`. Daftar alur kritis yang WAJIB punya e2e ditetapkan di `project/prd.md`.

## Frontend — browser

### Setup

- `@playwright/test` dengan project Chromium minimal, ditambah viewport mobile untuk alur yang banyak dipakai di ponsel.
- `webServer` di `playwright.config.ts` menjalankan app lokal. Backend diarahkan ke backend lokal dengan DB test, atau mock; JANGAN ke production.
- Login sekali per role lewat setup project dan simpan `storageState` di `e2e/.auth/` (masuk `.gitignore`).
- Kredensial uji dibaca dari env (`E2E_*`); JANGAN di-hardcode di repo.

### Aturan

- Selector mengikuti prioritas di `integration.md` (`getByRole`, `getByLabel`, `getByPlaceholder`).
- Navigasi client-side bisa memakan beberapa detik saat menunggu data. Setelah klik yang memicu navigasi, tunggu URL berubah (`await expect(page).toHaveURL(...)` atau `page.waitForURL(...)`); JANGAN memakai `waitForTimeout`.
- Aksi destruktif (hapus, batal, bayar) hanya di lingkungan uji yang terisolasi. Di lingkungan bersama, cukup sampai dialog konfirmasi lalu pilih batal.
- Fitur kamera: jalankan Chromium dengan `--use-fake-device-for-media-stream` dan `--use-fake-ui-for-media-stream`.
- API pihak ketiga berbayar/berkuota diganti mock server lokal.
- Artefak hanya saat gagal: `trace: "on-first-retry"`, `screenshot: "only-on-failure"`.
- Satu file spec per alur; setiap test independen dan tidak bergantung urutan.

### Contoh

```ts
import { expect, test } from "@playwright/test";

test("user can sign in and reach the dashboard", async ({ page }) => {
  // Arrange
  await page.goto("/signin");

  // Act
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL ?? "");
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Assert
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Backend — alur API

- Alur kritis diuji sebagai rangkaian request terhadap server yang berjalan dengan **database test** (di-migrate dari nol + seed minimal), mis. buat jadwal → tandai hadir → catat tindakan → bayar → status selesai; atau keranjang → checkout → order.
- Setiap langkah memakai token role yang sebenarnya melakukan langkah itu (customer, staf, admin).
- Assert state akhir lewat endpoint baca (bukan query DB langsung), plus efek samping yang terlihat (status, total, notifikasi yang di-mock).
- Layanan pihak ketiga diganti mock server lokal; waktu dikunci agar aturan cutoff/kuota deterministik.
- Database test dihapus/di-reset di awal suite; JANGAN menjalankan e2e ke database dev bersama atau produksi.
