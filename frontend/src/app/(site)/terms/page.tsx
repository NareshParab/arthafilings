import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { termsContent } from "@/data/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms that govern your use of Arthafilings' website and services.",
  alternates: { canonical: `${siteUrl}/terms` },
};

export default function TermsPage() {
  return <LegalPage doc={termsContent} />;
}
