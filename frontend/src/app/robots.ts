import type { MetadataRoute } from "next";
import { getSiteEnv } from "@/lib/site-env";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export default function robots(): MetadataRoute.Robots {
  const isProduction = getSiteEnv() === "production";
  return {
    rules: {
      userAgent: "*",
      allow: isProduction ? "/" : undefined,
      disallow: isProduction ? "/admin" : "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
