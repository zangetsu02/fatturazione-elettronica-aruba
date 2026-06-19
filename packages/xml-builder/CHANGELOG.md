# @fatturazione-elettronica-aruba/xml-builder

## 0.3.0

### Minor Changes

- feat(xml-builder): auto-calcolo riepilogo IVA, helper anagrafici e serializer robusto ai tipi

  Semplifica drasticamente la costruzione delle fatture e riduce le classi di errori fiscali:
  - **Auto-calcolo dei totali**: `addLinea`/`setDettaglioLinee` sul builder numerano le linee, calcolano `PrezzoTotale` e generano automaticamente `DatiRiepilogo` (raggruppati per aliquota + natura) e `ImportoTotaleDocumento` in `build()`. Aggiunta anche la utility pura `calcolaRiepilogo`.
  - **Serializer robusto ai tipi** (fix): `escapeXml` e `formatDecimal` ora coercizzano i valori — i `number` passati dove sono attese stringhe (es. P.IVA/CAP dal database) non fanno più crashare la serializzazione. `Quantita` mantiene 2–8 decimali invece di troncare a 2.
  - **Helper anagrafici a campi piatti**: `cedentePrestatore`, `cessionario`, `sede`, `contatti` evitano la costruzione manuale di oggetti annidati.
  - **Convenienza builder**: `validate()`, `toXml()`, `toResult()` (oggetto + XML + validazione + nome file SDI) e utility `nomeFileSdi`, `toNumber`, `round2`, `calcolaPrezzoTotale`, `setEsigibilitaIVA`. `build()` è ora ripetibile (non muta lo stato).

  Tutte le modifiche sono retrocompatibili.

## 0.1.0

### Minor Changes

- feat: alpha version
- chore: remove JSDoc comments from FatturaValidator.ts for cleaner code
- refactor: simplify section separator comments in validation classes
