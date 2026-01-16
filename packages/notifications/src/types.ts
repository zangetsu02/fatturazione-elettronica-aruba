export type NotificationType =
  | 'RC'
  | 'NS'
  | 'MC'
  | 'NE'
  | 'DT'
  | 'AT';

export type EsitoResult = 'EC01' | 'EC02';

export interface Notification {
  date: string;
  docType: NotificationType;
  file: string;
  filename: string;
  invoiceId: string;
  notificationDate: string;
  number: string | null;
  result: EsitoResult | null;
}

export interface NotificationsResponse {
  count: number;
  notifications: Notification[];
}

export interface GetNotificationsParams {
  id?: string;
  filename?: string;
}

export interface GetNotificationDetailParams {
  filename: string;
}
