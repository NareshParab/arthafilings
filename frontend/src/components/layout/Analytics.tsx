"use client";

import { useEffect } from "react";
import Script from "next/script";
import { GA_ID, analyticsEnabled, captureUtmParams, getSavedUtmParams, track } from "@/lib/analytics";

function deriveServiceSlug(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return null;
  const knownNonServiceSegments = ["about", "contact", "terms", "privacy", "refund-policy", "disclaimer", "checkout", "login", "dashboard", "admin", "services"];
  return knownNonServiceSegments.includes(segment) ? null : segment;
}

// Reads window.location at event time rather than subscribing to
// usePathname() — usePathname() is a dynamic client hook that, used here at
// the root layout, forces every page to opt out of static prerendering
// under this project's cacheComponents config (next.config.ts). Reading the
// path lazily from the DOM avoids that without losing per-click accuracy.
export default function Analytics() {
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
        serviceSlug: deriveServiceSlug(window.location.pathname),
        ...getSavedUtmParams(),
      });
    }

    document.addEventListener("click", handleTrackedInteraction);
    document.addEventListener("submit", handleTrackedInteraction);
    return () => {
      document.removeEventListener("click", handleTrackedInteraction);
      document.removeEventListener("submit", handleTrackedInteraction);
    };
  }, []);

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
