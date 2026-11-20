import type { MetadataRoute } from "next";
import { serviceGroups, services } from "@/data/service-catalog";
import { getServiceContent } from "@/data/service-content";
import { getSiteEnv } from "@/lib/site-env";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

const publicPaths = [
  "",
  "/about",
  "/contact",
  "/services",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const inProduction = getSiteEnv() === "production";
  const groupPaths = serviceGroups.map((group) => `/services/${group.slug}`);
  const servicePaths = services
    .filter((service) => service.mode !== "hidden")
    .filter((service) => {
      if (!inProduction) return true;
      const group = serviceGroups.find((item) => item.slug === service.group);
      if (!group) return false; // matches [service]/page.tsx's own notFound() for an unresolved group
      return getServiceContent(service, group).contentStatus !== "draft";
    })
    .map((service) => `/${service.slug}`);

  return [...publicPaths, ...groupPaths, ...servicePaths].map((path) => ({
    url: `${siteUrl}${path}`,
  }));
}
