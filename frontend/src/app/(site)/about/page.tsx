import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import { aboutContent } from "@/data/about-content";
import { getSiteEnv } from "@/lib/site-env";
import { hasPlaceholderMarker } from "@/lib/placeholder-markers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arthafilings.com";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Arthafilings and how we help with business registration and compliance.",
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  const hideIntro = getSiteEnv() === "production" && hasPlaceholderMarker(aboutContent.intro);

  return (
    <>
      <PageHeader title="About Arthafilings" />

      <section className="bg-card">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-14 sm:px-6">
          {!hideIntro && <p className="text-foreground">{aboutContent.intro}</p>}
          <p className="text-foreground">{aboutContent.mission}</p>

          <div>
            <h2 className="text-xl font-semibold text-navy">Our approach</h2>
            <ul className="mt-4 space-y-4">
              {aboutContent.approach.map((item) => (
                <li key={item.title}>
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 text-center">
            <Button nativeButton={false} render={<Link href="/contact">Get in touch</Link>} />
          </div>
        </div>
      </section>
    </>
  );
}
