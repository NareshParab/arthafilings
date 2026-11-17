import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import TrustStrip from "@/components/sections/TrustStrip";
import PackageCards from "@/components/sections/PackageCards";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "Proprietorship Registration",
  description:
    "Register your proprietorship business online with Arthafilings. Simple application process, clear plans, and support from start to finish.",
  alternates: {
    canonical: `${siteUrl}/proprietorship-registration`,
  },
};

export default function ProprietorshipRegistrationPage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <PackageCards />
    </>
  );
}
