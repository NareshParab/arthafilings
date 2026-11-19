"use client";

// MOCK: a single, append-only activity log for actions that don't already
// have their own per-entity log (leads and orders keep theirs inline — see
// lib/admin-store.ts). The /admin/activity page merges both. Nothing here
// is ever edited or deleted, only appended to — same as a real audit log
// would be, backed by a localStorage array standing in for a database table.
import { useSyncExternalStore } from "react";
import type { GlobalActivityEntry, GlobalActivityEntityType, AdminRole } from "@/types/admin";

const ACTIVITY_KEY = "af_admin_mock_global_activity";
const ACTIVITY_EVENT = "af_admin_mock_global_activity_change";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ACTIVITY_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(ACTIVITY_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ACTIVITY_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cache: { raw: string | null; parsed: GlobalActivityEntry[] } | null = null;

function readEntries(): GlobalActivityEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ACTIVITY_KEY);
  if (cache && cache.raw === raw) return cache.parsed;
  let parsed: GlobalActivityEntry[] = [];
  if (raw) {
    try {
      parsed = JSON.parse(raw) as GlobalActivityEntry[];
    } catch {
      parsed = [];
    }
  }
  cache = { raw, parsed };
  return parsed;
}

function writeEntries(entries: GlobalActivityEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
  notify();
}

function getServerSnapshot(): GlobalActivityEntry[] {
  return [];
}

export function useGlobalActivity(): GlobalActivityEntry[] {
  return useSyncExternalStore(subscribe, readEntries, getServerSnapshot);
}

export function logActivity(entry: {
  actor: { id: string; name: string; role: AdminRole };
  action: string;
  entityType: GlobalActivityEntityType;
  entityId: string;
  entityLabel: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}) {
  const entries = readEntries();
  const next: GlobalActivityEntry = {
    id: `gact-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    at: new Date().toISOString(),
    actorId: entry.actor.id,
    actorName: entry.actor.name,
    actorRole: entry.actor.role,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    entityLabel: entry.entityLabel,
    before: entry.before,
    after: entry.after,
  };
  writeEntries([...entries, next]);
  return next;
}
