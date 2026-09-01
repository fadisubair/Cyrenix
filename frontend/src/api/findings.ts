import client from './client';
import { Finding, Event } from '../types';

export const findingsApi = {
  getAll: async (): Promise<Finding[]> => {
    const response = await client.get(`/api/findings`);
    return response.data;
  },

  getByIncident: async (incidentId: number | string): Promise<Finding[]> => {
    const response = await client.get(`/api/findings/incident/${incidentId}`);
    return response.data;
  },

  getEvidence: async (findingId: number | string): Promise<Event[]> => {
    const response = await client.get(`/api/findings/${findingId}/evidence`);
    return response.data;
  },

  update: async (findingId: number | string, data: Partial<Finding>): Promise<Finding> => {
    const response = await client.patch(`/api/findings/${findingId}`, data);
    return response.data;
  },
};
