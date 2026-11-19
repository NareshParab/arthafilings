"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAdminSession } from "@/lib/admin-session";
import { canManageCoupons } from "@/lib/admin-permissions";
import { NoAccessPage } from "@/components/admin/NoAccessPage";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { services } from "@/data/service-catalog";
import { useAdminCoupons, createCoupon, updateCoupon, setCouponActive, isCouponCodeTaken } from "@/lib/admin-coupons-store";
import { formatINR } from "@/lib/pricing";
import type { AdminCoupon, CouponType } from "@/types/admin";

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface CouponDraft {
  code: string;
  type: CouponType;
  value: string;
  minOrder: string;
  validFrom: string;
  validTo: string;
  usageLimit: string;
  appliesAll: boolean;
  selectedServices: string[];
  active: boolean;
}

function draftFromCoupon(coupon?: AdminCoupon | null): CouponDraft {
  if (!coupon) {
    return {
      code: "",
      type: "percent",
      value: "",
      minOrder: "0",
      validFrom: "",
      validTo: "",
      usageLimit: "100",
      appliesAll: true,
      selectedServices: [],
      active: true,
    };
  }
  return {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    minOrder: String(Math.round(coupon.minOrderPaise / 100)),
    validFrom: coupon.validFrom,
    validTo: coupon.validTo,
    usageLimit: String(coupon.usageLimit),
    appliesAll: coupon.appliesTo === "all",
    selectedServices: coupon.appliesTo === "all" ? [] : coupon.appliesTo,
    active: coupon.active,
  };
}

function validateDraft(draft: CouponDraft, excludeId?: string): string[] {
  const errors: string[] = [];
  if (!draft.code.trim()) errors.push("Code is required.");
  else if (isCouponCodeTaken(draft.code, excludeId)) errors.push("This code is already in use.");

  if (draft.type === "percent") {
    const value = Number(draft.value);
    if (!Number.isInteger(value) || value < 1 || value > 100) errors.push("Percent value must be a whole number between 1 and 100.");
  } else {
    const value = Number(draft.value);
    if (!Number.isInteger(value) || value <= 0) errors.push("Flat value must be a positive whole number of rupees.");
  }

  const minOrder = Number(draft.minOrder);
  if (!Number.isInteger(minOrder) || minOrder < 0) errors.push("Minimum order must be zero or a positive whole number of rupees.");

  const usageLimit = Number(draft.usageLimit);
  if (!Number.isInteger(usageLimit) || usageLimit <= 0) errors.push("Usage limit must be a positive whole number.");

  if (!draft.validFrom) errors.push("Valid-from date is required.");
  if (!draft.validTo) errors.push("Valid-to date is required.");
  if (draft.validFrom && draft.validTo && draft.validFrom > draft.validTo) errors.push("Valid-from date must be before the valid-to date.");

  if (!draft.appliesAll && draft.selectedServices.length === 0) errors.push("Select at least one service, or choose \"All services\".");

  return errors;
}

function CouponDialog({
  open,
  onOpenChange,
  coupon,
  actor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: AdminCoupon | null;
  actor: { id: string; name: string; role: "admin" | "staff" | "reviewer" };
}) {
  const [draft, setDraft] = useState<CouponDraft>(() => draftFromCoupon(coupon));
  const [serviceSearch, setServiceSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(draftFromCoupon(coupon));
      setSubmitted(false);
      setServiceSearch("");
    }
    onOpenChange(next);
  }

  const errors = validateDraft(draft, coupon?.id);
  const visibleServices = services.filter((s) => s.name.toLowerCase().includes(serviceSearch.trim().toLowerCase()));

  function handleSubmit() {
    setSubmitted(true);
    if (errors.length > 0) return;

    const payload = {
      code: draft.code.trim().toUpperCase(),
      type: draft.type,
      value: Number(draft.value),
      minOrderPaise: Number(draft.minOrder) * 100,
      validFrom: draft.validFrom,
      validTo: draft.validTo,
      usageLimit: Number(draft.usageLimit),
      appliesTo: draft.appliesAll ? ("all" as const) : draft.selectedServices,
      active: draft.active,
    };

    if (coupon) {
      updateCoupon(coupon.id, payload, actor);
      toast.success("Coupon updated.");
    } else {
      createCoupon(payload, actor);
      toast.success("Coupon created.");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit coupon" : "Create coupon"}</DialogTitle>
          <DialogDescription>Coupons are mock — nothing here is wired to real checkout discounts yet.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-code">Code</Label>
            <Input
              id="coupon-code"
              value={draft.code}
              onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value.toUpperCase() }))}
              placeholder="WELCOME10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={draft.type} onValueChange={(value) => value && setDraft((d) => ({ ...d, type: value as CouponType }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-value">{draft.type === "percent" ? "Percent (1-100)" : "Flat value (₹)"}</Label>
              <Input
                id="coupon-value"
                inputMode="numeric"
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value.replace(/[^\d]/g, "") }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coupon-min">Minimum order (₹)</Label>
            <Input
              id="coupon-min"
              inputMode="numeric"
              value={draft.minOrder}
              onChange={(e) => setDraft((d) => ({ ...d, minOrder: e.target.value.replace(/[^\d]/g, "") }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-from">Valid from</Label>
              <Input id="coupon-from" type="date" value={draft.validFrom} onChange={(e) => setDraft((d) => ({ ...d, validFrom: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coupon-to">Valid to</Label>
              <Input id="coupon-to" type="date" value={draft.validTo} onChange={(e) => setDraft((d) => ({ ...d, validTo: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coupon-usage">Usage limit</Label>
            <Input
              id="coupon-usage"
              inputMode="numeric"
              value={draft.usageLimit}
              onChange={(e) => setDraft((d) => ({ ...d, usageLimit: e.target.value.replace(/[^\d]/g, "") }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Applies to</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="applies-all"
                checked={draft.appliesAll}
                onCheckedChange={(checked) => setDraft((d) => ({ ...d, appliesAll: checked === true }))}
              />
              <Label htmlFor="applies-all" className="font-normal">
                All services
              </Label>
            </div>
            {!draft.appliesAll && (
              <div className="space-y-2 rounded-lg ring-1 ring-border p-2.5">
                <Input placeholder="Search services..." value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)} />
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {visibleServices.map((s) => {
                    const checked = draft.selectedServices.includes(s.slug);
                    return (
                      <label key={s.slug} className="flex items-center gap-2 py-0.5 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) =>
                            setDraft((d) => ({
                              ...d,
                              selectedServices: next === true
                                ? [...d.selectedServices, s.slug]
                                : d.selectedServices.filter((slug) => slug !== s.slug),
                            }))
                          }
                        />
                        {s.name}
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{draft.selectedServices.length} selected</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="coupon-active" checked={draft.active} onCheckedChange={(checked) => setDraft((d) => ({ ...d, active: checked === true }))} />
            <Label htmlFor="coupon-active" className="font-normal">
              Active
            </Label>
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
          <Button onClick={handleSubmit}>{coupon ? "Save changes" : "Create coupon"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CouponsPage() {
  const session = useAdminSession();
  const coupons = useAdminCoupons();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminCoupon | null>(null);

  const sorted = useMemo(() => [...coupons].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [coupons]);

  if (!session) return null;
  if (!canManageCoupons(session)) {
    return <NoAccessPage message="Coupons are managed by admins only." />;
  }

  const actor = { id: session.userId, name: session.name, role: session.role };

  const columns: DataTableColumn<AdminCoupon>[] = [
    { key: "code", header: "Code", sortable: true, sortValue: (c) => c.code, render: (c) => <span className="font-medium text-foreground">{c.code}</span> },
    {
      key: "type",
      header: "Discount",
      render: (c) => (c.type === "percent" ? `${c.value}%` : formatINR(c.value * 100)),
    },
    { key: "minOrder", header: "Min. order", render: (c) => (c.minOrderPaise > 0 ? formatINR(c.minOrderPaise) : "—") },
    { key: "validity", header: "Valid", render: (c) => `${formatDate(c.validFrom)} – ${formatDate(c.validTo)}` },
    { key: "usageLimit", header: "Usage limit", render: (c) => c.usageLimit },
    { key: "appliesTo", header: "Applies to", render: (c) => (c.appliesTo === "all" ? "All services" : `${c.appliesTo.length} services`) },
    {
      key: "active",
      header: "Status",
      render: (c) => (
        <Badge className={`border-transparent ${c.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {c.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCoupon(c);
              setDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant={c.active ? "destructive" : "outline"} size="sm" onClick={() => setConfirmTarget(c)}>
            {c.active ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingCoupon(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Create coupon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sorted}
        getRowId={(c) => c.id}
        searchPlaceholder="Search coupon code..."
        searchKeys={(c) => [c.code]}
        emptyMessage="No coupons yet."
      />

      <CouponDialog open={dialogOpen} onOpenChange={setDialogOpen} coupon={editingCoupon} actor={actor} />

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={confirmTarget?.active ? "Deactivate coupon" : "Reactivate coupon"}
        description={
          confirmTarget?.active
            ? `"${confirmTarget?.code}" will stop applying at checkout. Coupons are deactivated, never deleted.`
            : `"${confirmTarget?.code}" will start applying at checkout again.`
        }
        confirmLabel={confirmTarget?.active ? "Deactivate" : "Reactivate"}
        variant={confirmTarget?.active ? "destructive" : "default"}
        onConfirm={() => {
          if (!confirmTarget) return;
          setCouponActive(confirmTarget.id, !confirmTarget.active, actor);
          toast.success(confirmTarget.active ? "Coupon deactivated." : "Coupon reactivated.");
        }}
      />
    </div>
  );
}
