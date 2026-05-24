import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  async findAll(query: { search?: string; page?: number; limit?: number }, user?: any) {
    const { search, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (user?.role === 'manager') {
      filter.managerId = user.id;
    }
    if (search) {
      filter.name = new RegExp(search, 'i');
    }

    const total = await this.departmentModel.countDocuments(filter);
    const data = await this.departmentModel
      .find(filter)
      .populate('managerId', '-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string) {
    const dept = await this.departmentModel.findById(id).populate('managerId', '-passwordHash');
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    return this.departmentModel.create(dto);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const dept = await this.departmentModel.findByIdAndUpdate(id, dto, { new: true });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async remove(id: string) {
    const dept = await this.departmentModel.findByIdAndDelete(id);
    if (!dept) throw new NotFoundException('Department not found');
  }
}
