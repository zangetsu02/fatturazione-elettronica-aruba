/**
 * Export all validation rules
 */

// Anagrafica rules (SDI: 00401, 00403, 00411)
export {
  validateIdFiscaleIVA,
  validateCodiceFiscale,
  validatePecDestinatario,
  validateCodiceDestinatario,
  validateIdentificativoFiscalePresente,
} from './anagrafica.rules';
export type {
  IdFiscaleIVA as RuleIdFiscaleIVA,
  AnagraficaRulesResult,
} from './anagrafica.rules';

// Importi rules
export {
  validateImporto,
  validateAliquotaIVA,
  validateQuantita,
  validateNumeroLinea,
  validateCoerenzaPrezzi,
  validateImpostaRiepilogo,
} from './importi.rules';
export type { ImportiRulesResult } from './importi.rules';

// Pagamenti rules
export {
  validateIBAN,
  validateBIC,
  validateABI,
  validateCAB,
  validateModalitaPagamento,
  validateCoerenzaPagamento,
  validateDatePagamento,
  validateImportoPagamento,
} from './pagamenti.rules';
export type { PagamentiRulesResult } from './pagamenti.rules';

// Coerenza rules (SDI: 00419, 00420)
export {
  validateCoerenzaRitenuta,
  validateCoerenzaCassaPrevidenziale,
  validateNatura,
  validateTipoDocumento,
  validateCoerenzaEsigibilita,
  validateCoerenzaTipoDocumentoImporti,
  validateRiferimentoNormativo,
  validateBolloVirtuale,
} from './coerenza.rules';
export type {
  CoerenzaRulesResult,
  DatiRitenuta as RuleDatiRitenuta,
  DatiCassaPrevidenziale as RuleDatiCassaPrevidenziale,
  DettaglioLinea as RuleDettaglioLinea,
} from './coerenza.rules';
