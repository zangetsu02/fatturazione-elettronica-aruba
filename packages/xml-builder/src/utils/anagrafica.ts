import type {
  Anagrafica,
  CedentePrestatore,
  CessionarioCommittente,
  Contatti,
  DatiAnagraficiCedente,
  DatiAnagraficiCessionario,
  Indirizzo,
  RegimeFiscale,
} from '../types';

/**
 * Forza un valore a stringa, restituendo `undefined` se vuoto/assente.
 * Difende dai valori tutto-cifre (P.IVA, CAP, telefono) che alcuni runtime
 * (es. `destr` di Nuxt) ri-parsano come `number`.
 */
function str(value: unknown): string | undefined {
  return value == null || value === '' ? undefined : String(value);
}

function buildAnagrafica(input: {
  denominazione?: unknown;
  nome?: unknown;
  cognome?: unknown;
}): Anagrafica {
  const denominazione = str(input.denominazione);
  if (denominazione) {
    return { denominazione };
  }
  const anagrafica: Anagrafica = {};
  const nome = str(input.nome);
  const cognome = str(input.cognome);
  if (nome) anagrafica.nome = nome;
  if (cognome) anagrafica.cognome = cognome;
  return anagrafica;
}

export interface ContattiInput {
  telefono?: unknown;
  email?: unknown;
  fax?: unknown;
}

/** Costruisce un blocco Contatti, restituendo `undefined` se tutto vuoto. */
export function contatti(input: ContattiInput): Contatti | undefined {
  const result: Contatti = {};
  const telefono = str(input.telefono);
  const fax = str(input.fax);
  const email = str(input.email);
  if (telefono) result.telefono = telefono;
  if (fax) result.fax = fax;
  if (email) result.email = email;
  return result.telefono || result.fax || result.email ? result : undefined;
}

export interface SedeInput {
  indirizzo?: unknown;
  numeroCivico?: unknown;
  cap?: unknown;
  comune?: unknown;
  provincia?: unknown;
  /** Default: 'IT' */
  nazione?: unknown;
}

/** Costruisce un Indirizzo (Sede) da campi piatti, con coercizione a stringa. */
export function sede(input: SedeInput): Indirizzo {
  const indirizzo: Indirizzo = {
    indirizzo: str(input.indirizzo) ?? '',
    cap: str(input.cap) ?? '',
    comune: str(input.comune) ?? '',
    nazione: str(input.nazione) ?? 'IT',
  };
  const numeroCivico = str(input.numeroCivico);
  const provincia = str(input.provincia);
  if (numeroCivico) indirizzo.numeroCivico = numeroCivico;
  if (provincia) indirizzo.provincia = provincia;
  return indirizzo;
}

export interface CedentePrestatoreInput extends SedeInput, ContattiInput {
  /** Default IdPaese: 'IT' */
  idPaese?: unknown;
  piva?: unknown;
  codiceFiscale?: unknown;
  denominazione?: unknown;
  nome?: unknown;
  cognome?: unknown;
  /** Default: 'RF01' (ordinario) */
  regimeFiscale?: RegimeFiscale;
}

/**
 * Costruisce un CedentePrestatore da campi piatti, gestendo coercizione a
 * stringa, IdFiscaleIVA/CodiceFiscale, sede e contatti opzionali.
 */
export function cedentePrestatore(input: CedentePrestatoreInput): CedentePrestatore {
  const datiAnagrafici: DatiAnagraficiCedente = {
    anagrafica: buildAnagrafica(input),
    regimeFiscale: input.regimeFiscale ?? 'RF01',
  };

  const piva = str(input.piva);
  if (piva) {
    datiAnagrafici.idFiscaleIVA = { idPaese: str(input.idPaese) ?? 'IT', idCodice: piva };
  }
  const codiceFiscale = str(input.codiceFiscale);
  if (codiceFiscale) datiAnagrafici.codiceFiscale = codiceFiscale;

  const result: CedentePrestatore = { datiAnagrafici, sede: sede(input) };
  const contattiResult = contatti(input);
  if (contattiResult) result.contatti = contattiResult;
  return result;
}

export interface CessionarioInput extends SedeInput {
  /** Default IdPaese: 'IT' */
  idPaese?: unknown;
  piva?: unknown;
  codiceFiscale?: unknown;
  denominazione?: unknown;
  nome?: unknown;
  cognome?: unknown;
}

/**
 * Costruisce un CessionarioCommittente da campi piatti. P.IVA e Codice Fiscale
 * sono entrambi opzionali (un privato può non avere P.IVA).
 */
export function cessionario(input: CessionarioInput): CessionarioCommittente {
  const datiAnagrafici: DatiAnagraficiCessionario = {
    anagrafica: buildAnagrafica(input),
  };

  const piva = str(input.piva);
  if (piva) {
    datiAnagrafici.idFiscaleIVA = { idPaese: str(input.idPaese) ?? 'IT', idCodice: piva };
  }
  const codiceFiscale = str(input.codiceFiscale);
  if (codiceFiscale) datiAnagrafici.codiceFiscale = codiceFiscale;

  return { datiAnagrafici, sede: sede(input) };
}
