import client from './client';

export const investigationsApi = {
  analyze: async (incidentId: number | string): Promise<any> => {
    const response = await client.post(`/api/investigations/${incidentId}/analyze`);
    return response.data;
  },

  getReasoning: async (findingId: number | string): Promise<any[]> => {
    const response = await client.get(`/api/investigations/findings/${findingId}/reasoning`);
    return response.data;
  },
};
