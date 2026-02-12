import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { User, CreateUserRequest, ApiResponse, Farm, CreateFarmRequest } from '../types';

const api = axios.create({
  timeout: 30000,
});

export const userService = {
  getUsers: async (params?: any): Promise<{ users: User[], total?: number }> => {
    try {
      const response = await api.get<{ status: string, statuscode: number, users: User[], total?: number }>(API_ENDPOINTS.getUsers(), { params });
      return { users: response.data.users, total: response.data.total };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getReferrals: async (): Promise<User[]> => {
    try {
      const response = await api.get<{ status: string, statuscode: number, users: User[] }>(API_ENDPOINTS.getReferrals());
      return response.data.users;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  },

  getUserDetails: async (mobile: string): Promise<any> => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.getUserDetails(mobile));
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },

  getNetwork: async (params?: any): Promise<any> => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.getReferrals(), { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching network:', error);
      throw error;
    }
  },

  getNetworkUserDetails: async (mobile: string): Promise<any> => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.getReferrals() + `/${mobile}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching network user details:', error);
      throw error;
    }
  },

  createUser: async (userData: CreateUserRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.createUser(), userData);

      // Check if response indicates an error despite 200 OK (soft error)
      if (response.data && (response.data.status === 'error' || response.data.statuscode >= 400)) {
        return { error: response.data.message || response.data.detail || 'Failed to create user' };
      }

      return { data: response.data, message: 'User created successfully' };
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Extract the actual error message from the API response
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || error?.response?.data?.error || 'Failed to create user';
      return { error: errorMessage };
    }
  },

  verifyUser: async (mobile: string): Promise<void> => {
    try {
      const response = await api.post(API_ENDPOINTS.verifyUser(), { mobile, device_id: 'web', device_model: 'browser' });
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to verify user');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  },

  updateUser: async (mobile: string, updates: Partial<User>): Promise<void> => {
    try {
      const response = await api.put(API_ENDPOINTS.updateUser(mobile), updates);
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      await api.get(API_ENDPOINTS.health());
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};

export const farmService = {
  getFarms: async (status?: string): Promise<Farm[]> => {
    try {
      const params = status && status !== '--' ? { status } : {};
      const response = await api.get<Farm[]>(API_ENDPOINTS.getFarms(), { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  },

  addFarm: async (farmData: CreateFarmRequest, adminMobile: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.addFarm(), farmData, {
        headers: {
          'x-admin-mobile': adminMobile
        }
      });

      if (response.data && (response.data.status === 'error' || response.data.statuscode >= 400)) {
        return { error: response.data.message || 'Failed to add farm' };
      }

      return { data: response.data, message: 'Farm added successfully' };
    } catch (error: any) {
      console.error('Error adding farm:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || 'Failed to add farm';
      return { error: errorMessage };
    }
  },

  updateFarm: async (farmId: string, farmData: CreateFarmRequest, adminMobile: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(API_ENDPOINTS.updateFarm(farmId), farmData, {
        headers: {
          'x-admin-mobile': adminMobile
        }
      });

      if (response.data && (response.data.status === 'error' || response.data.statuscode >= 400)) {
        return { error: response.data.message || 'Failed to update farm' };
      }

      return { data: response.data, message: 'Farm updated successfully' };
    } catch (error: any) {
      console.error('Error updating farm:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || 'Failed to update farm';
      return { error: errorMessage };
    }
  }
};
