import { ArubaClient, type TokenStorage } from '@fatturazione-elettronica-aruba/core';
import { useRuntimeConfig } from '#imports';

let clientInstance: ArubaClient | null = null;
let tokenStorageOverride: TokenStorage | undefined;

/**
 * Imposta un TokenStorage personalizzato (es. backed da KV/Redis/DB) da usare
 * quando il client viene creato. Su serverless permette di condividere il token
 * tra istanze/cold start, evitando una signIn a ogni lambda fredda.
 *
 * Va chiamata prima del primo `useArubaClient()` (tipicamente in un nitro plugin).
 *
 * @example
 * ```ts
 * // server/plugins/aruba-storage.ts
 * export default defineNitroPlugin(() => {
 *   setArubaTokenStorage(myKvTokenStorage)
 * })
 * ```
 */
export function setArubaTokenStorage(storage: TokenStorage): void {
  if (clientInstance) {
    console.warn(
      '[@fatturazione-elettronica-aruba/nuxt] setArubaTokenStorage() chiamata dopo la creazione del client: verrà ignorata. Chiamala in un nitro plugin, prima del primo useArubaClient().'
    );
    return;
  }
  tokenStorageOverride = storage;
}

/**
 * Ritorna l'istanza singleton di ArubaClient.
 *
 * Il client si autentica e rinnova il token **da solo a ogni richiesta**
 * (le credenziali sono passate in costruzione): non serve chiamare `signIn`
 * né `ensureAuthenticated`. Risolve il race su cold start.
 *
 * @example
 * ```ts
 * export default defineEventHandler(async () => {
 *   const client = useArubaClient();
 *   return await client.auth.getUserInfo(); // token garantito dall'interceptor
 * });
 * ```
 */
export function useArubaClient(): ArubaClient {
  if (!clientInstance) {
    const config = useRuntimeConfig().fatturazioneAruba;
    clientInstance = new ArubaClient({
      environment: config.environment,
      username: config.username,
      password: config.password,
      tokenStorage: tokenStorageOverride,
      autoRefresh: config.autoRefresh,
      refreshMargin: config.refreshMargin,
    });
  }

  return clientInstance;
}
