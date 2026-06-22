import { Employee } from '../models/employee.model.js';
import { EmployeeHistory } from '../models/employee-history.model.js';
import { escapeRegex } from '../utils/security.js';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../schemas/employees.schema.js';
import { CreateEmployeeHistoryInput } from '../schemas/employee-history.schema.js';

export class EmployeesService {
  async findAll(query: { search?: string; departmentId?: string; page?: number; limit?: number }, user?: any) {
    const { search, departmentId, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (departmentId) filter.departmentId = departmentId;
    if (user?.role === 'manager') {
      const dept = await Employee.findOne({ userId: user.id }).select('departmentId');
      if (dept) filter.departmentId = dept.departmentId;
    }
    if (search) {
      const escaped = escapeRegex(search);
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ firstName: regex }, { lastName: regex }, { position: regex }];
    }

    const total = await Employee.countDocuments(filter);
    const data = await Employee.find(filter)
      .populate('userId', '-passwordHash')
      .populate('departmentId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string, user?: any) {
    const employee = await Employee.findById(id)
      .populate('userId', '-passwordHash')
      .populate('departmentId');
    if (!employee) throw new Error('Employee not found');
    if (user?.role === 'employee') {
      const empUserId = (employee.userId as any)?._id?.toString();
      if (!empUserId || empUserId !== user.id) {
        throw new Error('Access denied');
      }
    }
    return employee;
  }

  async create(dto: CreateEmployeeInput) {
    return Employee.create(dto);
  }

  async update(id: string, dto: UpdateEmployeeInput) {
    const emp = await Employee.findByIdAndUpdate(id, dto, { new: true });
    if (!emp) throw new Error('Employee not found');
    return emp;
  }

  async remove(id: string) {
    const emp = await Employee.findByIdAndDelete(id);
    if (!emp) throw new Error('Employee not found');
  }

  async bulkDelete(ids: string[]) {
    if (!ids?.length || ids.length > 100) {
      throw new Error('Invalid or too many IDs (max 100)');
    }
    await Employee.deleteMany({ _id: { $in: ids } });
    return { deleted: ids.length };
  }

  async exportCsv(user?: any) {
    const filter: any = {};
    if (user?.role === 'manager') {
      const emp = await Employee.findOne({ userId: user.id }).select('departmentId');
      if (emp) filter.departmentId = emp.departmentId;
    }
    const employees = await Employee.find(filter)
      .populate('userId', '-passwordHash')
      .populate('departmentId');

    const header = 'firstName,lastName,position,department,salary,email,phone,contractType,hireDate';
    const rows = employees.map(e => {
      const row = [
        `"${e.firstName}"`,
        `"${e.lastName}"`,
        `"${e.position}"`,
        `"${(e as any).departmentId?.name || ''}"`,
        e.salary,
        `"${(e as any).userId?.email || ''}"`,
        `"${e.phone || ''}"`,
        e.contractType || '',
        e.hireDate ? new Date(e.hireDate).toISOString().split('T')[0] : '',
      ];
      return row.join(',');
    });

    return [header, ...rows].join('\n');
  }

  async addDocument(id: string, file: Express.Multer.File) {
    const emp = await Employee.findById(id);
    if (!emp) throw new Error('Employee not found');
    emp.documents.push({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      uploadedAt: new Date(),
    });
    await emp.save();
    return emp;
  }

  async removeDocument(id: string, docId: string) {
    const emp = await Employee.findById(id);
    if (!emp) throw new Error('Employee not found');
    emp.documents = emp.documents.filter((d: any) => d._id.toString() !== docId);
    await emp.save();
    return emp;
  }

  async findByUserId(userId: string) {
    return Employee.findOne({ userId }).populate('departmentId');
  }

  async getHistory(employeeId: string) {
    return EmployeeHistory.find({ employeeId: employeeId as any }).sort({ effectiveDate: -1 }).exec();
  }

  async addHistory(employeeId: string, dto: CreateEmployeeHistoryInput) {
    return EmployeeHistory.create({ ...dto, employeeId: employeeId as any });
  }
}
