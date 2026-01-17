import type {
  FatturaElettronica,
  FatturaElettronicaHeader,
  FatturaElettronicaBody,
  DatiTrasmissione,
  CedentePrestatore,
  CessionarioCommittente,
  DatiGenerali,
  DatiBeniServizi,
  DettaglioLinee,
  DatiRiepilogo,
} from '../types';

/**
 * Errore di validazione
 */
export interface ValidationError {
  /** Percorso del campo con errore */
  path: string;
  /** Messaggio di errore */
  message: string;
  /** Codice errore */
  code: string;
}

/**
 * Risultato della validazione
 */
export interface ValidationResult {
  /** Indica se la fattura è valida */
  valid: boolean;
  /** Lista degli errori di validazione */
  errors: ValidationError[];
  /** Lista degli avvisi (non bloccanti) */
  warnings: ValidationError[];
}

/**
 * Opzioni di validazione
 */
export interface ValidationOptions {
  /** Validare i totali (default: true) */
  validateTotals?: boolean;
  /** Validare il codice fiscale (default: true) */
  validateCodiceFiscale?: boolean;
  /** Validare la partita IVA (default: true) */
  validatePartitaIVA?: boolean;
  /** Validare le date (default: true) */
  validateDates?: boolean;
  /** Modalità strict - tratta i warning come errori (default: false) */
  strict?: boolean;
}

/**
 * Validatore per fatture elettroniche FatturaPA
 */
export class FatturaValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];
  private options: Required<ValidationOptions>;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      validateTotals: options.validateTotals ?? true,
      validateCodiceFiscale: options.validateCodiceFiscale ?? true,
      validatePartitaIVA: options.validatePartitaIVA ?? true,
      validateDates: options.validateDates ?? true,
      strict: options.strict ?? false,
    };
  }

  /**
   * Valida una fattura elettronica
   */
  validate(fattura: FatturaElettronica): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Validazione header
    this.validateHeader(fattura.fatturaElettronicaHeader);

    // Validazione body
    for (let i = 0; i < fattura.fatturaElettronicaBody.length; i++) {
      const body = fattura.fatturaElettronicaBody[i];
      if (body) {
        this.validateBody(body, `fatturaElettronicaBody[${i}]`);
      }
    }

    // In modalità strict, i warning diventano errori
    if (this.options.strict) {
      this.errors.push(...this.warnings);
      this.warnings = [];
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  // ============================================================================
  // HEADER VALIDATION
  // ============================================================================

  private validateHeader(header: FatturaElettronicaHeader): void {
    const basePath = 'fatturaElettronicaHeader';

    // DatiTrasmissione
    this.validateDatiTrasmissione(header.datiTrasmissione, `${basePath}.datiTrasmissione`);

    // CedentePrestatore
    this.validateCedentePrestatore(header.cedentePrestatore, `${basePath}.cedentePrestatore`);

    // CessionarioCommittente
    this.validateCessionarioCommittente(
      header.cessionarioCommittente,
      `${basePath}.cessionarioCommittente`
    );
  }

  private validateDatiTrasmissione(dati: DatiTrasmissione, path: string): void {
    // IdTrasmittente
    this.validateRequired(dati.idTrasmittente, `${path}.idTrasmittente`);
    this.validateRequired(dati.idTrasmittente?.idPaese, `${path}.idTrasmittente.idPaese`);
    this.validateRequired(dati.idTrasmittente?.idCodice, `${path}.idTrasmittente.idCodice`);

    if (dati.idTrasmittente?.idPaese) {
      this.validateCountryCode(dati.idTrasmittente.idPaese, `${path}.idTrasmittente.idPaese`);
    }

    // ProgressivoInvio
    this.validateRequired(dati.progressivoInvio, `${path}.progressivoInvio`);
    if (dati.progressivoInvio && dati.progressivoInvio.length > 10) {
      this.addError(
        `${path}.progressivoInvio`,
        'ProgressivoInvio non può superare 10 caratteri',
        'MAX_LENGTH'
      );
    }

    // FormatoTrasmissione
    this.validateRequired(dati.formatoTrasmissione, `${path}.formatoTrasmissione`);
    if (
      dati.formatoTrasmissione &&
      !['FPA12', 'FPR12', 'FSM10'].includes(dati.formatoTrasmissione)
    ) {
      this.addError(
        `${path}.formatoTrasmissione`,
        'FormatoTrasmissione non valido',
        'INVALID_ENUM'
      );
    }

    // CodiceDestinatario
    this.validateRequired(dati.codiceDestinatario, `${path}.codiceDestinatario`);
    if (dati.codiceDestinatario) {
      if (dati.formatoTrasmissione === 'FPA12' && dati.codiceDestinatario.length !== 6) {
        this.addError(
          `${path}.codiceDestinatario`,
          'CodiceDestinatario per PA deve essere di 6 caratteri',
          'INVALID_LENGTH'
        );
      } else if (dati.formatoTrasmissione === 'FPR12' && dati.codiceDestinatario.length !== 7) {
        this.addError(
          `${path}.codiceDestinatario`,
          'CodiceDestinatario per B2B deve essere di 7 caratteri',
          'INVALID_LENGTH'
        );
      }
    }

    // PEC è richiesta se CodiceDestinatario è 0000000
    if (dati.codiceDestinatario === '0000000' && !dati.pecDestinatario) {
      this.addWarning(
        `${path}.pecDestinatario`,
        'PEC destinatario consigliata quando CodiceDestinatario è 0000000',
        'MISSING_PEC'
      );
    }
  }

  private validateCedentePrestatore(cedente: CedentePrestatore, path: string): void {
    // DatiAnagrafici
    this.validateRequired(cedente.datiAnagrafici, `${path}.datiAnagrafici`);

    // IdFiscaleIVA o CodiceFiscale richiesto
    if (!cedente.datiAnagrafici?.idFiscaleIVA && !cedente.datiAnagrafici?.codiceFiscale) {
      this.addError(
        `${path}.datiAnagrafici`,
        'Almeno uno tra IdFiscaleIVA e CodiceFiscale è richiesto',
        'MISSING_FISCAL_ID'
      );
    }

    // Validazione Partita IVA
    if (cedente.datiAnagrafici?.idFiscaleIVA) {
      this.validateIdFiscaleIVA(
        cedente.datiAnagrafici.idFiscaleIVA,
        `${path}.datiAnagrafici.idFiscaleIVA`
      );
    }

    // Validazione Codice Fiscale
    if (cedente.datiAnagrafici?.codiceFiscale && this.options.validateCodiceFiscale) {
      this.validateCodiceFiscale(
        cedente.datiAnagrafici.codiceFiscale,
        `${path}.datiAnagrafici.codiceFiscale`
      );
    }

    // Anagrafica
    this.validateRequired(cedente.datiAnagrafici?.anagrafica, `${path}.datiAnagrafici.anagrafica`);
    this.validateAnagrafica(
      cedente.datiAnagrafici?.anagrafica,
      `${path}.datiAnagrafici.anagrafica`
    );

    // RegimeFiscale
    this.validateRequired(
      cedente.datiAnagrafici?.regimeFiscale,
      `${path}.datiAnagrafici.regimeFiscale`
    );

    // Sede
    this.validateRequired(cedente.sede, `${path}.sede`);
    this.validateIndirizzo(cedente.sede, `${path}.sede`);
  }

  private validateCessionarioCommittente(cessionario: CessionarioCommittente, path: string): void {
    // DatiAnagrafici
    this.validateRequired(cessionario.datiAnagrafici, `${path}.datiAnagrafici`);

    // Anagrafica
    this.validateRequired(
      cessionario.datiAnagrafici?.anagrafica,
      `${path}.datiAnagrafici.anagrafica`
    );
    this.validateAnagrafica(
      cessionario.datiAnagrafici?.anagrafica,
      `${path}.datiAnagrafici.anagrafica`
    );

    // Validazione Partita IVA se presente
    if (cessionario.datiAnagrafici?.idFiscaleIVA) {
      this.validateIdFiscaleIVA(
        cessionario.datiAnagrafici.idFiscaleIVA,
        `${path}.datiAnagrafici.idFiscaleIVA`
      );
    }

    // Validazione Codice Fiscale se presente
    if (cessionario.datiAnagrafici?.codiceFiscale && this.options.validateCodiceFiscale) {
      this.validateCodiceFiscale(
        cessionario.datiAnagrafici.codiceFiscale,
        `${path}.datiAnagrafici.codiceFiscale`
      );
    }

    // Sede
    this.validateRequired(cessionario.sede, `${path}.sede`);
    this.validateIndirizzo(cessionario.sede, `${path}.sede`);
  }

  // ============================================================================
  // BODY VALIDATION
  // ============================================================================

  private validateBody(body: FatturaElettronicaBody, path: string): void {
    // DatiGenerali
    this.validateRequired(body.datiGenerali, `${path}.datiGenerali`);
    this.validateDatiGenerali(body.datiGenerali, `${path}.datiGenerali`);

    // DatiBeniServizi
    this.validateRequired(body.datiBeniServizi, `${path}.datiBeniServizi`);
    this.validateDatiBeniServizi(
      body.datiBeniServizi,
      body.datiGenerali,
      `${path}.datiBeniServizi`
    );
  }

  private validateDatiGenerali(dati: DatiGenerali, path: string): void {
    const doc = dati.datiGeneraliDocumento;
    this.validateRequired(doc, `${path}.datiGeneraliDocumento`);

    // TipoDocumento
    this.validateRequired(doc?.tipoDocumento, `${path}.datiGeneraliDocumento.tipoDocumento`);

    // Divisa
    this.validateRequired(doc?.divisa, `${path}.datiGeneraliDocumento.divisa`);
    if (doc?.divisa && doc.divisa.length !== 3) {
      this.addError(
        `${path}.datiGeneraliDocumento.divisa`,
        'Divisa deve essere un codice ISO 4217 di 3 caratteri',
        'INVALID_CURRENCY'
      );
    }

    // Data
    this.validateRequired(doc?.data, `${path}.datiGeneraliDocumento.data`);
    if (doc?.data && this.options.validateDates) {
      this.validateDate(doc.data, `${path}.datiGeneraliDocumento.data`);
    }

    // Numero
    this.validateRequired(doc?.numero, `${path}.datiGeneraliDocumento.numero`);
    if (doc?.numero && doc.numero.length > 20) {
      this.addError(
        `${path}.datiGeneraliDocumento.numero`,
        'Numero documento non può superare 20 caratteri',
        'MAX_LENGTH'
      );
    }

    // Causale
    if (doc?.causale) {
      for (let i = 0; i < doc.causale.length; i++) {
        const causale = doc.causale[i];
        if (causale && causale.length > 200) {
          this.addError(
            `${path}.datiGeneraliDocumento.causale[${i}]`,
            'Causale non può superare 200 caratteri',
            'MAX_LENGTH'
          );
        }
      }
    }
  }

  private validateDatiBeniServizi(
    dati: DatiBeniServizi,
    datiGenerali: DatiGenerali,
    path: string
  ): void {
    // DettaglioLinee
    this.validateRequired(dati.dettaglioLinee, `${path}.dettaglioLinee`);
    if (dati.dettaglioLinee && dati.dettaglioLinee.length === 0) {
      this.addError(`${path}.dettaglioLinee`, 'Almeno una linea è richiesta', 'EMPTY_ARRAY');
    }

    // Validazione singole linee
    const lineNumbers = new Set<number>();
    if (dati.dettaglioLinee) {
      for (let i = 0; i < dati.dettaglioLinee.length; i++) {
        const linea = dati.dettaglioLinee[i];
        if (linea) {
          this.validateDettaglioLinea(linea, `${path}.dettaglioLinee[${i}]`);

          // Controllo duplicati numero linea
          if (lineNumbers.has(linea.numeroLinea)) {
            this.addError(
              `${path}.dettaglioLinee[${i}].numeroLinea`,
              'Numero linea duplicato',
              'DUPLICATE_LINE_NUMBER'
            );
          }
          lineNumbers.add(linea.numeroLinea);
        }
      }
    }

    // DatiRiepilogo
    this.validateRequired(dati.datiRiepilogo, `${path}.datiRiepilogo`);
    if (dati.datiRiepilogo && dati.datiRiepilogo.length === 0) {
      this.addError(`${path}.datiRiepilogo`, 'Almeno un riepilogo IVA è richiesto', 'EMPTY_ARRAY');
    }

    // Validazione singoli riepiloghi
    if (dati.datiRiepilogo) {
      for (let i = 0; i < dati.datiRiepilogo.length; i++) {
        const riepilogo = dati.datiRiepilogo[i];
        if (riepilogo) {
          this.validateDatiRiepilogo(riepilogo, `${path}.datiRiepilogo[${i}]`);
        }
      }
    }

    // Validazione totali
    if (this.options.validateTotals && dati.dettaglioLinee && dati.datiRiepilogo) {
      this.validateTotals(dati, datiGenerali, path);
    }
  }

  private validateDettaglioLinea(linea: DettaglioLinee, path: string): void {
    // NumeroLinea
    this.validateRequired(linea.numeroLinea, `${path}.numeroLinea`);
    if (linea.numeroLinea !== undefined && linea.numeroLinea < 1) {
      this.addError(
        `${path}.numeroLinea`,
        'NumeroLinea deve essere maggiore di 0',
        'INVALID_VALUE'
      );
    }

    // Descrizione
    this.validateRequired(linea.descrizione, `${path}.descrizione`);
    if (linea.descrizione && linea.descrizione.length > 1000) {
      this.addError(
        `${path}.descrizione`,
        'Descrizione non può superare 1000 caratteri',
        'MAX_LENGTH'
      );
    }

    // PrezzoUnitario
    if (linea.prezzoUnitario === undefined) {
      this.addError(`${path}.prezzoUnitario`, 'PrezzoUnitario è richiesto', 'REQUIRED');
    }

    // PrezzoTotale
    if (linea.prezzoTotale === undefined) {
      this.addError(`${path}.prezzoTotale`, 'PrezzoTotale è richiesto', 'REQUIRED');
    }

    // AliquotaIVA
    if (linea.aliquotaIVA === undefined) {
      this.addError(`${path}.aliquotaIVA`, 'AliquotaIVA è richiesto', 'REQUIRED');
    }

    // Natura richiesta se AliquotaIVA è 0
    if (linea.aliquotaIVA === 0 && !linea.natura) {
      this.addError(
        `${path}.natura`,
        'Natura è richiesta quando AliquotaIVA è 0',
        'REQUIRED_WHEN_ZERO_VAT'
      );
    }

    // Validazione date periodo
    if (linea.dataInizioPeriodo && linea.dataFinePeriodo && this.options.validateDates) {
      this.validateDate(linea.dataInizioPeriodo, `${path}.dataInizioPeriodo`);
      this.validateDate(linea.dataFinePeriodo, `${path}.dataFinePeriodo`);

      if (linea.dataInizioPeriodo > linea.dataFinePeriodo) {
        this.addError(
          `${path}.dataFinePeriodo`,
          'DataFinePeriodo deve essere successiva a DataInizioPeriodo',
          'INVALID_DATE_RANGE'
        );
      }
    }
  }

  private validateDatiRiepilogo(riepilogo: DatiRiepilogo, path: string): void {
    // AliquotaIVA
    if (riepilogo.aliquotaIVA === undefined) {
      this.addError(`${path}.aliquotaIVA`, 'AliquotaIVA è richiesto', 'REQUIRED');
    }

    // ImponibileImporto
    if (riepilogo.imponibileImporto === undefined) {
      this.addError(`${path}.imponibileImporto`, 'ImponibileImporto è richiesto', 'REQUIRED');
    }

    // Imposta
    if (riepilogo.imposta === undefined) {
      this.addError(`${path}.imposta`, 'Imposta è richieto', 'REQUIRED');
    }

    // Natura richiesta se AliquotaIVA è 0
    if (riepilogo.aliquotaIVA === 0 && !riepilogo.natura) {
      this.addError(
        `${path}.natura`,
        'Natura è richiesta quando AliquotaIVA è 0',
        'REQUIRED_WHEN_ZERO_VAT'
      );
    }

    // RiferimentoNormativo consigliato se Natura presente
    if (riepilogo.natura && !riepilogo.riferimentoNormativo) {
      this.addWarning(
        `${path}.riferimentoNormativo`,
        'RiferimentoNormativo consigliato quando Natura è presente',
        'MISSING_REFERENCE'
      );
    }
  }

  private validateTotals(dati: DatiBeniServizi, datiGenerali: DatiGenerali, path: string): void {
    // Raggruppa linee per aliquota IVA
    const linesByVat = new Map<number, number>();
    for (const linea of dati.dettaglioLinee) {
      const current = linesByVat.get(linea.aliquotaIVA) || 0;
      linesByVat.set(linea.aliquotaIVA, current + linea.prezzoTotale);
    }

    // Verifica che i riepiloghi corrispondano
    for (const riepilogo of dati.datiRiepilogo) {
      const expectedImponibile = linesByVat.get(riepilogo.aliquotaIVA) || 0;
      const diff = Math.abs(expectedImponibile - riepilogo.imponibileImporto);

      // Tolleranza di 0.01 per arrotondamenti
      if (diff > 0.01) {
        this.addWarning(
          `${path}.datiRiepilogo`,
          `ImponibileImporto per aliquota ${riepilogo.aliquotaIVA}% non corrisponde alla somma delle linee (atteso: ${expectedImponibile.toFixed(2)}, trovato: ${riepilogo.imponibileImporto.toFixed(2)})`,
          'TOTAL_MISMATCH'
        );
      }

      // Verifica imposta
      const expectedImposta = (riepilogo.imponibileImporto * riepilogo.aliquotaIVA) / 100;
      const impostaDiff = Math.abs(expectedImposta - riepilogo.imposta);
      if (impostaDiff > 0.01) {
        this.addWarning(
          `${path}.datiRiepilogo`,
          `Imposta per aliquota ${riepilogo.aliquotaIVA}% non corrisponde (atteso: ${expectedImposta.toFixed(2)}, trovato: ${riepilogo.imposta.toFixed(2)})`,
          'TAX_MISMATCH'
        );
      }
    }
  }

  // ============================================================================
  // HELPER VALIDATION METHODS
  // ============================================================================

  private validateRequired(value: unknown, path: string): boolean {
    if (value === undefined || value === null || value === '') {
      this.addError(path, `Campo richiesto`, 'REQUIRED');
      return false;
    }
    return true;
  }

  private validateAnagrafica(
    anagrafica: { denominazione?: string; nome?: string; cognome?: string } | undefined,
    path: string
  ): void {
    if (!anagrafica) return;

    // Denominazione o Nome+Cognome richiesti
    if (!anagrafica.denominazione && (!anagrafica.nome || !anagrafica.cognome)) {
      this.addError(
        path,
        'Denominazione oppure Nome e Cognome sono richiesti',
        'MISSING_ANAGRAFIC_DATA'
      );
    }

    // Non possono coesistere Denominazione con Nome/Cognome
    if (anagrafica.denominazione && (anagrafica.nome || anagrafica.cognome)) {
      this.addWarning(
        path,
        'Denominazione e Nome/Cognome non dovrebbero coesistere',
        'CONFLICTING_ANAGRAFIC_DATA'
      );
    }
  }

  private validateIndirizzo(
    indirizzo: { indirizzo: string; cap: string; comune: string; nazione: string } | undefined,
    path: string
  ): void {
    if (!indirizzo) return;

    this.validateRequired(indirizzo.indirizzo, `${path}.indirizzo`);
    this.validateRequired(indirizzo.cap, `${path}.cap`);
    this.validateRequired(indirizzo.comune, `${path}.comune`);
    this.validateRequired(indirizzo.nazione, `${path}.nazione`);

    // CAP italiano deve essere di 5 cifre
    if (indirizzo.nazione === 'IT' && indirizzo.cap) {
      if (!/^\d{5}$/.test(indirizzo.cap)) {
        this.addError(`${path}.cap`, 'CAP italiano deve essere di 5 cifre', 'INVALID_CAP');
      }
    }

    // Validazione codice nazione
    this.validateCountryCode(indirizzo.nazione, `${path}.nazione`);
  }

  private validateIdFiscaleIVA(
    idFiscale: { idPaese: string; idCodice: string },
    path: string
  ): void {
    this.validateRequired(idFiscale.idPaese, `${path}.idPaese`);
    this.validateRequired(idFiscale.idCodice, `${path}.idCodice`);

    this.validateCountryCode(idFiscale.idPaese, `${path}.idPaese`);

    // Partita IVA italiana deve essere di 11 cifre
    if (idFiscale.idPaese === 'IT' && this.options.validatePartitaIVA) {
      if (!/^\d{11}$/.test(idFiscale.idCodice)) {
        this.addError(
          `${path}.idCodice`,
          'Partita IVA italiana deve essere di 11 cifre',
          'INVALID_PIVA'
        );
      }
    }
  }

  private validateCodiceFiscale(codiceFiscale: string, path: string): void {
    // Codice fiscale italiano: 16 caratteri alfanumerici oppure 11 numeri (per persone giuridiche)
    const cfRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i;
    const pivaRegex = /^\d{11}$/;

    if (!cfRegex.test(codiceFiscale) && !pivaRegex.test(codiceFiscale)) {
      this.addError(path, 'Codice fiscale non valido', 'INVALID_CF');
    }
  }

  private validateCountryCode(code: string, path: string): void {
    // Codice ISO 3166-1 alpha-2
    if (!/^[A-Z]{2}$/.test(code)) {
      this.addError(
        path,
        'Codice paese deve essere ISO 3166-1 alpha-2 (2 lettere maiuscole)',
        'INVALID_COUNTRY_CODE'
      );
    }
  }

  private validateDate(date: string, path: string): void {
    // Formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      this.addError(path, 'Data deve essere nel formato YYYY-MM-DD', 'INVALID_DATE_FORMAT');
      return;
    }

    // Verifica che sia una data valida
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      this.addError(path, 'Data non valida', 'INVALID_DATE');
    }
  }

  private addError(path: string, message: string, code: string): void {
    this.errors.push({ path, message, code });
  }

  private addWarning(path: string, message: string, code: string): void {
    this.warnings.push({ path, message, code });
  }
}

/**
 * Valida una fattura elettronica
 */
export function validateFattura(
  fattura: FatturaElettronica,
  options?: ValidationOptions
): ValidationResult {
  const validator = new FatturaValidator(options);
  return validator.validate(fattura);
}
