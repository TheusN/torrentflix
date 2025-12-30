import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export const authApi = {
  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', data);
    return response.data.data;
  },

  // Register new user
  async register(data: RegisterRequest): Promise<{ user: User }> {
    const response = await apiClient.post<{ success: boolean; data: { user: User } }>('/auth/register', data);
    return response.data.data;
  },

  // Refresh access token
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await apiClient.post<{ success: boolean; data: RefreshResponse }>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  // Logout
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  // Logout from all devices
  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  },

  // Get current user
  async me(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return response.data.data.user;
  },
};

export default authApi;
