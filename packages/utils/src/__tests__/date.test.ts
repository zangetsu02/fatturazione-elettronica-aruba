import { describe, it, expect } from 'vitest';
import {
  formatDateISO,
  formatDateOnly,
  formatDateAruba,
  parseArubaDate,
  getDateRange,
} from '../date.js';

describe('date', () => {
  describe('formatDateISO', () => {
    it('should format date to ISO string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = formatDateISO(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('formatDateOnly', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = formatDateOnly(date);
      expect(result).toBe('2024-01-15');
    });
  });

  describe('formatDateAruba', () => {
    it('should format date to Aruba format', () => {
      const date = new Date(2024, 0, 15, 10, 30, 45);
      const result = formatDateAruba(date);
      expect(result).toBe('2024-01-15 10:30:45');
    });

    it('should pad single digit values', () => {
      const date = new Date(2024, 0, 5, 9, 5, 5);
      const result = formatDateAruba(date);
      expect(result).toBe('2024-01-05 09:05:05');
    });
  });

  describe('parseArubaDate', () => {
    it('should parse Aruba date format', () => {
      const result = parseArubaDate('2024-01-15 10:30:45');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('getDateRange', () => {
    it('should return date range for given days', () => {
      const result = getDateRange(2);
      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();

      const start = new Date(result.startDate);
      const end = new Date(result.endDate);
      const diffMs = end.getTime() - start.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeCloseTo(2, 0);
    });

    it('should return ISO formatted dates', () => {
      const result = getDateRange(1);
      expect(result.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
