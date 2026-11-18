import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { disclaimerContent } from "@/data/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Please read this disclaimer before using our website or services.",
  alternates: { canonical: `${siteUrl}/disclaimer` },
};

export default function DisclaimerPage() {
  return <LegalPage doc={disclaimerContent} />;
}
