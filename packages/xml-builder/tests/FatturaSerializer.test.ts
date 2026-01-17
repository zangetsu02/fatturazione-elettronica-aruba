import { describe, it, expect } from 'vitest';
import { FatturaSerializer } from '../src/serializer';
import { FatturaBuilder } from '../src/builder';
import type { FatturaElettronica } from '../src/types';

// Helper to create a minimal valid fattura
function createMinimalFattura(): FatturaElettronica {
  return FatturaBuilder.create()
    .setTrasmissioneB2B({
      idPaese: 'IT',
      idCodice: '01234567890',
      progressivoInvio: '00001',
      codiceDestinatario: 'ABC1234',
    })
    .setCedentePrestatore({
      datiAnagrafici: {
        idFiscaleIVA: {
          idPaese: 'IT',
          idCodice: '01234567890',
        },
        anagrafica: {
          denominazione: 'Azienda Test SRL',
        },
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
        idFiscaleIVA: {
          idPaese: 'IT',
          idCodice: '09876543210',
        },
        anagrafica: {
          denominazione: 'Cliente Test SPA',
        },
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
        data: '2024-01-15',
        numero: '1',
      },
    })
    .setDatiBeniServizi({
      dettaglioLinee: [
        {
          numeroLinea: 1,
          descrizione: 'Servizio di consulenza',
          quantita: 10,
          unitaMisura: 'ore',
          prezzoUnitario: 100.0,
          prezzoTotale: 1000.0,
          aliquotaIVA: 22.0,
        },
      ],
      datiRiepilogo: [
        {
          aliquotaIVA: 22.0,
          imponibileImporto: 1000.0,
          imposta: 220.0,
          esigibilitaIVA: 'I',
        },
      ],
    })
    .build();
}

describe('FatturaSerializer', () => {
  describe('serialize()', () => {
    it('should serialize a fattura to XML', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<p:FatturaElettronica');
      expect(xml).toContain('xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2"');
      expect(xml).toContain('</p:FatturaElettronica>');
    });

    it('should include versione attribute', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('versione="FPR12"');
    });

    it('should include schemaLocation by default', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('xsi:schemaLocation=');
    });

    it('should exclude schemaLocation when option is false', () => {
      const serializer = new FatturaSerializer({ includeSchemaLocation: false });
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).not.toContain('xsi:schemaLocation=');
    });

    it('should serialize header correctly', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<FatturaElettronicaHeader>');
      expect(xml).toContain('<DatiTrasmissione>');
      expect(xml).toContain('<IdPaese>IT</IdPaese>');
      expect(xml).toContain('<IdCodice>01234567890</IdCodice>');
      expect(xml).toContain('<ProgressivoInvio>00001</ProgressivoInvio>');
      expect(xml).toContain('<FormatoTrasmissione>FPR12</FormatoTrasmissione>');
      expect(xml).toContain('<CodiceDestinatario>ABC1234</CodiceDestinatario>');
    });

    it('should serialize cedente prestatore correctly', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<CedentePrestatore>');
      expect(xml).toContain('<Denominazione>Azienda Test SRL</Denominazione>');
      expect(xml).toContain('<RegimeFiscale>RF01</RegimeFiscale>');
      expect(xml).toContain('<Indirizzo>Via Roma 1</Indirizzo>');
      expect(xml).toContain('<CAP>00100</CAP>');
      expect(xml).toContain('<Comune>Roma</Comune>');
    });

    it('should serialize cessionario committente correctly', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<CessionarioCommittente>');
      expect(xml).toContain('<Denominazione>Cliente Test SPA</Denominazione>');
      expect(xml).toContain('<Indirizzo>Via Milano 10</Indirizzo>');
      expect(xml).toContain('<CAP>20100</CAP>');
      expect(xml).toContain('<Comune>Milano</Comune>');
    });

    it('should serialize body correctly', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<FatturaElettronicaBody>');
      expect(xml).toContain('<DatiGenerali>');
      expect(xml).toContain('<TipoDocumento>TD01</TipoDocumento>');
      expect(xml).toContain('<Divisa>EUR</Divisa>');
      expect(xml).toContain('<Data>2024-01-15</Data>');
      expect(xml).toContain('<Numero>1</Numero>');
    });

    it('should serialize linee correctly', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<DatiBeniServizi>');
      expect(xml).toContain('<DettaglioLinee>');
      expect(xml).toContain('<NumeroLinea>1</NumeroLinea>');
      expect(xml).toContain('<Descrizione>Servizio di consulenza</Descrizione>');
      expect(xml).toContain('<Quantita>10.00</Quantita>');
      expect(xml).toContain('<UnitaMisura>ore</UnitaMisura>');
      expect(xml).toContain('<PrezzoUnitario>100.00</PrezzoUnitario>');
      expect(xml).toContain('<PrezzoTotale>1000.00</PrezzoTotale>');
      expect(xml).toContain('<AliquotaIVA>22.00</AliquotaIVA>');
    });

    it('should serialize riepilogo correctly', () => {
      const serializer = new FatturaSerializer();
      const fattura = createMinimalFattura();
      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<DatiRiepilogo>');
      expect(xml).toContain('<ImponibileImporto>1000.00</ImponibileImporto>');
      expect(xml).toContain('<Imposta>220.00</Imposta>');
      expect(xml).toContain('<EsigibilitaIVA>I</EsigibilitaIVA>');
    });

    it('should escape XML special characters', () => {
      const serializer = new FatturaSerializer();
      const fattura = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore({
          datiAnagrafici: {
            idFiscaleIVA: {
              idPaese: 'IT',
              idCodice: '01234567890',
            },
            anagrafica: {
              denominazione: 'Azienda "Test" & Co <SRL>',
            },
            regimeFiscale: 'RF01',
          },
          sede: {
            indirizzo: 'Via Roma 1',
            cap: '00100',
            comune: 'Roma',
            nazione: 'IT',
          },
        })
        .setCessionarioCommittente({
          datiAnagrafici: {
            anagrafica: {
              denominazione: 'Cliente',
            },
          },
          sede: {
            indirizzo: 'Via Test',
            cap: '00100',
            comune: 'Roma',
            nazione: 'IT',
          },
        })
        .setDatiGenerali({
          datiGeneraliDocumento: {
            tipoDocumento: 'TD01',
            divisa: 'EUR',
            data: '2024-01-15',
            numero: '1',
          },
        })
        .setDatiBeniServizi({
          dettaglioLinee: [
            {
              numeroLinea: 1,
              descrizione: 'Test',
              prezzoUnitario: 100,
              prezzoTotale: 100,
              aliquotaIVA: 22,
            },
          ],
          datiRiepilogo: [
            {
              aliquotaIVA: 22,
              imponibileImporto: 100,
              imposta: 22,
            },
          ],
        })
        .build();

      const xml = serializer.serialize(fattura);

      expect(xml).toContain('&quot;Test&quot;');
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&lt;SRL&gt;');
    });

    it('should serialize payment data when present', () => {
      const serializer = new FatturaSerializer();
      const fattura = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore({
          datiAnagrafici: {
            idFiscaleIVA: { idPaese: 'IT', idCodice: '01234567890' },
            anagrafica: { denominazione: 'Test' },
            regimeFiscale: 'RF01',
          },
          sede: { indirizzo: 'Via Test', cap: '00100', comune: 'Roma', nazione: 'IT' },
        })
        .setCessionarioCommittente({
          datiAnagrafici: { anagrafica: { denominazione: 'Cliente' } },
          sede: { indirizzo: 'Via Test', cap: '00100', comune: 'Roma', nazione: 'IT' },
        })
        .setDatiGenerali({
          datiGeneraliDocumento: {
            tipoDocumento: 'TD01',
            divisa: 'EUR',
            data: '2024-01-15',
            numero: '1',
          },
        })
        .setDatiBeniServizi({
          dettaglioLinee: [{ numeroLinea: 1, descrizione: 'Test', prezzoUnitario: 100, prezzoTotale: 100, aliquotaIVA: 22 }],
          datiRiepilogo: [{ aliquotaIVA: 22, imponibileImporto: 100, imposta: 22 }],
        })
        .addDatiPagamento({
          condizioniPagamento: 'TP02',
          dettaglioPagamento: [
            {
              modalitaPagamento: 'MP05',
              importoPagamento: 122.0,
              iban: 'IT60X0542811101000000123456',
              dataScadenzaPagamento: '2024-02-15',
            },
          ],
        })
        .build();

      const xml = serializer.serialize(fattura);

      expect(xml).toContain('<DatiPagamento>');
      expect(xml).toContain('<CondizioniPagamento>TP02</CondizioniPagamento>');
      expect(xml).toContain('<ModalitaPagamento>MP05</ModalitaPagamento>');
      expect(xml).toContain('<ImportoPagamento>122.00</ImportoPagamento>');
      expect(xml).toContain('<IBAN>IT60X0542811101000000123456</IBAN>');
      expect(xml).toContain('<DataScadenzaPagamento>2024-02-15</DataScadenzaPagamento>');
    });
  });
});
