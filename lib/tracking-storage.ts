import type { ServiceType } from "@/lib/types/service";

export const TRACKING_IDS_STORAGE_KEY = "ri_service_tracking_ids";
export const MAX_SAVED_TRACKING_IDS = 5;

const TRACKING_STORAGE_EVENT = "ri-tracking-storage-change";

export type SavedTrackingEntry = {
  trackingId: string;
  serviceType: ServiceType;
  createdAt: string;
  expiresAt: string;
};

function addOneMonth(from: Date): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next;
}

function isServiceType(value: unknown): value is ServiceType {
  return (
    value === "REGULAR" || value === "DELIVERY" || value === "HOME_SERVICE"
  );
}

function normalizeEntry(raw: unknown, now: Date): SavedTrackingEntry | null {
  if (typeof raw === "string" && raw.trim()) {
    return {
      trackingId: raw.trim(),
      serviceType: "REGULAR",
      createdAt: now.toISOString(),
      expiresAt: addOneMonth(now).toISOString(),
    };
  }

  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const obj = raw as Record<string, unknown>;
  const trackingId =
    typeof obj.trackingId === "string" ? obj.trackingId.trim() : "";
  if (!trackingId) {
    return null;
  }

  const serviceType = isServiceType(obj.serviceType)
    ? obj.serviceType
    : "REGULAR";
  const createdAt =
    typeof obj.createdAt === "string" ? obj.createdAt : now.toISOString();
  const createdDate = new Date(createdAt);
  const validCreated = Number.isNaN(createdDate.getTime()) ? now : createdDate;
  const expiresAt =
    typeof obj.expiresAt === "string"
      ? obj.expiresAt
      : addOneMonth(validCreated).toISOString();

  return {
    trackingId,
    serviceType,
    createdAt: validCreated.toISOString(),
    expiresAt,
  };
}

function readRawEntries(): SavedTrackingEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(TRACKING_IDS_STORAGE_KEY) ?? "[]",
    ) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const now = new Date();
    return parsed
      .map((item) => normalizeEntry(item, now))
      .filter((entry): entry is SavedTrackingEntry => entry !== null);
  } catch {
    return [];
  }
}

function persistEntries(entries: SavedTrackingEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TRACKING_IDS_STORAGE_KEY, JSON.stringify(entries));
}

export function isTrackingEntryExpired(
  entry: SavedTrackingEntry,
  now = new Date(),
): boolean {
  const expires = new Date(entry.expiresAt);
  return Number.isNaN(expires.getTime()) || expires.getTime() <= now.getTime();
}

export function pruneExpiredTrackingEntries(
  entries: SavedTrackingEntry[],
  now = new Date(),
): SavedTrackingEntry[] {
  return entries.filter((entry) => !isTrackingEntryExpired(entry, now));
}

function sortByLatestCreated(
  entries: SavedTrackingEntry[],
): SavedTrackingEntry[] {
  return [...entries].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function dedupeByTrackingId(
  entries: SavedTrackingEntry[],
): SavedTrackingEntry[] {
  const byId = new Map<string, SavedTrackingEntry>();
  for (const entry of entries) {
    const existing = byId.get(entry.trackingId);
    if (
      !existing ||
      new Date(entry.createdAt).getTime() > new Date(existing.createdAt).getTime()
    ) {
      byId.set(entry.trackingId, entry);
    }
  }
  return [...byId.values()];
}

export function emitTrackingStorageChange(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(TRACKING_STORAGE_EVENT));
}

export function subscribeToTrackingStorage(
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(TRACKING_STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(TRACKING_STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function syncStoredTrackingIds(now = new Date()): SavedTrackingEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const normalized = dedupeByTrackingId(
    pruneExpiredTrackingEntries(readRawEntries(), now),
  );
  const next = sortByLatestCreated(normalized).slice(0, MAX_SAVED_TRACKING_IDS);
  const serialized = JSON.stringify(next);
  const current = window.localStorage.getItem(TRACKING_IDS_STORAGE_KEY);

  if (current !== serialized) {
    persistEntries(next);
  }

  return next;
}

export function saveTrackingIdToStorage(
  trackingId: string,
  serviceType: ServiceType,
  now = new Date(),
): SavedTrackingEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const trimmed = trackingId.trim();
  if (!trimmed) {
    return syncStoredTrackingIds(now);
  }

  const active = syncStoredTrackingIds(now);
  const newEntry: SavedTrackingEntry = {
    trackingId: trimmed,
    serviceType,
    createdAt: now.toISOString(),
    expiresAt: addOneMonth(now).toISOString(),
  };
  const withoutDup = active.filter((entry) => entry.trackingId !== trimmed);
  const next = [newEntry, ...withoutDup].slice(0, MAX_SAVED_TRACKING_IDS);

  persistEntries(next);
  emitTrackingStorageChange();
  return next;
}
