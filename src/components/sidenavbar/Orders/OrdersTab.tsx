import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import type { RootState } from '../../../store';
import { Check, Copy, User, X, AlertCircle, ChevronDown } from 'lucide-react';
import {
    setSearchQuery,
    setPaymentFilter,
    setStatusFilter,
    setTransferModeFilter,
    setPage,
    setAllFilters,
    fetchPendingUnits,
    setExpandedOrderId,
    setActiveUnitIndex,
    approveOrder,
    rejectOrder,
    setFarmFilter,
} from '../../../store/slices/ordersSlice';
import { setProofModal, setApprovalModal, setSnackbar, setApprovalHistoryModal } from '../../../store/slices/uiSlice';
import Pagination from '../../common/Pagination';
import { farmService } from '../../../services/api';
import type { Farm } from '../../../types';

import TableSkeleton from '../../common/TableSkeleton';
import TrackingTab from './TrackingTab';
import ApprovalHistoryModal from './ApprovalHistoryModal';
import OrderDetailsPage from './OrderDetailsPage';

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

const OrdersTab: React.FC = () => {
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
        pendingSuperAdminApprovalCount,
        pendingSuperAdminRejectionCount,
        paidCount,
        rejectedCount,
        paymentDueCount,
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
        farmFilter,
        page,
        pageSize
    } = filters;

    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');
    const authRole = useAppSelector((state: RootState) => state.auth.adminRole);
    const adminProfile = useAppSelector((state: RootState) => state.users.adminProfile);

    const effectiveRole = adminProfile?.role || authRole;
    const userRoles = effectiveRole ? effectiveRole.split(',').map((r: string) => r.trim()) : [];
    const isSuperAdmin = userRoles.includes('SuperAdmin');
    const isAdmin = userRoles.some((r: string) => r === 'Admin' || r === 'Animalkart admin');

    // Farm State
    const [farms, setFarms] = useState<Farm[]>([]);
    const [farmsLoading, setFarmsLoading] = useState(false);

    useEffect(() => {
        const fetchFarms = async () => {
            setFarmsLoading(true);
            try {
                const data = await farmService.getFarms('ACTIVE');
                setFarms(data);
            } catch (error) {
                console.error('Error fetching farms:', error);
            } finally {
                setFarmsLoading(false);
            }
        };
        fetchFarms();
    }, []);







    // Debounce Search
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => localStorage.getItem('selectedOrderId'));
    const [expandedTrackerKeys, setExpandedTrackerKeys] = useState<Record<string, boolean>>({});

    const handleApproveWrapper = (id: string) => {
        dispatch(setApprovalModal({ isOpen: true, unitId: id }));
    };

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const fetchFn = () => {
            dispatch(fetchPendingUnits({
                adminMobile,
                page,
                pageSize,
                paymentStatus: statusFilter,
                paymentType: paymentTypeFilter,
                transferMode: transferModeFilter,
                search: localSearch,
                farmId: farmFilter
            }));

            if (localSearch !== searchQuery) {
                dispatch(setSearchQuery(localSearch));
            }
        };

        // Immediate fetch for non-search changes, debounced for search
        if (localSearch === searchQuery) {
            fetchFn();
        } else {
            const timer = setTimeout(fetchFn, 500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localSearch, dispatch, searchQuery, adminMobile, pageSize, statusFilter, paymentTypeFilter, transferModeFilter, page, farmFilter]);

    useEffect(() => {
        localStorage.setItem('orders_searchQuery', searchQuery);
        localStorage.setItem('orders_paymentTypeFilter', paymentTypeFilter);
        localStorage.setItem('orders_statusFilter', statusFilter);
        localStorage.setItem('orders_transferModeFilter', transferModeFilter);
        localStorage.setItem('orders_farmFilter', farmFilter);
        localStorage.setItem('orders_page', String(page));
        if (selectedOrderId) {
            localStorage.setItem('selectedOrderId', selectedOrderId);
        } else {
            localStorage.removeItem('selectedOrderId');
        }
    }, [searchQuery, paymentTypeFilter, statusFilter, transferModeFilter, page, farmFilter, selectedOrderId]);

    const handleStatusFilterChange = (status: string) => {
        dispatch(setStatusFilter(status));
        dispatch(setPage(1));
    };

    const handlePaymentTypeChange = (type: string) => {
        dispatch(setPaymentFilter(type));
        dispatch(setPage(1));
    };

    const handleFarmChange = (farmId: string) => {
        dispatch(setFarmFilter(farmId));
        dispatch(setPage(1));
    };



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

    // Column visibility logic
    const showActions = (statusFilter === 'PENDING_ADMIN_VERIFICATION' && isAdmin) ||
        ((statusFilter === 'PENDING_SUPER_ADMIN_VERIFICATION' || statusFilter === 'PENDING_SUPER_ADMIN_REJECTION') && isSuperAdmin);

    // Pagination
    const totalPages = Math.ceil((totalCount || 0) / pageSize);
    const currentCols = (showActions || statusFilter === 'REJECTED') ? 10 : (statusFilter === 'PAID' ? 10 : 8); // Consolidated approval details in PAID tab

    // Filter Buttons Config
    const filterButtons = [
        { label: 'All Orders', status: 'All Status', count: totalAllOrders },
        { label: 'Pending Admin Approval', status: 'PENDING_ADMIN_VERIFICATION', count: pendingAdminApprovalCount },
        { label: 'S.Admin Approval', status: 'PENDING_SUPER_ADMIN_VERIFICATION', count: pendingSuperAdminApprovalCount },
        { label: 'S.Admin Rejection', status: 'PENDING_SUPER_ADMIN_REJECTION', count: pendingSuperAdminRejectionCount },
        { label: 'Approved/Paid', status: 'PAID', count: paidCount },
        { label: 'Rejected', status: 'REJECTED', count: rejectedCount },
        { label: 'Payment Due', status: 'PENDING_PAYMENT', count: paymentDueCount },
    ];

    if (selectedOrderId) {
        return <OrderDetailsPage orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
    }

    return (
        <div className="w-full h-full">
            {/* New Header: Order Management Left, Filters Right */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold m-0 text-slate-800 shrink-0">Order Management</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto relative z-20">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-[250px]">
                        <input
                            type="text"
                            placeholder="Search by Order ID, Mobile"
                            className="h-[38px] px-3 py-2 pr-8 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 outline-none transition-all duration-200 w-full"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                        {localSearch && (
                            <button
                                onClick={() => setLocalSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="group relative inline-block text-left w-full sm:w-auto">
                        <button
                            type="button"
                            className="inline-flex justify-between items-center w-full sm:w-[240px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all h-[38px]"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="truncate">
                                    {filterButtons.find(b => b.status === statusFilter)?.label || 'Filter Status'}
                                </span>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0">
                                    {filterButtons.find(b => b.status === statusFilter)?.count ?? 0}
                                </span>
                            </div>
                            <ChevronDown size={16} className="ml-2 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                        </button>

                        {/* Dropdown menu */}
                        <div className="absolute left-0 top-full mt-2 w-[240px] bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left overflow-hidden z-50">
                            <div className="py-1.5">
                                {filterButtons.map((btn) => (
                                    <button
                                        key={btn.status}
                                        onClick={() => handleStatusFilterChange(btn.status)}
                                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left transition-colors ${statusFilter === btn.status
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <span>{btn.label}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${statusFilter === btn.status ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {btn.count !== undefined ? btn.count : '-'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Farm Filter */}
                    <select
                        className="h-[38px] px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 outline-none transition-all duration-200 w-full sm:w-[180px] cursor-pointer"
                        value={farmFilter}
                        onChange={(e) => handleFarmChange(e.target.value)}
                        disabled={farmsLoading}
                    >
                        <option value="All Farms">All Farms</option>
                        {farms.map(farm => (
                            <option key={farm.id} value={farm.id}>{farm.location}</option>
                        ))}
                    </select>
                </div>
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
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">S.No</th>

                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">User Details</th>
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Order Details</th>
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center text-nowrap">Delivery Location</th>
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Units</th>
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Status</th>
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-2 py-4 text-center" style={{ minWidth: '160px' }}>
                                <select
                                    value={paymentTypeFilter}
                                    onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                    className="bg-white text-slate-700 border border-slate-300 rounded-md px-2 py-1 font-extrabold text-[12px] h-[35px] outline-none cursor-pointer w-full text-center hover:border-slate-400 transition-colors uppercase"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="All Payments">Payment Type</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="ONLINE">Online/UPI</option>
                                    <option value="CASH_PAYMENT">Cash Payment / Counter</option>
                                    <option value="CASH">Cash</option>
                                    <option value="COINS_REDEEM">Coins Redeem</option>
                                </select>
                            </th>

                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Amount</th>
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Total Cost</th>
                            <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Coins Redeemed</th>
                            {showActions && <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Actions</th>}
                            {statusFilter === 'REJECTED' && <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Rejected Reason</th>}
                            {statusFilter === 'PAID' && (
                                <th className="uppercase text-[12px] font-extrabold text-slate-700 tracking-wider px-6 py-4 text-center">Approved Details</th>
                            )}
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
                                // Flatten nested transaction object if present
                                const rawTx = entry.transaction || {};
                                const tx = { ...rawTx, ...(rawTx.transaction || {}) };
                                const inv = entry.investor || {};
                                const serialNumber = (page - 1) * pageSize + index + 1;

                                // Expandable only if PAID/Approved
                                const isExpandable = (unit.paymentStatus === 'PAID' || unit.paymentStatus === 'Approved') && statusFilter === 'PAID';

                                return (
                                    <React.Fragment key={`${unit.id || 'order'}-${index}`}>
                                        <tr
                                            onClick={() => setSelectedOrderId(unit.id)}
                                            style={{ cursor: 'pointer' }}
                                            className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top text-center">{serialNumber}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-middle text-left">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                                        <User size={14} className="text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-semibold text-slate-800 whitespace-nowrap">{inv.name}</span>
                                                        <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
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
                                                                setSelectedOrderId(unit.id);
                                                            }
                                                        }}
                                                        className={`text-[13px] font-bold p-0 text-left bg-transparent border-none ${isExpandable ? 'text-blue-600 underline cursor-pointer' : 'text-slate-700 cursor-pointer'}`}
                                                    >
                                                        {unit.id}
                                                    </button>
                                                    {unit.placedAt ? (
                                                        <span className="text-[11px] text-slate-500">
                                                            {new Date(unit.placedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(unit.placedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </span>
                                                    ) : <span className="text-[11px] text-slate-500">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top text-center font-medium capitalize">
                                                {unit.location || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{unit.numUnits}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top align-middle">
                                                {(() => {
                                                    let statusClasses = 'bg-slate-100 text-slate-600 border-slate-200';
                                                    let label = unit.paymentStatus || '-';

                                                    if (unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION') {
                                                        statusClasses = 'bg-amber-50 text-amber-700 border-amber-200';
                                                        label = 'Pending Admin Approval';
                                                    } else if (unit.paymentStatus === 'PENDING_SUPER_ADMIN_VERIFICATION') {
                                                        statusClasses = 'bg-purple-50 text-purple-700 border-purple-200';
                                                        label = 'Super Admin Approval';
                                                    } else if (unit.paymentStatus === 'PENDING_SUPER_ADMIN_REJECTION') {
                                                        statusClasses = 'bg-orange-50 text-orange-700 border-orange-200';
                                                        label = 'S.Admin Rejection';
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
                                                {tx.paymentType === 'BANK_TRANSFER' ? 'Bank Transfer' :
                                                    tx.paymentType === 'CHEQUE' ? 'Cheque' :
                                                        tx.paymentType === 'ONLINE' ? 'Online/UPI' :
                                                            tx.paymentType === 'CASH_PAYMENT' ? 'Cash Payment' :
                                                                tx.paymentType === 'COINS_REDEEM' ? 'Coins Redeem' :
                                                                    tx.paymentType?.replace('_', ' ') || '-'}
                                            </td>

                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{tx.amount ? `₹${Number(tx.amount).toLocaleString('en-IN')}` : '-'}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{unit.totalCost != null ? `₹${unit.totalCost.toLocaleString('en-IN')}` : '-'}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-700 align-top">{unit.coinsRedeemed != null ? unit.coinsRedeemed.toLocaleString('en-IN') : '0'}</td>
                                            {showActions ? (
                                                <td className="px-6 py-4 text-[13px] text-slate-700 align-top">
                                                    <div className="flex gap-2 items-center">
                                                        {(unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' || unit.paymentStatus === 'PENDING_SUPER_ADMIN_VERIFICATION' || unit.paymentStatus === 'PENDING_SUPER_ADMIN_REJECTION') && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleApproveWrapper(unit.id); }}
                                                                className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm border-none cursor-pointer flex items-center justify-center min-w-[100px] 
                                                                    ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                                                    ${(unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && !isAdmin) || ((unit.paymentStatus === 'PENDING_SUPER_ADMIN_VERIFICATION' || unit.paymentStatus === 'PENDING_SUPER_ADMIN_REJECTION') && !isSuperAdmin)
                                                                        ? 'bg-slate-400 hover:bg-slate-400 cursor-not-allowed opacity-60'
                                                                        : 'bg-blue-600 hover:bg-blue-700'}`}
                                                                disabled={
                                                                    actionLoading ||
                                                                    (unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && !isAdmin && !isSuperAdmin) ||
                                                                    ((unit.paymentStatus === 'PENDING_SUPER_ADMIN_VERIFICATION' || unit.paymentStatus === 'PENDING_SUPER_ADMIN_REJECTION') && !isSuperAdmin)
                                                                }
                                                                title={
                                                                    (unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && !isAdmin && !isSuperAdmin) ? 'Only Admins can verify this stage' :
                                                                        ((unit.paymentStatus === 'PENDING_SUPER_ADMIN_VERIFICATION' || unit.paymentStatus === 'PENDING_SUPER_ADMIN_REJECTION') && !isSuperAdmin) ? 'Only Super Admins can verify this stage' : ''
                                                                }
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            ) : null}
                                            {statusFilter === 'REJECTED' && <td className="px-6 py-4 text-[13px] text-slate-700 align-top">
                                                {unit.rejectedReason || 'No reason provided'}
                                            </td>}
                                            {statusFilter === 'PAID' && (
                                                <td className="px-6 py-4 text-[13px] text-slate-700 align-middle text-center">
                                                    {(unit.history && unit.history.some((h: any) => h.action === 'APPROVE')) ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                dispatch(setApprovalHistoryModal({
                                                                    isOpen: true,
                                                                    history: unit.history,
                                                                    orderId: unit.id
                                                                }));
                                                            }}
                                                            className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100 cursor-pointer shadow-sm active:scale-95"
                                                        >
                                                            View Details
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">No details</span>
                                                    )}
                                                </td>
                                            )}
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
                }}
            />

            <ApprovalHistoryModal />

            {/* Render Inlined Modals */}
            <OrderVerificationModal />
        </div >
    );
};


const OrderVerificationModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isOpen, unitId } = useAppSelector((state: RootState) => state.ui.modals.approval);
    const { pendingUnits } = useAppSelector((state: RootState) => state.orders);

    // Auth & Profile Data
    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');
    const adminProfile = useAppSelector((state: RootState) => state.users?.adminProfile);
    const adminRole = useAppSelector((state: RootState) => state.auth?.adminRole);

    const effectiveRole = adminProfile?.role || adminRole;
    const userRoles = effectiveRole ? effectiveRole.split(',').map((r: string) => r.trim()) : [];
    const isSuperAdmin = userRoles.includes('SuperAdmin');

    const entry = useMemo(() => pendingUnits.find(e => e.order?.id === unitId), [pendingUnits, unitId]);
    const orderId = entry?.order?.id || unitId;
    // Flatten nested transaction object if present
    const rawTx = entry?.transaction || {};
    const tx = { ...rawTx, ...(rawTx.transaction || {}) };
    const inv = entry?.investor || {};

    // Unified Selection States (null = none, true = OK, false = Not OK)
    const [status, setStatus] = useState({
        units: null as boolean | null,
        proof: null as boolean | null,
        payment: null as boolean | null,
        coins: null as boolean | null
    });
    const [rejectionNotes, setRejectionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isBankTransfer = tx.paymentType === 'BANK_TRANSFER';
    const isCheque = tx.paymentType === 'CHEQUE';
    const isCoinsRedeem = tx.paymentType === 'Coins Redeem' || tx.paymentType === 'COINS_REDEEM';
    const hasCoins = (entry?.order?.coinsRedeemed || 0) > 0 || isCoinsRedeem;

    // Helper to find image URLs across possible key variations
    const frontImg = tx.chequeFrontImage || tx.frontImageUrl || tx.front_image_url || tx.frontImage || tx.cheque_front_image_url || null;
    const backImg = tx.chequeBackImage || tx.backImageUrl || tx.back_image_url || tx.backImage || tx.cheque_back_image_url || null;
    const proofImg = tx.voucher_image_url || tx.paymentScreenshotUrl || tx.payment_proof_Url || tx.proofImage || tx.paymentProof || tx.screenshot || null;

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setStatus({ units: null, proof: null, payment: null, coins: null });
            setRejectionNotes('');
        }
    }, [isOpen]);

    const isAllOk = isCoinsRedeem
        ? status.coins === true
        : status.units === true && status.proof === true && status.payment === true && (!hasCoins || status.coins === true);

    const isAnyNotOk = isCoinsRedeem
        ? status.coins === false
        : status.units === false || status.proof === false || status.payment === false || status.coins === false;

    // Super Admin can approve without toggling checks (review mode)
    const isReadyToApprove = isSuperAdmin || isAllOk;

    // Formatting date
    const formattedDate = useMemo(() => {
        if (!tx.createdAt) return 'N/A';
        return new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, [tx.createdAt]);

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
        setStatus({ units: null, proof: null, payment: null, coins: null });
        setRejectionNotes('');
    };

    const handleApprove = async () => {
        if (!unitId || (!isReadyToApprove && !isSuperAdmin)) return;

        setIsSubmitting(true);
        try {
            const payload: any = {
                unitId: String(unitId),
                adminMobile,
            };

            // Only add comments if they exist
            if (rejectionNotes.trim()) {
                payload.comments = rejectionNotes.trim();
            }

            // Conditionally add checks
            if (!isCoinsRedeem) {
                payload.unitsChecked = true;
                payload.paymentProof = true;
                payload.paymentReceived = true;
            }

            if (hasCoins) {
                payload.coinsChecked = true;
            }

            await dispatch(approveOrder(payload)).unwrap();

            dispatch(setSnackbar({ message: 'Order approved successfully!', type: 'success' }));
            onClose();
        } catch (error) {
            console.error('Error approving order:', error);
            dispatch(setSnackbar({ message: 'Failed to approve order.', type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!unitId || (!isAnyNotOk && !isSuperAdmin)) return;

        setIsSubmitting(true);
        try {
            const payload: any = {
                unitId: String(unitId),
                adminMobile,
            };

            // Only add comments if they exist
            if (rejectionNotes.trim()) {
                payload.comments = rejectionNotes.trim();
            }

            // Conditionally add checks based on their status
            // If status is null (unselected/irrelevant), we don't send it?
            // Or for rejection, we specifically want to send FALSE for the things that are wrong.
            // But the prompt says "coins not checked coins will not sent".
            // So we only send keys that have a definite true/false status relevant to the rejection?
            // Actually, for rejection, usually we want to say what failed.
            // If I mark Units as NOT OK, status.units is false.
            // If I leave Payment Proof as unselected (null), do I send it?
            // "coins not checked coins will not sent" implies omitting undefined/nulls.

            if (!isCoinsRedeem) {
                if (status.units !== null) payload.unitsChecked = status.units;
                if (status.proof !== null) payload.paymentProof = status.proof;
                if (status.payment !== null) payload.paymentReceived = status.payment;
            }

            if (hasCoins) {
                if (status.coins !== null) payload.coinsChecked = status.coins;
            }

            await dispatch(rejectOrder(payload)).unwrap();

            dispatch(setSnackbar({ message: 'Order rejected successfully!', type: 'success' }));
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
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1100]" onClick={onClose}>
            <div
                className="bg-white w-[95%] max-w-[540px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                        <h3 className="m-0 text-[14px] font-bold text-slate-800 tracking-tight">Order Verification</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-200/50 rounded-full transition-all bg-transparent border-none cursor-pointer group"
                    >
                        <X className="text-slate-400 group-hover:text-slate-600" size={16} />
                    </button>
                </div>

                <div className="flex flex-col max-h-[420px]">
                    <div className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {/* Order Summary */}
                        <div className="space-y-2">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                Summary
                            </div>
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className={`grid ${isSuperAdmin ? 'grid-cols-[1.4fr_0.9fr_0.7fr_1fr_1fr]' : 'grid-cols-4'} divide-x divide-slate-100`}>
                                    <div className="p-2 bg-slate-50/30">
                                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Order ID</div>
                                        <div className="flex items-center gap-1">
                                            <div className="text-[9px] font-bold text-slate-700 whitespace-nowrap">{orderId}</div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(orderId);
                                                    dispatch(setSnackbar({ message: 'Order ID copied!', type: 'success' }));
                                                }}
                                                className="p-0.5 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                                                title="Copy ID"
                                            >
                                                <Copy size={8} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Date</div>
                                        <div className="text-[9px] font-bold text-slate-700 whitespace-nowrap">{formattedDate}</div>
                                    </div>
                                    {isSuperAdmin && (
                                        <div className="p-2 bg-slate-50/30">
                                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Units</div>
                                            <div className="text-[9px] font-bold text-emerald-600">{entry?.order?.numUnits || '0'}</div>
                                        </div>
                                    )}
                                    <div className={`p-2 ${!isSuperAdmin ? 'bg-slate-50/30' : ''}`}>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Amount</div>
                                        <div className="text-[9px] font-bold text-blue-600 whitespace-nowrap">₹{tx.amount?.toLocaleString('en-IN') || '0.00'}</div>
                                    </div>
                                    <div className={`p-2 ${isSuperAdmin ? 'bg-slate-50/30' : ''}`}>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Type</div>
                                        <div className="text-[9px] font-bold text-slate-700 truncate capitalize">{tx.paymentType?.replace('_', ' ').toLowerCase() || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prev Admin approval with Checks */}
                        {entry?.order?.history && entry.order.history.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                    Previous Approval Details
                                </div>
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/20 p-3 space-y-2">
                                    {entry.order.history.map((h: any, i: number) => {
                                        const isReject = h.action === 'REJECT';
                                        const roleLabel = h.role === 'SuperAdmin' ? 'S.Admin' : h.role;
                                        const actionLabel = isReject ? 'Rejection' : 'Approval';
                                        const name = isReject ? h.rejectedByName : h.approvedByName;
                                        const date = isReject ? h.rejectedAt : h.approvedAt;

                                        return (
                                            <div key={i} className="text-[11px] text-slate-600 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                                <div className="flex justify-between font-bold text-slate-700 mb-1">
                                                    <span>{roleLabel} {actionLabel} - {name || 'Admin'}</span>
                                                    <span>{date}</span>
                                                </div>
                                                {h.checks && (
                                                    <div className="grid grid-cols-2 gap-2 mb-2 bg-white/50 p-2 rounded-lg border border-slate-100">
                                                        {h.checks.unitsChecked !== undefined && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${h.checks.unitsChecked ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {h.checks.unitsChecked ? <Check size={8} strokeWidth={4} /> : <X size={8} strokeWidth={4} />}
                                                                </div>
                                                                <span className="text-[10px] font-medium text-slate-600">Units Verified</span>
                                                            </div>
                                                        )}
                                                        {h.checks.paymentProof !== undefined && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${h.checks.paymentProof ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {h.checks.paymentProof ? <Check size={8} strokeWidth={4} /> : <X size={8} strokeWidth={4} />}
                                                                </div>
                                                                <span className="text-[10px] font-medium text-slate-600">Proof Verified</span>
                                                            </div>
                                                        )}
                                                        {h.checks.paymentReceived !== undefined && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${h.checks.paymentReceived ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {h.checks.paymentReceived ? <Check size={8} strokeWidth={4} /> : <X size={8} strokeWidth={4} />}
                                                                </div>
                                                                <span className="text-[10px] font-medium text-slate-600">Payment Verified</span>
                                                            </div>
                                                        )}
                                                        {h.checks.coinsChecked !== undefined && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${h.checks.coinsChecked ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {h.checks.coinsChecked ? <Check size={8} strokeWidth={4} /> : <X size={8} strokeWidth={4} />}
                                                                </div>
                                                                <span className="text-[10px] font-medium text-slate-600">Coins Verified</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {h.comments && <div className="mt-0.5 italic text-slate-500"><span className="font-bold not-italic text-slate-600 mr-1">Remarks:</span>"{h.comments}"</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Interactive Sections - Unified for both Admin and SuperAdmin */}
                        <>
                            {/* Section: Units */}
                            {!isCoinsRedeem && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                            Units
                                        </div>
                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 shadow-inner">
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, units: true }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.units === true ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, units: false }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.units === false ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                NOT OK
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-sm flex items-center gap-3">
                                        <div className="flex flex-col gap-0.5 px-1 py-0.5">
                                            <span className="text-[10px] font-bold text-slate-700">Total Units</span>
                                            <span className="text-[12px] font-bold text-blue-600">{entry?.order?.numUnits || '0'} Units</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Details */}
                            {!isCoinsRedeem && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                            {isBankTransfer ? 'Bank Details' : isCheque ? 'Cheque Details' : 'Payment Details'}
                                        </div>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                                            <div className="p-2">
                                                <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">
                                                    {isCheque ? 'Cheque Number' : tx.paymentType === 'CASH' ? 'Cashier Name' : 'UTR / TX ID'}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-700 truncate">
                                                    {isCheque
                                                        ? findVal(tx, ['cheque_no', 'cheque_number', 'chequeNo', 'utrNumber'], ['cheque', 'utr'])
                                                        : findVal(tx, ['cashier_name', 'utrNumber', 'utr', 'utr_no', 'utr_number', 'transaction_id'], ['utr', 'txid']) || '-'}
                                                </div>
                                            </div>
                                            <div className="p-2 bg-slate-50/30">
                                                <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">
                                                    {isCheque ? 'Cheque Date' : tx.paymentType === 'CASH' ? 'Cash Payment Date' : 'Transaction Date'}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-700 truncate">
                                                    {isCheque
                                                        ? findVal(tx, ['cheque_date', 'chequeDate', 'date'], ['date'])
                                                        : findVal(tx, ['cash_payment_date', 'transactionDate', 'paymentDate'], ['date']) || '-'}
                                                </div>
                                            </div>
                                            {tx.paymentType === 'CASH' && tx.cashier_phone && (
                                                <div className="p-2 bg-slate-50/30 border-t border-slate-100 col-span-2">
                                                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Cashier Phone</div>
                                                    <div className="text-[10px] font-bold text-slate-700 truncate">{tx.cashier_phone}</div>
                                                </div>
                                            )}
                                            {isBankTransfer && (
                                                <div className="p-2 bg-slate-50/30 border-t border-slate-100 col-span-2">
                                                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Transfer Mode</div>
                                                    <div className="text-[10px] font-bold text-slate-700 truncate">{tx.transferMode || '-'}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Payment Proof */}
                            {!isCoinsRedeem && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                            Payment Proof
                                        </div>
                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 shadow-inner">
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, proof: true }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.proof === true ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, proof: false }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.proof === false ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                NOT OK
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-sm flex items-center gap-3 overflow-x-auto">
                                        {isCheque ? (
                                            <>
                                                {/* Cheque Front */}
                                                <div className="flex flex-col gap-0.5 shrink-0">
                                                    <button
                                                        onClick={() => dispatch(setProofModal({ isOpen: true, data: { ...tx, directUrl: frontImg, name: inv.name } }))}
                                                        className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm relative group p-0 cursor-pointer"
                                                    >
                                                        {frontImg ? (
                                                            <>
                                                                <img src={frontImg} alt="Front" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                                                                        <div className="w-2 h-2 border-t border-r border-slate-600 rotate-45"></div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[7px] text-slate-400 font-bold uppercase text-center leading-tight p-1">No Front</div>
                                                        )}
                                                    </button>
                                                    <span className="text-[9px] font-bold text-slate-500 text-center">Front</span>
                                                </div>

                                                {/* Cheque Back */}
                                                <div className="flex flex-col gap-0.5 shrink-0">
                                                    <button
                                                        onClick={() => dispatch(setProofModal({ isOpen: true, data: { ...tx, directUrl: backImg, name: inv.name } }))}
                                                        className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm relative group p-0 cursor-pointer"
                                                    >
                                                        {backImg ? (
                                                            <>
                                                                <img src={backImg} alt="Back" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                                                                        <div className="w-2 h-2 border-t border-r border-slate-600 rotate-45"></div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[7px] text-slate-400 font-bold uppercase text-center leading-tight p-1">No Back</div>
                                                        )}
                                                    </button>
                                                    <span className="text-[9px] font-bold text-slate-500 text-center">Back</span>
                                                </div>
                                            </>
                                        ) : (
                                            /* Standard Payment Proof */
                                            <button
                                                onClick={() => dispatch(setProofModal({ isOpen: true, data: { ...tx, directUrl: proofImg, name: inv.name } }))}
                                                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm relative group p-0 cursor-pointer"
                                            >
                                                {proofImg ? (
                                                    <>
                                                        <img src={proofImg} alt="Proof" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                            <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                                                                <div className="w-2 h-2 border-t border-r border-slate-600 rotate-45"></div>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[7px] text-slate-400 font-bold uppercase">No Image</div>
                                                )}
                                            </button>
                                        )}

                                        <div className="flex flex-col gap-0.5 ml-1">
                                            <span className="text-[10px] text-slate-500 font-bold italic">Click on image to view full size</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Payment Received */}
                            {!isCoinsRedeem && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                            Payment Received
                                        </div>
                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 shadow-inner">
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, payment: true }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.payment === true ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, payment: false }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.payment === false ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                NOT OK
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                        <span className="text-[10px] font-semibold text-emerald-800 leading-relaxed">
                                            Payment amount successfully credited to our bank account.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Section: Coins Checked */}
                            {hasCoins && (
                                <div className="space-y-3 pt-3 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                            Coins Redemption
                                        </div>
                                        <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 shadow-inner">
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, coins: true }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.coins === true ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setStatus(s => ({ ...s, coins: false }))}
                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all border-none cursor-pointer ${status.coins === false ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                NOT OK
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-sm flex items-center gap-3">
                                        <div className="flex flex-col gap-0.5 px-1 py-0.5">
                                            <span className="text-[10px] font-bold text-slate-700">Coins Redeemed</span>
                                            <span className="text-[12px] font-bold text-blue-600">{entry?.order?.coinsRedeemed?.toLocaleString() || '0'} Coins</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>


                        {/* Overall Reason */}
                        <div className="space-y-2 pt-0.5">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                Remarks
                            </div>
                            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                                <textarea
                                    className="w-full min-h-[48px] p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 outline-none resize-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/50 placeholder:text-slate-400"
                                    placeholder="Order feedback..."
                                    value={rejectionNotes}
                                    onChange={(e) => setRejectionNotes(e.target.value)}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer Info */}
                    <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verified By</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600 border border-blue-200 capitalize">
                                    {realName?.charAt(0) || 'A'}
                                </div>
                                <span className="text-[10px] font-bold text-slate-700">{realName || 'Admin User'}</span>
                            </div>
                        </div>
                        <div className="flex gap-2.5">
                            {isSuperAdmin ? (
                                <>
                                    <button
                                        onClick={handleReject}
                                        disabled={isSubmitting || !isAnyNotOk || !rejectionNotes.trim()}
                                        className="px-5 py-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-30 disabled:grayscale border-none cursor-pointer shadow-lg shadow-red-100 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? 'PROCESSING...' : 'REJECT ORDER'}
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={isSubmitting || !isAllOk}
                                        className="px-6 py-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-30 border-none cursor-pointer shadow-lg shadow-emerald-100 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? 'APPROVING...' : 'APPROVE ORDER'}
                                    </button>
                                </>
                            ) : (
                                isAnyNotOk ? (
                                    <button
                                        onClick={handleReject}
                                        disabled={isSubmitting || !rejectionNotes.trim()}
                                        className="px-5 py-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-30 disabled:grayscale border-none cursor-pointer shadow-lg shadow-red-100 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? 'PROCESSING...' : 'REJECT ORDER'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isSubmitting || !isAllOk}
                                        className="px-6 py-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-30 border-none cursor-pointer shadow-lg shadow-emerald-100 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? 'APPROVING...' : 'APPROVE ORDER'}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersTab;
