import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import ContactForm from "@/components/sections/ContactForm";
import { siteConfig } from "@/lib/site-config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Arthafilings by phone, email or our contact form.",
  alternates: { canonical: `${siteUrl}/contact` },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact us"
        description="Have a question? Reach out and our team will get back to you."
      />

      <section className="bg-card">
        <div className="mx-auto grid max-w-4xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-foreground">
              <Phone className="size-4 text-primary" aria-hidden="true" />
              {siteConfig.phone}
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <Mail className="size-4 text-primary" aria-hidden="true" />
              {siteConfig.email}
            </p>
          </div>

          <Card>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
