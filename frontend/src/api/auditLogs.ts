import { apiClient } from './client';
import { AuditLog } from '../types';

export const getAuditLogs = async (params?: any): Promise<AuditLog[]> => {
  const response = await apiClient.get('/api/audit-logs', { params });
  return response.data;
};
