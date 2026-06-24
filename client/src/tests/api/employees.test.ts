import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { employeesApi } from '@/api/employees';

describe('employeesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches employees with params', async () => {
    const mockResponse = {
      data: { data: [{ _id: '1', firstName: 'John' }], meta: { page: 1, limit: 20, total: 1 } },
    };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.getAll({ page: 1, department: 'd1' });
    expect(api.get).toHaveBeenCalledWith('/employees', { params: { page: 1, department: 'd1' } });
    expect(result.data[0].firstName).toBe('John');
  });

  it('getOne fetches single employee', async () => {
    const mockResponse = { data: { _id: '1', firstName: 'John', lastName: 'Doe' } };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.getOne('1');
    expect(api.get).toHaveBeenCalledWith('/employees/1');
    expect(result.firstName).toBe('John');
  });

  it('create posts employee data', async () => {
    const payload = { firstName: 'Jane', lastName: 'Smith', position: 'Designer' };
    const mockResponse = { data: { _id: '2', ...payload } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.create(payload);
    expect(api.post).toHaveBeenCalledWith('/employees', payload);
    expect(result._id).toBe('2');
  });

  it('update puts employee data', async () => {
    const payload = { firstName: 'Updated' };
    const mockResponse = { data: { _id: '1', ...payload } };
    (api.put as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.update('1', payload);
    expect(api.put).toHaveBeenCalledWith('/employees/1', payload);
    expect(result.firstName).toBe('Updated');
  });

  it('delete removes employee', async () => {
    (api.delete as any).mockResolvedValue({});
    await employeesApi.delete('1');
    expect(api.delete).toHaveBeenCalledWith('/employees/1');
  });

  it('bulkDelete posts array of ids', async () => {
    const mockResponse = { data: { deleted: 2 } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.bulkDelete(['1', '2']);
    expect(api.post).toHaveBeenCalledWith('/employees/bulk-delete', { ids: ['1', '2'] });
    expect(result.deleted).toBe(2);
  });

  it('exportCsv creates blob and triggers download', async () => {
    const blobContent = 'firstName,lastName\nJohn,Doe\n';
    (api.get as any).mockResolvedValue({ data: blobContent });
    const createObjectURL = vi.fn(() => 'blob:test-url');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;
    const clickFn = vi.fn();
    const mockAnchor = { href: '', download: '', click: clickFn };
    document.createElement = vi.fn(() => mockAnchor) as any;

    await employeesApi.exportCsv();

    expect(api.get).toHaveBeenCalledWith('/employees/export', { responseType: 'blob' });
    expect(createObjectURL).toHaveBeenCalled();
    expect(clickFn).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });

  it('uploadDocument sends FormData', async () => {
    const mockResponse = { data: { _id: 'doc1', name: 'resume.pdf' } };
    (api.post as any).mockResolvedValue(mockResponse);
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
    const result = await employeesApi.uploadDocument('1', file);
    expect(api.post).toHaveBeenCalledWith('/employees/1/documents', expect.any(FormData));
    expect(result.name).toBe('resume.pdf');
  });

  it('removeDocument deletes document', async () => {
    const mockResponse = { data: { message: 'Document removed' } };
    (api.delete as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.removeDocument('1', 'doc1');
    expect(api.delete).toHaveBeenCalledWith('/employees/1/documents/doc1');
    expect(result.message).toBe('Document removed');
  });

  it('getHistory fetches employee history', async () => {
    const mockResponse = { data: [{ _id: 'h1', type: 'raise', newValue: '60000' }] };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.getHistory('1');
    expect(api.get).toHaveBeenCalledWith('/employees/1/history');
    expect(result[0].type).toBe('raise');
  });

  it('addHistory posts new history entry', async () => {
    const payload = { type: 'promotion', newValue: 'Senior Developer', effectiveDate: '2025-07-01' };
    const mockResponse = { data: { _id: 'h2', ...payload } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await employeesApi.addHistory('1', payload);
    expect(api.post).toHaveBeenCalledWith('/employees/1/history', payload);
    expect(result.type).toBe('promotion');
  });
});
