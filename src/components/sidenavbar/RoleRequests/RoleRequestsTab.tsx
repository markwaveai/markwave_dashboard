import React, { useState } from 'react';
import { UserCog, CheckCircle2, XCircle, Search, Filter, AlertCircle, Clock } from 'lucide-react';

interface RoleRequest {
    id: string;
    userName: string;
    mobile: string;
    currentRole: string;
    requestedRole: string;
    requestDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason?: string;
}

const MOCK_REQUESTS: RoleRequest[] = [
    {
        id: '1',
        userName: 'Ramesh Kumar',
        mobile: '9876543210',
        currentRole: 'Investor',
        requestedRole: 'Special Category',
        requestDate: '2024-02-14',
        status: 'PENDING',
        reason: 'High volume investment portfolio'
    },
    {
        id: '2',
        userName: 'Suresh Patil',
        mobile: '9876543211',
        currentRole: 'Investor',
        requestedRole: 'Channel Partner',
        requestDate: '2024-02-13',
        status: 'PENDING',
        reason: 'Interested in expanding network'
    },
    {
        id: '3',
        userName: 'Priya Singh',
        mobile: '9876543212',
        currentRole: 'Channel Partner',
        requestedRole: 'Super Channel Partner',
        requestDate: '2024-02-12',
        status: 'APPROVED'
    },
    {
        id: '4',
        userName: 'Amit Shah',
        mobile: '9876543213',
        currentRole: 'Investor',
        requestedRole: 'Special Category',
        requestDate: '2024-02-10',
        status: 'REJECTED'
    }
];

const RoleRequestsTab: React.FC = () => {
    const [requests, setRequests] = useState<RoleRequest[]>(MOCK_REQUESTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
        // Simulate API call
        setRequests(prev => prev.map(req => {
            if (req.id === id) {
                return {
                    ...req,
                    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
                };
            }
            return req;
        }));
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.mobile.includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f7fa] p-8 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-[2rem] font-extrabold text-[#111827] leading-tight flex items-center gap-3">
                        <UserCog size={32} className="text-[#10b981]" />
                        Role Requests
                    </h2>
                    <p className="text-[#6b7280] text-lg mt-1 font-medium">Manage user role upgrade requests and permissions.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-[1.5rem] shadow-sm mb-6 border border-[#f1f5f9] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 font-medium text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${statusFilter === status
                                    ? 'bg-[#111827] text-white shadow-lg'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Filter size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No requests found</h3>
                        <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-[#f1f5f9] flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all">
                            {/* User Info */}
                            <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold text-lg">
                                    {req.userName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#111827] text-lg leading-tight">{req.userName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-medium text-slate-500">{req.mobile}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {req.requestDate}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Role Change Info */}
                            <div className="flex items-center gap-3 flex-1 w-full md:w-auto bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Role</span>
                                    <span className="font-bold text-slate-700">{req.currentRole}</span>
                                </div>
                                <div className="text-slate-300">→</div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">Requested</span>
                                    <span className="font-bold text-[#111827]">{req.requestedRole}</span>
                                </div>
                            </div>

                            {/* Reason */}
                            {req.reason && (
                                <div className="flex-[1.5] w-full md:w-auto text-sm text-slate-500 font-medium italic border-l-2 border-slate-100 pl-4 py-1">
                                    "{req.reason}"
                                </div>
                            )}

                            {/* Actions/Status */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {req.status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(req.id, 'REJECT')}
                                            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-2"
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'APPROVE')}
                                            className="px-6 py-2 rounded-xl bg-[#10b981] text-white font-bold text-xs hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20 flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} strokeWidth={3} />
                                            Approve
                                        </button>
                                    </>
                                ) : (
                                    <div className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider border flex items-center gap-2 ${getStatusColor(req.status)}`}>
                                        {req.status === 'APPROVED' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {req.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RoleRequestsTab;
