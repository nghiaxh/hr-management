import { PerformanceReview } from '../models/performance-review.model.js';
import { CreatePerformanceReviewInput, UpdatePerformanceReviewInput } from '../schemas/performance-review.schema.js';
import { EmployeesService } from './employees.service.js';

const employeesService = new EmployeesService();

export class PerformanceReviewService {
  async findAll(query: { employeeId?: string; status?: string; page?: number; limit?: number }, user?: any) {
    const { employeeId, status, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user?.role === 'employee') {
      const emp = await employeesService.findByUserId(user.id);
      if (emp) filter.employeeId = emp._id;
    } else if (user?.role === 'admin' && employeeId) {
      filter.employeeId = employeeId;
    } else if (user?.role === 'manager') {
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

    const total = await PerformanceReview.countDocuments(filter);
    const data = await PerformanceReview.find(filter)
      .populate('employeeId')
      .populate('reviewerId', '-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string, user?: any) {
    const review = await PerformanceReview.findById(id)
      .populate('employeeId')
      .populate('reviewerId', '-passwordHash');
    if (!review) throw new Error('Performance review not found');

    if (user?.role === 'employee') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp || review.employeeId.toString() !== emp._id.toString()) {
        throw new Error('Access denied');
      }
    } else if (user?.role === 'manager') {
      const emp = await employeesService.findByUserId(user.id);
      if (!emp || !emp.departmentId) throw new Error('Access denied');
      const reviewEmp = await employeesService.findOne(review.employeeId.toString()).catch(() => null);
      if (!reviewEmp || !(reviewEmp as any).departmentId || (reviewEmp as any).departmentId.toString() !== emp.departmentId.toString()) {
        throw new Error('Access denied');
      }
    }

    return review;
  }

  async create(dto: CreatePerformanceReviewInput, reviewerId: string) {
    return PerformanceReview.create({ ...dto, reviewerId: reviewerId as any });
  }

  async update(id: string, dto: UpdatePerformanceReviewInput) {
    const review = await PerformanceReview.findByIdAndUpdate(id, dto, { new: true });
    if (!review) throw new Error('Performance review not found');
    return review;
  }

  async remove(id: string) {
    const review = await PerformanceReview.findByIdAndDelete(id);
    if (!review) throw new Error('Performance review not found');
  }
}
