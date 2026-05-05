"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";

export function PublicShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return children;
  }

  return (
    <>
      <SiteHeader />
      <div
        aria-hidden
        className="shrink-0 [height:calc(3.5rem+env(safe-area-inset-top,0px))]"
      />
      {children}
    </>
  );
}
