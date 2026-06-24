import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/tests/setup.ts',
    env: {
      JWT_SECRET: 'test-jwt-secret-for-testing-only',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      NODE_ENV: 'test',
    },
    include: ['src/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/seed.ts', 'src/config.ts', 'src/index.ts'],
      thresholds: { statements: 70, branches: 60, functions: 70, lines: 70 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
