/**
 * Regole di validazione per importi, aliquote e quantità
 * Basate su XSD Schema v1.2.3
 */

import { NUMERO_LINEA_MIN, NUMERO_LINEA_MAX } from '../patterns';
import type { ValidationError } from '../FatturaValidator';

export interface ImportiRulesResult {
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Valida che un importo abbia esattamente 2 decimali
 * XSD: [\-]?[0-9]{1,11}\.[0-9]{2}
 */
export function validateImporto(
  value: number | undefined,
  path: string,
  fieldName: string,
  required: boolean = true
): ImportiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (value === undefined || value === null) {
    if (required) {
      errors.push({
        path,
        message: `${fieldName} è richiesto`,
        code: 'REQUIRED',
      });
    }
    return { errors, warnings };
  }

  // Verifica range numerico
  const absValue = Math.abs(value);
  if (absValue > 99999999999.99) {
    errors.push({
      path,
      message: `${fieldName} supera il valore massimo consentito (99999999999.99)`,
      code: 'MAX_VALUE_EXCEEDED',
    });
  }

  // Verifica decimali (warning se più di 2 decimali, verranno troncati)
  const decimalPart = value.toString().split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    warnings.push({
      path,
      message: `${fieldName} ha più di 2 decimali, verrà arrotondato`,
      code: 'DECIMAL_PRECISION',
    });
  }

  return { errors, warnings };
}

/**
 * Valida un'aliquota IVA (0-100 con 2 decimali)
 * XSD: [0-9]{1,3}\.[0-9]{2}
 */
export function validateAliquotaIVA(
  value: number | undefined,
  path: string,
  required: boolean = true
): ImportiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (value === undefined || value === null) {
    if (required) {
      errors.push({
        path,
        message: 'AliquotaIVA è richiesto',
        code: 'REQUIRED',
      });
    }
    return { errors, warnings };
  }

  // Range 0-100
  if (value < 0 || value > 100) {
    errors.push({
      path,
      message: 'AliquotaIVA deve essere compresa tra 0 e 100',
      code: 'INVALID_ALIQUOTA_RANGE',
    });
  }

  // Aliquote standard italiane (warning se non standard)
  const aliquoteStandard = [0, 4, 5, 10, 22];
  if (!aliquoteStandard.includes(value)) {
    warnings.push({
      path,
      message: `AliquotaIVA ${value}% non è tra le aliquote standard italiane (0, 4, 5, 10, 22)`,
      code: 'NON_STANDARD_ALIQUOTA',
    });
  }

  return { errors, warnings };
}

/**
 * Valida una quantità con 2-8 decimali
 * XSD: [\-]?[0-9]{1,12}\.[0-9]{2,8}
 */
export function validateQuantita(
  value: number | undefined,
  path: string
): ImportiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (value === undefined || value === null) {
    return { errors, warnings };
  }

  // Verifica range
  const absValue = Math.abs(value);
  if (absValue > 999999999999.99999999) {
    errors.push({
      path,
      message: 'Quantità supera il valore massimo consentito',
      code: 'MAX_VALUE_EXCEEDED',
    });
  }

  return { errors, warnings };
}

/**
 * Valida NumeroLinea (range 1-9999)
 */
export function validateNumeroLinea(
  value: number | undefined,
  path: string
): ImportiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (value === undefined || value === null) {
    errors.push({
      path,
      message: 'NumeroLinea è richiesto',
      code: 'REQUIRED',
    });
    return { errors, warnings };
  }

  if (!Number.isInteger(value)) {
    errors.push({
      path,
      message: 'NumeroLinea deve essere un numero intero',
      code: 'INVALID_INTEGER',
    });
    return { errors, warnings };
  }

  if (value < NUMERO_LINEA_MIN || value > NUMERO_LINEA_MAX) {
    errors.push({
      path,
      message: `NumeroLinea deve essere compreso tra ${NUMERO_LINEA_MIN} e ${NUMERO_LINEA_MAX}`,
      code: 'INVALID_NUMERO_LINEA_RANGE',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza tra PrezzoUnitario, Quantità e PrezzoTotale
 */
export function validateCoerenzaPrezzi(
  prezzoUnitario: number | undefined,
  quantita: number | undefined,
  prezzoTotale: number | undefined,
  scontoMaggiorazione: Array<{ tipo: string; percentuale?: number; importo?: number }> | undefined,
  path: string
): ImportiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (
    prezzoUnitario === undefined ||
    prezzoTotale === undefined
  ) {
    return { errors, warnings };
  }

  // Calcola prezzo atteso
  const qty = quantita ?? 1;
  let expectedTotal = prezzoUnitario * qty;

  // Applica sconti/maggiorazioni se presenti
  if (scontoMaggiorazione && scontoMaggiorazione.length > 0) {
    for (const sm of scontoMaggiorazione) {
      if (sm.tipo === 'SC') {
        // Sconto
        if (sm.percentuale !== undefined) {
          expectedTotal -= (expectedTotal * sm.percentuale) / 100;
        } else if (sm.importo !== undefined) {
          expectedTotal -= sm.importo;
        }
      } else if (sm.tipo === 'MG') {
        // Maggiorazione
        if (sm.percentuale !== undefined) {
          expectedTotal += (expectedTotal * sm.percentuale) / 100;
        } else if (sm.importo !== undefined) {
          expectedTotal += sm.importo;
        }
      }
    }
  }

  // Tolleranza per arrotondamenti (0.01)
  const diff = Math.abs(expectedTotal - prezzoTotale);
  if (diff > 0.01) {
    warnings.push({
      path: `${path}.prezzoTotale`,
      message: `PrezzoTotale (${prezzoTotale.toFixed(2)}) non corrisponde al calcolo atteso (${expectedTotal.toFixed(2)})`,
      code: 'PREZZO_TOTALE_MISMATCH',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza imposta calcolata vs dichiarata nel riepilogo
 */
export function validateImpostaRiepilogo(
  imponibileImporto: number,
  aliquotaIVA: number,
  imposta: number,
  path: string
): ImportiRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const expectedImposta = (imponibileImporto * aliquotaIVA) / 100;
  const diff = Math.abs(expectedImposta - imposta);

  // Tolleranza 0.01 per arrotondamenti
  if (diff > 0.01) {
    warnings.push({
      path: `${path}.imposta`,
      message: `Imposta (${imposta.toFixed(2)}) non corrisponde al calcolo atteso (${expectedImposta.toFixed(2)}) per aliquota ${aliquotaIVA}%`,
      code: 'IMPOSTA_MISMATCH',
    });
  }

  return { errors, warnings };
}
