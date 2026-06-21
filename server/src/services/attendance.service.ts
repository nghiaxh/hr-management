import { Attendance } from '../models/attendance.model.js';
import { AttendanceQueryInput } from '../schemas/attendance.schema.js';
import { EmployeesService } from './employees.service.js';

const employeesService = new EmployeesService();

export class AttendanceService {
  async findAll(query: AttendanceQueryInput, user: any) {
    const { from, to, employeeId, status } = query;
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
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    return Attendance.find(filter).populate('employeeId').sort({ date: -1 });
  }

  async checkIn(userId: string) {
    const emp = await employeesService.findByUserId(userId);
    if (!emp) throw new Error('Employee profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ employeeId: emp._id, date: today });
    if (existing) throw new Error('Already checked in today');

    const now = new Date();
    const nineAM = new Date(today);
    nineAM.setHours(9, 0, 0, 0);
    const status = now > nineAM ? 'late' : 'present';

    return Attendance.create({ employeeId: emp._id, date: today, checkIn: now, status });
  }

  async checkOut(id: string, userId: string) {
    const emp = await employeesService.findByUserId(userId);
    if (!emp) throw new Error('Employee profile not found');

    const record = await Attendance.findOne({ _id: id, employeeId: emp._id });
    if (!record) throw new Error('Attendance record not found');
    if (record.checkOut) throw new Error('Already checked out');

    record.checkOut = new Date();
    const hours = (record.checkOut.getTime() - record.checkIn!.getTime()) / (1000 * 60 * 60);
    if (hours < 4) {
      record.status = 'half-day';
    } else if (record.status === 'late' && hours >= 8) {
      record.status = 'present';
    }
    return record.save();
  }
}
