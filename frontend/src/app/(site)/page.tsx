import type { Metadata } from "next";
import HomeHero from "@/components/sections/HomeHero";
import ServiceTiles from "@/components/sections/ServiceTiles";
import HowItWorks from "@/components/sections/HowItWorks";
import WhyUs from "@/components/sections/WhyUs";
import ClosingCta from "@/components/sections/ClosingCta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Arthafilings helps you register and manage your business filings online, with clear pricing and dedicated support.",
  alternates: {
    canonical: siteUrl,
  },
};

// [VERIFY] Placeholder Organization data until the client confirms the final
// logo URL and any additional organization details.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Arthafilings",
  url: siteUrl,
  logo: `${siteUrl}/logo-placeholder.png`, // [VERIFY]
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ServiceTiles />
      <HowItWorks />
      <WhyUs />
      <ClosingCta
        description="Start your proprietorship registration today."
        ctaHref="/proprietorship-registration"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}
