"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useAdminSession } from "@/lib/admin-session";
import { canViewActivityLog } from "@/lib/admin-permissions";
import { NoAccessPage } from "@/components/admin/NoAccessPage";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { SideDrawer } from "@/components/admin/SideDrawer";
import { RoleBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCombinedActivityFeed } from "@/lib/admin-activity-feed";
import type { GlobalActivityEntityType, GlobalActivityEntry } from "@/types/admin";

const ENTITY_LABELS: Record<GlobalActivityEntityType, string> = {
  lead: "Lead",
  order: "Order",
  service: "Service",
  coupon: "Coupon",
  staff: "Staff",
};

const ENTITY_ACTION_LABELS: Record<GlobalActivityEntityType, string> = {
  lead: "Lead update",
  order: "Order update",
  service: "Service edit",
  coupon: "Coupon change",
  staff: "Staff change",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function diffFields(
  before?: Record<string, unknown>,
  after?: Record<string, unknown>
): { key: string; before: string; after: string }[] {
  if (!before || !after) return [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const rows: { key: string; before: string; after: string }[] = [];
  keys.forEach((key) => {
    const beforeValue = JSON.stringify(before[key]);
    const afterValue = JSON.stringify(after[key]);
    if (beforeValue !== afterValue) {
      rows.push({ key, before: beforeValue ?? "—", after: afterValue ?? "—" });
    }
  });
  return rows;
}

function toCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportCsv(entries: GlobalActivityEntry[]) {
  const header = ["When", "Who", "Role", "Action", "Entity type", "Entity", "Summary"];
  const rows = entries.map((entry) => [
    entry.at,
    entry.actorName,
    entry.actorRole ?? "",
    ENTITY_ACTION_LABELS[entry.entityType],
    ENTITY_LABELS[entry.entityType],
    entry.entityLabel,
    entry.action,
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => toCsvValue(String(cell))).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ActivityDrawer({ entry, open, onOpenChange }: { entry: GlobalActivityEntry | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!entry) return null;
  const changes = diffFields(entry.before, entry.after);

  return (
    <SideDrawer open={open} onOpenChange={onOpenChange} title={entry.action} description={`${ENTITY_LABELS[entry.entityType]} — ${entry.entityLabel}`}>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{ENTITY_LABELS[entry.entityType]}</Badge>
        {entry.actorRole && <RoleBadge role={entry.actorRole} />}
      </div>
      <p className="text-sm text-foreground">
        <span className="font-medium">{entry.actorName}</span> — {formatWhen(entry.at)}
      </p>

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Before / after</p>
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No structured before/after was recorded for this entry — see the summary above for what happened.
          </p>
        ) : (
          <div className="space-y-2">
            {changes.map((change) => (
              <div key={change.key} className="rounded-lg bg-muted p-2.5 text-xs">
                <p className="font-medium text-foreground">{change.key}</p>
                <p className="mt-1 break-all text-destructive">− {change.before}</p>
                <p className="break-all text-primary">+ {change.after}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SideDrawer>
  );
}

export function ActivityPage() {
  const session = useAdminSession();
  const entries = useCombinedActivityFeed();
  const [userFilter, setUserFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openEntry, setOpenEntry] = useState<GlobalActivityEntry | null>(null);

  const users = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((entry) => map.set(entry.actorId, entry.actorName));
    return Array.from(map.entries());
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (userFilter !== "all" && entry.actorId !== userFilter) return false;
      if (entityFilter !== "all" && entry.entityType !== entityFilter) return false;
      if (dateFrom && dateOnly(entry.at) < dateFrom) return false;
      if (dateTo && dateOnly(entry.at) > dateTo) return false;
      return true;
    });
  }, [entries, userFilter, entityFilter, dateFrom, dateTo]);

  if (!session) return null;
  if (!canViewActivityLog(session)) {
    return <NoAccessPage message="The activity log is visible to admins only." />;
  }

  const columns: DataTableColumn<GlobalActivityEntry>[] = [
    { key: "when", header: "When", sortable: true, sortValue: (e) => e.at, render: (e) => formatWhen(e.at) },
    { key: "who", header: "Who", render: (e) => e.actorName },
    { key: "role", header: "Role", render: (e) => (e.actorRole ? <RoleBadge role={e.actorRole} /> : "—") },
    { key: "action", header: "Action", render: (e) => ENTITY_ACTION_LABELS[e.entityType] },
    { key: "entity", header: "Entity", render: (e) => `${ENTITY_LABELS[e.entityType]}: ${e.entityLabel}` },
    { key: "summary", header: "Summary", render: (e) => <span className="text-muted-foreground">{e.action}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(e) => e.id}
        searchPlaceholder="Search summary or entity..."
        searchKeys={(e) => [e.action, e.entityLabel, e.actorName]}
        onRowClick={(e) => setOpenEntry(e)}
        emptyMessage="No activity matches these filters."
        pageSize={15}
        filters={
          <div className="flex flex-wrap items-end gap-2">
            <Select value={userFilter} onValueChange={(value) => setUserFilter(value ?? "all")}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                {users.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={(value) => setEntityFilter(value ?? "all")}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entity types</SelectItem>
                {(Object.keys(ENTITY_LABELS) as GlobalActivityEntityType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {ENTITY_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-1">
              <Label htmlFor="activity-from" className="text-xs">
                From
              </Label>
              <Input id="activity-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="activity-to" className="text-xs">
                To
              </Label>
              <Input id="activity-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8" />
            </div>
          </div>
        }
      />

      <ActivityDrawer
        entry={openEntry}
        open={Boolean(openEntry)}
        onOpenChange={(open) => {
          if (!open) setOpenEntry(null);
        }}
      />
    </div>
  );
}
