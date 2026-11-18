"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrderDraft, usePaymentDraft } from "@/lib/mock-session";

export default function CheckoutFailed({ orderId }: { orderId: string }) {
  const order = useOrderDraft(orderId);
  const payment = usePaymentDraft(orderId);

  if (!order) {
    return (
      <Card className="ring-border">
        <CardContent className="space-y-4 text-center">
          <p className="text-foreground">We couldn&apos;t find that order in this session.</p>
          <Button nativeButton={false} render={<Link href="/services">Browse services</Link>} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ring-border">
      <CardContent className="space-y-4 text-center">
        <XCircle className="mx-auto size-10 text-destructive" aria-hidden="true" />
        <div>
          <p className="text-lg font-semibold text-navy">Payment didn&apos;t go through</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Order {order.id} hasn&apos;t been charged. This was a simulated failure — nothing was lost, and
            you can try again.
          </p>
        </div>
        <Button
          nativeButton={false}
          className="w-full"
          render={
            <Link href={`/checkout/payment-mock?order=${order.id}&method=${payment?.method ?? "upi"}`}>
              Try again
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
}
