# @fatturazione-elettronica-aruba/nuxt

Nuxt module for [Aruba Electronic Invoicing SDK](https://github.com/zangetsu02/fatturazione-elettronica-aruba).

## Features

- Server-side only composables for security
- Auto-imported utilities in Nitro server routes
- TypeScript support out of the box
- Automatic OAuth2 authentication

## Installation

```bash
pnpm add @fatturazione-elettronica-aruba/nuxt
```

## Configuration

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@fatturazione-elettronica-aruba/nuxt'],

  fatturazioneAruba: {
    environment: 'demo', // or 'production'
  },

  runtimeConfig: {
    fatturazioneAruba: {
      username: '', // Set via NUXT_FATTURAZIONE_ARUBA_USERNAME
      password: '', // Set via NUXT_FATTURAZIONE_ARUBA_PASSWORD
    },
  },
});
```

### Environment Variables

For security, credentials should be set via environment variables:

```env
NUXT_FATTURAZIONE_ARUBA_USERNAME=your_username
NUXT_FATTURAZIONE_ARUBA_PASSWORD=your_password
```

## Usage

The module provides server-side composables that are auto-imported in your Nitro server routes:

### `useArubaClient()`

Returns the main ArubaClient instance:

```ts
// server/api/user.get.ts
export default defineEventHandler(async () => {
  const client = useArubaClient();
  return await client.auth.getUserInfo();
});
```

### `useArubaInvoices()`

Manage electronic invoices:

```ts
// server/api/invoices/sent.get.ts
export default defineEventHandler(async () => {
  const invoices = useArubaInvoices();

  return await invoices.findSent({
    creationDateStart: '2024-01-01',
    creationDateEnd: '2024-12-31',
  });
});
```

### `useArubaNotifications()`

Handle SDI notifications:

```ts
// server/api/notifications/receipts.get.ts
export default defineEventHandler(async () => {
  const notifications = useArubaNotifications();

  return await notifications.findDeliveryReceipts({
    creationDateStart: '2024-01-01',
    creationDateEnd: '2024-12-31',
  });
});
```

### `useArubaCommunications()`

Manage AdE communications (VAT liquidations, etc.):

```ts
// server/api/communications/liquidazioni.get.ts
export default defineEventHandler(async () => {
  const communications = useArubaCommunications();

  return await communications.findLiquidazioni({
    creationDateStart: '2024-01-01',
    creationDateEnd: '2024-12-31',
  });
});
```

## Security

All composables are **server-side only** and cannot be used in client-side code. This ensures your API credentials are never exposed to the browser.

## License

MIT
