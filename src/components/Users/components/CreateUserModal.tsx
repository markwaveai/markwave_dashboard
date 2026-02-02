import React, { useState, useEffect } from 'react'; // Refreshed
import { X } from 'lucide-react';
import { userService } from '../../../services/api';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';

export interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    adminReferralCode?: string; // Optional context
    initialData?: CreateUserFormData | null; // For Edit Mode
    isEditMode?: boolean;
}

export interface CreateUserFormData {
    mobile: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    referral_code: string;
    is_test: boolean;
    refered_by_mobile?: string;
    refered_by_name?: string;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess, adminReferralCode, initialData, isEditMode = false }: CreateUserModalProps) => {
    const [formData, setFormData] = useState<CreateUserFormData>({
        mobile: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'Investor',
        referral_code: '',
        is_test: false,
        refered_by_mobile: '',
        refered_by_name: '',
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Reset form when opened
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    ...initialData,
                    refered_by_mobile: initialData.refered_by_mobile || '',
                    refered_by_name: initialData.refered_by_name || ''
                });
            } else {
                setFormData({
                    mobile: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    role: 'Investor',
                    referral_code: '',
                    is_test: false,
                    refered_by_mobile: '',
                    refered_by_name: '',
                });
            }
            setErr(null);
            setValidationErrors({});
        }
    }, [isOpen, isEditMode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear inline error on change
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[name];
                return newErrs;
            });
        }
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formData.mobile || formData.mobile.length < 10) errors.mobile = 'Valid mobile number is required';
        if (!formData.first_name) errors.first_name = 'First name is required';
        if (!formData.last_name) errors.last_name = 'Last name is required';
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setLoading(true);
        setErr(null);

        try {
            if (isEditMode) {
                // Edit Logic
                await axios.put(API_ENDPOINTS.updateUser(formData.mobile), {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    refered_by_mobile: formData.refered_by_mobile,
                    refered_by_name: formData.refered_by_name,
                    // Add other fields if API supports them
                });
                onSuccess();
                onClose();
            } else {
                // Create Logic
                // Adapt formData to API expectation
                const apiData: any = {
                    ...formData,
                    is_test: String(formData.is_test) // API likely expects string "true"/"false" based on previous code
                };

                const result = await userService.createUser(apiData);

                if (result.error) {
                    setErr(result.error);
                } else {
                    onSuccess();
                    onClose();
                }
            }
        } catch (error: any) {
            setErr(error.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
        }
    };

    // Helper to fetch referrer details on blur (logic reused from UserTabs)
    const handleReferrerBlur = async () => {
        if (!formData.refered_by_mobile || formData.refered_by_mobile.length < 10) return;
        try {
            const response = await axios.get(API_ENDPOINTS.getUserDetails(formData.refered_by_mobile));
            if (response.data && response.data.user) {
                const user = response.data.user;
                const fullName = (user.first_name || user.last_name) ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : user.name || '';
                setFormData(prev => ({ ...prev, refered_by_name: fullName }));
            }
        } catch (e) {
            // Ignore error
        }
    };

    if (!isOpen) return null;

    const roleName = formData.role === 'Investor' ? 'Investor' : formData.role === 'SpecialCategory' ? 'Special Category' : 'Employee';
    const title = isEditMode ? 'Edit User' : `Add New ${roleName}`;
    const submitText = isEditMode ? 'Update User' : `Create ${roleName}`;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col h-auto max-h-[min(85vh,800px)] overflow-hidden transform transition-all animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{isEditMode ? 'Update user details' : 'Enter details to create a new account'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-3">

                        {err && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                                {err}
                            </div>
                        )}

                        {/* Role & Mobile Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Role</label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={isEditMode}
                                        className={`w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white text-sm text-gray-900 ${isEditMode ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
                                    >
                                        <option value="Investor">Investor</option>
                                        <option value="Employee">Employee</option>
                                        <option value="SpecialCategory">Special Category</option>
                                    </select>
                                    {!isEditMode && (
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                            <svg className="w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="Enter mobile number"
                                    disabled={isEditMode}
                                    className={`w-full px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 ${validationErrors.mobile ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} ${isEditMode ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                />
                                {validationErrors.mobile && <p className="text-[10px] text-red-600 font-medium">{validationErrors.mobile}</p>}
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className={`w-full px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 ${validationErrors.first_name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                />
                                {validationErrors.first_name && <p className="text-[10px] text-red-600 font-medium">{validationErrors.first_name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className={`w-full px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 ${validationErrors.last_name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                />
                                {validationErrors.last_name && <p className="text-[10px] text-red-600 font-medium">{validationErrors.last_name}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900"
                            />
                        </div>

                        {/* Referrer Details */}
                        <div className="pt-2 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Referrer Details</h4>
                            <div className="space-y-2">
                                {!isEditMode ? (
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide">Referral Code</label>
                                        <input
                                            type="text"
                                            name="referral_code"
                                            value={formData.referral_code}
                                            onChange={handleChange}
                                            placeholder={adminReferralCode || "Enter Referral Code"}
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900"
                                        />
                                    </div>
                                ) : (
                                    // In edit mode we show referrer fields explicitly as per EditReferralModal
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide">Referrer Mobile</label>
                                            <input
                                                type="tel"
                                                name="refered_by_mobile"
                                                value={formData.refered_by_mobile}
                                                onChange={handleChange}
                                                onBlur={handleReferrerBlur} // Auto fetch name
                                                placeholder="Referrer Mobile"
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide">Referrer Name</label>
                                            <input
                                                type="text"
                                                name="refered_by_name"
                                                value={formData.refered_by_name}
                                                onChange={handleChange}
                                                placeholder="Referrer Name"
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900"
                                            />
                                        </div>
                                    </div>
                                )}

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_test"
                                            checked={formData.is_test}
                                            onChange={handleChange}
                                            className="peer h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">Test Account</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:transform active:scale-[0.98] transition-all font-semibold text-xs shadow-sm hover:shadow disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : submitText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
