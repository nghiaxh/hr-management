import { describe, it, expect, vi } from 'vitest';
import { requireRoles } from '../../middleware/roles.js';
import type { Request, Response, NextFunction } from 'express';

function mockReqRes(user?: { id: string; email: string; role: string }) {
  const req = { user } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('requireRoles middleware', () => {
  it('should return 401 if not authenticated', () => {
    const { req, res, next } = mockReqRes(undefined);
    const middleware = requireRoles('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if role not allowed', () => {
    const { req, res, next } = mockReqRes({ id: '1', email: 'e@t.com', role: 'employee' });
    const middleware = requireRoles('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if role is allowed', () => {
    const { req, res, next } = mockReqRes({ id: '1', email: 'e@t.com', role: 'admin' });
    const middleware = requireRoles('admin', 'manager');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next if multiple roles include user role', () => {
    const { req, res, next } = mockReqRes({ id: '1', email: 'e@t.com', role: 'manager' });
    const middleware = requireRoles('admin', 'manager');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
