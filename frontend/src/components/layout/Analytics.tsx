"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { GA_ID, analyticsEnabled, captureUtmParams, getSavedUtmParams, track } from "@/lib/analytics";

function deriveServiceSlug(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return null;
  const knownNonServiceSegments = ["about", "contact", "terms", "privacy", "refund-policy", "disclaimer", "checkout", "login", "dashboard", "admin", "services"];
  return knownNonServiceSegments.includes(segment) ? null : segment;
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    captureUtmParams();
  }, []);

  useEffect(() => {
    function handleTrackedInteraction(event: Event) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!target) return;
      const eventName = target.dataset.track;
      if (!eventName) return;
      track(eventName, {
        serviceSlug: deriveServiceSlug(pathname),
        ...getSavedUtmParams(),
      });
    }

    document.addEventListener("click", handleTrackedInteraction);
    document.addEventListener("submit", handleTrackedInteraction);
    return () => {
      document.removeEventListener("click", handleTrackedInteraction);
      document.removeEventListener("submit", handleTrackedInteraction);
    };
  }, [pathname]);

  if (!analyticsEnabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
