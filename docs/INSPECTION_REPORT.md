# Frontend Inspection Report

Date: 2026-11-20
Branch: `chore/inspection`
Scope: `frontend/` only. Report-only — no source files were changed. Sources of truth used: `docs/1_Client_Requirement.docx`, `docs/2_Tech_Stack_and_Architecture (1).docx`, `CLAUDE.md`, `frontend/src/data/service-catalog.ts`.

## 1. Summary

| Severity | Count |
|---|---|
| Critical | 3 |
| Important | 9 |
| Minor | 7 |

Headline: the codebase is clean on tooling (0 lint errors, 0 `tsc` errors, dev build succeeds with no warnings), and the production-build guard (`check-launch-readiness.mjs`) correctly blocks a real production build today because real prices/content aren't in yet — that's working as intended, not a bug. The real problems are (a) the "Buy" flow is broken at the first click (`PackageCards` → checkout, no `service` param), (b) draft/mock content and mock auth paths are not safely excluded from what a production-env build/crawl would expose, and (c) an open-redirect pattern on `?next=` in both customer and admin login.

## 2. Part A — Toolchain results (run live, this session)

| Check | Command | Result |
|---|---|---|
| Install | `npm ci` → failed once due to a stray `next dev` process locking native binaries; repaired with `npm install` after stopping that process (with user's OK) | Repaired, 0 install errors after fix |
| Lint | `npm run lint` | **0 errors, 1 warning** — the warning (`'withTimeout' is defined but never used`) was in a throwaway script a QA sub-task created and deleted; it is not a source-tree issue. Source tree itself: 0 errors, 0 warnings. |
| Types | `npx tsc --noEmit` | **0 errors** |
| Build (dev/staging, `NEXT_PUBLIC_SITE_ENV` unset) | `npm run build` | **Success, 0 errors, 0 warnings.** 162 pages generated. |
| Build (production, `NEXT_PUBLIC_SITE_ENV=production`) | `npm run build` | **Fails, exit code 1 — by design.** The `prebuild` hook (`scripts/check-launch-readiness.mjs`) blocks it with 6 issues: mock pricing still live on `proprietorship-registration`, placeholder phone/WhatsApp numbers in `site-config.ts`, a placeholder legal reviewer, and `[TBD]` left in that service's FAQs and packages. This is the checklist doing its job, not a defect — but see Part E #3 for how narrow its coverage is. |
| Launch check | `npm run launch:check` (`--force`) | Same 6 issues, exit code 1 |

No warnings appeared in the dev build output beyond what's listed above.

## 3. Part B — Browser click-through (headless Chrome, `next dev`, 1280px)

This was run via a CDP-driven headless Chrome script against `next dev`. Several steps could not be reliably automated and are marked accordingly rather than guessed.

**Update after manual follow-up verification:** the consent-checkbox finding below was re-tested against a real, **visible** (non-headless) Chrome window, using fully trusted CDP mouse input (`mouseMoved`/`mousePressed`/`mouseReleased` at the element's exact screen coordinates, repeated 3 times) rather than a JS `.click()`. In-page `pointerdown`/`pointerup`/`click` listeners confirmed the click genuinely reaches the checkbox element every time, with zero console errors — yet `aria-checked` never flips from `false`. This rules out the "headless automation artifact" explanation. Tracing into the installed `@base-ui/react@1.9.0` source (`node_modules/@base-ui/react/checkbox/root/CheckboxRoot.js`) shows the visible checkbox's `onClick` calls `event.preventDefault()` and then `dispatchClickWithModifiers(input, event)` to forward activation to a visually-hidden native `<input type="checkbox">`, whose own `onChange` is what actually calls `onCheckedChange`/updates state. That hidden input is rendered with `position:fixed;top:0;left:0` — detached from the visible checkbox's layout position. The click reaches the visible span and the forwarding call does fire (no errors), but the native toggle never lands. This is now **CONFIRMED as a real, reproducible bug** (see D17), not a test-harness issue — see D2 in Part D, this is the same severity: it blocks every lead form on the site (and, since `CheckoutFlow.tsx`'s "I need a GST invoice" control uses the same `Checkbox` component, likely blocks that step of checkout too).

| Flow | Step | Result |
|---|---|---|
| Visitor | Home loads | PASS |
| Visitor | Mega menu opens | Unverified (automation selector issue, not a confirmed bug) |
| Visitor | Service page loads with lead form | PASS |
| Visitor | Fill + submit lead form | **FAIL — confirmed real bug (D17).** Consent checkbox never toggles; verified with trusted clicks in a visible browser, not an automation artifact |
| Visitor | OTP → success | Not reached (blocked above) |
| Buy | Package button → checkout | **FAIL — confirmed real bug.** `PackageCards.tsx:55` → `/checkout?package=<id>` with no `service` param; checkout requires both and renders "We couldn't find that service". Reproduced live in the browser. See Part E #1. |
| Buy | Checkout → coupon → GST invoice → payment-mock → success/failure → dashboard | Not reliably reached (blocked upstream / same checkbox-component family suspected) |
| Customer | `/login` loads | PASS |
| Customer | Phone → OTP → dashboard → order detail → uploads → timeline | Not reliably completed — unverified, not confirmed broken |
| Admin | Login as admin/staff/reviewer (session seeded) → `/admin` | PASS for all 3 roles (no redirect to `/admin/login`) |
| Admin | Leads/Orders/Services/Coupons/Staff/Activity routes load (as admin) | PASS (all routes resolved, no error text) |
| Admin | Lead drawer, service editor deep-link, order maker-checker | Unverified (automation selector issues) |
| Admin | Staff blocked from admin-only `/admin/staff` | **Inconclusive** — page didn't redirect, but the captured page text was empty in that run (see below), so "not blocked" is not confirmed either |
| Service patterns | All 9 extra-field patterns (state, stateUt+pan, gstin, pan, brandName, country, productCatalogOptional, askBox, none) load with a lead form | PASS 9/9 |
| Service patterns | Blank submit shows validation | Blocked by the same consent-checkbox issue, not independently confirmed per pattern |

**Screenshots:** 5 of the 6 requested were saved to `frontend/qa-screenshots/` (untracked, as required): `inspection-checkout-step2-coupon.png` (captured real content, 73KB), and `inspection-admin-dashboard.png`, `inspection-admin-leads-drawer.png`, `inspection-dashboard-overview.png`, `inspection-dashboard-order-detail-pending-docs.png` — these four came back **blank** (5293 bytes each, solid background color only). I opened one (`inspection-admin-dashboard.png`) and confirmed it is blank. This is most likely a hydration-timing artifact of the headless capture (screenshot taken before client-side hydration painted content) rather than a real rendering bug, but I can't rule out a real issue without a manual check — **[VERIFY]**. `inspection-admin-service-editor-packages.png` was not captured (automation couldn't find the editor link).

No console errors or warnings were captured during the session (the listener was active throughout and recorded nothing).

## 4. Part C — Requirement coverage

### Client Requirement doc, Section 3 (Pages needed)

| Requirement | Code location | Status |
|---|---|---|
| Home page with service tiles + Get Started | `app/(site)/page.tsx` | Done |
| Proprietorship sales page (full template) | `app/(site)/[service]/page.tsx` + `ServicePageTemplate.tsx` | Partly — see Section 4 gaps below |
| Checkout, Login, Dashboard, Order tracking | `app/(site)/checkout/*`, `app/(auth)/login`, `app/(site)/dashboard/*` | Partly — checkout entry is broken from packages (Part E #1) |
| Admin panel | `app/admin/*` | Done (mock-backed) |
| Info pages (About, Contact, Terms, Privacy, Refund, Disclaimer) | `app/(site)/about|contact|terms|privacy|refund-policy|disclaimer` | Done |

### Section 4 (Proprietorship page, top to bottom)

| Section | Code location | Status |
|---|---|---|
| Header: logo, menu, phone, login | `components/layout/Header.tsx` | Done |
| Hero + lead form + WhatsApp button | `ServicePageTemplate.tsx`, `ServiceLeadForm.tsx`, `WhatsAppButton.tsx` | Done |
| Trust strip (rating, years, customers, live tracking) | `components/sections/TrustStrip.tsx` | Mock-only — numbers are placeholders, not real figures per CLAUDE.md `[VERIFY]` rule |
| Package cards (2-3, Popular tag, Continue button) | `components/service/PackageCards.tsx` | Partly — renders correctly but Continue button is broken (Part E #1) |
| Explainer: what/benefits/documents/process/cost table | `ServicePageTemplate.tsx` sections | Partly — "what is it", "who needs it", "documents", "how it works" exist; **no cost table, no separate benefits block rendered** (Part E #7) |
| Reviews + FAQ (8-12 Qs) | FAQ exists (`components/sections/FAQ.tsx`); **no Reviews section anywhere** | Missing (Reviews) / Done (FAQ) |
| Footer with info-page + social links | `components/layout/Footer.tsx` | Done |
| All facts legal-reviewed, prices `[TBD]` until confirmed | `check-launch-readiness.mjs` enforces this only for `contentStatus: "ready"` services and only on a narrow field list | Partly — see Part E #3 |

### Section 5 (How it should work)

| Requirement | Code location | Status |
|---|---|---|
| Enquiry form + OTP confirms phone | `ServiceLeadForm.tsx` | Mock-only (mock OTP) |
| Pick package, coupon, pay, receipt + GST invoice | `CheckoutFlow.tsx`, `data/coupons.ts` | Mock-only, and broken entry point (Part E #1) |
| Account creation via OTP login | `LoginFlow.tsx`, `mock-session.ts` | Mock-only |
| Document upload (PDF/JPG/PNG), accept/reject | `DocumentUploader.tsx` | Done (mock backend) |
| Maker-checker review before submission | `admin/OrderDetailPage.tsx` | Done (mock) |
| Status timeline + Email/SMS/WhatsApp notifications | `components/dashboard/Timeline.tsx` | Partly — timeline UI exists; no real notification sending exists (no backend yet, expected at this stage) |
| Final document download from dashboard | `dashboard/orders/[id]` | Mock-only |
| Admin: leads w/ assign, notes, follow-up | `admin/leads`, `admin-store.ts` | Done (mock) |
| Admin: orders w/ assign, status move, private notes | `admin/orders` | Done (mock) |
| Admin: edit page text/FAQs/packages/prices/coupons, no-dev | `admin/services` (`ServiceEditor.tsx`), `admin/coupons` | Done (mock), but **disconnected from the public page's actual content source** — see Part E #2 |
| Staff accounts w/ limited access + activity log | `admin/staff`, `admin/activity`, `admin-permission-table.ts` | Done (mock) |

### Section 6 (Other rules)

| Requirement | Status |
|---|---|
| Mobile-friendly, <3s on 4G | Not measured in this pass (see "Could not check") — prior `QA_REPORT.md`/LCP work in repo history covers some of this |
| Clean URLs, titles, descriptions (SEO) | Partly — URLs/titles/descriptions exist, but draft/`[TBD]` service pages are not `noindex`'d and are included in `sitemap.xml` (Part E #2) |
| GA tracking of form/WhatsApp/payment + ad UTM on every lead | Partly — UTM capture exists but the saved first-touch values are never attached to the lead or order (Part E #6) |
| Secure connection, encrypted docs, role-based access | Mock-only — no backend yet, so no real encryption; role-based UI gating exists client-side only |
| English-first, i18n-ready later | Done (no hardcoded non-English strings found; text is centralized in most places, with the exceptions in Part D #11) |

### Tech Stack doc — frontend-relevant items

| Item | Status |
|---|---|
| Next.js SSR/SSG for SEO + speed | Done — pages are static/ISR (`Revalidate 15m`) per build output |
| Frontend as thin client, no business logic | Partly — currently all business logic is client-side mock stores (`lib/admin-*-store.ts`, `mock-session.ts`) since there is no backend yet; expected for this stage, but will need a real rewrite, not just an API swap |
| OTP via Redis w/ expiry/rate-limit | Not applicable yet — OTP is fully mocked client-side, no expiry/rate-limit modeled |
| Direct-to-S3 upload pattern | Not applicable yet — `DocumentUploader.tsx` currently handles files client-side only (mock) |
| Payment gateway, no raw card storage | Followed in spirit — `payment-mock` page simulates the gateway step and the UI never collects raw card fields itself |
| Sentry/monitoring | Missing — no Sentry or error-monitoring instrumentation found in `src/` |
| HTTPS, RBAC, audit log, pen test | Partly — RBAC and audit log exist as mock; HTTPS/pen-test are deployment/infra concerns, not yet applicable |

## 5. Part D — Code audit findings

| ID | Severity | File:line | Issue | How verified | Suggested fix |
|---|---|---|---|---|---|
| D1 | Critical | `src/components/auth/LoginFlow.tsx:29,122`; `src/components/admin/AdminLoginForm.tsx:20,24` | `?next=` query value is passed straight to `router.replace(next)` with no validation — open-redirect pattern (e.g. `/login?next=https://example.com`) | Read both files; confirmed the call sites read `searchParams.get("next")` and pass it unchecked to the router | Only accept `next` if it starts with a single `/` and doesn't start with `//` or contain a scheme; otherwise fall back to the default |
| D2 | Critical | `src/components/service/PackageCards.tsx:55` → `src/app/(site)/checkout/page.tsx:57-68` | Package "Continue" buttons link to `/checkout?package=<id>` with no `service` param; checkout requires both, so every package click currently shows "We couldn't find that service" | Read both files; reproduced live in a browser session against `next dev` | Have `PackageCards` receive/forward the current service slug into the checkout link |
| D17 | Critical | `src/components/ui/checkbox.tsx` (wraps `node_modules/@base-ui/react/checkbox/root/CheckboxRoot.js`), used by `ServiceLeadForm.tsx:282-285` ("I agree to be contacted") and `CheckoutFlow.tsx`'s GST-invoice checkbox | The consent checkbox never toggles — `aria-checked` stays `false` under real, trusted clicks. This blocks every lead-form submission site-wide (the submit button is gated on `consent`), and likely blocks the GST-invoice step of checkout, which uses the same component. Root-caused to `@base-ui/react@1.9.0`: the visible span's click handler calls `preventDefault()` then forwards activation via `dispatchClickWithModifiers()` to a visually-hidden native `<input type="checkbox">` (rendered at `position:fixed;top:0;left:0`), whose `onChange` is what actually calls `onCheckedChange`; that forwarded activation isn't resulting in the native toggle, with no console errors | Manually re-verified in a **visible** (non-headless) Chrome with fully trusted CDP mouse clicks (not `.click()`), 3 repeated press/release cycles at the element's exact coordinates; attached in-page `pointerdown`/`pointerup`/`click` listeners that confirmed the click reaches the element every time; `aria-checked` never changed; 0 console errors. Traced the mechanism in the installed `@base-ui/react` source. | Pin/upgrade or downgrade `@base-ui/react` to a version where this works, or replace this checkbox usage with a native `<input type="checkbox">`-backed implementation until fixed; file upstream with Base UI |
| D3 | Important | `src/lib/admin-services-store.ts` / `src/data/service-content.ts` vs `src/components/service/ServicePageTemplate.tsx` | `contentStatus`/draft flagging is only read by the admin mock; the real public template never checks it. Result: draft pages render raw `[TBD]`/`[VERIFY]` text and a "From ₹ [TBD]" chip to real visitors, FAQ JSON-LD includes placeholder answers, draft pages are included in `sitemap.xml`, and no service page ever sets `noindex` | Grepped `contentStatus` (admin-only hits) and read `ServicePageTemplate.tsx`, `sitemap.ts`, `FAQ.tsx`, `[service]/page.tsx` `generateMetadata` | Gate the public template and sitemap/robots metadata on `contentStatus !== "ready"` |
| D4 | Important | `frontend/scripts/check-launch-readiness.mjs` | The production-build guard only checks services with `contentStatus === "ready"` (skipping drafts, the opposite of what's risky), and never scans `TrustStrip`, `legal-content.ts`, `about-content.ts`, general `site-config.ts` user-facing text, the price chip, or draft pages; it has no rule against mock OTP/mock login shipping to production | Read the script in full | Expand the scanned file set and flip the draft-skip logic; add an explicit check that mock-auth/mock-OTP code paths are excluded from a real prod build |
| D5 | Important | `src/lib/analytics.ts:13-36` vs `src/components/forms/ServiceLeadForm.tsx:88-92`, `CheckoutFlow.tsx` | First-touch UTM values are saved to `sessionStorage` but never read by the lead form (which uses the *current* page's query params instead — last-touch) or by checkout (no UTM reference at all) | Grepped `utm` across `src/`; traced the only consumer of `getSavedUtmParams()` to `Analytics.tsx`'s GA click tracker | Attach the saved first-touch UTM to the lead record and the order at creation |
| D6 | Important | `src/data/coupons.ts:10`, `data/orders.ts:181`, `data/admin-*-mock.ts`, `app/(site)/checkout/payment-mock/page.tsx:59`, `app/admin/login/page.tsx:8` | All mock/demo gating uses `NODE_ENV === "production"`, but `next build` always sets `NODE_ENV=production` regardless of `NEXT_PUBLIC_SITE_ENV`. A staging deploy built the normal way loses demo orders, coupons, payment-mock, and admin mock-login — there's no way to have a "staging with mocks" build | Grepped `NODE_ENV` across `src/`; confirmed `NEXT_PUBLIC_SITE_ENV` is only read in `app/robots.ts` | Gate these on `NEXT_PUBLIC_SITE_ENV !== "production"` instead of `NODE_ENV` |
| D7 | Important | `src/components/service/ServicePageTemplate.tsx` | No Reviews section, no standalone cost table, and no rendered Benefits block (`content.benefits` exists as data but is never read by the template) | Full read of the template's render tree | Add the three missing sections per the client requirement doc |
| D8 | Important | `src/components/dashboard/DocumentUploader.tsx:204` | Uploaded-document thumbnail `<img>` has `alt=""` though it's meaningful content, not decorative | Read file | Use a descriptive alt, e.g. the filename or "Preview of {filename}" |
| D9 | Important | Dev-only banners in `OrderSummary.tsx:23`, `LegalPage.tsx:6`, `ServicePageTemplate.tsx:15,32` | The "From ₹ [TBD]" price chip renders unconditionally to *all* users (not dev-gated at all); only the separate `[VERIFY]/[TBD]` draft banner is dev-gated | Read the three files | Gate the price chip the same way as the draft banner, or replace with a non-placeholder default copy |
| D10 | Minor | `src/data/leads.ts:1` | File is just `export {};`, an orphaned stub never imported anywhere | Grepped `data/leads` across `src/` — zero matches | Delete, or wire it up if it was meant to hold real lead data |
| D11 | Minor | `components/admin/ServiceEditor.tsx` (647 lines), `data/admin-mock.ts` (510), `components/checkout/CheckoutFlow.tsx` (415), `components/admin/CouponsPage.tsx` (408), `components/forms/ServiceLeadForm.tsx` (373), `components/admin/OrderDetailPage.tsx` (320) | 6 files/components over 300 lines | `wc -l` on each | Split by concern (e.g. form sections, sub-panels) when next touched — not urgent |
| D12 | Minor | `lib/admin-coupons-store.ts`, `admin-services-store.ts`, `admin-staff-store.ts`, `admin-store.ts` | Near-identical localStorage read/write/audit-log scaffolding repeated across 4 files | Grepped the localStorage get/set + audit-entry shape in each | Extract a shared generic store helper |
| D13 | Minor | No segment ever has its own `loading.tsx`/`error.tsx`/`not-found.tsx` under `app/` (only root-level ones exist) | Enumerated every file under `src/app/` | No tailored loading skeleton or scoped error recovery per route; acceptable for now, worth adding for slower admin tables later |
| D14 | Minor | `components/admin/AdminLoginForm.tsx:46` (`"Arthafilings admin"`), `components/sections/WhyUs.tsx:16` (`"Why Arthafilings"`) | Hardcoded brand-name strings instead of `siteConfig.name`, inconsistent with `Footer.tsx:87` which does it correctly | Grepped literal `"Arthafilings"` across `components/` | Use `siteConfig.name` in both |
| D15 | Minor | `package.json` — `clsx` and `tailwind-merge` listed as dependencies but never imported anywhere in `src/` (only the `cn` package, re-exported by `lib/utils.ts:1`, is actually used) | Grepped `from "clsx"` / `from "tailwind-merge"` — 0 matches; `shadcn` is also listed under `dependencies` rather than `devDependencies` | Remove the two unused deps; move `shadcn` to devDependencies |
| D16 | Minor | `components/layout/WhatsAppButton.tsx:14` | Hardcoded hex `bg-[#25D366]` instead of a theme token from `globals.css` | Read file | Add a `--color-whatsapp` token or reuse an existing brand token if close enough |

**Categories checked with no findings:** broken internal links/routes (every `href`/`router.push` target resolves to a real route or dynamic segment); no committed secrets found; no `any`/unsafe `as any` casts in `src/` (only legitimate `as unknown as Record<string, unknown>` audit-log diffing casts); color-only status indicators (`StatusBadge.tsx`, `Timeline.tsx`) always pair color with text/icon; form inputs have associated labels on every file sampled.

## 6. Part E — Planner claim verification

| # | Claim | Verdict |
|---|---|---|
| 1 | PackageCards → checkout missing `service` param, shows "couldn't find that service" | **CONFIRMED** — see D2, reproduced live |
| 2 | Decision 27 (contentStatus) not applied on public pages; draft pages show raw placeholders, bad price chip, placeholder FAQ JSON-LD, are in sitemap, no noindex | **CONFIRMED** — see D3 |
| 3 | `check-launch-readiness.mjs` doesn't scan TrustStrip/legal-content/about-content/site-config text/price chip/draft pages, no mock-OTP/login rule | **CONFIRMED** — see D4 |
| 4 | `LoginFlow.tsx`/admin login pass `?next=` to `router.replace` unchecked | **CONFIRMED** — see D1 |
| 5 | Dev-only gates use `NODE_ENV`, so a deployed staging build can't show demo orders/coupons/payment-mock/admin login | **CONFIRMED** — see D6 |
| 6 | Saved first-touch UTM not used by lead form or checkout | **CONFIRMED** — see D5 |
| 7 | No Reviews section, no cost table, no separate benefits block | **CONFIRMED** — see D7 |
| 8 | Third-party `cn` package used by `lib/utils.ts` + ~14-16 UI files — check what it is / whether it should be `clsx`+`tailwind-merge` | **WRONG** — `cn` on npm (`node_modules/cn/package.json`) is the official shadcn-ui team's own published package (`github.com/shadcn-ui/cn`), described as "drop-in replacement for clsx + tailwind-merge." It already *is* the thing the planner suggested switching to, just shipped pre-combined. Not a typosquat based on package metadata reviewed; a full npm-registry/supply-chain check (download stats, maintainer history) was **not** run — mark that part `[VERIFY]`. (Note: `clsx`/`tailwind-merge` *are* separately listed as unused deps — that's D15, a real but different issue.) |
| 9 | Unknown routes (e.g. `/no-such-page`) return HTTP 404; a hidden service also returns 404 | **PARTLY** — code is correct (`[service]/page.tsx` and `services/[group]/page.tsx` call `notFound()` when `service.mode === "hidden"` or the slug doesn't resolve, which Next.js App Router turns into a real 404). A live `curl -I` against a running build was **not** performed in this pass (see "could not check"). Separately: **no entry in `service-catalog.ts` currently has `mode: "hidden"`** — only `"live"` and `"enquiry"` are used — so the "hidden service" half of this claim has no real data to test against right now. `[VERIFY]` both halves against a live server. |

## 7. Not done yet

- Buy flow steps past the checkout entry point (coupon, GST invoice toggle, payment-mock success/failure, success page, dashboard landing) — blocked by D2/automation limits.
- Customer OTP → dashboard → order detail → document upload (wrong file type, >10MB) → status timeline — not reliably exercised.
- Admin lead drawer, service editor packages view, and order maker-checker screens — automation couldn't locate the deep-link selectors; need a manual pass.
- Confirming whether a staff account is actually blocked from `/admin/staff` (the one capture was inconclusive, with empty page text).
- `inspection-admin-service-editor-packages.png` screenshot (not captured).
- A live `curl -I` 404 check against a running build (Part E #9).
- Mobile performance / <3s-on-4G measurement in this pass (separate from this repo's existing `QA_REPORT.md`/LCP work).
- A full npm supply-chain check on the `cn` package (download/maintainer history) beyond reading its local package metadata.

## 8. Things I could not check and why

- **Four Part B screenshots came back blank** (`inspection-admin-dashboard.png`, `inspection-admin-leads-drawer.png`, `inspection-dashboard-overview.png`, `inspection-dashboard-order-detail-pending-docs.png`) — most likely a headless-capture hydration-timing issue, not confirmed as a real rendering bug. Needs a manual look.
- **Live HTTP 404 check (`curl -I`)** was skipped because, at the time that verification ran, another concurrent process in this session was mid-`npm ci`/build on the same `node_modules`, and starting a second server risked corrupting that run.
- **Full per-file dead-code/export-usage audit** was sampled, not exhaustive, given the size of `src/` (159 files) relative to the time budget — no orphaned exports were found in the sample checked, beyond the one orphaned file (D10).
- **Full a11y sweep of all admin forms** (CouponsPage, StaffPage, ServiceEditor) was not completed to the same depth as the customer-facing forms — sampled components were clean.
- A stray `next dev` process from outside this session was found running against the repo partway through Part A; it was stopped with the user's explicit confirmation before `npm run build`/`launch:check` were run, so those results reflect a clean environment. An incidental `package-lock.json` diff caused by the repair was discarded before this report was committed.

## 10-line summary

**5 worst problems:**
1. The consent checkbox on every lead form (and likely checkout's GST-invoice checkbox) never toggles — manually confirmed with trusted clicks in a real browser, so visitors cannot submit any enquiry today (D17).
2. The entire "Buy" flow is broken at the first click — package buttons don't carry the service slug to checkout (D2/Part E #1).
3. `?next=` is an unvalidated open redirect on both customer and admin login (D1).
4. Draft/placeholder content ([TBD]/[VERIFY] text, mock price chip) can reach real visitors and get indexed — contentStatus is admin-mock-only, not enforced on the public template or sitemap (D3).
5. The production-build safety net doesn't check most of the actual placeholder surface (TrustStrip, legal/about content, site-config text) and would let mock-OTP/login ship (D4).

**5 best things:**
1. Lint and `tsc` are both completely clean — 0 errors across the whole source tree.
2. The dev/staging build succeeds cleanly with 0 warnings across 162 generated pages.
3. The launch-readiness guard already does the right thing by *refusing* to let an unready production build through today.
4. All 9 service lead-form field patterns render correctly, and no internal link/route in the app points at a non-existent page.
5. Accessibility and type-safety hygiene are good overall — no `any`/unsafe casts, labels are correctly associated, and the one real a11y gap found (a missing descriptive alt) is minor and isolated.
