import { JobPosting } from '../models/job-posting.model.js';
import { Candidate } from '../models/candidate.model.js';
import { escapeRegex } from '../utils/security.js';
import { CreateJobPostingInput, UpdateJobPostingInput, CreateCandidateInput, UpdateCandidateInput } from '../schemas/recruitment.schema.js';

export class RecruitmentService {
  async findAllJobPostings(query: { search?: string; status?: string; departmentId?: string; page?: number; limit?: number }) {
    const { search, status, departmentId, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;
    if (search) filter.title = new RegExp(escapeRegex(search), 'i');

    const total = await JobPosting.countDocuments(filter);
    const data = await JobPosting.find(filter)
      .populate('departmentId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { data, meta: { page, limit, total } };
  }

  async findOneJobPosting(id: string) {
    const job = await JobPosting.findById(id).populate('departmentId');
    if (!job) throw new Error('Job posting not found');
    return job;
  }

  async createJobPosting(dto: CreateJobPostingInput) {
    return JobPosting.create(dto);
  }

  async updateJobPosting(id: string, dto: UpdateJobPostingInput) {
    const job = await JobPosting.findByIdAndUpdate(id, dto, { new: true });
    if (!job) throw new Error('Job posting not found');
    return job;
  }

  async removeJobPosting(id: string) {
    const job = await JobPosting.findByIdAndDelete(id);
    if (!job) throw new Error('Job posting not found');
  }

  async findAllCandidates(query: { search?: string; status?: string; jobPostingId?: string; page?: number; limit?: number }) {
    const { search, status, jobPostingId, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (jobPostingId) filter.jobPostingId = jobPostingId;
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { firstName: new RegExp(escaped, 'i') },
        { lastName: new RegExp(escaped, 'i') },
        { email: new RegExp(escaped, 'i') },
      ];
    }

    const total = await Candidate.countDocuments(filter);
    const data = await Candidate.find(filter)
      .populate('jobPostingId')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { data, meta: { page, limit, total } };
  }

  async findOneCandidate(id: string) {
    const candidate = await Candidate.findById(id).populate('jobPostingId');
    if (!candidate) throw new Error('Candidate not found');
    return candidate;
  }

  async createCandidate(dto: CreateCandidateInput) {
    return Candidate.create({ ...dto, appliedDate: dto.appliedDate || new Date() });
  }

  async updateCandidate(id: string, dto: UpdateCandidateInput) {
    const candidate = await Candidate.findByIdAndUpdate(id, dto, { new: true });
    if (!candidate) throw new Error('Candidate not found');
    return candidate;
  }

  async removeCandidate(id: string) {
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) throw new Error('Candidate not found');
  }
}
