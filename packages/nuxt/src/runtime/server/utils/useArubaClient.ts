import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
import { useRuntimeConfig } from '#imports';

let clientInstance: ArubaClient | null = null;
let isAuthenticated = false;

/**
 * Returns a singleton instance of ArubaClient configured with runtime config.
 * The client is automatically authenticated on first use.
 *
 * @example
 * ```ts
 * // In a server route or API handler
 * export default defineEventHandler(async (event) => {
 *   const client = useArubaClient();
 *   const userInfo = await client.auth.getUserInfo();
 *   return userInfo;
 * });
 * ```
 */
export function useArubaClient(): ArubaClient {
  const config = useRuntimeConfig().fatturazioneAruba;

  if (!clientInstance) {
    clientInstance = new ArubaClient({
      environment: config.environment,
    });
  }

  // Auto-authenticate if not already done
  if (!isAuthenticated && config.username && config.password) {
    // Queue authentication (non-blocking for singleton creation)
    clientInstance.auth
      .signIn(config.username, config.password)
      .then(() => {
        isAuthenticated = true;
      })
      .catch((error) => {
        console.error('[@fatturazione-elettronica-aruba/nuxt] Auto-authentication failed:', error);
      });
  }

  return clientInstance;
}
