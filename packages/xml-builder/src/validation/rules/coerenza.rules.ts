/**
 * Regole di validazione per coerenza cross-field
 * Implementa controlli per codici errore SDI: 00419, 00420
 */

import { NATURA_VALIDI, NATURA_DEPRECATI, TIPO_DOCUMENTO_VALIDI } from '../patterns';
import type { ValidationError } from '../FatturaValidator';

export interface CoerenzaRulesResult {
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface DatiRitenuta {
  tipoRitenuta: string;
  importoRitenuta: number;
  aliquotaRitenuta: number;
  causalePagamento: string;
}

export interface DatiCassaPrevidenziale {
  tipoCassa: string;
  alCassa: number;
  importoContributoCassa: number;
  aliquotaIVA: number;
  ritenuta?: 'SI';
  natura?: string;
}

export interface DettaglioLinea {
  numeroLinea: number;
  ritenuta?: 'SI';
  aliquotaIVA: number;
  natura?: string;
}

/**
 * Valida coerenza Ritenuta (codice errore SDI 00419)
 * Se DatiRitenuta è presente, almeno una linea deve avere Ritenuta = "SI"
 */
export function validateCoerenzaRitenuta(
  datiRitenuta: DatiRitenuta | undefined,
  dettaglioLinee: DettaglioLinea[],
  datiCassaPrevidenziale: DatiCassaPrevidenziale[] | undefined,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!datiRitenuta) {
    return { errors, warnings };
  }

  // Verifica che almeno una linea abbia Ritenuta = "SI"
  const hasLineaConRitenuta = dettaglioLinee.some((linea) => linea.ritenuta === 'SI');
  
  // Verifica anche DatiCassaPrevidenziale
  const hasCassaConRitenuta = datiCassaPrevidenziale?.some((cassa) => cassa.ritenuta === 'SI');

  if (!hasLineaConRitenuta && !hasCassaConRitenuta) {
    errors.push({
      path: `${path}.datiRitenuta`,
      message:
        'Se DatiRitenuta è presente, almeno una linea o DatiCassaPrevidenziale deve avere Ritenuta = "SI"',
      code: '00419',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza Cassa Previdenziale (codice errore SDI 00420)
 * Se DatiCassaPrevidenziale ha Ritenuta = "SI", deve esistere DatiRitenuta
 */
export function validateCoerenzaCassaPrevidenziale(
  datiRitenuta: DatiRitenuta | undefined,
  datiCassaPrevidenziale: DatiCassaPrevidenziale[] | undefined,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!datiCassaPrevidenziale || datiCassaPrevidenziale.length === 0) {
    return { errors, warnings };
  }

  // Verifica ogni DatiCassaPrevidenziale con Ritenuta = "SI"
  for (let i = 0; i < datiCassaPrevidenziale.length; i++) {
    const cassa = datiCassaPrevidenziale[i];
    if (cassa && cassa.ritenuta === 'SI' && !datiRitenuta) {
      errors.push({
        path: `${path}.datiCassaPrevidenziale[${i}]`,
        message:
          'Se DatiCassaPrevidenziale ha Ritenuta = "SI", deve essere presente anche DatiRitenuta',
        code: '00420',
      });
    }
  }

  return { errors, warnings };
}

/**
 * Valida Natura operazione
 * - Deve essere un valore valido
 * - Warning per valori deprecati (N2, N3, N6)
 */
export function validateNatura(
  natura: string | undefined,
  aliquotaIVA: number,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Natura richiesta solo se AliquotaIVA = 0
  if (aliquotaIVA === 0) {
    if (!natura) {
      errors.push({
        path,
        message: 'Natura è richiesta quando AliquotaIVA è 0',
        code: 'REQUIRED_WHEN_ZERO_VAT',
      });
      return { errors, warnings };
    }
  }

  if (!natura) {
    return { errors, warnings };
  }

  // Validazione valore
  if (!NATURA_VALIDI.has(natura)) {
    errors.push({
      path,
      message: `Natura '${natura}' non valida. Valori ammessi: N1, N2.1, N2.2, N3.1-N3.6, N4, N5, N6.1-N6.9, N7`,
      code: 'INVALID_NATURA',
    });
    return { errors, warnings };
  }

  // Warning per valori deprecati
  if (NATURA_DEPRECATI.has(natura)) {
    warnings.push({
      path,
      message: `Natura '${natura}' è deprecata. Utilizzare i codici specifici (es. N2.1, N2.2 invece di N2)`,
      code: 'DEPRECATED_NATURA',
    });
  }

  // Coerenza: Natura non deve essere presente se AliquotaIVA > 0
  if (aliquotaIVA > 0 && natura) {
    errors.push({
      path,
      message: 'Natura non deve essere presente quando AliquotaIVA è maggiore di 0',
      code: 'NATURA_WITH_POSITIVE_VAT',
    });
  }

  return { errors, warnings };
}

/**
 * Valida TipoDocumento
 */
export function validateTipoDocumento(
  tipoDocumento: string | undefined,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!tipoDocumento) {
    errors.push({
      path,
      message: 'TipoDocumento è richiesto',
      code: 'REQUIRED',
    });
    return { errors, warnings };
  }

  if (!TIPO_DOCUMENTO_VALIDI.has(tipoDocumento)) {
    errors.push({
      path,
      message: `TipoDocumento '${tipoDocumento}' non valido. Valori ammessi: TD01-TD28`,
      code: 'INVALID_TIPO_DOCUMENTO',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza EsigibilitaIVA con Natura
 * Se EsigibilitaIVA = "S" (scissione), verificare coerenza
 */
export function validateCoerenzaEsigibilita(
  esigibilitaIVA: string | undefined,
  natura: string | undefined,
  aliquotaIVA: number,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!esigibilitaIVA) {
    return { errors, warnings };
  }

  // Valori ammessi
  const esigibilitaValide = ['I', 'D', 'S'];
  if (!esigibilitaValide.includes(esigibilitaIVA)) {
    errors.push({
      path,
      message: `EsigibilitaIVA '${esigibilitaIVA}' non valida. Valori ammessi: I, D, S`,
      code: 'INVALID_ESIGIBILITA',
    });
    return { errors, warnings };
  }

  // Split payment (S) non ha senso con aliquota 0
  if (esigibilitaIVA === 'S' && aliquotaIVA === 0) {
    warnings.push({
      path,
      message: 'EsigibilitaIVA "S" (scissione) con AliquotaIVA 0 potrebbe non essere corretto',
      code: 'SPLIT_PAYMENT_ZERO_VAT',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza TipoDocumento con importi
 * TD04 (Nota di Credito) può avere importi negativi
 */
export function validateCoerenzaTipoDocumentoImporti(
  tipoDocumento: string,
  importoTotale: number | undefined,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (importoTotale === undefined) {
    return { errors, warnings };
  }

  // Note di credito (TD04, TD08) possono avere importi negativi
  const tipiNotaCredito = ['TD04', 'TD08'];

  if (importoTotale < 0 && !tipiNotaCredito.includes(tipoDocumento)) {
    warnings.push({
      path,
      message: `ImportoTotaleDocumento negativo per TipoDocumento ${tipoDocumento}. Importi negativi sono tipici per Note di Credito (TD04)`,
      code: 'NEGATIVE_AMOUNT_NON_CREDIT_NOTE',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza RiferimentoNormativo con Natura
 * Consigliato quando Natura è presente
 */
export function validateRiferimentoNormativo(
  natura: string | undefined,
  riferimentoNormativo: string | undefined,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (natura && !riferimentoNormativo) {
    warnings.push({
      path,
      message: 'RiferimentoNormativo consigliato quando Natura è presente',
      code: 'MISSING_RIFERIMENTO_NORMATIVO',
    });
  }

  // Lunghezza massima
  if (riferimentoNormativo && riferimentoNormativo.length > 100) {
    errors.push({
      path,
      message: 'RiferimentoNormativo non può superare 100 caratteri',
      code: 'MAX_LENGTH',
    });
  }

  return { errors, warnings };
}

/**
 * Valida coerenza bollo virtuale
 * Bollo obbligatorio per importi > 77.47€ per determinate tipologie
 */
export function validateBolloVirtuale(
  datiBollo: { bolloVirtuale: 'SI'; importoBollo: number } | undefined,
  natura: string | undefined,
  imponibileImporto: number,
  path: string
): CoerenzaRulesResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Nature che richiedono bollo > 77.47€
  const natureConBollo = ['N1', 'N2.1', 'N2.2', 'N3.5', 'N4'];

  if (
    natura &&
    natureConBollo.includes(natura) &&
    imponibileImporto > 77.47 &&
    !datiBollo
  ) {
    warnings.push({
      path: `${path}.datiBollo`,
      message: `Bollo virtuale potrebbe essere richiesto per Natura ${natura} con importo > 77.47€`,
      code: 'MISSING_BOLLO',
    });
  }

  // Validazione importo bollo
  if (datiBollo) {
    if (datiBollo.importoBollo <= 0) {
      errors.push({
        path: `${path}.datiBollo.importoBollo`,
        message: 'ImportoBollo deve essere maggiore di 0',
        code: 'INVALID_IMPORTO_BOLLO',
      });
    }
  }

  return { errors, warnings };
}
