import api from './client';

export const recruitmentApi = {
  getJobPostings: (params?: any) => api.get('/job-postings', { params }).then(r => r.data),
  getJobPosting: (id: string) => api.get(`/job-postings/${id}`).then(r => r.data),
  createJobPosting: (data: any) => api.post('/job-postings', data).then(r => r.data),
  updateJobPosting: (id: string, data: any) => api.put(`/job-postings/${id}`, data).then(r => r.data),
  deleteJobPosting: (id: string) => api.delete(`/job-postings/${id}`),
  getCandidates: (params?: any) => api.get('/candidates', { params }).then(r => r.data),
  getCandidate: (id: string) => api.get(`/candidates/${id}`).then(r => r.data),
  createCandidate: (data: any) => api.post('/candidates', data).then(r => r.data),
  updateCandidate: (id: string, data: any) => api.put(`/candidates/${id}`, data).then(r => r.data),
  deleteCandidate: (id: string) => api.delete(`/candidates/${id}`),
};
