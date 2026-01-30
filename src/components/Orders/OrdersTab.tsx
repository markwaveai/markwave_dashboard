import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { Check, Copy, User } from 'lucide-react';
import {
    setSearchQuery,
    setPaymentFilter,
    setStatusFilter,
    setTransferModeFilter,
    setPage,
    fetchPendingUnits,
    setExpandedOrderId,
    setActiveUnitIndex,
    approveOrder,
    rejectOrder,
} from '../../store/slices/ordersSlice';
import { setProofModal, setRejectionModal, setApprovalModal, setSnackbar } from '../../store/slices/uiSlice';
import Pagination from '../common/Pagination';

import TableSkeleton from '../common/TableSkeleton';
import TrackingTab from './TrackingTab';

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
        pendingAdminApprovalCount,
        paidCount,
        rejectedCount,
        paymentDueCount,
        coinsRedeemedCount,
        filters,
        expansion,
        actionLoading
    } = useAppSelector((state: RootState) => state.orders);

    const { expandedOrderId } = expansion;

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

        const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
        if (!isNaN(pageNum) && pageNum !== page) {
            dispatch(setPage(pageNum));
        }

        if (statusParam && statusParam !== statusFilter) {
            dispatch(setStatusFilter(statusParam));
        }

        if (paymentParam && paymentParam !== paymentTypeFilter) {
            dispatch(setPaymentFilter(paymentParam));
        } else if (!paymentParam && paymentTypeFilter !== 'All Payments') {
            dispatch(setPaymentFilter('All Payments'));
        }

        if (modeParam && modeParam !== transferModeFilter) {
            dispatch(setTransferModeFilter(modeParam));
        } else if (!modeParam && transferModeFilter !== 'All Modes') {
            dispatch(setTransferModeFilter('All Modes'));
        }

    }, [searchParams, dispatch, page, statusFilter, paymentTypeFilter, transferModeFilter]);

    // Debounce Search
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [expandedTrackerKeys, setExpandedTrackerKeys] = useState<Record<string, boolean>>({});

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
                dispatch(fetchPendingUnits({
                    adminMobile,
                    page: 1,
                    pageSize,
                    paymentStatus: statusFilter,
                    paymentType: paymentTypeFilter,
                    transferMode: transferModeFilter,
                    search: localSearch
                }));
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

    // Initial Fetch ON MOUNT ONLY
    const hasFetchedParams = useRef(false);
    useEffect(() => {
        if (hasFetchedParams.current) return;
        hasFetchedParams.current = true;

        const pageParam = searchParams.get('page');
        const statusParam = searchParams.get('status');
        const paymentParam = searchParams.get('payment');
        const modeParam = searchParams.get('mode');

        const initialPage = pageParam ? parseInt(pageParam, 10) : page;
        const initialStatus = statusParam || statusFilter || 'PENDING_ADMIN_VERIFICATION';
        const initialPayment = paymentParam || paymentTypeFilter || 'All Payments';
        const initialMode = modeParam || transferModeFilter || 'All Modes';

        dispatch(fetchPendingUnits({
            adminMobile,
            page: initialPage,
            pageSize,
            paymentStatus: initialStatus,
            paymentType: initialPayment,
            transferMode: initialMode,
            search: searchQuery
        }));
    }, [dispatch, adminMobile]);

    const handleStatusFilterChange = (status: string) => {
        dispatch(setStatusFilter(status));
        dispatch(setPage(1));
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('status', status);
            newParams.set('page', '1');
            return newParams;
        });

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
        dispatch(setPaymentFilter(type));
        dispatch(setPage(1));
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (type === 'All Payments') newParams.delete('payment');
            else newParams.set('payment', type);
            newParams.set('page', '1');
            return newParams;
        });

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
            // Reset individual trackers when opening a new order
            setExpandedTrackerKeys({});
        }
    }, [dispatch, expandedOrderId]);

    // Pagination
    const totalPages = Math.ceil((totalCount || 0) / pageSize);
    const currentCols = (statusFilter === 'PENDING_ADMIN_VERIFICATION' || statusFilter === 'REJECTED') ? 9 : 8;

    // Filter Buttons Config
    const filterButtons = [
        { label: 'All Orders', status: 'All Status', count: totalAllOrders },
        { label: 'Pending Approval', status: 'PENDING_ADMIN_VERIFICATION', count: pendingAdminApprovalCount },
        { label: 'Approved/Paid', status: 'PAID', count: paidCount },
        { label: 'Rejected', status: 'REJECTED', count: rejectedCount },
        { label: 'Payment Due', status: 'PENDING_PAYMENT', count: paymentDueCount },
        { label: 'Coins Redeemed', status: 'COINS_REDEEMED', count: coinsRedeemedCount },
    ];

    return (
        <div className="p-8">
            {/* New Header: Order Management Left, Date/Search Right */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-xl font-bold m-0 text-slate-800">Order Management</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                        type="date"
                        className="h-[38px] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 outline-none transition-all duration-200 w-full sm:w-auto"
                        style={{ maxWidth: '160px' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Mobile..."
                        className="h-[38px] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 outline-none transition-all duration-200 w-full sm:w-[250px]"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Pill Filters */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                {filterButtons.map((btn) => (
                    <button
                        key={btn.status}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[13px] font-semibold cursor-pointer transition-all ${statusFilter === btn.status
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        onClick={() => handleStatusFilterChange(btn.status)}
                    >
                        <span>{btn.label}</span>
                        <span className={`px-2 py-0.5 rounded-xl text-[11px] ${statusFilter === btn.status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {btn.count !== undefined ? btn.count : '-'}
                        </span>
                    </button>
                ))}
            </div>

            {
                ordersError && (
                    <div className="mb-3 text-red-600 font-medium text-sm">{ordersError}</div>
                )
            }

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">S.No</th>

                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">User Details</th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Order Details</th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Units</th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Status</th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left" style={{ minWidth: '140px' }}>
                                <select
                                    value={paymentTypeFilter}
                                    onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                    className="bg-white text-slate-600 border border-slate-300 rounded-md px-2 py-1 font-semibold text-[11px] h-[35px] outline-none cursor-pointer w-full text-center hover:border-slate-400 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="All Payments">Payment Type</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="ONLINE">Online/UPI</option>
                                    <option value="CASH">Cash</option>
                                </select>
                            </th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left min-w-[200px]">Payment Image Proof</th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Amount</th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Total Cost</th>
                            <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Coins Redeemed</th>
                            {statusFilter === 'PENDING_ADMIN_VERIFICATION' && <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Actions</th>}
                            {statusFilter === 'REJECTED' && <th className="uppercase text-[11px] font-bold text-slate-400 tracking-wider px-6 py-4 text-left">Rejected Reason</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {ordersLoading ? (
                            <TableSkeleton cols={currentCols + 2} rows={10} />
                        ) : pendingUnits.length === 0 ? (
                            <tr>
                                <td colSpan={currentCols + 2} className="text-center text-slate-400 py-12 text-sm">
                                    No orders found matching filters.
                                </td>
                            </tr>
                        ) : (
                            pendingUnits.map((entry: any, index: number) => {
                                const unit = entry.order || {};
                                const tx = entry.transaction || {};
                                const inv = entry.investor || {};
                                const serialNumber = (page - 1) * pageSize + index + 1;

                                // Expandable only if PAID/Approved
                                const isExpandable = (unit.paymentStatus === 'PAID' || unit.paymentStatus === 'Approved') && statusFilter === 'PAID';

                                return (
                                    <React.Fragment key={`${unit.id || 'order'}-${index}`}>
                                        <tr
                                            onClick={() => navigate(`/orders/${encodeURIComponent(unit.id)}`)}
                                            style={{ cursor: 'pointer' }}
                                            className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{serialNumber}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                                        <User size={18} className="text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-800">{inv.name}</span>
                                                        <span className="text-xs text-slate-500 font-medium">
                                                            {inv.mobile ? `+91 ${String(inv.mobile)}` : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top text-left">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (isExpandable) {
                                                                handleToggleExpansion(unit.id);
                                                            } else {
                                                                navigate(`/orders/${encodeURIComponent(unit.id)}`);
                                                            }
                                                        }}
                                                        className={`text-[13px] font-bold p-0 text-left bg-transparent border-none ${isExpandable ? 'text-blue-600 underline cursor-pointer' : 'text-slate-700 cursor-pointer'}`}
                                                    >
                                                        {unit.id}
                                                    </button>
                                                    {unit.placedAt ? (
                                                        <span className="text-[11px] text-slate-500">
                                                            {new Date(unit.placedAt).toLocaleDateString('en-GB')} • {new Date(unit.placedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                    ) : <span className="text-[11px] text-slate-500">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{unit.numUnits}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top align-middle">
                                                {(() => {
                                                    let statusClasses = 'bg-slate-100 text-slate-600 border-slate-200';
                                                    let label = unit.paymentStatus || '-';

                                                    if (unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION') {
                                                        statusClasses = 'bg-amber-50 text-amber-700 border-amber-200';
                                                        label = 'Admin Approval';
                                                    } else if (unit.paymentStatus === 'PAID' || unit.paymentStatus === 'Approved') {
                                                        statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                        label = 'Paid';
                                                    } else if (unit.paymentStatus === 'REJECTED') {
                                                        statusClasses = 'bg-red-50 text-red-700 border-red-200';
                                                        label = 'Rejected';
                                                    } else if (unit.paymentStatus === 'PENDING_PAYMENT') {
                                                        statusClasses = 'bg-slate-100 text-slate-600 border-slate-200';
                                                        label = 'Payment Due';
                                                    }

                                                    return (
                                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap border ${statusClasses}`}>
                                                            {label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top relative">
                                                {tx.paymentType === 'BANK_TRANSFER' || tx.paymentType === 'CHEQUE' ? (
                                                    <div
                                                        className="cursor-pointer text-blue-600 font-semibold relative inline-block"
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const viewportHeight = window.innerHeight;
                                                            let top = rect.top + (rect.height / 2);
                                                            if (top + 125 > viewportHeight) top = viewportHeight - 140;
                                                            if (top - 125 < 0) top = 140;

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
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">
                                                {tx.paymentType ? (
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline bg-transparent border-none p-0 cursor-pointer"
                                                        onClick={(e) => { e.stopPropagation(); handleViewProof(tx, inv); }}
                                                    >
                                                        Payment Proof
                                                    </button>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{tx.amount ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : '-'}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{unit.totalCost != null ? `₹${unit.totalCost.toLocaleString('en-IN')}` : '-'}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{unit.coinsRedeemed != null ? unit.coinsRedeemed.toLocaleString('en-IN') : '0'}</td>
                                            {statusFilter === 'REJECTED' && <td className="px-6 py-4 text-[13px] text-slate-700 align-top">
                                                {unit.rejectedReason || 'No reason provided'}
                                            </td>}
                                            {statusFilter === 'PENDING_ADMIN_VERIFICATION' && <td className="px-6 py-4 text-[13px] text-slate-700 align-top">
                                                <div className="flex gap-2 items-center">
                                                    {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleApproveWrapper(unit.id); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-sm border-none cursor-pointer flex items-center justify-center min-w-[80px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            disabled={actionLoading}
                                                        >
                                                            {processingAction?.id === unit.id && processingAction?.type === 'approve' ? 'Approving...' : 'Approve'}
                                                        </button>
                                                    )}
                                                    {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRejectWrapper(unit.id); }}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-sm border-none cursor-pointer flex items-center justify-center min-w-[80px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            disabled={actionLoading}
                                                        >
                                                            {processingAction?.id === unit.id && processingAction?.type === 'reject' ? 'Rejecting...' : 'Reject'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>}
                                        </tr>

                                        {expandedOrderId === unit.id && (
                                            <tr className="bg-slate-50">
                                                <td colSpan={currentCols + 2} className="p-6">
                                                    <TrackingTab
                                                        orderId={unit.id}
                                                        expandedTrackerKeys={expandedTrackerKeys}
                                                        setExpandedTrackerKeys={setExpandedTrackerKeys}
                                                    />
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
                    dispatch(setPage(p));
                    setSearchParams(prevParams => {
                        const newParams = new URLSearchParams(prevParams);
                        newParams.set('page', String(p));
                        return newParams;
                    });
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
            {
                tooltipInfo && (() => {
                    const { tx, top, left } = tooltipInfo;
                    const isCheque = tx.paymentType === 'CHEQUE';
                    return (
                        <div
                            className="fixed z-[9999] bg-slate-900 border border-slate-800 rounded-xl p-4 w-[280px] shadow-2xl transition-opacity duration-300"
                            style={{
                                top: top,
                                left: left,
                                transform: 'translateY(-50%)',
                            }}
                            onMouseEnter={() => { }}
                            onMouseLeave={() => setTooltipInfo(null)}
                        >
                            <div className="absolute top-1/2 right-full -mt-2 border-8 border-transparent border-r-slate-900"></div>
                            <div className="text-[13px] font-bold text-slate-50 mb-3 pb-2 border-b border-slate-700">Payment Details</div>
                            <div className="flex justify-between gap-3 mb-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Bank Name:</span>
                                <span className="text-[11px] font-semibold text-slate-100 text-right break-all">{findVal(tx, ['bank_name', 'bankName', 'bank_details'], ['bank'])}</span>
                            </div>
                            <div className="flex justify-between gap-3 mb-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{isCheque ? 'Cheque No:' : 'A/C Number:'}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                    <span className="text-[11px] font-semibold text-slate-100 text-right break-all">
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
                            <div className="flex justify-between gap-3 mb-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{isCheque ? 'Cheque Date:' : 'UTR:'}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                    <span className="text-[11px] font-semibold text-slate-100 text-right break-all">
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
                                <div className="flex justify-between gap-3 mb-1.5">
                                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">IFSC:</span>
                                    <span className="text-[11px] font-semibold text-slate-100 text-right break-all">{findVal(tx, ['ifsc_code', 'ifsc', 'ifscCode'], ['ifsc'])}</span>
                                </div>
                            )}
                            {tx.transferMode && (
                                <div className="flex justify-between gap-3 mb-0">
                                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Mode:</span>
                                    <span className="text-[11px] font-semibold text-slate-100 text-right break-all">{tx.transferMode}</span>
                                </div>
                            )}
                        </div>
                    );
                })()
            }
            {/* Render Inlined Modals */}
            <ApprovalModal />
            <RejectionModal />
        </div >
    );
};


const ApprovalModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isOpen, unitId } = useAppSelector((state: RootState) => state.ui.modals.approval);
    // Use fallback for adminMobile
    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');
    // Safely access potentially undefined state slices
    const { adminProfile, adminRole } = useAppSelector((state: RootState) => ({
        adminProfile: state.users?.adminProfile,
        adminRole: state.auth?.adminRole
    }));

    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived Name Logic
    const realName = React.useMemo(() => {
        if (adminProfile) {
            const { first_name, last_name, name } = adminProfile;
            if (first_name || last_name) {
                return `${first_name || ''} ${last_name || ''}`.trim();
            }
            if (name) return name;
        }
        return 'Admin';
    }, [adminProfile]);

    const onClose = () => {
        if (isSubmitting) return;
        dispatch(setApprovalModal({ isOpen: false, unitId: null }));
        setComment('');
    };

    const handleApprove = async () => {
        if (!unitId) return;

        setIsSubmitting(true);
        try {
            await dispatch(approveOrder({
                unitId: String(unitId), // Ensure string
                adminMobile,
                comments: comment,
            })).unwrap();

            dispatch(setSnackbar({ message: 'Order approved successfully!', type: 'success' }));
            onClose(); // Use onClose to reset/close
        } catch (error) {
            console.error('Error approving order:', error);
            dispatch(setSnackbar({ message: 'Failed to approve order.', type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]" onClick={onClose}>
            <div
                className="bg-white w-[90%] max-w-[500px] rounded-xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 pt-6">
                    <h3 className="m-0 mb-2 text-xl font-semibold text-slate-900">Approve Order</h3>
                    <p className="m-0 text-sm text-slate-500 leading-snug">Are you sure you want to approve this order?</p>
                </div>

                <div className="p-6 text-slate-600">
                    <div className="mb-5">
                        <div className="text-[13px] font-medium text-slate-500 mb-2">Approved By:</div>
                        <div className="mb-4">
                            <div className="text-base font-bold text-slate-900 mb-0.5">{realName}</div>
                            <div className="text-sm text-slate-500 mb-0.5">{adminMobile}</div>
                            <div className="text-[13px] font-medium text-slate-600 capitalize">{adminRole || 'Admin'}</div>
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-[13px] font-semibold mb-2 text-slate-500">
                            Comment
                        </label>
                        <textarea
                            className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 text-sm outline-none resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Enter approval comment (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all bg-emerald-500 border border-transparent text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleApprove}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Approving...' : 'Approve Order'}
                    </button>
                </div>
            </div>
        </div >
    );
};

const RejectionModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isOpen, unitId } = useAppSelector((state: RootState) => state.ui.modals.rejection);
    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');
    // Safely access potentially undefined state slices
    const { adminProfile } = useAppSelector((state: RootState) => ({
        adminProfile: state.users?.adminProfile
    }));

    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived Name Logic
    const realName = React.useMemo(() => {
        if (adminProfile) {
            const { first_name, last_name, name } = adminProfile;
            if (first_name || last_name) {
                return `${first_name || ''} ${last_name || ''}`.trim();
            }
            if (name) return name;
        }
        return 'Admin';
    }, [adminProfile]);

    // Reset reason when modal opens
    useEffect(() => {
        if (isOpen) {
            setReason('');
        }
    }, [isOpen]);

    const onClose = () => {
        if (isSubmitting) return;
        dispatch(setRejectionModal({ isOpen: false, unitId: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedReason = reason.trim();

        if (!trimmedReason || !unitId) return;

        setIsSubmitting(true);
        try {
            await dispatch(rejectOrder({
                unitId: String(unitId),
                adminMobile,
                comments: trimmedReason
            })).unwrap();

            dispatch(setSnackbar({ message: 'Order rejected successfully!', type: 'error' }));
            onClose();
        } catch (error) {
            console.error('Error rejecting order:', error);
            dispatch(setSnackbar({ message: 'Failed to reject order.', type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]" onClick={onClose}>
            <div
                className="bg-white w-[90%] max-w-[500px] rounded-xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 pt-6 mb-4">
                    <h3 className="m-0 mb-2 text-xl font-semibold text-slate-900">Reject Order</h3>
                    <p className="m-0 text-sm text-slate-500 leading-snug">Please provide a reason for rejecting this order.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 mb-2">
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 text-sm outline-none resize-y focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all font-medium text-slate-700"
                            placeholder="Reason for rejection (required)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all bg-red-600 border border-transparent text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            disabled={isSubmitting || !reason.trim()}
                        >
                            {isSubmitting ? 'Rejecting...' : 'Reject Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrdersTab;
