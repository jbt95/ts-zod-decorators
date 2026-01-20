# Repository Guidelines

## Project Structure & Module Organization

- Source code lives in `src/` and is published from `dist/` via `tsup`.
- Public entrypoint is `src/index.ts` which re-exports decorators and helpers.
- Core logic is in `src/validator.class.ts` and decorators live in `src/*.decorator.ts`.
- Tests are colocated in `src/test.ts` (Vitest).
- Build artifacts are emitted to `dist/` (CJS + ESM + types).

## Build, Test, and Development Commands

- `pnpm install`: install dependencies with pnpm.
- `pnpm build`: pnpmdle to `dist/` using `tsup` (CJS/ESM + `.d.ts`).
- `pnpm test`: run Vitest in watch mode.
- `pnpm test:coverage`: run Vitest with coverage reporting.
- `pnpm type:check`: run `tsc --noEmit` for type safety.

## Coding Style & Naming Conventions

- TypeScript, 2-tab indentation (existing style uses tabs).
- Files use kebab-case for decorators (e.g., `zod-input.decorator.ts`).
- Classes are PascalCase; functions and variables are camelCase.
- Prefer explicit types at public boundaries (decorator factories, exports).
- Formatting: Prettier is used; keep changes consistent with current formatting.

## Testing Guidelines

- Framework: Vitest.
- Current test file: `src/test.ts`; keep new tests here unless splitting.
- Use `describe`/`it` blocks with clear scenario wording.
- Run `pnpm test` during development and `pnpm test:coverage` before release.

## Commit & Pull Request Guidelines

- Git history shows short, direct messages (e.g., “update readme”, “upgraded deps”).
- Keep commits small and focused; use present-tense, imperative subjects.
- PRs should include a brief summary, testing notes, and any breaking changes.
- Link related issues when available; note migrations in the PR description.

## Release & Compatibility Notes

- `zod` is a peer dependency; keep the peer range aligned with runtime usage.
- This package targets Node 20+ (see `package.json` engines).
