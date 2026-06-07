import api from './client';

export const employeesApi = {
  getAll: (params?: any) => api.get('/employees', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/employees/${id}`).then(r => r.data),
  create: (data: any) => api.post('/employees', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  bulkDelete: (ids: string[]) => api.post('/employees/bulk-delete', { ids }).then(r => r.data),
  exportCsv: () => api.get('/employees/export', { responseType: 'blob' }).then(r => {
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click();
    window.URL.revokeObjectURL(url);
  }),
  uploadDocument: (id: string, file: File) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post(`/employees/${id}/documents`, fd).then(r => r.data);
  },
  removeDocument: (id: string, docId: string) => api.delete(`/employees/${id}/documents/${docId}`).then(r => r.data),
};
