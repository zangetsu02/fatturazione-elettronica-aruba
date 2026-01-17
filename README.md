# Aruba Electronic Invoicing SDK

TypeScript SDK for integrating with [Aruba Electronic Invoicing API v2](https://fatturazioneelettronica.aruba.it/). Send, receive and manage Italian electronic invoices through Sistema di Interscambio (SDI).

## Features

- Full TypeScript support with complete type definitions
- ESM and CommonJS module support
- Modular architecture - install only what you need
- Zero runtime dependencies
- Demo and production environment support
- Typed and descriptive error handling
- OAuth2 authentication with automatic token refresh
- Multi-company support for intermediaries

## Packages

| Package | Description |
|---------|-------------|
| [`@fatturazione-aruba/core`](./packages/core) | HTTP client, OAuth2 authentication, base types and errors |
| [`@fatturazione-aruba/invoices`](./packages/invoices) | Send and receive electronic invoices |
| [`@fatturazione-aruba/notifications`](./packages/notifications) | SDI notifications management (RC, MC, NS, etc.) |
| [`@fatturazione-aruba/communications`](./packages/communications) | AdE communications (VAT settlements, invoice data) |
| [`@fatturazione-aruba/utils`](./packages/utils) | Shared utilities (base64 encoding, date formatting) |
| [`@fatturazione-aruba/xml-builder`](./packages/xml-builder) | FatturaPA XML builder with validation |

## Installation

```bash
# Core + Invoices (most common use case)
pnpm add @fatturazione-aruba/core @fatturazione-aruba/invoices

# Add notifications
pnpm add @fatturazione-aruba/notifications

# Add communications (VAT settlements, etc.)
pnpm add @fatturazione-aruba/communications

# Optional utilities
pnpm add @fatturazione-aruba/utils
```

## Quick Start

```typescript
import { ArubaClient } from '@fatturazione-aruba/core';
import { InvoicesClient } from '@fatturazione-aruba/invoices';
import { encodeBase64 } from '@fatturazione-aruba/utils';
import fs from 'node:fs';

// 1. Initialize the client
const client = new ArubaClient({ environment: 'production' });

// 2. OAuth2 authentication (token managed automatically)
await client.auth.signIn(process.env.ARUBA_USERNAME, process.env.ARUBA_PASSWORD);

// 3. Send an invoice to Sistema di Interscambio
const invoices = new InvoicesClient(client.http);
const result = await invoices.upload({
  dataFile: encodeBase64(fs.readFileSync('invoice.xml', 'utf-8')),
});

console.log('Invoice sent:', result.uploadFileName);
// Output: IT01234567890_00001.xml
```

## Error Handling

```typescript
import { ArubaApiError, AuthenticationError, ValidationError } from '@fatturazione-aruba/core';

try {
  await invoices.upload({ dataFile: xmlBase64 });
} catch (error) {
  if (error instanceof AuthenticationError) {
    // 401 - Token expired or invalid credentials
    console.log('Please login again');
  } else if (error instanceof ValidationError) {
    // 400 - Invoice validation error
    console.log('Errors:', error.details);
  } else if (error instanceof ArubaApiError) {
    // Other API errors
    console.log(`[${error.code}] ${error.message}`);
  }
}
```

## Development

This is a monorepo managed with [pnpm](https://pnpm.io/) and [Turborepo](https://turbo.build/).

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 10.12.4

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Format code
pnpm format
```

### Project Structure

```
.
├── apps/
│   └── docs/              # Documentation website
├── packages/
│   ├── core/              # HTTP client, auth, types
│   ├── invoices/          # Invoice management
│   ├── notifications/     # SDI notifications
│   ├── communications/    # AdE communications
│   ├── utils/             # Shared utilities
│   ├── xml-builder/       # FatturaPA XML builder
│   └── typescript-config/ # Shared TS configuration
└── tests/
    ├── integration/       # Integration tests (real API)
    └── e2e/               # End-to-end tests
```

### Testing

```bash
# Unit tests (all packages)
pnpm test

# Integration tests (requires .env configuration)
pnpm test:integration

# E2E tests
pnpm test:e2e
```

## Documentation

Full documentation is available at the [docs website](./apps/docs).

## License

[MIT](./LICENSE)
