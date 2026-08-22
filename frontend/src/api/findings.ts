import { apiClient } from './client';
import { Finding, Event } from '../types';

export const getFindings = async (params?: any): Promise<Finding[]> => {
  const response = await apiClient.get('/api/findings', { params });
  return response.data;
};

export const getFinding = async (id: string): Promise<Finding> => {
  const response = await apiClient.get(`/api/findings/${id}`);
  return response.data;
};

export const getFindingEvidence = async (id: string): Promise<Event[]> => {
  const response = await apiClient.get(`/api/findings/${id}/evidence`);
  return response.data;
};
