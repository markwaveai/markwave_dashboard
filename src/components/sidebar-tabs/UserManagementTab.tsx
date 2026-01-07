import React, { useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { useTableSortAndSearch } from '../../hooks/useTableSortAndSearch';
import Pagination from '../common/Pagination';
import TableSkeleton from '../common/TableSkeleton';
import './UserManagementTab.css';

interface UserManagementTabProps {
    getSortIcon: (key: string, currentSortConfig: any) => string;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ getSortIcon }) => {
    const { existingCustomers, referralUsers, referralLoading, existingLoading } = useAppSelector((state: RootState) => state.users);

    // URL Search Params for Pagination
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 15;

    const setCurrentPage = useCallback((page: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', String(page));
            return newParams;
        });
    }, [setSearchParams]);

    // Combine and deduplicate users
    const allUsersMerged = useMemo(() => {
        const combined = [...existingCustomers, ...referralUsers];
        // Deduplicate by mobile
        const seen = new Set();
        return combined.filter(user => {
            if (!user.mobile || seen.has(user.mobile)) return false;
            seen.add(user.mobile);
            return true;
        });
    }, [existingCustomers, referralUsers]);

    const {
        filteredData: filteredUsers,
        requestSort,
        sortConfig
    } = useTableSortAndSearch(allUsersMerged);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    useEffect(() => {
        // Only clamp the page if we have finished loading all data
        if (!referralLoading && !existingLoading && currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage, setCurrentPage, referralLoading, existingLoading]);

    return (
        <div className="user-management-container">
            <div className="user-management-header p-4 border-b border-gray-200 bg-white">
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-sm text-gray-500 mt-1">Unified view of all Investors and Referrals ({allUsersMerged.length} total)</p>
            </div>

            <div className="user-management-content p-4">
                <div className="table-container relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="user-table w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('first_name')}>Name {getSortIcon('first_name', sortConfig)}</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('mobile')}>Mobile {getSortIcon('mobile', sortConfig)}</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('role')}>Role {getSortIcon('role', sortConfig)}</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('refered_by_name')}>Referred By {getSortIcon('refered_by_name', sortConfig)}</th>
                                <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('verified')}>Verified {getSortIcon('verified', sortConfig)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(referralLoading || existingLoading) ? (
                                <TableSkeleton cols={6} rows={10} />
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found</td>
                                </tr>
                            ) : (
                                currentItems.map((user: any, index: number) => (
                                    <tr key={user.mobile || index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.mobile ? `******${user.mobile.slice(-4)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role || 'Investor'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{user.refered_by_name || '-'}</div>
                                            <div className="text-xs text-gray-400">
                                                {user.refered_by_mobile ? `******${user.refered_by_mobile.slice(-4)}` : '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${user.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.verified ? 'Verified' : 'Pending'}
                                            </span>
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
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserManagementTab;

