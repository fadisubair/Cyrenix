import client from './client';
import { AttackChain } from '../types';

export const chainsApi = {
  getAll: async (): Promise<AttackChain[]> => {
    const response = await client.get(`/api/attack-chains`);
    return response.data;
  },
  
  getByIncident: async (incidentId: number | string): Promise<AttackChain[]> => {
    const response = await client.get(`/api/incidents/${incidentId}/attack-chain`);
    return response.data;
  },

  correlate: async (incidentId: number | string): Promise<AttackChain[]> => {
    const response = await client.post(`/api/incidents/${incidentId}/correlate`);
    return response.data;
  },
};
