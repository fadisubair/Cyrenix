import client from './client';
import { Event } from '../types';

export const eventsApi = {
  getAll: async (params?: any): Promise<Event[]> => {
    const response = await client.get(`/api/events`, { params });
    return response.data;
  },
  
  getByIncident: async (incidentId: number | string): Promise<Event[]> => {
    const response = await client.get(`/api/events/incident/${incidentId}`);
    return response.data;
  },
};
