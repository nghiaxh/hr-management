import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth/auth.service';
import { EmployeesService } from './employees/employees.service';
import { DepartmentsService } from './departments/departments.service';
import { User, UserDocument } from './auth/schemas/user.schema';

@Injectable()
export class StartupSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authService: AuthService,
    private employeesService: EmployeesService,
    private departmentsService: DepartmentsService,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.userModel.countDocuments();
    if (count > 0) return;

    const admin = await this.authService.register({ email: 'admin@hr.com', password: 'admin123', role: 'admin' });
    const manager = await this.authService.register({ email: 'manager@hr.com', password: 'manager123', role: 'manager' });
    const empUser = await this.authService.register({ email: 'employee@hr.com', password: 'employee123', role: 'employee' });
    const empUser2 = await this.authService.register({ email: 'employee2@hr.com', password: 'employee123', role: 'employee' });

    const engineering = await this.departmentsService.create({ name: 'Engineering', description: 'Engineering department', managerId: manager.user.id.toString() });
    const hr = await this.departmentsService.create({ name: 'HR', description: 'Human Resources' });

    await this.employeesService.create({
      userId: admin.user.id.toString(),
      departmentId: engineering._id.toString(),
      firstName: 'Admin',
      lastName: 'User',
      position: 'System Admin',
      salary: 5000,
      hireDate: new Date('2024-01-01'),
    });

    await this.employeesService.create({
      userId: manager.user.id.toString(),
      departmentId: engineering._id.toString(),
      firstName: 'Manager',
      lastName: 'User',
      position: 'Engineering Manager',
      salary: 4000,
      hireDate: new Date('2024-02-01'),
    });

    await this.employeesService.create({
      userId: empUser.user.id.toString(),
      departmentId: engineering._id.toString(),
      firstName: 'John',
      lastName: 'Doe',
      position: 'Software Engineer',
      salary: 3000,
      hireDate: new Date('2024-03-01'),
    });

    await this.employeesService.create({
      userId: empUser2.user.id.toString(),
      departmentId: hr._id.toString(),
      firstName: 'Jane',
      lastName: 'Smith',
      position: 'HR Specialist',
      salary: 3500,
      hireDate: new Date('2024-04-01'),
    });

    console.log('Auto-seed complete — demo accounts created');
  }
}
