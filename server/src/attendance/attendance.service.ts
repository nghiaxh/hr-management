import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    private employeesService: EmployeesService,
  ) {}

  async findAll(query: AttendanceQueryDto, user: any) {
    const { from, to, employeeId, status } = query;
    const filter: any = {};

    if (user.role === 'employee') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (emp) filter.employeeId = emp._id;
    }
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    return this.attendanceModel.find(filter).populate('employeeId').sort({ date: -1 });
  }

  async checkIn(userId: string) {
    const emp = await this.employeesService.findByUserId(userId);
    if (!emp) throw new NotFoundException('Employee profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.attendanceModel.findOne({
      employeeId: emp._id,
      date: today,
    });
    if (existing) throw new ConflictException('Already checked in today');

    const now = new Date();
    const nineAM = new Date(today);
    nineAM.setHours(9, 0, 0, 0);
    const status = now > nineAM ? 'late' : 'present';

    return this.attendanceModel.create({
      employeeId: emp._id,
      date: today,
      checkIn: now,
      status,
    });
  }

  async checkOut(id: string, userId: string) {
    const emp = await this.employeesService.findByUserId(userId);
    if (!emp) throw new NotFoundException('Employee profile not found');

    const record = await this.attendanceModel.findOne({ _id: id, employeeId: emp._id });
    if (!record) throw new NotFoundException('Attendance record not found');
    if (record.checkOut) throw new ConflictException('Already checked out');

    record.checkOut = new Date();
    const hours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
    if (hours < 4) record.status = 'half-day';
    return record.save();
  }
}
