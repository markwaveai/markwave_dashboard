import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import type { RootState } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { fetchManagedUsers } from '../../../store/slices/usersSlice';
import Pagination from '../../common/Pagination';
import TableSkeleton from '../../common/TableSkeleton';
import { CreateUser, CreateUserFormData } from './CreateUser';
import { Plus, Pencil, Trash2, User, Calendar, RotateCcw } from 'lucide-react';


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
        <div className="bg-[#f8fafc] min-h-screen pb-24 font-sans text-slate-900">
            {/* Header and Filters Section */}
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#1e293b]">User Management</h2>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-6">
                    {/* Role Filter */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Role:</label>
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[140px]"
                        >
                            <option value="">All Roles</option>
                            <option value="Investor">Investor</option>
                            <option value="Employee">Employee</option>
                            <option value="SpecialCategory">Special Category</option>
                        </select>
                    </div>

                    {/* Verified Filter */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Verified Status:</label>
                        <select
                            value={verified}
                            onChange={handleVerifiedChange}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[140px]"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Verified</option>
                            <option value="false">Pending</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Created Date:</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={createdDate}
                                onChange={handleDateChange}
                                placeholder="mm/dd/yyyy"
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[180px]"
                            />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="ml-auto">
                        <button
                            onClick={() => {
                                setRole('');
                                setVerified('');
                                setCreatedDate('');
                                setCurrentPage(1);
                            }}
                            className="flex items-center gap-2 px-5 py-2 border border-blue-200 rounded-xl text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-all active:scale-95 shadow-sm shadow-blue-100/50"
                        >
                            <RotateCcw size={14} />
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="px-6">
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-[var(--color-gray-200)] overflow-hidden">
                    <div className="overflow-x-auto [scrollbar-width:thin]">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--color-gray-50)] border-b border-[var(--color-gray-200)]">
                                <tr>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight text-center">S.No</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight">User Name</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight">Mobile</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight text-center">Role</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight text-center">Referred By</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight text-center">Verified</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight text-center">Created Date</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-[var(--color-gray-500)] uppercase tracking-tight text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {managedLoading ? (
                                    <TableSkeleton cols={8} rows={10} />
                                ) : managedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <User size={32} className="text-slate-300" />
                                                <p className="text-slate-400 font-medium">No users found matching your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    managedUsers.map((user: any, index: number) => (
                                        <tr key={user.mobile || index} className="hover:bg-slate-50/50 transition-colors group">
                                            {/* S.No */}
                                            <td className="px-6 py-5 text-center font-bold text-slate-500 text-[12px]">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>

                                            {/* User Name */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm overflow-hidden">
                                                        <User size={20} className="text-slate-400" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-slate-800 text-sm truncate leading-tight">
                                                            {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Test User'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Mobile */}
                                            <td className="px-6 py-5">
                                                <span
                                                    className="text-slate-600 font-bold text-[13px] hover:text-blue-600 cursor-pointer transition-colors"
                                                    onClick={() => handleMobileClick(user.mobile)}
                                                >
                                                    {user.mobile || '9999999999'}
                                                </span>
                                            </td>

                                            {/* Role */}
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1.5 rounded-2xl text-[0.75rem] font-bold border ${user.role === 'Employee'
                                                        ? 'bg-purple-50 text-purple-600 border-purple-200/50'
                                                        : 'bg-blue-50 text-blue-600 border-blue-200/50'
                                                        }`}>
                                                        {user.role === 'SpecialCategory' ? 'Special Category' : (user.role || 'Investor')}
                                                    </span>
                                                </div>
                                            </td>


                                            {/* Referred By */}
                                            <td className="px-6 py-5 text-center text-[12px]">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-semibold text-slate-700">{user.refered_by_name || '-'}</span>
                                                    {user.refered_by_mobile && (
                                                        <span className="text-[11px] text-slate-400 font-medium">{user.refered_by_mobile}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Verified */}
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <div className="flex items-center gap-2 w-fit px-1">
                                                        <div className={`w-2 h-2 rounded-full ${user.verified ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`}></div>
                                                        <span className={`text-[0.8rem] font-bold ${user.verified ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                            {user.verified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Created Date */}
                                            <td className="px-6 py-5 text-center font-medium text-slate-500 text-[12px]">
                                                {user.user_created_date ? new Date(user.user_created_date).toLocaleDateString() : '-'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <button
                                                        onClick={(e) => handleEditClick(e, user)}
                                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Pencil className="w-4.5 h-4.5" />
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

                {/* Pagination */}
                <div className="mt-8 flex justify-end">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Add User Floating Button */}
            <button
                onClick={() => {
                    setEditingUser(null);
                    setIsCreateModalOpen(true);
                }}
                className="fixed bottom-10 right-10 flex items-center gap-2 pl-4 pr-2 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40 group focus:outline-none"
            >
                <span className="font-bold text-xs tracking-wide">Add User</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
            </button>

            {/* Create/Edit User Modal */}
            <CreateUser
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => {
                    dispatch(fetchManagedUsers(fetchParams));
                }}
                initialData={editingUser}
                isEditMode={!!editingUser}
                adminReferralCode={useAppSelector((state: RootState) => state.users.adminProfile?.referral_code)}
            />
        </div>
    );
};

export default UserDetails;
