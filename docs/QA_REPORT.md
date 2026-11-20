# QA sweep — frontend

Run on a local production build (`next build && next start`, port 3100) against a headless, remote-debugging-enabled install of Chrome, driven directly over the Chrome DevTools Protocol (plain `fetch`/`WebSocket`, no new npm packages). Scripts live in [`frontend/scripts/qa/`](../frontend/scripts/qa/) and are safe to rerun:

```
npx tsx frontend/scripts/qa/run.mjs          # items 1, 2, 4 — crawl, smoke test, keyboard/focus
node frontend/scripts/qa/contrast.mjs        # item 3 — contrast ratios
npx tsx frontend/scripts/qa/perf.mjs         # item 5 — JS payload size, LCP/CLS under throttling
npx tsx frontend/scripts/qa/screenshots.mjs  # item 6 — mobile screenshots
```

## 1. Link crawler — PASS

Crawled every path from `app/sitemap.ts` plus every link in the header, mega menu, footer, home tiles and group pages (the mega menu, footer "Services" column and group pages all generate their links from the catalog directly, so there's nothing hand-typed there to drift from the catalog).

- **137 internal URLs checked, 0 broken.**
- All **116 service pages** return 200.
- All **9 group pages** return 200.
- No unexpected redirects. `/dashboard` and `/admin/services` (as a stand-in for any `/admin/*` page) were checked unauthenticated with a real browser, since their auth guard is a client component — a plain `fetch()` can't see a client-side `router.replace()`. Both redirect correctly: `/dashboard` → `/login`, `/admin/services` → `/admin/login`.
- Footer social links (Facebook/Instagram/LinkedIn/X) are `#` placeholders, already marked `[VERIFY]` in `lib/site-config.ts` — intentional, not a broken link.

No fixes needed here — the catalog-driven nav meant there was nothing to typo.

## 2. Page smoke test — PASS (after 2 fixes)

24 pages × 4 widths (375/768/1280/1440) = **96 checks**: home, 12 service pages (one per distinct `extra` field pattern in the catalog — `state`, `stateUt`+`pan`, `gstin`, `pan`, `brandName`, `country`, `productCatalogOptional`, `askBox`, and no extra fields — plus 3 more for group/MCA/Global breadth), 3 group pages, about, contact, terms, privacy, checkout, login, dashboard (authenticated), and admin services (authenticated, seeded via localStorage over CDP).

Final result, all 96 checks:
- **0** console errors/warnings or uncaught exceptions
- **0** horizontal-overflow pages
- **0** pages with an H1 count other than 1
- **24 of 24** titles unique
- **0** images missing `alt`
- **0** controls without an accessible name

Two real bugs found and fixed along the way:

**Duplicate `<h1>` on every access-denied admin page.** `components/admin/NoAccessPage.tsx` rendered its own `<h1>You do not have access</h1>`, but `AdminShell.tsx` already renders the page's `<h1>` from the route (`getPageTitle(pathname)`) — so any gated page (confirmed via `/admin/services` as a staff user, who the permission table restricts to admin-only) had two H1s. Fixed by changing `NoAccessPage`'s heading to a `<p>` — `AdminShell` already supplies the real page heading. This affected 7 admin pages that all use `NoAccessPage` (services, coupons, staff, activity, leads, orders, service editor), not just the one tested.

**Hard-reload of `/dashboard` or an `/admin/*` page, while already logged in, silently bounced the user back to the login page** — found by seeding a valid mock session into `localStorage` and then doing a hard navigation (not a client-side link click) straight to `/dashboard`, confirmed with a direct `localStorage.getItem` check immediately after landing that the session really was present yet the guard still redirected. Root cause and fix are in `components/auth/DashboardGuard.tsx` and `components/admin/AdminGuard.tsx` (see the comment in `DashboardGuard.tsx` for the two earlier approaches that each failed differently — one caused a hydration mismatch, the other lost the session in a resync race). The working fix: state starts at `null` on both server and client (matching SSR exactly, no hydration mismatch), and a single `useLayoutEffect` reads the real session from `localStorage` once on mount and decides redirect-vs-render in one step, before paint. Verified with a direct repro (seed session → hard navigate to `/dashboard` → check `window.location.pathname`) and with the full smoke/screenshot suite afterward.

A few smoke-script false positives were found and corrected in the *test* code, not the app, while investigating: `alt=""` (a deliberate way to mark an image decorative) was wrongly flagged as missing `alt`; the accessible-name check only special-cased `<input>`, so every labelled `<textarea>`/`<select>` was wrongly flagged; and a UI library's hidden, `aria-hidden="true"`/`tabindex="-1"` shadow `<input>` (part of the custom Select component, not a real user-facing control) was wrongly flagged as unnamed. All three are fixed in `scripts/qa/page-checks.mjs`.

## 3. Contrast check — PASS (after 1 fix)

Computed WCAG 2.x contrast ratios (own implementation, `scripts/qa/contrast.mjs`) for every token pair actually rendered by the app, including footer text opacity variants (`text-blue-tint/80`, `/70`) blended against the navy background:

| Pair | Ratio | Result |
|---|---|---|
| body text on background (off-white) | 14.66:1 | PASS |
| body text on white (card) | 15.59:1 | PASS |
| body text on cream | 14.46:1 | PASS |
| body text on blue-tint | 13.72:1 | PASS |
| white text on primary (buttons) | 7.77:1 | PASS |
| muted text on background | 5.46:1 | PASS |
| muted text on white | 5.81:1 | PASS |
| footer: blue-tint text on navy (full-opacity nav links) | 12.74:1 | PASS |
| footer: blue-tint/80 text on navy (column links) | 8.64:1 | PASS |
| footer: blue-tint/70 text on navy (copyright/social) | 6.96:1 | PASS |
| footer: white text on navy (headings/logo) | 14.48:1 | PASS |
| **gold Popular badge: white text on gold** | **3.17:1 → 4.69:1** | **was FAIL, now PASS** |

**Fix:** `--gold` in `app/globals.css` was `#b7892f` (3.17:1 with white text — below the 4.5:1 minimum for normal text). Darkened to `#926e26` — same hue (~40°), lower lightness — now 4.69:1. No other hardcoded references to the old hex existed.

## 4. Keyboard and focus — PASS

Simulated Tab-key navigation (CDP `Input.dispatchKeyEvent`) through the home page, a service page with its lead form (`/income-tax-e-filing`, which has 3 extra fields plus name/email/phone), checkout, and login, reading `document.activeElement` after each Tab and checking for a non-`none` computed `outline` or `box-shadow`.

| Page | Tab stops | Stops with no visible focus ring |
|---|---|---|
| home | 40 | 0 |
| service page with lead form | 40 | 0 |
| checkout | 38 | 0 |
| login | 6 | 0 |

No unreachable interactive elements, no focus traps (tabbing reached the natural end of each page within the 40-stop cap), and every stop had a visible `focus-visible` ring — the shared `focus-visible:ring-2 ring-ring/50` / `focus-visible:border-ring` treatment used across `components/ui/*` is applied consistently. No fixes needed.

*Caveat:* "visible focus ring" here is a computed-style heuristic (outline/box-shadow present), not a human-eye check of contrast or size — it can't catch a ring that's technically present but too faint to notice.

## 5. Performance

**JS payload per route** (encoded bytes of `Script`-type network responses on a cold load, `Network.setCacheDisabled`), heaviest 10 of 15 routes sampled:

| Route | Script requests | JS bytes |
|---|---|---|
| /admin/services | 21 | 331,086 |
| /checkout | 19 | 315,109 |
| / | 19 | 312,185 |
| /proprietorship-registration | 19 | 312,185 |
| /partnership | 19 | 312,185 |
| /trademark-registration | 19 | 312,185 |
| /gst-registration | 19 | 312,185 |
| /services/startup | 19 | 312,185 |
| /services/registrations | 19 | 312,185 |
| /dashboard | 20 | 306,796 |

*Note on methodology:* this Next.js 16 Turbopack build's `next build` output no longer prints the old "First Load JS" table column, so this measures the same thing a different way — actual transferred JS bytes on a cache-disabled first load. The near-identical ~312KB figure across most public pages shows the framework/shared-chunk cost dominates; `/admin/services` and `/checkout` are the only routes pulling meaningfully more page-specific JS.

**LCP/CLS under throttling** (CPU 4× slowdown, Fast-4G network profile — 1.6Mbps↓/0.75Mbps↑/150ms RTT — mobile viewport 375×800):

| Page | LCP | CLS |
|---|---|---|
| home | 0.76s | 0 |
| service page | 1.19s | 0 |
| checkout | 0.57s | 0 |
| dashboard | 1.12s | 0 |
| group page | 0.64s | 0 |

**All 5 pages are well under the 3-second goal** (worst case 1.19s, on a service page). CLS is 0 on every page sampled — no layout shift observed.

**Follow-up (resolved): LCP measurement.** The original pass couldn't get `performance.getEntriesByType("largest-contentful-paint")` to return anything, even with the tab forced to the foreground — root cause confirmed: the LCP spec permanently suppresses web-API entries for any document that was ever non-visible during its lifetime, and a CDP-created tab has exactly that kind of hidden window around creation, regardless of `Page.bringToFront`. Fixed in `scripts/qa/perf.mjs` by reading LCP from the CDP `Tracing` domain instead (the `largestContentfulPaint::Candidate` trace event, timed against the matching `navigationStart` event) — this is the same approach lab tools like Lighthouse use to work around the same restriction, and it isn't subject to the web API's visibility rule. Verified empirically against the real local build before integrating. The wall-clock proxy from the original pass is no longer needed.

**Cheap fixes applied:** none needed — no `<img>` tags without `next/image` sizing were found anywhere in `components/`/`app/` (the one raw `<img>`, a document-upload preview thumbnail, is already a small fixed-size thumbnail with `alt=""` deliberately, see item 2), and the project already uses `next/font`-equivalent system font stacks via Tailwind, not manually loaded web fonts.

**Follow-up (investigated, not fixed): the ~312KB shared JS floor.** Confirmed via real network capture (not just chunk-name guessing) that `/` and `/about` — neither of which renders any form — load an identical shared chunk set, including a 148,835-byte chunk whose content is almost entirely `zod` (500+ occurrences) plus `react-hook-form` glue. Traced the actual static-import graph: that dependency pair is only genuinely used by `ServiceLeadForm`, itself only imported by `ServicePageTemplate` (116 of ~140 routes). The likely cause is Next/Turbopack's default chunk-splitting: a module used by a large majority of routes gets hoisted into a top-level shared bundle attached to every route's initial script list, not just the routes that need it.

Attempted fix: wrapped `ServiceLeadForm` in `next/dynamic()` inside `ServicePageTemplate` to force a separate chunk boundary. Rebuilt and re-measured against a verified-clean production server (first measurement attempt was invalidated by a stale `next start` process still bound to the port from before the rebuild, which was serving 500s under the hood — caught this via a console-error sanity check before trusting the numbers). With a genuinely fresh server, the `zod` chunk was **still** present in home's script list at the same byte count — `next/dynamic` splits the *importing component's own* code into an async chunk, but Turbopack's vendor/framework cache-group still hoists the *node_modules dependencies* (`zod`, `react-hook-form`) into the shared bundle independent of whether the import site is static or dynamic. The change had no measurable effect, so it was reverted rather than kept as unjustified complexity.

**Open item (genuinely unresolved):** shrinking the shared JS floor needs either a Turbopack-level chunk-splitting configuration this Next.js version doesn't yet expose, or restructuring `ServiceLeadForm` so its validation logic doesn't depend on `react-hook-form`/`zod` at all on routes that don't need them (a larger, riskier change — e.g. a lighter hand-rolled validation path for the lead form) — out of scope for a QA follow-up pass. `/about`, home, and the 9 group pages still ship ~149KB of react-hook-form/zod they never execute.

## 6. Mobile screenshots (375px)

Saved to `frontend/qa-screenshots/` (prefixed `qa-sweep-` to stay distinct from an earlier, unrelated admin-panel QA session's files already in that folder — both sets are gitignored, matching the existing convention for that directory, so they're local artifacts only, not part of this PR's diff):

- `qa-sweep-01-home-375.png`
- `qa-sweep-02-mobile-menu-open-375.png`
- `qa-sweep-03-service-page-lead-form-375.png`
- `qa-sweep-04-checkout-step1-375.png`
- `qa-sweep-05-login-375.png`
- `qa-sweep-06-dashboard-overview-375.png`

The dashboard screenshot is the one that surfaced the item-2 auth-guard bug above — the first capture silently showed the login page instead of the dashboard; after the `DashboardGuard`/`AdminGuard` fix, it correctly shows the authenticated overview.

## 7. Summary

| Item | Result |
|---|---|
| 1. Link crawler | PASS — 137/137, 0 broken, 116 services + 9 groups all 200 |
| 2. Page smoke test | PASS — 96/96 checks clean, after fixing 2 real app bugs |
| 3. Contrast | PASS — 12/12 pairs, after 1 token fix |
| 4. Keyboard/focus | PASS — 0 unreachable, 0 traps, 0 missing focus rings |
| 5. Performance | PASS — 5/5 pages under the 3s-on-4G goal (LCP 0.57s–1.19s), CLS 0 everywhere |
| 6. Screenshots | 6/6 captured, all showing correct content |

**Fixes made this pass:**
- `components/admin/NoAccessPage.tsx` — removed the duplicate `<h1>` on every access-denied admin page.
- `components/auth/DashboardGuard.tsx`, `components/admin/AdminGuard.tsx` — fixed a real bug where a hard reload of `/dashboard` or `/admin/*` with a valid session silently redirected to login instead of showing the authenticated page.
- `app/globals.css` — darkened `--gold` from `#b7892f` to `#926e26` so the Popular badge meets WCAG AA contrast.
- `scripts/qa/page-checks.mjs` — fixed 3 false positives in the smoke-test script itself (alt="" , textarea/select labelling, hidden shadow inputs).
- `scripts/qa/cdp.mjs`, `scripts/qa/perf.mjs` — fixed a CDP event-listener leak (handlers never removed across 100+ navigations in one browser tab/session).

**Follow-up pass (LCP measurement + bundle size):**
- LCP is now measured for real via the CDP `Tracing` domain (see item 5) — all 5 pages pass the 3s goal with real numbers, no proxy metric needed anymore.
- The ~312KB shared JS floor was investigated in depth (root cause confirmed: `zod`/`react-hook-form`, used by 116 of ~140 routes via `ServiceLeadForm`, gets hoisted into a bundle shared by every route). A `next/dynamic()` fix was attempted, verified not to reduce bytes (Turbopack's vendor cache-group hoists node_modules dependencies regardless of static-vs-dynamic import boundaries), and reverted. Still open — see item 5 for what a real fix would require.

**Open items (not fixed):**
- The ~312KB shared JS floor on every public page (`zod`/`react-hook-form` shipped to routes that never use them) — needs either a Turbopack chunk-splitting option this Next.js version doesn't expose yet, or restructuring `ServiceLeadForm`'s validation to not depend on those packages app-wide.
- Footer social links remain `#` placeholders pending real URLs — already tracked as `[VERIFY]` in `lib/site-config.ts`, not newly introduced by this sweep.
