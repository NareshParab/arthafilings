"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAdminSession } from "@/lib/admin-session";
import { canManageStaff } from "@/lib/admin-permissions";
import { NoAccessPage } from "@/components/admin/NoAccessPage";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PermissionTable } from "@/components/admin/PermissionTable";
import { useAdminStaff, inviteStaff, changeStaffRole, setStaffStatus, isStaffEmailTaken } from "@/lib/admin-staff-store";
import type { AdminRole, StaffMember } from "@/types/admin";

function formatWhen(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function InviteDialog({
  open,
  onOpenChange,
  actor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor: { id: string; name: string; role: AdminRole };
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [submitted, setSubmitted] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setName("");
      setEmail("");
      setRole("staff");
      setSubmitted(false);
    }
    onOpenChange(next);
  }

  const errors: string[] = [];
  if (!name.trim()) errors.push("Name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push("A valid email is required.");
  else if (isStaffEmailTaken(email)) errors.push("This email is already on the team.");

  function handleSubmit() {
    setSubmitted(true);
    if (errors.length > 0) return;
    inviteStaff({ name: name.trim(), email: email.trim(), role }, actor);
    toast.success(`Invited ${name.trim()} (mock — no email was sent).`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite staff</DialogTitle>
          <DialogDescription>Mock invite — this doesn&apos;t send a real email or create a real login.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Name</Label>
            <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => value && setRole(value as AdminRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {submitted && errors.length > 0 && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <ul className="list-disc space-y-0.5 pl-4">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StaffPage() {
  const session = useAdminSession();
  const staff = useAdminStaff();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<StaffMember | null>(null);

  if (!session) return null;
  if (!canManageStaff(session)) {
    return <NoAccessPage message="Staff management is restricted to admins." />;
  }

  const actor = { id: session.userId, name: session.name, role: session.role };

  const columns: DataTableColumn<StaffMember>[] = [
    { key: "name", header: "Name", sortable: true, sortValue: (m) => m.name, render: (m) => <span className="font-medium text-foreground">{m.name}</span> },
    { key: "email", header: "Email", render: (m) => m.email },
    {
      key: "role",
      header: "Role",
      render: (m) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={m.role}
            onValueChange={(value) => {
              if (!value || value === m.role) return;
              changeStaffRole(m.id, value as AdminRole, actor);
              toast.success(`${m.name}'s role updated.`);
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="reviewer">Reviewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (m) => (
        <span className={m.status === "active" ? "text-primary" : "text-muted-foreground"}>
          {m.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    { key: "lastActive", header: "Last active", sortable: true, sortValue: (m) => m.lastActiveAt ?? "", render: (m) => formatWhen(m.lastActiveAt) },
    {
      key: "actions",
      header: "",
      render: (m) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant={m.status === "active" ? "destructive" : "outline"} size="sm" onClick={() => setConfirmTarget(m)}>
            {m.status === "active" ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="size-4" /> Invite staff
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={[...staff].sort((a, b) => a.name.localeCompare(b.name))}
        getRowId={(m) => m.id}
        searchPlaceholder="Search name or email..."
        searchKeys={(m) => [m.name, m.email]}
        emptyMessage="No staff yet."
      />

      <Card className="ring-border">
        <CardHeader>
          <CardTitle className="text-navy">What each role can do</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionTable />
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} actor={actor} />

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={confirmTarget?.status === "active" ? "Deactivate staff member" : "Reactivate staff member"}
        description={
          confirmTarget?.status === "active"
            ? `${confirmTarget?.name} will lose access to the admin panel.`
            : `${confirmTarget?.name} will regain access to the admin panel.`
        }
        confirmLabel={confirmTarget?.status === "active" ? "Deactivate" : "Reactivate"}
        variant={confirmTarget?.status === "active" ? "destructive" : "default"}
        onConfirm={() => {
          if (!confirmTarget) return;
          const nextStatus = confirmTarget.status === "active" ? "inactive" : "active";
          setStaffStatus(confirmTarget.id, nextStatus, actor);
          toast.success(nextStatus === "active" ? "Staff member reactivated." : "Staff member deactivated.");
        }}
      />
    </div>
  );
}
