# TanStack Query v5 + axios

Aturan akses API dari frontend: axios instance, service/adapter, query key, query hook, mutation, dan upload. Baca sebelum memanggil API, menulis service, query hook, atau mutation, atau saat menangani error API.

## Alur

`component` → `hooks/queries/use<Domain>` (atau `useMutation` inline) → `services/<domain>Service` → `lib/api/client` → backend.

Komponen JANGAN memanggil `axios`/`fetch` langsung. Pengecualian: modul server-only yang memanggil layanan selain backend utama (mis. penyimpanan config), dengan `fetch` dan `cache: "no-store"`.

## API client (S-04) — `src/lib/api/client.ts`

- Satu `axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, headers: { "Content-Type": "application/json" } })`.
- Request interceptor menempelkan `Authorization: Bearer <token>`. Akses storage dibungkus guard SSR (`typeof window === "undefined"`) dan `try/catch`.
- Response interceptor:
  - sukses → unwrap envelope backend (bentuknya di `project/api-contract.md`) sehingga service langsung menerima payload;
  - gagal → lempar `ApiError(message, status)` dengan pesan dari body error atau fallback;
  - app terautentikasi: 401 → hapus token lalu arahkan ke halaman login, hanya di sini.
- Ekspor `getApiErrorMessage(error, fallback)` untuk UI.

## Service & adapter (U-04) — `src/services/<domain>Service.ts`

- Fungsi `async` biasa, satu file per domain, diawali JSDoc yang menjelaskan perbedaan bentuk wire vs UI.
- Tipe wire `ApiXxx` dideklarasikan di file service dan mengikuti response asli (bukan tebakan). Tipe UI berada di `lib/data/<domain>.ts`.
- `mapApiXxx(api): Xxx` memetakan semua field yang dipakai UI. Nilai desimal yang dikirim sebagai string dikonversi dengan `Number(...)`; `null` dari API dinormalisasi sesuai tipe UI.
- Payload tulis bertipe eksplisit (`XxxPayload`). Field opsional yang kosong dikirim sebagai `undefined` (tidak terkirim), bukan string kosong.
- Fungsi yang bisa "tidak menemukan" data mengembalikan `null`, tidak pernah `undefined` — React Query v5 menolak `queryFn` yang resolve `undefined` (S-07).
- Service boleh dipanggil dari Server Component hanya untuk endpoint publik, karena token tidak tersedia di server.

## Query key (S-05) — `src/lib/api/queryKeys.ts`

```ts
export const queryKeys = {
  items: {
    all: ["items"] as const,
    list: (params?: ItemListParams) => ["items", "list", params ?? {}] as const,
    detail: (id: string) => ["items", "detail", id] as const,
  },
};
```

- Setiap key diawali root domain, sehingga `invalidateQueries({ queryKey: queryKeys.items.all })` mengenai semua turunannya.
- Parameter opsional dinormalisasi (`params ?? {}`, `id ?? null`). JANGAN menulis array key secara manual di hook atau komponen.

## Query hook (S-06) — `src/hooks/queries/use<Domain>.ts`

```ts
export function useItem(id: string) {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => getItem(id),
    enabled: Boolean(id),
  });
}
```

- Hook tipis: tanpa transformasi data (itu tugas adapter) dan tanpa side effect.
- Override opsi hanya jika ada alasan (mis. `retry: false` untuk endpoint "siapa saya", `refetchInterval` untuk polling proses async yang berhenti saat status final).

## QueryClient (S-08)

Dibuat sekali di `components/providers/QueryProvider.tsx` lewat `React.useState(() => new QueryClient(...))`, dengan default `staleTime: 60 * 1000`, `retry: 1`, `refetchOnWindowFocus: false`. Saat logout panggil `queryClient.clear()`.

## Mutation (S-09, keputusan audit frontend INK-02)

- `useMutation` ditulis inline di komponen yang memicu aksi. Dialog form memiliki mutation-nya sendiri (tidak menerima prop `onSave`); parent cukup memegang state buka/tutup dan item yang sedang diedit.
- WAJIB punya `onError` yang menampilkan `getApiErrorMessage(err, "<fallback>")` ke user (U-05).
- `onSuccess` meng-invalidate key domain lewat `queryKeys`, lalu menutup dialog.
- Tombol submit `disabled={mutation.isPending}` dengan indikator loading.
- Mutation yang dipakai ≥2 komponen dipindah ke `src/hooks/mutations/use<Action><Domain>.ts`. Penanganan error tetap wajib, di hook atau di pemanggil (`mutate(vars, { onError })`).
- Dialog yang memicu fetch hanya di-mount saat terbuka (`{open && <XDialog … />}`) agar tidak memicu request yang tidak perlu.

## Upload (S-17)

Default header JSON dari instance akan menimpa boundary multipart. Untuk `FormData`, lepas header itu dan lewati transform default:

```ts
const formData = new FormData();
formData.append("file", file);
const { data } = await apiClient.post<ApiUploadResult>(url, formData, {
  headers: { "Content-Type": undefined },
  transformRequest: (body) => body,
});
```

## Tanggal & angka dari API

Datetime dari backend diperlakukan sebagai UTC dan diparse/diformat lewat `lib/format.ts` (U-03). Kekhususan bentuk dari backend (mis. jam yang di-anchor ke tanggal epoch, desimal sebagai string) dicatat di `project/api-contract.md`.
