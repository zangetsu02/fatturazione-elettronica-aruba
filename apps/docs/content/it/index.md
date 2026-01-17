---
seo:
  title: Fatturazione Elettronica Aruba SDK - TypeScript
  description: SDK TypeScript per l'integrazione con le API di Fatturazione Elettronica Aruba v2. Invio, ricezione e gestione fatture elettroniche.
---

::u-page-hero
#title
SDK TypeScript per [Fatturazione Elettronica]{.text-primary} Aruba

#description
Integra le API di Fatturazione Elettronica Aruba v2 nel tuo progetto Node.js. Invia e ricevi fatture elettroniche, gestisci notifiche SDI e comunicazioni AdE con un'API moderna e type-safe.

#links
  :::u-button
  ---
  size: xl
  to: /it/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Inizia Subito
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /it/getting-started/quick-start
  variant: outline
  ---
  Quick Start
  :::
::

::u-page-section
---
headline: Funzionalita
title: Tutto il necessario per la fatturazione elettronica
description: Un SDK completo e modulare che copre l'intero ciclo di vita delle fatture elettroniche italiane.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-file-text
    to: /it/guides/invoices
    ---
    #title
    Gestione Fatture

    #description
    Invia fatture attive al SDI e ricevi quelle passive. Ricerca avanzata, download XML, validazione dry-run e monitoraggio consegna.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-bell
    to: /it/guides/notifications
    ---
    #title
    Notifiche SDI

    #description
    Monitora lo stato delle fatture in tempo reale. RC, MC, NS, DT e tutte le notifiche del Sistema di Interscambio.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-shield-check
    to: /it/guides/authentication
    ---
    #title
    Autenticazione OAuth2

    #description
    Login sicuro con refresh automatico dei token. Supporto multicedenti per intermediari e commercialisti.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-landmark
    to: /it/guides/communications
    ---
    #title
    Comunicazioni AdE

    #description
    Liquidazioni IVA periodiche e comunicazioni dati fatture verso l'Agenzia delle Entrate.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-code-xml
    to: /it/guides/xml-builder
    ---
    #title
    XML Builder

    #description
    Genera XML FatturaPA con API fluent type-safe. Validazione automatica e supporto completo dello standard.
    ::::

    ::::u-page-card
    ---
    icon: i-simple-icons-nuxtdotjs
    to: /it/integrations/nuxt
    ---
    #title
    Nuxt Module

    #description
    Integrazione nativa con Nuxt 3. Composables server-side auto-importati e configurazione semplificata.
    ::::
  :::
::

::u-page-section
---
headline: Architettura
title: Modulare per design
description: Installa solo i pacchetti necessari. Nessuna dipendenza inutile nel tuo bundle.
---
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-box
    to: /it/api-reference/core
    ---
    #title
    @fatturazione-elettronica-aruba/core

    #description
    Client HTTP, autenticazione OAuth2 e gestione token. Fondamento di tutti i pacchetti.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-file-text
    to: /it/api-reference/invoices
    ---
    #title
    @fatturazione-elettronica-aruba/invoices

    #description
    Invio e ricezione fatture, ricerca avanzata e download XML.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-bell
    to: /it/api-reference/notifications
    ---
    #title
    @fatturazione-elettronica-aruba/notifications

    #description
    Notifiche SDI: consegna, scarto, mancata consegna e decorrenza.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-landmark
    to: /it/api-reference/communications
    ---
    #title
    @fatturazione-elettronica-aruba/communications

    #description
    Liquidazioni IVA e comunicazioni dati fatture verso AdE.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-wrench
    to: /it/api-reference/utils
    ---
    #title
    @fatturazione-elettronica-aruba/utils

    #description
    Utility pure: encoding base64, formattazione date, validazione.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-code-xml
    to: /it/api-reference/xml-builder
    ---
    #title
    @fatturazione-elettronica-aruba/xml-builder

    #description
    Genera XML FatturaPA con API fluent type-safe e validazione.
    ::::
  :::
::

::u-page-section
---
headline: Developer Experience
title: Progettato per sviluppatori
description: API moderna con tutto cio che serve per sviluppare con fiducia.
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
    Tipizzazione completa end-to-end. Autocompletamento intelligente e refactoring sicuro.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-package
    variant: subtle
    ---
    #title
    ESM & CommonJS

    #description
    Compatibile con qualsiasi setup. Funziona ovunque senza configurazione.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-feather
    variant: subtle
    ---
    #title
    Zero Dependencies

    #description
    Nessuna dipendenza runtime. Bundle size minimo e nessun conflitto.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-toggle-right
    variant: subtle
    ---
    #title
    Demo & Production

    #description
    Passa da sandbox a produzione cambiando una sola configurazione.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-triangle-alert
    variant: subtle
    ---
    #title
    Errori Tipizzati

    #description
    Ogni errore ha la sua classe con codice, messaggio e dettagli strutturati.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-book-open
    variant: subtle
    ---
    #title
    Documentazione

    #description
    Guide complete, esempi pratici e API reference dettagliata.
    ::::
  :::
::

::u-page-section
---
title: Pronto per iniziare?
description: Installa l'SDK e invia la tua prima fattura elettronica in pochi minuti.
---
#links
  :::u-button
  ---
  size: xl
  to: /it/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Inizia Subito
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
