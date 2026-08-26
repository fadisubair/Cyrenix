import client from './client';

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const response = await client.get('/health');
    return response.data;
  },
};
