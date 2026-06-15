"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SiteHeader } from "./site-header";
import { WhatsAppFloat } from "./whatsapp-float";

export function PublicShell({
  children,
  footer,
  consultationWaHref,
}: Readonly<{
  children: React.ReactNode;
  footer: React.ReactNode;
  consultationWaHref: string | null;
}>) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      <div
        aria-hidden
        className="shrink-0 lg:hidden [height:calc(3.5rem+env(safe-area-inset-top,0px))]"
      />
      {children}
      {footer}
      <BottomNav />
      <WhatsAppFloat waHref={consultationWaHref} />
    </>
  );
}
