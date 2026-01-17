import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsClient } from '../notifications-client.js';
import type { HttpClient } from '@fatturazione-aruba/core';

const createMockHttpClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  postForm: vi.fn(),
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
});

describe('NotificationsClient', () => {
  let client: NotificationsClient;
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    client = new NotificationsClient({
      httpClient: mockHttpClient as unknown as HttpClient,
    });
  });

  describe('getSentNotifications', () => {
    it('should get sent notifications by invoice id', async () => {
      const mockResponse = {
        count: 1,
        notifications: [
          {
            date: '2024-01-15T10:00:00Z',
            docType: 'RC',
            file: 'ZEdWemRBPT0=',
            filename: 'IT01879020517_33825_RC_001.xml',
            invoiceId: '1',
            notificationDate: '2024-01-15T10:00:00Z',
            number: null,
            result: null,
          },
        ],
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getSentNotifications({ id: '1' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/notifications',
        { id: '1' }
      );
    });

    it('should get sent notifications by filename', async () => {
      const mockResponse = { count: 0, notifications: [] };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      await client.getSentNotifications({
        filename: 'IT01879020517_jtlk1.xml.p7m',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/notifications',
        { filename: 'IT01879020517_jtlk1.xml.p7m' }
      );
    });
  });

  describe('getSentNotificationDetail', () => {
    it('should get sent notification detail', async () => {
      const mockResponse = {
        date: '2024-01-15T10:00:00Z',
        docType: 'RC',
        file: 'ZEdWemRBPT0=',
        filename: 'IT01879020517_33825_RC_001.xml',
        invoiceId: '1',
        notificationDate: '2024-01-15T10:00:00Z',
        number: null,
        result: 'EC01',
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getSentNotificationDetail({
        filename: 'IT01879020517_33825_RC_001.xml',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-out/notifications/detail',
        { filename: 'IT01879020517_33825_RC_001.xml' }
      );
    });
  });

  describe('getReceivedNotifications', () => {
    it('should get received notifications by invoice id', async () => {
      const mockResponse = {
        count: 2,
        notifications: [
          {
            date: '2024-01-15T10:00:00Z',
            docType: 'NS',
            file: 'ZEdWemRBPT0=',
            filename: 'IT01879020517_33822_NS_001.xml',
            invoiceId: '2',
            notificationDate: '2024-01-15T10:00:00Z',
            number: null,
            result: null,
          },
        ],
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getReceivedNotifications({ id: '2' });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in/notifications',
        { id: '2' }
      );
    });

    it('should get received notifications by filename', async () => {
      mockHttpClient.get.mockResolvedValue({ count: 0, notifications: [] });

      await client.getReceivedNotifications({
        filename: 'IT01879020517_abcde.xml.p7m',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in/notifications',
        { filename: 'IT01879020517_abcde.xml.p7m' }
      );
    });
  });

  describe('getReceivedNotificationDetail', () => {
    it('should get received notification detail', async () => {
      const mockResponse = {
        date: '2024-01-15T10:00:00Z',
        docType: 'NE',
        file: 'ZEdWemRBPT0=',
        filename: 'IT01879020517_33822_NE_001.xml',
        invoiceId: '2',
        notificationDate: '2024-01-15T10:00:00Z',
        number: '123',
        result: 'EC02',
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await client.getReceivedNotificationDetail({
        filename: 'IT01879020517_33822_NE_001.xml',
      });

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'ws',
        '/api/v2/invoices-in/notifications/detail',
        { filename: 'IT01879020517_33822_NE_001.xml' }
      );
    });
  });

  describe('notification types', () => {
    it('should handle RC notification', async () => {
      mockHttpClient.get.mockResolvedValue({
        count: 1,
        notifications: [{ docType: 'RC' }],
      });

      const result = await client.getSentNotifications({ id: '1' });
      expect(result.notifications[0].docType).toBe('RC');
    });

    it('should handle NS notification', async () => {
      mockHttpClient.get.mockResolvedValue({
        count: 1,
        notifications: [{ docType: 'NS' }],
      });

      const result = await client.getSentNotifications({ id: '1' });
      expect(result.notifications[0].docType).toBe('NS');
    });

    it('should handle MC notification', async () => {
      mockHttpClient.get.mockResolvedValue({
        count: 1,
        notifications: [{ docType: 'MC' }],
      });

      const result = await client.getSentNotifications({ id: '1' });
      expect(result.notifications[0].docType).toBe('MC');
    });

    it('should handle DT notification', async () => {
      mockHttpClient.get.mockResolvedValue({
        count: 1,
        notifications: [{ docType: 'DT' }],
      });

      const result = await client.getSentNotifications({ id: '1' });
      expect(result.notifications[0].docType).toBe('DT');
    });
  });
});
