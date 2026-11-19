// Read-only summary of what each role can do. Rows are computed by calling
// the exact permission functions the rest of the admin UI uses (below),
// against representative mock leads/orders, so this table can never drift
// silently from the real rules — if a rule changes, this table changes with
// it. [VERIFY] with client before this is shown to real staff.
import type { AdminRole, AdminLead, AdminOrder } from "@/types/admin";
import type { AdminSession } from "@/lib/admin-session";
import {
  canViewLeads,
  canAccessLead,
  canAssignLead,
  canAccessOrder,
  canAdvanceOrderStep,
  canReview,
  canReviewDocuments,
  canMarkCompleted,
  isAdminOnlySection,
} from "@/lib/admin-permissions";

const ROLES: AdminRole[] = ["admin", "staff", "reviewer"];

function session(role: AdminRole): AdminSession {
  return { userId: `sample-${role}`, name: "Sample", role };
}

function baseLead(overrides: Partial<AdminLead> = {}): AdminLead {
  return {
    id: "sample-lead",
    name: "Sample lead",
    phone: "9999999999",
    email: "sample@example.com",
    serviceSlug: "gst-registration",
    status: "new",
    assignedTo: null,
    extra: {},
    createdAt: new Date().toISOString(),
    notes: [],
    activityLog: [],
    ...overrides,
  };
}

function baseOrder(overrides: Partial<AdminOrder> = {}): AdminOrder {
  return {
    id: "sample-order",
    orderNo: "SAMPLE-1",
    serviceSlug: "gst-registration",
    customer: { name: "Sample customer", email: "sample@example.com", phone: "9999999999" },
    amounts: { basePaise: 0, discountPaise: 0, gstPaise: 0, totalPaise: 0 },
    status: "under_review",
    paymentStatus: "paid",
    assignedTo: null,
    preparedBy: "someone-else",
    documents: [],
    deliveredDocuments: [],
    internalNotes: [],
    activityLog: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function rolesMap(fn: (role: AdminRole) => string) {
  return { admin: fn("admin"), staff: fn("staff"), reviewer: fn("reviewer") };
}

const unassignedLead = baseLead();
const otherLead = baseLead({ assignedTo: "other-staff" });
const unassignedOrder = baseOrder();
const otherOrder = baseOrder({ assignedTo: "other-staff" });

function describeLeadAccess(check: (s: AdminSession, l: AdminLead) => boolean, role: AdminRole) {
  const s = session(role);
  const unassigned = check(s, unassignedLead);
  const other = check(s, otherLead);
  if (unassigned && other) return "Yes";
  if (unassigned && !other) return "Unassigned or own leads only";
  return "No";
}

function describeOrderAccess(check: (s: AdminSession, o: AdminOrder) => boolean, role: AdminRole) {
  const s = session(role);
  const unassigned = check(s, unassignedOrder);
  const other = check(s, otherOrder);
  if (unassigned && other) return "Yes";
  if (unassigned && !other) return "Unassigned or own orders only";
  return "No";
}

function describeReview(role: AdminRole) {
  const s = session(role);
  const other = baseOrder({ preparedBy: "someone-else" });
  const own = baseOrder({ preparedBy: `sample-${role}` });
  const allowedOther = canReview(s, other).allowed;
  const allowedOwn = canReview(s, own).allowed;
  if (!allowedOther && !allowedOwn) return "No";
  if (allowedOther && !allowedOwn) return "Yes, except filings they prepared themselves";
  return "Yes";
}

function describeMarkCompleted(role: AdminRole) {
  const s = session(role);
  const submittedUnassigned = baseOrder({ status: "submitted", assignedTo: null });
  const submittedOther = baseOrder({ status: "submitted", assignedTo: "other-staff" });
  const unassigned = canMarkCompleted(s, submittedUnassigned);
  const other = canMarkCompleted(s, submittedOther);
  if (unassigned && other) return "Yes";
  if (unassigned && !other) return "Unassigned or own orders only";
  return "No";
}

export interface PermissionTableRow {
  action: string;
  admin: string;
  staff: string;
  reviewer: string;
}

export function buildPermissionTable(): PermissionTableRow[] {
  return [
    { action: "View leads", ...rolesMap((role) => yesNo(canViewLeads(session(role)))) },
    { action: "Open / edit a lead", ...rolesMap((role) => describeLeadAccess(canAccessLead, role)) },
    { action: "Assign a lead", ...rolesMap((role) => describeLeadAccess(canAssignLead, role)) },
    // canViewOrders() itself has no role branching — the actual restriction
    // staff see is a client-side list filter in OrdersPage.tsx, not a
    // permission function, so this row describes that behaviour directly.
    { action: "View the orders list", admin: "Yes, all orders", staff: "Unassigned or own orders only", reviewer: "Yes, all orders" },
    { action: "Open an order", ...rolesMap((role) => describeOrderAccess(canAccessOrder, role)) },
    { action: "Advance an order's status", ...rolesMap((role) => describeOrderAccess(canAdvanceOrderStep, role)) },
    { action: "Approve / send back a filing (maker-checker)", ...rolesMap(describeReview) },
    { action: "Accept / reject documents", ...rolesMap((role) => yesNo(canReviewDocuments(session(role)))) },
    { action: "Mark an order completed", ...rolesMap(describeMarkCompleted) },
    { action: "Manage services & prices", ...rolesMap((role) => yesNo(isAdminOnlySection(session(role)))) },
    { action: "Manage coupons", ...rolesMap((role) => yesNo(isAdminOnlySection(session(role)))) },
    { action: "Manage staff", ...rolesMap((role) => yesNo(isAdminOnlySection(session(role)))) },
    { action: "View the activity log", ...rolesMap((role) => yesNo(isAdminOnlySection(session(role)))) },
  ];
}

export const PERMISSION_TABLE_ROLES = ROLES;
