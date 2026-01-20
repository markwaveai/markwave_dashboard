import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { setProofModal } from '../../store/slices/uiSlice';
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
    handleApproveClick: (unitId: string) => void;
    handleReject: (unitId: string) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({
    handleApproveClick,
    handleReject
}) => {
    const dispatch = useAppDispatch();

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

    const handleApproveWrapper = async (id: string) => {
        setProcessingAction({ id, type: 'approve' });
        try {
            await handleApproveClick(id);
        } finally {
            setProcessingAction(null);
        }
    };

    const handleRejectWrapper = async (id: string) => {
        setProcessingAction({ id, type: 'reject' });
        try {
            await handleReject(id);
        } finally {
            setProcessingAction(null);
        }
    };

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                dispatch(setSearchQuery(localSearch));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, dispatch, searchQuery]);

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
    useEffect(() => {
        dispatch(fetchPendingUnits({
            adminMobile,
            page,
            pageSize,
            paymentStatus: statusFilter,
            paymentType: paymentTypeFilter,
            transferMode: transferModeFilter,
            search: searchQuery
        }));
    }, [dispatch, adminMobile, page, pageSize, statusFilter, paymentTypeFilter, transferModeFilter, searchQuery]);

    // Reset Page on Filter Change
    const prevFiltersRef = useRef({ statusFilter, paymentTypeFilter, transferModeFilter });
    useEffect(() => {
        const prev = prevFiltersRef.current;
        const current = { statusFilter, paymentTypeFilter, transferModeFilter };

        if (
            prev.statusFilter !== current.statusFilter ||
            prev.paymentTypeFilter !== current.paymentTypeFilter ||
            prev.transferModeFilter !== current.transferModeFilter
        ) {
            // dispatch(setPage(1)); // Handled via URL update now to keep sync
            setSearchParams(prevParams => {
                const newParams = new URLSearchParams(prevParams);
                newParams.set('page', '1');
                return newParams;
            });
            prevFiltersRef.current = current;
        }
    }, [statusFilter, paymentTypeFilter, transferModeFilter, dispatch, setSearchParams]);

    // Initial Stats Fetch
    // Filter Change Handlers with URL updates
    const handleStatusFilterChange = (status: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('status', status); // Always set status explicitly
            newParams.set('page', '1'); // Reset page on filter change
            return newParams;
        });
        // Dispatch happens in useEffect
    };

    const handlePaymentTypeChange = (type: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (type === 'All Payments') newParams.delete('payment');
            else newParams.set('payment', type);
            newParams.set('page', '1');
            return newParams;
        });
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

    // Construct history object from real data
    const getTrackingForBuffalo = useCallback(() => {
        if (!realTrackingData || !realTrackingData.timeline) return { currentStageId: 1, history: {} };

        const history: any = {};
        let maxStageId = 1;

        // Map backend stages to frontend IDs
        // BACKEND: ORDER_PLACED, PAYMENT_SUBMITTED, PAYMENT_VERIFIED, BUFFALOS_BOUGHT, IN_QUARANTINE, IN_TRANSIT, DELIVERED_TO_FARM
        const stageMap: Record<string, number> = {
            'ORDER_PLACED': 1,
            'PAYMENT_SUBMITTED': 2,
            'PAYMENT_VERIFICATION_PENDING': 2,
            'PAYMENT_VERIFIED': 3,
            'ORDER_APPROVED': 4,

            'ORDER_CONFIRMED': 4, // Added per user request
            'APPROVED': 4, // Alias if needed
            'BUFFALOS_BOUGHT': 5,
            'BOUGHT': 5,
            'IN_QUARANTINE': 6,
            'IN_TRANSIT': 7,
            'DELIVERED_TO_FARM': 8,
            'DELIVERED': 8
        };

        realTrackingData.timeline.forEach((item: any) => {
            const sId = stageMap[item.stage];
            if (sId) {
                if (item.timestamp) {
                    const dateObj = new Date(item.timestamp);
                    const dateStr = dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
                    const timeStr = dateObj.toLocaleTimeString('en-GB');
                    history[sId] = { date: dateStr, time: timeStr, description: item.description };
                } else if (item.description) {
                    history[sId] = { date: '-', time: '-', description: item.description };
                }
                // Update current stage to be the next after the last completed one
                if (item.status === 'COMPLETED') {
                    maxStageId = Math.max(maxStageId, sId + 1);
                } else if (item.status === 'IN_PROGRESS') {
                    maxStageId = Math.max(maxStageId, sId);
                }
            }
        });

        // If maxStageId > 8, clamp it (unless we want to show 'Completed' state distinctly)
        if (maxStageId > 9) maxStageId = 9;

        return { currentStageId: maxStageId, history };
    }, [realTrackingData]);

    const handleStageUpdateLocal = async (orderId: string, buffaloNum: number, nextStageId: number) => {
        // Map nextStageId to Backend Status
        // Stages: 1:Placed, 2:PaymentPending, 3:Approved, 4:Market, 5:Quarantine, 6:Transit, 7:Delivered
        let status = '';
        if (nextStageId === 5) status = 'BOUGHT';
        else if (nextStageId === 6) status = 'IN_QUARANTINE';
        else if (nextStageId === 7) status = 'IN_TRANSIT';
        else if (nextStageId === 8) status = 'DELIVERED';
        else if (nextStageId === 4) status = 'APPROVED'; // Fallback if explicit call needed

        if (!status) {
            // If nextStageId is 8 (after Delivered), we might just allow it if we want to "Complete" the order visually?
            // But API has no status for it.
            alert("Update restricted for this stage. Please complete Payment verification via the main 'Approve' button.");
            return;
        }

        const payload = {
            orderId: orderId,
            status: status,
            buffaloId: String(buffaloNum), // Always send buffaloId
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
                // Manually re-fetch
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

    const trackingStages = [
        { id: 1, label: 'Order Placed', description: 'Order placed successfully.' },
        { id: 2, label: 'Payment Submitted', description: 'Payment details submitted by customer.' },
        { id: 3, label: 'Payment Verified', description: 'Payment verified and order approved.' },
        { id: 4, label: 'Order Confirmed', description: 'Order approved for procurement.' },
        { id: 5, label: 'In Market', description: 'Buffalos purchased from market.' }, // User requested label change previously
        { id: 6, label: 'In Quarantine', description: 'Animals in quarantine for health check.' },
        { id: 7, label: 'In Transit', description: 'Animals in transit to farm.' },
        { id: 8, label: 'Delivered to Farm', description: 'Animals delivered to farm.' }
    ];

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

                                const isExpandable = unit.paymentStatus === 'PAID' || unit.paymentStatus === 'Approved';

                                return (
                                    <React.Fragment key={`${unit.id || 'order'}-${index}`}>
                                        <tr>
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
                                                    <div className="bank-transfer-hover-container">
                                                        <span>{tx.paymentType === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cheque'}</span>
                                                        <div className="bank-details-tooltip">
                                                            <div className="tooltip-title">Payment Details</div>
                                                            {(() => {
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

                                                                const isCheque = tx.paymentType === 'CHEQUE';

                                                                return (
                                                                    <>
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
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
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
                                                                    {(() => {
                                                                        const totalUnits = parseFloat(String(unit.numUnits || 0));
                                                                        // Logic: Always 2 Cycles.
                                                                        // Cycle 1: 50% of units.
                                                                        // Cycle 2: 50% of units.
                                                                        // e.g. 5 units -> 2.5 units per cycle.
                                                                        const cycleUnits = totalUnits / 2;

                                                                        return [1, 2].map(cycleNum => {
                                                                            // Calculate buffaloes for this cycle (Unit * 2 buffaloes/unit)
                                                                            const buffaloesInCycle = cycleUnits * 2;

                                                                            // Text formatting
                                                                            const buffaloText = buffaloesInCycle === 1
                                                                                ? '(1 Buffalo, 1 Calf)'
                                                                                : `(${buffaloesInCycle} Buffaloes, ${buffaloesInCycle} Calves)`;

                                                                            // cycleNum matches buffaloNum concept (1 or 2)
                                                                            const trackerKey = `${unit.id}-${cycleNum}`;
                                                                            const tracker = trackingData[trackerKey] || getTrackingForBuffalo();
                                                                            const currentStageId = tracker.currentStageId;
                                                                            const isExpanded = expandedTrackerKeys[trackerKey] !== false;

                                                                            // For all Cycles, show all stages.
                                                                            const timelineStages = trackingStages;

                                                                            return (
                                                                                <div key={cycleNum} className="tracking-buffalo-card" style={{ marginBottom: '20px' }}>
                                                                                    <div className="tracking-buffalo-title">
                                                                                        <span>{`Cycle ${cycleNum} (${cycleUnits} ${cycleUnits === 1 ? 'Unit' : 'Units'} - ${buffaloText})`}</span>
                                                                                        <div className="header-actions">
                                                                                            <button
                                                                                                onClick={() => setExpandedTrackerKeys(prev => ({ ...prev, [trackerKey]: !isExpanded }))}
                                                                                                className="tracking-individual-expand-btn"
                                                                                            >
                                                                                                {isExpanded ? 'Minimize' : 'Expand'}
                                                                                                <span className={`tracking-chevron ${isExpanded ? 'up' : 'down'}`}>
                                                                                                    {isExpanded ? '▲' : '▼'}
                                                                                                </span>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    {isExpanded && (
                                                                                        <div className="tracking-timeline-container order-expand-animation">
                                                                                            {timelineStages.map((stage, sIdx) => {
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
                                                                                                            <div className={`tracking-timeline-dot ${isStepCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}>
                                                                                                                {isStepCompleted ? '✓' : stage.id}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className={`tracking-timeline-content-col ${isLast ? 'last' : ''}`}>
                                                                                                            <div className="tracking-timeline-header">
                                                                                                                <div className="tracking-timeline-details-text">
                                                                                                                    <div className={`tracking-timeline-label ${isStepCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}>
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
                                                                                                                        onClick={() => handleStageUpdateLocal(unit.id, cycleNum, stage.id + 1)}
                                                                                                                    >
                                                                                                                        {(() => {
                                                                                                                            const nextId = stage.id + 1;

                                                                                                                            if (nextId === 5) return 'Bought';
                                                                                                                            if (nextId === 6) return 'In Quarantine';
                                                                                                                            if (nextId === 7) return 'In Transit';
                                                                                                                            if (nextId === 8) return 'Delivered';
                                                                                                                            return 'Update';
                                                                                                                        })()}
                                                                                                                    </button>
                                                                                                                )}

                                                                                                                {/* Show Completed Badge only if step is completed AND button is NOT shown */}
                                                                                                                {isStepCompleted && !((isStepCompleted && stage.id === currentStageId - 1) && stage.id >= 4 && stage.id < 8) && (
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
                                                                    })()}
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
                    setSearchParams(prevParams => {
                        const newParams = new URLSearchParams(prevParams);
                        newParams.set('page', String(p));
                        return newParams;
                    });
                }}
            />
        </div>
    );
};

export default OrdersTab;
