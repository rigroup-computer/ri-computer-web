"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

type SiteFooterSocialProps = Readonly<{
  waHref: string | null;
  instagramUrl: string;
}>;

const socialLinkClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#dee1e6] bg-[#fafafb] text-[#565d6d] transition-colors hover:bg-gray-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export function SiteFooterSocial({
  waHref,
  instagramUrl,
}: SiteFooterSocialProps) {
  if (!waHref && !instagramUrl) return null;

  return (
    <div className="flex gap-4">
      {waHref ? (
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className={socialLinkClassName}
          aria-label="WhatsApp Ri Computer"
        >
          <Icon icon="mdi:whatsapp" width={20} height={20} aria-hidden />
        </Link>
      ) : null}
      {instagramUrl ? (
        <Link
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={socialLinkClassName}
          aria-label="Instagram Ri Computer"
        >
          <Icon icon="mdi:instagram" width={20} height={20} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
