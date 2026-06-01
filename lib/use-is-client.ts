"use client";

import { useSyncExternalStore } from "react";

/** True only after client hydration — keeps SSR and first client render identical. */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
