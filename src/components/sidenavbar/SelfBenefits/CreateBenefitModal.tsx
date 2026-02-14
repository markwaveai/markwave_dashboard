import React, { useState, useEffect } from 'react';
import { X, Gift, Type, FileText, ShoppingBag, Send } from 'lucide-react';
import { selfBenefitService } from '../../../services/api';
import Snackbar from '../../common/Snackbar';
import { SelfBenefit } from '../../../types';

interface BenefitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    benefit?: SelfBenefit | null;
}

const BenefitModal: React.FC<BenefitModalProps> = ({ isOpen, onClose, onSuccess, benefit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        units_required: 0,
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (benefit) {
            setFormData({
                title: benefit.title,
                description: benefit.description,
                units_required: benefit.units_required,
                is_active: benefit.is_active
            });
        } else {
            setFormData({
                title: '',
                description: '',
                units_required: 0,
                is_active: true // Default to active
            });
        }
    }, [benefit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'units_required') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const getAdminMobile = () => {
        try {
            const session = localStorage.getItem('ak_dashboard_session');
            if (session) {
                const parsed = JSON.parse(session);
                return parsed.mobile || '';
            }
        } catch (e) {
            console.error('Error parsing session:', e);
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setSnackbar({ message: 'Title is required', type: 'error' });
            return;
        }

        const adminMobile = getAdminMobile();
        if (!adminMobile) {
            setSnackbar({ message: 'Admin session not found. Please log in again.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            let result;
            if (benefit) {
                result = await selfBenefitService.updateSelfBenefit(benefit.id, formData, adminMobile);
            } else {
                result = await selfBenefitService.createSelfBenefit(formData, adminMobile);
            }

            if (result.error) {
                setSnackbar({ message: result.error, type: 'error' });
            } else {
                setSnackbar({ message: benefit ? 'Benefit updated successfully!' : 'Benefit created successfully!', type: 'success' });
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    if (!benefit) {
                        // Reset form if it was a creation
                        setFormData({
                            title: '',
                            description: '',
                            units_required: 0,
                            is_active: true
                        });
                    }
                }, 1500);
            }
        } catch (error) {
            setSnackbar({ message: 'An unexpected error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-scaleIn border border-white/20">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                                <Gift size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold">{benefit ? 'Edit Benefit Rule' : 'New Benefit Rule'}</h3>
                                <p className="text-[10px] text-blue-100/80">{benefit ? 'Update reward configuration' : 'Configure reward details'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {/* Title Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Type size={12} /> Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Thailand Trip (1 Person)"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={12} /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the benefit details..."
                                rows={2}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none"
                            />
                        </div>

                        {/* Units Required */}
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                <ShoppingBag size={12} /> Units
                            </label>
                            <input
                                type="number"
                                name="units_required"
                                value={formData.units_required}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-blue-600"
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[1.5] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={16} />
                                        {benefit ? 'Update Reward' : 'Create Reward'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div >
            </div >

            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}
        </>
    );
};

export default BenefitModal;
