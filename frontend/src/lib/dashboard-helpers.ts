import { getOrderStatusOverride, getUploadedDocuments } from "@/lib/mock-session";
import { getDemoUploadedDocuments } from "@/data/orders";
import type { Order, OrderStatus, UploadedDocument } from "@/types";

// Non-reactive helpers for pages that only need a snapshot (list/summary
// views). Pages where the user interacts live (the order detail page) use
// the reactive hooks in lib/mock-session.ts instead.
export function getEffectiveStatus(order: Order): OrderStatus {
  return getOrderStatusOverride(order.id) ?? order.status;
}

export function getDocumentsForOrder(order: Order): UploadedDocument[] {
  const sessionDocs = getUploadedDocuments(order.id);
  if (sessionDocs.length > 0) return sessionDocs;
  return getDemoUploadedDocuments(order.id);
}
