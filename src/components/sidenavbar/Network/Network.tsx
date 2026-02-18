import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import type { RootState } from '../../../store';
import { fetchNetwork } from '../../../store/slices/usersSlice';
import Pagination from '../../common/Pagination';
import TableSkeleton from '../../common/TableSkeleton';
import { Award, Users, Target, ShoppingBag, Search } from 'lucide-react';


const NetworkTab: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { network } = useAppSelector((state: RootState) => state.users);
    const { stats, users = [], loading, error } = network || { stats: null, users: [], loading: false, error: null };

    // URL Search Params for Pagination
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 10;

    // Filter State
    const [role, setRole] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    // Debounce Search
    useEffect(() => {
        // Only trigger search if it's 10 digits or empty
        if (search.length === 10 || search.length === 0) {
            const timer = setTimeout(() => {
                setDebouncedSearch(search);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [search]);

    // Memoize params
    const fetchParams = useMemo(() => ({
        page: currentPage,
        limit: itemsPerPage,
        role: role || undefined,
        search: debouncedSearch || undefined,
    }), [currentPage, role, debouncedSearch]);

    // Fetch Data
    useEffect(() => {
        dispatch(fetchNetwork(fetchParams));
    }, [dispatch, fetchParams]);

    const setCurrentPage = useCallback((page: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', String(page));
            return newParams;
        });
    }, [setSearchParams]);

    const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
        setCurrentPage(1);
    }, [setCurrentPage]);

    // Calculate total pages
    // Use stats.page, stats.limit, stats.user_count if available
    const totalPages = stats ? Math.ceil(stats.user_count / stats.limit) : 0;

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-bold text-[#1E293B] mb-8">Network Overview</h1>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Users Card */}
                        <div className="bg-[#EBF2FF] rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden shadow-sm border border-white/50">
                            <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center text-white shadow-md z-10">
                                <Users size={24} />
                            </div>
                            <div className="z-10">
                                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Total Users</div>
                                <div className="text-2xl font-bold text-[#1E293B]">{stats.user_count}</div>
                            </div>
                        </div>

                        {/* Distributed Coins Card */}
                        <div className="bg-[#FFF8E6] rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden shadow-sm border border-white/50">
                            <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center text-white shadow-md z-10">
                                <Award size={24} />
                            </div>
                            <div className="z-10 flex-grow">
                                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Distributed Coins</div>
                                <div className="text-2xl font-bold text-[#1E293B]">{stats.total_distributed_coins?.toLocaleString('en-IN')}</div>
                                <div className="text-[10px] font-bold text-[#64748B] mt-1">
                                    Target: {stats.total_target_coins?.toLocaleString('en-IN') || '1,75,00,000'}
                                </div>
                            </div>
                        </div>

                        {/* Purchased Units Card */}
                        <div className="bg-[#E9F7EF] rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden shadow-sm border border-white/50">
                            <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center text-white shadow-md z-10">
                                <ShoppingBag size={24} />
                            </div>
                            <div className="z-10 flex-grow">
                                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Purchased Units</div>
                                <div className="text-2xl font-bold text-[#1E293B]">{stats.total_purchased_units || 0}</div>
                                <div className="text-[10px] font-bold text-[#64748B] mt-1">
                                    Target: {stats.total_target_units?.toLocaleString('en-IN') || '100000'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-[#94A3B8]" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); // Only digits
                                if (val.length <= 10) { // Max 10 digits
                                    setSearch(val);
                                    setCurrentPage(1);
                                }
                            }}
                            placeholder="Search by mobile..."
                            className="block w-full pl-11 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-[#64748B]">Role</span>
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="bg-white border border-[#E2E8F0] text-[#1E293B] text-sm font-medium rounded-xl block px-4 py-2 focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">All</option>
                            <option value="Investor">Investor</option>
                            <option value="Employee">Employee</option>
                            <option value="SpecialCategory">Special Category</option>
                        </select>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-[var(--color-gray-200)] overflow-hidden">
                    <div className="overflow-x-auto [scrollbar-width:thin]">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-gray-50)] border-b border-[var(--color-gray-200)]">
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-gray-500)] uppercase tracking-widest text-center">S.No</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-gray-500)] uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-gray-500)] uppercase tracking-widest">Mobile</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-gray-500)] uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px) font-bold text-[var(--color-gray-500)] uppercase tracking-widest text-center">Referrals</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-gray-500)] uppercase tracking-widest text-center">Units</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-gray-500)] uppercase tracking-widest text-center">Coins Earned</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-gray-500)] uppercase tracking-widest text-center">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {loading ? (
                                    <TableSkeleton cols={8} rows={10} />
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center text-[#94A3B8]">No users found</td>
                                    </tr>
                                ) : (
                                    users.map((user: any, index: number) => (
                                        <tr
                                            key={user.mobile || index}
                                            className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                                            onClick={() => navigate(`/user-management/network/${user.mobile}`)}
                                        >
                                            <td className="px-6 py-4 text-center text-[#64748B]">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
                                                        <Users size={16} className="text-[#94A3B8]" />
                                                    </div>
                                                    <span className="font-semibold text-[#1E293B] text-[0.8125rem]">
                                                        {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#475569] font-medium text-[0.8125rem]">
                                                {user.mobile}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${user.role === 'Investor' ? 'bg-[#FFF8E6] text-[#D97706]' :
                                                    user.role === 'Employee' ? 'bg-[#EBF2FF] text-[#2563EB]' :
                                                        user.role === 'SpecialCategory' ? 'bg-[#F3E8FF] text-[#9333EA]' :
                                                            'bg-[#F1F5F9] text-[#475569]'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-[#1E293B]">
                                                {user.referral_count}
                                            </td>
                                            <td className="px-6 py-4 text-center text-[#475569]">
                                                {user.units_purchased || 0}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-[#D97706]">
                                                    {user.total_coins?.toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-[#64748B]">
                                                {user.created_date ? new Date(user.created_date).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center pb-8">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B] bg-white hover:bg-[#F8FAFC] disabled:opacity-50 transition-all shadow-sm"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = 1;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage === pageNum
                                            ? 'bg-[#3B82F6] text-white'
                                            : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#64748B] bg-white hover:bg-[#F8FAFC] disabled:opacity-50 transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkTab;
