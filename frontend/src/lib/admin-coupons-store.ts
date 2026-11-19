"use client";

// MOCK: localStorage-backed coupon store, same pattern as admin-store.ts.
import { useSyncExternalStore } from "react";
import type { AdminCoupon } from "@/types/admin";
import { ADMIN_COUPONS } from "@/data/admin-coupons-mock";
import { logActivity } from "@/lib/admin-activity-store";

const COUPONS_KEY = "af_admin_mock_coupons_store";
const COUPONS_EVENT = "af_admin_mock_coupons_store_change";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COUPONS_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(COUPONS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(COUPONS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cache: { raw: string | null; parsed: AdminCoupon[] } | null = null;

function readAll(): AdminCoupon[] {
  if (typeof window === "undefined") return ADMIN_COUPONS;
  const raw = window.localStorage.getItem(COUPONS_KEY);
  if (cache && cache.raw === raw) return cache.parsed;
  let parsed = ADMIN_COUPONS;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as AdminCoupon[];
    } catch {
      parsed = ADMIN_COUPONS;
    }
  }
  cache = { raw, parsed };
  return parsed;
}

function writeAll(next: AdminCoupon[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUPONS_KEY, JSON.stringify(next));
  notify();
}

function getServerSnapshot(): AdminCoupon[] {
  return ADMIN_COUPONS;
}

export function useAdminCoupons(): AdminCoupon[] {
  return useSyncExternalStore(subscribe, readAll, getServerSnapshot);
}

type Actor = { id: string; name: string; role: "admin" | "staff" | "reviewer" };

export function createCoupon(input: Omit<AdminCoupon, "id" | "createdAt">, actor: Actor): AdminCoupon {
  const coupon: AdminCoupon = { ...input, id: `cpn-${Date.now()}`, createdAt: new Date().toISOString() };
  writeAll([...readAll(), coupon]);
  logActivity({
    actor,
    action: "Created coupon",
    entityType: "coupon",
    entityId: coupon.id,
    entityLabel: coupon.code,
    after: coupon as unknown as Record<string, unknown>,
  });
  return coupon;
}

export function updateCoupon(id: string, patch: Partial<AdminCoupon>, actor: Actor): void {
  const all = readAll();
  const before = all.find((c) => c.id === id);
  if (!before) return;
  const after = { ...before, ...patch };
  writeAll(all.map((c) => (c.id === id ? after : c)));
  logActivity({
    actor,
    action: "Updated coupon",
    entityType: "coupon",
    entityId: id,
    entityLabel: after.code,
    before: before as unknown as Record<string, unknown>,
    after: after as unknown as Record<string, unknown>,
  });
}

export function setCouponActive(id: string, active: boolean, actor: Actor): void {
  const all = readAll();
  const before = all.find((c) => c.id === id);
  if (!before) return;
  const after = { ...before, active };
  writeAll(all.map((c) => (c.id === id ? after : c)));
  logActivity({
    actor,
    action: active ? "Reactivated coupon" : "Deactivated coupon",
    entityType: "coupon",
    entityId: id,
    entityLabel: before.code,
    before: before as unknown as Record<string, unknown>,
    after: after as unknown as Record<string, unknown>,
  });
}

export function isCouponCodeTaken(code: string, excludeId?: string): boolean {
  const normalized = code.trim().toUpperCase();
  return readAll().some((c) => c.code === normalized && c.id !== excludeId);
}
