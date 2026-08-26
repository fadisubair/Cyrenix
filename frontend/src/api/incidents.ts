import client from './client';
import { Incident } from '../types';

export const incidentsApi = {
  getAll: async (): Promise<Incident[]> => {
    const response = await client.get('/api/incidents');
    return response.data;
  },

  getById: async (id: number | string): Promise<Incident> => {
    const response = await client.get(`/api/incidents/${id}`);
    return response.data;
  },
};
