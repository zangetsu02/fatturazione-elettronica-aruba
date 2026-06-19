import type {
  FatturaElettronica,
  FatturaElettronicaHeader,
  FatturaElettronicaBody,
  DatiTrasmissione,
  CedentePrestatore,
  CessionarioCommittente,
  RappresentanteFiscale,
  TerzoIntermediarioOSoggettoEmittente,
  DatiGenerali,
  DatiBeniServizi,
  DettaglioLinee,
  DatiPagamento,
  Allegati,
  DatiVeicoli,
  SoggettoEmittente,
  VersioneSchema,
  EsigibilitaIVA,
} from '../types';
import { calcolaPrezzoTotale, calcolaRiepilogo, nomeFileSdi } from '../utils';
import {
  FatturaValidator,
  type ValidationOptions,
  type ValidationResult,
} from '../validation';
import { FatturaSerializer, type FatturaSerializerOptions } from '../serializer';

export type DettaglioLineaInput = Omit<DettaglioLinee, 'numeroLinea' | 'prezzoTotale'> & {
  numeroLinea?: number;
  prezzoTotale?: number;
};

/** Risultato completo pronto per l'invio: oggetto, XML, validazione e nome file SDI. */
export interface FatturaResult {
  /** L'XML FatturaPA pronto per l'invio allo SDI / Aruba */
  xml: string;
  /** Nome file conforme al formato SDI: <IdPaese><IdCodice>_<Progressivo>.xml */
  filename: string;
  /** La struttura oggetto della fattura (utile per debug/log) */
  fattura: FatturaElettronica;
  /** Esito della validazione contro le regole FatturaPA */
  validazione: ValidationResult;
}

export interface ToResultOptions {
  validation?: ValidationOptions;
  serializer?: FatturaSerializerOptions;
}

export class FatturaBuilder {
  private versione: VersioneSchema = '1.2.2';
  private datiTrasmissione?: DatiTrasmissione;
  private cedentePrestatore?: CedentePrestatore;
  private cessionarioCommittente?: CessionarioCommittente;
  private rappresentanteFiscale?: RappresentanteFiscale;
  private terzoIntermediario?: TerzoIntermediarioOSoggettoEmittente;
  private soggettoEmittente?: SoggettoEmittente;
  private bodies: FatturaElettronicaBody[] = [];
  private currentBody: Partial<FatturaElettronicaBody> = {};
  private currentLinee: DettaglioLinee[] = [];
  private esigibilitaIVA: EsigibilitaIVA = 'I';

  static create(): FatturaBuilder {
    return new FatturaBuilder();
  }

  setVersione(versione: VersioneSchema): this {
    this.versione = versione;
    return this;
  }

  setDatiTrasmissione(dati: DatiTrasmissione): this {
    this.datiTrasmissione = dati;
    return this;
  }

  setTrasmissioneB2B(params: {
    idPaese: string;
    idCodice: string;
    progressivoInvio: string;
    codiceDestinatario?: string;
    pecDestinatario?: string;
  }): this {
    this.datiTrasmissione = {
      idTrasmittente: {
        idPaese: params.idPaese,
        idCodice: params.idCodice,
      },
      progressivoInvio: params.progressivoInvio,
      formatoTrasmissione: 'FPR12',
      codiceDestinatario: params.codiceDestinatario || '0000000',
      pecDestinatario: params.pecDestinatario,
    };
    return this;
  }

  setTrasmissionePA(params: {
    idPaese: string;
    idCodice: string;
    progressivoInvio: string;
    codiceDestinatario: string;
  }): this {
    this.datiTrasmissione = {
      idTrasmittente: {
        idPaese: params.idPaese,
        idCodice: params.idCodice,
      },
      progressivoInvio: params.progressivoInvio,
      formatoTrasmissione: 'FPA12',
      codiceDestinatario: params.codiceDestinatario,
    };
    return this;
  }

  setCedentePrestatore(cedente: CedentePrestatore): this {
    this.cedentePrestatore = cedente;
    return this;
  }

  setCessionarioCommittente(cessionario: CessionarioCommittente): this {
    this.cessionarioCommittente = cessionario;
    return this;
  }

  setRappresentanteFiscale(rappresentante: RappresentanteFiscale): this {
    this.rappresentanteFiscale = rappresentante;
    return this;
  }

  setTerzoIntermediario(terzo: TerzoIntermediarioOSoggettoEmittente): this {
    this.terzoIntermediario = terzo;
    return this;
  }

  setSoggettoEmittente(soggetto: SoggettoEmittente): this {
    this.soggettoEmittente = soggetto;
    return this;
  }

  setDatiGenerali(datiGenerali: DatiGenerali): this {
    this.currentBody.datiGenerali = datiGenerali;
    return this;
  }

  setDatiBeniServizi(datiBeniServizi: DatiBeniServizi): this {
    this.currentBody.datiBeniServizi = datiBeniServizi;
    return this;
  }

  setEsigibilitaIVA(esigibilitaIVA: EsigibilitaIVA): this {
    this.esigibilitaIVA = esigibilitaIVA;
    return this;
  }

  addLinea(linea: DettaglioLineaInput): this {
    const numeroLinea = linea.numeroLinea ?? this.currentLinee.length + 1;
    const prezzoTotale =
      linea.prezzoTotale ??
      calcolaPrezzoTotale(linea.prezzoUnitario, linea.quantita ?? 1, linea.scontoMaggiorazione);
    this.currentLinee.push({ ...linea, numeroLinea, prezzoTotale });
    return this;
  }

  setDettaglioLinee(linee: DettaglioLineaInput[]): this {
    this.currentLinee = [];
    for (const linea of linee) {
      this.addLinea(linea);
    }
    return this;
  }

  setDatiPagamento(datiPagamento: DatiPagamento[]): this {
    this.currentBody.datiPagamento = datiPagamento;
    return this;
  }

  addDatiPagamento(datiPagamento: DatiPagamento): this {
    if (!this.currentBody.datiPagamento) {
      this.currentBody.datiPagamento = [];
    }
    this.currentBody.datiPagamento.push(datiPagamento);
    return this;
  }

  setDatiVeicoli(datiVeicoli: DatiVeicoli): this {
    this.currentBody.datiVeicoli = datiVeicoli;
    return this;
  }

  setAllegati(allegati: Allegati[]): this {
    this.currentBody.allegati = allegati;
    return this;
  }

  addAllegato(allegato: Allegati): this {
    if (!this.currentBody.allegati) {
      this.currentBody.allegati = [];
    }
    this.currentBody.allegati.push(allegato);
    return this;
  }

  finalizeBody(): this {
    const body = this.resolveCurrentBody();
    if (body) {
      this.bodies.push(body);
      this.currentBody = {};
      this.currentLinee = [];
    }
    return this;
  }

  newBody(): this {
    this.finalizeBody();
    return this;
  }

  private resolveCurrentBody(): FatturaElettronicaBody | undefined {
    const datiGenerali = this.currentBody.datiGenerali;
    let datiBeniServizi = this.currentBody.datiBeniServizi;
    let totaleCalcolato: number | undefined;

    if (!datiBeniServizi && this.currentLinee.length > 0) {
      const { datiRiepilogo, importoTotaleDocumento } = calcolaRiepilogo(this.currentLinee, {
        esigibilitaIVA: this.esigibilitaIVA,
      });
      datiBeniServizi = { dettaglioLinee: this.currentLinee, datiRiepilogo };
      totaleCalcolato = importoTotaleDocumento;
    }

    if (!datiGenerali || !datiBeniServizi) {
      return undefined;
    }

    let resolvedDatiGenerali = datiGenerali;
    if (
      totaleCalcolato !== undefined &&
      datiGenerali.datiGeneraliDocumento.importoTotaleDocumento === undefined
    ) {
      resolvedDatiGenerali = {
        ...datiGenerali,
        datiGeneraliDocumento: {
          ...datiGenerali.datiGeneraliDocumento,
          importoTotaleDocumento: totaleCalcolato,
        },
      };
    }

    return {
      ...this.currentBody,
      datiGenerali: resolvedDatiGenerali,
      datiBeniServizi,
    } as FatturaElettronicaBody;
  }

  private assemble(): FatturaElettronica {
    const bodies = [...this.bodies];
    const current = this.resolveCurrentBody();
    if (current) {
      bodies.push(current);
    }

    if (bodies.length === 0) {
      throw new Error('Nessun body presente nella fattura');
    }

    return {
      versione: this.versione,
      fatturaElettronicaHeader: this.buildHeader(),
      fatturaElettronicaBody: bodies,
    };
  }

  private buildHeader(): FatturaElettronicaHeader {
    if (!this.datiTrasmissione) {
      throw new Error('DatiTrasmissione non impostati');
    }
    if (!this.cedentePrestatore) {
      throw new Error('CedentePrestatore non impostato');
    }
    if (!this.cessionarioCommittente) {
      throw new Error('CessionarioCommittente non impostato');
    }

    const header: FatturaElettronicaHeader = {
      datiTrasmissione: this.datiTrasmissione,
      cedentePrestatore: this.cedentePrestatore,
      cessionarioCommittente: this.cessionarioCommittente,
    };

    if (this.rappresentanteFiscale) {
      header.rappresentanteFiscale = this.rappresentanteFiscale;
    }

    if (this.terzoIntermediario) {
      header.terzoIntermediarioOSoggettoEmittente = this.terzoIntermediario;
    }

    if (this.soggettoEmittente) {
      header.soggettoEmittente = this.soggettoEmittente;
    }

    return header;
  }

  build(): FatturaElettronica {
    return this.assemble();
  }

  validate(options?: ValidationOptions): ValidationResult {
    return new FatturaValidator(options).validate(this.assemble());
  }

  toXml(options?: FatturaSerializerOptions): string {
    return new FatturaSerializer(options).serialize(this.assemble());
  }

  toResult(options?: ToResultOptions): FatturaResult {
    const fattura = this.assemble();
    const datiTrasmissione = fattura.fatturaElettronicaHeader.datiTrasmissione;
    return {
      fattura,
      validazione: new FatturaValidator(options?.validation).validate(fattura),
      xml: new FatturaSerializer(options?.serializer).serialize(fattura),
      filename: nomeFileSdi(
        datiTrasmissione.idTrasmittente.idPaese,
        datiTrasmissione.idTrasmittente.idCodice,
        datiTrasmissione.progressivoInvio
      ),
    };
  }

  reset(): this {
    this.versione = '1.2.2';
    this.datiTrasmissione = undefined;
    this.cedentePrestatore = undefined;
    this.cessionarioCommittente = undefined;
    this.rappresentanteFiscale = undefined;
    this.terzoIntermediario = undefined;
    this.soggettoEmittente = undefined;
    this.bodies = [];
    this.currentBody = {};
    this.currentLinee = [];
    this.esigibilitaIVA = 'I';
    return this;
  }
}
