import { apiClient } from './client';
import { TimelineEvent } from '../types';

export const getIncidentTimeline = async (incidentId: string, params?: any): Promise<TimelineEvent[]> => {
  const response = await apiClient.get(`/api/incidents/${incidentId}/timeline`, { params });
  return response.data;
};
