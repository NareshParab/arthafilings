import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { serviceGroups, getGroupServices } from "@/data/service-catalog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export function generateStaticParams() {
  return serviceGroups.map((group) => ({ group: group.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: slug } = await params;
  const group = serviceGroups.find((item) => item.slug === slug);
  if (!group) return {};

  return {
    title: group.name,
    description: group.description,
    alternates: { canonical: `${siteUrl}/services/${group.slug}` },
  };
}

export default async function ServiceGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: slug } = await params;
  const group = serviceGroups.find((item) => item.slug === slug);
  if (!group) notFound();

  const groupServices = getGroupServices(group.slug);

  return (
    <>
      <PageHeader title={group.name} description={group.description} />

      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupServices.map((service) => (
              <Link
                key={service.slug}
                href={`/${service.slug}`}
                className="rounded-xl border border-border bg-background p-5 text-sm font-medium text-navy transition-colors hover:border-primary/40 hover:text-primary"
              >
                {service.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
