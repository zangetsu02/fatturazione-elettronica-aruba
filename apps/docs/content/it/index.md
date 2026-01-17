---
seo:
  title: Fatturazione Elettronica Aruba SDK - TypeScript
  description: SDK TypeScript per l'integrazione con le API di Fatturazione Elettronica Aruba v2. Invio, ricezione e gestione fatture elettroniche.
---

::u-page-hero
#title
SDK TypeScript per Fatturazione Elettronica Aruba.

#description
Integra le API di Fatturazione Elettronica Aruba v2 nel tuo progetto Node.js. :br Invia e ricevi fatture elettroniche, gestisci notifiche SDI e comunicazioni AdE.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /it/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Inizia Subito
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
  v1.0.0 - API Aruba v2
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
      ```typescript [Esempio Completo]
      import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
      import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
      import { encodeBase64 } from '@fatturazione-elettronica-aruba/utils';

      // 1. Inizializza il client
      const client = new ArubaClient({ environment: 'production' });

      // 2. Autenticazione OAuth2 (token gestito automaticamente)
      await client.auth.signIn(process.env.ARUBA_USERNAME, process.env.ARUBA_PASSWORD);

      // 3. Invia una fattura al Sistema di Interscambio
      const invoices = new InvoicesClient(client.http);
      const result = await invoices.upload({
        dataFile: encodeBase64(fs.readFileSync('fattura.xml', 'utf-8')),
      });

      console.log('Fattura inviata:', result.uploadFileName);
      // Output: IT01234567890_00001.xml
      ```
      :::::

    #title
    Integrazione [completa]{.text-primary} in poche righe

    #description
    Dall'autenticazione all'invio fatture: tutto il necessario per integrare la fatturazione elettronica nel tuo gestionale o applicazione.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /it/guides/invoices
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      // Invia fattura attiva
      await invoices.upload({
        dataFile: encodeBase64(xml),
        dryRun: false, // true per validare
      });

      // Cerca fatture inviate
      const sent = await invoices.findSent({
        creationStartDate: '2024-01-01',
        creationEndDate: '2024-12-31',
      });

      // Scarica XML fattura
      const xml = await invoices.downloadSent({
        filename: 'IT123_00001.xml',
      });
      ```
      :::::

    #title
    [Fatture Attive]{.text-primary}

    #description
    Invio fatture firmate e non firmate. Validazione con dry-run, ricerca avanzata e download XML originale.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /it/guides/invoices
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      // Cerca fatture ricevute
      const received = await invoices.findReceived({
        creationStartDate: '2024-01-01',
        creationEndDate: '2024-12-31',
        senderVatCode: '01234567890',
      });

      // Scarica fattura passiva
      const xml = await invoices.downloadReceived({
        filename: received.content[0].filename,
      });

      // Invia esito committente
      await invoices.sendOutcome({
        filename: 'IT123_00001.xml',
        outcome: 'accepted', // o 'rejected'
      });
      ```
      :::::

    #title
    [Fatture Passive]{.text-primary}

    #description
    Ricerca e download fatture ricevute. Gestione esiti committente con accettazione o rifiuto.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 md:col-span-1
    to: /it/guides/notifications
    ---
      :::::div{.flex.flex-col.gap-2.py-2}
        ::::::div{.flex.items-center.gap-2.p-2.bg-green-500/10.rounded.text-green-600.dark:text-green-400}
        :icon{name="i-lucide-check-circle" .size-5}
        **RC** - Ricevuta di Consegna
        ::::::

        ::::::div{.flex.items-center.gap-2.p-2.bg-yellow-500/10.rounded.text-yellow-600.dark:text-yellow-400}
        :icon{name="i-lucide-alert-triangle" .size-5}
        **MC** - Mancata Consegna
        ::::::

        ::::::div{.flex.items-center.gap-2.p-2.bg-red-500/10.rounded.text-red-600.dark:text-red-400}
        :icon{name="i-lucide-x-circle" .size-5}
        **NS** - Notifica di Scarto
        ::::::

        ::::::div{.flex.items-center.gap-2.p-2.bg-blue-500/10.rounded.text-blue-600.dark:text-blue-400}
        :icon{name="i-lucide-clock" .size-5}
        **DT** - Decorrenza Termini
        ::::::
      :::::

    #title
    [Notifiche SDI]{.text-primary}

    #description
    Monitora lo stato delle fatture con tutte le notifiche del Sistema di Interscambio.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 md:col-span-1
    to: /it/guides/authentication
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      // Login OAuth2
      const auth = await client.auth.signIn(
        username,
        password
      );

      // Token refresh automatico
      // oppure manuale:
      await client.auth.refresh();

      // Info utente e account
      const user = await client.auth.getUserInfo();
      console.log(user.vatCode);
      console.log(user.accountStatus);

      // Multicedenti (Premium)
      const companies = await client.auth
        .getMulticedenti();
      ```
      :::::

    #title
    [Autenticazione]{.text-primary} OAuth2

    #description
    Gestione completa del ciclo di vita dei token con refresh automatico. Supporto multicedenti per intermediari.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    ---
      :::::tabs
        ::::::tabs-item{icon="i-simple-icons-pnpm" label="pnpm"}
        ```bash
        # Core + Fatture (uso comune)
        pnpm add @fatturazione-elettronica-aruba/core @fatturazione-elettronica-aruba/invoices

        # Aggiungi notifiche
        pnpm add @fatturazione-elettronica-aruba/notifications

        # Aggiungi comunicazioni (liquidazioni IVA, etc.)
        pnpm add @fatturazione-elettronica-aruba/communications

        # Utilities opzionali
        pnpm add @fatturazione-elettronica-aruba/utils
        ```
        ::::::

        ::::::tabs-item{icon="i-simple-icons-npm" label="npm"}
        ```bash
        # Core + Fatture (uso comune)
        npm install @fatturazione-elettronica-aruba/core @fatturazione-elettronica-aruba/invoices

        # Aggiungi notifiche
        npm install @fatturazione-elettronica-aruba/notifications

        # Aggiungi comunicazioni (liquidazioni IVA, etc.)
        npm install @fatturazione-elettronica-aruba/communications

        # Utilities opzionali
        npm install @fatturazione-elettronica-aruba/utils
        ```
        ::::::
      :::::

    #title
    Architettura [Modulare]{.text-primary}

    #description
    Installa solo i pacchetti necessari. Il `core` è sempre richiesto, gli altri dipendono dalle funzionalità che ti servono.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    ---
      :::::div{.flex.flex-col.gap-2.py-2}
        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Tipizzazione TypeScript completa
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Supporto ESM e CommonJS
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Zero dipendenze runtime
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Ambiente demo e produzione
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-check" .size-5.text-primary}
        Errori tipizzati e descrittivi
        ::::::
      :::::

    #title
    Progettato per [Sviluppatori]{.text-primary}

    #description
    API moderna con autocompletamento intelligente, errori chiari e documentazione inline.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /it/guides/communications
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      import { CommunicationsClient } from
        '@fatturazione-elettronica-aruba/communications';

      const comms = new CommunicationsClient(client.http);

      // Liquidazione IVA trimestrale
      await comms.uploadLiquidazione({
        dataFile: encodeBase64(liquidazioneXml),
      });

      // Dati fatture (esterometro)
      await comms.uploadDatiFatture({
        dataFile: encodeBase64(datiFattureXml),
      });
      ```
      :::::

    #title
    [Comunicazioni]{.text-primary} AdE

    #description
    Invio liquidazioni IVA periodiche e comunicazioni dati fatture all'Agenzia delle Entrate.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /it/integrations/nuxt
    ---
      :::::div{.bg-elevated.rounded-lg.p-3.overflow-x-auto}
      ```typescript
      // nuxt.config.ts
      export default defineNuxtConfig({
        modules: [
          '@fatturazione-elettronica-aruba/nuxt'
        ],
        fatturazioneAruba: {
          environment: 'production',
        },
      });

      // server/api/invoices.get.ts
      export default defineEventHandler(async () => {
        const invoices = useArubaInvoices();
        return await invoices.findSent({...});
      });
      ```
      :::::

    #title
    [Nuxt]{.text-primary} Module

    #description
    Integrazione nativa con Nuxt. Composables server-side auto-importati, configurazione semplificata e autenticazione automatica.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /it/api-reference/errors
    ---
      :::::div{.flex.flex-col.gap-2.py-2}
        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-shield-alert" .size-5.text-red-500}
        `AuthenticationError` - Credenziali invalide
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-file-warning" .size-5.text-yellow-500}
        `ValidationError` - Errore validazione
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-server-crash" .size-5.text-orange-500}
        `ArubaApiError` - Errore API generico
        ::::::

        ::::::div{.flex.items-center.gap-3.p-2}
        :icon{name="i-lucide-wifi-off" .size-5.text-gray-500}
        `NetworkError` - Errore di rete
        ::::::
      :::::

    #title
    Gestione [Errori]{.text-primary}

    #description
    Ogni tipo di errore ha la sua classe dedicata con codice, messaggio e dettagli strutturati.
    ::::
  :::
::
