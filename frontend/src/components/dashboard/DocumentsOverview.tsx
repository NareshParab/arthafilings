"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentStatusBadge } from "@/components/dashboard/StatusBadge";
import { useSessionOrders } from "@/lib/mock-session";
import { getDashboardOrders } from "@/data/orders";
import { getDocumentRequirements } from "@/lib/document-requirements";
import { getDocumentsForOrder } from "@/lib/dashboard-helpers";
import { getService } from "@/data/service-catalog";

export default function DocumentsOverview() {
  const sessionOrders = useSessionOrders();
  const orders = getDashboardOrders(sessionOrders);

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-navy">Documents</h1>
        <p className="text-sm text-muted-foreground">Documents for your orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-navy">Documents</h1>
      {orders.map((order) => {
        const service = getService(order.serviceSlug);
        const requirements = getDocumentRequirements(order.serviceSlug);
        const documents = getDocumentsForOrder(order);
        return (
          <Card key={order.id} className="ring-border">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">{service?.name ?? order.serviceSlug}</p>
                  <p className="text-sm text-muted-foreground">Order {order.id}</p>
                </div>
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  View order
                </Link>
              </div>
              <ul className="divide-y divide-border">
                {requirements.map((requirement) => {
                  const doc = documents.find((item) => item.requirementId === requirement.id);
                  return (
                    <li key={requirement.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="text-foreground">{requirement.label}</span>
                      <DocumentStatusBadge status={doc?.status ?? "not_uploaded"} />
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
