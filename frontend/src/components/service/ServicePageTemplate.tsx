import Link from "next/link";
import { FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TrustStrip from "@/components/sections/TrustStrip";
import PackageCards from "@/components/sections/PackageCards";
import FAQ from "@/components/sections/FAQ";
import ClosingCta from "@/components/sections/ClosingCta";
import ServiceLeadForm from "@/components/forms/ServiceLeadForm";
import { getGroupServices, type ServiceGroup, type ServiceItem } from "@/data/service-catalog";
import { getServiceContent, processSteps } from "@/data/service-content";

function priceChip(service: ServiceItem) {
  return service.cta === "quote" ? "Get a quote" : "From ₹ [TBD]";
}

export default function ServicePageTemplate({
  service,
  group,
}: {
  service: ServiceItem;
  group: ServiceGroup;
}) {
  const content = getServiceContent(service, group);
  const relatedServices = getGroupServices(group.slug).filter((item) => item.slug !== service.slug);

  return (
    <>
      {content.contentStatus === "draft" && process.env.NODE_ENV !== "production" && (
        <div className="bg-destructive px-4 py-2 text-center text-xs font-semibold tracking-wide text-white">
          DRAFT CONTENT — generic placeholder text for this service, not reviewed. [VERIFY] [TBD]
        </div>
      )}

      <section className="bg-blue-tint">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <Badge variant="outline" className="border-primary/30 text-primary">
            {group.name}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {service.name}
          </h1>
          <p className="mt-3 max-w-2xl text-foreground">{content.intro}</p>
          <div className="mt-4">
            <Badge className="bg-gold text-white">{priceChip(service)}</Badge>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-lg font-semibold text-navy">What you get</h2>
              <ul className="mt-4 space-y-3">
                {content.whatYouGet.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-foreground">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#documents"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
              >
                <FileCheck className="size-4" aria-hidden="true" />
                Required documents
              </a>
            </div>

            <ServiceLeadForm service={service} />
          </div>
        </div>
      </section>

      <TrustStrip />

      {service.mode === "live" && content.packages ? (
        <PackageCards packages={content.packages} serviceSlug={service.slug} />
      ) : (
        <section id="packages" className="bg-cream">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Pricing for {service.name}
            </h2>
            <p className="mt-3 text-muted-foreground">
              This service is quoted based on your requirements. Share your details and we&apos;ll
              get back to you with a price. [TBD]
            </p>
            <div className="mt-6">
              <Button nativeButton={false} size="lg" render={<a href="#lead-form">Get a quote</a>} />
            </div>
          </div>
        </section>
      )}

      <section className="bg-card">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            {content.whatIsIt.heading}
          </h2>
          <div className="mt-4 space-y-4 text-foreground">
            {content.whatIsIt.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Who needs {service.name}?
          </h2>
          <ul className="mt-6 space-y-3">
            {content.whoNeedsIt.map((item) => (
              <li key={item} className="flex items-start gap-2 text-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="documents" className="bg-card">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Documents you will need
          </h2>
          <div
            className={cn(
              "mt-10 grid gap-10",
              content.documentsNeeded.length > 1 && "sm:grid-cols-2"
            )}
          >
            {content.documentsNeeded.map((docGroup) => (
              <div key={docGroup.heading}>
                <h3 className="font-semibold text-navy">{docGroup.heading}</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {docGroup.items.map((doc) => (
                    <li key={doc} className="flex items-start gap-2">
                      <FileCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-10 space-y-8">
            {processSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-navy">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FAQ faqs={content.faqs} />

      {relatedServices.length > 0 && (
        <section className="bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Related services
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="rounded-xl border border-border bg-background p-4 text-sm font-medium text-navy transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ClosingCta description={`Start your ${service.name.toLowerCase()} today.`} ctaHref="#lead-form" />
    </>
  );
}
