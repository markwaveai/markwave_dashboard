import React, { useState, useEffect } from 'react';
import { X, Gift, Type, FileText, ShoppingBag, Send, Smartphone, ShieldCheck } from 'lucide-react';
import { selfBenefitService, otpService } from '../../../services/api';
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
    const [adminMobile, setAdminMobile] = useState('');
    const [adminOtp, setAdminOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

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

        const mobile = getAdminMobile();
        setAdminMobile(mobile);
        setAdminOtp('');
        setOtpSent(false);
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

    const handleSendOtp = async () => {
        if (!adminMobile || adminMobile.length < 10) {
            setSnackbar({ message: 'Please enter a valid mobile number', type: 'error' });
            return;
        }

        setSendingOtp(true);
        try {
            const result = await otpService.sendOtp(adminMobile);
            if (result.error) {
                setSnackbar({ message: result.error, type: 'error' });
            } else {
                setOtpSent(true);
                setSnackbar({ message: 'OTP sent successfully to WhatsApp!', type: 'success' });
            }
        } catch (error) {
            setSnackbar({ message: 'Failed to send OTP', type: 'error' });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setSnackbar({ message: 'Title is required', type: 'error' });
            return;
        }

        if (!otpSent) {
            setSnackbar({ message: 'Please request and enter OTP first', type: 'error' });
            return;
        }

        if (adminOtp.length < 4) {
            setSnackbar({ message: 'Please enter a valid OTP', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            let result;
            if (benefit) {
                result = await selfBenefitService.updateSelfBenefit(benefit.id, formData, adminMobile, adminOtp);
            } else {
                result = await selfBenefitService.createSelfBenefit(formData, adminMobile, adminOtp);
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
                        setAdminOtp('');
                        setOtpSent(false);
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
                    <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* OTP Verification Section */}
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                            <div className="flex items-center gap-2 border-b border-blue-100 pb-2 mb-2">
                                <ShieldCheck size={16} className="text-blue-600" />
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Admin Authorization</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Smartphone size={12} /> Admin Mobile
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={adminMobile}
                                        onChange={(e) => setAdminMobile(e.target.value)}
                                        placeholder="Admin Mobile Number"
                                        className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                        disabled={otpSent}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || otpSent || !adminMobile}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                                    </button>
                                </div>
                            </div>

                            {otpSent && (
                                <div className="space-y-1.5 animate-slideDown">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <ShieldCheck size={12} /> WhatsApp OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={adminOtp}
                                        onChange={(e) => setAdminOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold tracking-[0.5em] text-center text-blue-700"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Benefit Details Section */}
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Benefit Details</div>

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
                                    <ShoppingBag size={12} /> Units Required
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
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !otpSent || adminOtp.length < 4}
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
                    </div>
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
