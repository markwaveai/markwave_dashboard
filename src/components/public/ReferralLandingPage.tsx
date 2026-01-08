
import React from 'react';
import './ReferralLandingPage.css';
import { CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"
];

const ReferralLandingPage = () => {
    return (
        <div className="referral-landing-container">
            {/* Navbar */}
            <nav className="landing-navbar">
                <div className="landing-brand">
                    <span style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Animalkart</span>
                </div>

                <div className="landing-nav-links hidden md:flex">
                    {/* Links could go here */}
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <MapPin size={16} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Kurnool</span>
                </div>
            </nav>

            {/* Promo Banner moved after header */}
            <div className="promo-banner">
                You have been invited to enjoy sustainable returns with Animalkart! 🥳
            </div>

            {/* Hero Section */}
            <section className="landing-hero">
                {/* Left Content - Image Only */}
                <div className="hero-content">
                    {/* Buffalo Image */}
                    <div className="hero-image-container" style={{ marginTop: 0 }}>
                        <img
                            src="/buffalo-family.jpg"
                            alt="Buffalo Family"
                            className="hero-image"
                        />
                    </div>
                </div>

                {/* Right Form */}
                <div className="hero-form-container">
                    <div className="trial-form-card">
                        <div className="form-header">
                            <h2 className="form-title">Get Started Today</h2>
                            <p className="form-subtitle">
                                Invest in <span className="font-semibold text-slate-800">Sustainable Assets</span>
                            </p>
                            <div className="trust-badge">
                                <ShieldCheck size={16} fill="currentColor" />
                                Trusted by 10k+ farmers & investors
                            </div>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="text"
                                placeholder="Enter your name *"
                                className="landing-input"
                            />
                            <input
                                type="tel"
                                placeholder="Enter your mobile number *"
                                className="landing-input"
                            />
                            <input
                                type="text"
                                placeholder="Referral Code"
                                className="landing-input"
                                value="HAPIAOXE"
                                readOnly
                                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                            />


                            {/* Service features removed */}



                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition mt-6 shadow-lg uppercase tracking-wide mb-4"
                            >
                                Submit
                            </button>

                            <div className="text-center text-xs text-gray-500 mt-2">
                                By clicking submit, you agree to our <Link to="/privacy-policy" className="underline hover:text-blue-600" target="_blank">Terms and Policy</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Whatsapp Float */}
            <div className="whatsapp-float">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.658-.698c1.028.56 2.052.871 3.101.871l.001 0c3.181 0 5.768-2.586 5.768-5.766 0-1.541-.599-2.99-1.687-4.079C15.322 6.771 13.874 6.172 12.031 6.172zm5.723 8.356c-.236.666-1.166 1.258-1.594 1.332-.423.072-.942.203-3.266-.723-2.903-1.157-4.761-4.077-4.907-4.27-.145-.192-1.171-1.558-1.171-2.973 0-1.413.731-2.11 1.026-2.408.236-.239.522-.36.833-.36.145 0 .285.006.406.012.355.019.53.048.746.565.236.566.8 1.956.87 2.099.071.144.119.313.023.504-.095.191-.143.313-.286.481-.143.167-.302.373-.429.504-.144.143-.294.3-.127.585.167.287.742 1.225 1.593 1.983 1.09.972 1.933 1.272 2.208 1.415.275.144.434.12.598-.072.167-.191.716-.838.907-1.125.19-.287.38-.239.641-.144.262.096 1.666.786 1.951.928.286.144.476.216.547.336.072.119.072.694-.164 1.36z"></path>
                </svg>
            </div>
        </div>
    );
};

export default ReferralLandingPage;
