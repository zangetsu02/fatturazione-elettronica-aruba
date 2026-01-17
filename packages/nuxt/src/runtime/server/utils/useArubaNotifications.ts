import { NotificationsClient } from '@fatturazione-elettronica-aruba/notifications';
import { useArubaClient } from './useArubaClient';

let notificationsInstance: NotificationsClient | null = null;

/**
 * Returns a singleton instance of NotificationsClient for managing SDI notifications.
 *
 * @example
 * ```ts
 * // In a server route or API handler
 * export default defineEventHandler(async (event) => {
 *   const notifications = useArubaNotifications();
 *
 *   // Get delivery receipts (RC)
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
    notificationsInstance = new NotificationsClient(client.http);
  }

  return notificationsInstance;
}
