import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Box, CheckCircle, Clock, AlertCircle, CreditCard, ChevronRight, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { RootState } from '../../../store';
import { fetchEmiDetails, clearSelectedEmiDetails } from '../../../store/slices/acfSlice';

const ACFUserDetails: React.FC = () => {
    const { userId, orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { selectedEmiDetails, emiLoading, acfOrders } = useAppSelector((state: RootState) => state.acf);
    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '9999999999');

    // Find order details from the list in store if available
    const orderInfo = useMemo(() => {
        return acfOrders.find(o => o.id === orderId || o.orderId === orderId);
    }, [acfOrders, orderId]);

    useEffect(() => {
        if (orderId && userId) {
            dispatch(fetchEmiDetails({ orderId, userId, adminMobile }));
        }
        return () => {
            dispatch(clearSelectedEmiDetails());
        };
    }, [dispatch, orderId, userId, adminMobile]);

    // Data derivation from schedule
    const stats = useMemo(() => {
        if (!selectedEmiDetails || !Array.isArray(selectedEmiDetails)) return { paid: 0, pending: 0, total: 0, count: 0, paidCount: 0 };

        const paid = selectedEmiDetails
            .filter(e => e.status === 'PAID')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const total = selectedEmiDetails.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        return {
            paid,
            total,
            pending: total - paid,
            count: selectedEmiDetails.length,
            paidCount: selectedEmiDetails.filter(e => e.status === 'PAID').length
        };
    }, [selectedEmiDetails]);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID': return 'Paid';
            case 'PENDING': return 'Pending Payment';
            case 'WAITING_FOR_APPROVAL': return 'Admin Approval pending';
            case 'REJECTED': return 'Rejected';
            default: return status?.replace(/_/g, ' ') || 'UNKNOWN';
        }
    };

    const userDisplay = {
        name: orderInfo?.user?.name || 'User Details',
        mobile: orderInfo?.user?.mobile || '-',
        joinDate: orderInfo?.createdAt ? new Date(orderInfo.createdAt).toLocaleDateString('en-IN') : 'N/A',
        units: orderInfo?.units || '-'
    };

    if (emiLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium font-inter">Loading installment details...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 font-inter">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/acf')}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors mb-2 bg-transparent border-none p-0 cursor-pointer text-sm"
                    >
                        <ArrowLeft size={16} /> Back to Users
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 m-0">ACF EMI Schedule</h1>
                    {orderId && <p className="text-xs text-slate-500 font-medium mt-1">Order ID: <span className="font-bold text-slate-700">{orderId}</span></p>}
                </div>

            </div>

            {/* User Profile Card */}
            <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-100 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                        {userDisplay.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-900 m-0">{userDisplay.name}</h2>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase tracking-wider">ACF Plan</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-2"><User size={14} className="text-slate-400" /> +91 {userDisplay.mobile}</span>
                            {/* <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> Joined {userDisplay.joinDate}</span> */}
                            <span className="flex items-center gap-2">
                                <Box size={14} className="text-slate-400" /> {userDisplay.units} {Number(userDisplay.units) === 1 ? 'Unit' : 'Units'} Purchased
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Plan Value */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Box size={64} className="text-blue-600" />
                    </div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Total Plan Value</p>
                    <h3 className="text-2xl font-bold text-slate-900 m-0">₹{stats.total.toLocaleString('en-IN')}</h3>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="font-medium text-slate-600">{stats.count} Installments</span>
                    </p>
                </div>

                {/* Paid Amount */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm group hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider m-0">Paid Amount</p>
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-600 m-0">₹{stats.paid.toLocaleString('en-IN')}</h3>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(stats.paid / (stats.total || 1)) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-right">{Math.round((stats.paid / (stats.total || 1)) * 100)}% Completed</p>
                </div>

                {/* Pending Amount */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm group hover:border-amber-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider m-0">Remaining Amount</p>
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                            <Clock size={16} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-amber-600 m-0">₹{stats.pending.toLocaleString('en-IN')}</h3>
                    <p className="text-xs text-amber-600/80 mt-2 font-medium flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md w-fit">
                        <AlertCircle size={12} />
                        {stats.count - stats.paidCount} Installments Left
                    </p>
                </div>
            </div>

            {/* Repayment Schedule Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-blue-600">
                            <CreditCard size={18} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 m-0">Detailed Installment History</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {!selectedEmiDetails || selectedEmiDetails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                            <Info size={40} strokeWidth={1.5} />
                            <p className="text-sm font-medium">No installment records found for this order</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">EMI NO</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paid Date</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedEmiDetails.map((emi: any, idx: number) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            #{emi.installmentNumber || idx + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {emi.dueDate ? new Date(emi.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide shadow-sm whitespace-nowrap
                                                ${emi.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    emi.status === 'WAITING_FOR_APPROVAL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        emi.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}>
                                                {getStatusLabel(emi.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {emi.paidAt ? new Date(emi.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-slate-900">
                                                ₹{(emi.amount || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ACFUserDetails;
