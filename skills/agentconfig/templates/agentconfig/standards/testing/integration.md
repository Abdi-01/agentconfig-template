# Integration Test

Standar test untuk unit yang bekerja bersama dependensinya: komponen UI dengan hook/provider/mock jaringan (frontend), atau endpoint HTTP lewat app sungguhan dengan database di-mock atau database test (backend). Baca saat menguji form, dialog, list, guard role, atau endpoint API apa pun.

> Aturan umum ada di `README.md`. Bagian Frontend `[TIDAK ADA — rekomendasi]` di project asal; bagian Backend `[TERBUKTI]` untuk DB di-mock, `[TIDAK ADA — rekomendasi]` untuk DB test.

## Frontend — komponen

### Setup

- Render lewat helper `renderWithProviders` di folder test helper yang menyediakan semua provider: query client **baru per test** dengan `retry: false`, serta provider sesi/locale bila ada.
- MSW menjadi satu-satunya mock jaringan. Handler default di folder handler bersama; override per test dengan `server.use(...)`. Handler mengembalikan envelope response persis seperti backend (lihat `project/api-contract.md`).
- Environment test: `jsdom`, setup `@testing-library/jest-dom`.

### Yang wajib diuji per komponen data

- State **loading, kosong, sukses, dan error**, termasuk pesan error dari helper error terpusat.
- **Form:** validasi menonaktifkan submit; payload yang dikirim benar (di-trim, field kosong tidak dikirim); setelah sukses dialog menutup dan list di-refresh; saat gagal pesan error tampil di dalam form.
- **Mutation:** invalidasi query yang benar — assert ada request ulang ke endpoint list setelah mutation sukses.
- **Guard role:** konten terbatas tidak dirender untuk role yang tidak berhak.

### Query DOM

- Prioritas selector: `getByRole` (dengan `name`) → `getByLabelText` → `getByPlaceholderText` → `getByText`. `data-testid` hanya jika tidak ada alternatif yang aksesibel.
- Primitive headless (mis. Base UI Checkbox/Radio/Select) merender elemen ber-role terpisah dari input tersembunyi: pakai `getByRole("checkbox" | "radio" | "combobox")`, bukan `getByLabelText`. Detail: `../stack/shadcn-base-ui-tailwind4.md`.
- Interaksi memakai `user-event`, bukan `fireEvent`. Gunakan `findBy*` untuk elemen yang muncul setelah request.

## Backend — endpoint HTTP

### Setup

- Request dikirim ke instance app (tanpa `listen`) lewat client HTTP test (mis. supertest), sehingga routing, middleware auth, validasi, controller, service, dan error handler ikut teruji.
- **Level 1 — DB di-mock:** modul client database di-mock di boundary, satu `jest.fn`/`vi.fn` per method model yang dipakai. Modul integrasi pihak ketiga (layanan analisis, penyimpanan file, email) ikut di-mock.
- **Level 2 — DB test:** untuk constraint, migration, transaksi, lock, dan SQL mentah yang tidak bisa dibuktikan dengan mock, jalankan terhadap database test terpisah yang di-migrate dari nol dan dibersihkan per suite. JANGAN memakai database dev bersama atau produksi. `[TIDAK ADA — rekomendasi]`
- Env test (secret JWT, URL layanan) di-set sebelum app di-import; token dibuat dengan helper pembuat token milik app.

### Yang wajib diuji per endpoint

- **Guard:** tanpa token → 401; role yang tidak diizinkan → 403; untuk setiap role yang diizinkan → sukses (matriks lengkapnya di `security.md`).
- **Kepemilikan/scope:** resource milik user lain → 403/404; list di-scope (assert argumen query ke DB memuat filter pemilik).
- **Validasi:** field wajib hilang/format salah → 400 dengan pesan yang bisa ditampilkan; field tak dikenal tidak sampai ke database.
- **Aturan bisnis:** setiap cabang `AppError`/error bisnis (konflik 409, transisi status tidak valid, cutoff, kuota 429).
- **Bentuk response:** envelope sesuai kontrak; field rahasia tidak ada (assert eksplisit `not.toHaveProperty("passwordHash")`).
- **Integrasi eksternal:** sukses, penolakan (422), gagal (502), timeout (504), dan bentuk response lama/baru.

### Contoh

```ts
import request from "supertest";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

import { createApp } from "../src/app";
import { signAccessToken } from "../src/auth/token";

const findUniqueMock = jest.fn();
jest.mock("../src/db/client", () => ({
  __esModule: true,
  default: { item: { findUnique: (...args: unknown[]) => findUniqueMock(...args) } },
}));

const app = createApp();

describe("GET /api/items/:id", () => {
  it("returns 403 when the item belongs to another customer", async () => {
    // Arrange
    findUniqueMock.mockResolvedValue({ id: "item-1", customerId: "cust-2" });
    const token = signAccessToken({ id: "cust-1", role: "customer" });

    // Act
    const res = await request(app).get("/api/items/item-1").set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.status).toBe(403);
    expect(res.body.isSuccess).toBe(false);
  });
});
```
