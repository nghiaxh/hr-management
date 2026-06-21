import { Router, Request, Response } from 'express';
import { LeavesService } from '../services/leaves.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createLeaveSchema, updateLeaveStatusSchema } from '../schemas/leaves.schema.js';

const router = Router();
const service = new LeavesService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any, req.user!);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/', requireRoles('employee'), validate(createLeaveSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.create(req.body, req.user!.id);
    res.status(201).json(result);
  } catch (e: any) {
    const status = e.message.includes('Overlapping') ? 409 : 400;
    res.status(status).json({ message: e.message });
  }
});

router.get('/:id', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.findOne(req.params.id, req.user!);
    res.json(result);
  } catch (e: any) {
    const status = e.message === 'Access denied' ? 403 : 404;
    res.status(status).json({ message: e.message });
  }
});

router.patch('/:id/status', requireRoles('admin', 'manager'), validate(updateLeaveStatusSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.updateStatus(req.params.id, req.body, req.user!.id);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
