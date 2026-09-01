import client from './client';

export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  ip_address: string;
  os: string;
  risk_level: string;
  last_seen: string;
  events_count: number;
}

export const assetsApi = {
  getAll: async (): Promise<Asset[]> => {
    const response = await client.get(`/api/assets`);
    return response.data;
  },
};
