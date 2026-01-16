import { describe, it, expect } from 'vitest';
import {
  SYNC_ERROR_CODES,
  ASYNC_ERROR_CODES,
  INVOICE_STATUS,
  DOCUMENT_TYPES,
  NOTIFICATION_TYPES,
  ESITO_TYPES,
  COMMUNICATION_TYPES,
  TRANSMISSION_RESULTS,
  ELABORATED_RESULTS,
} from '../constants.js';

describe('constants', () => {
  describe('SYNC_ERROR_CODES', () => {
    it('should have success code', () => {
      expect(SYNC_ERROR_CODES['0000']).toBe('Operazione effettuata');
    });

    it('should have duplicate file code', () => {
      expect(SYNC_ERROR_CODES['0001']).toBe('Nome file già presente nel sistema');
    });

    it('should have service unavailable code', () => {
      expect(SYNC_ERROR_CODES['0096']).toBe('Servizio non disponibile');
    });
  });

  describe('ASYNC_ERROR_CODES', () => {
    it('should have IdTrasmittente error', () => {
      expect(ASYNC_ERROR_CODES.FATRSM212).toBe('IdTrasmittente diverso da quello Aruba');
    });
  });

  describe('INVOICE_STATUS', () => {
    it('should have all statuses', () => {
      expect(INVOICE_STATUS.INVIATA).toBe('Inviata');
      expect(INVOICE_STATUS.CONSEGNATA).toBe('Consegnata');
      expect(INVOICE_STATUS.SCARTATA).toBe('Scartata');
      expect(INVOICE_STATUS.ACCETTATA).toBe('Accettata');
      expect(INVOICE_STATUS.RIFIUTATA).toBe('Rifiutata');
    });
  });

  describe('DOCUMENT_TYPES', () => {
    it('should have fattura', () => {
      expect(DOCUMENT_TYPES.TD01).toBe('Fattura');
    });

    it('should have nota di credito', () => {
      expect(DOCUMENT_TYPES.TD04).toBe('Nota di credito');
    });

    it('should have autofattura types', () => {
      expect(DOCUMENT_TYPES.TD16).toBeDefined();
      expect(DOCUMENT_TYPES.TD17).toBeDefined();
      expect(DOCUMENT_TYPES.TD20).toBeDefined();
    });
  });

  describe('NOTIFICATION_TYPES', () => {
    it('should have all notification types', () => {
      expect(NOTIFICATION_TYPES.RC).toBe('Ricevuta di Consegna');
      expect(NOTIFICATION_TYPES.NS).toBe('Notifica di Scarto');
      expect(NOTIFICATION_TYPES.MC).toBe('Mancata Consegna');
      expect(NOTIFICATION_TYPES.NE).toBe('Notifica Esito');
      expect(NOTIFICATION_TYPES.DT).toBe('Decorrenza Termini');
      expect(NOTIFICATION_TYPES.AT).toBe('Attestazione di Trasmissione');
    });
  });

  describe('ESITO_TYPES', () => {
    it('should have esito types', () => {
      expect(ESITO_TYPES.EC01).toBe('Accettazione');
      expect(ESITO_TYPES.EC02).toBe('Rifiuto');
    });
  });

  describe('COMMUNICATION_TYPES', () => {
    it('should have communication types', () => {
      expect(COMMUNICATION_TYPES.LI).toBe('Comunicazione liquidazioni periodiche IVA');
      expect(COMMUNICATION_TYPES.DTE).toBe('Dati fatture emesse');
      expect(COMMUNICATION_TYPES.DTR).toBe('Dati fatture ricevute');
      expect(COMMUNICATION_TYPES.ANN).toBe('Annullamento');
    });
  });

  describe('TRANSMISSION_RESULTS', () => {
    it('should have transmission results', () => {
      expect(TRANSMISSION_RESULTS.SF01).toBe('File ricevuto');
      expect(TRANSMISSION_RESULTS.SF02).toBe('File in elaborazione');
      expect(TRANSMISSION_RESULTS.SF03).toBe('File elaborato');
    });
  });

  describe('ELABORATED_RESULTS', () => {
    it('should have elaborated results', () => {
      expect(ELABORATED_RESULTS.ES01).toBe('File accettato');
      expect(ELABORATED_RESULTS.ES02).toBe('File accettato con segnalazioni');
      expect(ELABORATED_RESULTS.ES03).toBe('File scartato');
    });
  });
});
