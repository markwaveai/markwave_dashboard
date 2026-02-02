import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const LandifyDeactivateUser: React.FC = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({
        mobile: '',
    });
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

    const handleDeactivate = async () => {
        setLoading(true);
        try {
            // Using is_active=false for deactivation
            const response = await fetch(`https://landify-backend-services-612299373064.asia-south2.run.app/auth/activate_deactivate_user/${formData.mobile}?is_active=false`, {
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'X-Api-Key': 'lanidfy-testting-apikey',
                    'X-User-Phone': '9999999999'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to deactivate user');
            }

            setShowConfirm(false);
            showSnackbar('User deactivated successfully', 'success');
            setFormData({ mobile: '' });

        } catch (err: any) {
            showSnackbar(err.message || 'Error deactivating user', 'error');
            setShowConfirm(false);
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Confirm Deactivation</h3>
                                <p className="text-gray-500 leading-relaxed mb-8">
                                    Are you sure you want to deactivate your Landify account? This action will restrict access to your data.
                                </p>

                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={handleDeactivate}
                                        disabled={loading}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center"
                                    >
                                        {loading ? 'Deactivating...' : 'Yes, Deactivate'}
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

                <p className="text-[#1a1f3c] text-sm font-medium mb-8">Deactivate your Landify account securely</p>

                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-w-5xl w-full transition-all duration-500">
                    {/* Left Side: Image */}
                    <div className="lg:w-3/5 w-full h-[300px] lg:h-auto overflow-hidden p-6">
                        <img
                            src="/landify_logo.jpeg"
                            alt="Landify Deactivation Banner"
                            className="w-full h-full object-cover rounded-2xl"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=2070&auto=format&fit=crop';
                            }}
                        />
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:w-2/5 w-full p-10 flex flex-col justify-center bg-white min-h-[500px]">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-[#1a1f3c] mb-2">Deactivate Account</h2>
                            <p className="text-gray-500 font-medium">We're sorry to see you go.</p>
                        </div>

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
                                DEACTIVATE
                            </button>
                        </form>

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

export default LandifyDeactivateUser;
