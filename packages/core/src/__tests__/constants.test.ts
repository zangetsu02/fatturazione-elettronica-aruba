import { describe, it, expect } from 'vitest';
import {
  ARUBA_ID_TRASMITTENTE,
  ARUBA_CODICE_DESTINATARIO,
  ARUBA_COUNTRY_CODE,
} from '../constants.js';

describe('constants', () => {
  it('should have correct IdTrasmittente', () => {
    expect(ARUBA_ID_TRASMITTENTE).toBe('01879020517');
  });

  it('should have correct CodiceDestinatario', () => {
    expect(ARUBA_CODICE_DESTINATARIO).toBe('KRRH6B9');
  });

  it('should have correct country code', () => {
    expect(ARUBA_COUNTRY_CODE).toBe('IT');
  });
});
