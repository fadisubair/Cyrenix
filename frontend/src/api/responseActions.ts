import { apiClient } from './client';
import { ResponseAction } from '../types';

export const getResponseAction = async (id: string): Promise<ResponseAction> => {
  const response = await apiClient.get(`/api/response-actions/${id}`);
  return response.data;
};

export const approveResponseAction = async (id: string): Promise<ResponseAction> => {
  const response = await apiClient.patch(`/api/response-actions/${id}/approve`);
  return response.data;
};

export const rejectResponseAction = async (id: string): Promise<ResponseAction> => {
  const response = await apiClient.patch(`/api/response-actions/${id}/reject`);
  return response.data;
};

export const executeResponseAction = async (id: string, mode: 'DRY_RUN' | 'LIVE' = 'DRY_RUN'): Promise<ResponseAction> => {
  const response = await apiClient.post(`/api/response-actions/${id}/execute`, { mode });
  return response.data;
};

export const getResponseActionsByFinding = async (findingId: string): Promise<ResponseAction[]> => {
  const response = await apiClient.get(`/api/response-actions`, { params: { finding_id: findingId }});
  return response.data;
};

export const recommendResponseAction = async (findingId: string): Promise<ResponseAction> => {
  const response = await apiClient.post(`/api/response-actions/finding/${findingId}/recommend`);
  return response.data;
};
