import type {
  TipoDocumento,
  Natura,
  TipoCessionePrestazione,
  ModalitaPagamento,
  CondizioniPagamento,
  TipoRitenuta,
  TipoCassa,
  TipoScontoMaggiorazione,
  EsigibilitaIVA,
  CausalePagamento,
} from './enums';
import type { IdFiscaleIVA, Anagrafica } from './header';

export interface DatiRitenuta {
  tipoRitenuta: TipoRitenuta;
  importoRitenuta: number;
  aliquotaRitenuta: number;
  causalePagamento: CausalePagamento;
}

export interface DatiBollo {
  bolloVirtuale: 'SI';
  importoBollo: number;
}

export interface DatiCassaPrevidenziale {
  tipoCassa: TipoCassa;
  alCassa: number;
  importoContributoCassa: number;
  imponibileCassa?: number;
  aliquotaIVA: number;
  ritenuta?: 'SI';
  natura?: Natura;
  riferimentoAmministrazione?: string;
}

export interface ScontoMaggiorazione {
  tipo: TipoScontoMaggiorazione;
  percentuale?: number;
  importo?: number;
}

export interface DatiGeneraliDocumento {
  tipoDocumento: TipoDocumento;
  divisa: string;
  data: string;
  numero: string;
  datiRitenuta?: DatiRitenuta;
  datiBollo?: DatiBollo;
  datiCassaPrevidenziale?: DatiCassaPrevidenziale[];
  scontoMaggiorazione?: ScontoMaggiorazione[];
  importoTotaleDocumento?: number;
  arrotondamento?: number;
  causale?: string[];
  art73?: 'SI';
}

export interface DatiDocumentoCorrelato {
  riferimentoNumeroLinea?: number[];
  idDocumento: string;
  data?: string;
  numItem?: string;
  codiceCommessaConvenzione?: string;
  codiceCUP?: string;
  codiceCIG?: string;
}

export interface DatiSAL {
  riferimentoFase: number;
}

export interface DatiDDT {
  numeroDDT: string;
  dataDDT: string;
  riferimentoNumeroLinea?: number[];
}

export interface DatiAnagraficiVettore {
  idFiscaleIVA?: IdFiscaleIVA;
  codiceFiscale?: string;
  anagrafica: Anagrafica;
  numeroLicenzaGuida?: string;
}

export interface IndirizzoResa {
  indirizzo: string;
  numeroCivico?: string;
  cap: string;
  comune: string;
  provincia?: string;
  nazione: string;
}

export interface DatiTrasporto {
  datiAnagraficiVettore?: DatiAnagraficiVettore;
  mezzoTrasporto?: string;
  causaleTrasporto?: string;
  numeroColli?: number;
  descrizione?: string;
  unitaMisuraPeso?: string;
  pesoLordo?: number;
  pesoNetto?: number;
  dataOraRitiro?: string;
  dataInizioTrasporto?: string;
  tipoResa?: string;
  indirizzoResa?: IndirizzoResa;
  dataOraConsegna?: string;
}

export interface FatturaPrincipale {
  numeroFatturaPrincipale: string;
  dataFatturaPrincipale: string;
}

export interface DatiGenerali {
  datiGeneraliDocumento: DatiGeneraliDocumento;
  datiOrdineAcquisto?: DatiDocumentoCorrelato[];
  datiContratto?: DatiDocumentoCorrelato[];
  datiConvenzione?: DatiDocumentoCorrelato[];
  datiRicezione?: DatiDocumentoCorrelato[];
  datiFattureCollegate?: DatiDocumentoCorrelato[];
  datiSAL?: DatiSAL[];
  datiDDT?: DatiDDT[];
  datiTrasporto?: DatiTrasporto;
  fatturaPrincipale?: FatturaPrincipale;
}

export interface CodiceArticolo {
  codiceTipo: string;
  codiceValore: string;
}

export interface AltriDatiGestionali {
  tipoDato: string;
  riferimentoTesto?: string;
  riferimentoNumero?: number;
  riferimentoData?: string;
}

export interface DettaglioLinee {
  numeroLinea: number;
  tipoCessionePrestazione?: TipoCessionePrestazione;
  codiceArticolo?: CodiceArticolo[];
  descrizione: string;
  quantita?: number;
  unitaMisura?: string;
  dataInizioPeriodo?: string;
  dataFinePeriodo?: string;
  prezzoUnitario: number;
  scontoMaggiorazione?: ScontoMaggiorazione[];
  prezzoTotale: number;
  aliquotaIVA: number;
  ritenuta?: 'SI';
  natura?: Natura;
  riferimentoAmministrazione?: string;
  altriDatiGestionali?: AltriDatiGestionali[];
}

export interface DatiRiepilogo {
  aliquotaIVA: number;
  natura?: Natura;
  speseAccessorie?: number;
  arrotondamento?: number;
  imponibileImporto: number;
  imposta: number;
  esigibilitaIVA?: EsigibilitaIVA;
  riferimentoNormativo?: string;
}

export interface DatiBeniServizi {
  dettaglioLinee: DettaglioLinee[];
  datiRiepilogo: DatiRiepilogo[];
}

export interface DatiVeicoli {
  data: string;
  totalePercorso: string;
}

export interface DettaglioPagamento {
  beneficiario?: string;
  modalitaPagamento: ModalitaPagamento;
  dataRiferimentoTerminiPagamento?: string;
  giorniTerminiPagamento?: number;
  dataScadenzaPagamento?: string;
  importoPagamento: number;
  codUfficioPostale?: string;
  cognomeQuietanzante?: string;
  nomeQuietanzante?: string;
  cfQuietanzante?: string;
  titoloQuietanzante?: string;
  istitutoFinanziario?: string;
  iban?: string;
  abi?: string;
  cab?: string;
  bic?: string;
  scontoPagamentoAnticipato?: number;
  dataLimitePagamentoAnticipato?: string;
  penalitaPagamentiRitardati?: number;
  dataDecorrenzaPenale?: string;
  codicePagamento?: string;
}

export interface DatiPagamento {
  condizioniPagamento: CondizioniPagamento;
  dettaglioPagamento: DettaglioPagamento[];
}

export interface Allegati {
  nomeAttachment: string;
  algoritmoCompressione?: string;
  formatoAttachment?: string;
  descrizioneAttachment?: string;
  attachment: string;
}

export interface FatturaElettronicaBody {
  datiGenerali: DatiGenerali;
  datiBeniServizi: DatiBeniServizi;
  datiVeicoli?: DatiVeicoli;
  datiPagamento?: DatiPagamento[];
  allegati?: Allegati[];
}
