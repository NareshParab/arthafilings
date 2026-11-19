"use client";

// MOCK: localStorage-backed staff directory, same pattern as admin-store.ts.
// "Inviting" someone here never sends a real email or creates a real login
// — it only adds a row the demo UI can act on.
import { useSyncExternalStore } from "react";
import type { AdminRole, StaffMember, StaffStatus } from "@/types/admin";
import { ADMIN_STAFF } from "@/data/admin-staff-mock";
import { logActivity } from "@/lib/admin-activity-store";

const STAFF_KEY = "af_admin_mock_staff_store";
const STAFF_EVENT = "af_admin_mock_staff_store_change";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STAFF_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(STAFF_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STAFF_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cache: { raw: string | null; parsed: StaffMember[] } | null = null;

function readAll(): StaffMember[] {
  if (typeof window === "undefined") return ADMIN_STAFF;
  const raw = window.localStorage.getItem(STAFF_KEY);
  if (cache && cache.raw === raw) return cache.parsed;
  let parsed = ADMIN_STAFF;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as StaffMember[];
    } catch {
      parsed = ADMIN_STAFF;
    }
  }
  cache = { raw, parsed };
  return parsed;
}

function writeAll(next: StaffMember[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_KEY, JSON.stringify(next));
  notify();
}

function getServerSnapshot(): StaffMember[] {
  return ADMIN_STAFF;
}

export function useAdminStaff(): StaffMember[] {
  return useSyncExternalStore(subscribe, readAll, getServerSnapshot);
}

type Actor = { id: string; name: string; role: "admin" | "staff" | "reviewer" };

export function isStaffEmailTaken(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return readAll().some((member) => member.email.toLowerCase() === normalized);
}

export function inviteStaff(input: { name: string; email: string; role: AdminRole }, actor: Actor): StaffMember {
  const member: StaffMember = {
    id: `u-${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: "active",
    lastActiveAt: null,
    invitedAt: new Date().toISOString(),
  };
  writeAll([...readAll(), member]);
  logActivity({
    actor,
    action: `Invited ${member.name} as ${member.role}`,
    entityType: "staff",
    entityId: member.id,
    entityLabel: member.name,
    after: member as unknown as Record<string, unknown>,
  });
  return member;
}

export function changeStaffRole(id: string, role: AdminRole, actor: Actor): void {
  const all = readAll();
  const before = all.find((m) => m.id === id);
  if (!before) return;
  const after = { ...before, role };
  writeAll(all.map((m) => (m.id === id ? after : m)));
  logActivity({
    actor,
    action: `Changed role: ${before.role} → ${role}`,
    entityType: "staff",
    entityId: id,
    entityLabel: before.name,
    before: before as unknown as Record<string, unknown>,
    after: after as unknown as Record<string, unknown>,
  });
}

export function setStaffStatus(id: string, status: StaffStatus, actor: Actor): void {
  const all = readAll();
  const before = all.find((m) => m.id === id);
  if (!before) return;
  const after = { ...before, status };
  writeAll(all.map((m) => (m.id === id ? after : m)));
  logActivity({
    actor,
    action: status === "active" ? "Reactivated staff member" : "Deactivated staff member",
    entityType: "staff",
    entityId: id,
    entityLabel: before.name,
    before: before as unknown as Record<string, unknown>,
    after: after as unknown as Record<string, unknown>,
  });
}
