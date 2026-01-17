import type {
  FormatoTrasmissione,
  RegimeFiscale,
  SocioUnico,
  StatoLiquidazione,
  SoggettoEmittente,
} from './enums';

export interface IdFiscaleIVA {
  idPaese: string;
  idCodice: string;
}

export interface Anagrafica {
  denominazione?: string;
  nome?: string;
  cognome?: string;
  titolo?: string;
  codEORI?: string;
}

export interface Indirizzo {
  indirizzo: string;
  numeroCivico?: string;
  cap: string;
  comune: string;
  provincia?: string;
  nazione: string;
}

export interface Contatti {
  telefono?: string;
  fax?: string;
  email?: string;
}

export interface IscrizioneREA {
  ufficio: string;
  numeroREA: string;
  capitaleSociale?: number;
  socioUnico?: SocioUnico;
  statoLiquidazione: StatoLiquidazione;
}

export interface StabileOrganizzazione {
  indirizzo: string;
  numeroCivico?: string;
  cap: string;
  comune: string;
  provincia?: string;
  nazione: string;
}

export interface IdTrasmittente {
  idPaese: string;
  idCodice: string;
}

export interface DatiTrasmissione {
  idTrasmittente: IdTrasmittente;
  progressivoInvio: string;
  formatoTrasmissione: FormatoTrasmissione;
  codiceDestinatario: string;
  pecDestinatario?: string;
  contattiTrasmittente?: Contatti;
}

export interface DatiAnagraficiCedente {
  idFiscaleIVA?: IdFiscaleIVA;
  codiceFiscale?: string;
  anagrafica: Anagrafica;
  alboProfessionale?: string;
  provinciaAlbo?: string;
  numeroIscrizioneAlbo?: string;
  dataIscrizioneAlbo?: string;
  regimeFiscale: RegimeFiscale;
}

export interface CedentePrestatore {
  datiAnagrafici: DatiAnagraficiCedente;
  sede: Indirizzo;
  stabileOrganizzazione?: StabileOrganizzazione;
  iscrizioneREA?: IscrizioneREA;
  contatti?: Contatti;
  riferimentoAmministrazione?: string;
}

export interface DatiAnagraficiRappresentante {
  idFiscaleIVA: IdFiscaleIVA;
  codiceFiscale?: string;
  anagrafica: Anagrafica;
}

export interface RappresentanteFiscale {
  datiAnagrafici: DatiAnagraficiRappresentante;
}

export interface DatiAnagraficiCessionario {
  idFiscaleIVA?: IdFiscaleIVA;
  codiceFiscale?: string;
  anagrafica: Anagrafica;
}

export interface RappresentanteFiscaleCessionario {
  idFiscaleIVA: IdFiscaleIVA;
  denominazione?: string;
  nome?: string;
  cognome?: string;
}

export interface CessionarioCommittente {
  datiAnagrafici: DatiAnagraficiCessionario;
  sede: Indirizzo;
  stabileOrganizzazione?: StabileOrganizzazione;
  rappresentanteFiscale?: RappresentanteFiscaleCessionario;
}

export interface DatiAnagraficiTerzo {
  idFiscaleIVA?: IdFiscaleIVA;
  codiceFiscale?: string;
  anagrafica: Anagrafica;
}

export interface TerzoIntermediarioOSoggettoEmittente {
  datiAnagrafici: DatiAnagraficiTerzo;
}

export interface FatturaElettronicaHeader {
  datiTrasmissione: DatiTrasmissione;
  cedentePrestatore: CedentePrestatore;
  rappresentanteFiscale?: RappresentanteFiscale;
  cessionarioCommittente: CessionarioCommittente;
  terzoIntermediarioOSoggettoEmittente?: TerzoIntermediarioOSoggettoEmittente;
  soggettoEmittente?: SoggettoEmittente;
}
