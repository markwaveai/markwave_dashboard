import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { API_ENDPOINTS } from './trueharvest-api';

const DeleteUser: React.FC = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [formData, setFormData] = useState({
        mobile: '',
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showSnackbar = (message: string, type: 'success' | 'error') => {
        setSnackbar({ message, type });
        setTimeout(() => setSnackbar(null), 5000);
    };

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const confirmAndSendOtp = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.sendOtp(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobile: formData.mobile,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.detail || data.message || data.error || (typeof data === 'string' ? data : 'Failed to send OTP');
                throw new Error(errorMessage);
            }

            setShowConfirm(false);
            setOtpSent(true);
            showSnackbar('OTP Sent Successfully', 'success');
        } catch (err: any) {
            showSnackbar(err.message || 'Error sending OTP', 'error');
            setShowConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.disableUser(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobile: formData.mobile,
                    otp: otp
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.detail || data.message || data.error || (typeof data === 'string' ? data : 'Failed to delete user');
                throw new Error(errorMessage);
            }

            showSnackbar(data.message || 'User deleted successfully', 'success');

            // Reset form to show the initial state again
            setOtpSent(false);
            setFormData({ mobile: '' });
            setOtp('');
        } catch (err: any) {
            showSnackbar(err.message || 'Error deleting user', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Snackbar */}
            {snackbar && (
                <div
                    className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white font-medium animate-[slideIn_0.3s_ease-out] ${snackbar.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                >
                    {snackbar.message}
                </div>
            )}

            <div className="relative min-h-full flex flex-col items-center justify-center py-10 px-4 animate-[fadeIn_0.5s_ease-out]">
                {/* Confirmation Modal */}
                {showConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !loading && setShowConfirm(false)}></div>
                        <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[slideIn_0.3s_ease-out]">
                            <button
                                onClick={() => !loading && setShowConfirm(false)}
                                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={loading}
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Confirm Deletion</h3>
                                <p className="text-gray-500 leading-relaxed mb-8">
                                    Are you sure you want to delete your account? This action will restrict access to your data. We will send an OTP to <span className="font-bold text-gray-900">+91 {formData.mobile}</span> to verify this request.
                                </p>

                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={confirmAndSendOtp}
                                        disabled={loading}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center"
                                    >
                                        {loading ? 'Sending...' : 'Yes, Send OTP'}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        disabled={loading}
                                        className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-[#1a1f3c] text-sm font-medium mb-8">Delete your account securely</p>

                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-w-5xl w-full transition-all duration-500">
                    {/* Left Side: Image */}
                    <div className="lg:w-3/5 w-full h-[300px] lg:h-auto overflow-hidden p-6">
                        <img
                            src="/app_icon.png"
                            alt="Deletion Banner"
                            className="w-full h-full object-cover rounded-2xl"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=2070&auto=format&fit=crop';
                            }}
                        />
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:w-2/5 w-full p-10 flex flex-col justify-center bg-white min-h-[500px]">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-[#1a1f3c] mb-2">Delete Account</h2>
                            <p className="text-gray-500 font-medium">We're sorry to see you go.</p>
                        </div>

                        {!otpSent ? (
                            <form onSubmit={handleInitialSubmit} className="space-y-5 animate-[slideIn_0.4s_ease-out]">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium border-r border-gray-200 pr-3">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Enter your registered mobile *"
                                        className="w-full pl-16 pr-4 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl text-gray-800 outline-none focus:ring-2 focus:ring-[#2a9d8f]/20 focus:border-[#2a9d8f] transition-all placeholder:text-gray-400"
                                        required
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold text-lg rounded-2xl shadow-lg shadow-[#2a9d8f]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    SEND OTP
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleDelete} className="space-y-6 text-center animate-[slideIn_0.4s_ease-out]">
                                <p className="text-gray-500 font-medium">
                                    OTP sent to <span className="text-[#1a1f3c] font-bold">+91 {formData.mobile}</span>
                                </p>

                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="w-full px-4 py-4 bg-[#f8fafc] border border-[#d1d5db] rounded-full text-center text-xl font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[#2a9d8f]/20 focus:border-[#2a9d8f] transition-all placeholder:text-gray-400"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#2a9d8f] hover:bg-[#21867a] disabled:bg-[#2a9d8f]/70 text-white font-bold text-lg rounded-full shadow-lg shadow-[#2a9d8f]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wide flex justify-center items-center gap-2"
                                >
                                    {loading && (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {loading ? 'DELETING...' : 'DELETE ACCOUNT'}
                                </button>

                                <div className="space-y-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="block w-full text-blue-500 font-semibold text-sm hover:underline transition-all"
                                    >
                                        Change Mobile Number
                                    </button>
                                    <a href="#" className="block text-gray-600 font-semibold text-sm underline decoration-gray-300 hover:text-gray-800 transition-colors">
                                        Terms and Policy
                                    </a>
                                </div>
                            </form>
                        )}

                        {!otpSent && (
                            <div className="mt-8 text-center text-sm">
                                <a href="#" className="text-gray-600 font-semibold underline decoration-gray-300 hover:text-gray-800 transition-colors">
                                    Terms and Policy
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeleteUser;
