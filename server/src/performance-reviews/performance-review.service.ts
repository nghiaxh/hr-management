import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerformanceReview, PerformanceReviewDocument } from './schemas/performance-review.schema.js';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto.js';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto.js';
import { EmployeesService } from '../employees/employees.service.js';

@Injectable()
export class PerformanceReviewService {
  constructor(
    @InjectModel(PerformanceReview.name) private reviewModel: Model<PerformanceReviewDocument>,
    private employeesService: EmployeesService,
  ) {}

  async findAll(query: { employeeId?: string; status?: string; page?: number; limit?: number }, user?: any) {
    const { employeeId, status, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user?.role === 'employee') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (emp) filter.employeeId = emp._id;
    } else if (user?.role === 'admin' && employeeId) {
      filter.employeeId = employeeId;
    } else if (user?.role === 'manager') {
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
    if (status) filter.status = status;

    const total = await this.reviewModel.countDocuments(filter);
    const data = await this.reviewModel
      .find(filter)
      .populate('employeeId')
      .populate('reviewerId', '-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string, user?: any) {
    const review = await this.reviewModel.findById(id)
      .populate('employeeId')
      .populate('reviewerId', '-passwordHash');
    if (!review) throw new NotFoundException('Performance review not found');

    if (user?.role === 'employee') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (!emp || review.employeeId.toString() !== emp._id.toString()) {
        throw new ForbiddenException('Access denied');
      }
    } else if (user?.role === 'manager') {
      const emp = await this.employeesService.findByUserId(user.id);
      if (!emp || !emp.departmentId) throw new ForbiddenException('Access denied');
      const reviewEmp = await this.employeesService.findOne(review.employeeId.toString()).catch(() => null);
      if (!reviewEmp || !reviewEmp.departmentId || reviewEmp.departmentId.toString() !== emp.departmentId.toString()) {
        throw new ForbiddenException('Access denied');
      }
    }

    return review;
  }

  async create(dto: CreatePerformanceReviewDto, reviewerId: string) {
    return this.reviewModel.create({ ...dto, reviewerId: reviewerId as any });
  }

  async update(id: string, dto: UpdatePerformanceReviewDto) {
    const review = await this.reviewModel.findByIdAndUpdate(id, dto, { new: true });
    if (!review) throw new NotFoundException('Performance review not found');
    return review;
  }

  async remove(id: string) {
    const review = await this.reviewModel.findByIdAndDelete(id);
    if (!review) throw new NotFoundException('Performance review not found');
  }
}
