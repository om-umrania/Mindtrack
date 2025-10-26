# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router pages (`dashboard`, `habits`, `analytics`), shared route helpers in `app/lib/`, and global styles in `app/globals.css`.
- `components/` stores reusable UI; file names stay kebab-case (e.g. `authenticated-layout.tsx`), exported symbols use `PascalCase`.
- `components/ui/` wraps Radix primitives and Tailwind patterns; prefer extending these before introducing new design tokens.
- `hooks/` and root-level `lib/` host client hooks and cross-cutting utilities (`lib/utils.ts`); promote logic here only when reused.

## Build, Test, and Development Commands
- `npm run dev` starts the hot-reloading dev server on `http://localhost:3000`.
- `npm run build` compiles production assets; run to catch type errors and route build issues.
- `npm run start` serves the last build locally for production-like smoke testing.
- `npm run lint` runs `next lint` with the project ESLint config; fixes must be applied before review.

## Coding Style & Naming Conventions
- TypeScript-first, functional React components with 2-space indentation, single quotes, and trailing commas per the default formatter.
- Keep `'use client'` at the top of client components, and consolidate variant logic with the `cn` helper from `lib/utils.ts`.
- Use descriptive prop names, camelCase for utilities, and prefix custom hooks with `use`.

## Testing Guidelines
- Automated tests are not yet configured; plan to introduce React Testing Library (unit) and Playwright (journey) as coverage needs grow.
- Place future tests beside the implementation (`component.test.tsx`) or under `__tests__/` for shared helpers.
- Validate auth flows, analytics summaries, and habit streak calculations; mock API calls via `app/lib/api.ts`.
- Until test tooling lands, rely on `npm run lint` plus manual passes through `/dashboard` and `/habits`.

## Commit & Pull Request Guidelines
- Follow the existing history: imperative, concise commit subjects such as `Add analytics charts`.
- Branch names should reflect scope (`feature/habit-streak-widget`), and commits should stay focused—rebase before opening a PR.
- PRs need a clear problem statement, summary of changes, linked issues/tasks, and screenshots or videos for UI-affecting work.
- Confirm `npm run build` and `npm run lint` succeed locally, then request review with any notable risks or TODOs called out.
