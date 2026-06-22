import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
import { useArubaClient } from './useArubaClient';

let invoicesInstance: InvoicesClient | null = null;

/**
 * Returns a singleton instance of InvoicesClient for managing electronic invoices.
 * The underlying ArubaClient authenticates/refreshes automatically per request.
 *
 * @example
 * ```ts
 * export default defineEventHandler(async () => {
 *   const invoices = useArubaInvoices();
 *
 *   const sent = await invoices.findSent({
 *     creationDateStart: '2024-01-01',
 *     creationDateEnd: '2024-12-31',
 *   });
 *
 *   return sent;
 * });
 * ```
 */
export function useArubaInvoices(): InvoicesClient {
  if (!invoicesInstance) {
    const client = useArubaClient();
    invoicesInstance = new InvoicesClient({ httpClient: client.http });
  }
  return invoicesInstance;
}
