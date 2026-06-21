import { Router, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
const service = new DashboardService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.getDashboard(req.user!);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
