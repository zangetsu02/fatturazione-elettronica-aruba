/**
 * Regole di validazione per dati anagrafici e identificativi fiscali
 * Implementa controlli per codici errore SDI: 00401, 00403, 00411
 */

import {
  ID_PAESE_PATTERN,
  ID_CODICE_PATTERN,
  CODICE_FISCALE_PATTERN,
  CODICE_FISCALE_PERSONA_FISICA_PATTERN,
  PARTITA_IVA_IT_PATTERN,
  PEC_PATTERN,
  CODICE_DESTINATARIO_PA_PATTERN,
  CODICE_DESTINATARIO_B2B_PATTERN,
} from '../patterns';
import type { ValidationError } from '../FatturaValidator';

export interface IdFiscaleIVA {
  idPaese: string;
  idCodice: string;
}

export interface AnagraficaRulesResult {
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Valida IdFiscaleIVA secondo XSD e SDI (codice errore 00401)
 */
export function validateIdFiscaleIVA(
  idFiscale: IdFiscaleIVA | undefined,
  path: string,
  isItalian: boolean = true
): AnagraficaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!idFiscale) {
    return { errors, warnings };
  }

  // Validazione IdPaese
  if (!idFiscale.idPaese) {
    errors.push({
      path: `${path}.idPaese`,
      message: 'IdPaese è richiesto',
      code: 'REQUIRED',
    });
  } else if (!ID_PAESE_PATTERN.test(idFiscale.idPaese)) {
    errors.push({
      path: `${path}.idPaese`,
      message: 'IdPaese deve essere un codice ISO 3166-1 alpha-2 (2 lettere maiuscole)',
      code: '00401',
    });
  }

  // Validazione IdCodice
  if (!idFiscale.idCodice) {
    errors.push({
      path: `${path}.idCodice`,
      message: 'IdCodice è richiesto',
      code: 'REQUIRED',
    });
  } else if (!ID_CODICE_PATTERN.test(idFiscale.idCodice)) {
    errors.push({
      path: `${path}.idCodice`,
      message: 'IdCodice deve contenere solo caratteri alfanumerici (max 28)',
      code: '00401',
    });
  }

  // Validazione specifica per Italia
  if (isItalian && idFiscale.idPaese === 'IT' && idFiscale.idCodice) {
    if (!PARTITA_IVA_IT_PATTERN.test(idFiscale.idCodice)) {
      errors.push({
        path: `${path}.idCodice`,
        message: 'Partita IVA italiana deve essere composta da 11 cifre numeriche',
        code: '00401',
      });
    }
  }

  return { errors, warnings };
}

/**
 * Valida Codice Fiscale secondo XSD e SDI (codice errore 00403)
 */
export function validateCodiceFiscale(
  codiceFiscale: string | undefined,
  path: string
): AnagraficaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!codiceFiscale) {
    return { errors, warnings };
  }

  // Validazione pattern base XSD
  if (!CODICE_FISCALE_PATTERN.test(codiceFiscale)) {
    errors.push({
      path,
      message: 'Codice Fiscale deve contenere da 11 a 16 caratteri alfanumerici',
      code: '00403',
    });
    return { errors, warnings };
  }

  // Validazione specifica per lunghezza
  if (codiceFiscale.length === 16) {
    // Persona fisica - validazione pattern completo
    if (!CODICE_FISCALE_PERSONA_FISICA_PATTERN.test(codiceFiscale)) {
      errors.push({
        path,
        message: 'Codice Fiscale persona fisica non rispetta il formato previsto',
        code: '00403',
      });
    }
  } else if (codiceFiscale.length === 11) {
    // Persona giuridica - deve essere numerico
    if (!PARTITA_IVA_IT_PATTERN.test(codiceFiscale)) {
      errors.push({
        path,
        message: 'Codice Fiscale persona giuridica deve essere composto da 11 cifre numeriche',
        code: '00403',
      });
    }
  } else {
    // Lunghezza non standard (tra 11 e 16, ma non esattamente uno dei due)
    warnings.push({
      path,
      message: `Codice Fiscale con lunghezza ${codiceFiscale.length} potrebbe non essere valido`,
      code: '00403_WARNING',
    });
  }

  return { errors, warnings };
}

/**
 * Valida PEC Destinatario secondo SDI (codice errore 00411)
 */
export function validatePecDestinatario(
  pecDestinatario: string | undefined,
  codiceDestinatario: string | undefined,
  path: string
): AnagraficaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Regola SDI 00411: Se CodiceDestinatario = "0000000", PECDestinatario è obbligatorio
  if (codiceDestinatario === '0000000') {
    if (!pecDestinatario) {
      errors.push({
        path: `${path}.pecDestinatario`,
        message: 'PECDestinatario è obbligatorio quando CodiceDestinatario è 0000000',
        code: '00411',
      });
    } else if (!PEC_PATTERN.test(pecDestinatario)) {
      errors.push({
        path: `${path}.pecDestinatario`,
        message: 'PECDestinatario deve essere un indirizzo email valido',
        code: '00411',
      });
    }
  }

  // Validazione formato PEC se presente
  if (pecDestinatario && !PEC_PATTERN.test(pecDestinatario)) {
    errors.push({
      path: `${path}.pecDestinatario`,
      message: 'PECDestinatario deve essere un indirizzo email valido',
      code: 'INVALID_PEC',
    });
  }

  return { errors, warnings };
}

/**
 * Valida CodiceDestinatario secondo formato trasmissione
 */
export function validateCodiceDestinatario(
  codiceDestinatario: string | undefined,
  formatoTrasmissione: string | undefined,
  path: string
): AnagraficaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!codiceDestinatario) {
    errors.push({
      path,
      message: 'CodiceDestinatario è richiesto',
      code: 'REQUIRED',
    });
    return { errors, warnings };
  }

  if (formatoTrasmissione === 'FPA12') {
    // PA: 6 caratteri alfanumerici
    if (!CODICE_DESTINATARIO_PA_PATTERN.test(codiceDestinatario)) {
      errors.push({
        path,
        message: 'CodiceDestinatario per PA deve essere di 6 caratteri alfanumerici maiuscoli',
        code: 'INVALID_CODICE_DESTINATARIO_PA',
      });
    }
  } else if (formatoTrasmissione === 'FPR12') {
    // B2B: 7 caratteri alfanumerici o 0000000
    if (
      !CODICE_DESTINATARIO_B2B_PATTERN.test(codiceDestinatario) &&
      codiceDestinatario !== '0000000'
    ) {
      errors.push({
        path,
        message:
          'CodiceDestinatario per B2B deve essere di 7 caratteri alfanumerici maiuscoli o 0000000',
        code: 'INVALID_CODICE_DESTINATARIO_B2B',
      });
    }
  }

  return { errors, warnings };
}

/**
 * Valida che almeno uno tra IdFiscaleIVA e CodiceFiscale sia presente
 */
export function validateIdentificativoFiscalePresente(
  idFiscaleIVA: IdFiscaleIVA | undefined,
  codiceFiscale: string | undefined,
  path: string
): AnagraficaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!idFiscaleIVA && !codiceFiscale) {
    errors.push({
      path,
      message: 'Almeno uno tra IdFiscaleIVA e CodiceFiscale è richiesto',
      code: 'MISSING_FISCAL_ID',
    });
  }

  return { errors, warnings };
}
