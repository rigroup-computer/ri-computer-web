import { prisma } from "@/lib/prisma";
import { formatIdr } from "@/lib/format-idr";
import { createInventoryItem, deleteInventoryItem, setInventoryPublish } from "@/lib/actions/admin-inventory";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Inventaris & Titip Jual</h1>
        <p className="text-sm text-slate-600">Unit toko menggunakan kontak resmi Listing titip wajib nomor konsumen saat tayang.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Buat Listing</h2>
        <form action={createInventoryItem} encType="multipart/form-data" className="mt-4 grid gap-3">
          <input name="title" required className="h-11 rounded-xl border border-slate-300 px-3 text-sm" placeholder="Judul laptop" />
          <input name="price" type="number" min="1" step="1" required className="h-11 rounded-xl border border-slate-300 px-3 text-sm" placeholder="Harga (IDR)" />
          <textarea name="specs" required className="min-h-28 rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Ringkasan spesifikasi" />
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-800">Foto listing (opsional)</span>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="min-h-11 rounded-xl border border-slate-300 px-2 py-2 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <span className="text-xs text-slate-500">JPG, PNG, WebP, atau GIF · maks. 5 MB · unggah ke folder Cloudinary terpisah dari foto keluhan booking.</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isConsignment" className="h-4 w-4" />
            Titip Jual · kontak WhatsApp mengarah pemilik.
          </label>
          <input name="ownerContact" className="h-11 rounded-xl border border-slate-300 px-3 text-sm" placeholder="WhatsApp pemilik (wajib jika Titip)" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" className="h-4 w-4" />
            Publikasikan ke katalog
          </label>
          <button type="submit" className="h-12 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm">
            Simpan Listing
          </button>
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
            {item.imageUrl ? (
              <p className="mt-2 text-xs text-slate-500">
                Foto:{" "}
                <a href={item.imageUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600 underline">
                  buka di Cloudinary
                </a>
              </p>
            ) : null}
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
