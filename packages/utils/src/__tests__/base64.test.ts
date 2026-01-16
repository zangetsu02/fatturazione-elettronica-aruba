import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64, decodeBase64ToString } from '../base64.js';

describe('base64', () => {
  describe('encodeBase64', () => {
    it('should encode string to base64', () => {
      const result = encodeBase64('test');
      expect(result).toBe('dGVzdA==');
    });

    it('should encode Uint8Array to base64', () => {
      const data = new Uint8Array([116, 101, 115, 116]);
      const result = encodeBase64(data);
      expect(result).toBe('dGVzdA==');
    });

    it('should encode empty string', () => {
      const result = encodeBase64('');
      expect(result).toBe('');
    });

    it('should encode XML content', () => {
      const xml = '<?xml version="1.0"?><test/>';
      const result = encodeBase64(xml);
      expect(result).toBe('PD94bWwgdmVyc2lvbj0iMS4wIj8+PHRlc3QvPg==');
    });
  });

  describe('decodeBase64', () => {
    it('should decode base64 to Uint8Array', () => {
      const result = decodeBase64('dGVzdA==');
      expect(result).toEqual(new Uint8Array([116, 101, 115, 116]));
    });

    it('should decode empty string', () => {
      const result = decodeBase64('');
      expect(result).toEqual(new Uint8Array([]));
    });
  });

  describe('decodeBase64ToString', () => {
    it('should decode base64 to string', () => {
      const result = decodeBase64ToString('dGVzdA==');
      expect(result).toBe('test');
    });

    it('should decode XML content', () => {
      const result = decodeBase64ToString('PD94bWwgdmVyc2lvbj0iMS4wIj8+PHRlc3QvPg==');
      expect(result).toBe('<?xml version="1.0"?><test/>');
    });
  });

  describe('roundtrip', () => {
    it('should encode and decode back to original', () => {
      const original = 'Hello, World!';
      const encoded = encodeBase64(original);
      const decoded = decodeBase64ToString(encoded);
      expect(decoded).toBe(original);
    });
  });
});
