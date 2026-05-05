import Image from "next/image";
import Link from "next/link";
import {
  SvgChevronRight,
  SvgInventory,
  SvgRepair,
} from "@/components/shared/SvgComponent";
import { prisma } from "@/lib/prisma";
import { ServiceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type DashboardCardProps = {
  href: string;
  title: string;
  description: string;
  imageUrl: string;
  textFooter: string;
};

function DashboardCard({
  href,
  title,
  description,
  imageUrl,
  textFooter,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="flex min-h-12 flex-row items-center gap-4 rounded-sm bg-white px-4 py-3 shadow-md"
    >
      <div className="rounded-full bg-primary/10 p-1 flex items-center justify-center size-12 shrink-0">
        <Image src={imageUrl} alt={title} width={32} height={32} unoptimized />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-mate-black">{title}</span>
        <span className="text-xs text-mate-black/65">{description}</span>

        <div className="flex-1 flex flex-row justify-between mt-2">
          <p className="text-primary-dark text-xs font-semibold">{textFooter}</p>
          <SvgChevronRight className="size-5 text-primary-dark" />
        </div>
      </div>
    </Link>
  );
}

async function fetchDashboardCounts(): Promise<{
  orderBaru: number;
  inventarisPerluPerhatian: number;
}> {
  const [orderBaru, inventarisPerluPerhatian] = await prisma.$transaction([
    prisma.serviceOrder.count({
      where: { status: ServiceStatus.RECEIVED },
    }),
    prisma.inventoryItem.count({
      where: {
        OR: [
          { isPublished: false },
          {
            isPublished: true,
            OR: [{ imageUrl: null }, { imageUrl: "" }],
          },
        ],
      },
    }),
  ]);

  return { orderBaru, inventarisPerluPerhatian };
}

export default async function AdminDashboardPage() {
  const { orderBaru, inventarisPerluPerhatian } = await fetchDashboardCounts();

  return (
    <main className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">Dasbor Admin</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-sm border border-primary/20 rounded-md p-2 bg-primary/5 shadow-md">
          <SvgRepair className="size-10 font-semibold text-primary/40" />
          Order Baru ({orderBaru})
        </div>

        <div className="text-sm rounded-md border border-secondary/20 p-2 bg-secondary/5 shadow-md">
          <SvgInventory className="size-10 font-semibold text-secondary/40" />
          Inventaris Rendah ({inventarisPerluPerhatian})
        </div>
      </div>

      <div className="grid gap-4">
        <DashboardCard
          href="/admin/orders"
          title="Order Home Service"
          description="Perbarui status & timeline untuk pelanggan"
          imageUrl="/icons/png/mechanic.png"
          textFooter="Lihat Detail"
        />

        <DashboardCard
          href="/admin/inventory"
          title="Inventaris & Titip Jual"
          description="Input unit toko atau titip konsumen"
          imageUrl="/icons/png/package.png"
          textFooter="Manage"
        />
      </div>
    </main>
  );
}
