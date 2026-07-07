"use client";

import { useEffect } from "react";

/**
 * Next.js 16.1+ dev serves HTML with Cache-Control: no-cache, which Chrome may
 * restore from BFCache on back/forward with a stale RSC payload. Reload once
 * when that happens so local edits show up without restarting the dev server.
 */
export function DevBfcacheGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
