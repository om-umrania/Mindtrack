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

## License

This project is released under the MIT License. See `LICENSE` for full details.
