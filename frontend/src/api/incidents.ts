import { apiClient } from './client';
import { Incident } from '../types';

export const getIncidents = async (): Promise<Incident[]> => {
  const response = await apiClient.get('/api/incidents');
  return response.data;
};

export const getIncident = async (id: string): Promise<Incident> => {
  const response = await apiClient.get(`/api/incidents/${id}`);
  return response.data;
};

export const updateIncident = async (id: string, data: any): Promise<Incident> => {
  const response = await apiClient.patch(`/api/incidents/${id}`, data);
  return response.data;
};
