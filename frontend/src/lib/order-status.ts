import type { Order, OrderStatus, TimelineStep } from "@/types";

// The 4 customer-facing checkpoints from the Client Requirement doc. Several
// internal OrderStatus values collapse into the same customer-facing step —
// customers don't need to see "under review" vs "documents received".
const CUSTOMER_STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "documents_received", label: "Documents received" },
  { key: "submitted", label: "Application submitted" },
  { key: "completed", label: "Completed" },
] as const;

// Number of customer-facing steps considered fully done for each internal status.
const DONE_COUNT: Record<OrderStatus, number> = {
  placed: 1,
  documents_pending: 1,
  documents_received: 2,
  under_review: 2,
  submitted: 3,
  completed: 4,
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order placed",
  documents_pending: "Waiting for documents",
  documents_received: "Documents received",
  under_review: "Under review",
  submitted: "Application submitted",
  completed: "Completed",
};

export function getTimeline(order: Order): TimelineStep[] {
  const doneCount = DONE_COUNT[order.status];

  return CUSTOMER_STEPS.map((step, index) => {
    const position = index + 1;
    const state: TimelineStep["state"] =
      position <= doneCount ? "done" : position === doneCount + 1 ? "current" : "upcoming";
    // Only the order's creation date is stored — we don't track a timestamp
    // per customer-facing step, so only the first step gets a date. [TBD]
    return {
      key: step.key,
      label: step.label,
      state,
      at: index === 0 ? order.createdAt : undefined,
    };
  });
}
