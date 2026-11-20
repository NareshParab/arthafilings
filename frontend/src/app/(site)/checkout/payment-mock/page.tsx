import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PaymentMockFlow from "@/components/checkout/PaymentMockFlow";
import type { PaymentMethod } from "@/types";
import { isMockAllowed } from "@/lib/site-env";

export const metadata: Metadata = {
  title: "Payment",
};

const VALID_METHODS: PaymentMethod[] = ["upi", "card", "netbanking"];

function PaymentMockSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-blue-tint">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-12 text-center sm:px-6">
          <div className="mx-auto h-8 w-1/2 rounded bg-muted" />
          <div className="mx-auto h-4 w-2/3 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

// Resolving searchParams inside this async child (instead of the page body)
// keeps the page shell streamable under Cache Components.
async function PaymentMockContent({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  const { order: orderId, method } = await searchParams;
  if (!orderId) notFound();

  const paymentMethod: PaymentMethod = VALID_METHODS.includes(method as PaymentMethod)
    ? (method as PaymentMethod)
    : "upi";

  return (
    <>
      <PageHeader title="Secure payment" description="You're paying through our mock payment partner." />
      <section className="bg-card">
        <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
          <PaymentMockFlow orderId={orderId} method={paymentMethod} />
        </div>
      </section>
    </>
  );
}

export default function PaymentMockPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; method?: string }>;
}) {
  // MOCK: a stand-in payment partner screen for local testing only.
  if (!isMockAllowed()) notFound();

  return (
    <Suspense fallback={<PaymentMockSkeleton />}>
      <PaymentMockContent searchParams={searchParams} />
    </Suspense>
  );
}
