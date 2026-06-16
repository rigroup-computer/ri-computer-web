"use client";

import { useSyncExternalStore } from "react";
import {
  type SavedTrackingEntry,
  subscribeToTrackingStorage,
  syncStoredTrackingIds,
} from "@/lib/tracking-storage";

const EMPTY_SAVED_TRACKING_IDS: SavedTrackingEntry[] = [];

let cachedSnapshot: SavedTrackingEntry[] = EMPTY_SAVED_TRACKING_IDS;
let cachedSerialized = "[]";

function getSavedTrackingIdsSnapshot(): SavedTrackingEntry[] {
  const next = syncStoredTrackingIds();
  const serialized = JSON.stringify(next);

  if (serialized === cachedSerialized) {
    return cachedSnapshot;
  }

  cachedSerialized = serialized;
  cachedSnapshot = next.length > 0 ? next : EMPTY_SAVED_TRACKING_IDS;
  return cachedSnapshot;
}

export function useSavedTrackingIds(): SavedTrackingEntry[] {
  return useSyncExternalStore(
    subscribeToTrackingStorage,
    getSavedTrackingIdsSnapshot,
    () => EMPTY_SAVED_TRACKING_IDS,
  );
}
