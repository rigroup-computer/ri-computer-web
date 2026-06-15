"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

type WhatsAppFloatProps = Readonly<{
  waHref: string | null;
}>;

export function WhatsAppFloat({ waHref }: WhatsAppFloatProps) {
  if (!waHref) return null;

  return (
    <Link
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Konsultasi via WhatsApp"
      className="fixed right-4 z-40 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgb(37_211_102/45%)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 lg:right-6"
    >
      <Icon icon="ic:baseline-whatsapp" width={28} height={28} aria-hidden />
    </Link>
  );
}
