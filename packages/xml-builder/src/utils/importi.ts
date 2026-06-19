import type {
  DettaglioLinee,
  DatiRiepilogo,
  EsigibilitaIVA,
  Natura,
  ScontoMaggiorazione,
} from '../types';

/**
 * Converte un valore (number, stringa numerica, null/undefined) in number.
 * I numerici di Postgres/MySQL arrivano spesso come stringa: questo evita di
 * doverli convertire manualmente prima di passarli al builder.
 */
export function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Arrotonda a 2 decimali evitando errori di floating point.
 * (es. 1.005 -> 1.01 invece di 1.00)
 */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcola il PrezzoTotale di una linea applicando eventuali sconti/maggiorazioni,
 * secondo la regola SdI: PrezzoTotale = PrezzoUnitario x Quantità (+/- sconti).
 * Il risultato è arrotondato a 2 decimali.
 */
export function calcolaPrezzoTotale(
  prezzoUnitario: number | string,
  quantita: number | string = 1,
  scontoMaggiorazione?: ScontoMaggiorazione[]
): number {
  const unit = toNumber(prezzoUnitario);
  const qty = toNumber(quantita);
  let totale = unit * qty;

  if (scontoMaggiorazione) {
    for (const sm of scontoMaggiorazione) {
      const delta =
        sm.percentuale !== undefined ? (totale * sm.percentuale) / 100 : (sm.importo ?? 0);
      totale += sm.tipo === 'SC' ? -delta : delta;
    }
  }

  return round2(totale);
}

export interface CalcolaRiepilogoOptions {
  /**
   * EsigibilitaIVA applicata ai gruppi imponibili (default: 'I' - immediata).
   * Non viene applicata ai gruppi con Natura (operazioni non soggette/esenti).
   */
  esigibilitaIVA?: EsigibilitaIVA;
}

export interface RiepilogoResult {
  datiRiepilogo: DatiRiepilogo[];
  /** Somma di (ImponibileImporto + Imposta) di tutti i gruppi, arrotondata. */
  importoTotaleDocumento: number;
}

/**
 * Calcola i DatiRiepilogo (uno per combinazione AliquotaIVA + Natura) e
 * l'ImportoTotaleDocumento a partire dalle DettaglioLinee.
 *
 * Incapsula le regole SdI sui totali (00423/00419): raggruppa le linee per
 * aliquota, somma gli imponibili, calcola l'imposta e il totale documento,
 * arrotondando ogni passaggio a 2 decimali. Evita ai consumer di riscrivere
 * questa logica (fonte tipica di scarti dallo SDI).
 */
export function calcolaRiepilogo(
  linee: DettaglioLinee[],
  options: CalcolaRiepilogoOptions = {}
): RiepilogoResult {
  const esigibilitaIVA = options.esigibilitaIVA ?? 'I';

  const gruppi = new Map<string, { aliquotaIVA: number; natura?: Natura; imponibile: number }>();
  for (const linea of linee) {
    const aliquotaIVA = toNumber(linea.aliquotaIVA);
    const key = `${aliquotaIVA}|${linea.natura ?? ''}`;
    const gruppo = gruppi.get(key) ?? { aliquotaIVA, natura: linea.natura, imponibile: 0 };
    gruppo.imponibile += toNumber(linea.prezzoTotale);
    gruppi.set(key, gruppo);
  }

  const datiRiepilogo: DatiRiepilogo[] = [...gruppi.values()].map((gruppo) => {
    const imponibileImporto = round2(gruppo.imponibile);
    const riepilogo: DatiRiepilogo = {
      aliquotaIVA: gruppo.aliquotaIVA,
      imponibileImporto,
      imposta: round2((imponibileImporto * gruppo.aliquotaIVA) / 100),
    };
    if (gruppo.natura) {
      riepilogo.natura = gruppo.natura;
    } else {
      riepilogo.esigibilitaIVA = esigibilitaIVA;
    }
    return riepilogo;
  });

  const importoTotaleDocumento = round2(
    datiRiepilogo.reduce((tot, r) => tot + r.imponibileImporto + r.imposta, 0)
  );

  return { datiRiepilogo, importoTotaleDocumento };
}
