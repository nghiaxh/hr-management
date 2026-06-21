import { Router, Request, Response } from 'express';
import { PerformanceReviewService } from '../services/performance-review.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createPerformanceReviewSchema, updatePerformanceReviewSchema } from '../schemas/performance-review.schema.js';

const router = Router();
const service = new PerformanceReviewService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any, req.user);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/:id', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.findOne(req.params.id, req.user);
    res.json(result);
  } catch (e: any) {
    const status = e.message === 'Access denied' ? 403 : 404;
    res.status(status).json({ message: e.message });
  }
});

router.post('/', requireRoles('admin', 'manager'), validate(createPerformanceReviewSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.create(req.body, req.user!.id);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/:id', requireRoles('admin', 'manager'), validate(updatePerformanceReviewSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.update(req.params.id, req.body);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(404).json({ message: e.message });
  }
});

export default router;
