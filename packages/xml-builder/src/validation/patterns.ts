/**
 * Regex patterns based on FatturaPA XSD Schema v1.2.3
 * @see https://www.fatturapa.gov.it/export/documenti/fatturapa/v1.4/Schema_VFPR12_v1.2.3.xsd
 */

// ============================================================================
// IDENTIFICATIVI FISCALI
// ============================================================================

/**
 * IdPaese - Codice ISO 3166-1 alpha-2
 * XSD: [A-Z]{2}
 */
export const ID_PAESE_PATTERN = /^[A-Z]{2}$/;

/**
 * IdCodice per IdFiscaleIVA
 * XSD: [A-Za-z0-9]{1,28}
 */
export const ID_CODICE_PATTERN = /^[A-Za-z0-9]{1,28}$/;

/**
 * Codice Fiscale italiano
 * XSD: [A-Z0-9]{11,16}
 * - Persone fisiche: 16 caratteri (pattern specifico)
 * - Persone giuridiche: 11 cifre numeriche
 */
export const CODICE_FISCALE_PATTERN = /^[A-Z0-9]{11,16}$/;

/**
 * Codice Fiscale persona fisica (pattern completo)
 * 6 lettere + 2 cifre + 1 lettera + 2 cifre + 1 lettera + 3 cifre + 1 lettera
 */
export const CODICE_FISCALE_PERSONA_FISICA_PATTERN =
  /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;

/**
 * Partita IVA italiana (11 cifre)
 */
export const PARTITA_IVA_IT_PATTERN = /^[0-9]{11}$/;

// ============================================================================
// PAGAMENTI E COORDINATE BANCARIE
// ============================================================================

/**
 * IBAN
 * XSD: [a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{11,30}
 */
export const IBAN_PATTERN = /^[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{11,30}$/;

/**
 * BIC/SWIFT
 * XSD: [A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?
 * 8 o 11 caratteri
 */
export const BIC_PATTERN = /^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$/;

/**
 * ABI (5 cifre)
 */
export const ABI_PATTERN = /^[0-9]{5}$/;

/**
 * CAB (5 cifre)
 */
export const CAB_PATTERN = /^[0-9]{5}$/;

// ============================================================================
// IMPORTI E QUANTITÀ
// ============================================================================

/**
 * Importo con 2 decimali obbligatori
 * XSD: [\-]?[0-9]{1,11}\.[0-9]{2}
 * Range: -99999999999.99 a 99999999999.99
 */
export const IMPORTO_PATTERN = /^-?[0-9]{1,11}\.[0-9]{2}$/;

/**
 * Aliquota IVA (percentuale 0-100 con 2 decimali)
 * XSD: [0-9]{1,3}\.[0-9]{2}
 */
export const ALIQUOTA_PATTERN = /^[0-9]{1,3}\.[0-9]{2}$/;

/**
 * Quantità con 2-8 decimali
 * XSD: [\-]?[0-9]{1,12}\.[0-9]{2,8}
 */
export const QUANTITA_PATTERN = /^-?[0-9]{1,12}\.[0-9]{2,8}$/;

// ============================================================================
// DATE E PROGRESSIVI
// ============================================================================

/**
 * Data formato YYYY-MM-DD
 */
export const DATA_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

/**
 * ProgressivoInvio (max 10 caratteri alfanumerici)
 * XSD: [a-zA-Z0-9]{1,10}
 */
export const PROGRESSIVO_INVIO_PATTERN = /^[a-zA-Z0-9]{1,10}$/;

// ============================================================================
// CODICI DESTINATARIO
// ============================================================================

/**
 * Codice Destinatario PA (6 caratteri)
 * XSD: [A-Z0-9]{6}
 */
export const CODICE_DESTINATARIO_PA_PATTERN = /^[A-Z0-9]{6}$/;

/**
 * Codice Destinatario B2B (7 caratteri)
 * XSD: [A-Z0-9]{7}
 */
export const CODICE_DESTINATARIO_B2B_PATTERN = /^[A-Z0-9]{7}$/;

/**
 * PEC email pattern (semplificato)
 */
export const PEC_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ============================================================================
// ALTRI PATTERN
// ============================================================================

/**
 * CAP italiano (5 cifre)
 */
export const CAP_IT_PATTERN = /^[0-9]{5}$/;

/**
 * Divisa ISO 4217 (3 lettere maiuscole)
 */
export const DIVISA_PATTERN = /^[A-Z]{3}$/;

/**
 * Numero documento (max 20 caratteri)
 * XSD: [a-zA-Z0-9]{1,20}
 */
export const NUMERO_DOCUMENTO_PATTERN = /^.{1,20}$/;

// ============================================================================
// ENUM SETS (per validazione rapida)
// ============================================================================

/**
 * Codici Natura validi (XSD v1.2.3)
 */
export const NATURA_VALIDI = new Set([
  'N1',
  'N2',
  'N2.1',
  'N2.2',
  'N3',
  'N3.1',
  'N3.2',
  'N3.3',
  'N3.4',
  'N3.5',
  'N3.6',
  'N4',
  'N5',
  'N6',
  'N6.1',
  'N6.2',
  'N6.3',
  'N6.4',
  'N6.5',
  'N6.6',
  'N6.7',
  'N6.8',
  'N6.9',
  'N7',
]);

/**
 * Codici Natura deprecati (warning, non errore)
 */
export const NATURA_DEPRECATI = new Set(['N2', 'N3', 'N6']);

/**
 * TipoDocumento validi
 */
export const TIPO_DOCUMENTO_VALIDI = new Set([
  'TD01',
  'TD02',
  'TD03',
  'TD04',
  'TD05',
  'TD06',
  'TD07',
  'TD08',
  'TD09',
  'TD16',
  'TD17',
  'TD18',
  'TD19',
  'TD20',
  'TD21',
  'TD22',
  'TD23',
  'TD24',
  'TD25',
  'TD26',
  'TD27',
  'TD28',
]);

/**
 * ModalitaPagamento validi
 */
export const MODALITA_PAGAMENTO_VALIDI = new Set([
  'MP01',
  'MP02',
  'MP03',
  'MP04',
  'MP05',
  'MP06',
  'MP07',
  'MP08',
  'MP09',
  'MP10',
  'MP11',
  'MP12',
  'MP13',
  'MP14',
  'MP15',
  'MP16',
  'MP17',
  'MP18',
  'MP19',
  'MP20',
  'MP21',
  'MP22',
  'MP23',
]);

/**
 * RegimeFiscale validi
 */
export const REGIME_FISCALE_VALIDI = new Set([
  'RF01',
  'RF02',
  'RF04',
  'RF05',
  'RF06',
  'RF07',
  'RF08',
  'RF09',
  'RF10',
  'RF11',
  'RF12',
  'RF13',
  'RF14',
  'RF15',
  'RF16',
  'RF17',
  'RF18',
  'RF19',
]);

/**
 * FormatoTrasmissione validi
 */
export const FORMATO_TRASMISSIONE_VALIDI = new Set(['FPA12', 'FPR12', 'FSM10']);

// ============================================================================
// LIMITI NUMERICI
// ============================================================================

/**
 * NumeroLinea: 1-9999
 */
export const NUMERO_LINEA_MIN = 1;
export const NUMERO_LINEA_MAX = 9999;

/**
 * Lunghezze massime campi
 */
export const MAX_LENGTH = {
  progressivoInvio: 10,
  numeroDocumento: 20,
  descrizioneLinea: 1000,
  causale: 200,
  denominazione: 80,
  nome: 60,
  cognome: 60,
  indirizzo: 60,
  comune: 60,
  provincia: 2,
  riferimentoNormativo: 100,
} as const;
