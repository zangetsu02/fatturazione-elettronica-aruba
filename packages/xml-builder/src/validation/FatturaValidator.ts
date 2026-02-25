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
  DatiPagamento,
} from '../types';

// Import validation rules
import {
  validateIdFiscaleIVA as validateIdFiscaleIVARule,
  validateCodiceFiscale as validateCodiceFiscaleRule,
  validatePecDestinatario,
  validateCodiceDestinatario,
  validateIdentificativoFiscalePresente,
} from './rules/anagrafica.rules';

import {
  validateNumeroLinea,
  validateAliquotaIVA,
  validateImpostaRiepilogo,
} from './rules/importi.rules';

import {
  validateIBAN,
  validateBIC,
  validateABI,
  validateCAB,
  validateModalitaPagamento,
  validateCoerenzaPagamento,
} from './rules/pagamenti.rules';

import {
  validateCoerenzaRitenuta,
  validateCoerenzaCassaPrevidenziale,
  validateNatura,
  validateTipoDocumento,
  validateCoerenzaEsigibilita,
  validateCoerenzaTipoDocumentoImporti,
  validateRiferimentoNormativo,
} from './rules/coerenza.rules';

import {
  ID_PAESE_PATTERN,
  FORMATO_TRASMISSIONE_VALIDI,
  REGIME_FISCALE_VALIDI,
  NUMERO_LINEA_MAX,
  MAX_LENGTH,
} from './patterns';

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationOptions {
  validateTotals?: boolean;
  validateCodiceFiscale?: boolean;
  validatePartitaIVA?: boolean;
  validateDates?: boolean;
  validatePagamenti?: boolean;
  strict?: boolean;
}
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
      validatePagamenti: options.validatePagamenti ?? true,
      strict: options.strict ?? false,
    };
  }
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

  // HEADER VALIDATION

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
    // IdTrasmittente - usa regole modulari
    this.validateRequired(dati.idTrasmittente, `${path}.idTrasmittente`);
    if (dati.idTrasmittente) {
      const idFiscaleResult = validateIdFiscaleIVARule(
        dati.idTrasmittente,
        `${path}.idTrasmittente`,
        false // non validare come PIVA italiana
      );
      this.mergeResults(idFiscaleResult);
    }

    // ProgressivoInvio
    this.validateRequired(dati.progressivoInvio, `${path}.progressivoInvio`);
    if (dati.progressivoInvio && dati.progressivoInvio.length > MAX_LENGTH.progressivoInvio) {
      this.addError(
        `${path}.progressivoInvio`,
        `ProgressivoInvio non può superare ${MAX_LENGTH.progressivoInvio} caratteri`,
        'MAX_LENGTH'
      );
    }

    // FormatoTrasmissione
    this.validateRequired(dati.formatoTrasmissione, `${path}.formatoTrasmissione`);
    if (dati.formatoTrasmissione && !FORMATO_TRASMISSIONE_VALIDI.has(dati.formatoTrasmissione)) {
      this.addError(
        `${path}.formatoTrasmissione`,
        'FormatoTrasmissione non valido. Valori ammessi: FPA12, FPR12, FSM10',
        'INVALID_ENUM'
      );
    }

    // CodiceDestinatario - usa regole modulari
    const codDestResult = validateCodiceDestinatario(
      dati.codiceDestinatario,
      dati.formatoTrasmissione,
      `${path}.codiceDestinatario`
    );
    this.mergeResults(codDestResult);

    // PECDestinatario - usa regole modulari (SDI 00411)
    const pecResult = validatePecDestinatario(dati.pecDestinatario, dati.codiceDestinatario, path);
    this.mergeResults(pecResult);
  }

  private validateCedentePrestatore(cedente: CedentePrestatore, path: string): void {
    // DatiAnagrafici
    this.validateRequired(cedente.datiAnagrafici, `${path}.datiAnagrafici`);

    // IdFiscaleIVA o CodiceFiscale richiesto - usa regole modulari
    const idFiscalePresente = validateIdentificativoFiscalePresente(
      cedente.datiAnagrafici?.idFiscaleIVA,
      cedente.datiAnagrafici?.codiceFiscale,
      `${path}.datiAnagrafici`
    );
    this.mergeResults(idFiscalePresente);

    // Validazione Partita IVA - usa regole modulari (SDI 00401)
    if (cedente.datiAnagrafici?.idFiscaleIVA && this.options.validatePartitaIVA) {
      const idFiscaleResult = validateIdFiscaleIVARule(
        cedente.datiAnagrafici.idFiscaleIVA,
        `${path}.datiAnagrafici.idFiscaleIVA`,
        true
      );
      this.mergeResults(idFiscaleResult);
    }

    // Validazione Codice Fiscale - usa regole modulari (SDI 00403)
    if (cedente.datiAnagrafici?.codiceFiscale && this.options.validateCodiceFiscale) {
      const cfResult = validateCodiceFiscaleRule(
        cedente.datiAnagrafici.codiceFiscale,
        `${path}.datiAnagrafici.codiceFiscale`
      );
      this.mergeResults(cfResult);
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
    if (
      cedente.datiAnagrafici?.regimeFiscale &&
      !REGIME_FISCALE_VALIDI.has(cedente.datiAnagrafici.regimeFiscale)
    ) {
      this.addError(
        `${path}.datiAnagrafici.regimeFiscale`,
        'RegimeFiscale non valido. Valori ammessi: RF01-RF19',
        'INVALID_REGIME_FISCALE'
      );
    }

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

    // Validazione Partita IVA se presente - usa regole modulari (SDI 00401)
    if (cessionario.datiAnagrafici?.idFiscaleIVA && this.options.validatePartitaIVA) {
      const idFiscaleResult = validateIdFiscaleIVARule(
        cessionario.datiAnagrafici.idFiscaleIVA,
        `${path}.datiAnagrafici.idFiscaleIVA`,
        true
      );
      this.mergeResults(idFiscaleResult);
    }

    // Validazione Codice Fiscale se presente - usa regole modulari (SDI 00403)
    if (cessionario.datiAnagrafici?.codiceFiscale && this.options.validateCodiceFiscale) {
      const cfResult = validateCodiceFiscaleRule(
        cessionario.datiAnagrafici.codiceFiscale,
        `${path}.datiAnagrafici.codiceFiscale`
      );
      this.mergeResults(cfResult);
    }

    // Sede
    this.validateRequired(cessionario.sede, `${path}.sede`);
    this.validateIndirizzo(cessionario.sede, `${path}.sede`);
  }

  // BODY VALIDATION

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

    // Validazione coerenza Ritenuta/Cassa (SDI 00419, 00420)
    this.validateCoerenzaRitenutaCassa(body, path);

    // DatiPagamento
    if (body.datiPagamento && this.options.validatePagamenti) {
      this.validateDatiPagamento(
        body.datiPagamento,
        body.datiGenerali.datiGeneraliDocumento.importoTotaleDocumento,
        `${path}.datiPagamento`
      );
    }
  }

  private validateDatiGenerali(dati: DatiGenerali, path: string): void {
    const doc = dati.datiGeneraliDocumento;
    this.validateRequired(doc, `${path}.datiGeneraliDocumento`);

    // TipoDocumento - usa regole modulari
    const tipoDocResult = validateTipoDocumento(
      doc?.tipoDocumento,
      `${path}.datiGeneraliDocumento.tipoDocumento`
    );
    this.mergeResults(tipoDocResult);

    // Coerenza TipoDocumento con importi
    if (doc?.tipoDocumento && doc?.importoTotaleDocumento !== undefined) {
      const coerenzaResult = validateCoerenzaTipoDocumentoImporti(
        doc.tipoDocumento,
        doc.importoTotaleDocumento,
        `${path}.datiGeneraliDocumento`
      );
      this.mergeResults(coerenzaResult);
    }

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
    if (doc?.numero && doc.numero.length > MAX_LENGTH.numeroDocumento) {
      this.addError(
        `${path}.datiGeneraliDocumento.numero`,
        `Numero documento non può superare ${MAX_LENGTH.numeroDocumento} caratteri`,
        'MAX_LENGTH'
      );
    }

    // Causale
    if (doc?.causale) {
      for (let i = 0; i < doc.causale.length; i++) {
        const causale = doc.causale[i];
        if (causale && causale.length > MAX_LENGTH.causale) {
          this.addError(
            `${path}.datiGeneraliDocumento.causale[${i}]`,
            `Causale non può superare ${MAX_LENGTH.causale} caratteri`,
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
    // NumeroLinea - usa regole modulari
    const numLineaResult = validateNumeroLinea(linea.numeroLinea, `${path}.numeroLinea`);
    this.mergeResults(numLineaResult);

    // Verifica range NumeroLinea aggiuntivo
    if (linea.numeroLinea !== undefined && linea.numeroLinea > NUMERO_LINEA_MAX) {
      this.addError(
        `${path}.numeroLinea`,
        `NumeroLinea non può superare ${NUMERO_LINEA_MAX}`,
        'INVALID_NUMERO_LINEA_RANGE'
      );
    }

    // Descrizione
    this.validateRequired(linea.descrizione, `${path}.descrizione`);
    if (linea.descrizione && linea.descrizione.length > MAX_LENGTH.descrizioneLinea) {
      this.addError(
        `${path}.descrizione`,
        `Descrizione non può superare ${MAX_LENGTH.descrizioneLinea} caratteri`,
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

    // AliquotaIVA - usa regole modulari
    const aliquotaResult = validateAliquotaIVA(linea.aliquotaIVA, `${path}.aliquotaIVA`);
    this.mergeResults(aliquotaResult);

    // Natura - usa regole modulari
    const naturaResult = validateNatura(linea.natura, linea.aliquotaIVA, `${path}.natura`);
    this.mergeResults(naturaResult);

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
    // AliquotaIVA - usa regole modulari
    const aliquotaResult = validateAliquotaIVA(riepilogo.aliquotaIVA, `${path}.aliquotaIVA`);
    this.mergeResults(aliquotaResult);

    // ImponibileImporto
    if (riepilogo.imponibileImporto === undefined) {
      this.addError(`${path}.imponibileImporto`, 'ImponibileImporto è richiesto', 'REQUIRED');
    }

    // Imposta
    if (riepilogo.imposta === undefined) {
      this.addError(`${path}.imposta`, 'Imposta è richiesta', 'REQUIRED');
    }

    // Validazione imposta calcolata
    if (
      riepilogo.imponibileImporto !== undefined &&
      riepilogo.aliquotaIVA !== undefined &&
      riepilogo.imposta !== undefined
    ) {
      const impostaResult = validateImpostaRiepilogo(
        riepilogo.imponibileImporto,
        riepilogo.aliquotaIVA,
        riepilogo.imposta,
        path
      );
      this.mergeResults(impostaResult);
    }

    // Natura - usa regole modulari
    const naturaResult = validateNatura(riepilogo.natura, riepilogo.aliquotaIVA, `${path}.natura`);
    this.mergeResults(naturaResult);

    // EsigibilitaIVA - usa regole modulari
    if (riepilogo.esigibilitaIVA) {
      const esigResult = validateCoerenzaEsigibilita(
        riepilogo.esigibilitaIVA,
        riepilogo.natura,
        riepilogo.aliquotaIVA,
        `${path}.esigibilitaIVA`
      );
      this.mergeResults(esigResult);
    }

    // RiferimentoNormativo - usa regole modulari
    const rifNormResult = validateRiferimentoNormativo(
      riepilogo.natura,
      riepilogo.riferimentoNormativo,
      `${path}.riferimentoNormativo`
    );
    this.mergeResults(rifNormResult);
  }

  private validateCoerenzaRitenutaCassa(body: FatturaElettronicaBody, path: string): void {
    const datiRitenuta = body.datiGenerali.datiGeneraliDocumento.datiRitenuta;
    const datiCassa = body.datiGenerali.datiGeneraliDocumento.datiCassaPrevidenziale;
    const linee = body.datiBeniServizi.dettaglioLinee;

    // Valida coerenza Ritenuta (SDI 00419)
    const ritenutaResult = validateCoerenzaRitenuta(
      datiRitenuta,
      linee.map((l) => ({
        numeroLinea: l.numeroLinea,
        ritenuta: l.ritenuta,
        aliquotaIVA: l.aliquotaIVA,
        natura: l.natura,
      })),
      datiCassa,
      `${path}.datiGenerali.datiGeneraliDocumento`
    );
    this.mergeResults(ritenutaResult);

    // Valida coerenza Cassa Previdenziale (SDI 00420)
    const cassaResult = validateCoerenzaCassaPrevidenziale(
      datiRitenuta,
      datiCassa,
      `${path}.datiGenerali.datiGeneraliDocumento`
    );
    this.mergeResults(cassaResult);
  }

  private validateDatiPagamento(
    datiPagamento: DatiPagamento[],
    importoTotaleDocumento: number | undefined,
    path: string
  ): void {
    for (let i = 0; i < datiPagamento.length; i++) {
      const pagamento = datiPagamento[i];
      if (!pagamento) continue;

      const pagPath = `${path}[${i}]`;

      // CondizioniPagamento
      this.validateRequired(pagamento.condizioniPagamento, `${pagPath}.condizioniPagamento`);

      // DettaglioPagamento
      if (pagamento.dettaglioPagamento) {
        for (let j = 0; j < pagamento.dettaglioPagamento.length; j++) {
          const dettaglio = pagamento.dettaglioPagamento[j];
          if (!dettaglio) continue;

          const detPath = `${pagPath}.dettaglioPagamento[${j}]`;

          // ModalitaPagamento - usa regole modulari
          const modResult = validateModalitaPagamento(
            dettaglio.modalitaPagamento,
            `${detPath}.modalitaPagamento`
          );
          this.mergeResults(modResult);

          // IBAN - usa regole modulari
          if (dettaglio.iban) {
            const ibanResult = validateIBAN(dettaglio.iban, `${detPath}.iban`);
            this.mergeResults(ibanResult);
          }

          // BIC - usa regole modulari
          if (dettaglio.bic) {
            const bicResult = validateBIC(dettaglio.bic, `${detPath}.bic`);
            this.mergeResults(bicResult);
          }

          // ABI - usa regole modulari
          if (dettaglio.abi) {
            const abiResult = validateABI(dettaglio.abi, `${detPath}.abi`);
            this.mergeResults(abiResult);
          }

          // CAB - usa regole modulari
          if (dettaglio.cab) {
            const cabResult = validateCAB(dettaglio.cab, `${detPath}.cab`);
            this.mergeResults(cabResult);
          }

          // Coerenza pagamento - usa regole modulari
          const coerenzaResult = validateCoerenzaPagamento(
            {
              modalitaPagamento: dettaglio.modalitaPagamento,
              iban: dettaglio.iban,
              abi: dettaglio.abi,
              cab: dettaglio.cab,
              bic: dettaglio.bic,
            },
            detPath
          );
          this.mergeResults(coerenzaResult);

          // ImportoPagamento
          if (dettaglio.importoPagamento === undefined) {
            this.addError(
              `${detPath}.importoPagamento`,
              'ImportoPagamento è richiesto',
              'REQUIRED'
            );
          }
        }
      }
    }
  }

  private validateTotals(dati: DatiBeniServizi, _datiGenerali: DatiGenerali, path: string): void {
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
    }
  }

  // HELPER VALIDATION METHODS

  private mergeResults(result: { errors: ValidationError[]; warnings: ValidationError[] }): void {
    this.errors.push(...result.errors);
    this.warnings.push(...result.warnings);
  }

  private validateRequired(value: unknown, path: string): boolean {
    if (value === undefined || value === null || value === '') {
      this.addError(path, 'Campo richiesto', 'REQUIRED');
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

    // Lunghezza massima denominazione
    if (anagrafica.denominazione && anagrafica.denominazione.length > MAX_LENGTH.denominazione) {
      this.addError(
        `${path}.denominazione`,
        `Denominazione non può superare ${MAX_LENGTH.denominazione} caratteri`,
        'MAX_LENGTH'
      );
    }

    // Lunghezza massima nome/cognome
    if (anagrafica.nome && anagrafica.nome.length > MAX_LENGTH.nome) {
      this.addError(
        `${path}.nome`,
        `Nome non può superare ${MAX_LENGTH.nome} caratteri`,
        'MAX_LENGTH'
      );
    }
    if (anagrafica.cognome && anagrafica.cognome.length > MAX_LENGTH.cognome) {
      this.addError(
        `${path}.cognome`,
        `Cognome non può superare ${MAX_LENGTH.cognome} caratteri`,
        'MAX_LENGTH'
      );
    }
  }

  private validateIndirizzo(
    indirizzo:
      | { indirizzo: string; cap: string; comune: string; provincia?: string; nazione: string }
      | undefined,
    path: string
  ): void {
    if (!indirizzo) return;

    this.validateRequired(indirizzo.indirizzo, `${path}.indirizzo`);
    this.validateRequired(indirizzo.cap, `${path}.cap`);
    this.validateRequired(indirizzo.comune, `${path}.comune`);
    this.validateRequired(indirizzo.nazione, `${path}.nazione`);

    // Lunghezza massima indirizzo
    if (indirizzo.indirizzo && indirizzo.indirizzo.length > MAX_LENGTH.indirizzo) {
      this.addError(
        `${path}.indirizzo`,
        `Indirizzo non può superare ${MAX_LENGTH.indirizzo} caratteri`,
        'MAX_LENGTH'
      );
    }

    // Lunghezza massima comune
    if (indirizzo.comune && indirizzo.comune.length > MAX_LENGTH.comune) {
      this.addError(
        `${path}.comune`,
        `Comune non può superare ${MAX_LENGTH.comune} caratteri`,
        'MAX_LENGTH'
      );
    }

    // Provincia (2 caratteri per Italia)
    if (indirizzo.nazione === 'IT' && indirizzo.provincia) {
      if (indirizzo.provincia.length !== MAX_LENGTH.provincia) {
        this.addError(
          `${path}.provincia`,
          `Provincia italiana deve essere di ${MAX_LENGTH.provincia} caratteri`,
          'INVALID_PROVINCIA'
        );
      }
    }

    // CAP italiano deve essere di 5 cifre
    if (indirizzo.nazione === 'IT' && indirizzo.cap) {
      if (!/^\d{5}$/.test(indirizzo.cap)) {
        this.addError(`${path}.cap`, 'CAP italiano deve essere di 5 cifre', 'INVALID_CAP');
      }
    }

    // Validazione codice nazione
    if (indirizzo.nazione && !ID_PAESE_PATTERN.test(indirizzo.nazione)) {
      this.addError(
        `${path}.nazione`,
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

export function validateFattura(
  fattura: FatturaElettronica,
  options?: ValidationOptions
): ValidationResult {
  const validator = new FatturaValidator(options);
  return validator.validate(fattura);
}
