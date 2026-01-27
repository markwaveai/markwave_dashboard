import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import type { RootState } from '../../store';
// import { useTableSortAndSearch } from '../../hooks/useTableSortAndSearch'; // Removing client-side sort/search for main data flow
import { useNavigate } from 'react-router-dom';
import { fetchManagedUsers } from '../../store/slices/usersSlice';
import Pagination from '../common/Pagination';
import TableSkeleton from '../common/TableSkeleton';
import './UserManagementTab.css';

interface UserManagementTabProps {
    getSortIcon: (key: string, currentSortConfig: any) => string;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ getSortIcon }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { managedUsers, managedLoading, managedTotal } = useAppSelector((state: RootState) => state.users);

    // URL Search Params for Pagination
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 10; // Default from spec

    // Filter State
    const [role, setRole] = useState<string>('');
    const [verified, setVerified] = useState<string>(''); // 'true' | 'false' | '' (string for select)
    const [createdDate, setCreatedDate] = useState<string>('');

    // Memoize the params to prevent unnecessary re-fetches if the object reference changes
    const fetchParams = useMemo(() => ({
        page: currentPage,
        limit: itemsPerPage,
        role: role || undefined,
        verified: verified === 'true' ? true : (verified === 'false' ? false : undefined),
        created_date: createdDate || undefined
    }), [currentPage, role, verified, createdDate]);

    // Fetch Data
    useEffect(() => {
        dispatch(fetchManagedUsers(fetchParams));
    }, [dispatch, fetchParams]);

    const setCurrentPage = useCallback((page: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', String(page));
            return newParams;
        });
    }, [setSearchParams]);

    // Calculate total pages
    // Spec doesn't guarantee 'total' in response but strict standard pagination needs it. 
    // If managedTotal is 0 but we have users, we assume at least one page.
    // If we have managedTotal, strict calculation.
    const totalPages = Math.ceil((managedTotal || (managedUsers.length < itemsPerPage ? currentPage * itemsPerPage : (currentPage + 1) * itemsPerPage)) / itemsPerPage);
    // Note: If API returns correct total, used that. 
    // If not, we might have issues. My thunk maps response.total to managedTotal.
    // Assuming backend returns total. If not, pagination might be restricted.

    // Handle Filters Change with useCallback
    const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
        setCurrentPage(1);
    }, [setCurrentPage]);

    const handleVerifiedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setVerified(e.target.value);
        setCurrentPage(1);
    }, [setCurrentPage]);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreatedDate(e.target.value);
        setCurrentPage(1);
    }, [setCurrentPage]);

    const handleMobileClick = (mobile: string) => {
        navigate(`/users/customers/${mobile}`);
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header p-4 border-b border-gray-200 bg-white flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">User Management</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage Users and Referrals</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    {/* Role Filter */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                        >
                            <option value="">All</option>
                            <option value="Investor">Investor</option>
                            <option value="Employee">Employee</option>
                            <option value="SpecialCategory">Special Category</option>
                        </select>
                    </div>

                    {/* Verified Filter */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Verified Status</label>
                        <select
                            value={verified}
                            onChange={handleVerifiedChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                        >
                            <option value="">All</option>
                            <option value="true">Verified</option>
                            <option value="false">Pending</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Created Date</label>
                        <input
                            type="date"
                            value={createdDate}
                            onChange={handleDateChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                        />
                    </div>

                    {/* Clear Filters (Optional but good UX) */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setRole('');
                                setVerified('');
                                setCreatedDate('');
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="user-management-content p-4">
                <div className="table-container relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="user-table w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Mobile</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Referred By</th>
                                <th className="px-4 py-3">Verified</th>
                                <th className="px-4 py-3">Created Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managedLoading ? (
                                <TableSkeleton cols={7} rows={10} />
                            ) : managedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No users found</td>
                                </tr>
                            ) : (
                                managedUsers.map((user: any, index: number) => (
                                    <tr key={user.mobile || index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="text-blue-600 hover:underline cursor-pointer"
                                                onClick={() => handleMobileClick(user.mobile)}
                                            >
                                                {user.mobile || '-'}
                                            </span>
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
                                        <td className="px-4 py-3">
                                            {user.user_created_date ? new Date(user.user_created_date).toLocaleDateString() : '-'}
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

export default UserManagementTab;
