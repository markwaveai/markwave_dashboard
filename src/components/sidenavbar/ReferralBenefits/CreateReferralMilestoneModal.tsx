import React, { useState, useEffect } from 'react';
import { X, Gift, Type, ShoppingBag, Send, Star, Smartphone, ShieldCheck } from 'lucide-react';
import { referralBenefitService, otpService } from '../../../services/api';
import Snackbar from '../../common/Snackbar';
import { ReferralMilestone } from '../../../types';

interface CreateReferralMilestoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    milestone?: ReferralMilestone | null;
}

const CreateReferralMilestoneModal: React.FC<CreateReferralMilestoneModalProps> = ({ isOpen, onClose, onSuccess, milestone }) => {
    const [formData, setFormData] = useState({
        threshold: 0,
        reward: '',
        description: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [adminMobile, setAdminMobile] = useState('');
    const [adminOtp, setAdminOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    useEffect(() => {
        if (milestone) {
            setFormData({
                threshold: milestone.threshold,
                reward: milestone.reward,
                description: milestone.description || '',
                is_active: milestone.is_active
            });
        } else {
            setFormData({
                threshold: 0,
                reward: '',
                description: '',
                is_active: true // Default to active for new milestones
            });
        }

        const mobile = getAdminMobile();
        setAdminMobile(mobile);
        setAdminOtp('');
        setOtpSent(false);
    }, [milestone, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'threshold') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
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

        if (formData.threshold <= 0) {
            setSnackbar({ message: 'Threshold must be greater than 0', type: 'error' });
            return;
        }

        if (!formData.reward.trim()) {
            setSnackbar({ message: 'Reward title is required', type: 'error' });
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
            if (milestone) {
                result = await referralBenefitService.updateReferralMilestone(milestone.id, formData, adminMobile, adminOtp);
            } else {
                result = await referralBenefitService.createReferralMilestone(formData, adminMobile, adminOtp);
            }

            if (result.error) {
                setSnackbar({ message: result.error, type: 'error' });
            } else {
                setSnackbar({ message: milestone ? 'Milestone updated successfully!' : 'Milestone created successfully!', type: 'success' });
                setTimeout(() => {
                    onSuccess();
                    onClose();
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
                <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-scaleIn border border-white/20">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#111827] to-[#374151] p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/10">
                                <Star size={18} className="text-[#fbbf24] fill-[#fbbf24]" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold tracking-tight">{milestone ? 'Edit Milestone' : 'New Milestone'}</h3>
                                <p className="text-[10px] text-gray-400 font-medium">{milestone ? 'Update referral goal' : 'Set a new referral goal'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Form Container (Scrollable) */}
                    <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                        {/* OTP Verification Section */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 shadow-inner">
                            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-2">
                                <ShieldCheck size={14} className="text-[#10b981]" />
                                <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">Admin Verification</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                    <Smartphone size={10} /> Admin Mobile
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={adminMobile}
                                        onChange={(e) => setAdminMobile(e.target.value)}
                                        placeholder="Mobile Number"
                                        className="flex-1 px-3 py-2 bg-white border-2 border-transparent rounded-xl focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/5 outline-none transition-all text-xs font-bold"
                                        disabled={otpSent}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || otpSent || !adminMobile}
                                        className="px-3 py-2 bg-[#111827] text-white rounded-xl text-[10px] font-bold hover:bg-black transition-all disabled:opacity-50 whitespace-nowrap shadow-md"
                                    >
                                        {sendingOtp ? '...' : otpSent ? 'Sent' : 'OTP'}
                                    </button>
                                </div>
                            </div>

                            {otpSent && (
                                <div className="space-y-1.5 animate-slideDown">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                        <ShieldCheck size={10} /> WhatsApp OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={adminOtp}
                                        onChange={(e) => setAdminOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        className="w-full px-3 py-2 bg-white border-2 border-transparent rounded-xl focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/5 outline-none transition-all text-sm font-black tracking-[0.5em] text-center text-[#10b981]"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Milestone Details */}
                        <div className="space-y-4 pt-2 border-t border-gray-100 font-sans">
                            <div className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest pl-1">Milestone Details</div>

                            {/* Threshold Input */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[#94a3b8] uppercase tracking-[0.1em] flex items-center gap-1.5">
                                    <ShoppingBag size={12} /> Units Required
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        name="threshold"
                                        value={formData.threshold}
                                        onChange={handleChange}
                                        placeholder="e.g., 30"
                                        className="w-full px-4 py-2.5 bg-[#f8fafc] border-2 border-transparent rounded-xl focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/5 outline-none transition-all text-base font-bold text-[#111827]"
                                        required
                                        min="1"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#94a3b8] uppercase">Direct</div>
                                </div>
                                <p className="text-[9px] text-gray-400 font-medium ml-1 opacity-80">Threshold for direct referrals.</p>
                            </div>

                            {/* Reward Input */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[#94a3b8] uppercase tracking-[0.1em] flex items-center gap-1.5">
                                    <Gift size={12} /> Reward Title
                                </label>
                                <input
                                    type="text"
                                    name="reward"
                                    value={formData.reward}
                                    onChange={handleChange}
                                    placeholder="e.g., Thailand Trip"
                                    className="w-full px-4 py-2.5 bg-[#f8fafc] border-2 border-transparent rounded-xl focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/5 outline-none transition-all text-sm font-bold text-[#111827]"
                                    required
                                />
                            </div>

                            {/* Description Input */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[#94a3b8] uppercase tracking-[0.1em] flex items-center gap-1.5">
                                    <Type size={12} /> Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="e.g., 4D/3N All-inclusive getaway."
                                    rows={2}
                                    className="w-full px-4 py-2 bg-[#f8fafc] border-2 border-transparent rounded-xl focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/5 outline-none transition-all text-[13px] font-medium text-[#111827] resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-[#f1f5f9] text-[#475569] font-bold rounded-xl hover:bg-[#e2e8f0] transition-all active:scale-95 text-sm shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !otpSent || adminOtp.length < 4}
                                className="flex-[1.5] px-4 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl font-bold text-sm shadow-xl shadow-[#10b981]/20 hover:shadow-[#10b981]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={14} strokeWidth={3} />
                                        {milestone ? 'Update' : 'Create'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

export default CreateReferralMilestoneModal;
