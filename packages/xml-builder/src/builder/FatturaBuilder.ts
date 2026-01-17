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
  DatiPagamento,
  Allegati,
  DatiVeicoli,
  SoggettoEmittente,
  VersioneSchema,
} from '../types';

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
    if (this.currentBody.datiGenerali && this.currentBody.datiBeniServizi) {
      this.bodies.push(this.currentBody as FatturaElettronicaBody);
      this.currentBody = {};
    }
    return this;
  }

  newBody(): this {
    this.finalizeBody();
    return this;
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
    if (this.currentBody.datiGenerali && this.currentBody.datiBeniServizi) {
      this.bodies.push(this.currentBody as FatturaElettronicaBody);
    }

    if (this.bodies.length === 0) {
      throw new Error('Nessun body presente nella fattura');
    }

    return {
      versione: this.versione,
      fatturaElettronicaHeader: this.buildHeader(),
      fatturaElettronicaBody: this.bodies,
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
    return this;
  }
}
