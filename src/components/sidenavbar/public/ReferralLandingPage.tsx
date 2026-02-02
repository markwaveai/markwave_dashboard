import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, MapPin, Share2, Copy } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { createReferralUser } from '../../../store/slices/UsersSlice';

const Modal = ({ isOpen, type, message, onClose }: { isOpen: boolean; type: 'success' | 'error'; message: string; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 animate-popIn`}>
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
                    {type === 'success' ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    )}
                </div>
                <h3 className={`text-lg font-bold text-center mb-2 ${type === 'success' ? 'text-gray-900' : 'text-red-900'}`}>
                    {type === 'success' ? 'Success!' : 'Error'}
                </h3>
                <p className="text-sm text-center text-gray-500 mb-6">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className={`w-full py-2.5 rounded-xl font-semibold text-white shadow-sm transition-all active:scale-95 ${type === 'success'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-200'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-200'
                        }`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

const ReferralLandingPage = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Get code from URL OR from navigation state (dashboard)
    const urlReferralCode = searchParams.get('referral_code');
    const stateReferralCode = location.state?.adminReferralCode;
    const referralCode = urlReferralCode || stateReferralCode || '';

    const [loading, setLoading] = React.useState(false);
    const [modalConfig, setModalConfig] = React.useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
        isOpen: false,
        type: 'success',
        message: ''
    });
    const [formData, setFormData] = React.useState({
        mobile: '',
        first_name: '',
        last_name: '',
        email: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Referral Code Validation
        if (!referralCode || referralCode.trim() === '') {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'Referral Code is missing. Please ensure you are using a valid referral link.'
            });
            return;
        }

        // Mobile Validation
        if (!/^\d{10}$/.test(formData.mobile)) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'Please enter a valid 10-digit mobile number.'
            });
            return;
        }

        // Name Validation
        if (formData.first_name.length > 30 || formData.last_name.length > 30) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'First name and Last name must be within 30 characters.'
            });
            return;
        }

        // Email Validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'Please enter a valid email address.'
            });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                mobile: formData.mobile,
                email: formData.email, // Optional email
                referral_code: referralCode,
                role: 'Investor' // Default role for public signups
            };

            const result = await dispatch(createReferralUser(payload)).unwrap();

            // Explicitly check for "User already exists" message if returned in success payload
            if (result && result.message === 'User already exists') {
                throw new Error('User already exists with this mobile number.');
            }

            setModalConfig({
                isOpen: true,
                type: 'success',
                message: 'User created successfully! Our team will contact you soon.'
            });
            setFormData({ mobile: '', first_name: '', last_name: '', email: '' });
        } catch (error: any) {
            const msg = typeof error === 'string' ? error : (error?.message || 'Failed to register. Please try again.');
            const isExistError = msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('already');

            setModalConfig({
                isOpen: true,
                type: 'error',
                message: isExistError ? 'User already exists with this mobile number.' : msg
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full font-['Inter'] text-black bg-[#f3f6fc]">
            {/* Navbar */}
            <nav className="flex flex-col sm:flex-row justify-between items-center px-4 md:px-[5%] py-3 bg-[#1e293b] text-white shadow-md gap-4 sm:gap-0">
                <div className="flex items-center gap-3 font-bold text-2xl text-white">
                    <span className="text-[1.8rem] font-[800] tracking-[-0.5px]">Animalkart</span>
                </div>

                <div className="hidden md:flex gap-[30px] font-medium items-center">
                    {/* Links could go here */}
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <MapPin size={16} />
                    <span className="text-[0.9rem] font-semibold">Kurnool</span>
                </div>
            </nav>

            {/* Promo Banner moved after header */}
            <div className="bg-[#eef2ff] text-black text-center p-2 text-sm font-semibold">
                You have been invited to enjoy sustainable returns with Animalkart! 🥳
            </div>

            {/* Admin Share Bar - Visible if referral code exists */}
            {referralCode && (
                <div className="w-full max-w-4xl mx-auto mt-4 px-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-full text-[#238E8B]">
                                <Share2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-black">Share Your Referral Link</h3>
                                <p className="text-sm text-black">Code: <span className="font-mono font-bold">{referralCode}</span></p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}${window.location.pathname}?referral_code=${referralCode}`;
                                    navigator.clipboard.writeText(url);
                                    // Optional: Show toast
                                    const btn = document.getElementById('copy-btn-text');
                                    if (btn) btn.innerText = 'Copied!';
                                    setTimeout(() => { if (btn) btn.innerText = 'Copy Link'; }, 2000);
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 transition-colors"
                            >
                                <Copy size={16} />
                                <span id="copy-btn-text">Copy Link</span>
                            </button>
                            {navigator.share && (
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}${window.location.pathname}?referral_code=${referralCode}`;
                                        navigator.share({
                                            title: 'Join Animalkart',
                                            text: 'Use my referral code to join Animalkart!',
                                            url: url
                                        }).catch(console.error);
                                    }}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-[#238E8B] text-white hover:bg-[#1b726f]"
                                >
                                    <Share2 size={16} />
                                    Share
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="flex flex-wrap max-w-[1400px] mx-auto p-6 md:p-10 gap-10 items-center lg:items-stretch justify-between">
                {/* Left Content - Image Only */}
                <div className="flex-1 min-w-[300px] md:min-w-[400px] flex flex-col w-full">
                    {/* Buffalo Image */}
                    <div className="mt-0 relative w-full h-[250px] md:h-[350px] lg:h-full flex overflow-hidden rounded-[20px]">
                        <img
                            src="/buffalo-family.jpg"
                            alt="Buffalo Family"
                            className="w-full h-full object-cover block animate-slowZoom"
                        />
                    </div>
                </div>

                {/* Right Form */}
                <div className="flex flex-col w-full max-w-[100%] md:max-w-[500px] lg:flex-[0_0_420px]">
                    <div className="bg-white p-6 md:p-[35px] rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] h-full flex flex-col justify-center">
                        <div className="text-center mb-6">
                            <h2 className="text-black text-[1.3rem] font-[800] mb-2.5 leading-[1.3]">Get Started Today</h2>
                            <p className="mb-4 text-black text-[0.95rem]">
                                Invest in <span className="font-semibold text-black">Sustainable Assets</span>
                            </p>
                            <div className="text-[#059669] text-[0.85rem] font-semibold flex items-center justify-center gap-1.5 bg-[#ecfdf5] px-3 py-1.5 rounded-[20px] inline-flex">
                                <ShieldCheck size={16} fill="currentColor" />
                                Trusted by 10k+ customers
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* 1. Mobile Number */}
                            <div className="relative mb-4">
                                <div className="absolute top-0 left-0 h-full w-14 flex items-center justify-center pointer-events-none z-10">
                                    <span className="text-gray-500 font-medium text-base pt-0.5">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    name="mobile"
                                    placeholder="Enter your mobile number *"
                                    className="w-full p-3.5 pl-14 mb-0 border border-[#e2e8f0] rounded-[50px] text-base outline-none transition-all duration-200 bg-[#f8fafc] focus:border-[#238E8B] focus:bg-white focus:shadow-[0_0_0_3px_rgba(35,142,139,0.12)]"
                                    value={formData.mobile}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, mobile: val });
                                    }}
                                    required
                                />
                            </div>

                            {/* 2. First Name & Last Name */}
                            <div className="flex gap-2.5 mb-4">
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name *"
                                    className="w-full p-3.5 mb-0 border border-[#e2e8f0] rounded-[50px] text-base outline-none transition-all duration-200 bg-[#f8fafc] focus:border-[#238E8B] focus:bg-white focus:shadow-[0_0_0_3px_rgba(35,142,139,0.12)] flex-1"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    maxLength={30}
                                    required
                                />
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name *"
                                    className="w-full p-3.5 mb-0 border border-[#e2e8f0] rounded-[50px] text-base outline-none transition-all duration-200 bg-[#f8fafc] focus:border-[#238E8B] focus:bg-white focus:shadow-[0_0_0_3px_rgba(35,142,139,0.12)] flex-1"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    maxLength={30}
                                    required
                                />
                            </div>

                            {/* 3. Email (Optional) */}
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address (Optional)"
                                className="w-full p-3.5 mb-3.5 border border-[#e2e8f0] rounded-[50px] text-base outline-none transition-all duration-200 bg-[#f8fafc] focus:border-[#238E8B] focus:bg-white focus:shadow-[0_0_0_3px_rgba(35,142,139,0.12)]"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                placeholder="Referral Code"
                                className="w-full p-3.5 mb-3.5 border border-[#e2e8f0] rounded-[50px] text-base outline-none transition-all duration-200 bg-[#f1f5f9] text-[#64748b] cursor-not-allowed"
                                value={referralCode}
                                readOnly
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full font-bold py-3 rounded-full transition mt-6 shadow-lg uppercase tracking-wide mb-4 disabled:opacity-70 disabled:cursor-not-allowed bg-[#238E8B] text-white hover:bg-[#1b726f]"
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>

                            <div className="text-center text-xs text-black mt-2">
                                By clicking submit, you agree to our <Link to="/privacy-policy" className="underline hover:text-blue-600 text-black" target="_blank">Terms and Policy</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <Modal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                message={modalConfig.message}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
            />
        </div>
    );
};

export default ReferralLandingPage;

