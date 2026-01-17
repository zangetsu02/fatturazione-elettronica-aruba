import type { FatturaElettronicaHeader } from './header';
import type { FatturaElettronicaBody } from './body';

export type VersioneSchema = '1.2' | '1.2.1' | '1.2.2';

export interface FatturaElettronica {
  versione: VersioneSchema;
  fatturaElettronicaHeader: FatturaElettronicaHeader;
  fatturaElettronicaBody: FatturaElettronicaBody[];
}

export interface FatturaInput {
  header: FatturaElettronicaHeader;
  body: FatturaElettronicaBody;
}

export interface FatturaLottoInput {
  header: FatturaElettronicaHeader;
  bodies: FatturaElettronicaBody[];
}
