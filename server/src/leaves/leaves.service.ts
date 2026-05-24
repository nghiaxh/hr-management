import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leave, LeaveDocument } from './schemas/leave.schema';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
    private employeesService: EmployeesService,
  ) {}

  async findAll(query: { status?: string; employeeId?: string; type?: string; page?: number; limit?: number }, user: any) {
    const { status, employeeId, type, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user.role === 'employee') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (emp) filter.employeeId = emp._id;
    } else if (user.role === 'manager') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (emp) {
        const deptEmps = await this.employeesService.findAll({ departmentId: emp.departmentId?.toString() }, user);
        filter.employeeId = { $in: deptEmps.data.map(e => e._id) };
      }
    }
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const total = await this.leaveModel.countDocuments(filter);
    const data = await this.leaveModel
      .find(filter)
      .populate('employeeId')
      .populate('approvedBy', '-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string, user: any) {
    const leave = await this.leaveModel.findById(id)
      .populate('employeeId')
      .populate('approvedBy', '-passwordHash');
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }

  async create(dto: CreateLeaveDto, userId: string) {
    const emp = await this.employeesService.findByUserId(userId);
    if (!emp) throw new NotFoundException('Employee profile not found');

    if (dto.endDate < dto.startDate) throw new BadRequestException('endDate must be >= startDate');
    const days = Math.ceil((dto.endDate.getTime() - dto.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 30) throw new BadRequestException('Leave cannot exceed 30 days');

    const overlap = await this.leaveModel.findOne({
      employeeId: emp._id,
      status: 'approved',
      startDate: { $lte: dto.endDate },
      endDate: { $gte: dto.startDate },
    });
    if (overlap) throw new ConflictException('Overlapping approved leave exists');

    return this.leaveModel.create({ ...dto, employeeId: emp._id });
  }

  async updateStatus(id: string, dto: UpdateLeaveStatusDto, userId: string) {
    const leave = await this.leaveModel.findById(id);
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'pending') throw new BadRequestException('Can only update pending leaves');

    leave.status = dto.status;
    leave.approvedBy = userId as any;
    if (dto.rejectionReason) leave.rejectionReason = dto.rejectionReason;
    return leave.save();
  }
}
