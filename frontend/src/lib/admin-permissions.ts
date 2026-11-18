// MOCK: these are UI-level role checks only, to shape what the demo shows.
// The real backend must re-enforce every one of these server-side — none of
// this is a security boundary.
import type { AdminLead, AdminOrder } from "@/types/admin";
import type { AdminSession } from "@/lib/admin-session";

export function canViewLeads(session: AdminSession): boolean {
  return session.role === "admin" || session.role === "staff";
}

export function canViewOrders(): boolean {
  return true;
}

export function canAccessLead(session: AdminSession, lead: AdminLead): boolean {
  if (session.role === "admin") return true;
  if (session.role === "staff") return lead.assignedTo === null || lead.assignedTo === session.userId;
  return false;
}

export function canAccessOrder(session: AdminSession, order: AdminOrder): boolean {
  if (session.role === "admin" || session.role === "reviewer") return true;
  return order.assignedTo === null || order.assignedTo === session.userId;
}

export function canEditLead(session: AdminSession, lead: AdminLead): boolean {
  return canAccessLead(session, lead);
}

export function canAssignLead(session: AdminSession, lead: AdminLead): boolean {
  if (session.role === "admin") return true;
  if (session.role === "staff") return lead.assignedTo === null || lead.assignedTo === session.userId;
  return false;
}

export function canAssignOrder(session: AdminSession, order: AdminOrder): boolean {
  if (session.role === "admin") return true;
  if (session.role === "staff") return order.assignedTo === null || order.assignedTo === session.userId;
  return false;
}

// The generic "move to next step" control. Staff can drive everything up to
// (and including the step that lands on) "under_review" — the hop out of
// under_review is a review decision, not a routine step, so only Approve /
// Send back (and admin's override) can make it.
export function canAdvanceOrderStep(session: AdminSession, order: AdminOrder): boolean {
  if (session.role === "admin") return order.status !== "completed";
  if (session.role === "staff") {
    return canAccessOrder(session, order) && order.status !== "under_review" && order.status !== "submitted" && order.status !== "completed";
  }
  return false;
}

export function canPrepareFiling(session: AdminSession, order: AdminOrder): boolean {
  return (session.role === "admin" || session.role === "staff") && canAccessOrder(session, order);
}

// Maker-checker: a reviewer (or admin standing in as reviewer) can never
// approve / send back a filing they themselves prepared.
export function canReview(session: AdminSession, order: AdminOrder): { allowed: boolean; reason?: string } {
  if (order.status !== "under_review") {
    return { allowed: false, reason: "This order isn't waiting for review." };
  }
  if (session.role !== "admin" && session.role !== "reviewer") {
    return { allowed: false, reason: "Only a reviewer can approve or send back a filing." };
  }
  if (order.preparedBy && order.preparedBy === session.userId) {
    return { allowed: false, reason: "You prepared this filing — a different reviewer must approve it." };
  }
  return { allowed: true };
}

export function canReviewDocuments(session: AdminSession): boolean {
  return session.role === "admin" || session.role === "staff";
}

export function canMarkCompleted(session: AdminSession, order: AdminOrder): boolean {
  if (order.status !== "submitted") return false;
  if (session.role === "admin") return true;
  if (session.role === "staff") return canAccessOrder(session, order);
  return false;
}
