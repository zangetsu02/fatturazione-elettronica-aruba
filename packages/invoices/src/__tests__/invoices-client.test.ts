import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoicesClient } from '../invoices-client.js';
import type { HttpClient } from '@fatturazione-aruba/core';

const createMockHttpClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  postForm: vi.fn(),
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
});

describe('InvoicesClient', () => {
  let client: InvoicesClient;
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    client = new InvoicesClient({
      httpClient: mockHttpClient as unknown as HttpClient,
    });
  });

  describe('upload', () => {
    it('should upload invoice', async () => {
      const mockResponse = {
        errorCode: '0000',
        errorDescription: 'Operazione effettuata',
        uploadFileName: 'IT01879020517_jtlk1.xml.p7m',
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.upload({
        dataFile: 'dGVzdA==',
        dryRun: false,
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/services/invoice/upload',
        { dataFile: 'dGVzdA==', dryRun: false }
      );
    });

    it('should upload invoice with all options', async () => {
      const mockResponse = {
        errorCode: '0000',
        errorDescription: 'Operazione effettuata',
        uploadFileName: 'IT01879020517_jtlk1.xml.p7m',
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      await client.upload({
        dataFile: 'dGVzdA==',
        credential: 'cred',
        domain: 'domain',
        senderPIVA: 'IT12345678901',
        skipExtraSchema: true,
        dryRun: true,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/services/invoice/upload',
        {
          dataFile: 'dGVzdA==',
          credential: 'cred',
          domain: 'domain',
          senderPIVA: 'IT12345678901',
          skipExtraSchema: true,
          dryRun: true,
        }
      );
    });
  });

  describe('uploadSigned', () => {
    it('should upload signed invoice', async () => {
      const mockResponse = {
        errorCode: '0000',
        errorDescription: 'Operazione effettuata',
        uploadFileName: 'IT01879020517_jtlk1.xml.p7m',
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.uploadSigned({
        dataFile: 'dGVzdA==',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/services/invoice/uploadSigned',
        { dataFile: 'dGVzdA==' }
      );
    });
  });

  describe('findSent', () => {
    it('should find sent invoices', async () => {
      const mockResponse = {
        content: [],
        first: true,
        last: true,
        totalElements: 0,
        totalPages: 0,
        size: 10,
        page: 1,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.findSent({
        creationStartDate: '2024-01-01T00:00:00Z',
        creationEndDate: '2024-01-02T00:00:00Z',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out',
        {
          creationStartDate: '2024-01-01T00:00:00Z',
          creationEndDate: '2024-01-02T00:00:00Z',
        }
      );
    });

    it('should find sent invoices with all params', async () => {
      mockHttpClient.get.mockResolvedValue({ content: [] });

      await client.findSent({
        creationStartDate: '2024-01-01T00:00:00Z',
        creationEndDate: '2024-01-02T00:00:00Z',
        page: 1,
        size: 50,
        senderCountry: 'IT',
        senderVatcode: '12345678901',
        receiverCountry: 'IT',
        receiverVatcode: '98765432109',
        status: 'Consegnata',
        documentType: 'TD01',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out',
        {
          creationStartDate: '2024-01-01T00:00:00Z',
          creationEndDate: '2024-01-02T00:00:00Z',
          page: 1,
          size: 50,
          senderCountry: 'IT',
          senderVatcode: '12345678901',
          receiverCountry: 'IT',
          receiverVatcode: '98765432109',
          status: 'Consegnata',
          documentType: 'TD01',
        }
      );
    });
  });

  describe('getSentDetail', () => {
    it('should get sent invoice detail by id', async () => {
      const mockResponse = { id: '1', filename: 'test.xml' };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getSentDetail({ id: '1' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/detail',
        { id: '1' }
      );
    });

    it('should get sent invoice detail by filename', async () => {
      mockHttpClient.get.mockResolvedValue({});

      await client.getSentDetail({
        filename: 'IT01879020517_jtlk1.xml.p7m',
        includePdf: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/detail',
        { filename: 'IT01879020517_jtlk1.xml.p7m', includePdf: true }
      );
    });
  });

  describe('getSentZip', () => {
    it('should get sent invoice zip', async () => {
      mockHttpClient.get.mockResolvedValue('base64content');

      const result = await client.getSentZip({
        filename: 'IT01879020517_jtlk1.xml.p7m',
      });

      expect(result).toBe('base64content');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/zip',
        { filename: 'IT01879020517_jtlk1.xml.p7m' }
      );
    });
  });

  describe('getSentPdd', () => {
    it('should get sent invoice pdd', async () => {
      mockHttpClient.get.mockResolvedValue('base64content');

      const result = await client.getSentPdd({
        filename: 'IT01879020517_jtlk1.xml.p7m',
      });

      expect(result).toBe('base64content');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/pdd',
        { filename: 'IT01879020517_jtlk1.xml.p7m' }
      );
    });
  });

  describe('downloadSent', () => {
    it('should request download for sent invoices', async () => {
      const mockResponse = { jobId: 'job-123' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.downloadSent({
        ids: ['1', '2', '3'],
        downloadTypes: ['DownloadXml', 'DownloadPdf'],
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/download',
        { ids: ['1', '2', '3'], downloadTypes: ['DownloadXml', 'DownloadPdf'] }
      );
    });
  });

  describe('findReceived', () => {
    it('should find received invoices', async () => {
      const mockResponse = { content: [] };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.findReceived({
        creationStartDate: '2024-01-01T00:00:00Z',
        creationEndDate: '2024-01-02T00:00:00Z',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in',
        {
          creationStartDate: '2024-01-01T00:00:00Z',
          creationEndDate: '2024-01-02T00:00:00Z',
        }
      );
    });
  });

  describe('getReceivedDetail', () => {
    it('should get received invoice detail', async () => {
      mockHttpClient.get.mockResolvedValue({});

      await client.getReceivedDetail({
        id: '1',
        includeUnsignedFile: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in/detail',
        { id: '1', includeUnsignedFile: true }
      );
    });
  });

  describe('getReceivedZip', () => {
    it('should get received invoice zip', async () => {
      mockHttpClient.get.mockResolvedValue('base64content');

      await client.getReceivedZip({ filename: 'test.xml' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in/zip',
        { filename: 'test.xml' }
      );
    });
  });

  describe('getReceivedPdd', () => {
    it('should get received invoice pdd', async () => {
      mockHttpClient.get.mockResolvedValue('base64content');

      await client.getReceivedPdd({ filename: 'test.xml' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in/pdd',
        { filename: 'test.xml' }
      );
    });
  });

  describe('downloadReceived', () => {
    it('should request download for received invoices', async () => {
      const mockResponse = { jobId: 'job-456' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.downloadReceived({
        ids: ['1'],
        downloadTypes: ['DownloadXml'],
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in/download',
        { ids: ['1'], downloadTypes: ['DownloadXml'] }
      );
    });
  });

  describe('sendEsitoCommittente', () => {
    it('should send esito committente EC01', async () => {
      const mockResponse = {
        errorCode: '0000',
        errorDescription: 'Operazione effettuata',
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.sendEsitoCommittente({
        filename: 'IT01879020517_jtlk1.xml.p7m',
        sdiId: '12345',
        esito: 'EC01',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/services/invoice/in/sendEsitoCommittente',
        {
          filename: 'IT01879020517_jtlk1.xml.p7m',
          sdiId: '12345',
          esito: 'EC01',
        }
      );
    });

    it('should send esito committente EC02 with description', async () => {
      mockHttpClient.post.mockResolvedValue({});

      await client.sendEsitoCommittente({
        filename: 'IT01879020517_jtlk1.xml.p7m',
        sdiId: '12345',
        esito: 'EC02',
        descrizione: 'Fattura rifiutata per errore nei dati',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'ws',
        '/services/invoice/in/sendEsitoCommittente',
        {
          filename: 'IT01879020517_jtlk1.xml.p7m',
          sdiId: '12345',
          esito: 'EC02',
          descrizione: 'Fattura rifiutata per errore nei dati',
        }
      );
    });
  });

  describe('getEsitoCommittenteStatus', () => {
    it('should get esito committente status', async () => {
      const mockResponse = { status: 'SENT' };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getEsitoCommittenteStatus(
        'IT01879020517_jtlk1.xml.p7m'
      );

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/services/invoice/in/sendEsitoCommittente/IT01879020517_jtlk1.xml.p7m'
      );
    });
  });

  describe('getDownload', () => {
    it('should get download status', async () => {
      const mockResponse = {
        jobId: 'job-123',
        status: 'COMPLETED',
        file: 'base64content',
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getDownload('job-123');

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/download/job-123'
      );
    });

    it('should get download pending status', async () => {
      const mockResponse = {
        jobId: 'job-123',
        status: 'PROCESSING',
        progress: 50,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getDownload('job-123');

      expect(result.status).toBe('PROCESSING');
      expect(result.progress).toBe(50);
    });
  });
});
