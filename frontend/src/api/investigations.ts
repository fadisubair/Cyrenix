import { apiClient } from './client';
import { InvestigationStep, Finding } from '../types';

export const getInvestigationReasoning = async (findingId: string): Promise<InvestigationStep[]> => {
  const response = await apiClient.get(`/api/investigations/findings/${findingId}/reasoning`);
  return response.data;
};

export const analyzeIncident = async (incidentId: string): Promise<Finding> => {
  const response = await apiClient.post(`/api/investigations/${incidentId}/analyze`);
  return response.data;
};
