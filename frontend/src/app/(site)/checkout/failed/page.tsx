import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CheckoutFailed from "@/components/checkout/CheckoutFailed";

export const metadata: Metadata = {
  title: "Payment failed",
};

function CheckoutFailedSkeleton() {
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
async function CheckoutFailedContent({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  return (
    <>
      <PageHeader title="Payment failed" description="Don't worry, your order details are still saved." />
      <section className="bg-card">
        <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
          <CheckoutFailed orderId={orderId} />
        </div>
      </section>
    </>
  );
}

export default function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <Suspense fallback={<CheckoutFailedSkeleton />}>
      <CheckoutFailedContent searchParams={searchParams} />
    </Suspense>
  );
}
