---
seo:
  title: Aruba Electronic Invoicing SDK - TypeScript
  description: TypeScript SDK for Aruba Electronic Invoicing API v2. Send, receive and manage Italian electronic invoices.
---

::u-page-hero
#title
TypeScript SDK for Aruba Electronic Invoicing.

#description
Integrate Aruba Electronic Invoicing API v2 into your Node.js project. :br Send and receive electronic invoices, manage SDI notifications and AdE communications.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /en/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get Started
  :::

  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-github
  size: xl
  to: https://github.com/zangetsu02/fatturazione-elettronica-aruba
  target: _blank
  variant: outline
  ---
  GitHub
  :::

#headline
  :::u-button
  ---
  size: sm
  to: https://www.npmjs.com/org/fatturazione-elettronica-aruba
  target: _blank
  variant: outline
  ---
  v1.0.0 - Aruba API v2
  :::
::

::u-page-section
  :::u-page-grid
    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---
      :::::div{.bg-elevated.rounded-lg.p-4.overflow-x-auto}
      ```typescript [Complete Example]
      import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
      import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
      import { encodeBase64 } from '@fatturazione-elettronica-aruba/utils';

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
      :::::

    #title
    [Complete]{.text-primary} integration in a few lines

    #description
    From authentication to sending invoices: everything you need to integrate electronic invoicing into your ERP or application.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /en/guides/invoices
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      // Send outbound invoice
      await invoices.upload({
        dataFile: encodeBase64(xml),
        dryRun: false, // true to validate
      });

      // Search sent invoices
      const sent = await invoices.findSent({
        creationStartDate: '2024-01-01',
        creationEndDate: '2024-12-31',
      });

      // Download invoice XML
      const xml = await invoices.downloadSent({
        filename: 'IT123_00001.xml',
      });
      ```
      :::::

    #title
    [Outbound Invoices]{.text-primary}

    #description
    Send signed and unsigned invoices. Dry-run validation, advanced search and original XML download.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /en/guides/invoices
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      // Search received invoices
      const received = await invoices.findReceived({
        creationStartDate: '2024-01-01',
        creationEndDate: '2024-12-31',
        senderVatCode: '01234567890',
      });

      // Download inbound invoice
      const xml = await invoices.downloadReceived({
        filename: received.content[0].filename,
      });

      // Send buyer outcome
      await invoices.sendOutcome({
        filename: 'IT123_00001.xml',
        outcome: 'accepted', // or 'rejected'
      });
      ```
      :::::

    #title
    [Inbound Invoices]{.text-primary}

    #description
    Search and download received invoices. Buyer outcome management with acceptance or rejection.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 md:col-span-1
    to: /en/guides/notifications
    ---
      :::::div{.flex.flex-col.gap-2.py-2}
        ::::::div{.flex.items-center.gap-2.p-2.bg-green-500/10.rounded.text-green-600.dark:text-green-400}
        :icon{name="i-lucide-check-circle" .size-5}
        **RC** - Delivery Receipt
        ::::::

        ::::::div{.flex.items-center.gap-2.p-2.bg-yellow-500/10.rounded.text-yellow-600.dark:text-yellow-400}
        :icon{name="i-lucide-alert-triangle" .size-5}
        **MC** - Failed Delivery
        ::::::

        ::::::div{.flex.items-center.gap-2.p-2.bg-red-500/10.rounded.text-red-600.dark:text-red-400}
        :icon{name="i-lucide-x-circle" .size-5}
        **NS** - Rejection Notice
        ::::::

        ::::::div{.flex.items-center.gap-2.p-2.bg-blue-500/10.rounded.text-blue-600.dark:text-blue-400}
        :icon{name="i-lucide-clock" .size-5}
        **DT** - Terms Expiration
        ::::::
      :::::

    #title
    [SDI Notifications]{.text-primary}

    #description
    Monitor invoice status with all Sistema di Interscambio notifications.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 md:col-span-1
    to: /en/guides/authentication
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      // OAuth2 Login
      const auth = await client.auth.signIn(
        username,
        password
      );

      // Automatic token refresh
      // or manual:
      await client.auth.refresh();

      // User and account info
      const user = await client.auth.getUserInfo();
      console.log(user.vatCode);
      console.log(user.accountStatus);

      // Multi-company (Premium)
      const companies = await client.auth
        .getMulticedenti();
      ```
      :::::

    #title
    [OAuth2]{.text-primary} Authentication

    #description
    Complete token lifecycle management with automatic refresh. Multi-company support for intermediaries.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---
      :::::tabs
        ::::::tabs-item{icon="i-simple-icons-pnpm" label="pnpm"}
        ```bash
        # Core + Invoices (common use)
        pnpm add @fatturazione-elettronica-aruba/core @fatturazione-elettronica-aruba/invoices

        # Add notifications
        pnpm add @fatturazione-elettronica-aruba/notifications

        # Add communications (VAT settlements, etc.)
        pnpm add @fatturazione-elettronica-aruba/communications

        # Optional utilities
        pnpm add @fatturazione-elettronica-aruba/utils
        ```
        ::::::

        ::::::tabs-item{icon="i-simple-icons-npm" label="npm"}
        ```bash
        # Core + Invoices (common use)
        npm install @fatturazione-elettronica-aruba/core @fatturazione-elettronica-aruba/invoices

        # Add notifications
        npm install @fatturazione-elettronica-aruba/notifications

        # Add communications (VAT settlements, etc.)
        npm install @fatturazione-elettronica-aruba/communications

        # Optional utilities
        npm install @fatturazione-elettronica-aruba/utils
        ```
        ::::::
      :::::

    #title
    [Modular]{.text-primary} Architecture

    #description
    Install only the packages you need. `core` is always required, others depend on the features you need.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    ---
      :::::div{.flex.flex-col.gap-2.py-2}
        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Full TypeScript typing
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        ESM and CommonJS support
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Zero runtime dependencies
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Demo and production environments
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Typed and descriptive errors
        ::::::
      :::::

    #title
    Built for [Developers]{.text-primary}

    #description
    Modern API with intelligent autocompletion, clear errors and inline documentation.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /en/guides/communications
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      import { CommunicationsClient } from
        '@fatturazione-elettronica-aruba/communications';

      const comms = new CommunicationsClient(client.http);

      // Quarterly VAT settlement
      await comms.uploadLiquidazione({
        dataFile: encodeBase64(liquidazioneXml),
      });

      // Invoice data (esterometro)
      await comms.uploadDatiFatture({
        dataFile: encodeBase64(datiFattureXml),
      });
      ```
      :::::

    #title
    [AdE]{.text-primary} Communications

    #description
    Send periodic VAT settlements and invoice data communications to the Revenue Agency.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---
      :::::div{.bg-elevated.rounded-lg.p-4.overflow-x-auto}
      ```typescript
      import { ArubaApiError, AuthenticationError, ValidationError } from '@fatturazione-elettronica-aruba/core';

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
      :::::

    #title
    [Detailed]{.text-primary} Error Handling

    #description
    Each error type has its dedicated class with code, message and details. No more parsing generic error strings.
    ::::
  :::
::
