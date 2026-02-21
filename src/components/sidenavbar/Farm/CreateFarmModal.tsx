import React, { useState, useEffect } from 'react';
import { X, MapPin, Tractor } from 'lucide-react';
import { farmService } from '../../../services/api';
import { CreateFarmRequest } from '../../../types';
import Snackbar from '../../common/Snackbar';
import OtpVerificationModal from '../../common/OtpVerificationModal';

interface CreateFarmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    initialData?: {
        id?: string;
        location: string;
        strength: string;
        status: string;
        isSelfBenefitsActive: boolean;
        isReferralBenefitsActive: boolean;
    } | null;
    isEditMode?: boolean;
    adminMobile?: string;
}

const CreateFarmModal: React.FC<CreateFarmModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    isEditMode = false,
    adminMobile
}) => {
    const [formData, setFormData] = useState({
        location: '',
        strength: '',
        status: 'ACTIVE',
        isSelfBenefitsActive: true,
        isReferralBenefitsActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    location: initialData.location,
                    strength: initialData.strength,
                    status: initialData.status,
                    isSelfBenefitsActive: initialData.isSelfBenefitsActive,
                    isReferralBenefitsActive: initialData.isReferralBenefitsActive,
                });
            } else {
                setFormData({
                    location: '',
                    strength: '',
                    status: 'ACTIVE',
                    isSelfBenefitsActive: true,
                    isReferralBenefitsActive: true,
                });
            }
        }
    }, [isOpen, isEditMode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.location || !formData.strength) {
            setSnackbar({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        if (!adminMobile) {
            setSnackbar({ message: 'Admin mobile number not found. Please log in again.', type: 'error' });
            return;
        }

        setIsOtpModalOpen(true);
    };

    const handleConfirmOtp = async (mobile: string, otp: string) => {
        setLoading(true);

        try {
            const farmData: CreateFarmRequest = {
                location: formData.location,
                strength: parseInt(formData.strength),
                status: formData.status,
                isSelfBenefitsActive: formData.isSelfBenefitsActive,
                isReferralBenefitsActive: formData.isReferralBenefitsActive,
            };

            let response;
            if (isEditMode && initialData?.id) {
                response = await farmService.updateFarm(initialData.id, farmData, mobile, otp);
            } else {
                response = await farmService.addFarm(farmData, mobile, otp);
            }

            if (response.error) {
                throw new Error(response.error);
            } else {
                onSuccess(isEditMode ? 'Farm updated successfully!' : 'Farm added successfully!');
                onClose();
            }
        } catch (error: any) {
            setSnackbar({ message: error.message || 'An unexpected error occurred', type: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            {isEditMode ? <MapPin size={20} /> : <Tractor size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Update Farm' : 'Add New Farm'}</h3>
                            <p className="text-xs text-gray-500">{isEditMode ? 'Update existing farm details' : 'Enter details to create a new farm'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Farm Location</label>
                        <input
                            type="text"
                            placeholder="Enter location (e.g. Kurnool)"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 bg-gray-50/50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Total Capacity (Units)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="e.g. 5000"
                            value={formData.strength}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setFormData({ ...formData, strength: val });
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 bg-gray-50/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 bg-gray-50/50 cursor-pointer"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="FULL">Full</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isSelfBenefitsActive}
                                    onChange={(e) => setFormData({ ...formData, isSelfBenefitsActive: e.target.checked })}
                                    className="peer h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                                />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Self Benefits</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isReferralBenefitsActive}
                                    onChange={(e) => setFormData({ ...formData, isReferralBenefitsActive: e.target.checked })}
                                    className="peer h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                                />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Referral Benefits</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all font-semibold text-sm shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (isEditMode ? 'Update Farm' : 'Add Farm')}
                        </button>
                    </div>
                </form>
            </div>
            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}
            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                onVerify={handleConfirmOtp}
                title="Admin Authorization"
                description={isEditMode ? "Authorize updating farm details." : "Authorize adding a new farm."}
                actionName={isEditMode ? "Update Farm" : "Add Farm"}
            />
        </div>
    );
};

export default CreateFarmModal;
