import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAdmins } from '../../../store/slices/usersSlice';
import { User, Shield, Mail, Phone, MapPin, Loader2, AlertCircle, Plus, X, Check, ArrowRight, MessageSquare, Building2 } from 'lucide-react';
import type { RootState } from '../../../store';
import { otpService, userService, farmService } from '../../../services/api';
import { Farm } from '../../../types';
import { setSnackbar } from '../../../store/slices/uiSlice';

const AdminListTab: React.FC = () => {
    const dispatch = useAppDispatch();
    const { admins, adminsLoading, adminsError, adminProfile } = useAppSelector((state: RootState) => state.users);
    const { adminMobile, referralCode } = useAppSelector((state: RootState) => state.auth);

    const effectiveReferralCode = adminProfile?.referral_code || referralCode || '';

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        role: 'Admin',
        referred_by_code: effectiveReferralCode
    });

    // SuperAdmin Auth state
    const [superAdminMobile, setSuperAdminMobile] = useState(adminMobile || '');
    const [otp, setOtp] = useState('');

    // Assign to Farm state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAdminForFarm, setSelectedAdminForFarm] = useState<any>(null);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState('');
    const [farmsLoading, setFarmsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignOtpSent, setAssignOtpSent] = useState(false);
    const [assignOtpLoading, setAssignOtpLoading] = useState(false);
    const [assignOtp, setAssignOtp] = useState('');
    const [assignSuperAdminMobile, setAssignSuperAdminMobile] = useState(adminMobile || '');

    // Reset/Auto-fill when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setSuperAdminMobile(adminMobile || '');
            setIsOtpSent(false);
            setOtp('');
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                mobile: '',
                role: 'Admin',
                referred_by_code: effectiveReferralCode
            });
        }
    }, [isModalOpen, adminMobile, effectiveReferralCode]);

    useEffect(() => {
        if (isAssignModalOpen) {
            setAssignSuperAdminMobile(adminMobile || '');
            setAssignOtpSent(false);
            setAssignOtp('');
            setSelectedFarmId('');
        }
    }, [isAssignModalOpen, adminMobile]);

    useEffect(() => {
        dispatch(fetchAdmins());
    }, [dispatch]);

    const fetchFarms = async () => {
        setFarmsLoading(true);
        try {
            const data = await farmService.getFarms('ACTIVE');
            setFarms(data);
        } catch (error) {
            console.error('Error fetching farms:', error);
            dispatch(setSnackbar({ message: 'Failed to fetch farms', type: 'error' }));
        } finally {
            setFarmsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!superAdminMobile || superAdminMobile.length !== 10) {
            dispatch(setSnackbar({ message: 'Please enter a valid 10-digit mobile number', type: 'error' }));
            return;
        }
        setOtpLoading(true);
        const result = await otpService.sendOtp(superAdminMobile);
        setOtpLoading(false);
        if (result.error) {
            dispatch(setSnackbar({ message: result.error, type: 'error' }));
        } else {
            setIsOtpSent(true);
            dispatch(setSnackbar({ message: 'OTP sent to your WhatsApp', type: 'success' }));
        }
    };

    const handleOpenAssignModal = (admin: any) => {
        setSelectedAdminForFarm(admin);
        setIsAssignModalOpen(true);
        fetchFarms();
    };

    const handleSendAssignOtp = async () => {
        if (!assignSuperAdminMobile) {
            dispatch(setSnackbar({ message: 'Please enter your mobile number', type: 'error' }));
            return;
        }
        setAssignOtpLoading(true);
        const result = await otpService.sendOtp(assignSuperAdminMobile);
        setAssignOtpLoading(false);
        if (result.error) {
            dispatch(setSnackbar({ message: result.error, type: 'error' }));
        } else {
            setAssignOtpSent(true);
            dispatch(setSnackbar({ message: 'OTP sent to your WhatsApp', type: 'success' }));
        }
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFarmId) {
            dispatch(setSnackbar({ message: 'Please select a farm', type: 'error' }));
            return;
        }
        if (!assignOtp) {
            dispatch(setSnackbar({ message: 'Please enter verification OTP', type: 'error' }));
            return;
        }

        setIsAssigning(true);
        const result = await farmService.assignAdminToFarm(
            selectedFarmId,
            selectedAdminForFarm.mobile,
            assignSuperAdminMobile,
            assignOtp
        );
        setIsAssigning(false);

        if (result.error) {
            dispatch(setSnackbar({ message: result.error, type: 'error' }));
        } else {
            dispatch(setSnackbar({ message: 'Admin assigned to farm successfully', type: 'success' }));
            setIsAssignModalOpen(false);
            dispatch(fetchAdmins());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            dispatch(setSnackbar({ message: 'First and last name are required', type: 'error' }));
            return;
        }

        if (formData.mobile.length !== 10) {
            dispatch(setSnackbar({ message: 'Admin mobile number must be 10 digits', type: 'error' }));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            dispatch(setSnackbar({ message: 'Please enter a valid email address', type: 'error' }));
            return;
        }

        if (!otp) {
            dispatch(setSnackbar({ message: 'Please enter the OTP', type: 'error' }));
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await userService.addAdmin(formData, superAdminMobile, otp);
            if (response.error) {
                dispatch(setSnackbar({ message: response.error, type: 'error' }));
            } else {
                dispatch(setSnackbar({ message: 'Admin added successfully', type: 'success' }));
                setIsModalOpen(false);
                dispatch(fetchAdmins());
                // Reset form
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    mobile: '',
                    role: 'Admin',
                    referred_by_code: ''
                });
                setOtp('');
                setSuperAdminMobile('');
                setIsOtpSent(false);
            }
        } catch (error) {
            dispatch(setSnackbar({ message: 'An error occurred', type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (adminsLoading && admins.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-32">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield size={24} className="text-indigo-400" />
                    </div>
                </div>
                <p className="mt-6 text-slate-500 font-bold animate-pulse">Fetching Admin List...</p>
            </div>
        );
    }

    if (adminsError) {
        return (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center m-8">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-rose-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Sync Failed</h3>
                <p className="text-rose-600 font-medium mb-6">{adminsError}</p>
                <button
                    onClick={() => dispatch(fetchAdmins())}
                    className="px-8 py-3 bg-white border-2 border-rose-200 text-rose-600 rounded-2xl font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95 shadow-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-bold m-0 text-slate-800 shrink-0 flex items-center gap-2">
                            <Shield className="text-indigo-600" />
                            Admin List
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Manage administrators and their assigned farms</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 shrink-0"
                    >
                        <Plus size={20} />
                        Add New Admin
                    </button>
                </div>

                {/* Admin Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-medium">No administrators found</p>
                        </div>
                    ) : (
                        admins.map((admin) => (
                            <div key={admin.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Card Header */}
                                <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:scale-110 transition-transform">
                                            {admin.first_name ? admin.first_name[0] : <User size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-800 m-0">
                                                {`${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Unnamed Admin'}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                                                    {Array.isArray(admin.roles) ? admin.roles.join(', ') : admin.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="p-6 space-y-3 bg-slate-50/30">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone size={14} className="text-slate-400 shrink-0" />
                                        <span className="font-medium">+91 {admin.mobile}</span>
                                    </div>
                                    {admin.email && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Mail size={14} className="text-slate-400 shrink-0" />
                                            <span className="truncate font-medium">{admin.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Assigned Farms */}
                                <div className="p-6 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin size={12} />
                                            Assigned Farm
                                        </h4>
                                        {(!admin.farms || admin.farms.length === 0) && (
                                            <button
                                                onClick={() => handleOpenAssignModal(admin)}
                                                className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2"
                                            >
                                                <Plus size={10} />
                                                Assign
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {admin.farms && admin.farms.length > 0 ? (
                                            admin.farms.map((farm: any) => (
                                                <div
                                                    key={farm.id}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${farm.status === 'ACTIVE'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-slate-50 text-slate-500 border-slate-100'
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${farm.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                                    {farm.location}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">No farms assigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 transition-all">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-auto max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Add New Admin</h3>
                                <p className="text-sm text-gray-500 mt-1">Enter details to create a new administrator account</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.first_name}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                setFormData({ ...formData, first_name: value });
                                            }}
                                            placeholder="Rahul"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.last_name}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                setFormData({ ...formData, last_name: value });
                                            }}
                                            placeholder="Kumar"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Email & Mobile Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="rahul@example.com"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-gray-700">Mobile Number</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">+91</span>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.mobile}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, mobile: value });
                                                }}
                                                placeholder="9876543210"
                                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Referral Row */}
                                <div className="space-y-1 pt-2 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Referral Code</h4>
                                    <input
                                        type="text"
                                        value={formData.referred_by_code}
                                        readOnly
                                        disabled
                                        className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>

                                {/* Authorization Section */}
                                <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-4">
                                    <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                                        <Shield size={14} />
                                        SUPERADMIN AUTHORIZATION
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Your Mobile</label>
                                            <input
                                                type="tel"
                                                value={superAdminMobile}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setSuperAdminMobile(value);
                                                }}
                                                placeholder="Your mobile number"
                                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>

                                        {!isOtpSent ? (
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={otpLoading || !superAdminMobile}
                                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                {otpLoading ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={16} />}
                                                Send Verification OTP
                                            </button>
                                        ) : (
                                            <div className="space-y-1 animate-in slide-in-from-right-4 duration-300">
                                                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Enter 6-Digit OTP</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        placeholder="XXXXXX"
                                                        className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-center font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOtp}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Resend
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isOtpSent || !otp}
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:transform active:scale-[0.98] transition-all font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        {isSubmitting ? 'Processing...' : 'Create Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Admin to Farm Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 transition-all">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-auto max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Assign to Farm</h3>
                                <p className="text-sm text-gray-500 mt-1">Select a farm to assign <b>{selectedAdminForFarm?.first_name}</b></p>
                            </div>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleAssignSubmit} className="space-y-5">
                                {/* Farm Selection */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Select Farm</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            required
                                            value={selectedFarmId}
                                            onChange={(e) => setSelectedFarmId(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none bg-white font-medium"
                                        >
                                            <option value="">{farmsLoading ? 'Loading farms...' : 'Choose a farm'}</option>
                                            {(() => {
                                                const assignedFarmIds = new Set(admins.flatMap(a => a.farms?.map((f: any) => f.id) || []));
                                                return farms.filter(f => !assignedFarmIds.has(f.id)).map((farm) => (
                                                    <option key={farm.id} value={farm.id}>
                                                        {farm.location} ({farm.availableUnits} units available)
                                                    </option>
                                                ));
                                            })()}
                                        </select>
                                    </div>
                                </div>

                                {/* Authorization Section */}
                                <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-4">
                                    <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                                        <Shield size={14} />
                                        SUPERADMIN AUTHORIZATION
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Your Mobile</label>
                                            <input
                                                type="tel"
                                                value={assignSuperAdminMobile}
                                                onChange={(e) => setAssignSuperAdminMobile(e.target.value)}
                                                placeholder="Your mobile number"
                                                className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>

                                        {!assignOtpSent ? (
                                            <button
                                                type="button"
                                                onClick={handleSendAssignOtp}
                                                disabled={assignOtpLoading || !assignSuperAdminMobile}
                                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                {assignOtpLoading ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={16} />}
                                                Send Verification OTP
                                            </button>
                                        ) : (
                                            <div className="space-y-1 animate-in slide-in-from-right-4 duration-300">
                                                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Enter 6-Digit OTP</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={assignOtp}
                                                        onChange={(e) => setAssignOtp(e.target.value)}
                                                        placeholder="XXXXXX"
                                                        className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-center font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSendAssignOtp}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Resend
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAssignModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAssigning || !assignOtpSent || !assignOtp}
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:transform active:scale-[0.98] transition-all font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isAssigning ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminListTab;
