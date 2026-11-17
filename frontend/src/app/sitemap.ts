import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

const publicPaths = [
  "",
  "/about",
  "/contact",
  "/proprietorship-registration",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
  }));
}
