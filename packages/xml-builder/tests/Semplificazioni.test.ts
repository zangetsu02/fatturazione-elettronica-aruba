import { describe, it, expect } from 'vitest';
import {
  FatturaBuilder,
  FatturaSerializer,
  calcolaRiepilogo,
  calcolaPrezzoTotale,
  toNumber,
  round2,
  nomeFileSdi,
  cedentePrestatore,
  cessionario,
  sede,
  contatti,
  type DettaglioLinee,
} from '../src';

describe('toNumber / round2', () => {
  it('coerce stringhe numeriche (numeric Postgres) e gestisce null', () => {
    expect(toNumber('12.50')).toBe(12.5);
    expect(toNumber(42)).toBe(42);
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber('abc')).toBe(0);
  });

  it('arrotonda a 2 decimali senza errori di floating point', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(3000)).toBe(3000);
  });
});

describe('calcolaPrezzoTotale', () => {
  it('calcola prezzo unitario per quantità', () => {
    expect(calcolaPrezzoTotale(75, 40)).toBe(3000);
    expect(calcolaPrezzoTotale('10.5', '3')).toBe(31.5);
  });

  it('applica sconti e maggiorazioni', () => {
    expect(calcolaPrezzoTotale(100, 1, [{ tipo: 'SC', percentuale: 10 }])).toBe(90);
    expect(calcolaPrezzoTotale(100, 1, [{ tipo: 'MG', importo: 5 }])).toBe(105);
  });
});

describe('calcolaRiepilogo', () => {
  const linee: DettaglioLinee[] = [
    { numeroLinea: 1, descrizione: 'A', prezzoUnitario: 100, prezzoTotale: 100, aliquotaIVA: 22 },
    { numeroLinea: 2, descrizione: 'B', prezzoUnitario: 50, prezzoTotale: 50, aliquotaIVA: 22 },
    { numeroLinea: 3, descrizione: 'C', prezzoUnitario: 200, prezzoTotale: 200, aliquotaIVA: 10 },
  ];

  it('raggruppa per aliquota, calcola imposta e totale documento', () => {
    const { datiRiepilogo, importoTotaleDocumento } = calcolaRiepilogo(linee);

    const al22 = datiRiepilogo.find((r) => r.aliquotaIVA === 22);
    const al10 = datiRiepilogo.find((r) => r.aliquotaIVA === 10);

    expect(datiRiepilogo).toHaveLength(2);
    expect(al22).toMatchObject({ imponibileImporto: 150, imposta: 33, esigibilitaIVA: 'I' });
    expect(al10).toMatchObject({ imponibileImporto: 200, imposta: 20 });
    // 150 + 33 + 200 + 20
    expect(importoTotaleDocumento).toBe(403);
  });

  it('mantiene la Natura e non forza esigibilità sui gruppi non imponibili', () => {
    const { datiRiepilogo } = calcolaRiepilogo([
      { numeroLinea: 1, descrizione: 'RC', prezzoUnitario: 100, prezzoTotale: 100, aliquotaIVA: 0, natura: 'N6.9' },
    ]);
    expect(datiRiepilogo[0]).toMatchObject({ aliquotaIVA: 0, natura: 'N6.9', imposta: 0 });
    expect(datiRiepilogo[0]?.esigibilitaIVA).toBeUndefined();
  });

  it('rispetta esigibilitaIVA passata via opzioni', () => {
    const { datiRiepilogo } = calcolaRiepilogo(linee, { esigibilitaIVA: 'S' });
    expect(datiRiepilogo.every((r) => r.esigibilitaIVA === 'S')).toBe(true);
  });
});

describe('nomeFileSdi', () => {
  it('costruisce il nome file con progressivo paddato a 5', () => {
    expect(nomeFileSdi('IT', '01234567890', '1')).toBe('IT01234567890_00001.xml');
    expect(nomeFileSdi('IT', '01234567890', 42)).toBe('IT01234567890_00042.xml');
    expect(nomeFileSdi('IT', '01234567890', 'ABCDE')).toBe('IT01234567890_ABCDE.xml');
  });
});

describe('helper anagrafici', () => {
  it('sede applica default nazione e omette campi vuoti', () => {
    expect(sede({ indirizzo: 'Via Roma 1', cap: 20100, comune: 'Milano', provincia: 'MI' })).toEqual({
      indirizzo: 'Via Roma 1',
      cap: '20100',
      comune: 'Milano',
      provincia: 'MI',
      nazione: 'IT',
    });
  });

  it('contatti ritorna undefined se tutto vuoto', () => {
    expect(contatti({})).toBeUndefined();
    expect(contatti({ telefono: 0o6123456 })).toBeDefined();
  });

  it('cedentePrestatore costruisce la struttura nested con coercizione', () => {
    const c = cedentePrestatore({
      piva: 1234567890, // number -> coerced
      denominazione: 'Acme Srl',
      indirizzo: 'Via Roma 1',
      cap: 100,
      comune: 'Roma',
      provincia: 'RM',
      email: 'info@acme.it',
    });
    expect(c.datiAnagrafici.idFiscaleIVA).toEqual({ idPaese: 'IT', idCodice: '1234567890' });
    expect(c.datiAnagrafici.regimeFiscale).toBe('RF01');
    expect(c.datiAnagrafici.anagrafica).toEqual({ denominazione: 'Acme Srl' });
    expect(c.contatti).toEqual({ email: 'info@acme.it' });
    expect(c.sede.cap).toBe('100');
  });

  it('cessionario rende opzionale la P.IVA', () => {
    const c = cessionario({ codiceFiscale: 'RSSMRA80A01H501U', denominazione: 'Mario Rossi', comune: 'Roma' });
    expect(c.datiAnagrafici.idFiscaleIVA).toBeUndefined();
    expect(c.datiAnagrafici.codiceFiscale).toBe('RSSMRA80A01H501U');
  });
});

describe('FatturaBuilder - auto-calcolo via addLinea', () => {
  function buildBase() {
    return FatturaBuilder.create()
      .setTrasmissioneB2B({ idPaese: 'IT', idCodice: '01234567890', progressivoInvio: '1', codiceDestinatario: 'ABC1234' })
      .setCedentePrestatore(
        cedentePrestatore({
          piva: '01234567890',
          denominazione: 'Acme Srl',
          regimeFiscale: 'RF01',
          indirizzo: 'Via Roma 1',
          cap: '00100',
          comune: 'Roma',
          provincia: 'RM',
        })
      )
      .setCessionarioCommittente(
        cessionario({
          piva: '09876543210',
          denominazione: 'Beta Spa',
          indirizzo: 'Via Milano 10',
          cap: '20100',
          comune: 'Milano',
          provincia: 'MI',
        })
      )
      .setDatiGenerali({
        datiGeneraliDocumento: { tipoDocumento: 'TD01', divisa: 'EUR', data: '2026-06-19', numero: '1' },
      });
  }

  it('numera le linee, calcola prezzoTotale, riepilogo e importoTotaleDocumento', () => {
    const fattura = buildBase()
      .addLinea({ descrizione: 'Consulenza', quantita: 40, prezzoUnitario: 75, aliquotaIVA: 22 })
      .addLinea({ descrizione: 'Licenza', quantita: 1, prezzoUnitario: 200, aliquotaIVA: 22 })
      .build();

    const body = fattura.fatturaElettronicaBody[0]!;
    expect(body.datiBeniServizi.dettaglioLinee.map((l) => l.numeroLinea)).toEqual([1, 2]);
    expect(body.datiBeniServizi.dettaglioLinee[0]?.prezzoTotale).toBe(3000);
    expect(body.datiBeniServizi.datiRiepilogo).toHaveLength(1);
    expect(body.datiBeniServizi.datiRiepilogo[0]).toMatchObject({
      imponibileImporto: 3200,
      imposta: 704,
    });
    // 3200 + 704
    expect(body.datiGenerali.datiGeneraliDocumento.importoTotaleDocumento).toBe(3904);
  });

  it('non sovrascrive un importoTotaleDocumento fornito esplicitamente', () => {
    const fattura = buildBase()
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD01',
          divisa: 'EUR',
          data: '2026-06-19',
          numero: '1',
          importoTotaleDocumento: 9999,
        },
      })
      .addLinea({ descrizione: 'X', quantita: 1, prezzoUnitario: 100, aliquotaIVA: 22 })
      .build();
    expect(fattura.fatturaElettronicaBody[0]?.datiGenerali.datiGeneraliDocumento.importoTotaleDocumento).toBe(9999);
  });

  it('toResult ritorna fattura valida, xml e filename SDI; assemble è ripetibile', () => {
    const builder = buildBase().addLinea({ descrizione: 'X', quantita: 2, prezzoUnitario: 100, aliquotaIVA: 22 });
    const result = builder.toResult();

    expect(result.validazione.valid).toBe(true);
    expect(result.filename).toBe('IT01234567890_00001.xml');
    expect(result.xml).toContain('<ImportoTotaleDocumento>244.00</ImportoTotaleDocumento>');
    // chiamare di nuovo non deve duplicare i body
    expect(builder.build().fatturaElettronicaBody).toHaveLength(1);
  });
});

describe('FatturaSerializer - robustezza ai tipi', () => {
  it('serializza valori numerici dove ci si aspetta stringhe senza crashare', () => {
    // simula valori arrivati come number (es. da destr/Postgres)
    const fattura = FatturaBuilder.create()
      .setTrasmissioneB2B({ idPaese: 'IT', idCodice: 1234567890 as unknown as string, progressivoInvio: 1 as unknown as string })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: 1234567890 as unknown as string },
          anagrafica: { denominazione: 'Acme Srl' },
          regimeFiscale: 'RF01',
        },
        sede: { indirizzo: 'Via Roma 1', cap: 100 as unknown as string, comune: 'Roma', provincia: 'RM', nazione: 'IT' },
      })
      .setCessionarioCommittente(
        cessionario({ piva: '09876543210', denominazione: 'Beta Spa', indirizzo: 'Via Milano 10', cap: '20100', comune: 'Milano', provincia: 'MI' })
      )
      .setDatiGenerali({ datiGeneraliDocumento: { tipoDocumento: 'TD01', divisa: 'EUR', data: '2026-06-19', numero: 1 as unknown as string } })
      .addLinea({ descrizione: 'X', quantita: 1, prezzoUnitario: 100, aliquotaIVA: 22 })
      .build();

    const xml = new FatturaSerializer().serialize(fattura);
    expect(xml).toContain('<IdCodice>1234567890</IdCodice>');
    expect(xml).toContain('<CAP>100</CAP>');
    expect(xml).toContain('<Numero>1</Numero>');
  });

  it('formatta la quantità con precisione fino a 8 decimali (non tronca a 2)', () => {
    const fattura = FatturaBuilder.create()
      .setTrasmissioneB2B({ idPaese: 'IT', idCodice: '01234567890', progressivoInvio: '1' })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' },
          anagrafica: { denominazione: 'Acme' },
          regimeFiscale: 'RF01',
        },
        sede: { indirizzo: 'Via Roma 1', cap: '00100', comune: 'Roma', provincia: 'RM', nazione: 'IT' },
      })
      .setCessionarioCommittente({
        datiAnagrafici: { idFiscaleIVA: { idPaese: 'IT', idCodice: '09876543210' }, anagrafica: { denominazione: 'Beta' } },
        sede: { indirizzo: 'Via Milano 10', cap: '20100', comune: 'Milano', provincia: 'MI', nazione: 'IT' },
      })
      .setDatiGenerali({ datiGeneraliDocumento: { tipoDocumento: 'TD01', divisa: 'EUR', data: '2026-06-19', numero: '1' } })
      .addLinea({ descrizione: 'Materiale', quantita: 0.001, prezzoUnitario: 1000, aliquotaIVA: 22 })
      .build();

    const xml = new FatturaSerializer().serialize(fattura);
    expect(xml).toContain('<Quantita>0.001</Quantita>');
    // quantità intera resta con i 2 decimali minimi
    expect(new FatturaSerializer().serialize(
      FatturaBuilder.create()
        .setTrasmissioneB2B({ idPaese: 'IT', idCodice: '01234567890', progressivoInvio: '1' })
        .setCedentePrestatore({ datiAnagrafici: { idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' }, anagrafica: { denominazione: 'A' }, regimeFiscale: 'RF01' }, sede: { indirizzo: 'V', cap: '00100', comune: 'R', provincia: 'RM', nazione: 'IT' } })
        .setCessionarioCommittente({ datiAnagrafici: { idFiscaleIVA: { idPaese: 'IT', idCodice: '09876543210' }, anagrafica: { denominazione: 'B' } }, sede: { indirizzo: 'V', cap: '20100', comune: 'M', provincia: 'MI', nazione: 'IT' } })
        .setDatiGenerali({ datiGeneraliDocumento: { tipoDocumento: 'TD01', divisa: 'EUR', data: '2026-06-19', numero: '1' } })
        .addLinea({ descrizione: 'X', quantita: 5, prezzoUnitario: 10, aliquotaIVA: 22 })
        .build()
    )).toContain('<Quantita>5.00</Quantita>');
  });
});
