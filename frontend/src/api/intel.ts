import client from './client';

export interface ThreatIntel {
  id: number;
  ioc_value: string;
  ioc_type: string;
  provider: string;
  reputation: string;
  confidence: number;
  context_data?: any;
  first_seen?: string;
  last_seen?: string;
  retrieved_at: string;
}

export const intelApi = {
  getAll: async (): Promise<ThreatIntel[]> => {
    const response = await client.get(`/api/iocs`);
    return response.data;
  },
  
  search: async (value: string, type: string): Promise<ThreatIntel[]> => {
    const response = await client.get(`/api/iocs/search`, { params: { value, type } });
    return response.data;
  },
};
