import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ServicePageTemplate from "@/components/service/ServicePageTemplate";
import { services, serviceGroups, getService } from "@/data/service-catalog";
import { getServiceContent } from "@/data/service-content";
import { assertNoReservedSlugCollisions } from "@/lib/reserved-routes";
import { getSiteEnv } from "@/lib/site-env";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export function generateStaticParams() {
  assertNoReservedSlugCollisions(services.map((service) => service.slug));
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  const group = serviceGroups.find((item) => item.slug === service.group);
  const content = getServiceContent(service, group ?? serviceGroups[0]);
  const isDraftInProduction = content.contentStatus === "draft" && getSiteEnv() === "production";

  if (isDraftInProduction) {
    return {
      title: service.name,
      description: `Get help with ${service.name} from Arthafilings — share your details and our team will get in touch.`,
      alternates: { canonical: `${siteUrl}/${service.slug}` },
      robots: { index: false, follow: false },
    };
  }

  return {
    title: service.name,
    description: content.intro,
    alternates: { canonical: `${siteUrl}/${service.slug}` },
  };
}

function ServicePageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-blue-tint">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-14 sm:px-6 lg:py-20">
          <div className="h-5 w-24 rounded-full bg-muted" />
          <div className="h-9 w-2/3 rounded bg-muted" />
          <div className="h-4 w-full max-w-md rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

// The params promise is only resolved inside this async child so the page
// shell above can prerender statically; Next flags `await params` used
// directly in a page body as dynamic access outside Suspense otherwise.
async function ServicePageContent({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service || service.mode === "hidden") notFound();

  const group = serviceGroups.find((item) => item.slug === service.group);
  if (!group) notFound();

  return <ServicePageTemplate service={service} group={group} />;
}

export default function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  return (
    <Suspense fallback={<ServicePageSkeleton />}>
      <ServicePageContent params={params} />
    </Suspense>
  );
}
