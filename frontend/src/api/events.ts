import client from './client';
import { Event } from '../types';

export const eventsApi = {
  getByIncident: async (incidentId: number | string): Promise<Event[]> => {
    const response = await client.get(`/api/events/incident/${incidentId}`);
    return response.data;
  },
};
