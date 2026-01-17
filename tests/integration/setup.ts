import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env') });

const requiredEnvVars = ['ARUBA_USERNAME', 'ARUBA_PASSWORD'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set. Integration tests may fail.`);
  }
}
