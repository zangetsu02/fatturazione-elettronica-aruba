# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Integration tests (requires .env with ARUBA_USERNAME/ARUBA_PASSWORD)
pnpm test:integration

# E2E tests (Playwright for docs)
pnpm test:e2e

# Docs development
pnpm --filter @fatturazione-elettronica-aruba/docs dev
```

## Architecture

This is a **pnpm monorepo** with **Turborepo** for task orchestration. The SDK wraps the Aruba Electronic Invoicing API v2 for Italian electronic invoices (FatturaPA/SDI).

### Package Dependency Graph

```
core (base)
  ├── invoices (depends on core)
  ├── notifications (depends on core)
  └── communications (depends on core)

utils (standalone)
xml-builder (standalone)
```

### Package Responsibilities

- **core**: `ArubaClient` facade with `HttpClient` and `AuthClient`. OAuth2 token management with auto-refresh. Error hierarchy (`ArubaApiError` → `AuthenticationError`, `RateLimitError`, etc.). Environment config (demo/production URLs).

- **invoices/notifications/communications**: Domain clients that receive `HttpClient` instance from core. Each follows pattern: `XxxClient` class + types exports.

- **xml-builder**: Standalone FatturaPA XML generation. `FatturaBuilder` (fluent API) → `FatturaSerializer` (XML output) → `FatturaValidator` (validation).

- **utils**: Pure functions (base64, date formatting) with no dependencies.

### Key Patterns

- All packages export ESM and CommonJS (tsup with `format: ['cjs', 'esm']`)
- Shared TypeScript config in `packages/typescript-config`
- Domain clients instantiated with `new XxxClient(arubaClient.http)`
- Tests use Vitest with globals enabled
- Integration tests hit real Aruba API (sandbox)

### Docs (apps/docs)

Nuxt 4 + Docus documentation. Content in `content/{en,it}/`. Deployed to Vercel.
