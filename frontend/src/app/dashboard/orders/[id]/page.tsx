import type { Metadata } from "next";
import { Suspense } from "react";
import OrderDetail from "@/components/dashboard/OrderDetail";

export const metadata: Metadata = {
  title: "Order details",
};

function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 rounded bg-muted" />
      <div className="h-40 rounded bg-muted" />
    </div>
  );
}

// Resolving params inside this async child (instead of the page body) keeps
// the page shell streamable under Cache Components.
async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
