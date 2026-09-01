import client from './client';

export interface AnalystNote {
  id: number;
  incident_id: number;
  author_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export const notesApi = {
  getByIncident: async (incidentId: number | string): Promise<AnalystNote[]> => {
    const response = await client.get(`/api/incidents/${incidentId}/notes`);
    return response.data;
  },

  create: async (incidentId: number | string, content: string): Promise<AnalystNote> => {
    const response = await client.post(`/api/incidents/${incidentId}/notes`, { content });
    return response.data;
  },
};
