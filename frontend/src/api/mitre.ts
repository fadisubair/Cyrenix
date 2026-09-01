import client from './client';

export const mitreApi = {
  getCoverage: async (): Promise<any> => {
    const response = await client.get(`/api/mitre/coverage`);
    return response.data;
  },
};
