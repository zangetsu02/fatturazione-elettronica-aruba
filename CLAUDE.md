# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> See `AGENTS.md` for detailed code-style conventions (imports, naming, error classes, test patterns). This file covers commands and architecture.

## Build & Development Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (Turborepo)
pnpm test             # Run unit tests (all packages)
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript type checking
pnpm format           # Format with Prettier

# Single package commands
pnpm --filter @fatturazione-elettronica-aruba/core test
pnpm --filter @fatturazione-elettronica-aruba/core build

# Run single test file
pnpm --filter @fatturazione-elettronica-aruba/core test src/__tests__/client.test.ts

# Integration tests (requires .env with ARUBA_USERNAME/ARUBA_PASSWORD; hits real Aruba sandbox)
pnpm test:integration

# E2E tests (Playwright for docs)
pnpm test:e2e

# Docs development
pnpm --filter @fatturazione-elettronica-aruba/docs dev
```

`pnpm build` is a prerequisite for `test`, `lint`, and `typecheck` in the Turborepo graph (`dependsOn: ["^build"]`) — domain packages import from core's built `dist/`, so build first if tests fail with missing-module errors.

## Architecture

This is a **pnpm monorepo** (`packages/*`, `apps/*`, `tests/*`) with **Turborepo** for task orchestration. The SDK wraps the Aruba Electronic Invoicing API v2 for Italian electronic invoices (FatturaPA/SDI).

### Package Dependency Graph

```
core (base)
  ├── invoices         (depends on core)
  ├── notifications    (depends on core)
  └── communications   (depends on core)

utils         (standalone, zero deps)
xml-builder   (standalone)
nuxt          (Nuxt module — re-exports all of the above)
typescript-config  (shared tsconfig)
```

### Package Responsibilities

- **core**: `ArubaClient` facade composing `HttpClient` and `AuthClient`. `HttpClient` is itself composed of focused pieces (`request-builder`, `fetch-client`, `response-handler`, `retry-handler`) — single-responsibility split, not one monolith. OAuth2 token management with auto-refresh (`autoRefresh`/`refreshMargin` options, pluggable `TokenStorage`). Error hierarchy (`ArubaApiError` → `AuthenticationError`, `RateLimitError`, `ValidationError`, etc.) with `ArubaApiError.fromResponse()` factory. Environment config (demo/production base URLs).

- **invoices / notifications / communications**: Domain clients that receive a `HttpClient` instance from core. Each follows the same shape: `XxxClient` class + `types.ts` + `index.ts`. They do **not** construct their own HTTP/auth — instantiate as `new XxxClient(arubaClient.http)`.

- **xml-builder**: Standalone FatturaPA XML generation, no dependency on core. Flow: `FatturaBuilder` (fluent API) → `FatturaSerializer`/`XmlSerializer` (XML output) → `FatturaValidator` (validation, with `patterns.ts` and `validation/rules/`).

- **utils**: Pure functions (base64, date formatting), no dependencies.

- **nuxt**: Nuxt 3 module (`@nuxt/kit`) exposing server-side composables in `runtime/server/utils/` (`useArubaClient`, `useArubaInvoices`, `useArubaNotifications`, `useArubaCommunications`). Depends on all SDK packages; `nuxt` is a peer dependency.

### Key Patterns

- **`.js` extensions on all local imports** are required (`verbatimModuleSyntax`), even though source files are `.ts` — e.g. `import { HttpClient } from './http/client.js'`. Omitting this breaks the build.
- All packages emit ESM **and** CommonJS via tsup (`format: ['cjs', 'esm']`).
- The facade wires options through: `ArubaClient` maps `maxRetries` → `HttpClient` retry config and forwards `tokenStorage`/`autoRefresh`/`refreshMargin` → `AuthClient`.
- Tests use Vitest with globals enabled; `fetch` is stubbed via `vi.stubGlobal('fetch', ...)`.

### Tests workspace (`tests/*`)

`tests/integration` and `tests/e2e` are their own private workspace packages (run via the root `test:integration` / `test:e2e` scripts), separate from the per-package `__tests__/` unit tests.

### Docs (apps/docs)

Nuxt 4 + Docus documentation. Content in `content/{en,it}/`. Deployed to Vercel.
