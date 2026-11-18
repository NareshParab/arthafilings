"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import Timeline from "@/components/dashboard/Timeline";
import DocumentUploader from "@/components/dashboard/DocumentUploader";
import { useSessionOrders, saveUploadedDocuments, saveOrderStatusOverride, useUploadedDocuments, useOrderStatusOverride } from "@/lib/mock-session";
import { getDashboardOrders, getDemoDeliveredDocuments, getDemoNotifications, getDemoUploadedDocuments } from "@/data/orders";
import { getDocumentRequirements } from "@/lib/document-requirements";
import { getTimeline } from "@/lib/order-status";
import { getService } from "@/data/service-catalog";
import { formatINR } from "@/lib/pricing";
import type { Order, UploadedDocument } from "@/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// MOCK: no real file is ever attached. Downloads a small placeholder so the
// interaction can be demoed without pretending to deliver a real document.
function downloadPlaceholderFile(fileName: string, label: string) {
  const blob = new Blob(
    [`This is a placeholder for "${label}".\nNo real document is attached in this mock. [TBD]\n`],
    { type: "text/plain" }
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function OrderDetail({ orderId }: { orderId: string }) {
  const sessionOrders = useSessionOrders();
  const orders = getDashboardOrders(sessionOrders);
  const order = orders.find((item) => item.id === orderId);

  const statusOverride = useOrderStatusOverride(orderId);
  const sessionDocs = useUploadedDocuments(orderId);

  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-foreground">We couldn&apos;t find that order.</p>
        <Button nativeButton={false} variant="outline" render={<Link href="/dashboard/orders">Back to orders</Link>} />
      </div>
    );
  }

  const effectiveOrder: Order = statusOverride ? { ...order, status: statusOverride } : order;
  const service = getService(order.serviceSlug);
  const requirements = getDocumentRequirements(order.serviceSlug);
  const documents = sessionDocs.length > 0 ? sessionDocs : getDemoUploadedDocuments(order.id);
  const deliveredDocuments = getDemoDeliveredDocuments(order.id);
  const notifications = getDemoNotifications(order.id);
  const timeline = getTimeline(effectiveOrder);
  const alreadySubmitted = effectiveOrder.status !== "placed" && effectiveOrder.status !== "documents_pending";

  const confirmedOrderId = order.id;

  function handleDocsChange(newDocs: UploadedDocument[]) {
    saveUploadedDocuments(confirmedOrderId, newDocs);
  }

  function handleSubmitForReview() {
    saveOrderStatusOverride(confirmedOrderId, "documents_received");
    toast.success("Submitted for review. We'll be in touch once it's checked.");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/orders" className="text-sm font-medium text-primary hover:text-primary-hover">
          ← Back to orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-navy">{service?.name ?? order.serviceSlug}</h1>
          <OrderStatusBadge status={effectiveOrder.status} />
        </div>
        <p className="text-sm text-muted-foreground">Order {order.id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-6">
          <Card className="ring-border">
            <CardContent>
              <h2 className="font-semibold text-navy">Status</h2>
              <div className="mt-4">
                <Timeline steps={timeline} />
              </div>
            </CardContent>
          </Card>

          <Card className="ring-border">
            <CardContent className="space-y-4">
              <h2 className="font-semibold text-navy">Documents</h2>
              <DocumentUploader
                requirements={requirements}
                documents={documents}
                onChange={handleDocsChange}
                onSubmitForReview={handleSubmitForReview}
                submitted={alreadySubmitted}
              />
            </CardContent>
          </Card>

          {deliveredDocuments.length > 0 && (
            <Card className="ring-border">
              <CardContent className="space-y-3">
                <h2 className="font-semibold text-navy">Delivered documents</h2>
                <ul className="space-y-2">
                  {deliveredDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-sm font-medium text-foreground">{doc.label}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-track="invoice_download_click"
                        onClick={() => downloadPlaceholderFile(doc.fileName, doc.label)}
                      >
                        <Download aria-hidden="true" />
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="ring-border">
            <CardContent className="space-y-3">
              <h2 className="font-semibold text-navy">Notifications</h2>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((notification) => (
                    <li key={notification.id} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-navy capitalize">{notification.channel}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(notification.sentAt)}</span>
                      </div>
                      <p className="mt-1 text-foreground">{notification.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="ring-border lg:sticky lg:top-6">
          <CardContent className="space-y-3 text-sm">
            <h2 className="font-semibold text-navy">Order summary</h2>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Package price</span>
              <span className="text-foreground">{formatINR(order.amounts.basePaise)}</span>
            </div>
            {order.amounts.discountPaise > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Coupon discount{order.couponCode ? ` (${order.couponCode})` : ""}
                </span>
                <span className="text-foreground">-{formatINR(order.amounts.discountPaise)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">GST</span>
              <span className="text-foreground">{formatINR(order.amounts.gstPaise)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 font-semibold text-navy">
              <span>Total paid</span>
              <span>{formatINR(order.amounts.totalPaise)}</span>
            </div>

            <span title="Available after backend phase" className="inline-block pt-1">
              <Button disabled data-track="invoice_download_click" className="w-full">
                Download invoice
              </Button>
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
