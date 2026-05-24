import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { EmployeesService } from './employees/employees.service';
import { DepartmentsService } from './departments/departments.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const employeesService = app.get(EmployeesService);
  const departmentsService = app.get(DepartmentsService);

  const admin = await authService.register({ email: 'admin@hr.com', password: 'admin123', role: 'admin' });
  const manager = await authService.register({ email: 'manager@hr.com', password: 'manager123', role: 'manager' });
  const empUser = await authService.register({ email: 'employee@hr.com', password: 'employee123', role: 'employee' });
  const empUser2 = await authService.register({ email: 'employee2@hr.com', password: 'employee123', role: 'employee' });

  const engineering = await departmentsService.create({ name: 'Engineering', description: 'Engineering department', managerId: manager.user.id.toString() });
  const hr = await departmentsService.create({ name: 'HR', description: 'Human Resources' });

  await employeesService.create({
    userId: admin.user.id.toString(),
    departmentId: engineering._id.toString(),
    firstName: 'Admin',
    lastName: 'User',
    position: 'System Admin',
    salary: 5000,
    hireDate: new Date('2024-01-01'),
  });

  await employeesService.create({
    userId: manager.user.id.toString(),
    departmentId: engineering._id.toString(),
    firstName: 'Manager',
    lastName: 'User',
    position: 'Engineering Manager',
    salary: 4000,
    hireDate: new Date('2024-02-01'),
  });

  await employeesService.create({
    userId: empUser.user.id.toString(),
    departmentId: engineering._id.toString(),
    firstName: 'John',
    lastName: 'Doe',
    position: 'Software Engineer',
    salary: 3000,
    hireDate: new Date('2024-03-01'),
  });

  await employeesService.create({
    userId: empUser2.user.id.toString(),
    departmentId: hr._id.toString(),
    firstName: 'Jane',
    lastName: 'Smith',
    position: 'HR Specialist',
    salary: 3500,
    hireDate: new Date('2024-04-01'),
  });

  console.log('Seed data created successfully!');
  console.log('Admin: admin@hr.com / admin123');
  console.log('Manager: manager@hr.com / manager123');
  console.log('Employee: employee@hr.com / employee123');
  console.log('Employee2: employee2@hr.com / employee123');
  await app.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
