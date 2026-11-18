import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { homeHero } from "@/data/home-content";

function buildWhatsAppHref() {
  const digits = siteConfig.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

export default function HomeHero() {
  return (
    <section className="bg-blue-tint">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {homeHero.heading}
        </h1>
        <p className="mt-4 text-lg text-foreground">{homeHero.subheading}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            nativeButton={false}
            size="lg"
            render={<Link href="/proprietorship-registration">Get started</Link>}
          />
          <Button
            nativeButton={false}
            size="lg"
            variant="outline"
            data-track="whatsapp_click"
            render={
              <a href={buildWhatsAppHref()} target="_blank" rel="noopener noreferrer">
                Talk to us on WhatsApp
              </a>
            }
          />
        </div>
      </div>
    </section>
  );
}
