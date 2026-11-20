# Arthafilings — Frontend

Next.js (App Router) frontend for Arthafilings, an Indian business registration site. Service
pages, lead capture, a mock checkout/payment flow, a customer dashboard, and an admin panel are
all implemented here against mock data; a real backend will replace the mock layer later.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the Turbopack dev server
- `npm run build` — production build (runs `scripts/check-launch-readiness.mjs` first, which
  blocks the build if mock/placeholder content is still live)
- `npm run lint` — ESLint
- `npm run launch:check` — run the launch-readiness check on demand (`--force` to ignore the
  normal gating)
- `npm run launch:checklist` — generate a launch checklist from the service catalog

## Project layout

- `src/app/` — routes (site pages, `(auth)` login, `admin/`, `dashboard/`)
- `src/components/` — UI, forms, checkout, dashboard, and admin components
- `src/data/` — service catalog, mock pricing/coupons/orders, static content
- `src/lib/` — mock session/storage, analytics, pricing, and other shared helpers
- `src/types/` — shared TypeScript types

## Conventions

- All service content comes from `src/data/service-catalog.ts`; a new service is a new catalog
  entry (plus an optional content entry), not a new page template.
- Prices, fees, and other unconfirmed facts are marked `[VERIFY]` or `[TBD]` until confirmed.
- The brand palette lives in `src/app/globals.css` as CSS variables / Tailwind theme tokens —
  don't hardcode colours.
- Auth, OTP, payments, and the admin data store are all mocked client-side (see `src/lib/mock-*`)
  until the backend exists.
