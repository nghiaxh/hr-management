import { Router, Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
const service = new AttendanceService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any, req.user!);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/check-in', requireRoles('employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.checkIn(req.user!.id);
    res.status(201).json(result);
  } catch (e: any) {
    const status = e.message === 'Already checked in today' ? 409 : 400;
    res.status(status).json({ message: e.message });
  }
});

router.patch('/:id/check-out', requireRoles('employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.checkOut(req.params.id, req.user!.id);
    res.json(result);
  } catch (e: any) {
    const status = e.message === 'Already checked out' ? 409 : 400;
    res.status(status).json({ message: e.message });
  }
});

export default router;
