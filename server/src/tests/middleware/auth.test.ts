import { describe, it, expect, vi } from 'vitest';
import { authenticate } from '../../middleware/auth.js';
import { generateToken } from '../helpers/fixtures.js';
import type { Request, Response, NextFunction } from 'express';

function mockReqRes() {
  const req = { headers: {} } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('authenticate middleware', () => {
  it('should return 401 if no Authorization header', () => {
    const { req, res, next } = mockReqRes();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if header does not start with Bearer', () => {
    const { req, res, next } = mockReqRes();
    req.headers.authorization = 'Basic token';
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    const { req, res, next } = mockReqRes();
    req.headers.authorization = 'Bearer invalid-token';
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with user on valid token', () => {
    const { req, res, next } = mockReqRes();
    const token = generateToken({ sub: 'user123', email: 'test@test.com', role: 'admin' });
    req.headers.authorization = `Bearer ${token}`;
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'user123', email: 'test@test.com', role: 'admin' });
  });
});
