---
seo:
  title: Aruba Electronic Invoicing SDK - TypeScript
  description: TypeScript SDK for Aruba Electronic Invoicing API v2. Send, receive and manage Italian electronic invoices.
---

::u-page-hero
#title
TypeScript SDK for [Aruba Electronic Invoicing]{.text-primary}

#description
Integrate Aruba Electronic Invoicing API v2 into your Node.js project. Send and receive electronic invoices, manage SDI notifications and AdE communications with a modern, type-safe API.

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
  color: neutral
  size: xl
  to: /en/getting-started/quick-start
  variant: outline
  ---
  Quick Start
  :::
::

::u-page-section
---
headline: Features
title: Everything you need for electronic invoicing
description: A complete and modular SDK covering the entire lifecycle of Italian electronic invoices.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-file-text
    to: /en/guides/invoices
    ---
    #title
    Invoice Management

    #description
    Send outbound invoices to SDI and receive inbound ones. Advanced search, XML download, dry-run validation and delivery monitoring.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-bell
    to: /en/guides/notifications
    ---
    #title
    SDI Notifications

    #description
    Monitor invoice status in real-time. RC, MC, NS, DT and all Sistema di Interscambio notifications.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-shield-check
    to: /en/guides/authentication
    ---
    #title
    OAuth2 Authentication

    #description
    Secure login with automatic token refresh. Multi-company support for intermediaries and accountants.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-landmark
    to: /en/guides/communications
    ---
    #title
    AdE Communications

    #description
    Periodic VAT settlements and invoice data communications to the Revenue Agency.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-code-xml
    to: /en/guides/xml-builder
    ---
    #title
    XML Builder

    #description
    Generate FatturaPA XML with type-safe fluent API. Automatic validation and full standard support.
    ::::

    ::::u-page-card
    ---
    icon: i-simple-icons-nuxtdotjs
    to: /en/integrations/nuxt
    ---
    #title
    Nuxt Module

    #description
    Native Nuxt 3 integration. Auto-imported server-side composables and simplified configuration.
    ::::
  :::
::

::u-page-section
---
headline: Architecture
title: Modular by design
description: Install only the packages you need. No unnecessary dependencies in your bundle.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-box
    to: /en/api-reference/core
    ---
    #title
    @fatturazione-elettronica-aruba/core

    #description
    HTTP client, OAuth2 authentication and token management. Foundation for all packages.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-file-text
    to: /en/api-reference/invoices
    ---
    #title
    @fatturazione-elettronica-aruba/invoices

    #description
    Send and receive invoices, advanced search and XML download.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-bell
    to: /en/api-reference/notifications
    ---
    #title
    @fatturazione-elettronica-aruba/notifications

    #description
    SDI notifications: delivery, rejection, failed delivery and expiration.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-landmark
    to: /en/api-reference/communications
    ---
    #title
    @fatturazione-elettronica-aruba/communications

    #description
    VAT settlements and invoice data communications to AdE.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-wrench
    to: /en/api-reference/utils
    ---
    #title
    @fatturazione-elettronica-aruba/utils

    #description
    Pure utilities: base64 encoding, date formatting, validation.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-code-xml
    to: /en/api-reference/xml-builder
    ---
    #title
    @fatturazione-elettronica-aruba/xml-builder

    #description
    Generate FatturaPA XML with type-safe fluent API and validation.
    ::::
  :::
::

::u-page-section
---
headline: Developer Experience
title: Built for developers
description: Modern API with everything you need to develop with confidence.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-simple-icons-typescript
    variant: subtle
    ---
    #title
    TypeScript First

    #description
    Full end-to-end typing. Intelligent autocompletion and safe refactoring.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-package
    variant: subtle
    ---
    #title
    ESM & CommonJS

    #description
    Compatible with any setup. Works everywhere without configuration.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-feather
    variant: subtle
    ---
    #title
    Zero Dependencies

    #description
    No runtime dependencies. Minimal bundle size and no conflicts.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-toggle-right
    variant: subtle
    ---
    #title
    Demo & Production

    #description
    Switch from sandbox to production by changing a single configuration.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-triangle-alert
    variant: subtle
    ---
    #title
    Typed Errors

    #description
    Each error has its class with code, message and structured details.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-book-open
    variant: subtle
    ---
    #title
    Documentation

    #description
    Complete guides, practical examples and detailed API reference.
    ::::
  :::
::

::u-page-section
---
title: Ready to get started?
description: Install the SDK and send your first electronic invoice in minutes.
---
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
  color: neutral
  size: xl
  to: https://github.com/zangetsu02/fatturazione-elettronica-aruba
  target: _blank
  variant: outline
  icon: i-simple-icons-github
  ---
  GitHub
  :::
::
