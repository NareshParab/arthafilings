"use client";

// MOCK: replace with real backend session/order storage in backend phase.
import { useSyncExternalStore } from "react";
import type { Order, OrderStatus, Payment, UploadedDocument } from "@/types";

const LEAD_KEY = "af_mock_lead";
const ORDER_KEY_PREFIX = "af_mock_order_";
const PAYMENT_KEY_PREFIX = "af_mock_payment_";
const DOCS_KEY_PREFIX = "af_mock_docs_";
const STATUS_OVERRIDE_PREFIX = "af_mock_status_";
const AUTH_KEY = "af_mock_auth";
const AUTH_EVENT = "af_mock_auth_change";
const DOCS_EVENT = "af_mock_docs_change";
const STATUS_EVENT = "af_mock_status_change";

const EMPTY_ARRAY: never[] = [];
function getServerSnapshotEmptyArray() {
  return EMPTY_ARRAY;
}

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

// All session orders (every key under the order prefix), newest first. Used
// by the dashboard to list orders created during checkout in this session.
let sessionOrdersCache: { signature: string; orders: Order[] } | null = null;

export function getAllSessionOrders(): Order[] {
  if (typeof window === "undefined") return EMPTY_ARRAY;
  const entries: Array<[string, string]> = [];
  for (let i = 0; i < window.sessionStorage.length; i++) {
    const key = window.sessionStorage.key(i);
    if (!key || !key.startsWith(ORDER_KEY_PREFIX)) continue;
    const raw = window.sessionStorage.getItem(key);
    if (raw) entries.push([key, raw]);
  }
  const signature = entries.map(([key, raw]) => `${key}:${raw}`).join("|");
  if (sessionOrdersCache && sessionOrdersCache.signature === signature) {
    return sessionOrdersCache.orders;
  }
  const orders = entries
    .map(([key, raw]) => readCachedJson<Order>(key, raw))
    .filter((order): order is Order => order !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  sessionOrdersCache = { signature, orders };
  return orders;
}

export function useSessionOrders(): Order[] {
  return useSyncExternalStore(noopSubscribe, getAllSessionOrders, getServerSnapshotEmptyArray);
}

function notifyDocsChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DOCS_EVENT));
}

function subscribeDocsChange(callback: () => void) {
  window.addEventListener(DOCS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(DOCS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function saveUploadedDocuments(orderId: string, documents: UploadedDocument[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${DOCS_KEY_PREFIX}${orderId}`, JSON.stringify(documents));
  notifyDocsChange();
}

export function getUploadedDocuments(orderId: string): UploadedDocument[] {
  if (typeof window === "undefined") return EMPTY_ARRAY;
  const key = `${DOCS_KEY_PREFIX}${orderId}`;
  return readCachedJson<UploadedDocument[]>(key, window.sessionStorage.getItem(key)) ?? EMPTY_ARRAY;
}

// Unlike useOrderDraft/usePaymentDraft (read once, on a page the order was
// written on a different route), this document list is both read and
// written from the same order-detail page, so it needs a real subscription
// — a no-op one would never notice the component's own writes.
export function useUploadedDocuments(orderId: string): UploadedDocument[] {
  return useSyncExternalStore(
    subscribeDocsChange,
    () => getUploadedDocuments(orderId),
    getServerSnapshotEmptyArray
  );
}

function notifyStatusChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STATUS_EVENT));
}

function subscribeStatusChange(callback: () => void) {
  window.addEventListener(STATUS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STATUS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function saveOrderStatusOverride(orderId: string, status: OrderStatus) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${STATUS_OVERRIDE_PREFIX}${orderId}`, status);
  notifyStatusChange();
}

export function getOrderStatusOverride(orderId: string): OrderStatus | null {
  if (typeof window === "undefined") return null;
  return (window.sessionStorage.getItem(`${STATUS_OVERRIDE_PREFIX}${orderId}`) as OrderStatus | null) ?? null;
}

export function useOrderStatusOverride(orderId: string): OrderStatus | null {
  return useSyncExternalStore(subscribeStatusChange, () => getOrderStatusOverride(orderId), getServerSnapshotNull);
}

// Merges a locally-advanced status (e.g. after "Submit for review") over the
// order's base status, so demo orders and real session orders both work.
export function useEffectiveOrder(order: Order): Order {
  const override = useOrderStatusOverride(order.id);
  return override ? { ...order, status: override } : order;
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

const ACCOUNT_GST_KEY = "af_mock_account_gst";

export interface MockAccountGstDetails {
  gstin: string;
  businessName: string;
  billingAddress: string;
  billingState: string;
}

export function saveAccountGstDetails(details: MockAccountGstDetails) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNT_GST_KEY, JSON.stringify(details));
}

export function getAccountGstDetails(): MockAccountGstDetails | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ACCOUNT_GST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockAccountGstDetails;
  } catch {
    return null;
  }
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
