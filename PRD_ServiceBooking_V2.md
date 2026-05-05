# PRD - Aplikasi Booking & Tracking Service Elektronik (V2 - Next.js 16)

## 1. Ringkasan Produk
Aplikasi web mobile-first (PWA) untuk **Home Service**, **pelacakan status servis**, dan **katalog laptop** (titip jual + stok toko). Pelanggan tidak memiliki akun; admin mengelola konten & status.

- **Platform:** Mobile-first (web PWA).
- **Framework:** Next.js 16 (App Router + Server Actions).
- **Pengguna:** Pelanggan lokal & admin toko.

### Desain & aset
- **Sumber kebenaran visual:** `public/images/ui/design-web.jpeg` — berisi tiga layar aplikasi (Beranda, Booking, Status) beserta palet biru-putih, kartu servis, bottom navigation tiga tab, dan blok USP + informasi toko. **Tim engineering menerjemahkan mock ini ke komponen nyata (bukan sekadar menempelkan JPEG sebagai hero).**
- **Brand assets:** `public/images/brand/` (ikon/logo produksi).

---

## 2. MVP Publik

### A. Pelanggan (tanpa login)
1. **Beranda** — Hero brand, CTA “Booking Sekarang”, kartu servis (Home Service aktif; opsi lain gelap/coming soon), strip “Laptop Dijual”, segmen “Kenapa Ri Computer?”, plus panel alamat & jam operasional.
2. **Booking** — Form mengikuti mock: pemilihan layanan (Home Service aktif), data perangkat (merk/model/keluhan + placeholder lampiran), kontak & alamat kunjungan, submit → **Tracking ID** disimpan di **LocalStorage** + opsi WA.
3. **Status servis** — UI stepper vertikal + riwayat timeline; cari via Tracking ID atau nomor HP; CTA “Hubungi Kami” ke nomor pusat bila tersedia.
4. **Katalog penuh** (`/marketplace`) — listing publik; tombol WA mengikuti sumber listing (titip vs toko).

### B. Admin (wajib login)
1. **URL masuk:** `/admin/login` memvalidasi `ADMIN_PASSWORD`, lalu membuat cookie httpOnly yang ditandai `ADMIN_SESSION_SECRET`.
2. **Konsol:** `/admin` (dasbor), `/admin/orders`, `/admin/inventory`.
3. **Fungsi:** kelola order Home Service, status + timeline; kelola inventaris/titip jual + publish.
4. **Keamanan:** tidak ada link publik ke konsol; server actions memverifikasi sesi; `robots.txt` memblok indeks `/admin`.

---

## 3. Alur Singkat
1. Pelanggan membuka beranda → mengetuk Booking → mengisi form Home Service.
2. Sistem menampilkan Tracking ID; pelanggan dapat melacak lewat tab Status.
3. Admin memperbarui status/timeline → pelanggan melihat pembaruan di layar Status.
4. Listing laptop dimoderasi admin sebelum tampil di beranda/katalog.

---

## 4. Lingkungan & Integrasi
- PostgreSQL (Neon) + Prisma.
- Variabel env inti: `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (≥16 karakter), `SHOP_WHATSAPP_NUMBER`, `SHOP_PUBLIC_ADDRESS`, `SHOP_PUBLIC_HOURS`, `NEXT_PUBLIC_SITE_URL`.
- Observabilitas (Sentry/PostHog) direncanakan setelah flow stabil.

### SEO
- Metadata & Open Graph per halaman konsumen; sitemap publik; admin tidak diindeks.

---

## 5. Milestones
1. Skema data + login admin + CRUD order/inventory.
2. UI publik mengikuti mock (`design-web.jpeg`) — hero, booking, status.
3. Polish SEO, monitoring, dan QA end-to-end.

---

## 6. Pasca-MVP
- Menghidupkan kembali kartu servis tambahan (toko / antar-jemput) bila diperlukan.
- Lampiran/file upload booking.
- Notifikasi real-time (SSE/WebSocket) bila SLA membutuhkan.
