import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

// Async Thunks
export const fetchPendingUnits = createAsyncThunk(
    'orders/fetchPendingUnits',
    async ({ adminMobile, page = 1, pageSize = 10, paymentStatus, paymentType, transferMode, search, farmId }: {
        adminMobile: string;
        page?: number;
        pageSize?: number;
        paymentStatus?: string;
        paymentType?: string;
        transferMode?: string;
        search?: string;
        farmId?: string;
    }, { rejectWithValue }) => {
        try {
            const params: any = { page, page_size: pageSize };
            if (paymentStatus && paymentStatus !== 'All Status') params.paymentStatus = paymentStatus;
            if (paymentType && paymentType !== 'All Payments') params.paymentType = paymentType;
            if (transferMode && transferMode !== 'All Modes') params.transferMode = transferMode;
            if (search) params.search = search;
            if (farmId && farmId !== 'All Farms') params.farmId = farmId;

            const response = await axios.get(API_ENDPOINTS.getPendingUnits(), {
                headers: { 'X-Admin-Mobile': adminMobile },
                params
            });
            return response.data; // Return full response to get count
        } catch (error: any) {
            const rawDetail = error?.response?.data?.detail;
            let msg: string;
            if (typeof rawDetail === 'string') {
                msg = rawDetail;
            } else if (Array.isArray(rawDetail)) {
                const first = rawDetail[0];
                if (first && typeof first === 'object' && 'msg' in first) {
                    msg = String(first.msg);
                } else {
                    msg = 'Failed to load orders';
                }
            } else if (rawDetail && typeof rawDetail === 'object' && 'msg' in rawDetail) {
                msg = String(rawDetail.msg);
            } else {
                msg = 'Failed to load orders';
            }
            return rejectWithValue(msg);
        }
    }
);

export const approveOrder = createAsyncThunk(
    'orders/approveOrder',
    async ({
        unitId,
        adminMobile,
        comments,
        paymentReceived,
        paymentProof,
        unitsChecked,
        coinsChecked
    }: {
        unitId: string;
        adminMobile: string;
        comments?: string;
        paymentReceived?: boolean;
        paymentProof?: boolean;
        unitsChecked?: boolean;
        coinsChecked?: boolean;
    }, { dispatch, rejectWithValue, getState }) => {
        try {
            await axios.post(API_ENDPOINTS.approveUnit(), {
                orderId: unitId,
                comments,
                paymentReceived,
                paymentProof,
                unitsChecked,
                coinsChecked
            }, {
                headers: { 'X-Admin-Mobile': adminMobile }
            });
            // Refresh list after success, preserving filters
            const state = getState() as any;
            const { filters } = state.orders;
            dispatch(fetchPendingUnits({
                adminMobile,
                page: filters.page,
                pageSize: filters.pageSize,
                paymentStatus: filters.statusFilter,
                paymentType: filters.paymentTypeFilter,
                transferMode: filters.transferModeFilter,
                farmId: filters.farmFilter
            }));
            return unitId;
        } catch (error: any) {
            return rejectWithValue('Failed to approve order');
        }
    }
);

export const rejectOrder = createAsyncThunk(
    'orders/rejectOrder',
    async ({
        unitId,
        adminMobile,
        comments,
        paymentReceived,
        paymentProof,
        unitsChecked,
        coinsChecked
    }: {
        unitId: string;
        adminMobile: string;
        comments?: string;
        paymentReceived?: boolean;
        paymentProof?: boolean;
        unitsChecked?: boolean;
        coinsChecked?: boolean;
    }, { dispatch, rejectWithValue, getState }) => {
        try {
            await axios.post(API_ENDPOINTS.rejectUnit(), {
                orderId: unitId,
                comments,
                paymentReceived,
                paymentProof,
                unitsChecked,
                coinsChecked
            }, {
                headers: { 'X-Admin-Mobile': adminMobile }
            });
            // Refresh list after success, preserving filters
            const state = getState() as any;
            const { filters } = state.orders;
            dispatch(fetchPendingUnits({
                adminMobile,
                page: filters.page,
                pageSize: filters.pageSize,
                paymentStatus: filters.statusFilter,
                paymentType: filters.paymentTypeFilter,
                transferMode: filters.transferModeFilter,
                farmId: filters.farmFilter
            }));
            return unitId;
        } catch (error: any) {
            return rejectWithValue('Failed to reject order');
        }
    }
);

// Redundant - removed to optimize performance, counts are now handled in fetchPendingUnits

export interface OrdersState {
    pendingUnits: any[];
    loading: boolean;
    error: string | null;
    actionLoading: boolean; // For approve/reject actions
    totalCount: number;
    totalAllOrders: number;
    pendingAdminApprovalCount: number;
    pendingSuperAdminApprovalCount: number;
    pendingSuperAdminRejectionCount: number;
    paidCount: number;
    rejectedCount: number;
    paymentDueCount: number;
    statusCounts: { [key: string]: number };
    filters: {
        searchQuery: string;
        paymentTypeFilter: string;
        transferModeFilter: string;
        statusFilter: string;
        farmFilter: string;
        page: number;
        pageSize: number;
    };
    expansion: {
        expandedOrderId: string | null;
        activeUnitIndex: number | null;
    };
}

const getInitialExpansion = () => {
    try {
        return {
            expandedOrderId: localStorage.getItem('orders_expandedOrderId') || null,
            activeUnitIndex: localStorage.getItem('orders_activeUnitIndex') ? Number(localStorage.getItem('orders_activeUnitIndex')) : null,
        };
    } catch {
        return { expandedOrderId: null, activeUnitIndex: null };
    }
};

const initialState: OrdersState = {
    pendingUnits: [],
    loading: false,
    error: null,
    actionLoading: false,
    totalCount: 0,
    totalAllOrders: 0,
    pendingAdminApprovalCount: 0,
    pendingSuperAdminApprovalCount: 0,
    pendingSuperAdminRejectionCount: 0,
    paidCount: 0,
    rejectedCount: 0,
    paymentDueCount: 0,
    statusCounts: {},
    filters: {
        searchQuery: localStorage.getItem('orders_searchQuery') || '',
        paymentTypeFilter: localStorage.getItem('orders_paymentTypeFilter') || 'All Payments',
        transferModeFilter: localStorage.getItem('orders_transferModeFilter') || 'All Modes',
        statusFilter: localStorage.getItem('orders_statusFilter') || 'PENDING_ADMIN_VERIFICATION',
        farmFilter: localStorage.getItem('orders_farmFilter') || 'All Farms',
        page: 1,
        pageSize: 15,
    },
    expansion: getInitialExpansion(),
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setSearchQuery(state, action: PayloadAction<string>) {
            state.filters.searchQuery = action.payload;
            state.filters.page = 1; // Reset to page 1 on search
        },
        // Optimize: Batch update filters
        setAllFilters(state, action: PayloadAction<Partial<typeof state.filters>>) {
            if (action.payload.page !== undefined) state.filters.page = action.payload.page;
            if (action.payload.statusFilter !== undefined) state.filters.statusFilter = action.payload.statusFilter;
            if (action.payload.paymentTypeFilter !== undefined) state.filters.paymentTypeFilter = action.payload.paymentTypeFilter;
            if (action.payload.transferModeFilter !== undefined) state.filters.transferModeFilter = action.payload.transferModeFilter;
            if (action.payload.farmFilter !== undefined) state.filters.farmFilter = action.payload.farmFilter;
        },
        setPaymentFilter: (state, action: PayloadAction<string>) => {
            state.filters.paymentTypeFilter = action.payload;
        },
        setTransferModeFilter: (state, action: PayloadAction<string>) => {
            state.filters.transferModeFilter = action.payload;
        },
        setStatusFilter: (state, action: PayloadAction<string>) => {
            state.filters.statusFilter = action.payload;
        },
        setFarmFilter: (state, action: PayloadAction<string>) => {
            state.filters.farmFilter = action.payload;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.filters.page = action.payload;
        },
        setExpandedOrderId: (state, action: PayloadAction<string | null>) => {
            state.expansion.expandedOrderId = action.payload;
        },
        setActiveUnitIndex: (state, action: PayloadAction<number | null>) => {
            state.expansion.activeUnitIndex = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Pending Units
        builder.addCase(fetchPendingUnits.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPendingUnits.fulfilled, (state, action) => {
            state.loading = false;
            // Handle response format: { orders: [], total_count: 123 } or just array
            const payload = action.payload;
            let currentCount = 0;

            if (payload && Array.isArray(payload.orders)) {
                state.pendingUnits = payload.orders;
                // Prefer total_filtered for pagination if available, otherwise fallback
                currentCount = payload.total_filtered ?? (payload.total_count || payload.total || payload.count || payload.orders.length);
                state.totalCount = currentCount;

                // Sync all counts from the response
                if (typeof payload.total_all_orders === 'number') {
                    state.totalAllOrders = payload.total_all_orders;
                    state.statusCounts['All Status'] = payload.total_all_orders;
                }

                if (payload.pending_admin_approval_count !== undefined) {
                    const c = Number(payload.pending_admin_approval_count);
                    state.pendingAdminApprovalCount = c;
                    state.statusCounts['PENDING_ADMIN_VERIFICATION'] = c;
                }
                if (payload.pending_super_admin_approval_count !== undefined) {
                    const c = Number(payload.pending_super_admin_approval_count);
                    state.pendingSuperAdminApprovalCount = c;
                    state.statusCounts['PENDING_SUPER_ADMIN_VERIFICATION'] = c;
                }
                if (payload.pending_super_admin_rejection_count !== undefined) {
                    const c = Number(payload.pending_super_admin_rejection_count);
                    state.pendingSuperAdminRejectionCount = c;
                    state.statusCounts['PENDING_SUPER_ADMIN_REJECTION'] = c;
                }
                if (payload.paid_count !== undefined) {
                    const c = Number(payload.paid_count);
                    state.paidCount = c;
                    state.statusCounts['PAID'] = c;
                }
                if (payload.rejected_count !== undefined) {
                    const c = Number(payload.rejected_count);
                    state.rejectedCount = c;
                    state.statusCounts['REJECTED'] = c;
                }
                if (payload.payment_due_count !== undefined) {
                    const c = Number(payload.payment_due_count);
                    state.paymentDueCount = c;
                    state.statusCounts['PENDING_PAYMENT'] = c;
                }
            }
        });
        builder.addCase(fetchPendingUnits.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Approve Order
        builder.addCase(approveOrder.pending, (state) => {
            state.actionLoading = true;
        });
        builder.addCase(approveOrder.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(approveOrder.rejected, (state) => {
            state.actionLoading = false;
        });

        // Reject Order
        builder.addCase(rejectOrder.pending, (state) => {
            state.actionLoading = true;
        });
        builder.addCase(rejectOrder.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(rejectOrder.rejected, (state) => {
            state.actionLoading = false;
        });

        // Fetch Status Counts
    }
});

export const {
    setSearchQuery,
    setAllFilters,
    setPaymentFilter,
    setTransferModeFilter,
    setStatusFilter,
    setFarmFilter,
    setPage,
    setExpandedOrderId,
    setActiveUnitIndex,
} = ordersSlice.actions;

export const ordersReducer = ordersSlice.reducer;
export default ordersSlice.reducer;
