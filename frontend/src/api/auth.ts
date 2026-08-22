import { apiClient } from './client';
import { User } from '../types';

export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/api/auth/login', { username, password });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};
