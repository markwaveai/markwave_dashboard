import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Smartphone, Send, CheckCircle2 } from 'lucide-react';
import { otpService } from '../../services/api';
import Snackbar from './Snackbar';

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (mobile: string, otp: string) => Promise<void> | void;
    title?: string;
    description?: string;
    actionName?: string;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
    isOpen,
    onClose,
    onVerify,
    title = "Admin Verification Required",
    description = "Please verify your identity to authorize this action.",
    actionName = "Confirm Action"
}) => {
    const [adminMobile, setAdminMobile] = useState('');
    const [adminOtp, setAdminOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isOpen) {
            const mobile = getAdminMobile();
            setAdminMobile(mobile);
            setAdminOtp('');
            setOtpSent(false);
        }
    }, [isOpen]);

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

    const handleVerify = async () => {
        if (adminOtp.length < 4) {
            setSnackbar({ message: 'Please enter a valid OTP', type: 'error' });
            return;
        }

        setVerifying(true);
        try {
            await onVerify(adminMobile, adminOtp);
            onClose();
        } catch (error: any) {
            setSnackbar({ message: error.message || 'Verification failed', type: 'error' });
        } finally {
            setVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-scaleIn border border-white/20 font-sans">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#111827] to-[#374151] p-5 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <ShieldCheck size={22} className="text-[#10b981]" />
                            </div>
                            <div>
                                <h3 className="text-base font-black tracking-tight leading-tight">{title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{actionName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                        >
                            <X size={18} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                            {description}
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                    <Smartphone size={12} className="text-slate-300" /> Admin Mobile
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={adminMobile}
                                        onChange={(e) => setAdminMobile(e.target.value)}
                                        placeholder="Mobile Number"
                                        className="flex-1 px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-sm font-bold"
                                        disabled={otpSent}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp || otpSent || !adminMobile}
                                        className="px-5 py-3 bg-[#111827] text-white rounded-2xl text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-black/5"
                                    >
                                        {sendingOtp ? '...' : otpSent ? 'Sent' : 'Get OTP'}
                                    </button>
                                </div>
                            </div>

                            {otpSent && (
                                <div className="space-y-2 animate-slideDown">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                        <ShieldCheck size={12} className="text-emerald-400" /> WhatsApp OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={adminOtp}
                                        onChange={(e) => setAdminOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        className="w-full px-4 py-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-xl font-black tracking-[0.5em] text-center text-emerald-600"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleVerify}
                                disabled={verifying || !otpSent || adminOtp.length < 4}
                                className="w-full py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {verifying ? (
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} strokeWidth={3} />
                                        {actionName}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full mt-3 py-3 text-slate-400 font-bold text-[10px] tracking-widest uppercase hover:text-slate-600 transition-colors"
                            >
                                Cancel
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

export default OtpVerificationModal;
