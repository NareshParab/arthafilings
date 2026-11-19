// MOCK: default admin-editable content for every catalog service, derived
// from the public catalog + content files. This is only the *starting point*
// the admin store seeds itself with — actual edits live in
// lib/admin-services-store.ts's localStorage layer and never touch the
// public site's real data files. Replace with a real content API in the
// backend phase.
import type { AdminServiceContent, AdminServiceDocument, AdminServiceFaq, AdminServicePackage } from "@/types/admin";
import { services, serviceGroups, type ServiceItem } from "@/data/service-catalog";
import { getServiceContent } from "@/data/service-content";
import { mockPackagePrices } from "@/data/packages";

function buildDocuments(service: ServiceItem): AdminServiceDocument[] {
  const group = serviceGroups.find((g) => g.slug === service.group)!;
  const content = getServiceContent(service, group);
  const documents: AdminServiceDocument[] = [];
  content.documentsNeeded.forEach((docGroup, groupIndex) => {
    docGroup.items.forEach((item, itemIndex) => {
      documents.push({
        id: `${service.slug}-doc-${groupIndex}-${itemIndex}`,
        label: content.documentsNeeded.length > 1 ? `${docGroup.heading} — ${item}` : item,
        required: true,
      });
    });
  });
  return documents;
}

function buildFaqs(service: ServiceItem, group: (typeof serviceGroups)[number]): AdminServiceFaq[] {
  const content = getServiceContent(service, group);
  return content.faqs.map((faq, index) => ({
    id: `${service.slug}-faq-${index}`,
    question: faq.question,
    answer: faq.answer,
  }));
}

function buildPackages(service: ServiceItem, group: (typeof serviceGroups)[number]): AdminServicePackage[] {
  const content = getServiceContent(service, group);
  const prices = mockPackagePrices[service.slug];

  if (prices && prices.length > 0) {
    return prices.map((price) => {
      const contentPackage = content.packages?.find((p) => p.id === price.packageId);
      return {
        id: price.packageId,
        name: price.name,
        pricePaise: price.amountPaise,
        govtFeeNote: contentPackage?.govtFeeNote ?? "Govt. fees not included — billed separately. [TBD]",
        popular: contentPackage?.popular ?? false,
        features: contentPackage?.features ?? [],
        buttonLabel: contentPackage?.ctaLabel ?? "Continue",
      };
    });
  }

  if (content.packages && content.packages.length > 0) {
    return content.packages.map((p) => ({
      id: p.id,
      name: p.name,
      pricePaise: 0, // MOCK price [TBD] — not yet priced, needs a real rupee value before this can go live
      govtFeeNote: p.govtFeeNote,
      popular: p.popular ?? false,
      features: p.features,
      buttonLabel: p.ctaLabel,
    }));
  }

  return [
    {
      id: "standard",
      name: "Standard",
      pricePaise: 0, // MOCK price [TBD]
      govtFeeNote: "Govt. fees not included — billed separately. [TBD]",
      popular: false,
      features: [],
      buttonLabel: "Continue",
    },
  ];
}

function buildPriceChipText(packages: AdminServicePackage[], mode: ServiceItem["mode"]): string {
  if (mode === "enquiry") return "Get a quote";
  const priced = packages.filter((p) => p.pricePaise > 0);
  if (priced.length === 0) return "Price [TBD]";
  const cheapest = Math.min(...priced.map((p) => p.pricePaise));
  return `From ₹${Math.round(cheapest / 100).toLocaleString("en-IN")}`;
}

function buildDefaultContent(service: ServiceItem): AdminServiceContent {
  const group = serviceGroups.find((g) => g.slug === service.group)!;
  const content = getServiceContent(service, group);
  const packages = buildPackages(service, group);

  // Seed only the one real "live" service as already legally reviewed and
  // ready — every other service starts as an untouched draft, which is the
  // honest starting state for 115 services nobody has reviewed yet.
  const isSeedReady = service.slug === "proprietorship-registration";

  return {
    slug: service.slug,
    mode: service.mode,
    contentStatus: isSeedReady ? "ready" : "draft",
    intro: content.intro,
    priceChipText: buildPriceChipText(packages, service.mode),
    packages,
    whatIsIt: [content.whatIsIt.heading, ...content.whatIsIt.paragraphs].join("\n\n"),
    whoNeedsIt: content.whoNeedsIt,
    benefits: content.whatYouGet,
    documents: buildDocuments(service),
    faqs: buildFaqs(service, group),
    seoTitle: `${service.name} | Arthafilings`, // [VERIFY]
    seoDescription: content.intro, // [VERIFY]
    legalReviewedBy: isSeedReady ? "Priya Sharma, CS" : "", // [VERIFY] with client
    legalReviewDate: isSeedReady ? "2026-11-10" : "",
    lastEditedAt: null,
    lastEditedBy: null,
  };
}

const isDev = process.env.NODE_ENV !== "production";

// Keep this cheap: build once, lazily, rather than at module-eval time for
// every import — 116 services isn't huge, but there's no reason to pay for
// it in environments that never touch the admin panel.
let cached: Record<string, AdminServiceContent> | null = null;

export function getDefaultAdminServiceContent(): Record<string, AdminServiceContent> {
  if (!isDev) return {};
  if (cached) return cached;
  cached = Object.fromEntries(services.map((service) => [service.slug, buildDefaultContent(service)]));
  return cached;
}
