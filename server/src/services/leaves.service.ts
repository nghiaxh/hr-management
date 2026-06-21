import { Leave } from '../models/leave.model.js';
import { sanitizeFilter } from '../utils/security.js';
import { CreateLeaveInput, UpdateLeaveStatusInput } from '../schemas/leaves.schema.js';
import { EmployeesService } from './employees.service.js';
import { LeaveBalanceService } from './leave-balance.service.js';
import { NotificationsService } from './notifications.service.js';

const employeesService = new EmployeesService();
const leaveBalanceService = new LeaveBalanceService();
const notificationsService = new NotificationsService();

export class LeavesService {
  async findAll(query: { status?: string; employeeId?: string; type?: string; page?: number; limit?: number }, user: any) {
    const { status, employeeId, type, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user.role === 'employee') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp) filter._id = null;
      else filter.employeeId = emp._id;
    } else if (user.role === 'manager') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp || !emp.departmentId) filter._id = null;
      else {
        const deptEmps = await employeesService.findAll({ departmentId: emp.departmentId.toString() }, user);
        filter.employeeId = { $in: deptEmps.data.map((e: any) => e._id) };
      }
    } else if (user.role === 'admin' && employeeId) {
      filter.employeeId = sanitizeFilter(employeeId);
    }
    if (status) filter.status = sanitizeFilter(status);
    if (type) filter.type = sanitizeFilter(type);

    const total = await Leave.countDocuments(filter);
    const data = await Leave.find(filter)
      .populate('employeeId')
      .populate('approvedBy', '-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string, user: any) {
    const leave = await Leave.findById(id)
      .populate('employeeId')
      .populate('approvedBy', '-passwordHash');
    if (!leave) throw new Error('Leave not found');

    if (user.role === 'employee') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp || leave.employeeId.toString() !== emp._id.toString()) {
        throw new Error('Access denied');
      }
    } else if (user.role === 'manager') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp || !emp.departmentId) throw new Error('Access denied');
      const leaveEmp = await employeesService.findOne(leave.employeeId.toString());
      if (!leaveEmp || !(leaveEmp as any).departmentId || (leaveEmp as any).departmentId.toString() !== emp.departmentId.toString()) {
        throw new Error('Access denied');
      }
    }

    return leave;
  }

  async create(dto: CreateLeaveInput, userId: string) {
    const emp = await employeesService.findByUserId(userId);
    if (!emp) throw new Error('Employee profile not found');

    if (dto.endDate < dto.startDate) throw new Error('endDate must be >= startDate');
    const days = Math.ceil((dto.endDate.getTime() - dto.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 30) throw new Error('Leave cannot exceed 30 days');

    const overlap = await Leave.findOne({
      employeeId: emp._id,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: dto.endDate },
      endDate: { $gte: dto.startDate },
    });
    if (overlap) throw new Error('Overlapping approved leave exists');

    return Leave.create({ ...dto, employeeId: emp._id });
  }

  async updateStatus(id: string, dto: UpdateLeaveStatusInput, userId: string) {
    const leave = await Leave.findById(id);
    if (!leave) throw new Error('Leave not found');
    if (leave.status !== 'pending') throw new Error('Can only update pending leaves');

    const emp = await employeesService.findOne(leave.employeeId.toString());

    leave.status = dto.status;
    leave.approvedBy = userId as any;
    if (dto.rejectionReason) leave.rejectionReason = dto.rejectionReason;
    await leave.save();

    if (dto.status === 'approved') {
      const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      try {
        await leaveBalanceService.deduct(leave.employeeId.toString(), leave.type, days);
      } catch (e) {
        leave.status = 'pending';
        await leave.save();
        throw new Error(`Insufficient leave balance: ${(e as Error).message}`);
      }

      await notificationsService.create({
        userId: (emp as any).userId?._id?.toString() || userId,
        title: 'Leave Approved',
        message: `Your ${leave.type} leave (${leave.startDate.toISOString().split('T')[0]} - ${leave.endDate.toISOString().split('T')[0]}) has been approved.`,
        type: 'leave_approved',
        relatedId: leave._id.toString(),
        relatedModel: 'Leave',
      });
    } else if (dto.status === 'rejected') {
      await notificationsService.create({
        userId: (emp as any).userId?._id?.toString() || userId,
        title: 'Leave Rejected',
        message: `Your ${leave.type} leave request has been rejected.${dto.rejectionReason ? ' Reason: ' + dto.rejectionReason : ''}`,
        type: 'leave_rejected',
        relatedId: leave._id.toString(),
        relatedModel: 'Leave',
      });
    }

    return leave;
  }
}
