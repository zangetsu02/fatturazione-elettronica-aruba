/**
 * Regole di validazione per dati di pagamento
 * Basate su XSD Schema v1.2.3
 */

import {
  IBAN_PATTERN,
  BIC_PATTERN,
  ABI_PATTERN,
  CAB_PATTERN,
  MODALITA_PAGAMENTO_VALIDI,
} from '../patterns';
import type { ValidationError } from '../FatturaValidator';

export interface PagamentiRulesResult {
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Valida IBAN secondo pattern XSD
 * XSD: [a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{11,30}
 */
export function validateIBAN(
  iban: string | undefined,
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!iban) {
    return { errors, warnings };
  }

  // Rimuovi spazi per validazione
  const ibanClean = iban.replace(/\s/g, '');

  if (!IBAN_PATTERN.test(ibanClean)) {
    errors.push({
      path,
      message: 'IBAN non rispetta il formato previsto (2 lettere + 2 cifre + 11-30 caratteri alfanumerici)',
      code: 'INVALID_IBAN',
    });
    return { errors, warnings };
  }

  // Validazione lunghezza IBAN italiano (27 caratteri)
  if (ibanClean.toUpperCase().startsWith('IT') && ibanClean.length !== 27) {
    errors.push({
      path,
      message: 'IBAN italiano deve essere di 27 caratteri',
      code: 'INVALID_IBAN_IT_LENGTH',
    });
  }

  return { errors, warnings };
}

/**
 * Valida BIC/SWIFT secondo pattern XSD
 * XSD: [A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?
 */
export function validateBIC(
  bic: string | undefined,
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!bic) {
    return { errors, warnings };
  }

  if (!BIC_PATTERN.test(bic.toUpperCase())) {
    errors.push({
      path,
      message: 'BIC/SWIFT non rispetta il formato previsto (8 o 11 caratteri)',
      code: 'INVALID_BIC',
    });
  }

  return { errors, warnings };
}

/**
 * Valida ABI (5 cifre)
 */
export function validateABI(
  abi: string | undefined,
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!abi) {
    return { errors, warnings };
  }

  if (!ABI_PATTERN.test(abi)) {
    errors.push({
      path,
      message: 'ABI deve essere composto da 5 cifre numeriche',
      code: 'INVALID_ABI',
    });
  }

  return { errors, warnings };
}

/**
 * Valida CAB (5 cifre)
 */
export function validateCAB(
  cab: string | undefined,
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!cab) {
    return { errors, warnings };
  }

  if (!CAB_PATTERN.test(cab)) {
    errors.push({
      path,
      message: 'CAB deve essere composto da 5 cifre numeriche',
      code: 'INVALID_CAB',
    });
  }

  return { errors, warnings };
}

/**
 * Valida ModalitaPagamento
 */
export function validateModalitaPagamento(
  modalita: string | undefined,
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!modalita) {
    errors.push({
      path,
      message: 'ModalitaPagamento è richiesto',
      code: 'REQUIRED',
    });
    return { errors, warnings };
  }

  if (!MODALITA_PAGAMENTO_VALIDI.has(modalita)) {
    errors.push({
      path,
      message: `ModalitaPagamento '${modalita}' non valido. Valori ammessi: MP01-MP23`,
      code: 'INVALID_MODALITA_PAGAMENTO',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza dati pagamento
 * - Se modalità richiede IBAN, deve essere presente
 * - Se ABI presente, anche CAB deve esserlo e viceversa
 */
export function validateCoerenzaPagamento(
  dettaglioPagamento: {
    modalitaPagamento: string;
    iban?: string;
    abi?: string;
    cab?: string;
    bic?: string;
  },
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const { modalitaPagamento, iban, abi, cab } = dettaglioPagamento;

  // Modalità che richiedono coordinate bancarie
  const modalitaBancarie = [
    'MP05', // Bonifico
    'MP09', // RID
    'MP10', // RID utenze
    'MP11', // RID veloce
    'MP12', // RIBA
    'MP16', // Domiciliazione bancaria
    'MP19', // SEPA Direct Debit
    'MP20', // SEPA Direct Debit CORE
    'MP21', // SEPA Direct Debit B2B
  ];

  if (modalitaBancarie.includes(modalitaPagamento) && !iban) {
    warnings.push({
      path: `${path}.iban`,
      message: `IBAN consigliato per modalità di pagamento ${modalitaPagamento}`,
      code: 'MISSING_IBAN_FOR_MODALITA',
    });
  }

  // Coerenza ABI/CAB
  if (abi && !cab) {
    errors.push({
      path: `${path}.cab`,
      message: 'CAB è richiesto quando ABI è presente',
      code: 'MISSING_CAB',
    });
  }

  if (cab && !abi) {
    errors.push({
      path: `${path}.abi`,
      message: 'ABI è richiesto quando CAB è presente',
      code: 'MISSING_ABI',
    });
  }

  return { errors, warnings };
}

/**
 * Valida date pagamento
 */
export function validateDatePagamento(
  dataScadenzaPagamento: string | undefined,
  dataDocumento: string | undefined,
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!dataScadenzaPagamento || !dataDocumento) {
    return { errors, warnings };
  }

  // Warning se data scadenza è precedente alla data documento
  const scadenza = new Date(dataScadenzaPagamento);
  const documento = new Date(dataDocumento);

  if (scadenza < documento) {
    warnings.push({
      path: `${path}.dataScadenzaPagamento`,
      message: 'Data scadenza pagamento è precedente alla data documento',
      code: 'INVALID_PAYMENT_DATE',
    });
  }

  return { errors, warnings };
}

/**
 * Valida importo pagamento
 */
export function validateImportoPagamento(
  importoPagamento: number | undefined,
  importoTotaleDocumento: number | undefined,
  dettagliPagamentoCount: number,
  isLastDettaglio: boolean,
  sommaPrecedenti: number,
  path: string
): PagamentiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (importoPagamento === undefined) {
    errors.push({
      path,
      message: 'ImportoPagamento è richiesto',
      code: 'REQUIRED',
    });
    return { errors, warnings };
  }

  if (importoPagamento <= 0) {
    warnings.push({
      path,
      message: 'ImportoPagamento dovrebbe essere maggiore di zero',
      code: 'INVALID_IMPORTO_PAGAMENTO',
    });
  }

  // Verifica che la somma dei pagamenti corrisponda al totale documento
  if (isLastDettaglio && importoTotaleDocumento !== undefined) {
    const totPagamenti = sommaPrecedenti + importoPagamento;
    const diff = Math.abs(totPagamenti - importoTotaleDocumento);
    
    if (diff > 0.01) {
      warnings.push({
        path,
        message: `La somma degli importi pagamento (${totPagamenti.toFixed(2)}) non corrisponde all'importo totale documento (${importoTotaleDocumento.toFixed(2)})`,
        code: 'PAGAMENTI_TOTALE_MISMATCH',
      });
    }
  }

  return { errors, warnings };
}
