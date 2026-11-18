"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession, getAdminUser } from "@/lib/admin-session";
import { useAdminOrders } from "@/lib/admin-store";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getService, serviceGroups } from "@/data/service-catalog";
import { ADMIN_USERS } from "@/data/admin-mock";
import { formatINR } from "@/lib/pricing";
import { ORDER_STEP_FLOW } from "@/lib/admin-store";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { AdminOrder } from "@/types/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function OrdersPage() {
  const router = useRouter();
  const session = useAdminSession();
  const allOrders = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const visibleOrders = useMemo(() => {
    if (!session) return [];
    if (session.role === "staff") {
      return allOrders.filter((order) => order.assignedTo === null || order.assignedTo === session.userId);
    }
    return allOrders;
  }, [allOrders, session]);

  const filteredOrders = useMemo(() => {
    return visibleOrders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (groupFilter !== "all" && getService(order.serviceSlug)?.group !== groupFilter) return false;
      if (assigneeFilter === "unassigned" && order.assignedTo !== null) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && order.assignedTo !== assigneeFilter) return false;
      return true;
    });
  }, [visibleOrders, statusFilter, groupFilter, assigneeFilter]);

  if (!session) return null;

  const columns: DataTableColumn<AdminOrder>[] = [
    { key: "orderNo", header: "Order no.", sortable: true, sortValue: (o) => o.orderNo, render: (o) => <span className="font-medium text-foreground">{o.orderNo}</span> },
    { key: "customer", header: "Customer", render: (o) => o.customer.name },
    { key: "service", header: "Service", render: (o) => getService(o.serviceSlug)?.name ?? o.serviceSlug },
    { key: "status", header: "Status", sortable: true, sortValue: (o) => o.status, render: (o) => <OrderStatusBadge status={o.status} /> },
    { key: "assignedTo", header: "Assigned to", render: (o) => getAdminUser(o.assignedTo)?.name ?? "Unassigned" },
    { key: "amount", header: "Amount", sortable: true, sortValue: (o) => o.amounts.totalPaise, render: (o) => formatINR(o.amounts.totalPaise) },
    { key: "createdAt", header: "Created", sortable: true, sortValue: (o) => o.createdAt, render: (o) => formatDate(o.createdAt) },
  ];

  return (
    <DataTable
      columns={columns}
      data={filteredOrders}
      getRowId={(order) => order.id}
      searchPlaceholder="Search order no., customer..."
      searchKeys={(order) => [order.orderNo, order.customer.name, order.customer.phone, order.customer.email]}
      onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
      emptyMessage="No orders match these filters."
      filters={
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STEP_FLOW.map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={groupFilter} onValueChange={(value) => setGroupFilter(value ?? "all")}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Service group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All service groups</SelectItem>
              {serviceGroups.map((group) => (
                <SelectItem key={group.slug} value={group.slug}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={(value) => setAssigneeFilter(value ?? "all")}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {ADMIN_USERS.filter((u) => u.role !== "reviewer").map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
}
