import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
    activeTab: 'orders' | 'nonVerified' | 'existing' | 'tree' | 'products' | 'tracking' | 'buffaloViz' | 'emi';
    isSidebarOpen: boolean;
    showAdminDetails: boolean;
    modals: {
        referral: boolean;

        proof: {
            isOpen: boolean;
            data: any;
        };
        rejection: {
            isOpen: boolean;
            unitId: string | null;
            installmentNumber: number | null;
        };
        approval: {
            isOpen: boolean;
            unitId: string | null;
            installmentNumber: number | null;
        };
        creationRole: 'Investor' | 'Employee' | null;
    };
    snackbar: {
        message: string | null;
        type: 'success' | 'error' | null;
    };
}


const getInitialActiveTab = (): UIState['activeTab'] => {
    const saved = localStorage.getItem('activeTab');
    if (saved && ['orders', 'nonVerified', 'existing', 'tree', 'products', 'tracking', 'buffaloViz', 'emi'].includes(saved)) {
        return saved as UIState['activeTab'];
    }
    return 'orders';
};

const getInitialSidebarOpen = (): boolean => {
    const saved = localStorage.getItem('isSidebarOpen');
    if (saved !== null) {
        return saved === 'true';
    }
    // Default to open on desktop, closed on mobile
    return window.innerWidth >= 768;
};

const initialState: UIState = {
    activeTab: getInitialActiveTab(),
    isSidebarOpen: getInitialSidebarOpen(),
    showAdminDetails: false,
    modals: {
        referral: false,

        proof: {
            isOpen: false,
            data: null,
        },
        rejection: {
            isOpen: false,
            unitId: null,
            installmentNumber: null,
        },
        approval: {
            isOpen: false,
            unitId: null,
            installmentNumber: null,
        },
        creationRole: null,
    },
    snackbar: {
        message: null,
        type: null,
    },
};


const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<UIState['activeTab']>) => {
            state.activeTab = action.payload;
            localStorage.setItem('activeTab', action.payload);
        },
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
            localStorage.setItem('isSidebarOpen', state.isSidebarOpen.toString());
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload;
            localStorage.setItem('isSidebarOpen', action.payload.toString());
        },
        setShowAdminDetails: (state, action: PayloadAction<boolean>) => {
            state.showAdminDetails = action.payload;
        },
        setReferralModalOpen: (state, action: PayloadAction<boolean>) => {
            state.modals.referral = action.payload;
        },

        setProofModal: (state, action: PayloadAction<{ isOpen: boolean; data?: any }>) => {
            state.modals.proof.isOpen = action.payload.isOpen;
            if (action.payload.data !== undefined) {
                state.modals.proof.data = action.payload.data;
            }
        },
        setRejectionModal: (state, action: PayloadAction<{ isOpen: boolean; unitId?: string | null; installmentNumber?: number | null }>) => {
            state.modals.rejection.isOpen = action.payload.isOpen;
            if (action.payload.unitId !== undefined) {
                state.modals.rejection.unitId = action.payload.unitId;
            }
            if (action.payload.installmentNumber !== undefined) {
                state.modals.rejection.installmentNumber = action.payload.installmentNumber;
            }
        },
        setApprovalModal: (state, action: PayloadAction<{ isOpen: boolean; unitId?: string | null; installmentNumber?: number | null }>) => {
            state.modals.approval.isOpen = action.payload.isOpen;
            if (action.payload.unitId !== undefined) {
                state.modals.approval.unitId = action.payload.unitId;
            }
            if (action.payload.installmentNumber !== undefined) {
                state.modals.approval.installmentNumber = action.payload.installmentNumber;
            }
        },
        setCreationRole: (state, action: PayloadAction<'Investor' | 'Employee' | null>) => {
            state.modals.creationRole = action.payload;
        },
        setSnackbar: (state, action: PayloadAction<{ message: string | null; type: 'success' | 'error' | null }>) => {
            state.snackbar = action.payload;
        },
    },
});


export const {
    setActiveTab,
    toggleSidebar,
    setSidebarOpen,
    setShowAdminDetails,
    setReferralModalOpen,

    setProofModal,
    setRejectionModal,
    setApprovalModal,
    setCreationRole,
    setSnackbar,
} = uiSlice.actions;


export const uiReducer = uiSlice.reducer;
export default uiSlice.reducer;
