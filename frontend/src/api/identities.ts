import client from './client';

export const identitiesApi = {
  getAll: async (): Promise<any[]> => {
    const response = await client.get(`/api/identities`);
    return response.data;
  },
  
  getByIncident: async (incidentId: number | string): Promise<any> => {
    const response = await client.get(`/api/incidents/${incidentId}/identity-risk`);
    return response.data;
  },
};
