import client from './client';
import { Incident, AttackChain, IdentityProfile, BlastRadius } from '../types';

export const incidentsApi = {
  getAll: async (): Promise<Incident[]> => {
    const response = await client.get('/api/incidents');
    return response.data;
  },

  getById: async (id: number | string): Promise<Incident> => {
    const response = await client.get(`/api/incidents/${id}`);
    return response.data;
  },
  getAttackChain: async (id: number | string): Promise<AttackChain[]> => {
    const { data } = await client.get(`/api/incidents/${id}/attack-chain`);
    return data;
  },
  getIdentityRisk: async (id: number | string): Promise<IdentityProfile> => {
    const { data } = await client.get(`/api/incidents/${id}/identity-risk`);
    return data;
  },
  getBlastRadius: async (id: number | string): Promise<BlastRadius> => {
    const { data } = await client.get(`/api/incidents/${id}/blast-radius`);
    return data;
  }
};
