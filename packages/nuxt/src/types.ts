export interface ModuleOptions {
  /**
   * Aruba API username
   * Can also be set via NUXT_FATTURAZIONE_ARUBA_USERNAME env variable
   */
  username?: string;

  /**
   * Aruba API password
   * Can also be set via NUXT_FATTURAZIONE_ARUBA_PASSWORD env variable
   */
  password?: string;

  /**
   * API environment
   * @default 'demo'
   */
  environment?: 'demo' | 'production';

  /**
   * Refresh automatico del token prima della scadenza.
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Margine (in secondi) prima della scadenza in cui rinnovare il token.
   * @default 60
   */
  refreshMargin?: number;
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fatturazioneAruba?: ModuleOptions;
  }
  interface NuxtOptions {
    fatturazioneAruba?: ModuleOptions;
  }
  interface RuntimeConfig {
    fatturazioneAruba: {
      username: string;
      password: string;
      environment: 'demo' | 'production';
      autoRefresh: boolean;
      refreshMargin: number;
    };
  }
}
