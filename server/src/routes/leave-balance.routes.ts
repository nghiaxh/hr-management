import { Router, Request, Response } from 'express';
import { LeaveBalanceService } from '../services/leave-balance.service.js';
import { EmployeesService } from '../services/employees.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
const balanceService = new LeaveBalanceService();
const employeesService = new EmployeesService();

router.use(authenticate);

router.get('/my', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const employee = await employeesService.findByUserId(req.user!.id);
    if (!employee) {
      res.json({ totalAnnual: 0, usedAnnual: 0, totalSick: 0, usedSick: 0, totalPersonal: 0, usedPersonal: 0 });
      return;
    }
    const result = await balanceService.findByEmployee(employee._id.toString());
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/:employeeId', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await balanceService.findByEmployee(req.params.employeeId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
