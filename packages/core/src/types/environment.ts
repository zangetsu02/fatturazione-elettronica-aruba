export type Environment = 'demo' | 'production';

export interface EnvironmentConfig {
  authUrl: string;
  wsUrl: string;
}

export const ENVIRONMENT_URLS: Record<Environment, EnvironmentConfig> = {
  demo: {
    authUrl: 'https://demoauth.fatturazioneelettronica.aruba.it',
    wsUrl: 'https://demows.fatturazioneelettronica.aruba.it',
  },
  production: {
    authUrl: 'https://auth.fatturazioneelettronica.aruba.it',
    wsUrl: 'https://ws.fatturazioneelettronica.aruba.it',
  },
};

export const RATE_LIMITS = {
  auth: 1,
  upload: 30,
  search: 12,
} as const;

export const FILE_LIMITS = {
  maxFileSize: 5 * 1024 * 1024,
} as const;

export const ARUBA_CONSTANTS = {
  codiceDestinatario: 'KRRH6B9',
  idTrasmittente: 'IT01879020517',
} as const;
