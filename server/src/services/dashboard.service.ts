import { Employee } from '../models/employee.model.js';
import { Department } from '../models/department.model.js';
import { Leave } from '../models/leave.model.js';
import { Attendance } from '../models/attendance.model.js';
import { Payroll } from '../models/payroll.model.js';

export class DashboardService {
  async getDashboard(user: any) {
    if (user.role === 'admin') return this.adminDashboard();
    if (user.role === 'manager') return this.managerDashboard(user.id);
    return this.employeeDashboard(user.id);
  }

  private async adminDashboard() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const now = new Date();

    const [totalEmployees, totalDepartments, pendingLeaves, presentToday, payrollResult] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      Leave.countDocuments({ status: 'pending' }),
      Attendance.countDocuments({ date: today, status: { $in: ['present', 'late'] } }),
      Payroll.aggregate([
        { $match: { month: now.getMonth() + 1, year: now.getFullYear() } },
        { $group: { _id: null, total: { $sum: '$netPay' } } },
      ]),
    ]);

    const departmentStats = await Employee.aggregate([
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

    const recentLeaves = await Leave.find()
      .populate('employeeId').sort({ createdAt: -1 }).limit(5);

    return {
      totalEmployees, totalDepartments, pendingLeaves,
      presentToday, monthlyPayroll: payrollResult[0]?.total || 0,
      departmentStats, recentLeaves,
    };
  }

  private async managerDashboard(userId: string) {
    const emp = await Employee.findOne({ userId });
    if (!emp) return {};
    const dept = await Department.findById(emp.departmentId);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const now = new Date();

    const deptEmployeeIds = (await Employee.find({ departmentId: emp.departmentId })
      .select('_id').lean()).map(e => e._id);

    const [totalEmployees, pendingLeaves, presentToday, payrollResult] = await Promise.all([
      Employee.countDocuments({ departmentId: emp.departmentId }),
      Leave.countDocuments({ status: 'pending', employeeId: { $in: deptEmployeeIds } }),
      Attendance.countDocuments({ date: today, status: { $in: ['present', 'late'] }, employeeId: { $in: deptEmployeeIds } }),
      Payroll.aggregate([
        { $match: { month: now.getMonth() + 1, year: now.getFullYear(), employeeId: { $in: deptEmployeeIds } } },
        { $group: { _id: null, total: { $sum: '$netPay' } } },
      ]),
    ]);

    return {
      departmentName: (dept as any)?.name || 'N/A',
      totalEmployees, pendingLeaves, presentToday,
      departmentPayroll: payrollResult[0]?.total || 0,
    };
  }

  private async employeeDashboard(userId: string) {
    const emp = await Employee.findOne({ userId });
    if (!emp) return {};

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [leaves, attendance, lastPayroll, upcomingLeaves] = await Promise.all([
      Leave.find({ employeeId: emp._id }),
      Attendance.find({ employeeId: emp._id, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Payroll.findOne({ employeeId: emp._id }).sort({ year: -1, month: -1 }),
      Leave.find({ employeeId: emp._id, startDate: { $gte: now }, status: 'approved' }).sort({ startDate: 1 }).limit(3),
    ]);

    const myLeaves: any = { pending: 0, approved: 0, rejected: 0 };
    leaves.forEach(l => { myLeaves[l.status]++; });

    const myAttendance: any = { present: 0, late: 0, absent: 0, halfDay: 0, totalDays: attendance.length };
    attendance.forEach(a => {
      if (a.status === 'half-day') myAttendance.halfDay++;
      else myAttendance[a.status]++;
    });

    return { myLeaves, myAttendance, lastPayroll, upcomingLeaves };
  }
}
