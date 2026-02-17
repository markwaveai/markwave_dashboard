import React from 'react';
import { X, Check, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import type { RootState } from '../../../store';
import { setApprovalHistoryModal } from '../../../store/slices/uiSlice';

const formatApprovalDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';

    try {
        // 1. Handle common formats manually to avoid browser-specific MM/DD swapping
        // Format: YYYY-MM-DD (with optional time)
        const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
        if (isoMatch) {
            const [_, year, month, day, hours, minutes] = isoMatch.map(val => val ? Number(val) : 0);
            const date = new Date(year, month - 1, day, hours, minutes);
            if (!isNaN(date.getTime())) return format(date);
        }

        // Format: DD-MM-YYYY (with optional time)
        const customMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})(?: (\d{2}):(\d{2}))?/);
        if (customMatch) {
            const [_, day, month, year, hours, minutes] = customMatch.map(val => val ? Number(val) : 0);
            const date = new Date(year, month - 1, day, hours, minutes);
            if (!isNaN(date.getTime())) return format(date);
        }

        // 2. Fallback to standard JS parsing if manual checks fail
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return format(date);
        }
    } catch (e) {
        console.error('Date parsing error:', e);
    }

    return dateStr;
};

// Helper to keep the formatting consistent
const format = (date: Date) => {
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const ApprovalHistoryModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isOpen, history, orderId } = useAppSelector((state: RootState) => state.ui.modals.approvalHistory);

    if (!isOpen) return null;

    const onClose = () => {
        dispatch(setApprovalHistoryModal({ isOpen: false }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1100]" onClick={onClose}>
            <div
                className="bg-white w-[95%] max-w-[600px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                        <h3 className="m-0 text-[15px] font-bold text-slate-800 tracking-tight">Approval History - {orderId}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-200/50 rounded-full transition-all bg-transparent border-none cursor-pointer group"
                    >
                        <X className="text-slate-400 group-hover:text-slate-600" size={18} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {history && history.length > 0 ? (
                        <div className="space-y-4">
                            {history.map((h: any, i: number) => {
                                const isSuper = h.role?.toLowerCase().includes('super');
                                return (
                                    <div key={i} className={`rounded-xl border p-4 transition-all ${isSuper ? 'bg-purple-50/30 border-purple-100 shadow-sm shadow-purple-50' : 'bg-slate-50/50 border-slate-100 shadow-sm shadow-slate-50'}`}>
                                        <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100/50">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isSuper ? 'bg-purple-100 border-purple-200 text-purple-600' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[12px] font-extrabold uppercase tracking-wider ${isSuper ? 'text-purple-700' : 'text-slate-700'}`}>
                                                        {isSuper ? 'Super Admin' : (h.role || 'Admin')}
                                                    </span>
                                                    <span className={`text-[13px] font-bold ${isSuper ? 'text-purple-900' : 'text-slate-800'}`}>
                                                        {h.approvedByName || h.name || 'Staff User'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Approved At</span>
                                                <span className="text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50 shadow-sm">
                                                    {formatApprovalDate(h.approvedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Checks Grid */}
                                        {h.checks && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                                {h.checks.unitsChecked !== undefined && (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${h.checks.unitsChecked ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${h.checks.unitsChecked ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        <span className="text-[9px] font-extrabold uppercase">Units</span>
                                                    </div>
                                                )}
                                                {h.checks.paymentProof !== undefined && (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${h.checks.paymentProof ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${h.checks.paymentProof ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        <span className="text-[9px] font-extrabold uppercase">Proof</span>
                                                    </div>
                                                )}
                                                {h.checks.paymentReceived !== undefined && (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${h.checks.paymentReceived ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${h.checks.paymentReceived ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        <span className="text-[9px] font-extrabold uppercase">Payment</span>
                                                    </div>
                                                )}
                                                {h.checks.coinsChecked !== undefined && (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${h.checks.coinsChecked ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${h.checks.coinsChecked ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        <span className="text-[9px] font-extrabold uppercase">Coins</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Comments */}
                                        {h.comments && (
                                            <div className="mt-2 p-2.5 bg-white/60 border border-slate-100 rounded-lg">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Remarks</span>
                                                <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic m-0">
                                                    "{h.comments}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                <X size={20} className="text-slate-300" />
                            </div>
                            <span className="text-sm font-medium">No approval history found for this order.</span>
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all border-none cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApprovalHistoryModal;
