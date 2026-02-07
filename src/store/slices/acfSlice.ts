import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

export const fetchAcfPendingEmis = createAsyncThunk(
    'acf/fetchAcfPendingEmis',
    async ({ adminMobile, page = 1, pageSize = 10, status, paymentType, search }: {
        adminMobile: string;
        page?: number;
        pageSize?: number;
        status?: string;
        paymentType?: string;
        search?: string;
    }, { rejectWithValue }) => {
        try {
            const params: any = { page, page_size: pageSize };
            if (status && status !== 'All Status') params.status = status;
            if (paymentType && paymentType !== 'All Payments') params.paymentType = paymentType;
            if (search) params.search = search;

            const response = await axios.get(API_ENDPOINTS.getAcfPendingEmis(), {
                headers: { 'X-Admin-Mobile': adminMobile },
                params
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.detail || 'Failed to load ACF orders');
        }
    }
);

export const approveAcfEmi = createAsyncThunk(
    'acf/approveAcfEmi',
    async ({ unitId, installmentNumber, adminMobile, comments }: { unitId: string; installmentNumber: number; adminMobile: string; comments?: string }, { dispatch, rejectWithValue, getState }) => {
        try {
            await axios.post(API_ENDPOINTS.approveAcfEmi(), { orderId: unitId, installmentNumber, comments }, {
                headers: { 'X-Admin-Mobile': adminMobile }
            });
            const state = getState() as any;
            const { filters } = state.acf;
            dispatch(fetchAcfPendingEmis({
                adminMobile,
                page: filters.page,
                pageSize: filters.pageSize,
                status: filters.status,
                paymentType: filters.paymentType,
                search: filters.search
            }));
            return unitId;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.detail || 'Failed to approve ACF order');
        }
    }
);

export const rejectAcfEmi = createAsyncThunk(
    'acf/rejectAcfEmi',
    async ({ unitId, installmentNumber, adminMobile, comments }: { unitId: string; installmentNumber: number; adminMobile: string; comments?: string }, { dispatch, rejectWithValue, getState }) => {
        try {
            await axios.post(API_ENDPOINTS.rejectAcfEmi(), { orderId: unitId, installmentNumber, comments }, {
                headers: { 'X-Admin-Mobile': adminMobile }
            });
            const state = getState() as any;
            const { filters } = state.acf;
            dispatch(fetchAcfPendingEmis({
                adminMobile,
                page: filters.page,
                pageSize: filters.pageSize,
                status: filters.status,
                paymentType: filters.paymentType,
                search: filters.search
            }));
            return unitId;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.detail || 'Failed to reject ACF order');
        }
    }
);

export const fetchEmiDetails = createAsyncThunk(
    'acf/fetchEmiDetails',
    async ({ orderId, userId, adminMobile }: { orderId: string; userId: string; adminMobile: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_ENDPOINTS.getEmiDetails(), { orderId, userId }, {
                headers: { 'X-Admin-Mobile': adminMobile }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.detail || 'Failed to load EMI details');
        }
    }
);

export interface AcfState {
    acfOrders: any[];
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
    totalCount: number;
    totalFiltered: number;
    selectedEmiDetails: any[] | null;
    emiLoading: boolean;
    filters: {
        status: string;
        paymentType: string;
        search: string;
        page: number;
        pageSize: number;
    };
}

const initialState: AcfState = {
    acfOrders: [],
    loading: false,
    actionLoading: false,
    error: null,
    totalCount: 0,
    totalFiltered: 0,
    selectedEmiDetails: null,
    emiLoading: false,
    filters: {
        status: 'All Status',
        paymentType: 'All Payments',
        search: '',
        page: 1,
        pageSize: 10,
    },
};

const acfSlice = createSlice({
    name: 'acf',
    initialState,
    reducers: {
        setStatusFilter: (state, action: PayloadAction<string>) => {
            state.filters.status = action.payload;
            state.filters.page = 1;
        },
        setPaymentTypeFilter: (state, action: PayloadAction<string>) => {
            state.filters.paymentType = action.payload;
            state.filters.page = 1;
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.filters.search = action.payload;
            state.filters.page = 1;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.filters.page = action.payload;
        },
        clearSelectedEmiDetails: (state) => {
            state.selectedEmiDetails = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAcfPendingEmis.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAcfPendingEmis.fulfilled, (state, action) => {
            state.loading = false;
            state.acfOrders = action.payload.orders || [];
            state.totalFiltered = action.payload.total_filtered || 0;
            state.totalCount = action.payload.total_count || 0;
        });
        builder.addCase(fetchAcfPendingEmis.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
        builder.addCase(approveAcfEmi.pending, (state) => {
            state.actionLoading = true;
        });
        builder.addCase(approveAcfEmi.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(approveAcfEmi.rejected, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(rejectAcfEmi.pending, (state) => {
            state.actionLoading = true;
        });
        builder.addCase(rejectAcfEmi.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(rejectAcfEmi.rejected, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(fetchEmiDetails.pending, (state) => {
            state.emiLoading = true;
            state.error = null;
        });
        builder.addCase(fetchEmiDetails.fulfilled, (state, action) => {
            state.emiLoading = false;
            const data = action.payload;
            if (Array.isArray(data)) {
                state.selectedEmiDetails = data;
            } else if (data && typeof data === 'object') {
                state.selectedEmiDetails = data.emiSchedule || data.emis || data.data || [];
            } else {
                state.selectedEmiDetails = [];
            }
        });
        builder.addCase(fetchEmiDetails.rejected, (state, action) => {
            state.emiLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { setStatusFilter, setPaymentTypeFilter, setSearch, setPage, clearSelectedEmiDetails } = acfSlice.actions;
export const acfReducer = acfSlice.reducer;
export default acfSlice.reducer;
