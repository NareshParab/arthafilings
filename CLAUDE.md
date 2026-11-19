# Arthafilings — Project Rules

Arthafilings is an Indian business registration site. Frontend lives in `frontend/`; a backend will be added later in `backend/`.

## Source of truth

Source documents live in the Claude Project — follow them. Do not copy text, images, logos, or client logos from IndiaFilings or any other site. All content must be our own.

## Data and facts

Mark prices, fees, and legal facts as `[VERIFY]` or `[TBD]` until confirmed. Use mock data until told otherwise.

## Secrets

Never commit `.env` files, keys, tokens, or passwords. Only `.env.example` is tracked.

## Git workflow

- Small commits with clear messages: `feat:`, `fix:`, `chore:`, `docs:`.
- Work on a branch per task (e.g. `feat/proprietorship-hero`).
- At the end of each task: run `npm run lint` and `npm run build`, commit, and `git push -u origin <branch>`.
- Do not push directly to `main` unless explicitly told to.
- Before opening a pull request, run /code-review on your own diff and fix every confirmed finding. Report what it found.

## Styling

The brand palette lives in `frontend/src/app/globals.css`. Do not hardcode colours — use the CSS variables / Tailwind theme tokens.

## Services

All services come from `data/service-catalog.ts`. One service page template and one lead form. New service = new catalog entry plus optional content entry.
