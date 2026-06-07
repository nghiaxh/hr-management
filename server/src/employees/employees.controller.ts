import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.employeesService.findAll(query, user);
  }

  @Get('export')
  @Roles('admin', 'manager')
  async exportCsv(@Res() res: any) {
    const csv = await this.employeesService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
    res.send(csv);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'employee')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.employeesService.findOne(id, user);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Post('bulk-delete')
  @Roles('admin')
  bulkDelete(@Body('ids') ids: string[]) {
    return this.employeesService.bulkDelete(ids);
  }

  @Post(':id/documents')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '../../uploads'),
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + extname(file.originalname));
      },
    }),
  }))
  uploadDocument(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.employeesService.addDocument(id, file);
  }

  @Delete(':id/documents/:docId')
  @Roles('admin')
  removeDocument(@Param('id') id: string, @Param('docId') docId: string) {
    return this.employeesService.removeDocument(id, docId);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
