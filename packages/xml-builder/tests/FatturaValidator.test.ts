import { describe, it, expect } from 'vitest';
import { FatturaValidator, validateFattura } from '../src/validation';
import { FatturaBuilder } from '../src/builder';
import type { FatturaElettronica } from '../src/types';

// Helper to create a valid fattura
function createValidFattura(): FatturaElettronica {
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
        codiceFiscale: 'RSSMRA80A01H501U',
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

describe('FatturaValidator', () => {
  describe('validate()', () => {
    it('should validate a correct fattura', () => {
      const fattura = createValidFattura();
      const result = validateFattura(fattura);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const fattura = createValidFattura();
      // @ts-expect-error - Testing invalid data
      fattura.fatturaElettronicaHeader.datiTrasmissione.progressivoInvio = '';

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.includes('progressivoInvio'))).toBe(true);
    });

    it('should validate codice destinatario length for B2B', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario = 'TOOLONG1';

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_LENGTH')).toBe(true);
    });

    it('should validate codice destinatario length for PA', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.datiTrasmissione.formatoTrasmissione = 'FPA12';
      fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario = 'ABCDEFG'; // 7 chars, should be 6

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_LENGTH')).toBe(true);
    });

    it('should validate partita IVA italiana format', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.idFiscaleIVA = {
        idPaese: 'IT',
        idCodice: '123', // Invalid - too short
      };

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_PIVA')).toBe(true);
    });

    it('should validate codice fiscale format', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.codiceFiscale = 'INVALID';

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_CF')).toBe(true);
    });

    it('should accept valid codice fiscale for persona fisica', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.codiceFiscale =
        'RSSMRA80A01H501U';

      const result = validateFattura(fattura);

      expect(result.errors.filter((e) => e.code === 'INVALID_CF')).toHaveLength(0);
    });

    it('should accept valid partita IVA as codice fiscale for persona giuridica', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.codiceFiscale =
        '01234567890';

      const result = validateFattura(fattura);

      expect(result.errors.filter((e) => e.code === 'INVALID_CF')).toHaveLength(0);
    });

    it('should validate Italian CAP format', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.sede.cap = '123'; // Invalid

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_CAP')).toBe(true);
    });

    it('should validate country code format', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.sede.nazione = 'ITA'; // Invalid - should be 2 chars

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_COUNTRY_CODE')).toBe(true);
    });

    it('should validate date format', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiGenerali.datiGeneraliDocumento.data = '15/01/2024'; // Invalid format

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_DATE_FORMAT')).toBe(true);
    });

    it('should require natura when aliquotaIVA is 0', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee[0].aliquotaIVA = 0;
      // natura is not set

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'REQUIRED_WHEN_ZERO_VAT')).toBe(true);
    });

    it('should validate when natura is present with zero aliquota', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee[0].aliquotaIVA = 0;
      fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee[0].natura = 'N1';
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].aliquotaIVA = 0;
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].natura = 'N1';
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].imposta = 0;

      const result = validateFattura(fattura);

      expect(result.errors.filter((e) => e.code === 'REQUIRED_WHEN_ZERO_VAT')).toHaveLength(0);
    });

    it('should detect duplicate line numbers', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee.push({
        numeroLinea: 1, // Duplicate
        descrizione: 'Another service',
        prezzoUnitario: 50,
        prezzoTotale: 50,
        aliquotaIVA: 22,
      });

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'DUPLICATE_LINE_NUMBER')).toBe(true);
    });

    it('should require anagrafica with denominazione or nome+cognome', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.anagrafica = {
        // Neither denominazione nor nome/cognome
      };

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_ANAGRAFIC_DATA')).toBe(true);
    });

    it('should require at least one fiscal identifier for cedente', () => {
      const fattura = createValidFattura();
      delete fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.idFiscaleIVA;
      delete fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.codiceFiscale;

      const result = validateFattura(fattura);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_FISCAL_ID')).toBe(true);
    });
  });

  describe('warnings', () => {
    it('should generate warning when PEC is missing with codiceDestinatario 0000000', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario = '0000000';
      // pecDestinatario is not set

      const result = validateFattura(fattura);

      expect(result.warnings.some((w) => w.code === 'MISSING_PEC')).toBe(true);
    });

    it('should generate warning when riferimentoNormativo is missing with natura', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee[0].aliquotaIVA = 0;
      fattura.fatturaElettronicaBody[0].datiBeniServizi.dettaglioLinee[0].natura = 'N1';
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].aliquotaIVA = 0;
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].natura = 'N1';
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].imposta = 0;
      // riferimentoNormativo is not set

      const result = validateFattura(fattura);

      expect(result.warnings.some((w) => w.code === 'MISSING_REFERENCE')).toBe(true);
    });
  });

  describe('options', () => {
    it('should treat warnings as errors in strict mode', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.datiTrasmissione.codiceDestinatario = '0000000';

      const result = validateFattura(fattura, { strict: true });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_PEC')).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should skip codice fiscale validation when disabled', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.codiceFiscale = 'INVALID';

      const result = validateFattura(fattura, { validateCodiceFiscale: false });

      expect(result.errors.filter((e) => e.code === 'INVALID_CF')).toHaveLength(0);
    });

    it('should skip partita IVA validation when disabled', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaHeader.cedentePrestatore.datiAnagrafici.idFiscaleIVA = {
        idPaese: 'IT',
        idCodice: 'INVALID',
      };

      const result = validateFattura(fattura, { validatePartitaIVA: false });

      expect(result.errors.filter((e) => e.code === 'INVALID_PIVA')).toHaveLength(0);
    });

    it('should skip date validation when disabled', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiGenerali.datiGeneraliDocumento.data = '15/01/2024';

      const result = validateFattura(fattura, { validateDates: false });

      expect(result.errors.filter((e) => e.code === 'INVALID_DATE_FORMAT')).toHaveLength(0);
    });
  });

  describe('totals validation', () => {
    it('should warn when imponibile does not match line totals', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].imponibileImporto = 999.0; // Should be 1000

      const result = validateFattura(fattura);

      expect(result.warnings.some((w) => w.code === 'TOTAL_MISMATCH')).toBe(true);
    });

    it('should warn when imposta does not match calculated tax', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].imposta = 200.0; // Should be 220

      const result = validateFattura(fattura);

      expect(result.warnings.some((w) => w.code === 'TAX_MISMATCH')).toBe(true);
    });

    it('should skip totals validation when disabled', () => {
      const fattura = createValidFattura();
      fattura.fatturaElettronicaBody[0].datiBeniServizi.datiRiepilogo[0].imponibileImporto = 999.0;

      const result = validateFattura(fattura, { validateTotals: false });

      expect(result.warnings.filter((w) => w.code === 'TOTAL_MISMATCH')).toHaveLength(0);
    });
  });
});
