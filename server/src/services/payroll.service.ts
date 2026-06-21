import { Payroll } from '../models/payroll.model.js';
import { sanitizeFilter } from '../utils/security.js';
import { ProcessPayrollInput } from '../schemas/payroll.schema.js';
import { EmployeesService } from './employees.service.js';

const employeesService = new EmployeesService();

export class PayrollService {
  async findAll(query: { month?: number; year?: number; employeeId?: string; status?: string; page?: number; limit?: number }, user: any) {
    const { month, year, employeeId, status, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user.role === 'employee') {
      const emp = await employeesService.findByUserId(user.id);
      if (emp) filter.employeeId = emp._id;
    } else if (user.role === 'admin' && employeeId) {
      filter.employeeId = employeeId;
    } else if (user.role === 'manager') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp || !emp.departmentId) filter._id = null;
      else {
        const deptEmps = await employeesService.findAll({ departmentId: emp.departmentId.toString() }, user);
        filter.employeeId = { $in: deptEmps.data.map((e: any) => e._id) };
        if (employeeId) {
          const targetEmp = await employeesService.findOne(employeeId).catch(() => null);
          if (!targetEmp || !(targetEmp as any).departmentId || (targetEmp as any).departmentId.toString() !== emp.departmentId.toString()) {
            filter._id = null;
          } else {
            filter.employeeId = employeeId;
          }
        }
      }
    }
    if (month) filter.month = sanitizeFilter(month);
    if (year) filter.year = sanitizeFilter(year);
    if (status) filter.status = sanitizeFilter(status);

    const total = await Payroll.countDocuments(filter);
    const data = await Payroll.find(filter)
      .populate('employeeId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ year: -1, month: -1 });

    return { data, meta: { page, limit, total } };
  }

  async process(dto: ProcessPayrollInput) {
    const results: any[] = [];
    for (const empId of dto.employeeIds) {
      const emp = await employeesService.findOne(empId);
      const existing = await Payroll.findOne({ employeeId: empId, month: dto.month, year: dto.year });
      if (existing) continue;

      const bonus = dto.bonuses?.[empId] || 0;
      const deductions = dto.deductions?.[empId] || 0;
      const netPay = (emp as any).salary + bonus - deductions;

      const payroll = await Payroll.create({
        employeeId: empId,
        month: dto.month,
        year: dto.year,
        basicSalary: (emp as any).salary,
        bonus,
        deductions,
        netPay: Math.max(0, netPay),
      });
      results.push(payroll);
    }
    return results;
  }

  async pay(id: string) {
    const payroll = await Payroll.findById(id);
    if (!payroll) throw new Error('Payroll not found');
    payroll.status = 'paid';
    payroll.paidAt = new Date();
    return payroll.save();
  }
}
