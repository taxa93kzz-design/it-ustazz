# Repository Guidelines

## Project Structure & Module Organization

Application code lives under `src/`:

- `src/app/` contains App Router pages such as `kmzh/`, `tests/`, and `materials/`.
- `src/components/` contains reusable layout, feedback, and shadcn-style UI pieces.
- `src/lib/` contains shared utilities and Word export logic.
- `src/services/storage.ts` is the only localStorage access layer.
- `src/types/` contains shared TypeScript models.

Avoid placing generated output or dependency folders in version control. Add them to `.gitignore` when the build system is selected.

## Build, Test, and Development Commands

- `npm install` - install locked dependencies.
- `npm run dev` - start the local development environment.
- `npm run lint` - check formatting and code quality.
- `npm run build` - create production-ready output.

Run commands from the repository root.

## Coding Style & Naming Conventions

Use strict TypeScript, UTF-8, LF line endings, and two-space indentation. Use `PascalCase` for components and types, `camelCase` for functions and variables, and `kebab-case` for files. Prefer the `@/` import alias. Keep browser-only modules marked with `"use client"` and guard localStorage access to prevent hydration errors.

## Testing Guidelines

No automated test framework is configured yet. Validate changes with `npm run lint` and `npm run build`, then manually exercise generator validation, localStorage persistence, and Word downloads. When tests are introduced, mirror `src/` under `tests/` and use names such as `tests/services/storage.test.ts`.

## Commit & Pull Request Guidelines

Use concise, imperative commit subjects such as `Add worksheet export`. Keep each commit scoped to one logical change. Pull requests should explain the purpose, summarize verification performed, and link related issues. Include screenshots for visible UI changes and call out data-model or configuration changes.

## Security & Configuration

Never commit secrets, credentials, or local environment files. Provide sanitized examples such as `.env.example`, validate configuration at startup, and document newly required variables in the README.
