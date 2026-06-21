import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema, updateProfileSchema, changePasswordSchema } from '../schemas/auth.schema.js';

const router = Router();
const service = new AuthService();

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.register(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    const status = e.message === 'Email already exists' ? 409 : 400;
    res.status(status).json({ message: e.message });
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ message: e.message });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await service.getMe(req.user!.id);
    res.json(user);
  } catch (e: any) {
    res.status(404).json({ message: e.message });
  }
});

router.put('/profile', authenticate, validate(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const user = await service.updateProfile(req.user!.id, req.body);
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/change-password', authenticate, validate(changePasswordSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
