import type { HttpClient } from '@fatturazione-aruba/core';
import type {
  NotificationsResponse,
  Notification,
  GetNotificationsParams,
  GetNotificationDetailParams,
} from './types.js';

type QueryParams = Record<string, string | number | boolean | undefined>;

export interface NotificationsClientOptions {
  httpClient: HttpClient;
}

export class NotificationsClient {
  private readonly httpClient: HttpClient;

  constructor(options: NotificationsClientOptions) {
    this.httpClient = options.httpClient;
  }

  private toQueryParams<T extends object>(params: T): QueryParams {
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) as QueryParams;
  }

  async getSentNotifications(params: GetNotificationsParams): Promise<NotificationsResponse> {
    return this.httpClient.get<NotificationsResponse>(
      'ws',
      '/api/v2/invoices-out/notifications',
      this.toQueryParams(params)
    );
  }

  async getSentNotificationDetail(params: GetNotificationDetailParams): Promise<Notification> {
    return this.httpClient.get<Notification>(
      'ws',
      '/api/v2/invoices-out/notifications/detail',
      this.toQueryParams(params)
    );
  }

  async getReceivedNotifications(params: GetNotificationsParams): Promise<NotificationsResponse> {
    return this.httpClient.get<NotificationsResponse>(
      'ws',
      '/api/v2/invoices-in/notifications',
      this.toQueryParams(params)
    );
  }

  async getReceivedNotificationDetail(params: GetNotificationDetailParams): Promise<Notification> {
    return this.httpClient.get<Notification>(
      'ws',
      '/api/v2/invoices-in/notifications/detail',
      this.toQueryParams(params)
    );
  }
}
