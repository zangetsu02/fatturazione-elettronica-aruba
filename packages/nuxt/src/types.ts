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
    };
  }
}
