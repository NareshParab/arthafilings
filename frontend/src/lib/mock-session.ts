"use client";

// MOCK: replace with real backend session/order storage in backend phase.
import { useSyncExternalStore } from "react";
import type { Order, Payment } from "@/types";

const LEAD_KEY = "af_mock_lead";
const ORDER_KEY_PREFIX = "af_mock_order_";
const PAYMENT_KEY_PREFIX = "af_mock_payment_";
const AUTH_KEY = "af_mock_auth";
const AUTH_EVENT = "af_mock_auth_change";

// useSyncExternalStore requires getSnapshot to return the same reference when
// nothing changed, or it re-renders forever. JSON.parse always allocates a
// new object, so cache the parsed result per storage key, keyed off the raw
// string actually stored right now.
const snapshotCache = new Map<string, { raw: string | null; parsed: unknown }>();

function readCachedJson<T>(cacheKey: string, raw: string | null): T | null {
  const cached = snapshotCache.get(cacheKey);
  if (cached && cached.raw === raw) return cached.parsed as T | null;
  let parsed: T | null = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as T;
    } catch {
      parsed = null;
    }
  }
  snapshotCache.set(cacheKey, { raw, parsed });
  return parsed;
}

export interface MockLeadDraft {
  name: string;
  email: string;
  phone: string;
}

export function saveLeadDraft(lead: MockLeadDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LEAD_KEY, JSON.stringify(lead));
}

export function getLeadDraft(): MockLeadDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(LEAD_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockLeadDraft;
  } catch {
    return null;
  }
}

export function saveOrderDraft(order: Order) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${ORDER_KEY_PREFIX}${order.id}`, JSON.stringify(order));
}

export function getOrderDraft(orderId: string): Order | null {
  if (typeof window === "undefined") return null;
  const key = `${ORDER_KEY_PREFIX}${orderId}`;
  return readCachedJson<Order>(key, window.sessionStorage.getItem(key));
}

export function updateOrderDraft(orderId: string, patch: Partial<Order>): Order | null {
  const existing = getOrderDraft(orderId);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  saveOrderDraft(updated);
  return updated;
}

function noopSubscribe() {
  return () => {};
}

function getServerSnapshotNull() {
  return null;
}

// sessionStorage reads never change after this component's own mount in this
// mock flow, but useSyncExternalStore still gives us an SSR-safe snapshot
// without reaching for setState-in-an-effect.
export function useOrderDraft(orderId: string): Order | null {
  return useSyncExternalStore(noopSubscribe, () => getOrderDraft(orderId), getServerSnapshotNull);
}

export function usePaymentDraft(orderId: string): Payment | null {
  return useSyncExternalStore(noopSubscribe, () => getPaymentDraft(orderId), getServerSnapshotNull);
}

export function savePaymentDraft(payment: Payment) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${PAYMENT_KEY_PREFIX}${payment.orderId}`, JSON.stringify(payment));
}

export function getPaymentDraft(orderId: string): Payment | null {
  if (typeof window === "undefined") return null;
  const key = `${PAYMENT_KEY_PREFIX}${orderId}`;
  return readCachedJson<Payment>(key, window.sessionStorage.getItem(key));
}

export interface MockAuthSession {
  phone: string;
  loggedInAt: string;
}

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function saveAuthSession(session: MockAuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  notifyAuthChange();
}

export function getAuthSession(): MockAuthSession | null {
  if (typeof window === "undefined") return null;
  return readCachedJson<MockAuthSession>(AUTH_KEY, window.localStorage.getItem(AUTH_KEY));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
  notifyAuthChange();
}

function subscribeAuthChange(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Reactive read of the mock auth session — used by the header and the
// dashboard guard so UI updates immediately after login/logout.
export function useMockAuthSession(): MockAuthSession | null {
  return useSyncExternalStore(subscribeAuthChange, getAuthSession, getServerSnapshotNull);
}
