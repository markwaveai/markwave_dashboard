import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import type { RootState } from '../../../store';
import { Search, User, Filter, AlertCircle, Clock, CheckCircle2, XCircle, Check, X, Copy, ChevronRight, Calendar, Info } from 'lucide-react';
import {
    fetchAcfPendingEmis,
    setStatusFilter,
    setPaymentTypeFilter,
    setPage,
    setSearch,
    approveAcfEmi,
    rejectAcfEmi,
} from '../../../store/slices/acfSlice';
import { setApprovalModal, setRejectionModal, setSnackbar, setProofModal } from '../../../store/slices/uiSlice';
import Pagination from '../../common/Pagination';
import TableSkeleton from '../../common/TableSkeleton';

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
            className={`border-none bg-transparent p-0 cursor-pointer flex items-center gap-1 transition-colors ${isCopied ? 'text-blue-600' : 'text-slate-400'}`}
            title={isCopied ? 'Copied!' : 'Copy'}
        >
            {isCopied ? <Check size={14} /> : <Copy size={12} />}
        </button>
    );
};

const ACFHome: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Redux State
    const {
        acfOrders,
        loading,
        error,
        totalFiltered,
        filters
    } = useAppSelector((state: RootState) => state.acf);

    const { status, paymentType, search: storeSearch, page, pageSize } = filters;
    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');

    // Tooltip State
    const [tooltipInfo, setTooltipInfo] = useState<{ tx: any; top: number; left: number } | null>(null);

    // Locale search state for debouncing
    const [localSearch, setLocalSearch] = useState(storeSearch);

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

    // 1. Unified Sync & Fetch Logic
    // We derive current values from URL to ensure refresh persistence
    const currentStatus = searchParams.get('status') || 'All Status';
    const currentPayment = searchParams.get('payment') || 'All Payments';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const currentSearch = searchParams.get('search') || '';

    // Update Redux when URL changes (Syncing)
    useEffect(() => {
        if (currentStatus !== status) dispatch(setStatusFilter(currentStatus));
        if (currentPayment !== paymentType) dispatch(setPaymentTypeFilter(currentPayment));
        if (currentPage !== page) dispatch(setPage(currentPage));
        if (currentSearch !== storeSearch) {
            dispatch(setSearch(currentSearch));
            setLocalSearch(currentSearch);
        }
    }, [currentStatus, currentPayment, currentPage, currentSearch, dispatch, status, paymentType, page, storeSearch]);

    // Update URL when local search changes (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== currentSearch) {
                setSearchParams(prev => {
                    if (localSearch.trim()) prev.set('search', localSearch.trim());
                    else prev.delete('search');
                    prev.set('page', '1');
                    return prev;
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, currentSearch, setSearchParams]);

    // Core Data Fetching - Triggered by URL parameters
    useEffect(() => {
        dispatch(fetchAcfPendingEmis({
            adminMobile,
            page: currentPage,
            pageSize, // We keep pageSize in Redux only
            status: currentStatus,
            paymentType: currentPayment,
            search: currentSearch
        }));
    }, [dispatch, adminMobile, currentPage, pageSize, currentStatus, currentPayment, currentSearch]);

    const handleStatusChange = (newStatus: string) => {
        dispatch(setStatusFilter(newStatus));
        setSearchParams(prev => {
            prev.set('status', newStatus);
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePaymentTypeChange = (newType: string) => {
        dispatch(setPaymentTypeFilter(newType));
        setSearchParams(prev => {
            if (newType === 'All Payments') prev.delete('payment');
            else prev.set('payment', newType);
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePageChange = (p: number) => {
        dispatch(setPage(p));
        setSearchParams(prev => {
            prev.set('page', String(p));
            return prev;
        });
    };

    const handleApproveWrapper = (id: string, installmentNumber: number) => {
        dispatch(setApprovalModal({ isOpen: true, unitId: id, installmentNumber }));
    };

    const handleRejectWrapper = (id: string, installmentNumber: number) => {
        dispatch(setRejectionModal({ isOpen: true, unitId: id, installmentNumber }));
    };

    const handleViewProof = useCallback((transaction: any, user: any) => {
        dispatch(setProofModal({ isOpen: true, data: { ...transaction, name: user.name } }));
    }, [dispatch]);

    const handleRowClick = (orderId: string, mobile: string) => {
        if (!mobile || !orderId) return;
        navigate(`/acf/details/${encodeURIComponent(mobile)}/${encodeURIComponent(orderId)}`);
    };

    const statusFilters = [
        { label: 'All Orders', value: 'All Status', icon: Filter },
        { label: 'Pending Payment', value: 'PENDING', icon: Clock },
        { label: 'Admin Approval pending', value: 'WAITING_FOR_APPROVAL', icon: AlertCircle },
        { label: 'Paid', value: 'PAID', icon: CheckCircle2 },
        { label: 'Rejected', value: 'REJECTED', icon: XCircle },
    ];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'WAITING_FOR_APPROVAL':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PAID':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'REJECTED':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const formatStatusLabel = (s: string) => {
        switch (s) {
            case 'PENDING': return 'Pending Payment';
            case 'WAITING_FOR_APPROVAL': return 'Admin Approval pending';
            case 'PAID': return 'Paid';
            case 'REJECTED': return 'Rejected';
            default: return s?.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ') || 'UNKNOWN';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 m-0">ACF Orders</h1>
                    <p className="text-slate-500 mt-1">Manage EMI installments for Crowd Farming units</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Order ID, Name, Mobile..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Pill Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {statusFilters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => handleStatusChange(f.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-semibold transition-all shadow-sm
                            ${currentStatus === f.value
                                ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                    >
                        <f.icon size={14} />
                        {f.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Table Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">S.No</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Units</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[150px]">
                                    <select
                                        value={paymentType}
                                        onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-transparent border-none font-bold text-[11px] uppercase tracking-wider text-slate-400 outline-none cursor-pointer w-full hover:text-slate-600 transition-colors"
                                    >
                                        <option value="All Payments">Payment Type</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="ONLINE">Online/UPI</option>
                                        <option value="MANUAL_PAYMENT">Manual Payment</option>
                                    </select>
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[120px]">Payment Proof</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                {currentStatus !== 'All Status' && (
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <TableSkeleton cols={currentStatus === 'All Status' ? 8 : 9} rows={pageSize} />
                            ) : acfOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={currentStatus === 'All Status' ? 8 : 9} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <Search size={40} strokeWidth={1.5} />
                                            <p className="text-sm font-medium">No ACF orders found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                acfOrders.map((order: any, idx: number) => (
                                    <tr
                                        key={`${order.id || order.orderId}-${idx}`}
                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                        onClick={() => handleRowClick(order.id || order.orderId, order.user?.mobile)}
                                    >
                                        <td className="px-6 py-5 text-sm text-slate-500 text-center">
                                            {(page - 1) * pageSize + idx + 1}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                                    <User size={16} className="text-slate-400 group-hover:text-blue-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-800">{order.user?.name || 'Unknown User'}</span>
                                                    <span className="text-xs text-slate-500 font-medium">+91 {order.user?.mobile || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-slate-700">{order.orderId}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">
                                                        Inst #{order.emiDetails?.installmentNumber}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        Due: {order.emiDetails?.dueDate ? new Date(order.emiDetails.dueDate).toLocaleDateString('en-IN') : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm font-bold text-slate-700">{order.units}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide shadow-sm whitespace-nowrap ${getStatusStyles(order.emiDetails?.status)}`}>
                                                {formatStatusLabel(order.emiDetails?.status || 'UNKNOWN')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {order.transaction?.paymentType === 'BANK_TRANSFER' || order.transaction?.paymentType === 'CHEQUE' ? (
                                                <div
                                                    className="cursor-pointer text-blue-600 font-bold text-[13px] hover:underline transition-all"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const viewportHeight = window.innerHeight;
                                                        let top = rect.top + (rect.height / 2);
                                                        if (top + 125 > viewportHeight) top = viewportHeight - 140;
                                                        if (top - 125 < 0) top = 140;

                                                        setTooltipInfo({
                                                            tx: order.transaction,
                                                            top,
                                                            left: rect.right + 10
                                                        });
                                                    }}
                                                    onMouseLeave={() => setTooltipInfo(null)}
                                                >
                                                    {order.transaction.paymentType.replace('_', ' ')}
                                                </div>
                                            ) : (
                                                <span className="text-sm font-semibold text-slate-600">
                                                    {order.transaction?.paymentType?.replace('_', ' ') || '-'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {order.transaction?.paymentType ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewProof(order.transaction, order.user);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 text-[11px] font-bold border-b border-blue-200 hover:border-blue-600 transition-all"
                                                >
                                                    View Proof
                                                </button>
                                            ) : (
                                                <span className="text-[11px] text-slate-300 font-medium">No Proof</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-sm font-bold text-slate-900">
                                                ₹{(order.emiDetails?.amount || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        {currentStatus !== 'All Status' && (
                                            <td className="px-6 py-5 text-center">
                                                {order.emiDetails?.status === 'WAITING_FOR_APPROVAL' && (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleApproveWrapper(order.orderId, order.emiDetails?.installmentNumber);
                                                            }}
                                                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-600 transition-all shadow-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRejectWrapper(order.orderId, order.emiDetails?.installmentNumber);
                                                            }}
                                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] font-bold hover:bg-red-700 transition-all shadow-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && acfOrders.length > 0 && (
                    <div className="px-6 border-t border-slate-100">
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalFiltered / pageSize) || 1}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Floating Tooltip */}
            {tooltipInfo && (
                <div
                    className="fixed z-[9999] bg-slate-900 border border-slate-800 rounded-2xl p-5 w-[300px] shadow-2xl animate-in fade-in zoom-in duration-200"
                    style={{
                        top: tooltipInfo.top,
                        left: tooltipInfo.left,
                        transform: 'translateY(-50%)',
                    }}
                    onMouseEnter={() => { }}
                    onMouseLeave={() => setTooltipInfo(null)}
                >
                    <div className="absolute top-1/2 right-full -mt-2 border-8 border-transparent border-r-slate-900"></div>
                    <div className="text-[13px] font-bold text-slate-50 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                        <span>Payment Details</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between gap-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bank Name</span>
                            <span className="text-[11px] font-bold text-slate-200 text-right">{findVal(tooltipInfo.tx, ['bank_name', 'bankName'], ['bank'])}</span>
                        </div>

                        <div className="flex justify-between gap-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">A/C Number</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-200 text-right">
                                    {findVal(tooltipInfo.tx, ['account_number', 'account_no', 'accountNumber'], ['account', 'acc_no'])}
                                </span>
                                <UTRCopyButton value={findVal(tooltipInfo.tx, ['account_number', 'account_no', 'accountNumber'], ['account', 'acc_no'])} />
                            </div>
                        </div>

                        <div className="flex justify-between gap-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">UTR / Ref No</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-emerald-400 text-right">
                                    {findVal(tooltipInfo.tx, ['utr', 'utr_no', 'utr_number', 'transaction_id', 'transactionID', 'reference_no'], ['utr', 'txid'])}
                                </span>
                                <UTRCopyButton value={findVal(tooltipInfo.tx, ['utr', 'utr_no', 'utr_number', 'transaction_id', 'transactionID', 'reference_no'], ['utr', 'txid'])} />
                            </div>
                        </div>

                        {tooltipInfo.tx.comments && (
                            <div className="pt-2 border-t border-slate-800 mt-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Comment</span>
                                <p className="text-[11px] text-slate-400 m-0 leading-relaxed italic">"{tooltipInfo.tx.comments}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <ApprovalModal />
            <RejectionModal />
        </div>
    );
};


const ApprovalModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isOpen, unitId, installmentNumber } = useAppSelector((state: RootState) => state.ui.modals?.approval || { isOpen: false, unitId: null, installmentNumber: null });
    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');
    const adminProfile = useAppSelector((state: RootState) => state.users?.adminProfile);

    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const realName = adminProfile?.name || 'Admin';
    const adminRole = adminProfile?.role || 'Admin';

    useEffect(() => {
        if (isOpen) setComment('');
    }, [isOpen]);

    const onClose = () => {
        if (isSubmitting) return;
        dispatch(setApprovalModal({ isOpen: false, unitId: null }));
    };

    const handleApprove = async () => {
        if (!unitId || installmentNumber === null) return;
        setIsSubmitting(true);
        try {
            await dispatch(approveAcfEmi({
                unitId: String(unitId),
                installmentNumber: Number(installmentNumber),
                adminMobile,
                comments: comment.trim()
            })).unwrap();

            dispatch(setSnackbar({ message: 'ACF Order approved successfully!', type: 'success' }));
            onClose();
        } catch (error) {
            dispatch(setSnackbar({ message: 'Failed to approve ACF order.', type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="px-6 pt-6">
                    <h3 className="m-0 mb-2 text-xl font-bold text-slate-900">Approve ACF Payment</h3>
                    <p className="m-0 text-sm text-slate-500 leading-snug">Confirm manual payment verification for this installment.</p>
                </div>

                <div className="p-6">
                    <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Verifying Admin</div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {realName.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">{realName}</div>
                                <div className="text-xs text-slate-500 font-medium">{adminMobile}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="block text-[13px] font-bold mb-2 text-slate-700">Approval Comment</label>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            placeholder="Add any internal notes here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RejectionModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isOpen, unitId, installmentNumber } = useAppSelector((state: RootState) => state.ui.modals?.rejection || { isOpen: false, unitId: null, installmentNumber: null });
    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');

    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) setReason('');
    }, [isOpen]);

    const onClose = () => {
        if (isSubmitting) return;
        dispatch(setRejectionModal({ isOpen: false, unitId: null }));
    };

    const handleReject = async () => {
        if (!unitId || installmentNumber === null || !reason.trim()) return;
        setIsSubmitting(true);
        try {
            await dispatch(rejectAcfEmi({
                unitId: String(unitId),
                installmentNumber: Number(installmentNumber),
                adminMobile,
                comments: reason.trim()
            })).unwrap();

            dispatch(setSnackbar({ message: 'ACF Order rejected.', type: 'error' }));
            onClose();
        } catch (error) {
            dispatch(setSnackbar({ message: 'Failed to reject ACF order.', type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="px-6 pt-6 mb-4">
                    <h3 className="m-0 mb-2 text-xl font-bold text-slate-900">Reject Payment</h3>
                    <p className="m-0 text-sm text-slate-500 leading-snug text-balance">Please specify why the payment was rejected. This will be visible to administrators.</p>
                </div>

                <div className="px-6 mb-6">
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 text-sm outline-none resize-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                        placeholder="Rejection reason (required)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={isSubmitting || !reason.trim()}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Rejecting...' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ACFHome;
