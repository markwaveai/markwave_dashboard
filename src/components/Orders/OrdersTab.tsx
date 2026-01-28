import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { CheckCircle, CheckSquare, XCircle, Clock, ClipboardList, Copy, Check } from 'lucide-react';
import {
    setSearchQuery,
    setPaymentFilter,
    setStatusFilter,
    setTransferModeFilter,
    setPage,
    fetchPendingUnits,
    setExpandedOrderId,
    setActiveUnitIndex,
    setInitialTracking
} from '../../store/slices/ordersSlice';
import { setProofModal, setRejectionModal, setApprovalModal } from '../../store/slices/uiSlice';
import Pagination from '../common/Pagination';
import { API_ENDPOINTS } from '../../config/api';
import './OrdersTab.css';
import TableSkeleton from '../common/TableSkeleton';

const UTRCopyButton: React.FC<{ value: string }> = ({ value }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (value && value !== '-') {
            navigator.clipboard.writeText(String(value));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: isCopied ? '#2563eb' : '#64748b',
                transition: 'color 0.2s',
            }}
            title={isCopied ? 'Copied!' : 'Copy'}
        >
            {isCopied ? <Check size={14} /> : <Copy size={12} />}
        </button>
    );
};

interface OrdersTabProps {
}

const OrdersTab: React.FC<OrdersTabProps> = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Redux State
    const {
        pendingUnits,
        loading: ordersLoading,
        error: ordersError,
        totalCount,
        totalAllOrders,
        statusCounts,
        filters,
        trackingData,
        expansion,
        actionLoading
    } = useAppSelector((state: RootState) => state.orders);

    const { expandedOrderId, activeUnitIndex } = expansion;

    const {
        searchQuery,
        paymentTypeFilter,
        statusFilter,
        transferModeFilter,
        page,
        pageSize
    } = filters;

    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');

    const [searchParams, setSearchParams] = useSearchParams();

    // Tooltip State
    const [tooltipInfo, setTooltipInfo] = useState<{ tx: any; top: number; left: number } | null>(null);

    const findVal = (obj: any, keys: string[], partials: string[]) => {
        if (!obj) return '-';
        for (const k of keys) {
            if (obj[k]) return obj[k];
        }
        const foundKey = Object.keys(obj).find(k =>
            partials.some(p => k.toLowerCase().includes(p))
        );
        return foundKey ? obj[foundKey] : '-';
    };

    // Sync URL Filters to Redux State
    useEffect(() => {
        const pageParam = searchParams.get('page');
        const statusParam = searchParams.get('status');
        const paymentParam = searchParams.get('payment');
        const modeParam = searchParams.get('mode');

        // Page
        const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
        if (!isNaN(pageNum) && pageNum !== page) {
            dispatch(setPage(pageNum));
        }

        // Status
        if (statusParam && statusParam !== statusFilter) {
            dispatch(setStatusFilter(statusParam));
        }

        // Payment Type
        if (paymentParam && paymentParam !== paymentTypeFilter) {
            dispatch(setPaymentFilter(paymentParam));
        } else if (!paymentParam && paymentTypeFilter !== 'All Payments') {
            dispatch(setPaymentFilter('All Payments'));
        }

        // Transfer Mode
        if (modeParam && modeParam !== transferModeFilter) {
            dispatch(setTransferModeFilter(modeParam));
        } else if (!modeParam && transferModeFilter !== 'All Modes') {
            dispatch(setTransferModeFilter('All Modes'));
        }

    }, [searchParams, dispatch, page, statusFilter, paymentTypeFilter, transferModeFilter]);

    // Debounce Search
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [expandedTrackerKeys, setExpandedTrackerKeys] = useState<Record<string, boolean>>({}); // NEW: Local state for individual expand/collapse

    // Local state to track which specific order action is processing
    const [processingAction, setProcessingAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);

    const handleApproveWrapper = (id: string) => {
        dispatch(setApprovalModal({ isOpen: true, unitId: id }));
    };

    const handleRejectWrapper = (id: string) => {
        dispatch(setRejectionModal({ isOpen: true, unitId: id }));
    };

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                dispatch(setSearchQuery(localSearch));
                // Manual Fetch for Search
                dispatch(fetchPendingUnits({
                    adminMobile,
                    page: 1, // Reset to page 1 for new search
                    pageSize,
                    paymentStatus: statusFilter,
                    paymentType: paymentTypeFilter,
                    transferMode: transferModeFilter,
                    search: localSearch
                }));
                // Update URL to match (optional but good for consistency)
                setSearchParams(prev => {
                    const newParams = new URLSearchParams(prev);
                    if (localSearch) newParams.set('search', localSearch);
                    else newParams.delete('search');
                    newParams.set('page', '1');
                    return newParams;
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, dispatch, searchQuery, adminMobile, pageSize, statusFilter, paymentTypeFilter, transferModeFilter, setSearchParams]);

    // Persist filters to localStorage
    useEffect(() => {
        localStorage.setItem('orders_searchQuery', searchQuery);
        localStorage.setItem('orders_paymentFilter', paymentTypeFilter);
        localStorage.setItem('orders_paymentTypeFilter', paymentTypeFilter);
        localStorage.setItem('orders_statusFilter', statusFilter);
        localStorage.setItem('orders_transferModeFilter', transferModeFilter);
        localStorage.setItem('orders_page', String(page));
    }, [searchQuery, paymentTypeFilter, statusFilter, transferModeFilter, page]);

    // Fetch Data on Filter Change
    // Initial Fetch ON MOUNT ONLY (One time)
    const hasFetchedParams = useRef(false);
    useEffect(() => {
        if (hasFetchedParams.current) return;
        hasFetchedParams.current = true;

        // Read params directly from URL for the initial fetch to ensure accuracy before Redux syncs
        const pageParam = searchParams.get('page');
        const statusParam = searchParams.get('status');
        const paymentParam = searchParams.get('payment');
        const modeParam = searchParams.get('mode');

        const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
        // Default to PENDING_ADMIN_VERIFICATION if no status in URL (User Requirement)
        const initialStatus = statusParam || 'PENDING_ADMIN_VERIFICATION';
        const initialPayment = paymentParam || 'All Payments';
        const initialMode = modeParam || 'All Modes';

        dispatch(fetchPendingUnits({
            adminMobile,
            page: initialPage,
            pageSize,
            paymentStatus: initialStatus,
            paymentType: initialPayment,
            transferMode: initialMode,
            search: searchQuery
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, adminMobile]); // Run once on mount (when adminMobile is available)

    /* REACTIVE FETCH REMOVED - calling manually in handlers to prevent loops/redundant calls
    useEffect(() => {
        dispatch(fetchPendingUnits({ ... }));
    }, [...]);
    */

    // Reset Page on Filter Change - REMOVED to prevent circular dependency
    // Page reset is now handled in the individual filter change handlers updating the URL directly.
    /*
    const prevFiltersRef = useRef({ statusFilter, paymentTypeFilter, transferModeFilter });
    useEffect(() => {
        // ... (removed to fix loop)
    }, []);
    */

    // Initial Stats Fetch
    // Filter Change Handlers with URL updates
    const handleStatusFilterChange = (status: string) => {
        // 1. Update Redux Immediate
        dispatch(setStatusFilter(status));
        dispatch(setPage(1));

        // 2. Update URL
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('status', status);
            newParams.set('page', '1');
            return newParams;
        });

        // 3. Manual Fetch
        dispatch(fetchPendingUnits({
            adminMobile,
            page: 1,
            pageSize,
            paymentStatus: status,
            paymentType: paymentTypeFilter,
            transferMode: transferModeFilter,
            search: searchQuery
        }));
    };

    const handlePaymentTypeChange = (type: string) => {
        // 1. Update Redux
        dispatch(setPaymentFilter(type));
        dispatch(setPage(1));

        // 2. Update URL
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (type === 'All Payments') newParams.delete('payment');
            else newParams.set('payment', type);
            newParams.set('page', '1');
            return newParams;
        });

        // 3. Manual Fetch
        dispatch(fetchPendingUnits({
            adminMobile,
            page: 1,
            pageSize,
            paymentStatus: statusFilter,
            paymentType: type,
            transferMode: transferModeFilter,
            search: searchQuery
        }));
    };




    const handleViewProof = useCallback((transaction: any, investor: any) => {
        dispatch(setProofModal({ isOpen: true, data: { ...transaction, name: investor.name } }));
    }, [dispatch]);

    const handleToggleExpansion = useCallback((orderId: string) => {
        if (expandedOrderId === orderId) {
            dispatch(setExpandedOrderId(null));
            dispatch(setActiveUnitIndex(null));
        } else {
            dispatch(setExpandedOrderId(orderId));
            dispatch(setActiveUnitIndex(0));
        }
    }, [dispatch, expandedOrderId]);

    // Real Tracking Integration
    const [realTrackingData, setRealTrackingData] = useState<any>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        if (expandedOrderId) {
            setTrackingLoading(true);
            const fetchTracking = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(API_ENDPOINTS.getOrderStatus(), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ orderId: expandedOrderId })
                    });
                    const data = await response.json();
                    if (data.status === 'success') {
                        setRealTrackingData(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch tracking", err);
                } finally {
                    setTrackingLoading(false);
                }
            };
            fetchTracking();
        } else {
            setRealTrackingData(null);
        }
    }, [expandedOrderId]);

    // Process specific phase/cycle stages from the new API structure
    const processPhaseStages = useCallback((phaseData: any) => {
        if (!phaseData || !phaseData.stages) return { currentStageId: 1, history: {}, stages: [] };

        const history: any = {};
        let maxStageId = 1;

        const dynamicStages = phaseData.stages.map((item: any) => {
            let label = '';
            if (item.stage === 'BUFFALOS_BOUGHT') {
                label = 'Buffaloes Bought';
            } else {
                label = item.stage
                    .split('_')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            }

            return {
                id: item.id,
                label: label,
                description: item.description,
                status: item.status,
                rawStage: item.stage
            };
        }).sort((a: any, b: any) => a.id - b.id);

        phaseData.stages.forEach((item: any) => {
            const sId = item.id;
            if (sId) {
                if (item.timestamp) {
                    const dateObj = new Date(item.timestamp);
                    const dateStr = dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
                    const timeStr = dateObj.toLocaleTimeString('en-GB', { hour12: false });
                    history[sId] = { date: dateStr, time: timeStr, description: item.description };
                } else if (item.description) {
                    history[sId] = { date: '-', time: '-', description: item.description };
                }

                if (item.status === 'COMPLETED') {
                    maxStageId = Math.max(maxStageId, sId + 1);
                }
            }
        });

        if (dynamicStages.length > 0) {
            const lastId = dynamicStages[dynamicStages.length - 1].id;
            if (maxStageId > lastId + 1) maxStageId = lastId + 1;
        }

        return { currentStageId: maxStageId, history, stages: dynamicStages };
    }, []);

    const handleStageUpdateLocal = async (orderId: string, buffaloIds: string[], nextStageId: number) => {
        // Map nextStageId to Specific Backend Status required by user
        let status = '';

        if (nextStageId === 5) status = 'PLACED_TO_MARKET';
        else if (nextStageId === 6) status = 'BOUGHT';
        else if (nextStageId === 7) status = 'IN_QUARANTINE';
        else if (nextStageId === 8) status = 'IN_TRANSIT';

        if (!status) {
            alert("Update not allowed for this stage.");
            return;
        }

        const payload = {
            orderId: orderId,
            status: status,
            buffaloIds: buffaloIds, // LIST of IDs
            adminMobile: adminMobile,
            description: "",
            location: ""
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.updateOrderStatus(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-admin-mobile': adminMobile
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Refresh tracking data
                const refreshResponse = await fetch(API_ENDPOINTS.getOrderStatus(), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ orderId: orderId })
                });
                const refreshData = await refreshResponse.json();
                if (refreshData.status === 'success') {
                    setRealTrackingData(refreshData);
                }
            } else {
                alert(`Failed to update status: ${data.message}`);
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Error updating status");
        }
    };

    // Pagination
    const totalPages = Math.ceil((totalCount || 0) / pageSize);

    const currentCols = (statusFilter === 'PENDING_ADMIN_VERIFICATION' || statusFilter === 'REJECTED') ? 11 : 10;

    return (
        <div className="orders-dashboard">
            <div className="orders-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold">Live Orders</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                        type="date"
                        className="search-input w-full sm:w-auto"
                        style={{ maxWidth: '160px' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Mobile..."
                        className="search-input orders-search w-full sm:w-auto"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Status Cards / Filters */}
            <div className="status-controls grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div
                    className={`stats-card ${statusFilter === 'All Status' ? 'active-all' : ''}`}
                    onClick={() => handleStatusFilterChange('All Status')}
                >
                    <div className="card-icon-wrapper all">
                        <ClipboardList size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{statusFilter === 'All Status' ? totalAllOrders : (statusCounts['All Status'] ?? (totalAllOrders > 0 ? totalAllOrders : '-'))}</h3>
                        <p>All Status</p>
                    </div>
                </div>
                <div
                    className={`stats-card ${statusFilter === 'PENDING_ADMIN_VERIFICATION' ? 'active-pending' : ''}`}
                    onClick={() => handleStatusFilterChange('PENDING_ADMIN_VERIFICATION')}
                >
                    <div className="card-icon-wrapper pending">
                        <CheckCircle size={24} />
                    </div>
                    <div className="card-content">
                        {/* <h3>{statusFilter === 'PENDING_ADMIN_VERIFICATION' ? totalCount : (statusCounts['PENDING_ADMIN_VERIFICATION'] ?? '-')}</h3> */}
                        <p>Pending Admin Approval</p>
                    </div>
                </div>

                <div
                    className={`stats-card ${statusFilter === 'PAID' ? 'active-paid' : ''}`}
                    onClick={() => handleStatusFilterChange('PAID')}
                >
                    <div className="card-icon-wrapper approved">
                        <CheckSquare size={24} />
                    </div>
                    <div className="card-content">
                        {/* <h3>{statusFilter === 'PAID' ? totalCount : (statusCounts['PAID'] ?? '-')}</h3> */}
                        <p>Approved/Paid</p>
                    </div>
                </div>

                <div
                    className={`stats-card ${statusFilter === 'REJECTED' ? 'active-rejected' : ''}`}
                    onClick={() => handleStatusFilterChange('REJECTED')}
                >
                    <div className="card-icon-wrapper rejected">
                        <XCircle size={24} />
                    </div>
                    <div className="card-content">
                        {/* <h3>{statusFilter === 'REJECTED' ? totalCount : (statusCounts['REJECTED'] ?? '-')}</h3> */}
                        <p>Rejected</p>
                    </div>
                </div>

                <div
                    className={`stats-card ${statusFilter === 'PENDING_PAYMENT' ? 'active-payment-due' : ''}`}
                    onClick={() => handleStatusFilterChange('PENDING_PAYMENT')}
                >
                    <div className="card-icon-wrapper payment-due">
                        <Clock size={24} />
                    </div>
                    <div className="card-content">
                        {/* <h3>{statusFilter === 'PENDING_PAYMENT' ? totalCount : (statusCounts['PENDING_PAYMENT'] ?? '-')}</h3> */}
                        <p>Payment Due</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar Removed - Payment Filter moved to table header */}

            {
                ordersError && (
                    <div className="orders-error-msg">{ordersError}</div>
                )
            }

            <div className="table-container">
                <table className="user-table">
                    <thead style={{ backgroundColor: '#f0f2f5' }}>
                        <tr>
                            <th>S.No</th>
                            <th>Ordered Date</th>
                            <th>Order Id</th>
                            <th>Units</th>
                            <th className="th-user-name">User Name</th>
                            <th>Mobile</th>
                            <th>Status</th>
                            <th style={{ minWidth: '140px' }}>
                                <select
                                    value={paymentTypeFilter}
                                    onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                    className="payment-type-select"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="All Payments">Payment Type</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="ONLINE">Online/UPI</option>
                                    <option value="CASH">Cash</option>
                                </select>
                            </th>
                            <th className="th-proof">Payment Image Proof</th>
                            <th>Amount</th>
                            <th>Total Cost</th>
                            <th>Coins Redeemed</th>
                            {statusFilter === 'PENDING_ADMIN_VERIFICATION' && <th>Actions</th>}
                            {statusFilter === 'REJECTED' && <th>Rejected Reason</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {ordersLoading ? (
                            <TableSkeleton cols={currentCols + 2} rows={10} />
                        ) : pendingUnits.length === 0 ? (
                            <tr>
                                <td colSpan={currentCols + 2} className="no-data-row">
                                    No orders found matching filters.
                                </td>
                            </tr>
                        ) : (
                            pendingUnits.map((entry: any, index: number) => {
                                const unit = entry.order || {};
                                const tx = entry.transaction || {};
                                const inv = entry.investor || {};
                                const serialNumber = (page - 1) * pageSize + index + 1;

                                const isExpandable = (unit.paymentStatus === 'PAID' || unit.paymentStatus === 'Approved') && statusFilter === 'PAID';

                                return (
                                    <React.Fragment key={`${unit.id || 'order'}-${index}`}>
                                        <tr
                                            onClick={() => navigate(`/orders/${unit.id}`)}
                                            style={{ cursor: 'pointer' }}
                                            className="order-row-hover"
                                        >
                                            <td>{serialNumber}</td>
                                            <td>
                                                {unit.placedAt ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold' }}>
                                                        <span >
                                                            {new Date(unit.placedAt).toLocaleDateString('en-GB')}
                                                        </span>
                                                        <span style={{ color: '#64748b', fontSize: '11px' }}>
                                                            {new Date(unit.placedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <button
                                                    className="check-status-btn"
                                                    onClick={() => isExpandable && handleToggleExpansion(unit.id)}
                                                    style={{
                                                        fontWeight: 700,
                                                        cursor: isExpandable ? 'pointer' : 'default',
                                                        textDecoration: isExpandable ? 'underline' : 'none',
                                                        color: isExpandable ? '#3b82f6' : '#374151'
                                                    }}
                                                >
                                                    {unit.id}
                                                </button>
                                            </td>
                                            <td>{unit.numUnits}</td>
                                            <td>{inv.name}</td>
                                            <td>{inv.mobile ? `******${String(inv.mobile).slice(-4)}` : '-'}</td>
                                            <td className="td-vertical-middle">
                                                {(() => {
                                                    let statusClass = '';
                                                    let label = unit.paymentStatus || '-';

                                                    if (unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION') {
                                                        statusClass = 'admin-approval';
                                                        label = 'Admin Approval';
                                                    } else if (unit.paymentStatus === 'PAID' || unit.paymentStatus === 'Approved') {
                                                        statusClass = 'paid';
                                                        label = 'Paid';
                                                    } else if (unit.paymentStatus === 'REJECTED') {
                                                        statusClass = 'rejected';
                                                        label = 'Rejected';
                                                    } else if (unit.paymentStatus === 'PENDING_PAYMENT') {
                                                        statusClass = 'payment-due';
                                                        label = 'Payment Due';
                                                    }

                                                    return (
                                                        <span className={`status-badge ${statusClass}`}>
                                                            {label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="payment-type-cell">
                                                {tx.paymentType === 'BANK_TRANSFER' || tx.paymentType === 'CHEQUE' ? (
                                                    <div
                                                        className="bank-transfer-hover-container"
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const viewportHeight = window.innerHeight;
                                                            // Default: Center vertically relative to trigger
                                                            let top = rect.top + (rect.height / 2);

                                                            // Adjust if near bottom (assume tooltip height ~250px)
                                                            if (top + 125 > viewportHeight) {
                                                                top = viewportHeight - 140;
                                                            }
                                                            // Adjust if near top
                                                            if (top - 125 < 0) {
                                                                top = 140;
                                                            }

                                                            setTooltipInfo({
                                                                tx,
                                                                top,
                                                                left: rect.right + 10
                                                            });
                                                        }}
                                                        onMouseLeave={() => setTooltipInfo(null)}
                                                    >
                                                        <span>{tx.paymentType === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cheque'}</span>
                                                    </div>
                                                ) : (
                                                    tx.paymentType || '-'
                                                )}
                                            </td>
                                            <td>
                                                {tx.paymentType ? (
                                                    <button
                                                        className="view-proof-btn"
                                                        onClick={() => handleViewProof(tx, inv)}
                                                    >
                                                        Payment Proof
                                                    </button>
                                                ) : '-'}
                                            </td>
                                            <td>{tx.amount ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : '-'}</td>
                                            <td>{unit.totalCost != null ? `₹${unit.totalCost.toLocaleString('en-IN')}` : '-'}</td>
                                            <td>{unit.coinsRedeemed != null ? unit.coinsRedeemed.toLocaleString('en-IN') : '0'}</td>
                                            {statusFilter === 'REJECTED' && <td>
                                                {unit.rejectedReason || 'No reason provided'}
                                            </td>}
                                            {statusFilter === 'PENDING_ADMIN_VERIFICATION' && <td>
                                                <div className="action-btn-container">
                                                    {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && (
                                                        <button
                                                            onClick={() => handleApproveWrapper(unit.id)}
                                                            className={`action-btn approve ${processingAction?.id === unit.id && processingAction?.type === 'approve' ? 'loading' : ''}`}
                                                            disabled={actionLoading || processingAction !== null}
                                                        >
                                                            {processingAction?.id === unit.id && processingAction?.type === 'approve' ? 'Processing...' : 'Approve'}
                                                        </button>
                                                    )}
                                                    {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && (
                                                        <button
                                                            onClick={() => handleRejectWrapper(unit.id)}
                                                            className={`action-btn reject ${processingAction?.id === unit.id && processingAction?.type === 'reject' ? 'loading' : ''}`}
                                                            disabled={actionLoading || processingAction !== null}
                                                        >
                                                            {processingAction?.id === unit.id && processingAction?.type === 'reject' ? 'Processing...' : 'Reject'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>}
                                        </tr>

                                        {expandedOrderId === unit.id && (
                                            <tr className="tracking-expanded-row">
                                                <td colSpan={currentCols + 2} className="tracking-expanded-cell">
                                                    <div className="order-expand-animation tracking-expand-container">
                                                        <div className="tracking-interface-container" style={{ display: 'block' }}>
                                                            {/* Sidebar removed */}
                                                            <div className="tracking-main-content" style={{ width: '100%' }}>
                                                                <div className="order-expand-animation tracking-buffalo-grid">

                                                                    {realTrackingData?.deliveryPhases ? (
                                                                        realTrackingData.deliveryPhases.map((phase: any, index: number) => {
                                                                            const cycleNum = phase.phase;
                                                                            const tracker = processPhaseStages(phase);
                                                                            const TRACKING_WINDOW_DAYS = 15; // Set to 200 to enable early. Standard is 15.

                                                                            // Tracking enablement logic based on scheduledDate
                                                                            let isTrackingEnabled = true;
                                                                            let daysRemaining = 0;
                                                                            const targetDate = phase.scheduledDate || phase.scheduled_date;

                                                                            if (targetDate) {
                                                                                const scheduledDate = new Date(targetDate);
                                                                                scheduledDate.setHours(0, 0, 0, 0);
                                                                                const today = new Date();
                                                                                today.setHours(0, 0, 0, 0);
                                                                                const diffTime = scheduledDate.getTime() - today.getTime();
                                                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                                daysRemaining = diffDays;
                                                                                // Enable only if within window (or date passed)
                                                                                if (diffDays > TRACKING_WINDOW_DAYS) {
                                                                                    isTrackingEnabled = false;
                                                                                }
                                                                            }

                                                                            const currentStageId = tracker.currentStageId;
                                                                            const isExpanded = isTrackingEnabled && (expandedTrackerKeys[`${unit.id}-${cycleNum}`] !== false);
                                                                            const timelineStages = tracker.stages || [];
                                                                            const buffaloIds = phase.buffaloIds || [];



                                                                            // Text formatting
                                                                            const buffaloCount = buffaloIds.length;
                                                                            const buffaloText = buffaloCount === 1
                                                                                ? '(1 Buffalo)'
                                                                                : `(${buffaloCount} Buffaloes)`;

                                                                            const trackerKey = `${unit.id}-${cycleNum}`;

                                                                            return (
                                                                                <div key={cycleNum} className="tracking-buffalo-card" style={{ marginBottom: '20px' }}>
                                                                                    <div className="tracking-buffalo-title">
                                                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                            <span>{`Cycle ${cycleNum} ${buffaloText}`}</span>
                                                                                            {!isTrackingEnabled && (
                                                                                                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                                                                                                    Tracking starts in {daysRemaining - TRACKING_WINDOW_DAYS} days ({new Date(targetDate).toLocaleDateString()})
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="header-actions">
                                                                                            {isTrackingEnabled && (
                                                                                                <button
                                                                                                    onClick={() => setExpandedTrackerKeys(prev => ({ ...prev, [trackerKey]: !isExpanded }))}
                                                                                                    className="tracking-individual-expand-btn"
                                                                                                >
                                                                                                    {isExpanded ? 'Minimize' : 'Expand'}
                                                                                                    <span className={`tracking-chevron ${isExpanded ? 'up' : 'down'}`}>
                                                                                                        {isExpanded ? '▲' : '▼'}
                                                                                                    </span>
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    {isExpanded && (
                                                                                        <div className="tracking-timeline-container order-expand-animation">
                                                                                            {timelineStages.map((stage: any, sIdx: number) => {
                                                                                                const isLast = sIdx === timelineStages.length - 1;
                                                                                                const isStepCompleted = stage.id < currentStageId;
                                                                                                const isCurrent = stage.id === currentStageId;
                                                                                                const stageDate = tracker.history[stage.id]?.date || '-';
                                                                                                const stageTime = tracker.history[stage.id]?.time || '-';

                                                                                                return (
                                                                                                    <div key={stage.id} className="tracking-timeline-item">
                                                                                                        <div className="tracking-timeline-date-col">
                                                                                                            <div className="tracking-timeline-date">{stageDate}</div>
                                                                                                            {stageTime !== '-' && <div className="tracking-timeline-time-sub">{stageTime}</div>}
                                                                                                        </div>

                                                                                                        <div className="tracking-timeline-marker-col">
                                                                                                            {!isLast && (
                                                                                                                <div className={`tracking-timeline-line ${isStepCompleted ? 'completed' : 'pending'}`} />
                                                                                                            )}
                                                                                                            <div className={`tracking-timeline-dot ${isStepCompleted ? 'completed' : 'pending'}`}>
                                                                                                                {isStepCompleted ? '✓' : stage.id}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className={`tracking-timeline-content-col ${isLast ? 'last' : ''}`}>
                                                                                                            <div className="tracking-timeline-header">
                                                                                                                <div className="tracking-timeline-details-text">
                                                                                                                    <div className={`tracking-timeline-label ${isStepCompleted ? 'completed' : 'pending'}`}>
                                                                                                                        {stage.label}
                                                                                                                    </div>
                                                                                                                    <div className="tracking-timeline-desc">
                                                                                                                        {/* Only show description if time/date is present ("along with time only") */}
                                                                                                                        {(tracker.history[stage.id]?.date && tracker.history[stage.id]?.date !== '-') ? `(${tracker.history[stage.id]?.description || stage.description})` : null}
                                                                                                                    </div>
                                                                                                                </div>

                                                                                                                {/* Show button only if previous step is completed and we are waiting for the next action */}
                                                                                                                {(isStepCompleted && stage.id === currentStageId - 1) && stage.id >= 4 && stage.id < 8 && (
                                                                                                                    <button
                                                                                                                        className="tracking-update-btn"
                                                                                                                        onClick={() => handleStageUpdateLocal(unit.id, buffaloIds, stage.id + 1)}
                                                                                                                    >
                                                                                                                        {(() => {
                                                                                                                            const nextId = stage.id + 1;

                                                                                                                            if (nextId === 5) return 'Update Placed to Market';
                                                                                                                            if (nextId === 6) return 'Update Bought';
                                                                                                                            if (nextId === 7) return 'Update In Quarantine';
                                                                                                                            if (nextId === 8) return 'Update In Transit';
                                                                                                                            return 'Update';
                                                                                                                        })()}
                                                                                                                    </button>
                                                                                                                )}

                                                                                                                {/* Show Completed Badge only if step is completed via API AND button is NOT shown */}
                                                                                                                {stage.status === 'COMPLETED' && !((isStepCompleted && stage.id === currentStageId - 1) && stage.id >= 4 && stage.id < 8) && (
                                                                                                                    <span className="tracking-completed-badge">
                                                                                                                        {stage.id === 7 ? 'Delivered' : 'Completed'}
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : null
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages || 1}
                onPageChange={(p) => {
                    // 1. Update Redux
                    dispatch(setPage(p));

                    // 2. Update URL
                    setSearchParams(prevParams => {
                        const newParams = new URLSearchParams(prevParams);
                        newParams.set('page', String(p));
                        return newParams;
                    });

                    // 3. Manual Fetch
                    dispatch(fetchPendingUnits({
                        adminMobile,
                        page: p,
                        pageSize,
                        paymentStatus: statusFilter,
                        paymentType: paymentTypeFilter,
                        transferMode: transferModeFilter,
                        search: searchQuery
                    }));
                }}
            />

            {/* Floating Tooltip */}
            {tooltipInfo && (() => {
                const { tx, top, left } = tooltipInfo;
                const isCheque = tx.paymentType === 'CHEQUE';
                return (
                    <div
                        className="bank-details-tooltip"
                        style={{
                            visibility: 'visible',
                            opacity: 1,
                            position: 'fixed',
                            top: top,
                            left: left,
                            transform: 'translateY(-50%)',
                            zIndex: 9999
                        }}
                        onMouseEnter={() => { }}
                        onMouseLeave={() => setTooltipInfo(null)}
                    >
                        <div className="tooltip-title">Payment Details</div>
                        <div className="tooltip-item">
                            <span className="tooltip-label">Bank Name:</span>
                            <span className="tooltip-value">{findVal(tx, ['bank_name', 'bankName', 'bank_details'], ['bank'])}</span>
                        </div>
                        <div className="tooltip-item">
                            <span className="tooltip-label">{isCheque ? 'Cheque No:' : 'A/C Number:'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                <span className="tooltip-value">
                                    {isCheque
                                        ? findVal(tx, ['cheque_no', 'cheque_number', 'chequeNo'], ['cheque'])
                                        : findVal(tx, ['account_number', 'account_no', 'acc_no', 'ac_no', 'accountNumber'], ['account', 'acc_no', 'ac_no'])
                                    }
                                </span>
                                {isCheque && (
                                    <UTRCopyButton value={findVal(tx, ['cheque_no', 'cheque_number', 'chequeNo'], ['cheque'])} />
                                )}
                            </div>
                        </div>
                        <div className="tooltip-item">
                            <span className="tooltip-label">{isCheque ? 'Cheque Date:' : 'UTR:'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                <span className="tooltip-value">
                                    {isCheque
                                        ? findVal(tx, ['cheque_date', 'date'], ['date'])
                                        : findVal(tx, ['utr', 'utr_no', 'utr_number', 'transaction_id'], ['utr', 'txid'])
                                    }
                                </span>
                                {!isCheque && (
                                    <UTRCopyButton value={findVal(tx, ['utr', 'utr_no', 'utr_number', 'transaction_id'], ['utr', 'txid'])} />
                                )}
                            </div>
                        </div>
                        {!isCheque && (
                            <div className="tooltip-item">
                                <span className="tooltip-label">IFSC:</span>
                                <span className="tooltip-value">{findVal(tx, ['ifsc_code', 'ifsc', 'ifscCode'], ['ifsc'])}</span>
                            </div>
                        )}
                        {tx.transferMode && (
                            <div className="tooltip-item">
                                <span className="tooltip-label">Mode:</span>
                                <span className="tooltip-value">{tx.transferMode}</span>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};

export default OrdersTab;
