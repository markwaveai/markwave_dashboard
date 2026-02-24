import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, Lock, CheckCircle, AlertCircle, X, LayoutDashboard, TreePine } from 'lucide-react';
import { API_CONFIG } from '../../config/api';
import { messaging } from '../../config/firebase';
import { getToken } from 'firebase/messaging';

interface LoginProps {
  onLogin: (session: { mobile: string; role: string | null; referralCode?: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedDashboard, setSelectedDashboard] = useState<'animalkart'>('animalkart');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'enterMobile' | 'enterOtp'>('enterMobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [serverOtp, setServerOtp] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('ak_dashboard_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.mobile) {
          onLogin({ mobile: parsed.mobile, role: parsed.role || null, referralCode: parsed.referralCode || '' });
        }
      } catch {
        // ignore invalid
      }
    }
  }, [onLogin]);

  const sendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    // Clear previous states
    setError(null);
    setInfo(null);

    // Animalkart Flow: Send OTP via WhatsApp
    setLoading(true);
    let fcmToken = '';

    try {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('[DEBUG] Notification permission granted. Requesting token from Firebase...');
          try {
            fcmToken = await getToken(messaging, {
              vapidKey: 'BI7QADN3NcxaEeiy8GoSAht_Ua52K8jvLPW66nHgWzMg7BAwkFLxt13Z70hwEwXJGu_XUOji2g18KOEAp13bMGQ'
            });
            console.log('[DEBUG] FCM Token generation SUCCESS:', fcmToken);
          } catch (fetchErr: any) {
            console.error('[DEBUG] FCM Token generation FAILED:', fetchErr?.message || fetchErr);
          }
        } else {
          console.log('Notification permission not granted');
        }
      } catch (tokenErr) {
        console.error('Error in permission wrapper', tokenErr);
      }

      const baseUrl = API_CONFIG.getBaseUrl();
      const res = await axios.post(`${baseUrl}/otp/send-whatsapp`, {
        mobile,
        appName: 'animalkart_dashboard', // Always animalkart_dashboard for this flow
        fcmToken, // Passed to backend
      });

      if (res.data?.statuscode !== 200) {
        setError(res.data?.message || 'Failed to send OTP');
        return;
      }

      const otpFromServer = res.data?.otp || null;
      setServerOtp(otpFromServer);
      setUserRole(res.data?.user?.role || null);
      setUserReferralCode(res.data?.user?.referral_code || res.data?.user?.referral_code || null);
      setStep('enterOtp');
      setInfo('OTP sent via WhatsApp.');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to send OTP';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP received on WhatsApp');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = API_CONFIG.getBaseUrl();
      const res = await axios.post(`${baseUrl}/otp/verify`, { mobile, otp });

      if (res.data?.statuscode !== 200) {
        setError(res.data?.message || 'Invalid OTP. Please try again.');
        return;
      }

      const role = userRole || 'Animalkart admin';
      const referralCode = userReferralCode || '';
      const session = { mobile, role, referralCode };
      handleLoginSuccess(session);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (session: any) => {
    // Show success snackbar
    setShowSnackbar(true);

    // Delay actual login to show snackbar
    setTimeout(() => {
      onLogin(session);
    }, 2000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans overflow-hidden">
      {/* Success Snackbar */}
      {showSnackbar && (
        <div className="fixed top-10 right-1/2 translate-x-1/2 md:translate-x-0 md:right-10 z-[100] animate-in fade-in slide-in-from-top-10 duration-500">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-emerald-500/50 backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base">Success!</p>
              <p className="text-white/90 text-sm">Welcome to Markwave Dashboard</p>
            </div>
          </div>
        </div>
      )}

      {/* Left side: Form Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-20 relative bg-slate-50">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <img
              src="/login-logo.png"
              alt="Logo"
              className="h-12 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/header-logo-new.png";
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h1>
              <p className="text-slate-500 text-sm">
                Enter your details to access the dashboard
              </p>
            </div>

            {/* Error/Info Messages */}
            {error && (
              <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {info && (
              <div className="flex items-center gap-3 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{info}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Mobile Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 ml-1 uppercase tracking-wider">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                    <Smartphone className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={step === 'enterOtp'}
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                    placeholder="Enter 10-digit number"
                  />
                </div>
              </div>

              {/* OTP Field - Rendered when step is enterOtp */}
              {step === 'enterOtp' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="text-xs font-semibold text-slate-700 ml-1 uppercase tracking-wider">Verification Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 tracking-[0.5em] text-center text-lg font-bold"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-4">
                {step === 'enterMobile' ? (
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="w-full flex justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending Check...</span>
                      </div>
                    ) : 'Continue'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={verifyOtp}
                      disabled={loading}
                      className="w-full flex justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                    >
                      {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>

                    <button
                      onClick={() => {
                        setStep('enterMobile');
                        setOtp('');
                        setError(null);
                        setInfo(null);
                      }}
                      className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      Change Mobile Number
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 text-center border-t border-slate-100">
              <p className="text-slate-400 text-xs font-medium tracking-wide">
                © Powered by Markwave
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Visuals */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-slate-900">
        <img
          src="/dashboard_wallpaper.jpeg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] hover:scale-110 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        {/* Modern Glassy Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-16">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight drop-shadow-md">
              Manage your cattle inventory <span className="text-blue-400">effortlessly</span>.
            </h2>
            <div className="flex gap-2">
              <div className="w-12 h-1.5 rounded-full bg-blue-500"></div>
              <div className="w-4 h-1.5 rounded-full bg-slate-600"></div>
              <div className="w-4 h-1.5 rounded-full bg-slate-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
