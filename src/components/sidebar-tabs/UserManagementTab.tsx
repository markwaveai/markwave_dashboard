import React, { useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import type { RootState } from '../../store';
import { useTableSortAndSearch } from '../../hooks/useTableSortAndSearch';
import { fetchReferralUsers, fetchExistingCustomers } from '../../store/slices/usersSlice';
import Pagination from '../common/Pagination';
import TableSkeleton from '../common/TableSkeleton';
import './UserManagementTab.css';

interface UserManagementTabProps {
    getSortIcon: (key: string, currentSortConfig: any) => string;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ getSortIcon }) => {
    const dispatch = useAppDispatch();
    const { existingCustomers, referralUsers, referralLoading, existingLoading } = useAppSelector((state: RootState) => state.users);

    useEffect(() => {
        dispatch(fetchReferralUsers());
        dispatch(fetchExistingCustomers());
    }, [dispatch]);

    // URL Search Params for Pagination
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 15;

    // Search State
    const [searchTerm, setSearchTerm] = React.useState('');

    const setCurrentPage = useCallback((page: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', String(page));
            return newParams;
        });
    }, [setSearchParams]);

    // Combine and deduplicate users, filtering out Employees for the Animalkart view
    const allUsersMerged = useMemo(() => {
        const combined = [...existingCustomers, ...referralUsers];
        // Deduplicate by mobile and filter out Employees
        const seen = new Set();
        return combined.filter(user => {
            if (!user.mobile || seen.has(user.mobile)) return false;
            // Filter out employees as they are moved to Farmvest
            if (user.role === 'Employee') return false;

            seen.add(user.mobile);
            return true;
        });
    }, [existingCustomers, referralUsers]);


    // Custom Search Function
    const searchFn = useCallback((item: any, query: string) => {
        const lowerQuery = query.toLowerCase();
        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
        const mobile = item.mobile || '';
        const referedByName = (item.refered_by_name || '').toLowerCase();
        const referedByMobile = item.refered_by_mobile || '';

        return (
            fullName.includes(lowerQuery) ||
            mobile.includes(lowerQuery) ||
            referedByName.includes(lowerQuery) ||
            referedByMobile.includes(lowerQuery)
        );
    }, []);

    const {
        filteredData: filteredUsers,
        requestSort,
        sortConfig,
        searchQuery: activeSearchQuery, // Get current active search query
        setSearchQuery
    } = useTableSortAndSearch(allUsersMerged, { key: '', direction: 'asc' }, searchFn);

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            // Only update if search term has changed
            if (searchTerm !== activeSearchQuery) {
                setSearchQuery(searchTerm);
                // Only reset page if not already on page 1
                if (currentPage !== 1) {
                    setCurrentPage(1);
                }
            }
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, activeSearchQuery, setSearchQuery, currentPage, setCurrentPage]);

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
            <div className="user-management-header p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Unified view of all Investors and Referrals ({allUsersMerged.length} total)</p>
                </div>
                {/* Search Input */}
                <div className="w-full md:w-auto relative">
                    <input
                        type="text"
                        placeholder="Search by Name, Mobile, Referred By..."
                        className="w-full md:w-80 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
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
                                            {user.mobile || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role === 'SpecialCategory' ? 'Special Category' : (user.role || 'Investor')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{user.refered_by_name || '-'}</div>
                                            <div className="text-xs text-gray-400">
                                                {user.refered_by_mobile || '-'}
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

