import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import type { Request, Response, NextFunction } from 'express';

const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18, 'Must be at least 18'),
});

function mockReqRes(body: any) {
  const req = { body } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('validate middleware', () => {
  it('should call next with parsed data on valid body', () => {
    const { req, res, next } = mockReqRes({ name: 'John', age: 25 });
    const middleware = validate(testSchema);
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'John', age: 25 });
  });

  it('should return 400 on invalid body', () => {
    const { req, res, next } = mockReqRes({ name: '', age: 15 });
    const middleware = validate(testSchema);
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: expect.arrayContaining([
        expect.objectContaining({ path: 'name', message: expect.any(String) }),
        expect.objectContaining({ path: 'age', message: expect.any(String) }),
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 on missing required fields', () => {
    const { req, res, next } = mockReqRes({});
    const middleware = validate(testSchema);
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
