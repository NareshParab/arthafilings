"use client";

// MOCK: admin login. Real auth + server-side role enforcement arrive in the
// backend phase — everything here is a client-only convenience for demoing
// the admin UI, not a security boundary.
import { useSyncExternalStore } from "react";
import type { AdminRole, AdminUser } from "@/types/admin";
import { ADMIN_USERS } from "@/data/admin-mock";

const SESSION_KEY = "af_admin_mock_session";
const SESSION_EVENT = "af_admin_mock_session_change";

export interface AdminSession {
  userId: string;
  name: string;
  role: AdminRole;
}

function notifyChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function saveAdminSession(session: AdminSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifyChange();
}

// useSyncExternalStore requires getSnapshot to return the same reference
// when nothing changed, or it loops forever — JSON.parse always allocates a
// new object, so cache the parsed result against the raw string it came
// from (same fix as lib/mock-session.ts's readCachedJson).
let sessionCache: { raw: string | null; parsed: AdminSession | null } | null = null;

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (sessionCache && sessionCache.raw === raw) return sessionCache.parsed;
  let parsed: AdminSession | null = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as AdminSession;
    } catch {
      parsed = null;
    }
  }
  sessionCache = { raw, parsed };
  return parsed;
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  notifyChange();
}

function subscribe(callback: () => void) {
  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot() {
  return null;
}

// Reactive read — used by the top bar / sidebar so the UI updates the moment
// a mock sign-in/logout happens, without a reload.
export function useAdminSession(): AdminSession | null {
  return useSyncExternalStore(subscribe, getAdminSession, getServerSnapshot);
}

// One fixed mock identity per role, so "Sign in as Staff (mock)" always lands
// on the same named person — needed so the seed data (assignedTo/preparedBy)
// lines up with whoever is "logged in".
export function signInAs(role: AdminRole) {
  const user = ADMIN_USERS.find((candidate) => candidate.role === role) ?? ADMIN_USERS[0];
  saveAdminSession({ userId: user.id, name: user.name, role: user.role });
}

export function getAdminUser(userId: string | null): AdminUser | undefined {
  if (!userId) return undefined;
  return ADMIN_USERS.find((user) => user.id === userId);
}
