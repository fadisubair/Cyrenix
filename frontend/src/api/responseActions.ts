import client from './client';
import { ResponseAction, ExecutionResult } from '../types';

export const responseActionsApi = {
  getByFinding: async (findingId: number | string): Promise<ResponseAction[]> => {
    const response = await client.get(`/api/response-actions/finding/${findingId}`);
    return response.data;
  },

  recommend: async (findingId: number | string): Promise<ResponseAction> => {
    const response = await client.post(`/api/response-actions/finding/${findingId}/recommend`);
    return response.data;
  },

  approve: async (actionId: number | string): Promise<ResponseAction> => {
    const response = await client.patch(`/api/response-actions/${actionId}/approve`);
    return response.data;
  },

  reject: async (actionId: number | string): Promise<ResponseAction> => {
    const response = await client.patch(`/api/response-actions/${actionId}/reject`);
    return response.data;
  },

  execute: async (actionId: number | string, mode: string = 'DRY_RUN'): Promise<ExecutionResult> => {
    const response = await client.post(`/api/response-actions/${actionId}/execute`, {
      mode
    });
    return response.data;
  },
};
