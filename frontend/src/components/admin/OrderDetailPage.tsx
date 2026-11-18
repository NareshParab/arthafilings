"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ActivityLogList } from "@/components/admin/ActivityLogList";
import { OrderDocumentsPanel } from "@/components/admin/OrderDocumentsPanel";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { getService } from "@/data/service-catalog";
import { ADMIN_USERS } from "@/data/admin-mock";
import { formatINR } from "@/lib/pricing";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { useAdminSession, getAdminUser } from "@/lib/admin-session";
import { useAdminOrders, updateOrder, addOrderInternalNote, nextOrderStep, ORDER_STEP_FLOW } from "@/lib/admin-store";
import {
  canAccessOrder,
  canAssignOrder,
  canAdvanceOrderStep,
  canMarkCompleted,
  canReview,
  canReviewDocuments,
} from "@/lib/admin-permissions";
import { NoAccessPage } from "@/components/admin/NoAccessPage";

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const session = useAdminSession();
  const orders = useAdminOrders();
  const order = orders.find((o) => o.id === orderId);

  const [confirmAdvance, setConfirmAdvance] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmSendBack, setConfirmSendBack] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  if (!session) return null;

  if (!order) {
    return <p className="text-sm text-muted-foreground">This order couldn&apos;t be found.</p>;
  }

  if (!canAccessOrder(session, order)) {
    return <NoAccessPage message="This order isn't assigned to you." />;
  }

  const actor = { id: session.userId, name: session.name };
  const service = getService(order.serviceSlug);
  const review = canReview(session, order);
  const nextStep = nextOrderStep(order.status);
  const advanceAllowed = canAdvanceOrderStep(session, order);
  const completeAllowed = canMarkCompleted(session, order);
  const assignAllowed = canAssignOrder(session, order);
  const preparedByUser = getAdminUser(order.preparedBy);

  return (
    <div className="space-y-4">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-3.5" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-navy">{order.orderNo}</h2>
          <p className="text-sm text-muted-foreground">{service?.name ?? order.serviceSlug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "pending" ? "Payment pending" : "Payment failed"}</Badge>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="ring-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-navy">Customer &amp; order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
              <p className="text-sm text-muted-foreground">{order.customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm text-foreground">
                Base {formatINR(order.amounts.basePaise)}
                {order.amounts.discountPaise > 0 && ` − ${formatINR(order.amounts.discountPaise)} discount`}
              </p>
              <p className="text-sm text-foreground">GST {formatINR(order.amounts.gstPaise)}</p>
              <p className="text-sm font-semibold text-navy">Total {formatINR(order.amounts.totalPaise)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="ring-border">
          <CardHeader>
            <CardTitle className="text-navy">Assigned to</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={order.assignedTo ?? "unassigned"}
              disabled={!assignAllowed}
              onValueChange={(value) => {
                const assignedTo = value === "unassigned" ? null : value;
                updateOrder(order.id, { assignedTo }, `Assigned to ${getAdminUser(assignedTo)?.name ?? "Unassigned"}`, actor);
                toast.success("Order assignment updated.");
              }}
            >
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
            <p className="mt-3 text-xs text-muted-foreground">
              Prepared by: {preparedByUser?.name ?? "Not prepared yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="ring-border">
        <CardHeader>
          <CardTitle className="text-navy">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="flex flex-wrap gap-2 text-xs">
            {ORDER_STEP_FLOW.map((step, index) => {
              const currentIndex = ORDER_STEP_FLOW.indexOf(order.status);
              const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
              return (
                <li
                  key={step}
                  className={
                    state === "current"
                      ? "rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
                      : state === "done"
                        ? "rounded-full bg-blue-tint px-3 py-1 text-primary"
                        : "rounded-full bg-muted px-3 py-1 text-muted-foreground"
                  }
                >
                  {ORDER_STATUS_LABELS[step]}
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap items-center gap-2">
            {nextStep &&
              (advanceAllowed ? (
                <Button onClick={() => setConfirmAdvance(true)}>Move to next step</Button>
              ) : (
                <span title={order.status === "under_review" ? "Needs reviewer approval" : "You can't move this order"}>
                  <Button disabled>Move to next step</Button>
                </span>
              ))}

            {order.status === "under_review" && (session.role === "admin" || session.role === "reviewer") && (
              <>
                {review.allowed ? (
                  <Button variant="default" onClick={() => setConfirmApprove(true)}>
                    <Check className="size-4" /> Approve
                  </Button>
                ) : (
                  <span title={review.reason}>
                    <Button disabled>
                      <Check className="size-4" /> Approve
                    </Button>
                  </span>
                )}
                {review.allowed ? (
                  <Button variant="outline" onClick={() => setConfirmSendBack(true)}>
                    <Undo2 className="size-4" /> Send back with reason
                  </Button>
                ) : (
                  <span title={review.reason}>
                    <Button disabled variant="outline">
                      <Undo2 className="size-4" /> Send back with reason
                    </Button>
                  </span>
                )}
              </>
            )}

            {order.status === "submitted" &&
              (completeAllowed ? (
                <Button onClick={() => setConfirmComplete(true)}>Mark completed</Button>
              ) : (
                <span title="Only the assigned staff member or an admin can mark this completed">
                  <Button disabled>Mark completed</Button>
                </span>
              ))}
          </div>
        </CardContent>
      </Card>

      <OrderDocumentsPanel order={order} canReview={canReviewDocuments(session) && canAccessOrder(session, order)} actor={actor} />

      <Card className="ring-border">
        <CardHeader>
          <CardTitle className="text-navy">Internal notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="outline" className="text-muted-foreground">
            Never visible to the customer
          </Badge>
          {order.internalNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No internal notes yet.</p>
          ) : (
            [...order.internalNotes]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((note) => (
                <div key={note.id} className="rounded-lg bg-muted p-2.5 text-sm">
                  <p className="text-foreground">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.authorName} ·{" "}
                    {new Date(note.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              ))
          )}
          <div className="space-y-2">
            <Label htmlFor="order-note">Add an internal note</Label>
            <Textarea id="order-note" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={2} />
            <Button
              size="sm"
              disabled={!noteDraft.trim()}
              onClick={() => {
                addOrderInternalNote(order.id, noteDraft.trim(), actor);
                setNoteDraft("");
                toast.success("Internal note added.");
              }}
            >
              Add note
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="ring-border">
        <CardHeader>
          <CardTitle className="text-navy">Activity log</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLogList entries={order.activityLog} />
        </CardContent>
      </Card>

      <Separator />

      <ConfirmDialog
        open={confirmAdvance}
        onOpenChange={setConfirmAdvance}
        title="Move to next step"
        description={nextStep ? `Move this order to "${ORDER_STATUS_LABELS[nextStep]}"?` : undefined}
        confirmLabel="Move to next step"
        onConfirm={() => {
          if (!nextStep) return;
          updateOrder(order.id, { status: nextStep }, `Moved to ${ORDER_STATUS_LABELS[nextStep]}`, actor);
          toast.success("Order moved to the next step.");
        }}
      />

      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Approve filing"
        description="This moves the order to Application submitted."
        confirmLabel="Approve"
        onConfirm={() => {
          updateOrder(order.id, { status: "submitted" }, "Approved filing", actor);
          toast.success("Filing approved.");
        }}
      />

      <ConfirmDialog
        open={confirmSendBack}
        onOpenChange={setConfirmSendBack}
        title="Send back with reason"
        description="This sends the order back to the preparer for documents."
        confirmLabel="Send back"
        variant="destructive"
        requireReason
        reasonLabel="What needs to be fixed"
        onConfirm={(reason) => {
          updateOrder(order.id, { status: "documents_pending" }, `Sent back for review: ${reason}`, actor);
          toast.success("Order sent back.");
        }}
      />

      <ConfirmDialog
        open={confirmComplete}
        onOpenChange={setConfirmComplete}
        title="Mark completed"
        description="Only do this once all delivered documents are uploaded."
        confirmLabel="Mark completed"
        onConfirm={() => {
          updateOrder(order.id, { status: "completed" }, "Marked completed", actor);
          toast.success("Order marked completed.");
        }}
      />
    </div>
  );
}
