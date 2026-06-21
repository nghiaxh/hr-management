import { Department } from '../models/department.model.js';
import { Employee } from '../models/employee.model.js';
import { escapeRegex } from '../utils/security.js';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../schemas/departments.schema.js';

export class DepartmentsService {
  async findAll(query: { search?: string; page?: number; limit?: number }, user?: any) {
    const { search, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user?.role === 'manager') {
      filter.managerId = user.id;
    }
    if (search) {
      filter.name = new RegExp(escapeRegex(search), 'i');
    }

    const total = await Department.countDocuments(filter);
    const data = await Department.find(filter)
      .populate('managerId', '-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string) {
    const dept = await Department.findById(id).populate('managerId', '-passwordHash');
    if (!dept) throw new Error('Department not found');
    return dept;
  }

  async create(dto: CreateDepartmentInput) {
    return Department.create(dto);
  }

  async update(id: string, dto: UpdateDepartmentInput) {
    const dept = await Department.findByIdAndUpdate(id, dto, { new: true });
    if (!dept) throw new Error('Department not found');
    return dept;
  }

  async remove(id: string) {
    const dept = await Department.findByIdAndDelete(id);
    if (!dept) throw new Error('Department not found');
  }

  async getOrgChart() {
    const departments = await Department.find().populate('managerId', '-passwordHash').lean();
    const result: any[] = [];
    for (const dept of departments) {
      const employees = await Employee.find({ departmentId: (dept as any)._id.toString() })
        .populate('userId', '-passwordHash')
        .lean();
      result.push({
        _id: (dept as any)._id,
        name: dept.name,
        description: dept.description,
        manager: dept.managerId,
        employeeCount: employees.length,
        employees: employees.map(e => ({
          _id: e._id,
          firstName: e.firstName,
          lastName: e.lastName,
          position: e.position,
          user: e.userId,
        })),
      });
    }
    return result;
  }
}
