---
seo:
  title: Fatturazione Elettronica Aruba SDK - TypeScript
  description: SDK TypeScript per l'integrazione con le API di Fatturazione Elettronica Aruba v2. Invio, ricezione e gestione fatture elettroniche.
---

::u-page-hero
#title
Fatturazione Elettronica Aruba SDK

#description
SDK TypeScript modulare per l'integrazione con le API di Fatturazione Elettronica Aruba v2.

#links
  :::u-button
  ---
  size: xl
  to: /it/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Inizia
  :::

  :::u-button
  ---
  icon: i-lucide-book
  size: xl
  to: /it/api-reference/core
  variant: outline
  ---
  Riferimento API
  :::
::

::u-page-section
#title
Funzionalita

#default
  :::u-page-grid
    ::::u-page-card
    ---
    icon: i-lucide-key
    ---
    #title
    Autenticazione

    #description
    Gestione completa OAuth2 con refresh automatico dei token. Supporto multicedenti per utenti Premium.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-send
    ---
    #title
    Invio Fatture

    #description
    Upload fatture firmate e non firmate. Supporto per tutti i tipi documento (TD01-TD28) e autofatture.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-inbox
    ---
    #title
    Ricezione Fatture

    #description
    Ricerca e download fatture ricevute. Invio esito committente (accettazione/rifiuto).
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-bell
    ---
    #title
    Notifiche SDI

    #description
    Recupero notifiche: Ricevuta Consegna, Scarto, Mancata Consegna, Esito, Decorrenza Termini.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-file-text
    ---
    #title
    Comunicazioni

    #description
    Invio comunicazioni finanziarie: liquidazioni IVA, dati fatture emesse/ricevute.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-code
    ---
    #title
    TypeScript Nativo

    #description
    Tipizzazione completa per tutti i metodi e risposte. Supporto ESM e CommonJS.
    ::::
  :::
::

::u-page-section
#title
Installazione Rapida

#default
  :::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
  ```bash
  pnpm add @fatturazione-elettronica-aruba/core @fatturazione-elettronica-aruba/invoices
  ```
  :::
::

::u-page-section
#title
Esempio Rapido

#default
  :::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
  ```typescript
  import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
  import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
  import { encodeBase64 } from '@fatturazione-elettronica-aruba/utils';

  // Setup client
  const client = new ArubaClient({
    environment: 'demo', // o 'production'
  });

  // Autenticazione
  await client.auth.signin('username', 'password');

  // Invio fattura
  const invoices = new InvoicesClient(client.http);
  const result = await invoices.upload({
    dataFile: encodeBase64(xmlContent),
  });

  console.log('Fattura inviata:', result.uploadFileName);
  ```
  :::
::

::u-page-section
#title
Pacchetti

#default
| Pacchetto | Descrizione |
|-----------|-------------|
| `@fatturazione-elettronica-aruba/core` | Client HTTP, autenticazione, tipi base |
| `@fatturazione-elettronica-aruba/invoices` | Gestione fatture (invio/ricezione) |
| `@fatturazione-elettronica-aruba/notifications` | Notifiche SDI |
| `@fatturazione-elettronica-aruba/communications` | Comunicazioni finanziarie |
| `@fatturazione-elettronica-aruba/utils` | Utilities (Base64, date, costanti) |
::
