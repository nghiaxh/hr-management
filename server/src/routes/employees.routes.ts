import { Router, Request, Response } from 'express';
import { EmployeesService } from '../services/employees.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../schemas/employees.schema.js';

const router = Router();
const service = new EmployeesService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any, req.user);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/export', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const csv = await service.exportCsv(req.user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
    res.send(csv);
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

router.post('/', requireRoles('admin'), validate(createEmployeeSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/bulk-delete', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const result = await service.bulkDelete(req.body.ids);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/:id/documents', requireRoles('admin'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return; }
    const result = await service.addDocument(req.params.id, req.file);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id/documents/:docId', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const result = await service.removeDocument(req.params.id, req.params.docId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/:id', requireRoles('admin'), validate(updateEmployeeSchema), async (req: Request, res: Response) => {
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
