import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { privacyContent } from "@/data/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn what personal information Arthafilings collects and how it is used.",
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return <LegalPage doc={privacyContent} />;
}
