import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payroll, PayrollDocument } from './schemas/payroll.schema.js';
import { ProcessPayrollDto } from './dto/process-payroll.dto.js';
import { EmployeesService } from '../employees/employees.service.js';
import { sanitizeFilter } from '../utils/security.js';

@Injectable()
export class PayrollService {
  constructor(
    @InjectModel(Payroll.name) private payrollModel: Model<PayrollDocument>,
    private employeesService: EmployeesService,
  ) {}

  async findAll(query: { month?: number; year?: number; employeeId?: string; status?: string; page?: number; limit?: number }, user: any) {
    const { month, year, employeeId, status, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user.role === 'employee') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (emp) filter.employeeId = emp._id;
    } else if (user.role === 'admin' && employeeId) {
      filter.employeeId = employeeId;
    } else if (user.role === 'manager') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (!emp || !emp.departmentId) filter._id = null;
      else {
        const deptEmps = await this.employeesService.findAll({ departmentId: emp.departmentId.toString() }, user);
        filter.employeeId = { $in: deptEmps.data.map(e => e._id) };
        if (employeeId) {
          const targetEmp = await this.employeesService.findOne(employeeId).catch(() => null);
          if (!targetEmp || !targetEmp.departmentId || targetEmp.departmentId.toString() !== emp.departmentId.toString()) {
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

    const total = await this.payrollModel.countDocuments(filter);
    const data = await this.payrollModel
      .find(filter)
      .populate('employeeId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ year: -1, month: -1 });

    return { data, meta: { page, limit, total } };
  }

  async process(dto: ProcessPayrollDto) {
    const results: PayrollDocument[] = [];
    for (const empId of dto.employeeIds) {
      const emp = await this.employeesService.findOne(empId);
      const existing = await this.payrollModel.findOne({
        employeeId: empId,
        month: dto.month,
        year: dto.year,
      });
      if (existing) continue;

      const bonus = dto.bonuses?.[empId] || 0;
      const deductions = dto.deductions?.[empId] || 0;
      const netPay = emp.salary + bonus - deductions;

      const payroll = await this.payrollModel.create({
        employeeId: empId,
        month: dto.month,
        year: dto.year,
        basicSalary: emp.salary,
        bonus,
        deductions,
        netPay: Math.max(0, netPay),
      });
      results.push(payroll);
    }
    return results;
  }

  async pay(id: string) {
    const payroll = await this.payrollModel.findById(id);
    if (!payroll) throw new NotFoundException('Payroll not found');
    payroll.status = 'paid';
    payroll.paidAt = new Date();
    return payroll.save();
  }
}
