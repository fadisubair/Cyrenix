import client from './client';
import { Finding, Event } from '../types';

export const findingsApi = {
  getByIncident: async (incidentId: number | string): Promise<Finding[]> => {
    const response = await client.get(`/api/findings/incident/${incidentId}`);
    return response.data;
  },

  getEvidence: async (findingId: number | string): Promise<Event[]> => {
    const response = await client.get(`/api/findings/${findingId}/evidence`);
    return response.data;
  },
};
