"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/pricing";
import { useOrderDraft } from "@/lib/mock-session";
import { getService } from "@/data/service-catalog";
import { getMockPackagePrice } from "@/data/packages";

const nextSteps = [
  "Log in with your phone number and the OTP we send you.",
  "Upload the documents we need from the checklist on your dashboard.",
  "We'll prepare and submit your application, and keep you updated.",
];

export default function CheckoutSuccess({ orderId }: { orderId: string }) {
  const order = useOrderDraft(orderId);

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
  const packagePrice = getMockPackagePrice(order.serviceSlug, order.packageId);

  return (
    <div className="space-y-6" data-track={`purchase:${order.serviceSlug}`}>
      <Card className="ring-border">
        <CardContent className="space-y-6 text-center">
          <CheckCircle2 className="mx-auto size-10 text-primary" aria-hidden="true" />
          <div>
            <p className="text-lg font-semibold text-navy">Payment successful</p>
            <p className="mt-1 text-sm text-muted-foreground">Order {order.id}</p>
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(order.amounts.totalPaise)} paid</p>
        </CardContent>
      </Card>

      <Card className="ring-border">
        <CardContent className="space-y-3 text-sm">
          <h2 className="font-semibold text-navy">Receipt summary</h2>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service</span>
            <span className="text-foreground">{service?.name ?? order.serviceSlug}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="text-foreground">{packagePrice?.name ?? order.packageId}</span>
          </div>
          {order.couponCode && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Coupon</span>
              <span className="text-foreground">{order.couponCode}</span>
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

          <span title="Available after backend phase" className="inline-block pt-2">
            <Button disabled>Download invoice</Button>
          </span>
        </CardContent>
      </Card>

      <Card className="ring-border">
        <CardContent className="space-y-3">
          <h2 className="font-semibold text-navy">What happens next</h2>
          <ol className="space-y-2 text-sm text-foreground">
            {nextSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
