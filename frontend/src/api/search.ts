import client from './client';

export const searchApi = {
  globalSearch: async (query: string): Promise<any> => {
    const response = await client.get(`/api/search`, { params: { q: query } });
    return response.data;
  },
};
