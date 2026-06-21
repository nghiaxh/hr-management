import { EmployeeHistory } from '../models/employee-history.model.js';
import { CreateEmployeeHistoryInput } from '../schemas/employee-history.schema.js';

export class EmployeeHistoryService {
  async findByEmployee(employeeId: string) {
    return EmployeeHistory.find({ employeeId }).sort({ effectiveDate: -1 }).exec();
  }

  async create(employeeId: string, dto: CreateEmployeeHistoryInput) {
    return EmployeeHistory.create({ ...dto, employeeId: employeeId as any });
  }
}
