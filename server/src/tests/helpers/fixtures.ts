import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-jwt-secret-for-testing-only';

export function generateToken(overrides: Partial<{ sub: string; email: string; role: string }> = {}) {
  const payload = {
    sub: overrides.sub || '000000000000000000000001',
    email: overrides.email || 'admin@test.com',
    role: overrides.role || 'admin',
  };
  return jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });
}

export const testConfig = {
  jwtSecret: TEST_SECRET,
  jwtExpiresIn: '1h',
};
