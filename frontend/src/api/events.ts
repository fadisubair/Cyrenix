import { apiClient } from './client';
import { Event } from '../types';

export const getEvents = async (params?: any): Promise<Event[]> => {
  const response = await apiClient.get('/api/events', { params });
  return response.data;
};
