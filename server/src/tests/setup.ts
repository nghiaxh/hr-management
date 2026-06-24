import { beforeAll, afterAll, afterEach } from 'vitest';
import { startDb, stopDb, clearDb } from './helpers/db.js';

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  await startDb();
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await stopDb();
});
