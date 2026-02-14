import React, { useState, useEffect } from 'react';
import { UserCog, CheckCircle2, XCircle, Search, Filter, Clock, Loader2, User, Phone, Briefcase, MoveRight, Star, Calendar } from 'lucide-react';
import { roleRequestService } from '../../../services/api';
import { RoleChangeRequest } from '../../../types';
import { useAppSelector } from '../../../store/hooks';

const RoleRequestsTab: React.FC = () => {
    // Robust ID extraction helper
    const getBestRequestId = (req: RoleChangeRequest) => {
        if (!req) return '';

        const isPlaceholder = (v: any) => !v || v === 'RCR' || v === 'rcr' || v === 'undefined' || v === 'null';
        const allKeys = Object.keys(req);

        // 1. Prioritize non-placeholder standard ID fields
        const standardIds = [req._id, req.id, req.request_id];
        for (const val of standardIds) {
            if (typeof val === 'string' && !isPlaceholder(val) && !/^\d{4}-\d{2}-\d{2}/.test(val)) {
                return val;
            }
        }

        // 2. Look for hyphenated UUID-like strings or RCR# patterns that aren't dates
        const specialIdKey = allKeys.find(key =>
            !['created_at', 'updated_at', 'created_date'].includes(key) &&
            typeof req[key] === 'string' &&
            (req[key].includes('-') || req[key].includes('#')) &&
            !/^\d{4}-\d{2}-\d{2}/.test(req[key]) &&
            !isPlaceholder(req[key])
        );
        if (specialIdKey) return req[specialIdKey];

        // 3. Try common business ID fields
        for (const key of ['uuid', 'reference_id', 'uid']) {
            if (req[key] && typeof req[key] === 'string' && !isPlaceholder(req[key])) {
                return req[key];
            }
        }

        // 4. Last ditch: fallback to whatever we have, preferring _id or id over request_id (RCR)
        return req._id || req.id || req.request_id || '';
    };

    const { adminMobile } = useAppSelector(state => state.auth);
    const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(() => {
        const saved = localStorage.getItem('role_requests_filter');
        return (saved as any) || 'PENDING';
    });

    const fetchRequests = async () => {
        if (!adminMobile) return;
        try {
            setLoading(true);
            setError(null);
            const data = await roleRequestService.getRoleChangeRequests(statusFilter, adminMobile);
            setRequests(data);
        } catch (err) {
            console.error('Error loading role requests:', err);
            setError('Failed to load role requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        localStorage.setItem('role_requests_filter', statusFilter);
    }, [statusFilter, adminMobile]);

    const handleAction = async (request: RoleChangeRequest, action: 'APPROVE' | 'REJECT') => {
        if (!adminMobile) return;
        try {
            const requestId = getBestRequestId(request);

            console.log(`[RoleRequests] Action: ${action} for Request:`, {
                originalRequest: request,
                extractedId: requestId
            });

            const isApproved = action === 'APPROVE';
            const response = await roleRequestService.actionRoleChangeRequest(requestId, isApproved, adminMobile);

            if (response.error) {
                alert(response.error);
                return;
            }

            // Refresh the list after successful action
            fetchRequests();
        } catch (err) {
            console.error(`Error ${action}ing request:`, err);
            alert(`Failed to ${action.toLowerCase()} request`);
        }
    };

    const filteredRequests = requests;

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] p-6 font-sans h-[calc(100vh-100px)] overflow-hidden">
            {/* Compact Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black text-[#111827] flex items-center gap-2.5 tracking-tight shrink-0">
                        <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                            <UserCog size={20} />
                        </div>
                        Role Requests
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-tight transition-all uppercase whitespace-nowrap ${statusFilter === status
                                    ? 'bg-[#111827] text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto pr-1 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Loader2 className="animate-spin text-emerald-500" size={32} strokeWidth={2.5} />
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Syncing...</h3>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
                        <Filter size={32} className="text-slate-200 mb-3" />
                        <h3 className="text-base font-black text-slate-400">No matching records</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 max-w-[1500px]">
                        {filteredRequests.map((req) => (
                            <div key={req.request_id} className="bg-white rounded-[1.25rem] border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-emerald-100/60 duration-300">
                                {/* Card Header - Slim & Precise */}
                                <div className="px-4 py-3 flex justify-between items-center border-b border-slate-50">
                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight shrink-0">ID:</div>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="bg-[#f8fafc] border border-slate-200/60 rounded-lg px-3 py-1.5 flex items-center min-w-0 group-hover:border-emerald-200 transition-colors">
                                                <span className="text-[11px] font-black text-[#111827] truncate">
                                                    {getBestRequestId(req)}
                                                </span>
                                                {getBestRequestId(req) === 'RCR' && (
                                                    <span className="ml-2 text-[8px] text-rose-500 font-bold italic shrink-0 whitespace-nowrap px-1.5 py-0.5 bg-rose-50 rounded border border-rose-100">
                                                        Incomplete ID
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 border shrink-0 ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        <div className={`w-1 h-1 rounded-full ${req.status === 'APPROVED' ? 'bg-emerald-500' : req.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                                        {req.status}
                                    </div>
                                </div>

                                {/* Card Body - Condensed */}
                                <div className="p-4 space-y-4">
                                    {/* Users Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Requester</p>
                                            <div className="flex items-center gap-2.5 bg-[#f8fafc] p-2 rounded-xl border border-slate-100">
                                                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border border-emerald-100">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 text-[12px] truncate leading-tight">{req.requester_name}</div>
                                                    <div className="text-slate-400 text-[10px] font-bold mt-0.5 truncate">{req.requester_mobile}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 border-l border-slate-50 pl-4">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Target User</p>
                                            <div className="flex items-center gap-2.5 bg-[#f8fafc] p-2 rounded-xl border border-slate-100 opacity-90">
                                                <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border border-slate-200">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-[12px] truncate leading-tight pr-1">
                                                        {req.target_name || 'System Managed'}
                                                    </div>
                                                    <div className="text-slate-400 text-[10px] font-bold mt-0.5 truncate uppercase">
                                                        {req.target_mobile || '--'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role Transition - Very Compact */}
                                    {/* Role Display - Conditional for Approved */}
                                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                        {req.status === 'APPROVED' ? (
                                            <div className="bg-white text-emerald-600 border border-emerald-100 px-3 py-2 rounded-lg flex items-center gap-2.5 shadow-sm">
                                                <Star size={14} strokeWidth={2.5} fill="currentColor" className="shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Current Active Role</span>
                                                    <span className="font-black text-[11px] uppercase tracking-tight truncate">{req.current_role}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-white text-slate-500 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                                                        <Briefcase size={12} strokeWidth={2.5} className="shrink-0" />
                                                        <span className="font-black text-[10px] uppercase tracking-tight truncate">{req.current_role}</span>
                                                    </div>
                                                </div>

                                                <MoveRight size={14} className="text-slate-300 shrink-0" strokeWidth={3} />

                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                                                        <Star size={12} strokeWidth={2.5} fill="currentColor" className="shrink-0" />
                                                        <span className="font-black text-[10px] uppercase tracking-tight truncate">{req.requested_role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline & Actions Combined or Stacked Slimly */}
                                    <div className="flex justify-between items-end gap-4 pt-1">
                                        <div className="space-y-1.5 shrink-0">
                                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px]">
                                                <Calendar size={10} className="text-slate-300" />
                                                <span>Created: {new Date(req.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px]">
                                                <Calendar size={10} className="text-slate-300" />
                                                <span>Updated: {new Date(req.updated_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                        </div>

                                        {req.status === 'PENDING' && (
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAction(req, 'REJECT'); }}
                                                    className="h-8 flex-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <XCircle size={14} />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAction(req, 'APPROVE'); }}
                                                    className="h-8 flex-1 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Approve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleRequestsTab;
