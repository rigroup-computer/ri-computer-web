"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const hashListeners = new Set<() => void>();

export function bumpLocationHash() {
  hashListeners.forEach((listener) => listener());
}

function getHashSnapshot() {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "");
}

function subscribeToHash(onStoreChange: () => void) {
  hashListeners.add(onStoreChange);

  const handleChange = () => onStoreChange();
  window.addEventListener("hashchange", handleChange);
  window.addEventListener("popstate", handleChange);

  return () => {
    hashListeners.delete(onStoreChange);
    window.removeEventListener("hashchange", handleChange);
    window.removeEventListener("popstate", handleChange);
  };
}

/** Hash segment for homepage section nav; re-syncs when pathname changes (App Router may skip hashchange). */
export function useLocationHash() {
  const pathname = usePathname();

  useEffect(() => {
    bumpLocationHash();
  }, [pathname]);

  const hash = useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    () => "",
  );

  return pathname === "/" ? hash : "";
}
