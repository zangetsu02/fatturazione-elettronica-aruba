import { NotificationsClient } from '@fatturazione-elettronica-aruba/notifications';
import { useArubaClient } from './useArubaClient';

let notificationsInstance: NotificationsClient | null = null;

/**
 * Returns a singleton instance of NotificationsClient for managing SDI notifications.
 * The underlying ArubaClient authenticates/refreshes automatically per request.
 *
 * @example
 * ```ts
 * export default defineEventHandler(async () => {
 *   const notifications = useArubaNotifications();
 *
 *   const receipts = await notifications.findDeliveryReceipts({
 *     creationDateStart: '2024-01-01',
 *     creationDateEnd: '2024-12-31',
 *   });
 *
 *   return receipts;
 * });
 * ```
 */
export function useArubaNotifications(): NotificationsClient {
  if (!notificationsInstance) {
    const client = useArubaClient();
    notificationsInstance = new NotificationsClient({ httpClient: client.http });
  }
  return notificationsInstance;
}
