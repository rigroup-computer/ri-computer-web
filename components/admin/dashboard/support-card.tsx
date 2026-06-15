import { Icon } from "@iconify/react";
import Link from "next/link";

type SupportCardProps = Readonly<{
  waHref: string | null;
}>;

export function SupportCard({ waHref }: SupportCardProps) {
  return (
    <section
      className="relative hidden overflow-hidden rounded-[10px] bg-[#202124] p-5 custom-shadow-sm lg:block"
      aria-labelledby="support-card-heading"
    >
      <Icon
        icon="mdi:cog-outline"
        width={120}
        height={120}
        className="pointer-events-none absolute -right-4 -bottom-4 text-white/[0.06]"
        aria-hidden
      />
      <p className="text-2xs font-semibold uppercase tracking-wide text-white/55">
        Bantuan Teknis
      </p>
      <h2
        id="support-card-heading"
        className="mt-1 text-base font-bold text-white"
      >
        Butuh bantuan?
      </h2>
      {waHref ? (
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-white px-4 text-sm font-semibold text-[#171a1f] transition hover:bg-slate-100 active:scale-[0.98]"
        >
          Hubungi Support
        </Link>
      ) : (
        <p className="mt-4 text-xs text-white/70">
          Atur SHOP_WHATSAPP_NUMBER untuk menampilkan tombol dukungan.
        </p>
      )}
    </section>
  );
}
