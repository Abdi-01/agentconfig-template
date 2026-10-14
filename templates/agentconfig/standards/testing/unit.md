# Unit Test

Standar test untuk fungsi murni tanpa DOM, jaringan, atau database. Baca saat menambah atau mengubah adapter, formatter, validator, util, kalkulasi/scoring bisnis, state machine, helper waktu, atau query key factory.

> Aturan umum (lokasi, naming, AAA, mocking) ada di `README.md`; tool per stack di `README.md` bagian "Tool per stack".

## Cakupan prioritas

1. **Adapter wire → internal**: semua field yang dipakai terpetakan, konversi tipe (string desimal → number), nilai `null`/kosong, relasi array kosong, field bilingual dengan fallback, bentuk lama vs baru dari layanan eksternal.
2. **Formatter dan helper waktu**: batas zona waktu (tengah malam UTC vs timezone produk), awal hari/bulan di timezone produk, wall-clock vs instant, input tidak valid, nilai nol/negatif.
3. **Validator** yang meniru kebijakan server (password, slug, format kode, nomor HP).
4. **Logika bisnis murni** (backend): scoring/ranking, kalkulasi total dan diskon, tabel transisi status, aturan cutoff/kuota — dipisah dari akses database agar bisa diuji tanpa mock.
5. **Helper lain:** pembuat slug, pemetaan label status, query key factory (bentuk key dan normalisasi parameter).

## Pola

- Banyak kombinasi input/output → table-driven (`it.each`).
- Tanpa akses jaringan, storage, database, atau DOM. Jika fungsi menyentuh dependensi itu, pisahkan logikanya atau injeksikan dependensinya sebagai parameter; selain itu uji di integration.
- Fungsi yang bergantung pada "sekarang" menerima `now` sebagai parameter (default `new Date()`) atau diuji dengan fake timer.
- Fixture wire disalin dari bentuk response/row asli dan disimpan di folder fixture bersama.
- Assertion spesifik (`toBe`, `toEqual` pada objek hasil lengkap), bukan sekadar `toBeTruthy`.

## Contoh

Contoh memakai API `describe/it/expect` yang sama di Vitest maupun Jest (di Jest berupa global, tanpa import).

```ts
import { describe, expect, it } from "vitest";
import { mapApiItem } from "./itemService";
import { apiItemFixture } from "@/test/fixtures/item";

describe("mapApiItem", () => {
  it("converts the decimal price string into a number", () => {
    // Arrange
    const wire = { ...apiItemFixture, priceNumeric: "250000.00" };

    // Act
    const item = mapApiItem(wire);

    // Assert
    expect(item.price).toBe(250000);
  });

  it.each([
    ["pending", "confirmed", true],
    ["completed", "pending", false],
  ])("allows %s → %s: %s", (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected);
  });
});
```
