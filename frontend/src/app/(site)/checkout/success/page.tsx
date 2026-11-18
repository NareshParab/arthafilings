import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";

export const metadata: Metadata = {
  title: "Order confirmed",
};

function CheckoutSuccessSkeleton() {
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
async function CheckoutSuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  return (
    <>
      <PageHeader title="You're all set!" description="Thanks for your order — here's your receipt." />
      <section className="bg-card">
        <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
          <CheckoutSuccess orderId={orderId} />
        </div>
      </section>
    </>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <Suspense fallback={<CheckoutSuccessSkeleton />}>
      <CheckoutSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
