import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunicationsClient } from '../communications-client.js';
import type { HttpClient } from '@fatturazione-aruba/core';

const createMockHttpClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  postForm: vi.fn(),
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
});

describe('CommunicationsClient', () => {
  let client: CommunicationsClient;
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    client = new CommunicationsClient({
      httpClient: mockHttpClient as unknown as HttpClient,
    });
  });

  describe('createTransmission', () => {
    it('should create transmission for LI type', async () => {
      const mockResponse = { requestId: 'FTRHXHS2LTKXSLZT' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.createTransmission({
        userId: 'ARUBA0000',
        comunicationType: 'LI',
        dataFile: 'dGVzdA==',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/api/v2/comfin',
        {
          userId: 'ARUBA0000',
          comunicationType: 'LI',
          dataFile: 'dGVzdA==',
        }
      );
    });

    it('should create transmission for DTE type', async () => {
      const mockResponse = { requestId: 'ABC123' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.createTransmission({
        comunicationType: 'DTE',
        dataFile: 'dGVzdA==',
      });

      expect(result.requestId).toBe('ABC123');
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/api/v2/comfin',
        {
          comunicationType: 'DTE',
          dataFile: 'dGVzdA==',
        }
      );
    });

    it('should create transmission for DTR type', async () => {
      mockHttpClient.post.mockResolvedValue({ requestId: 'XYZ789' });

      await client.createTransmission({
        comunicationType: 'DTR',
        dataFile: 'dGVzdA==',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/api/v2/comfin',
        {
          comunicationType: 'DTR',
          dataFile: 'dGVzdA==',
        }
      );
    });

    it('should create transmission for ANN type', async () => {
      mockHttpClient.post.mockResolvedValue({ requestId: 'ANN001' });

      await client.createTransmission({
        comunicationType: 'ANN',
        dataFile: 'dGVzdA==',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/api/v2/comfin',
        {
          comunicationType: 'ANN',
          dataFile: 'dGVzdA==',
        }
      );
    });
  });

  describe('getTransmissionInfo', () => {
    it('should get transmission info', async () => {
      const mockResponse = {
        result: 'SF01',
        notifyResult: '',
        elaboratedResult: '',
        receiptTimestamp: '2024-01-15 10:30:00',
        fileId: '6655007627',
        fileName: 'IT01879020517_LI_0001.xml',
        status: '',
        pddAvailable: false,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTransmissionInfo('B8MKQAC4DC');

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/comfin/B8MKQAC4DC'
      );
    });

    it('should get transmission info with elaborated result', async () => {
      const mockResponse = {
        result: 'SF01',
        notifyResult: 'base64xml',
        elaboratedResult: 'ES01',
        receiptTimestamp: '2024-01-15 10:30:00',
        fileId: '6655007627',
        fileName: 'IT01879020517_LI_0001.xml',
        status: 'COMPLETED',
        pddAvailable: true,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getTransmissionInfo('COMPLETED123');

      expect(result.elaboratedResult).toBe('ES01');
      expect(result.pddAvailable).toBe(true);
    });
  });

  describe('getPdd', () => {
    it('should get pdd for request', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      mockHttpClient.get.mockResolvedValue(mockArrayBuffer);

      const result = await client.getPdd('QJ0ACP7FKK');

      expect(result).toBe(mockArrayBuffer);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/comfin/QJ0ACP7FKK/pdd'
      );
    });
  });
});
