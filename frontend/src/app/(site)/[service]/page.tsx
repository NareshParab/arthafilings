import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageTemplate from "@/components/service/ServicePageTemplate";
import { services, serviceGroups, getService } from "@/data/service-catalog";
import { getServiceContent } from "@/data/service-content";
import { assertNoReservedSlugCollisions } from "@/lib/reserved-routes";

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

  return {
    title: service.name,
    description: content.intro,
    alternates: { canonical: `${siteUrl}/${service.slug}` },
  };
}

export default async function ServicePage({
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
