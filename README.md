# Mindtrack

Mindtrack is a Next.js 14 habit tracker that blends progress dashboards, AI nudges, and streak analytics into one focused workspace. The project ships with an App Router architecture, Tailwind-powered design system, and MSW-backed mock APIs so contributors can iterate without a live backend.

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript  
- **UI:** Tailwind CSS, shadcn/ui, Lucide icons  
- **Data + Charts:** SWR, Recharts, react-calendar  
- **Tooling:** ESLint, Prettier, Husky, lint-staged, Vitest, Playwright, MSW

## Prerequisites

- Node.js 20 (see `.nvmrc` for convenience)  
- npm 9+  
- Playwright browsers (`npx playwright install`) if you plan to run end-to-end tests

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
# App runs at http://localhost:3000 with MSW mocks automatically enabled in development
```

### Useful Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server (MSW bootstraps automatically). |
| `npm run lint` / `npm run typecheck` | Ensure codebase consistency before committing. |
| `npm run test` | Run Vitest unit tests (JS DOM environment). |
| `npm run e2e` | Launch Playwright smoke tests (requires `npm run dev` port availability). |
| `npm run build` / `npm run start` | Compile and serve the production bundle. |

## Project Structure

```
app/               Next.js routes, server/client components, route-specific libs
components/        Reusable UI (including shadcn/ui wrappers) and providers
hooks/             Custom hooks such as toast state
lib/               Cross-cutting utilities
src/mocks/         MSW browser worker and API handlers
tests/             Playwright smoke suite
```

## Mock API Layer (MSW)

MSW intercepts `/api/*` calls in development to provide realistic responses for login, habits, analytics, and AI recommendations. Handlers live in `src/mocks/handlers.ts`; extend them as backend contracts evolve. When deploying to production, these mocks remain dormant.

## Contribution Tips

- Follow the conventions in `AGENTS.md` for commit hygiene, testing expectations, and PR checklists.  
- Run `npm run lint` and `npm run typecheck` locally before pushing; CI enforces the same gates.  
- For UI changes, capture screenshots and attach them to your pull request template.

## Environment

Environment variables live in `.env`. Start from `.env.example`, which includes:

- `DATABASE_URL` – connection string used by Prisma (PostgreSQL by default).  
- `NEXT_PUBLIC_DEMO` – toggles demo mode banner and mock auth behaviour.  
- `NEXT_PUBLIC_AI_ON` – enables AI-driven nudges and recommendations in the UI.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` – Clerk credentials used for user authentication (optional if running in demo mode).

## Database & Prisma

1. Launch a local Postgres instance (example via Docker Compose):
   ```bash
   docker compose -f docker-compose.db.yml up -d
   ```
   The service listens on `localhost:5432`. Stop it anytime with `docker compose -f docker-compose.db.yml down`.
2. Update `.env` with the matching `DATABASE_URL`, e.g.  
   `postgres://postgres:postgres@localhost:5432/mindtrack`
3. Run Prisma workflows:
   ```bash
   npm run db:gen       # Generate Prisma Client
   npm run db:migrate   # Apply migrations (create if none exist)
   npm run db:seed      # Seed demo data (after migrations)
   ```
   These scripts read credentials from `.env`; ensure it exists before running them.
4. Start the app as usual with `npm run dev` (mock APIs still load in development).

## Deploying to Production

1. **Environment variables**  
   Configure the following in your hosting platform (e.g., Vercel):
   - `DATABASE_URL`
   - `NEXT_PUBLIC_DEMO`
   - `NEXT_PUBLIC_AI_ON`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

   On Vercel, set the publishable key under **Environment Variables** with the `NEXT_PUBLIC_` prefix so it is exposed to the browser, and keep `CLERK_SECRET_KEY` scoped to server-only.

   ```text
   Environment Variable                 Example Value
   ---------------------                -------------------------------
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    pk_live_your_publishable_key
   CLERK_SECRET_KEY                     sk_live_your_secret_key
   ```

   Remember to redeploy after updating environment variables.

2. **Database migrations**  
   At deploy-time, run:
   ```bash
   npm run db:gen
   npm run db:migrate
   npm run db:seed   # optional: populate demo data
   ```
   `db:migrate` uses `prisma migrate deploy`, which safely applies existing migrations.

3. **Vercel configuration**  
   `vercel.json` enables clean URLs. `postinstall` automatically runs `prisma generate`, so the Prisma client is ready before the Next.js build.

4. **Smoke test endpoints**  
   After deployment, hit `/api/health` to confirm the live backend can reach the database.

## License

This project is released under the MIT License. See `LICENSE` for full details.
