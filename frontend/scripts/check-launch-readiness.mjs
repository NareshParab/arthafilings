#!/usr/bin/env node
// Launch readiness gate. Runs as "prebuild" on every `next build`, and fails
// the build with a full list of blockers whenever the build would behave as
// production (see getSiteEnv() — that includes a build where
// NEXT_PUBLIC_SITE_ENV was simply never set, which is the risky default this
// gate exists to catch). Run on demand any time with `npm run launch:check`.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { services, serviceGroups } from "../src/data/service-catalog.ts";
import { mockPackagePrices } from "../src/data/packages.ts";
import { siteConfig } from "../src/lib/site-config.ts";
import { getServiceContent } from "../src/data/service-content.ts";
import { termsContent, privacyContent, refundPolicyContent, disclaimerContent } from "../src/data/legal-content.ts";
import { getSiteEnv } from "../src/lib/site-env.ts";

const forced = process.argv.includes("--force");
const resolvedSiteEnv = getSiteEnv();
const isProductionCheck = forced || resolvedSiteEnv === "production";

if (!isProductionCheck) {
  // Not a production build — this check is a no-op so normal dev/preview
  // builds are never blocked by placeholder/mock data.
  process.exit(0);
}

const problems = [];

// 0. NEXT_PUBLIC_SITE_ENV not set explicitly, in a build that actually
// resolves to production. getSiteEnv() already defaults an unset value to
// "production" (mocks stay off), but a build should never reach production
// by accident — the deployer must say so on purpose. (This is separate from
// `--force`, which can trigger isProductionCheck under NODE_ENV=development
// too, where getSiteEnv() correctly returns "development" and this warning
// would not apply.)
if (resolvedSiteEnv === "production" && !process.env.NEXT_PUBLIC_SITE_ENV) {
  problems.push(
    `NEXT_PUBLIC_SITE_ENV is not set. This build will behave as production (mocks are off, which is safe), but you should set NEXT_PUBLIC_SITE_ENV=production explicitly before shipping to confirm that's intended.`
  );
}

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

// 3. Services marked "ready" in the PUBLIC content (data/service-content.ts —
// what ServicePageTemplate actually renders) without a real legal review, or
// with unresolved [TBD]/[VERIFY] markers in their actual page content.
const PLACEHOLDER_MARKERS = ["[TBD]", "[VERIFY]"];
function findMarkers(text) {
  if (!text) return [];
  return PLACEHOLDER_MARKERS.filter((marker) => text.includes(marker));
}

for (const service of services) {
  const group = serviceGroups.find((g) => g.slug === service.group);
  if (!group) continue;
  const content = getServiceContent(service, group);
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
    whatIsIt: [content.whatIsIt.heading, ...content.whatIsIt.paragraphs].join(" "),
    whoNeedsIt: content.whoNeedsIt.join(" "),
    whatYouGet: content.whatYouGet.join(" "),
    documentsNeeded: content.documentsNeeded
      .map((group) => `${group.heading} ${group.items.join(" ")}`)
      .join(" "),
    faqs: content.faqs.map((f) => `${f.question} ${f.answer}`).join(" "),
    packages: (content.packages ?? [])
      .map((p) => `${p.price ?? ""} ${p.govtFeeNote ?? ""} ${(p.features ?? []).join(" ")}`)
      .join(" "),
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

// 4. Legal pages (terms/privacy/refund/disclaimer) ship their lastUpdated,
// intro and every section's body on every build, ready or not — none of it
// is behind a draft/ready gate the way service pages are, so any
// [TBD]/[VERIFY] marker left in here goes straight to real visitors.
for (const doc of [termsContent, privacyContent, refundPolicyContent, disclaimerContent]) {
  const lastUpdatedMarkers = findMarkers(doc.lastUpdated);
  if (lastUpdatedMarkers.length > 0) {
    problems.push(`Legal page "${doc.title}" still has a placeholder lastUpdated ("${doc.lastUpdated}").`);
  }
  const bodyMarkers = findMarkers(
    [doc.intro, ...doc.sections.flatMap((section) => [section.heading, ...section.paragraphs])].join(" ")
  );
  if (bodyMarkers.length > 0) {
    problems.push(`Legal page "${doc.title}" still has ${bodyMarkers.join(", ")} in its body text.`);
  }
}

// 5. Coupons or demo orders reachable in production data. These are source
// checks (not env-dependent imports) because the whole point is to verify
// the *gating itself* is in place in the committed source.
const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const couponsSource = readFileSync(`${srcDir}/data/coupons.ts`, "utf8");
if (!/isMockAllowed\s*\(\s*\)/.test(couponsSource)) {
  problems.push(
    `data/coupons.ts does not appear to gate coupons behind isMockAllowed() — mock coupons would be usable in production.`
  );
}

const ordersSource = readFileSync(`${srcDir}/data/orders.ts`, "utf8");
if (!/isMockAllowed\s*\(\s*\)/.test(ordersSource)) {
  problems.push(
    `data/orders.ts does not appear to gate demo orders behind isMockAllowed() — demo orders would show in production.`
  );
}

// 6. Any import of the mock OTP/login API (lib/mock-api.ts) from src outside
// tests. This mock powers login OTP verification for both the customer
// dashboard and the service lead form — real backend auth must replace it
// before launch.
const SCAN_EXTENSIONS = new Set([".ts", ".tsx"]);
const TEST_PATH_PATTERN = /(^|[/\\])(__tests__|.*\.test\.|.*\.spec\.)/;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = `${dir}/${entry}`;
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, files);
    } else if (SCAN_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) {
      files.push(fullPath);
    }
  }
  return files;
}

const MOCK_API_REFERENCE_PATTERN = /(?:from|import|require)\s*\(?\s*["']@\/lib\/mock-api["']/;

const mockApiImporters = [];
for (const file of walk(srcDir)) {
  const relativePath = file.slice(srcDir.length + 1);
  if (TEST_PATH_PATTERN.test(relativePath)) continue;
  if (file.endsWith("/lib/mock-api.ts")) continue;
  const text = readFileSync(file, "utf8");
  if (MOCK_API_REFERENCE_PATTERN.test(text)) {
    mockApiImporters.push(`src/${relativePath}`);
  }
}
if (mockApiImporters.length > 0) {
  problems.push(
    `lib/mock-api.ts (mock OTP verification / contact form) is still imported outside tests by: ${mockApiImporters.join(", ")}. Replace with a real API before launch.`
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
