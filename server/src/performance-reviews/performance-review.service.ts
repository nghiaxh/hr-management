import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerformanceReview, PerformanceReviewDocument } from './schemas/performance-review.schema';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';

@Injectable()
export class PerformanceReviewService {
  constructor(
    @InjectModel(PerformanceReview.name) private reviewModel: Model<PerformanceReviewDocument>,
  ) {}

  async findAll(query: { employeeId?: string; status?: string; page?: number; limit?: number }, user?: any) {
    const { employeeId, status, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    const total = await this.reviewModel.countDocuments(filter);
    const data = await this.reviewModel
      .find(filter)
      .populate('employeeId')
      .populate('reviewerId', '-passwordHash')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string) {
    const review = await this.reviewModel.findById(id)
      .populate('employeeId')
      .populate('reviewerId', '-passwordHash');
    if (!review) throw new NotFoundException('Performance review not found');
    return review;
  }

  async create(dto: CreatePerformanceReviewDto, reviewerId: string) {
    return this.reviewModel.create({ ...dto, reviewerId: reviewerId as any });
  }

  async update(id: string, dto: UpdatePerformanceReviewDto) {
    const review = await this.reviewModel.findByIdAndUpdate(id, dto, { new: true });
    if (!review) throw new NotFoundException('Performance review not found');
    return review;
  }

  async remove(id: string) {
    const review = await this.reviewModel.findByIdAndDelete(id);
    if (!review) throw new NotFoundException('Performance review not found');
  }
}
