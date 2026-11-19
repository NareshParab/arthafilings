# Arthafilings

Arthafilings is a site for Indian business registration and compliance filings — company/LLP/proprietorship registration, GST, trademark, income tax, MCA and compliance services, sold through a single service-page template with a lead form and a mock checkout.

## Folder layout

- `frontend/` — Next.js (App Router) frontend application. The only part of the project running today.
- `backend/` — not yet created; planned for a future API/server layer (orders, payments, document storage, admin auth).
- `docs/` — source requirement/architecture documents and generated reports (e.g. `LAUNCH_CHECKLIST.md`).

## Environment variables

Copy `frontend/.env.example` to `frontend/.env.local` and fill in real values before a production build.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL, used for `metadataBase`, canonical links, sitemap and robots output. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact number shown on the site. |
| `NEXT_PUBLIC_GA_ID` | Google Analytics measurement ID. Analytics only loads when this is set **and** the app is running in production. |
| `NEXT_PUBLIC_SITE_ENV` | Set to `production` for a real production build — this is what turns on the launch-readiness safety check (`prebuild`) and other production-only behaviour. Leave unset for ordinary dev/preview builds. |

Never commit `.env` or `.env.local` files, keys, tokens or passwords — only `.env.example` is tracked.

## Running the frontend

```
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000.

## Scripts (run from `frontend/`)

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server. |
| `npm run build` | Production build. Runs `prebuild` first, which only enforces the launch-readiness check when `NEXT_PUBLIC_SITE_ENV=production`. |
| `npm run lint` | ESLint. |
| `npm run launch:check` | Run the launch-readiness check on demand, regardless of env, and print the same report a blocked production build would show. |
| `npm run launch:checklist` | Scan `src` for `[VERIFY]`, `[TBD]` and `MOCK` markers and regenerate `docs/LAUNCH_CHECKLIST.md`. |

## Git workflow

- Small commits with clear messages: `feat:`, `fix:`, `chore:`, `docs:`.
- Work on a branch per task (e.g. `feat/proprietorship-hero`).
- At the end of each task: run `npm run lint` and `npm run build`, commit, and `git push -u origin <branch>`.
- Do not push directly to `main` unless explicitly told to.
- Before opening a pull request, run `/code-review` on your own diff and fix every confirmed finding.

See `CLAUDE.md` for the full project rules (source of truth, data/fact handling, styling, services catalog).
