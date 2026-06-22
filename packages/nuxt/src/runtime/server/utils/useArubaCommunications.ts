import { CommunicationsClient } from '@fatturazione-elettronica-aruba/communications';
import { useArubaClient } from './useArubaClient';

let communicationsInstance: CommunicationsClient | null = null;

/**
 * Returns a singleton instance of CommunicationsClient for managing AdE communications.
 * The underlying ArubaClient authenticates/refreshes automatically per request.
 *
 * @example
 * ```ts
 * export default defineEventHandler(async () => {
 *   const communications = useArubaCommunications();
 *
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
