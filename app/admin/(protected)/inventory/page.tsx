import Image from "next/image";
import { redirect } from "next/navigation";
import { InventoryFormSubmitButton } from "@/components/admin/inventory-form-submit";
import { formatIdr } from "@/lib/format-idr";
import { createInventoryItem, deleteInventoryItem, setInventoryPublish } from "@/src/lib/actions/admin-inventory";
import { marketplaceSdk } from "@/src/lib/sdk/marketplace";

export const dynamic = "force-dynamic";

/** Set true when re-enabling /admin/inventory in nav. */
const INVENTORY_CONSOLE_ENABLED = false;

export default async function AdminInventoryPage() {
  if (!INVENTORY_CONSOLE_ENABLED) {
    redirect("/admin");
  }

  const items = await marketplaceSdk.findAll();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Inventaris & Titip Jual</h1>
        <p className="text-sm text-slate-600">Unit toko menggunakan kontak resmi Listing titip wajib nomor konsumen saat tayang.</p>
      </div>

      <section className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Buat Listing</h2>
        <form action={createInventoryItem} className="mt-4 grid max-w-full gap-3">
          <input name="title" required className="h-11 w-full min-w-0 rounded-xl border border-slate-300 px-3 text-sm" placeholder="Judul laptop" />
          <input name="price" type="number" min="1" step="1" required className="h-11 w-full min-w-0 rounded-xl border border-slate-300 px-3 text-sm" placeholder="Harga (IDR)" />
          <textarea name="specs" required className="min-h-28 w-full min-w-0 rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Ringkasan spesifikasi" />
          <label className="grid max-w-full gap-1 text-sm">
            <span className="font-medium text-slate-800">Foto listing (opsional)</span>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-2 py-2 text-sm file:mr-2 file:max-w-[min(100%,12rem)] file:truncate file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <span className="text-xs text-slate-500">JPG, PNG, WebP, atau GIF · maks. 5 MB · unggah ke folder Cloudinary terpisah dari foto keluhan booking.</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isConsignment" className="h-4 w-4" />
            Titip Jual · kontak WhatsApp mengarah pemilik.
          </label>
          <input name="ownerContact" className="h-11 w-full min-w-0 rounded-xl border border-slate-300 px-3 text-sm" placeholder="WhatsApp pemilik (wajib jika Titip)" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" className="h-4 w-4" />
            Publikasikan ke katalog
          </label>
          <InventoryFormSubmitButton />
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Daftar</h2>

        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm font-medium text-slate-700">{formatIdr(item.price)}</p>
                <p className="text-xs text-slate-500">{item.isConsignment ? "Titip Jual" : "Toko Ri Computer"}</p>
              </div>
              <span className={`h-fit rounded-full px-2 py-1 text-xs font-semibold ${item.isPublished ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                {item.isPublished ? "Live" : "Draft"}
              </span>
            </div>
            <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={`Foto ${item.title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 672px) 100vw, 672px"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  Tanpa foto
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-700">{item.specs}</p>
            {item.ownerContact ? <p className="text-xs text-slate-600">WA: {item.ownerContact}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={setInventoryPublish}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="isPublished" value={(!item.isPublished).toString()} />
                <button type="submit" className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold">
                  {item.isPublished ? "Unpublish" : "Publish"}
                </button>
              </form>
              <form action={deleteInventoryItem}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="h-10 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700">
                  Hapus
                </button>
              </form>
            </div>
          </article>
        ))}

        {items.length === 0 ? <p className="text-sm text-slate-600">Belum ada inventaris.</p> : null}
      </section>
    </main>
  );
}
