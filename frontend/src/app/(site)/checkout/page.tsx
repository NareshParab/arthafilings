import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import { getService } from "@/data/service-catalog";
import { getMockPackagePrice } from "@/data/packages";

export const metadata: Metadata = {
  title: "Checkout",
};

function UnavailableMessage({
  heading,
  description,
  ctaHref,
  ctaLabel,
}: {
  heading: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <>
      <PageHeader title={heading} description={description} />
      <section className="bg-card">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <Button nativeButton={false} size="lg" render={<Link href={ctaHref}>{ctaLabel}</Link>} />
        </div>
      </section>
    </>
  );
}

function CheckoutPageSkeleton() {
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
async function CheckoutPageContent({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; package?: string }>;
}) {
  const { service: serviceSlug, package: packageId } = await searchParams;
  const service = serviceSlug ? getService(serviceSlug) : undefined;

  if (!service) {
    return (
      <UnavailableMessage
        heading="We couldn't find that service"
        description="The service you're trying to buy isn't available. Browse our services to find what you need."
        ctaHref="/services"
        ctaLabel="Browse services"
      />
    );
  }

  if (service.mode !== "live") {
    return (
      <UnavailableMessage
        heading={`${service.name} isn't available to buy online yet`}
        description="This service is quoted based on your requirements. Request a callback and our team will get back to you with pricing."
        ctaHref={`/${service.slug}#lead-form`}
        ctaLabel="Request a callback"
      />
    );
  }

  const packagePrice = getMockPackagePrice(service.slug, packageId);

  if (!packagePrice) {
    return (
      <UnavailableMessage
        heading={`Pricing for ${service.name} isn't set up yet`}
        description="We couldn't find a package for this service. Please go back and choose a plan again."
        ctaHref={`/${service.slug}`}
        ctaLabel={`Back to ${service.name}`}
      />
    );
  }

  return (
    <>
      <PageHeader title="Checkout" description={`${service.name} — ${packagePrice.name} plan`} />
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <CheckoutFlow service={service} packagePrice={packagePrice} />
        </div>
      </section>
    </>
  );
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; package?: string }>;
}) {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutPageContent searchParams={searchParams} />
    </Suspense>
  );
}
