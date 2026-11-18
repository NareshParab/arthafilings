"use client";

// MOCK: a local, localStorage-backed "database" for the admin demo. Every
// mutation here is purely client-side and resets if localStorage is cleared
// — replace with real API calls + a real database in the backend phase.
import { useSyncExternalStore } from "react";
import type { AdminLead, AdminOrder, LeadStatus, ActivityLogEntry } from "@/types/admin";
import type { OrderStatus, UploadedDocumentStatus } from "@/types";
import { ADMIN_LEADS, ADMIN_ORDERS } from "@/data/admin-mock";

const LEADS_KEY = "af_admin_mock_leads_store";
const ORDERS_KEY = "af_admin_mock_orders_store";
const STORE_EVENT = "af_admin_mock_store_change";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// useSyncExternalStore requires getSnapshot to return the same reference
// when nothing changed, or it loops forever — JSON.parse always allocates a
// new array, so cache the parsed result against the raw string it came from
// (same fix as lib/mock-session.ts's readCachedJson).
let leadsCache: { raw: string | null; parsed: AdminLead[] } | null = null;

function readLeads(): AdminLead[] {
  if (typeof window === "undefined") return ADMIN_LEADS;
  const raw = window.localStorage.getItem(LEADS_KEY);
  if (leadsCache && leadsCache.raw === raw) return leadsCache.parsed;
  let parsed = ADMIN_LEADS;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as AdminLead[];
    } catch {
      parsed = ADMIN_LEADS;
    }
  }
  leadsCache = { raw, parsed };
  return parsed;
}

function writeLeads(leads: AdminLead[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  notify();
}

let ordersCache: { raw: string | null; parsed: AdminOrder[] } | null = null;

function readOrders(): AdminOrder[] {
  if (typeof window === "undefined") return ADMIN_ORDERS;
  const raw = window.localStorage.getItem(ORDERS_KEY);
  if (ordersCache && ordersCache.raw === raw) return ordersCache.parsed;
  let parsed = ADMIN_ORDERS;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as AdminOrder[];
    } catch {
      parsed = ADMIN_ORDERS;
    }
  }
  ordersCache = { raw, parsed };
  return parsed;
}

function writeOrders(orders: AdminOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  notify();
}

function getServerSnapshotLeads() {
  return ADMIN_LEADS;
}

function getServerSnapshotOrders() {
  return ADMIN_ORDERS;
}

export function useAdminLeads(): AdminLead[] {
  return useSyncExternalStore(subscribe, readLeads, getServerSnapshotLeads);
}

export function useAdminOrders(): AdminOrder[] {
  return useSyncExternalStore(subscribe, readOrders, getServerSnapshotOrders);
}

export function getAdminLead(id: string): AdminLead | undefined {
  return readLeads().find((lead) => lead.id === id);
}

export function getAdminOrder(id: string): AdminOrder | undefined {
  return readOrders().find((order) => order.id === id);
}

function makeActivityEntry(actorId: string, actorName: string, action: string): ActivityLogEntry {
  return { id: `act-${Date.now()}-${Math.round(Math.random() * 1000)}`, actorId, actorName, action, at: new Date().toISOString() };
}

export function updateLead(
  id: string,
  patch: Partial<Pick<AdminLead, "status" | "assignedTo" | "followUpDate">>,
  activityAction: string,
  actor: { id: string; name: string }
) {
  const leads = readLeads();
  const next = leads.map((lead) =>
    lead.id === id
      ? { ...lead, ...patch, activityLog: [...lead.activityLog, makeActivityEntry(actor.id, actor.name, activityAction)] }
      : lead
  );
  writeLeads(next);
}

export function addLeadNote(id: string, body: string, actor: { id: string; name: string }) {
  const leads = readLeads();
  const note = { id: `note-${Date.now()}`, authorId: actor.id, authorName: actor.name, body, at: new Date().toISOString() };
  const next = leads.map((lead) =>
    lead.id === id
      ? {
          ...lead,
          notes: [...lead.notes, note],
          activityLog: [...lead.activityLog, makeActivityEntry(actor.id, actor.name, "Added a note")],
        }
      : lead
  );
  writeLeads(next);
}

export function updateOrder(
  id: string,
  patch: Partial<Pick<AdminOrder, "status" | "assignedTo" | "preparedBy">>,
  activityAction: string,
  actor: { id: string; name: string }
) {
  const orders = readOrders();
  const next = orders.map((order) =>
    order.id === id
      ? { ...order, ...patch, activityLog: [...order.activityLog, makeActivityEntry(actor.id, actor.name, activityAction)] }
      : order
  );
  writeOrders(next);
}

export function addOrderInternalNote(id: string, body: string, actor: { id: string; name: string }) {
  const orders = readOrders();
  const note = { id: `inote-${Date.now()}`, authorId: actor.id, authorName: actor.name, body, at: new Date().toISOString() };
  const next = orders.map((order) =>
    order.id === id
      ? {
          ...order,
          internalNotes: [...order.internalNotes, note],
          activityLog: [...order.activityLog, makeActivityEntry(actor.id, actor.name, "Added an internal note")],
        }
      : order
  );
  writeOrders(next);
}

export function setOrderDocumentStatus(
  orderId: string,
  documentId: string,
  status: Extract<UploadedDocumentStatus, "accepted" | "rejected">,
  actor: { id: string; name: string },
  rejectReason?: string
) {
  const orders = readOrders();
  const next = orders.map((order) => {
    if (order.id !== orderId) return order;
    const label = order.documents.find((doc) => doc.id === documentId)?.label ?? "document";
    return {
      ...order,
      documents: order.documents.map((doc) =>
        doc.id === documentId ? { ...doc, status, rejectReason: status === "rejected" ? rejectReason : undefined } : doc
      ),
      activityLog: [
        ...order.activityLog,
        makeActivityEntry(actor.id, actor.name, status === "accepted" ? `Accepted document: ${label}` : `Rejected document: ${label}`),
      ],
    };
  });
  writeOrders(next);
}

export function addMockDeliveredDocument(orderId: string, label: string, actor: { id: string; name: string }) {
  const orders = readOrders();
  const doc = { id: `deliv-${Date.now()}`, label, fileName: `${label.toLowerCase().replace(/\s+/g, "-")}.pdf`, issuedAt: new Date().toISOString() };
  const next = orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          deliveredDocuments: [...order.deliveredDocuments, doc],
          activityLog: [...order.activityLog, makeActivityEntry(actor.id, actor.name, `Uploaded delivered document: ${label}`)],
        }
      : order
  );
  writeOrders(next);
}

export const LEAD_STATUS_FLOW: LeadStatus[] = ["new", "contacted", "follow_up", "converted", "lost"];
export const ORDER_STEP_FLOW: OrderStatus[] = [
  "placed",
  "documents_pending",
  "documents_received",
  "under_review",
  "submitted",
  "completed",
];

export function nextOrderStep(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STEP_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_STEP_FLOW.length - 1) return null;
  return ORDER_STEP_FLOW[index + 1];
}
