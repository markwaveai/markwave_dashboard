import React, { useState, useEffect } from 'react';
import { X, MapPin, Store } from 'lucide-react';
import { marketService } from '../../../services/api';
import { CreateMarketRequest } from '../../../types';
import Snackbar from '../../common/Snackbar';

interface CreateMarketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    initialData?: {
        id?: string;
        name: string;
        state: string;
        location: string;
        isActive: boolean;
    } | null;
    isEditMode?: boolean;
    adminMobile?: string;
}

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    isEditMode = false,
    adminMobile
}) => {
    const [formData, setFormData] = useState({
        name: '',
        state: '',
        location: '',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    name: initialData.name,
                    state: initialData.state,
                    location: initialData.location,
                    isActive: initialData.isActive,
                });
            } else {
                setFormData({
                    name: '',
                    state: '',
                    location: '',
                    isActive: true,
                });
            }
        }
    }, [isOpen, isEditMode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.state || !formData.location) {
            setSnackbar({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        if (!adminMobile) {
            setSnackbar({ message: 'Admin mobile number not found. Please log in again.', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const marketData: CreateMarketRequest = {
                name: formData.name,
                state: formData.state,
                location: formData.location,
                isActive: formData.isActive,
            };

            let response;
            if (isEditMode && initialData?.id) {
                response = await marketService.updateMarket(initialData.id, marketData, adminMobile);
            } else {
                response = await marketService.addMarket(marketData, adminMobile);
            }

            if (response.error) {
                throw new Error(response.error);
            } else {
                onSuccess(isEditMode ? 'Market updated successfully!' : 'Market added successfully!');
                onClose();
            }
        } catch (error: any) {
            setSnackbar({ message: error.message || 'An unexpected error occurred', type: 'error' });
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
                            {isEditMode ? <MapPin size={20} /> : <Store size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{isEditMode ? 'Update Market' : 'Add New Market'}</h3>
                            <p className="text-xs text-gray-500">{isEditMode ? 'Update existing market details' : 'Enter details to create a new market'}</p>
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
                        <label className="block text-sm font-semibold text-gray-700">Market Name</label>
                        <input
                            type="text"
                            placeholder="Enter market name (e.g. Hyderabad Market)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 bg-gray-50/50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">State</label>
                        <input
                            type="text"
                            placeholder="Enter state (e.g. Telangana)"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 bg-gray-50/50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Location</label>
                        <input
                            type="text"
                            placeholder="Enter location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 bg-gray-50/50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                            value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 bg-gray-50/50 cursor-pointer"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
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
                            {loading ? 'Processing...' : (isEditMode ? 'Update Market' : 'Add Market')}
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
        </div>
    );
};

export default CreateMarketModal;
