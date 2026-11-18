"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/pricing";
import { savePaymentDraft, useOrderDraft } from "@/lib/mock-session";
import { getService } from "@/data/service-catalog";
import type { PaymentMethod } from "@/types";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
};

function generatePaymentId() {
  return `PAY${Date.now().toString(36).toUpperCase()}`;
}

export default function PaymentMockFlow({
  orderId,
  method,
}: {
  orderId: string;
  method: PaymentMethod;
}) {
  const router = useRouter();
  const order = useOrderDraft(orderId);
  const [processing, setProcessing] = useState(false);

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

  const service = getService(order.serviceSlug);

  function resolve(outcome: "paid" | "failed") {
    if (processing) return;
    setProcessing(true);
    savePaymentDraft({ id: generatePaymentId(), orderId, status: outcome, method });
    if (outcome === "paid") {
      router.push(`/checkout/success?order=${orderId}`);
    } else {
      router.push(`/checkout/failed?order=${orderId}`);
    }
  }

  return (
    <Card className="ring-border">
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">Order {order.id}</p>
          <p className="font-semibold text-navy">{service?.name ?? order.serviceSlug}</p>
        </div>

        <div className="rounded-lg border border-border p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Paying via</span>
            <span className="font-medium text-foreground">{METHOD_LABELS[method]}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base font-semibold text-navy">
            <span>Amount</span>
            <span>{formatINR(order.amounts.totalPaise)}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This is a mock payment partner screen for testing. No real payment is made.
        </p>

        <div className="flex gap-3">
          <Button type="button" className="flex-1" disabled={processing} onClick={() => resolve("paid")}>
            Simulate success
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={processing}
            onClick={() => resolve("failed")}
          >
            Simulate failure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
