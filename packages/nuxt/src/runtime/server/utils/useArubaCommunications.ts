import { CommunicationsClient } from '@fatturazione-elettronica-aruba/communications';
import { useArubaClient } from './useArubaClient';

let communicationsInstance: CommunicationsClient | null = null;

/**
 * Returns a singleton instance of CommunicationsClient for managing AdE communications.
 *
 * @example
 * ```ts
 * // In a server route or API handler
 * export default defineEventHandler(async (event) => {
 *   const communications = useArubaCommunications();
 *
 *   // Search VAT liquidations
 *   const liquidations = await communications.findLiquidazioni({
 *     creationDateStart: '2024-01-01',
 *     creationDateEnd: '2024-12-31',
 *   });
 *
 *   return liquidations;
 * });
 * ```
 */
export function useArubaCommunications(): CommunicationsClient {
  if (!communicationsInstance) {
    const client = useArubaClient();
    communicationsInstance = new CommunicationsClient({ httpClient: client.http });
  }

  return communicationsInstance;
}
