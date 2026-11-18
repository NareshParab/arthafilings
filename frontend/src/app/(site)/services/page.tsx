import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { serviceGroups, getGroupServices } from "@/data/service-catalog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "All Services",
  description: "Browse every Arthafilings service, grouped by category.",
  alternates: { canonical: `${siteUrl}/services` },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="All services"
        description="Everything we help with, grouped by category."
      />

      <section className="bg-card">
        <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6">
          {serviceGroups.map((group) => {
            const groupServices = getGroupServices(group.slug);
            return (
              <div key={group.slug}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                    {group.name}
                  </h2>
                  <Link
                    href={`/services/${group.slug}`}
                    className="text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    View all {group.name} services →
                  </Link>
                </div>
                <p className="mt-2 max-w-2xl text-muted-foreground">{group.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupServices.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/${service.slug}`}
                      className="rounded-xl border border-border bg-background p-4 text-sm font-medium text-navy transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
