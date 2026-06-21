import { Router, Request, Response } from 'express';
import { EmployeeHistoryService } from '../services/employee-history.service.js';
import { EmployeesService } from '../services/employees.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createEmployeeHistorySchema } from '../schemas/employee-history.schema.js';

const router = Router({ mergeParams: true });
const historyService = new EmployeeHistoryService();
const employeesService = new EmployeesService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const user = req.user!;
    if (user.role === 'employee') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp || emp._id.toString() !== employeeId) { res.status(403).json({ message: 'Access denied' }); return; }
    } else if (user.role === 'manager') {
      const emp = await employeesService.findByUserId(user.id);
      const targetEmp = await employeesService.findOne(employeeId).catch(() => null);
      if (!emp || !targetEmp || !(emp as any).departmentId || !(targetEmp as any).departmentId ||
          (targetEmp as any).departmentId.toString() !== (emp as any).departmentId.toString()) {
        res.status(403).json({ message: 'Access denied' }); return;
      }
    }
    const result = await historyService.findByEmployee(employeeId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/', requireRoles('admin', 'manager'), validate(createEmployeeHistorySchema), async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const user = req.user!;
    if (user.role === 'manager') {
      const emp = await employeesService.findByUserId(user.id);
      const targetEmp = await employeesService.findOne(employeeId).catch(() => null);
      if (!emp || !targetEmp || !(emp as any).departmentId || !(targetEmp as any).departmentId ||
          (targetEmp as any).departmentId.toString() !== (emp as any).departmentId.toString()) {
        res.status(403).json({ message: 'Access denied' }); return;
      }
    }
    const result = await historyService.create(employeeId, req.body);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
