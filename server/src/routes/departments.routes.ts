import { Router, Request, Response } from 'express';
import { DepartmentsService } from '../services/departments.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../schemas/departments.schema.js';

const router = Router();
const service = new DepartmentsService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any, req.user);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/org-chart', requireRoles('admin', 'manager'), async (_req: Request, res: Response) => {
  try {
    const result = await service.getOrgChart();
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/:id', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await service.findOne(req.params.id);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ message: e.message });
  }
});

router.post('/', requireRoles('admin'), validate(createDepartmentSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/:id', requireRoles('admin'), validate(updateDepartmentSchema), async (req: Request, res: Response) => {
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
