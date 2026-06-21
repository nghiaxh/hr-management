import { Router, Request, Response } from 'express';
import { PayrollService } from '../services/payroll.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { processPayrollSchema } from '../schemas/payroll.schema.js';

const router = Router();
const service = new PayrollService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any, req.user!);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/process', requireRoles('admin'), validate(processPayrollSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.process(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/:id/pay', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const result = await service.pay(req.params.id);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
