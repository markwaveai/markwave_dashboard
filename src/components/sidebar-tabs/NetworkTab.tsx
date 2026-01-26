import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import type { RootState } from '../../store';
import { fetchNetwork } from '../../store/slices/usersSlice';
import Pagination from '../common/Pagination';
import TableSkeleton from '../common/TableSkeleton';
import { Award, Users, Target, ShoppingBag } from 'lucide-react';
import './NetworkTab.css';

const NetworkTab: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { network } = useAppSelector((state: RootState) => state.users);
    const { stats, users, loading, error } = network;

    // URL Search Params for Pagination
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 10;

    // Filter State
    const [role, setRole] = useState<string>('Investor');

    // Memoize params
    const fetchParams = useMemo(() => ({
        page: currentPage,
        limit: itemsPerPage,
        role: role || undefined,
    }), [currentPage, role]);

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
        <div className="network-tab-container">
            <div className="network-header p-6 bg-white border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-4">Network Overview</h2>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="stat-card bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Total Users</div>
                                <div className="text-xl font-bold">{stats.user_count}</div>
                            </div>
                        </div>
                        <div className="stat-card bg-yellow-50 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                                <Award size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Distributed Coins</div>
                                <div className="text-xl font-bold">{stats.total_distributed_coins?.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">Target: {stats.total_target_coins?.toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="stat-card bg-green-50 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full text-green-600">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Purchased Units</div>
                                <div className="text-xl font-bold">{stats.total_purchased_units || 0}</div>
                                <div className="text-xs text-gray-400">Target: {stats.total_target_units || 0}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                        >
                            <option value="Investor">Investor</option>
                            <option value="Employee">Employee</option>
                            <option value="SpecialCategory">Special Category</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="network-content p-6">
                <div className="table-container relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Mobile</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Referrals</th>
                                <th className="px-4 py-3">Coins Earned</th>
                                <th className="px-4 py-3">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton cols={7} rows={10} />
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No users found</td>
                                </tr>
                            ) : (
                                users.map((user: any, index: number) => (
                                    <tr
                                        key={user.mobile || index}
                                        className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate(`/user-management/network/${user.mobile}`)}
                                    >
                                        <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '-'}
                                        </td>
                                        <td className="px-4 py-3">{user.mobile}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{user.referral_count}</td>
                                        <td className="px-4 py-3 font-medium text-yellow-600">
                                            {user.total_coins?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.created_date ? new Date(user.created_date).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default NetworkTab;
