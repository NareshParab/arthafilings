import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

function buildWhatsAppHref() {
  const digits = siteConfig.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

// Slim utility bar above the main header. Only shown at 1280px and wider —
// below that, the same links live inside the mobile Sheet.
export default function TopBar() {
  return (
    <div className="hidden bg-navy xl:block">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs text-blue-tint/90 sm:px-6">
        <div className="flex items-center gap-4">
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white"
            aria-label={`Call us at ${siteConfig.phone}`}
          >
            <Phone className="size-3.5" aria-hidden="true" />
            {siteConfig.phone}
          </a>
          <a
            href={buildWhatsAppHref()}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp_click"
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white"
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            WhatsApp
          </a>
        </div>

        <div className="flex items-center gap-4">
          {siteConfig.headerNav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
