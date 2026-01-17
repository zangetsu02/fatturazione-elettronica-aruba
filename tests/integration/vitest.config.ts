import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.integration.test.ts'],
    testTimeout: 60000,
    hookTimeout: 30000,
    setupFiles: ['./setup.ts'],
    env: {
      NODE_ENV: 'test',
    },
  },
});
