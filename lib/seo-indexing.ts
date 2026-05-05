/**
 * SEO indexing — pakai env eksplisit agar staging/dev tidak ikut terindeks Google.
 *
 * Set `NEXT_PUBLIC_ALLOW_INDEXING=true` **hanya** di deployment production (domain final).
 * Nilai lain / kosong → halaman `noindex`, `robots.txt` blokir seluruh situs, sitemap kosong.
 */
export function isPublicIndexingAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
}
