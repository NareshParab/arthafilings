"use client";

import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { SideDrawer } from "@/components/admin/SideDrawer";
import { LeadStatusBadge, LEAD_STATUS_OPTIONS } from "@/components/admin/StatusBadge";
import { ActivityLogList } from "@/components/admin/ActivityLogList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getService } from "@/data/service-catalog";
import { ADMIN_USERS } from "@/data/admin-mock";
import { getAdminUser, type AdminSession } from "@/lib/admin-session";
import { addLeadNote, updateLead } from "@/lib/admin-store";
import { canAssignLead, canEditLead } from "@/lib/admin-permissions";
import type { AdminLead, LeadStatus } from "@/types/admin";

const EXTRA_FIELD_LABELS: Record<string, string> = {
  state: "State",
  gstin: "GSTIN",
  pan: "PAN",
  brandName: "Brand name",
};

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export function LeadDrawer({
  lead,
  session,
  open,
  onOpenChange,
}: {
  lead: AdminLead | null;
  session: AdminSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [noteDraft, setNoteDraft] = useState("");

  if (!lead) return null;

  const leadId = lead.id;
  const editable = canEditLead(session, lead);
  const assignable = canAssignLead(session, lead);
  const actor = { id: session.userId, name: session.name };
  const extraEntries = Object.entries(lead.extra).filter(([, value]) => value) as [string, string][];

  function handleStatusChange(value: string | null) {
    if (!value) return;
    updateLead(leadId, { status: value as LeadStatus }, `Status changed to ${value}`, actor);
    toast.success("Lead status updated.");
  }

  function handleAssignChange(value: string | null) {
    const assignedTo = value === "unassigned" ? null : value;
    const name = assignedTo ? getAdminUser(assignedTo)?.name : "Unassigned";
    updateLead(leadId, { assignedTo }, `Assigned to ${name}`, actor);
    toast.success("Lead assignment updated.");
  }

  function handleFollowUpChange(value: string) {
    updateLead(leadId, { followUpDate: value || undefined }, "Updated follow-up date", actor);
    toast.success("Follow-up date updated.");
  }

  function handleAddNote() {
    if (!noteDraft.trim()) return;
    addLeadNote(leadId, noteDraft.trim(), actor);
    setNoteDraft("");
    toast.success("Note added.");
  }

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={lead.name}
      description={getService(lead.serviceSlug)?.name ?? lead.serviceSlug}
    >
      <div className="flex items-center gap-2">
        <LeadStatusBadge status={lead.status} />
        <a
          href={`tel:+91${digitsOnly(lead.phone)}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Phone className="size-3.5" /> {lead.phone}
        </a>
        <a
          href={`https://wa.me/91${digitsOnly(lead.phone)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <MessageCircle className="size-3.5" /> WhatsApp
        </a>
      </div>
      <p className="text-sm text-muted-foreground">{lead.email}</p>

      {extraEntries.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Form details</p>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {extraEntries.map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted-foreground">{EXTRA_FIELD_LABELS[key] ?? key}</dt>
                <dd className="text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {(lead.utmSource || lead.utmCampaign) && (
        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">UTM tags</p>
          <p className="text-sm text-foreground">
            {lead.utmSource ?? "—"} {lead.utmCampaign ? `/ ${lead.utmCampaign}` : ""}
          </p>
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={lead.status} onValueChange={handleStatusChange} disabled={!editable}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Assigned to</Label>
          <Select value={lead.assignedTo ?? "unassigned"} onValueChange={handleAssignChange} disabled={!assignable}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {ADMIN_USERS.filter((u) => u.role !== "reviewer").map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-followup">Follow-up date</Label>
        <Input
          id="lead-followup"
          type="date"
          defaultValue={lead.followUpDate ?? ""}
          disabled={!editable}
          onBlur={(event) => handleFollowUpChange(event.target.value)}
        />
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Notes</p>
        <div className="space-y-3">
          {lead.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            [...lead.notes]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((note) => (
                <div key={note.id} className="rounded-lg bg-muted p-2.5 text-sm">
                  <p className="text-foreground">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.authorName} · {new Date(note.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              ))
          )}
        </div>
        {editable && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Add a note..."
              rows={2}
            />
            <Button size="sm" onClick={handleAddNote} disabled={!noteDraft.trim()}>
              Add note
            </Button>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Activity</p>
        <ActivityLogList entries={lead.activityLog} />
      </div>
    </SideDrawer>
  );
}
