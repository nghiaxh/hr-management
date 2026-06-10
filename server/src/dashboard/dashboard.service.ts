import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from '../employees/schemas/employee.schema';
import { Department, DepartmentDocument } from '../departments/schemas/department.schema';
import { Leave, LeaveDocument } from '../leaves/schemas/leave.schema';
import { Attendance, AttendanceDocument } from '../attendance/schemas/attendance.schema';
import { Payroll, PayrollDocument } from '../payroll/schemas/payroll.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Payroll.name) private payrollModel: Model<PayrollDocument>,
  ) {}

  async getDashboard(user: any) {
    if (user.role === 'admin') return this.adminDashboard();
    if (user.role === 'manager') return this.managerDashboard(user.id);
    return this.employeeDashboard(user.id);
  }

  private async adminDashboard() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const now = new Date();

    const [totalEmployees, totalDepartments, pendingLeaves, presentToday, payrollResult] = await Promise.all([
      this.employeeModel.countDocuments(),
      this.departmentModel.countDocuments(),
      this.leaveModel.countDocuments({ status: 'pending' }),
      this.attendanceModel.countDocuments({ date: today, status: { $in: ['present', 'late'] } }),
      this.payrollModel.aggregate([
        { $match: { month: now.getMonth() + 1, year: now.getFullYear() } },
        { $group: { _id: null, total: { $sum: '$netPay' } } },
      ]),
    ]);

    const departmentStats = await this.employeeModel.aggregate([
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $lookup: {
          from: 'departments',
          let: { deptId: '$_id' },
          pipeline: [
            { $addFields: { strId: { $toString: '$_id' } } },
            { $match: { $expr: { $eq: ['$strId', '$$deptId'] } } },
          ],
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$dept.name', count: 1, _id: 0 } },
    ]);

    const recentLeaves = await this.leaveModel.find()
      .populate('employeeId').sort({ createdAt: -1 }).limit(5);

    return {
      totalEmployees, totalDepartments, pendingLeaves,
      presentToday, monthlyPayroll: payrollResult[0]?.total || 0,
      departmentStats, recentLeaves,
    };
  }

  private async managerDashboard(userId: string) {
    const emp = await this.employeeModel.findOne({ userId });
    if (!emp) return {};
    const dept = await this.departmentModel.findById(emp.departmentId);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const now = new Date();

    const deptEmployeeIds = (await this.employeeModel.find(
      { departmentId: emp.departmentId }
    ).select('_id').lean()).map(e => e._id);

    const [totalEmployees, pendingLeaves, presentToday, payrollResult] = await Promise.all([
      this.employeeModel.countDocuments({ departmentId: emp.departmentId }),
      this.leaveModel.countDocuments({ status: 'pending', employeeId: { $in: deptEmployeeIds } }),
      this.attendanceModel.countDocuments({ date: today, status: { $in: ['present', 'late'] }, employeeId: { $in: deptEmployeeIds } }),
      this.payrollModel.aggregate([
        { $match: { month: now.getMonth() + 1, year: now.getFullYear(), employeeId: { $in: deptEmployeeIds } } },
        { $group: { _id: null, total: { $sum: '$netPay' } } },
      ]),
    ]);

    return {
      departmentName: dept?.name || 'N/A',
      totalEmployees, pendingLeaves, presentToday,
      departmentPayroll: payrollResult[0]?.total || 0,
    };
  }

  private async employeeDashboard(userId: string) {
    const emp = await this.employeeModel.findOne({ userId });
    if (!emp) return {};

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [leaves, attendance, lastPayroll, upcomingLeaves] = await Promise.all([
      this.leaveModel.find({ employeeId: emp._id }),
      this.attendanceModel.find({ employeeId: emp._id, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      this.payrollModel.findOne({ employeeId: emp._id }).sort({ year: -1, month: -1 }),
      this.leaveModel.find({ employeeId: emp._id, startDate: { $gte: now }, status: 'approved' }).sort({ startDate: 1 }).limit(3),
    ]);

    const myLeaves = { pending: 0, approved: 0, rejected: 0 };
    leaves.forEach(l => { myLeaves[l.status]++; });

    const myAttendance = { present: 0, late: 0, absent: 0, halfDay: 0, totalDays: attendance.length };
    attendance.forEach(a => {
      if (a.status === 'half-day') myAttendance.halfDay++;
      else myAttendance[a.status]++;
    });

    return { myLeaves, myAttendance, lastPayroll, upcomingLeaves };
  }
}
