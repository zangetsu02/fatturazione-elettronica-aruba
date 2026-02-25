# AGENTS.md

This file provides guidance for agentic coding agents working with the Aruba Electronic Invoicing TypeScript SDK monorepo.

## Build & Development Commands

```bash
# Core commands (run from root)
pnpm install              # Install all dependencies
pnpm build                # Build all packages (Turborepo)
pnpm test                 # Run unit tests (all packages)
pnpm test:watch           # Run tests in watch mode
pnpm lint                 # Run ESLint on all packages
pnpm typecheck            # TypeScript type checking for all packages
pnpm format               # Format code with Prettier
pnpm format:check         # Check formatting without changes
pnpm clean                # Clean all build artifacts and dependencies

# Single package operations
pnpm --filter @fatturazione-elettronica-aruba/core test
pnpm --filter @fatturazione-elettronica-aruba/core build
pnpm --filter @fatturazione-elettronica-aruba/invoices lint

# Run single test file
pnpm --filter @fatturazione-elettronica-aruba/core test src/__tests__/client.test.ts

# Specialized testing
pnpm test:integration     # Integration tests (requires .env with ARUBA_USERNAME/ARUBA_PASSWORD)
pnpm test:e2e             # E2E tests (Playwright for docs)

# Package development
pnpm --filter @fatturazione-elettronica-aruba/docs dev    # Start docs dev server
```

## Architecture Overview

This is a **pnpm monorepo** with **Turborepo** orchestration. The SDK wraps the Aruba Electronic Invoicing API v2.

### Package Structure
```
core (base) ← domain clients depend on this
├── invoices (depends on core)
├── notifications (depends on core)
└── communications (depends on core)

utils (standalone)
xml-builder (standalone)
typescript-config (shared config)
```

### Key Patterns

1. **Core Package**: Provides `ArubaClient` facade with `HttpClient` and `AuthClient`
2. **Domain Clients**: Receive `HttpClient` instance from core (e.g., `new InvoicesClient(arubaClient.http)`)
3. **Dual Exports**: All packages export both ESM and CommonJS (tsup with `format: ['cjs', 'esm']`)
4. **Type Safety**: Shared TypeScript config, strict mode enabled

## Code Style Guidelines

### Import Style
```typescript
// Use explicit .js extensions for local imports (required by verbatimModuleSyntax)
import { HttpClient } from './http/client.js';
import type { HttpClientOptions } from './http/client.js';

// Group imports: external first, then internal, then type-only imports
import { vi, describe, it, expect } from 'vitest';
import { ArubaClient } from '../client.js';
import type { ArubaClientOptions } from '../client.js';

// Use type-only imports when possible
import type { Environment, Logger } from './types/index.js';
```

### Naming Conventions
- **Classes**: PascalCase (`ArubaClient`, `HttpClient`, `AuthClient`)
- **Interfaces**: PascalCase (`HttpClientOptions`, `ArubaClientOptions`)
- **Functions/Methods**: camelCase (`setAccessToken`, `buildRequest`)
- **Constants**: SCREAMING_SNAKE_CASE (`ENVIRONMENT_URLS`, `SYNC_ERROR_CODES`)
- **Files**: kebab-case (`http-client.ts`, `auth-client.ts`)
- **Test Files**: same name as source file with `.test.ts` suffix

### Error Handling
```typescript
// Extend from base ArubaApiError
export class AuthenticationError extends ArubaApiError {
  constructor(message: string, details?: string) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

// Use factory methods for response-based errors
static fromResponse(response: ApiErrorResponse, statusCode: number): ArubaApiError {
  return new ArubaApiError(
    response.error.message,
    response.error.code,
    statusCode,
    response.error.details
  );
}
```

### Class Structure
```typescript
export class HttpClient {
  private readonly requestBuilder: RequestBuilder;
  private readonly logger: Logger;

  constructor(options: HttpClientOptions) {
    // Initialize readonly properties
  }

  // Public methods
  public async get<T>(path: string): Promise<T> {}
  
  // Private helper methods
  private async execute<T>(url: string, init: RequestInit): Promise<T> {}
}
```

### Type Definitions
```typescript
// Use interfaces for objects, types for unions/primitives
export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export type Environment = 'demo' | 'production';
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 429 | 500;

// Use as const for object literals
export const SYNC_ERROR_CODES = {
  '0001': 'Nome file già presente nel sistema',
  '0002': 'Fattura duplicata',
} as const;
```

### Testing Patterns
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ClassName', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should do something', async () => {
    // Arrange
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: 'test' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    // Act
    const result = await client.getData();

    // Assert
    expect(result).toEqual({ data: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });
});
```

### Configuration Files
- **ESLint**: Uses TypeScript ESLint with Prettier integration
- **Prettier**: 2-space indentation, single quotes, trailing commas (es5)
- **TypeScript**: Strict mode, verbatim module syntax, ES2022 target
- **Build**: tsup for bundling with dual CJS/ESM output

## Package Development Workflow

1. **When adding new domain client**:
   - Create package in `/packages/package-name`
   - Add dependency on core in package.json
   - Export `XxxClient` class and types
   - Follow pattern: `new XxxClient(arubaClient.http)`

2. **When modifying core**:
   - Consider impact on all dependent packages
   - Run `pnpm build` to ensure all packages compile
   - Run `pnpm test` to catch breaking changes

3. **Before committing**:
   ```bash
   pnpm lint         # Check linting
   pnpm typecheck     # Check types
   pnpm test          # Run tests
   pnpm format        # Format code
   ```

## Important Notes

- All packages use `.js` extensions for imports due to `verbatimModuleSyntax`
- Tests use Vitest with globals enabled
- Integration tests require valid Aruba credentials in `.env`
- The SDK supports both demo and production Aruba environments
- OAuth2 token management with auto-refresh is handled by the core package