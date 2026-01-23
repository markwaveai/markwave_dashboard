import React, { useState, useEffect } from 'react';
import './DeactivateUserPage.css';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
    deactivateRequestOtp,
    deactivateConfirm,
    resetDeactivationState,
    activateRequestOtp,
    activateConfirm,
    resetActivationState,
} from '../../store/slices/usersSlice';

/* -------------------- Snackbar -------------------- */
const Snackbar = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
    return (
        <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 z-50 flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}
        >
            {type === 'success' ? (
                <ShieldCheck size={20} />
            ) : (
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">!</div>
            )}
            {message}
        </div>
    );
};

/* -------------------- Modal (Success/Error) -------------------- */
const Modal = ({
    isOpen,
    type,
    message,
    onClose,
}: {
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
                <h3
                    className={`text-lg font-bold text-center mb-2 ${type === 'success' ? 'text-gray-900' : 'text-red-900'
                        }`}
                >
                    {type === 'success' ? 'Success!' : 'Error'}
                </h3>

                <p className="text-sm text-center text-gray-500 mb-6">{message}</p>

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

/* -------------------- Confirm Modal (OK/Cancel) -------------------- */
const ConfirmModal = ({
    isOpen,
    title,
    message,
    okText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'info',
}: {
    isOpen: boolean;
    title: string;
    message: string;
    okText?: string;
    cancelText?: string;
    type?: 'info' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-center text-gray-600 mb-6">{message}</p>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-white shadow-sm transition-all active:scale-95 ${type === 'danger'
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-200'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-200'
                            }`}
                    >
                        {okText}
                    </button>
                </div>
            </div>
        </div>
    );
};

type Mode = 'activate' | 'deactivate';
type Step = 'mobile' | 'otp';

const DeactivateUserPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { deactivation, activation } = useSelector((state: RootState) => state.users);

    const [mode, setMode] = useState<Mode>('deactivate');
    const [step, setStep] = useState<Step>('mobile');

    const [formData, setFormData] = useState({
        mobile: '',
        first_name: '',
        last_name: '',
        email: '',
    });

    const [otp, setOtp] = useState('');

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'danger';
        onConfirm: null | (() => void);
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
    });

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        message: '',
    });

    const [snackbar, setSnackbar] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success',
    });

    useEffect(() => {
        return () => {
            dispatch(resetDeactivationState());
            dispatch(resetActivationState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (deactivation.error) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: deactivation.error,
            });
        }
        if (activation.error) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: activation.error,
            });
        }
    }, [deactivation.error, activation.error]);

    const resetLocalForm = () => {
        setStep('mobile');
        setFormData({
            mobile: '',
            first_name: '',
            last_name: '',
            email: '',
        });
        setOtp('');
    };

    const handleModeSwitch = (newMode: Mode) => {
        setMode(newMode);
        resetLocalForm();
        dispatch(resetDeactivationState());
        dispatch(resetActivationState());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    /* -------------------- CONFIRM POPUP BEFORE OTP REQUEST -------------------- */
    const handleMobileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Mobile Validation
        if (!/^\d{10}$/.test(formData.mobile)) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'Please enter a valid 10-digit mobile number.',
            });
            return;
        }

        // ✅ Name Validation
        if (formData.first_name.length > 30 || formData.last_name.length > 30) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'First name and Last name must be within 30 characters.',
            });
            return;
        }

        // ✅ Email Validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'Please enter a valid email address.',
            });
            return;
        }

        // ✅ Confirm popup before calling OTP API
        setConfirmConfig({
            isOpen: true,
            title: mode === 'deactivate' ? 'Confirm Deactivation' : 'Confirm Activation',
            message:
                mode === 'deactivate'
                    ? `Are you sure you want to request OTP to deactivate account for +91 ${formData.mobile}?`
                    : `Are you sure you want to request OTP to activate account for +91 ${formData.mobile}?`,
            type: mode === 'deactivate' ? 'danger' : 'info',
            onConfirm: async () => {
                setConfirmConfig((prev) => ({ ...prev, isOpen: false }));

                if (mode === 'deactivate') {
                    const resultAction = await dispatch(
                        deactivateRequestOtp({
                            mobile: formData.mobile,
                            channel: 'whatsapp',
                        })
                    );

                    if (deactivateRequestOtp.fulfilled.match(resultAction)) {
                        setSnackbar({
                            show: true,
                            message: resultAction.payload.message || 'OTP sent successfully via whatsapp',
                            type: 'success',
                        });

                        setTimeout(() => {
                            setSnackbar((prev) => ({ ...prev, show: false }));
                            setStep('otp');
                        }, 1000);
                    }
                } else {
                    // ✅ Activate API Call
                    const resultAction = await dispatch(
                        activateRequestOtp({
                            mobile: formData.mobile,
                            channel: 'whatsapp',
                        })
                    );
                    if (activateRequestOtp.fulfilled.match(resultAction)) {
                        setSnackbar({
                            show: true,
                            message: resultAction.payload.message || 'OTP sent successfully via whatsapp',
                            type: 'success',
                        });

                        setTimeout(() => {
                            setSnackbar((prev) => ({ ...prev, show: false }));
                            setStep('otp');
                        }, 1000);
                    }
                }
            },
        });
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!/^\d{6}$/.test(otp)) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                message: 'Please enter a valid 6-digit OTP.',
            });
            return;
        }

        if (mode === 'deactivate') {
            const resultAction = await dispatch(
                deactivateConfirm({
                    mobile: formData.mobile,
                    otp: otp,
                })
            );

            if (deactivateConfirm.fulfilled.match(resultAction)) {
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    message: resultAction.payload.message || 'Account deactivated successfully',
                });
            }
        } else {
            // ✅ Activate Confirm
            const resultAction = await dispatch(
                activateConfirm({
                    mobile: formData.mobile,
                    otp: otp,
                })
            );

            if (activateConfirm.fulfilled.match(resultAction)) {
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    message: resultAction.payload.message || 'Account activated successfully',
                });
            }
        }
    };

    const handleCloseModal = () => {
        setModalConfig({ ...modalConfig, isOpen: false });

        if (modalConfig.type === 'success' && step === 'otp') {
            resetLocalForm();
            dispatch(resetDeactivationState());
            dispatch(resetActivationState());
        }
    };

    return (
        <div className="deactivate-user-container">
            {/* Navbar */}
            <nav className="landing-navbar">
                <div className="landing-brand">
                    <span style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        Animalkart
                    </span>
                </div>
            </nav>

            <div className="promo-banner">
                {mode === 'deactivate' ? 'Deactivate your account securely' : 'Activate your account securely'}
            </div>

            <section className="landing-hero">
                {/* Left */}
                <div className="hero-content">
                    <div className="hero-image-container" style={{ marginTop: 0 }}>
                        <img src="/buffalo-family.jpg" alt="Buffalo Family" className="hero-image" />
                    </div>
                </div>

                {/* Right */}
                <div className="hero-form-container">
                    <div className="trial-form-card">
                        {/* Two Buttons */}
                        <div className="mode-switch">
                            <button
                                type="button"
                                className={`mode-btn ${mode === 'activate' ? 'active' : ''}`}
                                onClick={() => handleModeSwitch('activate')}
                            >
                                Activate User
                            </button>

                            <button
                                type="button"
                                className={`mode-btn ${mode === 'deactivate' ? 'active danger' : 'danger'}`}
                                onClick={() => handleModeSwitch('deactivate')}
                            >
                                Deactivate User
                            </button>
                        </div>

                        <div className="form-header">
                            <h2 className="form-title">{mode === 'deactivate' ? 'Deactivate Account' : 'Activate Account'}</h2>

                            <p className="form-subtitle">
                                {mode === 'deactivate' ? (
                                    <span className="font-semibold text-black">We're sorry to see you go.</span>
                                ) : (
                                    <span className="font-semibold text-black">Welcome back! Let's activate your account.</span>
                                )}
                            </p>
                        </div>

                        {/* Form */}
                        {step === 'mobile' ? (
                            <form onSubmit={handleMobileSubmit}>
                                {/* Mobile */}
                                <div className="relative mb-4">
                                    <div className="absolute top-0 left-0 h-full w-14 flex items-center justify-center pointer-events-none z-10">
                                        <span className="text-gray-500 font-medium text-base pt-0.5">+91</span>
                                    </div>

                                    <input
                                        type="tel"
                                        name="mobile"
                                        placeholder="Enter your registered mobile *"
                                        className="landing-input !pl-14"
                                        style={{ marginBottom: 0 }}
                                        value={formData.mobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, mobile: val });
                                        }}
                                        required
                                    />
                                </div>

                                {/* First + Last */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="First Name *"
                                        className="landing-input"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        maxLength={30}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Last Name *"
                                        className="landing-input"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        maxLength={30}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                </div>

                                {/* Email */}
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address (Optional)"
                                    className="landing-input"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />

                                <button
                                    type="submit"
                                    disabled={deactivation.loading}
                                    className="w-full font-bold py-3 rounded-full transition mt-6 shadow-lg uppercase tracking-wide mb-4 disabled:opacity-70 disabled:cursor-not-allowed referral-btn"
                                    style={{
                                        backgroundColor: mode === 'deactivate' ? '#ef4444' : '#16a34a',
                                    }}
                                >
                                    {deactivation.loading || activation.loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleOtpSubmit}>
                                <div className="text-center mb-4 text-sm text-gray-600">
                                    OTP sent to <strong>+91 {formData.mobile}</strong>
                                </div>

                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="Enter OTP"
                                    className="landing-input text-center tracking-widest font-bold text-lg"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                />

                                <button
                                    type="submit"
                                    disabled={deactivation.loading}
                                    className="w-full font-bold py-3 rounded-full transition mt-6 shadow-lg uppercase tracking-wide mb-4 disabled:opacity-70 disabled:cursor-not-allowed referral-btn"
                                    style={{
                                        backgroundColor: mode === 'deactivate' ? '#ef4444' : '#16a34a',
                                    }}
                                >
                                    {deactivation.loading || activation.loading ? 'Processing...' : mode === 'deactivate' ? 'Deactivate Account' : 'Activate Account'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep('mobile')}
                                    className="w-full text-sm text-gray-500 hover:text-gray-800 underline"
                                >
                                    Change Mobile Number
                                </button>
                            </form>
                        )}

                        <div className="text-center text-xs text-black mt-2">
                            <Link to="/privacy-policy" className="underline hover:text-blue-600" target="_blank" style={{ color: '#000000' }}>
                                Terms and Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {snackbar.show && <Snackbar message={snackbar.message} type={snackbar.type} />}

            {/* ✅ Confirm modal */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                okText="OK"
                cancelText="Cancel"
                onConfirm={() => confirmConfig.onConfirm?.()}
                onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
            />

            {/* Success/Error modal */}
            <Modal isOpen={modalConfig.isOpen} type={modalConfig.type} message={modalConfig.message} onClose={handleCloseModal} />
        </div>
    );
};

export default DeactivateUserPage;
