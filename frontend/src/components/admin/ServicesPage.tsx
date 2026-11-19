"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/admin-session";
import { canManageCatalog } from "@/lib/admin-permissions";
import { NoAccessPage } from "@/components/admin/NoAccessPage";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { services, serviceGroups, type ServiceItem, type ServiceMode } from "@/data/service-catalog";
import { useAdminServiceContentMap } from "@/lib/admin-services-store";
import { formatINR } from "@/lib/pricing";
import type { AdminServiceContent, ContentStatus } from "@/types/admin";

const MODE_LABELS: Record<ServiceMode, string> = { live: "Live", enquiry: "Enquiry", hidden: "Hidden" };
const MODE_STYLES: Record<ServiceMode, string> = {
  live: "bg-primary text-primary-foreground",
  enquiry: "bg-gold text-white",
  hidden: "bg-muted text-muted-foreground",
};
const STATUS_LABELS: Record<ContentStatus, string> = { draft: "Draft", ready: "Ready" };
const STATUS_STYLES: Record<ContentStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-blue-tint text-primary",
};

interface ServiceRow {
  service: ServiceItem;
  content: AdminServiceContent;
}

function startingPrice(content: AdminServiceContent): string {
  const priced = content.packages.filter((p) => p.pricePaise > 0);
  if (priced.length === 0) return "—";
  return `From ${formatINR(Math.min(...priced.map((p) => p.pricePaise)))}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ServicesPage() {
  const router = useRouter();
  const session = useAdminSession();
  const contentMap = useAdminServiceContentMap();
  const [groupFilter, setGroupFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = useMemo<ServiceRow[]>(
    () => services.map((service) => ({ service, content: contentMap[service.slug] })).filter((row) => Boolean(row.content)),
    [contentMap]
  );

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (groupFilter !== "all" && row.service.group !== groupFilter) return false;
        if (modeFilter !== "all" && row.content.mode !== modeFilter) return false;
        if (statusFilter !== "all" && row.content.contentStatus !== statusFilter) return false;
        return true;
      }),
    [rows, groupFilter, modeFilter, statusFilter]
  );

  if (!session) return null;
  if (!canManageCatalog(session)) {
    return <NoAccessPage message="Services and prices are managed by admins only." />;
  }

  const columns: DataTableColumn<ServiceRow>[] = [
    {
      key: "name",
      header: "Service",
      sortable: true,
      sortValue: (row) => row.service.name,
      render: (row) => <span className="font-medium text-foreground">{row.service.name}</span>,
    },
    {
      key: "group",
      header: "Group",
      sortable: true,
      sortValue: (row) => row.service.group,
      render: (row) => serviceGroups.find((g) => g.slug === row.service.group)?.name ?? row.service.group,
    },
    {
      key: "mode",
      header: "Mode",
      sortable: true,
      sortValue: (row) => row.content.mode,
      render: (row) => <Badge className={`border-transparent ${MODE_STYLES[row.content.mode]}`}>{MODE_LABELS[row.content.mode]}</Badge>,
    },
    {
      key: "status",
      header: "Content status",
      sortable: true,
      sortValue: (row) => row.content.contentStatus,
      render: (row) => (
        <Badge className={`border-transparent ${STATUS_STYLES[row.content.contentStatus]}`}>
          {STATUS_LABELS[row.content.contentStatus]}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Starting price",
      sortable: true,
      sortValue: (row) => Math.min(...row.content.packages.map((p) => p.pricePaise || Infinity), Infinity),
      render: (row) => startingPrice(row.content),
    },
    {
      key: "lastEdited",
      header: "Last edited",
      sortable: true,
      sortValue: (row) => row.content.lastEditedAt ?? "",
      render: (row) => formatDate(row.content.lastEditedAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={filtered}
      getRowId={(row) => row.service.slug}
      searchPlaceholder="Search service name or slug..."
      searchKeys={(row) => [row.service.name, row.service.slug]}
      onRowClick={(row) => router.push(`/admin/services/${row.service.slug}`)}
      emptyMessage="No services match these filters."
      pageSize={12}
      filters={
        <div className="flex flex-wrap gap-2">
          <Select value={groupFilter} onValueChange={(value) => setGroupFilter(value ?? "all")}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {serviceGroups.map((group) => (
                <SelectItem key={group.slug} value={group.slug}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={modeFilter} onValueChange={(value) => setModeFilter(value ?? "all")}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="enquiry">Enquiry</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Content status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
}
