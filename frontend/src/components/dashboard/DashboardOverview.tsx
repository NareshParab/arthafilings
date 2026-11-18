"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { siteConfig } from "@/lib/site-config";
import { useSessionOrders } from "@/lib/mock-session";
import { getDashboardOrders, getDemoNotifications } from "@/data/orders";
import { getDocumentRequirements } from "@/lib/document-requirements";
import { getDocumentsForOrder, getEffectiveStatus } from "@/lib/dashboard-helpers";
import { getService } from "@/data/service-catalog";
import type { Notification, Order } from "@/types";

function buildWhatsAppHref() {
  const digits = siteConfig.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

function missingDocCount(order: Order) {
  const requirements = getDocumentRequirements(order.serviceSlug);
  const documents = getDocumentsForOrder(order);
  return requirements.filter((req) => {
    const doc = documents.find((item) => item.requirementId === req.id);
    return !doc || doc.status === "rejected";
  }).length;
}

function NextActionCard({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <Card className="ring-border">
        <CardContent className="space-y-3">
          <p className="font-semibold text-navy">Get started</p>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any orders yet. Browse our services to begin your first filing.
          </p>
          <Button nativeButton={false} render={<Link href="/services">Browse services</Link>} />
        </CardContent>
      </Card>
    );
  }

  const pendingDocs = orders
    .map((order) => ({ order, missing: missingDocCount(order) }))
    .find(({ order, missing }) => missing > 0 && getEffectiveStatus(order) !== "completed");

  if (pendingDocs) {
    const service = getService(pendingDocs.order.serviceSlug);
    return (
      <Card className="ring-border">
        <CardContent className="space-y-3">
          <p className="font-semibold text-navy">Next action</p>
          <p className="text-sm text-foreground">
            Upload {pendingDocs.missing} document{pendingDocs.missing === 1 ? "" : "s"} for your{" "}
            {service?.name ?? pendingDocs.order.serviceSlug} order.
          </p>
          <Button
            nativeButton={false}
            render={<Link href={`/dashboard/orders/${pendingDocs.order.id}`}>Upload documents</Link>}
          />
        </CardContent>
      </Card>
    );
  }

  const inProgress = orders.find((order) => getEffectiveStatus(order) !== "completed");
  if (inProgress) {
    const service = getService(inProgress.serviceSlug);
    return (
      <Card className="ring-border">
        <CardContent className="space-y-3">
          <p className="font-semibold text-navy">Next action</p>
          <p className="text-sm text-foreground">
            Your {service?.name ?? inProgress.serviceSlug} order is being worked on — we&apos;ll notify you as it
            moves forward.
          </p>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href={`/dashboard/orders/${inProgress.id}`}>View order</Link>}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ring-border">
      <CardContent className="space-y-1">
        <p className="font-semibold text-navy">You&apos;re all caught up</p>
        <p className="text-sm text-muted-foreground">All your orders are complete.</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const sessionOrders = useSessionOrders();
  const orders = getDashboardOrders(sessionOrders);
  const activeOrders = orders.filter((order) => getEffectiveStatus(order) !== "completed");
  const displayName = orders[0]?.customer.name.split(" ")[0] ?? "there"; // MOCK: no real profile name yet

  const notifications: Array<Notification & { orderId: string }> = orders
    .flatMap((order) => getDemoNotifications(order.id).map((notification) => ({ ...notification, orderId: order.id })))
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Hi {displayName},</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your filings.</p>
      </div>

      <NextActionCard orders={orders} />

      <div>
        <h2 className="text-lg font-semibold text-navy">Active orders</h2>
        {activeOrders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No active orders right now.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {activeOrders.map((order) => {
              const service = getService(order.serviceSlug);
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
                >
                  <div>
                    <p className="font-medium text-navy">{service?.name ?? order.serviceSlug}</p>
                    <p className="text-sm text-muted-foreground">Order {order.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={getEffectiveStatus(order)} />
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-navy">Recent notifications</h2>
        {notifications.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="rounded-lg border border-border p-3 text-sm">
                <span className="font-medium text-navy capitalize">{notification.channel}</span>{" "}
                <span className="text-foreground">{notification.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="ring-border">
        <CardContent className="space-y-3">
          <p className="font-semibold text-navy">Need help?</p>
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}>
                  <Phone aria-hidden="true" />
                  {siteConfig.phone}
                </a>
              }
            />
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <a href={buildWhatsAppHref()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  WhatsApp
                </a>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
