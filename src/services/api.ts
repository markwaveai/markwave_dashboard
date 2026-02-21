import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { User, CreateUserRequest, ApiResponse, Farm, CreateFarmRequest, SelfBenefit, CreateSelfBenefitRequest, ReferralMilestone, CreateReferralMilestoneRequest, ReferralConfig, UpdateReferralConfigRequest, RoleChangeRequest, RoleChangeRequestResponse } from '../types';

const api = axios.create({
  timeout: 30000,
});

export const userService = {
  getUsers: async (params?: any): Promise<{ users: User[], total?: number }> => {
    try {
      const response = await api.get<{ status: string, statuscode: number, users: User[], total?: number, count?: number, total_count?: number }>(API_ENDPOINTS.getUsers(), { params });
      // Robust check for total count
      const total = response.data.total ?? response.data.count ?? response.data.total_count ?? 0;
      return { users: response.data.users, total };
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
      const data = response.data;
      // Ensure we pass back useful info if structure differs
      // If stats is missing but we have count/total, let's normalize it for the slice/component?
      // Actually, the slice expects { stats, users }. Layout usually matches. 
      // But if it's missing, let's try to polyfill in the slice or here.
      // Returning raw data is fine, slice handles interpretation.
      return data;
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

  addFarm: async (farmData: CreateFarmRequest, adminMobile: string, adminOtp: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.addFarm(), farmData, {
        headers: {
          'X-Admin-Mobile': adminMobile,
          'x-admin-otp': adminOtp,
          'Content-Type': 'application/json'
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

  updateFarm: async (farmId: string, farmData: CreateFarmRequest, adminMobile: string, adminOtp: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put(API_ENDPOINTS.updateFarm(farmId), farmData, {
        headers: {
          'X-Admin-Mobile': adminMobile,
          'x-admin-otp': adminOtp,
          'Content-Type': 'application/json'
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

export const otpService = {
  sendOtp: async (mobile: string, appName: string = 'TrueHarvest'): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.sendOtp(), { mobile, appName });
      return { data: response.data, message: 'OTP sent successfully' };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || 'Failed to send OTP';
      return { error: errorMessage };
    }
  }
};

export const selfBenefitService = {
  getSelfBenefits: async (farmId?: string): Promise<SelfBenefit[]> => {
    try {
      const params = farmId ? { farm_id: farmId } : {};
      const response = await api.get<SelfBenefit[]>(API_ENDPOINTS.getSelfBenefits(), { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching self benefits:', error);
      throw error;
    }
  },

  createSelfBenefit: async (benefitData: CreateSelfBenefitRequest, adminMobile: string, adminOtp: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(API_ENDPOINTS.getSelfBenefits(), benefitData, {
        headers: {
          'x-admin-mobile': adminMobile,
          'x-admin-otp': adminOtp
        }
      });

      if (response.data && (response.data.status === 'error' || response.data.statuscode >= 400)) {
        return { error: response.data.message || 'Failed to create benefit' };
      }

      return { data: response.data, message: 'Benefit created successfully' };
    } catch (error: any) {
      console.error('Error creating benefit:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || 'Failed to create benefit';
      return { error: errorMessage };
    }
  },

  updateSelfBenefit: async (benefitId: string, benefitData: CreateSelfBenefitRequest, adminMobile: string, adminOtp: string): Promise<ApiResponse<any>> => {
    try {
      // payload no longer requires id in the body
      const { id, ...payload } = benefitData as any;
      const response = await api.put(API_ENDPOINTS.updateSelfBenefit(encodeURIComponent(benefitId)), payload, {
        headers: {
          'x-admin-mobile': adminMobile,
          'x-admin-otp': adminOtp,
          'id': benefitId
        }
      });

      if (response.data && (response.data.status === 'error' || response.data.statuscode >= 400)) {
        return { error: response.data.message || 'Failed to update benefit' };
      }

      return { data: response.data, message: 'Benefit updated successfully' };
    } catch (error: any) {
      console.error('Error updating benefit:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || 'Failed to update benefit';
      return { error: errorMessage };
    }
  },


};

export const referralBenefitService = {
  getReferralMilestones: async (farmId?: string): Promise<ReferralMilestone[]> => {
    try {
      const params = farmId ? { farm_id: farmId } : {};
      const response = await api.get<ReferralMilestone[]>(API_ENDPOINTS.getReferralMilestones(), { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching referral milestones:', error);
      throw error;
    }
  },
  createReferralMilestone: async (data: CreateReferralMilestoneRequest, adminMobile: string, adminOtp: string): Promise<ApiResponse<ReferralMilestone>> => {
    try {
      const response = await api.post<ApiResponse<ReferralMilestone>>(API_ENDPOINTS.getReferralMilestones(), data, {
        headers: {
          'x-admin-mobile': adminMobile,
          'x-admin-otp': adminOtp
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating referral milestone:', error);
      throw error;
    }
  },
  updateReferralMilestone: async (id: string, data: CreateReferralMilestoneRequest, adminMobile: string, adminOtp: string): Promise<ApiResponse<ReferralMilestone>> => {
    try {
      const response = await api.put<ApiResponse<ReferralMilestone>>(API_ENDPOINTS.updateReferralMilestone(id), data, {
        headers: {
          'x-admin-mobile': adminMobile,
          'x-admin-otp': adminOtp
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating referral milestone:', error);
      throw error;
    }
  },
  getAchievedReferralMilestones: async (adminMobile: string): Promise<any> => {
    try {
      const response = await api.get(API_ENDPOINTS.getAchievedReferralMilestones!(), {
        headers: {
          'x-admin-mobile': adminMobile
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching achieved referral milestones:', error);
      throw error;
    }
  }
};

export const referralConfigService = {
  getReferralConfig: async (farmId?: string): Promise<ReferralConfig> => {
    try {
      const params = farmId ? { farm_id: farmId } : {};
      const response = await api.get<ReferralConfig>(API_ENDPOINTS.getReferralConfig(), { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching referral config:', error);
      throw error;
    }
  },
  updateReferralConfig: async (data: UpdateReferralConfigRequest, adminMobile: string, adminOtp: string): Promise<ApiResponse<ReferralConfig>> => {
    try {
      const response = await api.put<ApiResponse<ReferralConfig>>(API_ENDPOINTS.updateReferralConfig(), data, {
        headers: {
          'x-admin-mobile': adminMobile,
          'x-admin-otp': adminOtp
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating referral config:', error);
      throw error;
    }
  }
};

export const roleRequestService = {
  getRoleChangeRequests: async (statusFilter: string = 'ALL', adminMobile: string): Promise<RoleChangeRequest[]> => {
    try {
      const params = {
        status_filter: statusFilter,
        admin_mobile: adminMobile
      };
      const response = await api.get<RoleChangeRequestResponse>(API_ENDPOINTS.getRoleChangeRequests(), { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching role change requests:', error);
      throw error;
    }
  },
  actionRoleChangeRequest: async (requestId: string, approved: boolean, adminMobile: string): Promise<ApiResponse<any>> => {
    try {
      console.log(`[API] Role Action: ${requestId}`, { approved, adminMobile });
      const response = await api.put(API_ENDPOINTS.actionRoleChangeRequest(requestId), { approved }, {
        params: { admin_mobile: adminMobile },
        headers: {
          'X-Admin-Mobile': adminMobile,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return { data: response.data, message: `Request ${approved ? 'approved' : 'rejected'} successfully` };
    } catch (error: any) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} role request:`, error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || `Failed to ${approved ? 'approve' : 'reject'} request`;
      return { error: errorMessage };
    }
  }
};

export const achievedBenefitService = {
  getAchievedBenefits: async (adminMobile: string): Promise<any> => {
    try {
      const response = await api.get(API_ENDPOINTS.getAchievedBenefits(), {
        headers: {
          'x-admin-mobile': adminMobile
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching achieved benefits:', error);
      throw error;
    }
  }
};

export const orderService = {
  getInvoiceDetails: async (invoiceNumber: string, mobileNumber: string): Promise<any> => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.getInvoice(), {
        params: {
          invoice_number: invoiceNumber,
          mobile_number: mobileNumber
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      throw error;
    }
  }
};
