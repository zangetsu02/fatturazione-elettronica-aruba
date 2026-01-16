---
seo:
  title: Fatturazione Elettronica Aruba SDK - TypeScript
  description: TypeScript SDK for Aruba Electronic Invoicing API v2. Send, receive and manage Italian electronic invoices.
---

::u-page-hero
#title
Fatturazione Elettronica Aruba SDK

#description
Modular TypeScript SDK for Aruba Electronic Invoicing API v2 integration.

#links
  :::u-button
  ---
  size: xl
  to: /en/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get Started
  :::

  :::u-button
  ---
  icon: i-lucide-book
  size: xl
  to: /en/api-reference/core
  variant: outline
  ---
  API Reference
  :::
::

::u-page-section
#title
Features

#default
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-key
    ---
    #title
    Authentication

    #description
    Complete OAuth2 management with automatic token refresh. Multi-company support for Premium users.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-send
    ---
    #title
    Send Invoices

    #description
    Upload signed and unsigned invoices. Support for all document types (TD01-TD28) and self-invoices.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-inbox
    ---
    #title
    Receive Invoices

    #description
    Search and download received invoices. Send acceptance/rejection outcome.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-bell
    ---
    #title
    SDI Notifications

    #description
    Retrieve notifications: Delivery Receipt, Rejection, Failed Delivery, Outcome, Term Expiry.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-file-text
    ---
    #title
    Communications

    #description
    Send financial communications: VAT settlements, issued/received invoice data.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-code
    ---
    #title
    Native TypeScript

    #description
    Complete typing for all methods and responses. ESM and CommonJS support.
    ::::
  :::
::

::u-page-section
#title
Quick Install

#default
  :::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
  ```bash
  pnpm add @fatturazione-elettronica-aruba/core @fatturazione-elettronica-aruba/invoices
  ```
  :::
::

::u-page-section
#title
Quick Example

#default
  :::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
  ```typescript
  import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
  import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
  import { encodeBase64 } from '@fatturazione-elettronica-aruba/utils';

  // Setup client
  const client = new ArubaClient({
    environment: 'demo', // or 'production'
  });

  // Authentication
  await client.auth.signin('username', 'password');

  // Send invoice
  const invoices = new InvoicesClient(client.http);
  const result = await invoices.upload({
    dataFile: encodeBase64(xmlContent),
  });

  console.log('Invoice sent:', result.uploadFileName);
  ```
  :::
::
