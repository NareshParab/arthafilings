"use client";

import { useState } from "react";
import { FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { setOrderDocumentStatus, addMockDeliveredDocument } from "@/lib/admin-store";
import type { AdminOrder } from "@/types/admin";

const DOC_STATUS_STYLES: Record<string, string> = {
  uploaded: "bg-blue-tint text-primary",
  accepted: "bg-primary text-primary-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export function OrderDocumentsPanel({
  order,
  canReview,
  actor,
}: {
  order: AdminOrder;
  canReview: boolean;
  actor: { id: string; name: string };
}) {
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [deliveredLabel, setDeliveredLabel] = useState("");

  return (
    <div className="space-y-4">
      <Card className="ring-border">
        <CardHeader>
          <CardTitle className="text-navy">Uploaded documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            order.documents.map((doc) => (
              <div key={doc.id} className="flex flex-col gap-2 rounded-lg ring-1 ring-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground" title="Preview unavailable in this mock">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                    {doc.status === "rejected" && doc.rejectReason && (
                      <p className="mt-1 text-xs text-destructive">{doc.rejectReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={DOC_STATUS_STYLES[doc.status]}>{doc.status}</Badge>
                  {canReview && doc.status === "uploaded" && (
                    <>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label="Accept"
                        onClick={() => {
                          setOrderDocumentStatus(order.id, doc.id, "accepted", actor);
                          toast.success(`Accepted ${doc.label}.`);
                        }}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button size="icon-sm" variant="outline" aria-label="Reject" onClick={() => setRejectDocId(doc.id)}>
                        <X className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="ring-border">
        <CardHeader>
          <CardTitle className="text-navy">Delivered documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.deliveredDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing delivered yet.</p>
          ) : (
            order.deliveredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-lg ring-1 ring-border p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-tint text-primary">
                  <FileText className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.label}</p>
                  <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                </div>
              </div>
            ))
          )}

          {canReview && (
            <div className="flex gap-2 pt-1">
              <Input
                value={deliveredLabel}
                onChange={(event) => setDeliveredLabel(event.target.value)}
                placeholder="e.g. Certificate of Incorporation"
              />
              <Button
                variant="outline"
                disabled={!deliveredLabel.trim()}
                onClick={() => {
                  addMockDeliveredDocument(order.id, deliveredLabel.trim(), actor);
                  setDeliveredLabel("");
                  toast.success("Delivered document added (mock upload).");
                }}
              >
                Add (mock)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(rejectDocId)}
        onOpenChange={(open) => !open && setRejectDocId(null)}
        title="Reject document"
        description="Let the customer know what's wrong so they can re-upload."
        confirmLabel="Reject document"
        variant="destructive"
        requireReason
        reasonLabel="Rejection reason"
        onConfirm={(reason) => {
          if (!rejectDocId) return;
          const doc = order.documents.find((d) => d.id === rejectDocId);
          setOrderDocumentStatus(order.id, rejectDocId, "rejected", actor, reason);
          toast.success(`Rejected ${doc?.label ?? "document"}.`);
        }}
      />
    </div>
  );
}
