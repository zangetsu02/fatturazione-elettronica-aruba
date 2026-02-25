import { describe, it, expect } from 'vitest';

// Import validation rules
import {
  validateIdFiscaleIVA,
  validateCodiceFiscale,
  validatePecDestinatario,
  validateCodiceDestinatario,
} from '../validation/rules/anagrafica.rules';

import {
  validateNumeroLinea,
  validateAliquotaIVA,
  validateImpostaRiepilogo,
} from '../validation/rules/importi.rules';

import {
  validateIBAN,
  validateBIC,
  validateABI,
  validateCAB,
  validateModalitaPagamento,
} from '../validation/rules/pagamenti.rules';

import {
  validateCoerenzaRitenuta,
  validateCoerenzaCassaPrevidenziale,
  validateNatura,
  validateTipoDocumento,
} from '../validation/rules/coerenza.rules';

// ============================================================================
// ANAGRAFICA RULES TESTS
// ============================================================================

describe('Anagrafica Rules', () => {
  describe('validateIdFiscaleIVA (SDI 00401)', () => {
    it('should pass for valid Italian IdFiscaleIVA', () => {
      const result = validateIdFiscaleIVA(
        { idPaese: 'IT', idCodice: '12345678901' },
        'test.idFiscaleIVA',
        true
      );
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid Italian PIVA (wrong length)', () => {
      const result = validateIdFiscaleIVA(
        { idPaese: 'IT', idCodice: '1234567890' }, // 10 cifre invece di 11
        'test.idFiscaleIVA',
        true
      );
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.code === '00401')).toBe(true);
    });

    it('should fail for invalid country code format', () => {
      const result = validateIdFiscaleIVA(
        { idPaese: 'it', idCodice: '12345678901' }, // lowercase
        'test.idFiscaleIVA',
        true
      );
      expect(result.errors.some((e) => e.code === '00401')).toBe(true);
    });

    it('should pass for non-Italian IdFiscaleIVA without PIVA validation', () => {
      const result = validateIdFiscaleIVA(
        { idPaese: 'DE', idCodice: 'DE123456789' },
        'test.idFiscaleIVA',
        false
      );
      expect(result.errors).toHaveLength(0);
    });

    it('should handle undefined input', () => {
      const result = validateIdFiscaleIVA(undefined, 'test.idFiscaleIVA', true);
      expect(result.errors).toHaveLength(0); // Non richiesto se undefined
    });
  });

  describe('validateCodiceFiscale (SDI 00403)', () => {
    it('should pass for valid persona fisica CF', () => {
      const result = validateCodiceFiscale('RSSMRA80A01H501U', 'test.cf');
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid persona giuridica CF (11 digits)', () => {
      const result = validateCodiceFiscale('12345678901', 'test.cf');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid CF format', () => {
      const result = validateCodiceFiscale('INVALID', 'test.cf');
      expect(result.errors.some((e) => e.code === '00403')).toBe(true);
    });

    it('should fail for CF with wrong pattern (persona fisica)', () => {
      const result = validateCodiceFiscale('1234567890123456', 'test.cf'); // 16 numeri invece di lettere+numeri
      expect(result.errors.some((e) => e.code === '00403')).toBe(true);
    });
  });

  describe('validatePecDestinatario (SDI 00411)', () => {
    it('should require PEC when CodiceDestinatario is 0000000', () => {
      const result = validatePecDestinatario(undefined, '0000000', 'test');
      expect(result.errors.some((e) => e.code === '00411')).toBe(true);
    });

    it('should pass when PEC is provided with CodiceDestinatario 0000000', () => {
      const result = validatePecDestinatario('test@pec.it', '0000000', 'test');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid PEC format', () => {
      const result = validatePecDestinatario('invalid-email', '0000000', 'test');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should not require PEC for other CodiceDestinatario', () => {
      const result = validatePecDestinatario(undefined, 'ABC1234', 'test');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateCodiceDestinatario', () => {
    it('should pass for valid PA code (6 chars)', () => {
      const result = validateCodiceDestinatario('ABCDEF', 'FPA12', 'test');
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid B2B code (7 chars)', () => {
      const result = validateCodiceDestinatario('ABCDEFG', 'FPR12', 'test');
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for 0000000 B2B code', () => {
      const result = validateCodiceDestinatario('0000000', 'FPR12', 'test');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for wrong length PA code', () => {
      const result = validateCodiceDestinatario('ABCDEFG', 'FPA12', 'test');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// IMPORTI RULES TESTS
// ============================================================================

describe('Importi Rules', () => {
  describe('validateNumeroLinea', () => {
    it('should pass for valid line number', () => {
      const result = validateNumeroLinea(1, 'test.numeroLinea');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for line number 0', () => {
      const result = validateNumeroLinea(0, 'test.numeroLinea');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for line number exceeding max', () => {
      const result = validateNumeroLinea(10000, 'test.numeroLinea');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for non-integer', () => {
      const result = validateNumeroLinea(1.5, 'test.numeroLinea');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateAliquotaIVA', () => {
    it('should pass for standard VAT rate 22%', () => {
      const result = validateAliquotaIVA(22, 'test.aliquota');
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should pass for 0% with warning for non-standard', () => {
      const result = validateAliquotaIVA(0, 'test.aliquota');
      expect(result.errors).toHaveLength(0);
    });

    it('should warn for non-standard VAT rate', () => {
      const result = validateAliquotaIVA(15, 'test.aliquota');
      expect(result.errors).toHaveLength(0);
      expect(result.warnings.some((w) => w.code === 'NON_STANDARD_ALIQUOTA')).toBe(true);
    });

    it('should fail for VAT rate > 100', () => {
      const result = validateAliquotaIVA(150, 'test.aliquota');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for negative VAT rate', () => {
      const result = validateAliquotaIVA(-5, 'test.aliquota');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateImpostaRiepilogo', () => {
    it('should pass for correct tax calculation', () => {
      const result = validateImpostaRiepilogo(100, 22, 22, 'test');
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn for incorrect tax calculation', () => {
      const result = validateImpostaRiepilogo(100, 22, 25, 'test'); // Atteso 22, trovato 25
      expect(result.warnings.some((w) => w.code === 'IMPOSTA_MISMATCH')).toBe(true);
    });

    it('should pass with small rounding difference', () => {
      const result = validateImpostaRiepilogo(100, 22, 22.009, 'test');
      expect(result.warnings).toHaveLength(0);
    });
  });
});

// ============================================================================
// PAGAMENTI RULES TESTS
// ============================================================================

describe('Pagamenti Rules', () => {
  describe('validateIBAN', () => {
    it('should pass for valid Italian IBAN', () => {
      const result = validateIBAN('IT60X0542811101000000123456', 'test.iban');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid IBAN format', () => {
      const result = validateIBAN('INVALID', 'test.iban');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for Italian IBAN with wrong length', () => {
      const result = validateIBAN('IT60X05428111010000001234', 'test.iban'); // Too short
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined', () => {
      const result = validateIBAN(undefined, 'test.iban');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateBIC', () => {
    it('should pass for valid 8-char BIC', () => {
      const result = validateBIC('UNCRITM1', 'test.bic');
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid 11-char BIC', () => {
      const result = validateBIC('UNCRITM1XXX', 'test.bic');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid BIC', () => {
      const result = validateBIC('INVALID', 'test.bic');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateABI', () => {
    it('should pass for valid ABI', () => {
      const result = validateABI('05428', 'test.abi');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid ABI', () => {
      const result = validateABI('1234', 'test.abi'); // Too short
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCAB', () => {
    it('should pass for valid CAB', () => {
      const result = validateCAB('11101', 'test.cab');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid CAB', () => {
      const result = validateCAB('ABC', 'test.cab');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateModalitaPagamento', () => {
    it('should pass for valid modalita (MP05 Bonifico)', () => {
      const result = validateModalitaPagamento('MP05', 'test.modalita');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid modalita', () => {
      const result = validateModalitaPagamento('MP99', 'test.modalita');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when undefined', () => {
      const result = validateModalitaPagamento(undefined, 'test.modalita');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// COERENZA RULES TESTS
// ============================================================================

describe('Coerenza Rules', () => {
  describe('validateCoerenzaRitenuta (SDI 00419)', () => {
    it('should fail when DatiRitenuta present but no line has Ritenuta SI', () => {
      const result = validateCoerenzaRitenuta(
        { tipoRitenuta: 'RT01', importoRitenuta: 100, aliquotaRitenuta: 20, causalePagamento: 'A' },
        [{ numeroLinea: 1, aliquotaIVA: 22 }], // No ritenuta
        undefined,
        'test'
      );
      expect(result.errors.some((e) => e.code === '00419')).toBe(true);
    });

    it('should pass when DatiRitenuta present and line has Ritenuta SI', () => {
      const result = validateCoerenzaRitenuta(
        { tipoRitenuta: 'RT01', importoRitenuta: 100, aliquotaRitenuta: 20, causalePagamento: 'A' },
        [{ numeroLinea: 1, ritenuta: 'SI', aliquotaIVA: 22 }],
        undefined,
        'test'
      );
      expect(result.errors).toHaveLength(0);
    });

    it('should pass when no DatiRitenuta', () => {
      const result = validateCoerenzaRitenuta(
        undefined,
        [{ numeroLinea: 1, aliquotaIVA: 22 }],
        undefined,
        'test'
      );
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateCoerenzaCassaPrevidenziale (SDI 00420)', () => {
    it('should fail when Cassa has Ritenuta SI but no DatiRitenuta', () => {
      const result = validateCoerenzaCassaPrevidenziale(
        undefined,
        [{ tipoCassa: 'TC01', alCassa: 4, importoContributoCassa: 40, aliquotaIVA: 22, ritenuta: 'SI' }],
        'test'
      );
      expect(result.errors.some((e) => e.code === '00420')).toBe(true);
    });

    it('should pass when Cassa has Ritenuta SI and DatiRitenuta exists', () => {
      const result = validateCoerenzaCassaPrevidenziale(
        { tipoRitenuta: 'RT01', importoRitenuta: 100, aliquotaRitenuta: 20, causalePagamento: 'A' },
        [{ tipoCassa: 'TC01', alCassa: 4, importoContributoCassa: 40, aliquotaIVA: 22, ritenuta: 'SI' }],
        'test'
      );
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateNatura', () => {
    it('should require Natura when AliquotaIVA is 0', () => {
      const result = validateNatura(undefined, 0, 'test.natura');
      expect(result.errors.some((e) => e.code === 'REQUIRED_WHEN_ZERO_VAT')).toBe(true);
    });

    it('should pass for valid Natura with AliquotaIVA 0', () => {
      const result = validateNatura('N1', 0, 'test.natura');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid Natura value', () => {
      const result = validateNatura('N99', 0, 'test.natura');
      expect(result.errors.some((e) => e.code === 'INVALID_NATURA')).toBe(true);
    });

    it('should warn for deprecated Natura (N2, N3, N6)', () => {
      const result = validateNatura('N2', 0, 'test.natura');
      expect(result.warnings.some((w) => w.code === 'DEPRECATED_NATURA')).toBe(true);
    });

    it('should fail when Natura present with AliquotaIVA > 0', () => {
      const result = validateNatura('N1', 22, 'test.natura');
      expect(result.errors.some((e) => e.code === 'NATURA_WITH_POSITIVE_VAT')).toBe(true);
    });

    it('should pass when no Natura with AliquotaIVA > 0', () => {
      const result = validateNatura(undefined, 22, 'test.natura');
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateTipoDocumento', () => {
    it('should pass for valid TipoDocumento', () => {
      const result = validateTipoDocumento('TD01', 'test.tipoDocumento');
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid TipoDocumento', () => {
      const result = validateTipoDocumento('TD99', 'test.tipoDocumento');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when undefined', () => {
      const result = validateTipoDocumento(undefined, 'test.tipoDocumento');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
