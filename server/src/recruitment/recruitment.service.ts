import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobPosting, JobPostingDocument } from './schemas/job-posting.schema';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobPosting.name) private jobPostingModel: Model<JobPostingDocument>,
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
  ) {}

  async findAllJobPostings(query: { search?: string; status?: string; departmentId?: string; page?: number; limit?: number }) {
    const { search, status, departmentId, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;
    if (search) {
      filter.title = new RegExp(search, 'i');
    }
    const total = await this.jobPostingModel.countDocuments(filter);
    const data = await this.jobPostingModel
      .find(filter)
      .populate('departmentId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { data, meta: { page, limit, total } };
  }

  async findOneJobPosting(id: string) {
    const job = await this.jobPostingModel.findById(id).populate('departmentId');
    if (!job) throw new NotFoundException('Job posting not found');
    return job;
  }

  async createJobPosting(dto: CreateJobPostingDto) {
    return this.jobPostingModel.create(dto);
  }

  async updateJobPosting(id: string, dto: UpdateJobPostingDto) {
    const job = await this.jobPostingModel.findByIdAndUpdate(id, dto, { new: true });
    if (!job) throw new NotFoundException('Job posting not found');
    return job;
  }

  async removeJobPosting(id: string) {
    const job = await this.jobPostingModel.findByIdAndDelete(id);
    if (!job) throw new NotFoundException('Job posting not found');
  }

  async findAllCandidates(query: { search?: string; status?: string; jobPostingId?: string; page?: number; limit?: number }) {
    const { search, status, jobPostingId, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (jobPostingId) filter.jobPostingId = jobPostingId;
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    const total = await this.candidateModel.countDocuments(filter);
    const data = await this.candidateModel
      .find(filter)
      .populate('jobPostingId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { data, meta: { page, limit, total } };
  }

  async findOneCandidate(id: string) {
    const candidate = await this.candidateModel.findById(id).populate('jobPostingId');
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async createCandidate(dto: CreateCandidateDto) {
    return this.candidateModel.create({ ...dto, appliedDate: dto.appliedDate || new Date() });
  }

  async updateCandidate(id: string, dto: UpdateCandidateDto) {
    const candidate = await this.candidateModel.findByIdAndUpdate(id, dto, { new: true });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

  async removeCandidate(id: string) {
    const candidate = await this.candidateModel.findByIdAndDelete(id);
    if (!candidate) throw new NotFoundException('Candidate not found');
  }
}
