# @fatturazione-elettronica-aruba/nuxt

## 0.3.0

### Minor Changes

- ad9bed9: feat(core,nuxt): autenticazione automatica trasparente (interceptor + retry su 401)

  Elimina il race su cold start (la prima richiesta poteva partire senza token) e
  rende superfluo chiamare `signIn`/`ensureAuthenticated` a mano.

  **core**
  - `HttpClient`: interceptor pre-richiesta (`setRequestInterceptor`) che garantisce
    un token valido prima di costruire gli header, e retry reattivo su `401`
    (`setOnUnauthorized`) con ricostruzione della richiesta. Nuova opzione
    `RequestOptions.skipAuth` (usata dalle chiamate di auth per evitare ricorsione).
  - `AuthClient`: nuovi `ensureAuthenticated(user?, pass?)` (idempotente, dedup delle
    chiamate concorrenti, refresh→signIn), `reauthenticate()` (per il 401),
    `setCredentials()`. `signIn`/`refresh` usano `skipAuth`. Le credenziali possono
    essere passate via `AuthClientOptions`.
  - `ArubaClient`: nuove opzioni `username`/`password`; se fornite, il client si
    autentica e rinnova il token **da solo a ogni richiesta** — wiring automatico di
    interceptor e handler 401.

  **nuxt**
  - Le composable server (`useArubaClient`, `useArubaInvoices`, …) non fanno più
    sign-in fire-and-forget: il client riceve le credenziali in costruzione e
    l'autenticazione avviene per-richiesta tramite l'interceptor del core. Risolve il
    "not authenticated" intermittente a freddo.
  - Nuove opzioni modulo `autoRefresh` / `refreshMargin` e util `setArubaTokenStorage`
    per fornire un TokenStorage condiviso (KV/Redis/DB) ed evitare una signIn a ogni
    cold start su serverless.

  Modifiche retrocompatibili a livello di firma; cambia il comportamento (l'auth è ora
  gestita dal trasporto invece che da chiamate esplicite).

### Patch Changes

- Updated dependencies [ad9bed9]
  - @fatturazione-elettronica-aruba/core@0.3.0
  - @fatturazione-elettronica-aruba/communications@0.2.1
  - @fatturazione-elettronica-aruba/invoices@0.2.1
  - @fatturazione-elettronica-aruba/notifications@0.2.1

## 0.2.1

### Patch Changes

- Updated dependencies
  - @fatturazione-elettronica-aruba/xml-builder@0.3.0

## 0.1.1

### Patch Changes

- remove duplicate server export causing import warnings

## 0.1.0

### Minor Changes

- feat: alpha version
