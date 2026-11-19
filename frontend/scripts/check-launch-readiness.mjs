#!/usr/bin/env node
// Launch readiness gate. In a real production build (NEXT_PUBLIC_SITE_ENV=production)
// this runs as "prebuild" and fails the build with a full list of blockers.
// Run on demand any time with `npm run launch:check` (always checks, regardless of env).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { services } from "../src/data/service-catalog.ts";
import { mockPackagePrices } from "../src/data/packages.ts";
import { siteConfig } from "../src/lib/site-config.ts";
import { buildDefaultContent } from "../src/data/admin-services-mock.ts";

const forced = process.argv.includes("--force");
const isProductionCheck = forced || process.env.NEXT_PUBLIC_SITE_ENV === "production";

if (!isProductionCheck) {
  // Not a production build — this check is a no-op so normal dev/preview
  // builds are never blocked by placeholder/mock data.
  process.exit(0);
}

const problems = [];

// 1. Mock prices on packages used by a 'live' service.
const liveServices = services.filter((s) => s.mode === "live");
for (const service of liveServices) {
  const packages = mockPackagePrices[service.slug] ?? [];
  const mockPackages = packages.filter((p) => p.isMockPrice);
  if (mockPackages.length > 0) {
    problems.push(
      `Live service "${service.slug}" still has mock pricing: ${mockPackages
        .map((p) => p.name)
        .join(", ")}. Confirm real prices and remove isMockPrice before launch.`
    );
  }
}

// 2. Placeholder contact details in site-config.ts.
const PLACEHOLDER_PHONE = "+91 00000 00000";
if (siteConfig.phone === PLACEHOLDER_PHONE) {
  problems.push(`site-config.ts phone is still the placeholder "${PLACEHOLDER_PHONE}".`);
}
if (siteConfig.whatsappNumber === PLACEHOLDER_PHONE) {
  problems.push(`site-config.ts whatsappNumber is still the placeholder "${PLACEHOLDER_PHONE}".`);
}
const PLACEHOLDER_EMAIL_PATTERN = /@example\.(com|org|net)$|^(test|placeholder|changeme)@/i;
if (PLACEHOLDER_EMAIL_PATTERN.test(siteConfig.email)) {
  problems.push(`site-config.ts email is still a placeholder ("${siteConfig.email}").`);
}

// 3. Services marked "ready" without a real legal review, or with
// unresolved [TBD]/[VERIFY] markers in their actual page content.
const PLACEHOLDER_MARKERS = ["[TBD]", "[VERIFY]"];
function findMarkers(text) {
  if (!text) return [];
  return PLACEHOLDER_MARKERS.filter((marker) => text.includes(marker));
}

for (const service of services) {
  const content = buildDefaultContent(service);
  if (content.contentStatus !== "ready") continue;

  // Legal review itself must be a real name/date, not empty or a placeholder.
  const reviewFields = [content.legalReviewedBy, content.legalReviewDate];
  const reviewIsMissing = reviewFields.some((f) => !f);
  const reviewIsPlaceholder = reviewFields.some(
    (f) => f && (f.includes("[TBD") || f.includes("[VERIFY"))
  );
  if (reviewIsMissing) {
    problems.push(`Service "${service.slug}" is marked ready but has no legal review name/date.`);
  } else if (reviewIsPlaceholder) {
    problems.push(
      `Service "${service.slug}" is marked ready but its legal reviewer is still a placeholder ("${content.legalReviewedBy}").`
    );
  }

  // Page content body — never the review fields themselves, which are
  // checked separately above.
  const contentFields = {
    intro: content.intro,
    whatIsIt: content.whatIsIt,
    whoNeedsIt: content.whoNeedsIt.join(" "),
    benefits: content.benefits.join(" "),
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    faqs: content.faqs.map((f) => `${f.question} ${f.answer}`).join(" "),
    packages: content.packages.map((p) => `${p.govtFeeNote} ${p.features.join(" ")}`).join(" "),
  };
  for (const [fieldName, fieldValue] of Object.entries(contentFields)) {
    const markers = findMarkers(fieldValue);
    if (markers.length > 0) {
      problems.push(
        `Service "${service.slug}" is marked ready but its ${fieldName} still contains ${markers.join(", ")}.`
      );
    }
  }
}

// 4. Coupons or demo orders reachable in production data. These are source
// checks (not env-dependent imports) because the whole point is to verify
// the *gating itself* is in place in the committed source.
const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const couponsSource = readFileSync(`${srcDir}/data/coupons.ts`, "utf8");
if (!/NODE_ENV\s*!==\s*["']production["']/.test(couponsSource)) {
  problems.push(
    `data/coupons.ts does not appear to gate coupons behind NODE_ENV !== "production" — mock coupons would be usable in production.`
  );
}

const ordersSource = readFileSync(`${srcDir}/data/orders.ts`, "utf8");
if (!/NODE_ENV\s*!==\s*["']production["']/.test(ordersSource)) {
  problems.push(
    `data/orders.ts does not appear to gate demo orders behind NODE_ENV !== "production" — demo orders would show in production.`
  );
}

if (problems.length > 0) {
  console.error("\nLaunch readiness check FAILED. Fix these before a production build:\n");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(`\n${problems.length} issue(s) found.\n`);
  process.exit(1);
}

console.log("Launch readiness check passed — no blockers found.");
