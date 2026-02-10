import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import type { RootState } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { fetchManagedUsers } from '../../../store/slices/usersSlice';
import Pagination from '../../common/Pagination';
import TableSkeleton from '../../common/TableSkeleton';
import { CreateUser, CreateUserFormData, CreateUserProps } from './CreateUser';
import { Plus, Pencil } from 'lucide-react';


interface UserDetailsProps {
    getSortIcon: (key: string, currentSortConfig: any) => string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ getSortIcon }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { managedUsers, managedLoading, managedTotal } = useAppSelector((state: RootState) => state.users);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<CreateUserFormData | null>(null);

    // URL Search Params for Pagination
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 10;

    // Filter State
    const [role, setRole] = useState<string>('');
    const [verified, setVerified] = useState<string>('');
    const [createdDate, setCreatedDate] = useState<string>('');

    const fetchParams = useMemo(() => ({
        page: currentPage,
        limit: itemsPerPage,
        role: role || undefined,
        verified: verified === 'true' ? true : (verified === 'false' ? false : undefined),
        created_date: createdDate || undefined
    }), [currentPage, role, verified, createdDate]);

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

    const totalPages = Math.ceil((managedTotal || (managedUsers.length < itemsPerPage ? currentPage * itemsPerPage : (currentPage + 1) * itemsPerPage)) / itemsPerPage);

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

    const handleEditClick = (e: React.MouseEvent, user: any) => {
        e.stopPropagation(); // Prevent row click
        setEditingUser({
            mobile: user.mobile,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            role: user.role || 'Investor',
            referral_code: '', // Not editable usually
            is_test: false, // Default
            refered_by_mobile: user.refered_by_mobile || '',
            refered_by_name: user.refered_by_name || ''
        } as CreateUserFormData);
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingUser(null);
    };

    return (
        <div className="bg-gray-50 min-h-screen relative">
            <div className="bg-white border-b border-gray-200 p-6 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage Users and Referrals</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Role Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="block w-full px-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 border outline-none transition-all"
                        >
                            <option value="">All Roles</option>
                            <option value="Investor">Investor</option>
                            <option value="Employee">Employee</option>
                            <option value="SpecialCategory">Special Category</option>
                        </select>
                    </div>

                    {/* Verified Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified Status</label>
                        <select
                            value={verified}
                            onChange={handleVerifiedChange}
                            className="block w-full px-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 border outline-none transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Verified</option>
                            <option value="false">Pending</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Created Date</label>
                        <input
                            type="date"
                            value={createdDate}
                            onChange={handleDateChange}
                            className="block w-full px-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 border outline-none transition-all"
                        />
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setRole('');
                                setVerified('');
                                setCreatedDate('');
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98]"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">S.No</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Name</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Mobile</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Role</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Earned Coins</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Used Coins</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Referred By</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Verified</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Created Date</th>
                                    <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {managedLoading ? (
                                    <TableSkeleton cols={10} rows={10} />
                                ) : managedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-base">No users found matching your filters</td>
                                    </tr>
                                ) : (
                                    managedUsers.map((user: any, index: number) => (
                                        <tr key={user.mobile || index} className="bg-white hover:bg-gray-50/80 transition-colors group text-center whitespace-nowrap">
                                            <td className="px-4 py-4 text-gray-400 font-mono">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-4 py-4 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '-'}
                                            </td>
                                            <td className="px-4 py-4 font-mono text-gray-600">
                                                <span
                                                    className="hover:text-blue-600 hover:underline cursor-pointer decoration-2 underline-offset-2"
                                                    onClick={() => handleMobileClick(user.mobile)}
                                                >
                                                    {user.mobile || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
                                                        {user.role === 'SpecialCategory' ? 'Special Category' : (user.role || 'Investor')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">{user.earned_coins || 0}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">{user.used_coins || 0}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="font-medium text-gray-900">{user.refered_by_name || '-'}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                        {user.refered_by_mobile || ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold border ${user.verified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.verified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        {user.verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 font-mono text-xs">
                                                {user.user_created_date ? new Date(user.user_created_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={(e) => handleEditClick(e, user)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    setEditingUser(null);
                    setIsCreateModalOpen(true);
                }}
                className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-110 active:scale-95 transition-all z-40 group focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                aria-label="Add User"
            >
                <Plus className="w-6 h-6" />
                <span className="absolute right-full mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Create User
                </span>
            </button>

            {/* Create/Edit User Modal */}
            <CreateUser
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => {
                    dispatch(fetchManagedUsers(fetchParams));
                    /* Optional: Show toast */
                }}
                initialData={editingUser}
                isEditMode={!!editingUser}
                adminReferralCode={useAppSelector((state: RootState) => state.users.adminProfile?.referral_code)}
            />
        </div>
    );
};

export default UserDetails;
