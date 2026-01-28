import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { userService } from '../../services/api';
import { UserParams } from '../../types';

// Async Thunks
export const fetchReferralUsers = createAsyncThunk(
    'users/fetchReferralUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.getReferrals());
            return response.data.users || [];
        } catch (error: any) {
            return rejectWithValue('Failed to fetch referral users');
        }
    }
);



export const fetchManagedUsers = createAsyncThunk(
    'users/fetchManagedUsers',
    async (params: UserParams, { rejectWithValue }) => {
        try {
            const response = await userService.getUsers(params);
            return response;
        } catch (error: any) {
            return rejectWithValue('Failed to fetch users');
        }
    }
);

export const fetchNetworkUserDetails = createAsyncThunk(
    'users/fetchNetworkUserDetails',
    async (mobile: string, { rejectWithValue }) => {
        try {
            const response = await userService.getNetworkUserDetails(mobile);
            return response;
        } catch (error: any) {
            return rejectWithValue('Failed to fetch network user details');
        }
    }
);

export const fetchNetwork = createAsyncThunk(
    'users/fetchNetwork',
    async (params: UserParams, { rejectWithValue }) => {
        try {
            const response = await userService.getNetwork(params);
            return response;
        } catch (error: any) {
            return rejectWithValue('Failed to fetch network data');
        }
    }
);

export const fetchCustomerDetails = createAsyncThunk(
    'users/fetchCustomerDetails',
    async (mobile: string, { rejectWithValue }) => {
        try {
            const response = await userService.getUserDetails(mobile);
            return response;
        } catch (error: any) {
            return rejectWithValue('Failed to fetch customer details');
        }
    }
);

export const fetchExistingCustomers = createAsyncThunk(
    'users/fetchExistingCustomers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.getUsers());
            return response.data.users || [];
        } catch (error: any) {
            return rejectWithValue('Failed to fetch existing customers');
        }
    }
);

export const createReferralUser = createAsyncThunk(
    'users/createReferralUser',
    async (userData: any, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(API_ENDPOINTS.createUser(), userData);
            // If successful, refresh the referral list
            dispatch(fetchReferralUsers());
            return response.data;
        } catch (error: any) {
            // Handle "User already exists" or generic errors
            const msg = error?.response?.data?.message || 'Failed to create user';
            return rejectWithValue(msg);
        }
    }
);

export const deactivateRequestOtp = createAsyncThunk(
    'users/deactivateRequestOtp',
    async (payload: { mobile: string; channel: string; }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_ENDPOINTS.deactivateRequestOtp(), payload);
            return response.data;
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to send OTP';
            return rejectWithValue(msg);
        }
    }
);

export const deactivateConfirm = createAsyncThunk(
    'users/deactivateConfirm',
    async (payload: { mobile: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_ENDPOINTS.deactivateConfirm(), payload);
            return response.data;
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to deactivate account';
            return rejectWithValue(msg);
        }
    }
);

export const activateRequestOtp = createAsyncThunk(
    'users/activateRequestOtp',
    async (payload: { mobile: string; channel: string; }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_ENDPOINTS.requestReactivationOtp(), payload);
            return response.data;
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to send OTP';
            return rejectWithValue(msg);
        }
    }
);

export const activateConfirm = createAsyncThunk(
    'users/activateConfirm',
    async (payload: { mobile: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_ENDPOINTS.confirmReactivation(), payload);
            return response.data;
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to activate account';
            return rejectWithValue(msg);
        }
    }
);

export const fetchAdminProfile = createAsyncThunk(
    'users/fetchAdminProfile',
    async (mobile: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.getUserDetails(mobile));
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue('Failed to fetch admin profile');
        }
    }
);

export interface UsersState {
    referralUsers: any[];
    existingCustomers: any[];
    managedUsers: any[];
    managedTotal: number;
    managedLoading: boolean;
    managedError: string | null;
    customerDetails: any | null;
    customerDetailsLoading: boolean;
    customerDetailsError: string | null;
    network: {
        stats: any | null;
        users: any[];
        loading: boolean;
        error: string | null;
    };
    networkUserDetails: {
        data: any | null; // Using any to match the response structure
        loading: boolean;
        error: string | null;
    };
    referralLoading: boolean;
    existingLoading: boolean;
    loading: boolean; // Computed loading state
    error: string | null;
    actionLoading: boolean; // For create action
    deactivation: {
        loading: boolean;
        error: string | null;
        success: boolean;
        message: string | null;
    };
    activation: {
        loading: boolean;
        error: string | null;
        success: boolean;
        message: string | null;
    };
    adminProfile: any | null;
    adminProfileLoading: boolean; // Added to prevent duplicate fetches
}

const initialState: UsersState = {
    referralUsers: [],
    existingCustomers: [],
    managedUsers: [],
    managedTotal: 0,
    managedLoading: false,
    managedError: null,
    customerDetails: null,
    customerDetailsLoading: false,
    customerDetailsError: null,
    network: {
        stats: null,
        users: [],
        loading: false,
        error: null,
    },
    networkUserDetails: {
        data: null,
        loading: false,
        error: null,
    },
    referralLoading: false,
    existingLoading: false,
    loading: false,
    error: null,
    actionLoading: false,
    deactivation: {
        loading: false,
        error: null,
        success: false,
        message: null,
    },
    activation: {
        loading: false,
        error: null,
        success: false,
        message: null,
    },
    adminProfile: null,
    adminProfileLoading: false,
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setReferralUsers: (state, action: PayloadAction<any[]>) => {
            state.referralUsers = action.payload;
        },
        setExistingCustomers: (state, action: PayloadAction<any[]>) => {
            state.existingCustomers = action.payload;
        },
        resetDeactivationState: (state) => {
            state.deactivation = {
                loading: false,
                error: null,
                success: false,
                message: null,
            };
        },
        resetActivationState: (state) => {
            state.activation = {
                loading: false,
                error: null,
                success: false,
                message: null,
            };
        },
        clearCustomerDetails: (state) => {
            state.customerDetails = null;
            state.customerDetailsLoading = false;
            state.customerDetailsError = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Referral Users
        builder.addCase(fetchReferralUsers.pending, (state) => {
            state.referralLoading = true;
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchReferralUsers.fulfilled, (state, action) => {
            state.referralLoading = false;
            state.loading = state.existingLoading;
            state.referralUsers = action.payload;
        });
        builder.addCase(fetchReferralUsers.rejected, (state, action) => {
            state.referralLoading = false;
            state.loading = state.existingLoading;
            state.error = action.payload as string;
        });

        // Fetch Existing Customers
        builder.addCase(fetchExistingCustomers.pending, (state) => {
            state.existingLoading = true;
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchExistingCustomers.fulfilled, (state, action) => {
            state.existingLoading = false;
            state.loading = state.referralLoading;
            state.existingCustomers = action.payload;
        });
        builder.addCase(fetchExistingCustomers.rejected, (state, action) => {
            state.existingLoading = false;
            state.loading = state.referralLoading;
            state.error = action.payload as string;
        });

        // Fetch Managed Users (Server-side Pagination)
        builder.addCase(fetchManagedUsers.pending, (state) => {
            state.managedLoading = true;
            state.managedError = null;
        });
        builder.addCase(fetchManagedUsers.fulfilled, (state, action) => {
            state.managedLoading = false;
            state.managedUsers = action.payload.users;
            state.managedTotal = action.payload.total || 0;
        });
        builder.addCase(fetchManagedUsers.rejected, (state, action) => {
            state.managedLoading = false;
            state.managedError = action.payload as string;
        });

        // Fetch Customer Details
        builder.addCase(fetchCustomerDetails.pending, (state) => {
            state.customerDetailsLoading = true;
            state.customerDetailsError = null;
        });
        builder.addCase(fetchCustomerDetails.fulfilled, (state, action) => {
            state.customerDetailsLoading = false;
            state.customerDetails = action.payload;
        });
        builder.addCase(fetchCustomerDetails.rejected, (state, action) => {
            state.customerDetailsLoading = false;
            state.customerDetailsError = action.payload as string;
        });

        // Fetch Network
        builder.addCase(fetchNetwork.pending, (state) => {
            state.network.loading = true;
            state.network.error = null;
        });
        builder.addCase(fetchNetwork.fulfilled, (state, action) => {
            state.network.loading = false;
            state.network.stats = action.payload.stats;
            state.network.users = action.payload.users;
        });
        builder.addCase(fetchNetwork.rejected, (state, action) => {
            state.network.loading = false;
            state.network.error = action.payload as string;
        });

        // Fetch Network User Details
        builder.addCase(fetchNetworkUserDetails.pending, (state) => {
            state.networkUserDetails.loading = true;
            state.networkUserDetails.error = null;
        });
        builder.addCase(fetchNetworkUserDetails.fulfilled, (state, action) => {
            state.networkUserDetails.loading = false;
            state.networkUserDetails.data = action.payload;
        });
        builder.addCase(fetchNetworkUserDetails.rejected, (state, action) => {
            state.networkUserDetails.loading = false;
            state.networkUserDetails.error = action.payload as string;
        });

        // Create Referral User
        builder.addCase(createReferralUser.pending, (state) => {
            state.actionLoading = true;
            state.error = null;
        });
        builder.addCase(createReferralUser.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(createReferralUser.rejected, (state, action) => {
            state.actionLoading = false;
            state.error = action.payload as string;
        });

        // Deactivate Request OTP
        builder.addCase(deactivateRequestOtp.pending, (state) => {
            state.deactivation.loading = true;
            state.deactivation.error = null;
            state.deactivation.message = null;
        });
        builder.addCase(deactivateRequestOtp.fulfilled, (state, action: PayloadAction<any>) => {
            state.deactivation.loading = false;
            state.deactivation.success = true;
            state.deactivation.message = action.payload.message;
        });
        builder.addCase(deactivateRequestOtp.rejected, (state, action) => {
            state.deactivation.loading = false;
            state.deactivation.error = action.payload as string;
        });

        // Deactivate Confirm
        builder.addCase(deactivateConfirm.pending, (state) => {
            state.deactivation.loading = true;
            state.deactivation.error = null;
            state.deactivation.message = null;
        });
        builder.addCase(deactivateConfirm.fulfilled, (state, action: PayloadAction<any>) => {
            state.deactivation.loading = false;
            state.deactivation.success = true;
            state.deactivation.message = action.payload.message;
        });
        builder.addCase(deactivateConfirm.rejected, (state, action) => {
            state.deactivation.loading = false;
            state.deactivation.error = action.payload as string;
        });

        // Activate Request OTP
        builder.addCase(activateRequestOtp.pending, (state) => {
            state.activation.loading = true;
            state.activation.error = null;
            state.activation.message = null;
        });
        builder.addCase(activateRequestOtp.fulfilled, (state, action: PayloadAction<any>) => {
            state.activation.loading = false;
            state.activation.success = true;
            state.activation.message = action.payload.message;
        });
        builder.addCase(activateRequestOtp.rejected, (state, action) => {
            state.activation.loading = false;
            state.activation.error = action.payload as string;
        });

        // Activate Confirm
        builder.addCase(activateConfirm.pending, (state) => {
            state.activation.loading = true;
            state.activation.error = null;
            state.activation.message = null;
        });
        builder.addCase(activateConfirm.fulfilled, (state, action: PayloadAction<any>) => {
            state.activation.loading = false;
            state.activation.success = true;
            state.activation.message = action.payload.message;
        });
        builder.addCase(activateConfirm.rejected, (state, action) => {
            state.activation.loading = false;
            state.activation.error = action.payload as string;
        });

        // Fetch Admin Profile
        builder.addCase(fetchAdminProfile.pending, (state) => {
            state.adminProfileLoading = true;
        });
        builder.addCase(fetchAdminProfile.fulfilled, (state, action) => {
            state.adminProfileLoading = false;
            state.adminProfile = action.payload;
        });
        builder.addCase(fetchAdminProfile.rejected, (state) => {
            state.adminProfileLoading = false;
        });
    }
});


export const { setReferralUsers, setExistingCustomers, resetDeactivationState, resetActivationState, clearCustomerDetails } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
export default usersSlice.reducer;
