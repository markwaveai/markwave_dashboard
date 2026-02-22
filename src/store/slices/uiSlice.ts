import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StoredNotification {
    id: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    receivedAt: string; // ISO string
    read: boolean;
}

const loadNotifications = (): StoredNotification[] => {
    try {
        return JSON.parse(localStorage.getItem('dashboard_notifications') || '[]');
    } catch {
        return [];
    }
};

const saveNotifications = (notifications: StoredNotification[]) => {
    try {
        localStorage.setItem('dashboard_notifications', JSON.stringify(notifications));
    } catch {}
};

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
        approvalHistory: {
            isOpen: boolean;
            history: any[] | null;
            orderId: string | null;
        };
    };
    snackbar: {
        message: string | null;
        type: 'success' | 'error' | null;
    };
    highlight: {
        orderId: string | null;
        milestoneId: string | null;
    };
    notifications: StoredNotification[];
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
        approvalHistory: {
            isOpen: false,
            history: null,
            orderId: null,
        },
    },
    snackbar: {
        message: null,
        type: null,
    },
    highlight: {
        orderId: null,
        milestoneId: null,
    },
    notifications: loadNotifications(),
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
        setApprovalHistoryModal: (state, action: PayloadAction<{ isOpen: boolean; history?: any[] | null; orderId?: string | null }>) => {
            state.modals.approvalHistory.isOpen = action.payload.isOpen;
            if (action.payload.history !== undefined) {
                state.modals.approvalHistory.history = action.payload.history;
            }
            if (action.payload.orderId !== undefined) {
                state.modals.approvalHistory.orderId = action.payload.orderId;
            }
        },
        setSnackbar: (state, action: PayloadAction<{ message: string | null; type: 'success' | 'error' | null }>) => {
            state.snackbar = action.payload;
        },
        setHighlightedOrderId: (state, action: PayloadAction<string | null>) => {
            state.highlight.orderId = action.payload;
            state.highlight.milestoneId = null;
        },
        setHighlightedMilestoneId: (state, action: PayloadAction<string | null>) => {
            state.highlight.milestoneId = action.payload;
            state.highlight.orderId = null;
        },
        clearHighlight: (state) => {
            state.highlight.orderId = null;
            state.highlight.milestoneId = null;
        },
        addNotification: (state, action: PayloadAction<{ title: string; body: string; data?: Record<string, string> }>) => {
            const notif: StoredNotification = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                title: action.payload.title,
                body: action.payload.body,
                data: action.payload.data,
                receivedAt: new Date().toISOString(),
                read: false,
            };
            state.notifications.unshift(notif); // newest first
            if (state.notifications.length > 50) state.notifications.length = 50;
            saveNotifications(state.notifications);
        },
        markAllNotificationsRead: (state) => {
            state.notifications.forEach(n => { n.read = true; });
            saveNotifications(state.notifications);
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
            saveNotifications([]);
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
    setApprovalHistoryModal,
    setSnackbar,
    setHighlightedOrderId,
    setHighlightedMilestoneId,
    clearHighlight,
    addNotification,
    markAllNotificationsRead,
    clearAllNotifications,
} = uiSlice.actions;


export const uiReducer = uiSlice.reducer;
export default uiSlice.reducer;
