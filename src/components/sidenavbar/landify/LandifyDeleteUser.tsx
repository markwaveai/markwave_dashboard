import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const LandifyDeleteUser: React.FC = () => {
    const [step, setStep] = useState(0); // 0: Enter Mobile, 1: Enter OTP
    const [formData, setFormData] = useState({
        mobile: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showSnackbar = (message: string, type: 'success' | 'error') => {
        setSnackbar({ message, type });
        setTimeout(() => setSnackbar(null), 5000);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.mobile) return;

        setLoading(true);
        try {
            const response = await fetch(`https://landify-backend-stagging-services-612299373064.asia-south2.run.app/users/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({ mobile: formData.mobile })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setStep(1);
            showSnackbar('OTP sent successfully', 'success');
        } catch (err: any) {
            showSnackbar(err.message || 'Error sending OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://landify-backend-stagging-services-612299373064.asia-south2.run.app/users/disable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    mobile: formData.mobile,
                    otp: formData.otp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete account');
            }

            showSnackbar('Account deleted successfully', 'success');
            setStep(0);
            setFormData({ mobile: '', otp: '' });
        } catch (err: any) {
            showSnackbar(err.message || 'Error deleting account', 'error');
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
                <p className="text-[#1a1f3c] text-sm font-medium mb-8">Delete your Landify account securely</p>

                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-w-5xl w-full transition-all duration-500">
                    {/* Left Side: Image */}
                    <div className="lg:w-3/5 w-full h-[300px] lg:h-auto overflow-hidden p-6">
                        <img
                            src="/landify_logo.jpeg"
                            alt="Landify Deletion Banner"
                            className="w-full h-full object-cover rounded-2xl"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=2070&auto=format&fit=crop';
                            }}
                        />
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:w-2/5 w-full p-10 flex flex-col justify-center bg-white min-h-[500px]">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-[#1a1f3c] mb-2">{step === 0 ? 'Delete Account' : 'Verify OTP'}</h2>
                            <p className="text-gray-500 font-medium">{step === 0 ? "We're sorry to see you go." : "Enter the code sent to your mobile"}</p>
                        </div>

                        {step === 0 ? (
                            <form onSubmit={handleSendOtp} className="space-y-5 animate-[slideIn_0.4s_ease-out]">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium border-r border-gray-200 pr-3">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Enter your registered mobile *"
                                        className="w-full pl-16 pr-4 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl text-gray-800 outline-none focus:ring-2 focus:ring-[#2a9d8f]/20 focus:border-[#2a9d8f] transition-all placeholder:text-gray-400 font-bold"
                                        required
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#2a9d8f] hover:bg-[#21867a] disabled:bg-gray-400 text-white font-bold text-lg rounded-2xl shadow-lg shadow-[#2a9d8f]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {loading ? 'SENDING...' : 'SEND OTP'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6 animate-[slideIn_0.4s_ease-out]">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">OTP CODE</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full px-4 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl text-center text-2xl font-black tracking-[0.5em] text-gray-800 outline-none focus:ring-2 focus:ring-[#2a9d8f]/20 focus:border-[#2a9d8f] transition-all placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-sm"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading || formData.otp.length < 4}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold text-lg rounded-2xl shadow-lg shadow-red-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {loading ? 'DELETING...' : 'DELETE ACCOUNT'}
                                    </button>
                                    <button
                                        onClick={() => setStep(0)}
                                        disabled={loading}
                                        className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all"
                                    >
                                        Back
                                    </button>
                                </div>
                                <div className="text-center">
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="text-[#2a9d8f] font-bold text-sm hover:underline bg-transparent border-none cursor-pointer"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 text-center text-sm">
                            <a href="#" className="text-gray-600 font-semibold underline decoration-gray-300 hover:text-gray-800 transition-colors">
                                Terms and Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandifyDeleteUser;
