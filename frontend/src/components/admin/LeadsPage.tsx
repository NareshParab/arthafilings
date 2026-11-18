"use client";

import { useMemo, useState } from "react";
import { useAdminSession, getAdminUser } from "@/lib/admin-session";
import { useAdminLeads } from "@/lib/admin-store";
import { canViewLeads } from "@/lib/admin-permissions";
import { NoAccessPage } from "@/components/admin/NoAccessPage";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { LeadStatusBadge, LEAD_STATUS_OPTIONS } from "@/components/admin/StatusBadge";
import { LeadDrawer } from "@/components/admin/LeadDrawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getService, serviceGroups } from "@/data/service-catalog";
import { ADMIN_USERS } from "@/data/admin-mock";
import type { AdminLead } from "@/types/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function LeadsPage() {
  const session = useAdminSession();
  const allLeads = useAdminLeads();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const visibleLeads = useMemo(() => {
    if (!session) return [];
    if (session.role === "staff") {
      return allLeads.filter((lead) => lead.assignedTo === null || lead.assignedTo === session.userId);
    }
    return allLeads;
  }, [allLeads, session]);

  const filteredLeads = useMemo(() => {
    return visibleLeads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (groupFilter !== "all" && getService(lead.serviceSlug)?.group !== groupFilter) return false;
      if (assigneeFilter === "unassigned" && lead.assignedTo !== null) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && lead.assignedTo !== assigneeFilter) return false;
      return true;
    });
  }, [visibleLeads, statusFilter, groupFilter, assigneeFilter]);

  if (!session) return null;
  if (!canViewLeads(session)) {
    return <NoAccessPage message="Reviewers work on orders in review — leads aren't part of that role." />;
  }

  const openLead = openLeadId ? allLeads.find((lead) => lead.id === openLeadId) ?? null : null;

  const columns: DataTableColumn<AdminLead>[] = [
    { key: "name", header: "Name", sortable: true, sortValue: (l) => l.name, render: (l) => <span className="font-medium text-foreground">{l.name}</span> },
    { key: "phone", header: "Phone", render: (l) => l.phone },
    { key: "service", header: "Service", render: (l) => getService(l.serviceSlug)?.name ?? l.serviceSlug },
    { key: "status", header: "Status", sortable: true, sortValue: (l) => l.status, render: (l) => <LeadStatusBadge status={l.status} /> },
    { key: "assignedTo", header: "Assigned to", render: (l) => getAdminUser(l.assignedTo)?.name ?? "Unassigned" },
    {
      key: "utm",
      header: "Source / campaign",
      render: (l) => (
        <span className="text-muted-foreground">
          {l.utmSource ?? "—"}
          {l.utmCampaign ? ` / ${l.utmCampaign}` : ""}
        </span>
      ),
    },
    { key: "createdAt", header: "Created", sortable: true, sortValue: (l) => l.createdAt, render: (l) => formatDate(l.createdAt) },
    { key: "followUp", header: "Next follow-up", render: (l) => (l.followUpDate ? formatDate(`${l.followUpDate}T00:00:00.000Z`) : "—") },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={filteredLeads}
        getRowId={(lead) => lead.id}
        searchPlaceholder="Search name, phone, email..."
        searchKeys={(lead) => [lead.name, lead.phone, lead.email]}
        onRowClick={(lead) => setOpenLeadId(lead.id)}
        emptyMessage="No leads match these filters."
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LEAD_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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

      <LeadDrawer
        lead={openLead}
        session={session}
        open={Boolean(openLead)}
        onOpenChange={(open) => {
          if (!open) setOpenLeadId(null);
        }}
      />
    </div>
  );
}
