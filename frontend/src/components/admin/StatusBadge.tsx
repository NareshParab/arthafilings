import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/admin";
import type { AdminRole } from "@/types/admin";

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  converted: "Converted",
  lost: "Lost",
};

const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-tint text-primary",
  contacted: "bg-gold text-white",
  follow_up: "bg-gold text-white",
  converted: "bg-primary text-primary-foreground",
  lost: "bg-destructive/10 text-destructive",
};

export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <Badge className={cn("border-transparent", LEAD_STATUS_STYLES[status], className)}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = (
  Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]
).map((value) => ({ value, label: LEAD_STATUS_LABELS[value] }));

const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Admin",
  staff: "Staff",
  reviewer: "Reviewer",
};

const ROLE_STYLES: Record<AdminRole, string> = {
  admin: "bg-navy text-white",
  staff: "bg-blue-tint text-primary",
  reviewer: "bg-gold text-white",
};

export function RoleBadge({ role, className }: { role: AdminRole; className?: string }) {
  return (
    <Badge className={cn("border-transparent", ROLE_STYLES[role], className)}>{ROLE_LABELS[role]}</Badge>
  );
}
