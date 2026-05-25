import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeHistory, EmployeeHistoryDocument } from './schemas/employee-history.schema';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';

@Injectable()
export class EmployeeHistoryService {
  constructor(
    @InjectModel(EmployeeHistory.name) private historyModel: Model<EmployeeHistoryDocument>,
  ) {}

  async findByEmployee(employeeId: string) {
    return this.historyModel
      .find({ employeeId })
      .sort({ effectiveDate: -1 })
      .exec();
  }

  async create(employeeId: string, dto: CreateEmployeeHistoryDto) {
    return this.historyModel.create({ ...dto, employeeId: employeeId as any });
  }
}
