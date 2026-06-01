import Image from "next/image";
import Link from "next/link";
import { SiteHeaderDesktop } from "@/components/layout/site-header-desktop";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { whatsappHref } from "@/lib/whatsapp";

const consultationMessage =
  "Halo Ri Computer, saya ingin konsultasi kerusakan laptop. Bisa dibantu?";

export function SiteHeader() {
  const shopWa = process.env.SHOP_WHATSAPP_NUMBER?.trim() ?? "";
  const waHref = whatsappHref(shopWa, consultationMessage);

  return (
    <>
      <header className="fixed lg:hidden inset-x-0 top-0 z-100 mx-auto w-full max-w-md border-b border-slate-200/80 bg-white pt-[env(safe-area-inset-top,0px)] shadow-sm">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex w-fit shrink-0 items-center touch-manipulation"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm">
            <Image
              src="/images/brand/icon-brand.png"
              alt="Logo Ri Computer"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </span>
        </Link>
        <SiteHeaderNav />
      </div>
      </header>
      <SiteHeaderDesktop waHref={waHref} />
    </>
  );
}
