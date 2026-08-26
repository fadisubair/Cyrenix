import client from './client';
import { User, LoginCredentials, TokenResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await client.post('/api/auth/login', {
      username: credentials.username,
      password: credentials.password || ''
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('/api/auth/me');
    return response.data;
  },
};
