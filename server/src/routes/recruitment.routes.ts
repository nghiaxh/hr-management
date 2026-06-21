import { Router, Request, Response } from 'express';
import { RecruitmentService } from '../services/recruitment.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createJobPostingSchema, updateJobPostingSchema, createCandidateSchema, updateCandidateSchema } from '../schemas/recruitment.schema.js';

const router = Router();
const service = new RecruitmentService();

router.use(authenticate);

router.get('/job-postings', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAllJobPostings(req.query as any);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/job-postings/:id', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await service.findOneJobPosting(req.params.id);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ message: e.message });
  }
});

router.post('/job-postings', requireRoles('admin'), validate(createJobPostingSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.createJobPosting(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/job-postings/:id', requireRoles('admin'), validate(updateJobPostingSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.updateJobPosting(req.params.id, req.body);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/job-postings/:id', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    await service.removeJobPosting(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(404).json({ message: e.message });
  }
});

router.get('/candidates', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await service.findAllCandidates(req.query as any);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/candidates/:id', requireRoles('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const result = await service.findOneCandidate(req.params.id);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ message: e.message });
  }
});

router.post('/candidates', requireRoles('admin', 'manager'), validate(createCandidateSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.createCandidate(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/candidates/:id', requireRoles('admin', 'manager'), validate(updateCandidateSchema), async (req: Request, res: Response) => {
  try {
    const result = await service.updateCandidate(req.params.id, req.body);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/candidates/:id', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    await service.removeCandidate(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(404).json({ message: e.message });
  }
});

export default router;
