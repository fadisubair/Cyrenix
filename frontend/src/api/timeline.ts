import client from './client';
import { TimelineEvent } from '../types';

export const timelineApi = {
  getByIncident: async (incidentId: number | string): Promise<TimelineEvent[]> => {
    const response = await client.get(`/api/incidents/${incidentId}/timeline`);
    return response.data.timeline;
  },
};
