import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus, UploadedDocumentStatus } from "@/types";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  placed: "bg-muted text-foreground",
  documents_pending: "bg-gold text-white",
  documents_received: "bg-blue-tint text-primary",
  under_review: "bg-blue-tint text-primary",
  submitted: "bg-blue-tint text-primary",
  completed: "bg-primary text-primary-foreground",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Badge className={cn("border-transparent", ORDER_STATUS_STYLES[status], className)}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

const DOC_STATUS_LABELS: Record<"not_uploaded" | UploadedDocumentStatus, string> = {
  not_uploaded: "Not uploaded",
  uploaded: "Uploaded",
  accepted: "Accepted",
  rejected: "Rejected",
};

const DOC_STATUS_STYLES: Record<"not_uploaded" | UploadedDocumentStatus, string> = {
  not_uploaded: "bg-muted text-muted-foreground",
  uploaded: "bg-blue-tint text-primary",
  accepted: "bg-primary text-primary-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: "not_uploaded" | UploadedDocumentStatus;
  className?: string;
}) {
  return (
    <Badge className={cn("border-transparent", DOC_STATUS_STYLES[status], className)}>
      {DOC_STATUS_LABELS[status]}
    </Badge>
  );
}
