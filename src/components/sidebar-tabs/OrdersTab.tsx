import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { CheckCircle, CheckSquare, XCircle, Clock, ClipboardList, Copy, Check } from 'lucide-react';
import {
    setSearchQuery,
    setPaymentFilter,
    setStatusFilter,
    setTransferModeFilter,
    setPage,
    fetchPendingUnits
} from '../../store/slices/ordersSlice';
import { setProofModal } from '../../store/slices/uiSlice';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';
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
        statusCounts, // Get statusCounts from state
        filters
    } = useAppSelector((state: RootState) => state.orders);

    const {
        searchQuery,
        paymentTypeFilter,
        statusFilter,
        transferModeFilter,
        page,
        pageSize
    } = filters;

    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');

    // Debounce Search
    const [localSearch, setLocalSearch] = useState(searchQuery);

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
            transferMode: transferModeFilter
        }));
    }, [dispatch, adminMobile, page, pageSize, statusFilter, paymentTypeFilter, transferModeFilter]);

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
            dispatch(setPage(1));
            prevFiltersRef.current = current;
        }
    }, [statusFilter, paymentTypeFilter, transferModeFilter, dispatch]);


    const handleViewProof = useCallback((transaction: any, investor: any) => {
        dispatch(setProofModal({ isOpen: true, data: { ...transaction, name: investor.name } }));
    }, [dispatch]);

    // Pagination
    const totalPages = Math.ceil((totalCount || 0) / pageSize);

    return (
        <div className="orders-dashboard">
            <div className="orders-header">
                <h2>Live Orders</h2>
                {/* Search hidden as it might not be fully supported by API yet in this mode */}
                <input
                    type="text"
                    placeholder="Search by ID/Name..."
                    className="search-input orders-search"
                    style={{ visibility: 'hidden' }}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
            </div>

            {/* Status Cards / Filters */}
            <div className="status-controls">
                <div
                    className={`stats-card ${statusFilter === 'All Status' ? 'active-all' : ''}`}
                    onClick={() => dispatch(setStatusFilter('All Status'))}
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
                    onClick={() => dispatch(setStatusFilter('PENDING_ADMIN_VERIFICATION'))}
                >
                    <div className="card-icon-wrapper pending">
                        <CheckCircle size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{statusFilter === 'PENDING_ADMIN_VERIFICATION' ? totalCount : (statusCounts['PENDING_ADMIN_VERIFICATION'] ?? '-')}</h3>
                        <p>Admin Approval</p>
                    </div>
                </div>

                <div
                    className={`stats-card ${statusFilter === 'PAID' ? 'active-paid' : ''}`}
                    onClick={() => dispatch(setStatusFilter('PAID'))}
                >
                    <div className="card-icon-wrapper approved">
                        <CheckSquare size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{statusFilter === 'PAID' ? totalCount : (statusCounts['PAID'] ?? '-')}</h3>
                        <p>Approved/Paid</p>
                    </div>
                </div>

                <div
                    className={`stats-card ${statusFilter === 'REJECTED' ? 'active-rejected' : ''}`}
                    onClick={() => dispatch(setStatusFilter('REJECTED'))}
                >
                    <div className="card-icon-wrapper rejected">
                        <XCircle size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{statusFilter === 'REJECTED' ? totalCount : (statusCounts['REJECTED'] ?? '-')}</h3>
                        <p>Rejected</p>
                    </div>
                </div>

                <div
                    className={`stats-card ${statusFilter === 'PENDING_PAYMENT' ? 'active-payment-due' : ''}`}
                    onClick={() => dispatch(setStatusFilter('PENDING_PAYMENT'))}
                >
                    <div className="card-icon-wrapper payment-due">
                        <Clock size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{statusFilter === 'PENDING_PAYMENT' ? totalCount : (statusCounts['PENDING_PAYMENT'] ?? '-')}</h3>
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
                            <th className="th-user-name">User Name</th>
                            <th>Status</th>
                            <th>Units</th>
                            <th>Order Id</th>
                            <th>User Mobile</th>
                            <th>Email</th>
                            <th>Amount</th>
                            <th style={{ minWidth: '140px' }}>
                                <select
                                    value={paymentTypeFilter}
                                    onChange={(e) => dispatch(setPaymentFilter(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#475569',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        background: '#fff',
                                        textAlign: 'center'
                                    }}
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
                            {statusFilter === 'PENDING_ADMIN_VERIFICATION' && <th>Actions</th>}
                            {statusFilter === 'REJECTED' && <th>Rejected Reason</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {ordersLoading ? (
                            <TableSkeleton cols={11} rows={10} />
                        ) : pendingUnits.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="no-data-row">
                                    No orders found matching filters.
                                </td>
                            </tr>
                        ) : (
                            pendingUnits.map((entry: any, index: number) => {
                                const unit = entry.order || {};
                                const tx = entry.transaction || entry.transation || {};
                                const inv = entry.investor || {};
                                const serialNumber = (page - 1) * pageSize + index + 1;

                                return (
                                    <React.Fragment key={`${unit.id || 'order'}-${index}`}>
                                        <tr>
                                            <td>{serialNumber}</td>
                                            <td>{inv.name}</td>
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
                                            <td>{unit.numUnits}</td>
                                            <td>{unit.id}</td>
                                            <td>{inv.mobile}</td>
                                            <td>{inv.email || '-'}</td>
                                            <td>{tx.amount ?? '-'}</td>
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
                                                {unit.paymentType ? (
                                                    <button
                                                        className="view-proof-btn"
                                                        onClick={() => handleViewProof(tx, inv)}
                                                    >
                                                        Payment Proof
                                                    </button>
                                                ) : '-'}
                                            </td>
                                            {statusFilter === 'REJECTED' && <td>
                                                {unit.rejectedReason || 'No reason provided'}
                                            </td>}
                                            {statusFilter === 'PENDING_ADMIN_VERIFICATION' && <td>
                                                <div className="action-btn-container">
                                                    {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && (
                                                        <button
                                                            onClick={() => handleApproveClick(unit.id)}
                                                            className="action-btn approve"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {unit.paymentStatus === 'PENDING_ADMIN_VERIFICATION' && (
                                                        <button
                                                            onClick={() => handleReject(unit.id)}
                                                            className="action-btn reject"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            </td>}
                                        </tr>

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
                onPageChange={(p) => dispatch(setPage(p))}
            />
        </div >
    );
};

export default OrdersTab;
