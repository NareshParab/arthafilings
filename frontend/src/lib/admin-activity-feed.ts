"use client";

// Merges the global activity log (services/coupons/staff actions — see
// lib/admin-activity-store.ts) with the per-entity activity logs that leads
// and orders already kept from Task 8a (lib/admin-store.ts), so
// /admin/activity shows one combined, append-only timeline.
import type { GlobalActivityEntry } from "@/types/admin";
import { useAdminLeads, useAdminOrders } from "@/lib/admin-store";
import { useGlobalActivity } from "@/lib/admin-activity-store";
import { getAdminUser } from "@/lib/admin-session";

export function useCombinedActivityFeed(): GlobalActivityEntry[] {
  const leads = useAdminLeads();
  const orders = useAdminOrders();
  const globalEntries = useGlobalActivity();

  const leadEntries: GlobalActivityEntry[] = leads.flatMap((lead) =>
    lead.activityLog.map((entry) => ({
      id: entry.id,
      at: entry.at,
      actorId: entry.actorId,
      actorName: entry.actorName,
      actorRole: getAdminUser(entry.actorId)?.role ?? null,
      action: entry.action,
      entityType: "lead" as const,
      entityId: lead.id,
      entityLabel: lead.name,
    }))
  );

  const orderEntries: GlobalActivityEntry[] = orders.flatMap((order) =>
    order.activityLog.map((entry) => ({
      id: entry.id,
      at: entry.at,
      actorId: entry.actorId,
      actorName: entry.actorName,
      actorRole: getAdminUser(entry.actorId)?.role ?? null,
      action: entry.action,
      entityType: "order" as const,
      entityId: order.id,
      entityLabel: order.orderNo,
    }))
  );

  return [...leadEntries, ...orderEntries, ...globalEntries].sort((a, b) => b.at.localeCompare(a.at));
}
