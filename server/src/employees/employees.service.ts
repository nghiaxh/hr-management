import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async findAll(query: { search?: string; departmentId?: string; page?: number; limit?: number }, user?: any) {
    const { search, departmentId, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (departmentId) filter.departmentId = departmentId;
    if (user?.role === 'manager') {
      const dept = await this.employeeModel.findOne({ userId: user.id }).select('departmentId');
      if (dept) filter.departmentId = dept.departmentId;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ firstName: regex }, { lastName: regex }, { position: regex }];
    }

    const total = await this.employeeModel.countDocuments(filter);
    const data = await this.employeeModel
      .find(filter)
      .populate('userId', '-passwordHash')
      .populate('departmentId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string, user?: any) {
    const employee = await this.employeeModel.findById(id)
      .populate('userId', '-passwordHash')
      .populate('departmentId');
    if (!employee) throw new NotFoundException('Employee not found');
    if (user?.role === 'employee' && employee.userId._id.toString() !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return employee;
  }

  async create(dto: CreateEmployeeDto) {
    return this.employeeModel.create(dto);
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const emp = await this.employeeModel.findByIdAndUpdate(id, dto, { new: true });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async remove(id: string) {
    const emp = await this.employeeModel.findByIdAndDelete(id);
    if (!emp) throw new NotFoundException('Employee not found');
  }

  async bulkDelete(ids: string[]) {
    await this.employeeModel.deleteMany({ _id: { $in: ids } });
    return { deleted: ids.length };
  }

  async exportCsv() {
    const employees = await this.employeeModel.find()
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
    const emp = await this.employeeModel.findById(id);
    if (!emp) throw new NotFoundException('Employee not found');
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
    const emp = await this.employeeModel.findById(id);
    if (!emp) throw new NotFoundException('Employee not found');
    emp.documents = emp.documents.filter((d: any) => d._id.toString() !== docId);
    await emp.save();
    return emp;
  }

  async findByUserId(userId: string) {
    return this.employeeModel.findOne({ userId }).populate('departmentId');
  }
}
