import client from './client';
import { AuditLog } from '../types';

export const auditApi = {
  getAll: async (): Promise<AuditLog[]> => {
    const response = await client.get('/api/audit-logs');
    return response.data;
  },

  getByResponseAction: async (actionId: number | string): Promise<AuditLog[]> => {
    const response = await client.get(`/api/audit-logs/response-action/${actionId}`);
    return response.data;
  },
};
