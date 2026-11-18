import type { MetadataRoute } from "next";
import { serviceGroups, services } from "@/data/service-catalog";

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
  const groupPaths = serviceGroups.map((group) => `/services/${group.slug}`);
  const servicePaths = services
    .filter((service) => service.mode !== "hidden")
    .map((service) => `/${service.slug}`);

  return [...publicPaths, ...groupPaths, ...servicePaths].map((path) => ({
    url: `${siteUrl}${path}`,
  }));
}
