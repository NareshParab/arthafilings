import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { refundPolicyContent } from "@/data/legal-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Our approach to cancellations and refunds.",
  alternates: { canonical: `${siteUrl}/refund-policy` },
};

export default function RefundPolicyPage() {
  return <LegalPage doc={refundPolicyContent} />;
}
