"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/dashboard/StatusBadge";
import { useSessionOrders } from "@/lib/mock-session";
import { getDashboardOrders } from "@/data/orders";
import { getEffectiveStatus } from "@/lib/dashboard-helpers";
import { getService } from "@/data/service-catalog";
import { formatINR } from "@/lib/pricing";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersList() {
  const sessionOrders = useSessionOrders();
  const orders = getDashboardOrders(sessionOrders);

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-navy">Orders</h1>
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-foreground">You don&apos;t have any orders yet.</p>
          <div className="mt-4">
            <Button nativeButton={false} render={<Link href="/services">Browse services</Link>} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-navy">Orders</h1>

      <div className="space-y-3 md:hidden">
        {orders.map((order) => {
          const service = getService(order.serviceSlug);
          return (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-navy">{service?.name ?? order.serviceSlug}</p>
                <OrderStatusBadge status={getEffectiveStatus(order)} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.id} · {formatDate(order.createdAt)}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{formatINR(order.amounts.totalPaise)}</p>
            </Link>
          );
        })}
      </div>

      <div className="hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const service = getService(order.serviceSlug);
              return (
                <TableRow key={order.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-primary hover:text-primary-hover">
                      {order.id}
                    </Link>
                  </TableCell>
                  <TableCell>{service?.name ?? order.serviceSlug}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{formatINR(order.amounts.totalPaise)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={getEffectiveStatus(order)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
