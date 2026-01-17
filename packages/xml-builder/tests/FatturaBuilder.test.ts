import { describe, it, expect } from 'vitest';
import { FatturaBuilder } from '../src/builder';
import type { CedentePrestatore, CessionarioCommittente, DatiGenerali, DatiBeniServizi } from '../src/types';

// Test fixtures
const cedentePrestatore: CedentePrestatore = {
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
};

const cessionarioCommittente: CessionarioCommittente = {
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
};

const datiGenerali: DatiGenerali = {
  datiGeneraliDocumento: {
    tipoDocumento: 'TD01',
    divisa: 'EUR',
    data: '2024-01-15',
    numero: '1',
  },
};

const datiBeniServizi: DatiBeniServizi = {
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
};

describe('FatturaBuilder', () => {
  describe('create()', () => {
    it('should create a new builder instance', () => {
      const builder = FatturaBuilder.create();
      expect(builder).toBeInstanceOf(FatturaBuilder);
    });
  });

  describe('setTrasmissioneB2B()', () => {
    it('should set B2B transmission data', () => {
      const builder = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
          codiceDestinatario: 'ABC1234',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi);

      const fattura = builder.build();

      expect(fattura.fatturaElettronicaHeader.datiTrasmissione.formatoTrasmissione).toBe('FPR12');
      expect(fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario).toBe('ABC1234');
    });

    it('should use default codiceDestinatario when not provided', () => {
      const builder = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi);

      const fattura = builder.build();

      expect(fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario).toBe('0000000');
    });
  });

  describe('setTrasmissionePA()', () => {
    it('should set PA transmission data', () => {
      const builder = FatturaBuilder.create()
        .setTrasmissionePA({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
          codiceDestinatario: 'ABCDEF',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi);

      const fattura = builder.build();

      expect(fattura.fatturaElettronicaHeader.datiTrasmissione.formatoTrasmissione).toBe('FPA12');
      expect(fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario).toBe('ABCDEF');
    });
  });

  describe('build()', () => {
    it('should build a complete fattura', () => {
      const fattura = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
          codiceDestinatario: 'ABC1234',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi)
        .build();

      expect(fattura.versione).toBe('1.2.2');
      expect(fattura.fatturaElettronicaHeader).toBeDefined();
      expect(fattura.fatturaElettronicaBody).toHaveLength(1);
    });

    it('should throw error when datiTrasmissione is missing', () => {
      const builder = FatturaBuilder.create()
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi);

      expect(() => builder.build()).toThrow('DatiTrasmissione non impostati');
    });

    it('should throw error when cedentePrestatore is missing', () => {
      const builder = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi);

      expect(() => builder.build()).toThrow('CedentePrestatore non impostato');
    });

    it('should throw error when cessionarioCommittente is missing', () => {
      const builder = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi);

      expect(() => builder.build()).toThrow('CessionarioCommittente non impostato');
    });

    it('should throw error when no body is present', () => {
      const builder = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente);

      expect(() => builder.build()).toThrow('Nessun body presente nella fattura');
    });
  });

  describe('multiple bodies (lotti)', () => {
    it('should support multiple bodies', () => {
      const fattura = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi)
        .newBody()
        .setDatiGenerali({
          datiGeneraliDocumento: {
            tipoDocumento: 'TD01',
            divisa: 'EUR',
            data: '2024-01-16',
            numero: '2',
          },
        })
        .setDatiBeniServizi({
          dettaglioLinee: [
            {
              numeroLinea: 1,
              descrizione: 'Altro servizio',
              prezzoUnitario: 50.0,
              prezzoTotale: 50.0,
              aliquotaIVA: 22.0,
            },
          ],
          datiRiepilogo: [
            {
              aliquotaIVA: 22.0,
              imponibileImporto: 50.0,
              imposta: 11.0,
            },
          ],
        })
        .build();

      expect(fattura.fatturaElettronicaBody).toHaveLength(2);
      expect(fattura.fatturaElettronicaBody[0].datiGenerali.datiGeneraliDocumento.numero).toBe('1');
      expect(fattura.fatturaElettronicaBody[1].datiGenerali.datiGeneraliDocumento.numero).toBe('2');
    });
  });

  describe('reset()', () => {
    it('should reset the builder', () => {
      const builder = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi);

      builder.reset();

      // After reset, all data is cleared - body is checked first in build()
      expect(() => builder.build()).toThrow('Nessun body presente nella fattura');
    });
  });

  describe('addDatiPagamento()', () => {
    it('should add payment data', () => {
      const fattura = FatturaBuilder.create()
        .setTrasmissioneB2B({
          idPaese: 'IT',
          idCodice: '01234567890',
          progressivoInvio: '00001',
        })
        .setCedentePrestatore(cedentePrestatore)
        .setCessionarioCommittente(cessionarioCommittente)
        .setDatiGenerali(datiGenerali)
        .setDatiBeniServizi(datiBeniServizi)
        .addDatiPagamento({
          condizioniPagamento: 'TP02',
          dettaglioPagamento: [
            {
              modalitaPagamento: 'MP05',
              importoPagamento: 1220.0,
              iban: 'IT60X0542811101000000123456',
            },
          ],
        })
        .build();

      expect(fattura.fatturaElettronicaBody[0].datiPagamento).toHaveLength(1);
      expect(fattura.fatturaElettronicaBody[0].datiPagamento![0].condizioniPagamento).toBe('TP02');
    });
  });
});
