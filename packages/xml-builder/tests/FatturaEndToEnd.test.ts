import { describe, it, expect } from 'vitest';
import { FatturaBuilder } from '../src/builder';
import { FatturaSerializer } from '../src/serializer';
import { validateFattura } from '../src/validation';

describe('Fattura End-to-End', () => {
  it('should build, validate and serialize a complete B2B invoice', () => {
    const fattura = FatturaBuilder.create()
      .setTrasmissioneB2B({
        idPaese: 'IT',
        idCodice: '01234567890',
        progressivoInvio: '00001',
        codiceDestinatario: 'ABC1234',
      })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' },
          anagrafica: { denominazione: 'Mario Rossi SRL' },
          regimeFiscale: 'RF01',
        },
        sede: {
          indirizzo: 'Via Roma 1',
          cap: '00100',
          comune: 'Roma',
          provincia: 'RM',
          nazione: 'IT',
        },
      })
      .setCessionarioCommittente({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '09876543210' },
          anagrafica: { denominazione: 'Luigi Bianchi SPA' },
        },
        sede: {
          indirizzo: 'Via Milano 10',
          cap: '20100',
          comune: 'Milano',
          provincia: 'MI',
          nazione: 'IT',
        },
      })
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD01',
          divisa: 'EUR',
          data: '2026-02-25',
          numero: '1',
          causale: ['Fattura per servizi di consulenza informatica'],
        },
      })
      .setDatiBeniServizi({
        dettaglioLinee: [
          {
            numeroLinea: 1,
            descrizione: 'Sviluppo software gestionale',
            quantita: 40,
            unitaMisura: 'ore',
            prezzoUnitario: 75.00,
            prezzoTotale: 3000.00,
            aliquotaIVA: 22.00,
          },
          {
            numeroLinea: 2,
            descrizione: 'Configurazione server',
            quantita: 8,
            unitaMisura: 'ore',
            prezzoUnitario: 50.00,
            prezzoTotale: 400.00,
            aliquotaIVA: 22.00,
          },
        ],
        datiRiepilogo: [
          {
            aliquotaIVA: 22.00,
            imponibileImporto: 3400.00,
            imposta: 748.00,
            esigibilitaIVA: 'I',
          },
        ],
      })
      .addDatiPagamento({
        condizioniPagamento: 'TP02',
        dettaglioPagamento: [
          {
            modalitaPagamento: 'MP05',
            importoPagamento: 4148.00,
            iban: 'IT60X0542811101000000123456',
            dataScadenzaPagamento: '2026-03-27',
          },
        ],
      })
      .build();

    // Structure checks
    expect(fattura.versione).toBe('1.2.2');
    expect(fattura.fatturaElettronicaHeader.datiTrasmissione.formatoTrasmissione).toBe('FPR12');
    expect(fattura.fatturaElettronicaBody).toHaveLength(1);
    expect(fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee).toHaveLength(2);
    expect(fattura.fatturaElettronicaBody[0].datiPagamento).toHaveLength(1);

    // Validation
    const validation = validateFattura(fattura, { validateTotals: true });
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // Serialization
    const serializer = new FatturaSerializer();
    const xml = serializer.serialize(fattura);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<p:FatturaElettronica');
    expect(xml).toContain('versione="FPR12"');
    expect(xml).toContain('<Denominazione>Mario Rossi SRL</Denominazione>');
    expect(xml).toContain('<Denominazione>Luigi Bianchi SPA</Denominazione>');
    expect(xml).toContain('<TipoDocumento>TD01</TipoDocumento>');
    expect(xml).toContain('<Descrizione>Sviluppo software gestionale</Descrizione>');
    expect(xml).toContain('<Descrizione>Configurazione server</Descrizione>');
    expect(xml).toContain('<ImponibileImporto>3400.00</ImponibileImporto>');
    expect(xml).toContain('<Imposta>748.00</Imposta>');
    expect(xml).toContain('<ModalitaPagamento>MP05</ModalitaPagamento>');
    expect(xml).toContain('<IBAN>IT60X0542811101000000123456</IBAN>');
    expect(xml).toContain('</p:FatturaElettronica>');
  });

  it('should build a PA invoice', () => {
    const fattura = FatturaBuilder.create()
      .setTrasmissionePA({
        idPaese: 'IT',
        idCodice: '01234567890',
        progressivoInvio: '00002',
        codiceDestinatario: 'AABBCC',
      })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' },
          anagrafica: { denominazione: 'Fornitore PA SRL' },
          regimeFiscale: 'RF01',
        },
        sede: {
          indirizzo: 'Via Torino 5',
          cap: '10100',
          comune: 'Torino',
          provincia: 'TO',
          nazione: 'IT',
        },
      })
      .setCessionarioCommittente({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '80000000001' },
          anagrafica: { denominazione: 'Comune di Torino' },
        },
        sede: {
          indirizzo: 'Piazza Palazzo di Citta 1',
          cap: '10122',
          comune: 'Torino',
          provincia: 'TO',
          nazione: 'IT',
        },
      })
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD01',
          divisa: 'EUR',
          data: '2026-02-25',
          numero: '1/PA',
        },
      })
      .setDatiBeniServizi({
        dettaglioLinee: [
          {
            numeroLinea: 1,
            descrizione: 'Fornitura cancelleria',
            quantita: 100,
            unitaMisura: 'pz',
            prezzoUnitario: 2.50,
            prezzoTotale: 250.00,
            aliquotaIVA: 22.00,
          },
        ],
        datiRiepilogo: [
          {
            aliquotaIVA: 22.00,
            imponibileImporto: 250.00,
            imposta: 55.00,
            esigibilitaIVA: 'S',
          },
        ],
      })
      .build();

    expect(fattura.fatturaElettronicaHeader.datiTrasmissione.formatoTrasmissione).toBe('FPA12');
    expect(fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario).toBe('AABBCC');

    const validation = validateFattura(fattura);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    const xml = new FatturaSerializer().serialize(fattura);
    expect(xml).toContain('versione="FPA12"');
    expect(xml).toContain('<EsigibilitaIVA>S</EsigibilitaIVA>');
  });

  it('should build an invoice with nota di credito', () => {
    const fattura = FatturaBuilder.create()
      .setTrasmissioneB2B({
        idPaese: 'IT',
        idCodice: '01234567890',
        progressivoInvio: '00003',
        codiceDestinatario: 'XYZ9876',
      })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' },
          anagrafica: { denominazione: 'Azienda SRL' },
          regimeFiscale: 'RF01',
        },
        sede: {
          indirizzo: 'Via Napoli 20',
          cap: '80100',
          comune: 'Napoli',
          provincia: 'NA',
          nazione: 'IT',
        },
      })
      .setCessionarioCommittente({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '09876543210' },
          anagrafica: { denominazione: 'Cliente SRL' },
        },
        sede: {
          indirizzo: 'Via Firenze 3',
          cap: '50100',
          comune: 'Firenze',
          provincia: 'FI',
          nazione: 'IT',
        },
      })
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD04',
          divisa: 'EUR',
          data: '2026-02-25',
          numero: 'NC/1',
          causale: ['Nota di credito per merce difettosa'],
        },
        datiFattureCollegate: [
          {
            idDocumento: '1',
            data: '2026-01-15',
          },
        ],
      })
      .setDatiBeniServizi({
        dettaglioLinee: [
          {
            numeroLinea: 1,
            descrizione: 'Storno merce difettosa',
            quantita: 5,
            unitaMisura: 'pz',
            prezzoUnitario: 100.00,
            prezzoTotale: 500.00,
            aliquotaIVA: 22.00,
          },
        ],
        datiRiepilogo: [
          {
            aliquotaIVA: 22.00,
            imponibileImporto: 500.00,
            imposta: 110.00,
            esigibilitaIVA: 'I',
          },
        ],
      })
      .build();

    expect(fattura.fatturaElettronicaBody[0].datiGenerali.datiGeneraliDocumento.tipoDocumento).toBe('TD04');
    expect(fattura.fatturaElettronicaBody[0].datiGenerali.datiFattureCollegate).toHaveLength(1);

    const validation = validateFattura(fattura);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    const xml = new FatturaSerializer().serialize(fattura);
    expect(xml).toContain('<TipoDocumento>TD04</TipoDocumento>');
    expect(xml).toContain('<IdDocumento>1</IdDocumento>');
  });

  it('should build an invoice with regime forfettario and natura N2.2', () => {
    const fattura = FatturaBuilder.create()
      .setTrasmissioneB2B({
        idPaese: 'IT',
        idCodice: '01234567890',
        progressivoInvio: '00004',
        codiceDestinatario: '0000000',
        pecDestinatario: 'cliente@pec.it',
      })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' },
          codiceFiscale: 'RSSMRA85M01H501Z',
          anagrafica: { nome: 'Mario', cognome: 'Rossi' },
          regimeFiscale: 'RF19',
        },
        sede: {
          indirizzo: 'Via Bologna 8',
          cap: '40100',
          comune: 'Bologna',
          provincia: 'BO',
          nazione: 'IT',
        },
      })
      .setCessionarioCommittente({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '09876543210' },
          anagrafica: { denominazione: 'Azienda Cliente SRL' },
        },
        sede: {
          indirizzo: 'Via Venezia 15',
          cap: '30100',
          comune: 'Venezia',
          provincia: 'VE',
          nazione: 'IT',
        },
      })
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD01',
          divisa: 'EUR',
          data: '2026-02-25',
          numero: '1',
          datiBollo: {
            bolloVirtuale: 'SI',
            importoBollo: 2.00,
          },
        },
      })
      .setDatiBeniServizi({
        dettaglioLinee: [
          {
            numeroLinea: 1,
            descrizione: 'Prestazione professionale',
            quantita: 1,
            prezzoUnitario: 5000.00,
            prezzoTotale: 5000.00,
            aliquotaIVA: 0.00,
            natura: 'N2.2',
          },
        ],
        datiRiepilogo: [
          {
            aliquotaIVA: 0.00,
            natura: 'N2.2',
            imponibileImporto: 5000.00,
            imposta: 0.00,
            riferimentoNormativo: 'Art.1 commi 54-89 L.190/2014 - Regime forfettario',
          },
        ],
      })
      .addDatiPagamento({
        condizioniPagamento: 'TP02',
        dettaglioPagamento: [
          {
            modalitaPagamento: 'MP05',
            importoPagamento: 5000.00,
            iban: 'IT60X0542811101000000123456',
            dataScadenzaPagamento: '2026-03-27',
          },
        ],
      })
      .build();

    expect(fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.regimeFiscale).toBe('RF19');
    expect(fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee[0].natura).toBe('N2.2');

    const validation = validateFattura(fattura, { validateTotals: true });
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    const xml = new FatturaSerializer().serialize(fattura);
    expect(xml).toContain('<RegimeFiscale>RF19</RegimeFiscale>');
    expect(xml).toContain('<Natura>N2.2</Natura>');
    expect(xml).toContain('<BolloVirtuale>SI</BolloVirtuale>');
    expect(xml).toContain('<PECDestinatario>cliente@pec.it</PECDestinatario>');
  });

  it('should build a batch invoice with multiple bodies', () => {
    const fattura = FatturaBuilder.create()
      .setTrasmissioneB2B({
        idPaese: 'IT',
        idCodice: '01234567890',
        progressivoInvio: '00005',
        codiceDestinatario: 'ABC1234',
      })
      .setCedentePrestatore({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' },
          anagrafica: { denominazione: 'Fornitore Lotto SRL' },
          regimeFiscale: 'RF01',
        },
        sede: {
          indirizzo: 'Via Genova 4',
          cap: '16100',
          comune: 'Genova',
          provincia: 'GE',
          nazione: 'IT',
        },
      })
      .setCessionarioCommittente({
        datiAnagrafici: {
          idFiscaleIVA: { idPaese: 'IT', idCodice: '09876543210' },
          anagrafica: { denominazione: 'Cliente Lotto SPA' },
        },
        sede: {
          indirizzo: 'Via Palermo 7',
          cap: '90100',
          comune: 'Palermo',
          provincia: 'PA',
          nazione: 'IT',
        },
      })
      // First invoice
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD01',
          divisa: 'EUR',
          data: '2026-02-20',
          numero: '10',
        },
      })
      .setDatiBeniServizi({
        dettaglioLinee: [
          {
            numeroLinea: 1,
            descrizione: 'Prodotto A',
            quantita: 10,
            unitaMisura: 'pz',
            prezzoUnitario: 25.00,
            prezzoTotale: 250.00,
            aliquotaIVA: 22.00,
          },
        ],
        datiRiepilogo: [
          {
            aliquotaIVA: 22.00,
            imponibileImporto: 250.00,
            imposta: 55.00,
            esigibilitaIVA: 'I',
          },
        ],
      })
      .newBody()
      // Second invoice
      .setDatiGenerali({
        datiGeneraliDocumento: {
          tipoDocumento: 'TD01',
          divisa: 'EUR',
          data: '2026-02-25',
          numero: '11',
        },
      })
      .setDatiBeniServizi({
        dettaglioLinee: [
          {
            numeroLinea: 1,
            descrizione: 'Prodotto B',
            quantita: 5,
            unitaMisura: 'pz',
            prezzoUnitario: 80.00,
            prezzoTotale: 400.00,
            aliquotaIVA: 22.00,
          },
        ],
        datiRiepilogo: [
          {
            aliquotaIVA: 22.00,
            imponibileImporto: 400.00,
            imposta: 88.00,
            esigibilitaIVA: 'I',
          },
        ],
      })
      .build();

    expect(fattura.fatturaElettronicaBody).toHaveLength(2);
    expect(fattura.fatturaElettronicaBody[0].datiGenerali.datiGeneraliDocumento.numero).toBe('10');
    expect(fattura.fatturaElettronicaBody[1].datiGenerali.datiGeneraliDocumento.numero).toBe('11');

    const validation = validateFattura(fattura, { validateTotals: true });
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    const xml = new FatturaSerializer().serialize(fattura);
    expect(xml).toContain('<Descrizione>Prodotto A</Descrizione>');
    expect(xml).toContain('<Descrizione>Prodotto B</Descrizione>');
  });
});
