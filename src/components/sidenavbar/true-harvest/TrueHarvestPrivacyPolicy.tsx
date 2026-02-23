import React from 'react';

const PrivacyPolicy: React.FC = () => {
    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <section className="mb-16">
            <h2 className="text-[22px] font-extrabold text-[#1e293b] mb-8">{title}</h2>
            {children}
        </section>
    );


    return (
        <div className="min-h-full bg-white px-10 py-16 animate-[fadeIn_0.5s_ease-out] font-inter">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-[32px] font-extrabold text-[#1e293b] mb-2 tracking-tight">Privacy Policy & Terms and Conditions</h1>
                <p className="text-[#94a3b8] text-[12px] font-bold tracking-[0.1em] mb-16 uppercase">
                    LAST UPDATED: JANUARY 29, 2026
                </p>

                <div className="mb-16 bg-[#f8fafc] p-10 rounded-3xl border border-gray-50">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-6">
                        True Harvest ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
                        we collect, use, disclose, and safeguard your information when you use our mobile application, website, and
                        services (collectively, the "Services").
                    </p>
                    <p className="text-[#475569] text-[15px] leading-relaxed">
                        Please read this Privacy Policy carefully. By using our Services, you agree to the collection and use of
                        information in accordance with this policy. If you do not agree with our policies and practices, please do not use
                        our Services.
                    </p>
                </div>

                {/* 1. Information We Collect */}
                <Section title="1. Information We Collect">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-6 ml-4">
                        We collect several types of information from and about users of our Services:
                    </p>
                    <div className="space-y-12 ml-4">
                        {/* 1.1 Personal Information You Provide */}
                        <div>
                            <h3 className="text-[16px] font-bold text-[#1e293b] mb-6">1.1 Personal Information You Provide</h3>

                            {/* Account Information */}
                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Account Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Full name</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Mobile number (required for registration and login)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Email address</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Delivery address(es)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Date of birth (optional, for age verification)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Profile photo (optional)</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Payment Information */}
                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Payment Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Payment method details (card type, last 4 digits)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Billing address</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Transaction history</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <p>
                                            <span className="font-extrabold text-[#1e293b]">Note:</span> Full payment card details are processed and stored by our third-party payment processors (Razorpay, Paytm, Google Pay, PhonePe, etc.). We do not store complete card numbers or CVV codes on our servers.
                                        </p>
                                    </li>
                                </ul>
                            </div>

                            {/* Order Information */}
                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Order Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Products ordered</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Subscription preferences</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Delivery instructions</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Order history</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Standalone Bullet point */}
                            <div className="mb-8 ml-8">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Feedback and ratings</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Customer Support Information */}
                            <div className="ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Customer Support Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Support tickets and correspondence</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Complaint details and resolution history</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Call recordings (when you contact us by phone, with prior notice)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 1.2 Information Collected Automatically */}
                        <div>
                            <h3 className="text-[16px] font-bold text-[#1e293b] mb-6">1.2 Information Collected Automatically</h3>

                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Device Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Device type and model</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Operating system and version</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Unique device identifiers (IMEI, Android ID, IDFA)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Mobile network information</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>IP address</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Browser type and version</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Location Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Precise location (GPS coordinates) when you enable location services</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Approximate location (based on IP address or network)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Location history for delivery optimization</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <p>
                                            <span className="font-extrabold text-[#1e293b]">Note:</span> You can disable location access in your device settings, but this may affect service availability and delivery accuracy.
                                        </p>
                                    </li>
                                </ul>
                            </div>

                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Usage Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>App interaction data (screens viewed, features used)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Time and duration of app usage</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Search queries within the app</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Preferences and settings</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Crash reports and error logs</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Cookies and Tracking Technologies:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>We use cookies, web beacons, and similar technologies to collect information about your browsing behavior</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Session cookies (temporary, deleted when you close the app)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Persistent cookies (remain until you delete them or they expire)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Analytics cookies to understand usage patterns</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 1.3 Information from Third Parties */}
                        <div>
                            <h3 className="text-[16px] font-bold text-[#1e293b] mb-6">1.3 Information from Third Parties</h3>

                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Social Media:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>If you choose to link your account to social media platforms, we may receive basic profile information</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mb-8 ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Referral Information:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Information about users who referred you or whom you referred</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="ml-4">
                                <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Public Sources:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>We may collect information from publicly available sources to verify business addresses or serviceability</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 2. How We Use Your Information */}
                <Section title="2. How We Use Your Information">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-6 ml-4">
                        We use the information we collect for the following purposes:
                    </p>
                    <div className="space-y-10 ml-4">
                        <div>
                            <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">2.1 Service Delivery</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Create and manage your account</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Process and fulfill orders and subscriptions</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Arrange and optimize delivery routes</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Send order confirmations, updates, and delivery notifications</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Manage payments and issue invoices</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Handle returns, refunds, and exchanges</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">2.2 Customer Support</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Respond to your inquiries and support requests</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Troubleshoot technical issues</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Investigate and resolve complaints</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Conduct customer satisfaction surveys</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">2.3 Personalization</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Customize your app experience</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Recommend products based on your preferences and order history</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Remember your preferences and settings</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Display relevant content and offers</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">2.4 Marketing and Communications</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Send promotional offers, discounts, and special deals (with your consent)</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Notify you about new products, features, or services</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Send newsletters and updates about True Harvest</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Conduct market research and gather feedback</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>You can opt-out of marketing communications at any time</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">2.5 Analytics and Improvement</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Analyze usage patterns and trends</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Monitor and improve app performance</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Conduct data analysis and research</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Test new features and functionality</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Generate aggregate statistics (anonymized data)</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">2.6 Security and Fraud Prevention</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Verify your identity and prevent unauthorized access</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Detect and prevent fraudulent transactions</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Protect against security threats and abuse</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Enforce our Terms and Conditions</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Comply with legal obligations</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">2.7 Legal Compliance</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Respond to legal requests and prevent harm</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Comply with applicable laws and regulations</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Enforce our rights and agreements</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Resolve disputes</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* 3. How We Share Your Information */}
                <Section title="3. How We Share Your Information">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-8 ml-4 font-medium">
                        We do not sell your personal information to third parties. However, we may share your information in the following circumstances:
                    </p>

                    <div className="space-y-12 ml-4">
                        {/* 3.1 Service Providers */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">3.1 Service Providers</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-6">
                                We share information with third-party service providers who perform services on our behalf:
                            </p>

                            <div className="space-y-8 ml-4">
                                <div>
                                    <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Payment Processors:</p>
                                    <ul className="space-y-3 ml-4">
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Razorpay, Paytm, Google Pay, PhonePe, etc.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>They process payments securely according to PCI-DSS standards</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Delivery Partners:</p>
                                    <ul className="space-y-3 ml-4">
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Our delivery personnel and logistics partners receive your name, address, phone number, and order details to fulfill deliveries</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Cloud Services:</p>
                                    <ul className="space-y-3 ml-4">
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Amazon Web Services (AWS), Google Cloud Platform, or similar providers for data storage and hosting</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Analytics Services:</p>
                                    <ul className="space-y-3 ml-4">
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Google Analytics, Firebase Analytics, Mixpanel, or similar tools for usage analysis</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Communication Services:</p>
                                    <ul className="space-y-3 ml-4">
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>SMS gateway providers (for OTP and notifications)</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Email service providers (for transactional and marketing emails)</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Push notification services (Firebase Cloud Messaging, OneSignal)</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-[15px] font-extrabold text-[#1e293b] mb-4">Customer Support Tools:</p>
                                    <ul className="space-y-3 ml-4">
                                        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Zendesk, Freshdesk, or similar platforms for managing support tickets</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <p className="text-[#475569] text-[15px] leading-relaxed mt-8 ml-4">
                                All service providers are contractually obligated to protect your information and use it only for the purposes we specify.
                            </p>
                        </div>

                        {/* 3.2 Business Transfers */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">3.2 Business Transfers</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                If True Harvest is involved in a merger, acquisition, asset sale, or bankruptcy, your information may be transferred as part of that transaction. We will notify you via email and/or prominent notice in the app before your information is transferred.
                            </p>
                        </div>

                        {/* 3.3 Legal Requirements */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">3.3 Legal Requirements</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-6 ml-4">
                                We may disclose your information if required to do so by law or in response to:
                            </p>
                            <ul className="space-y-3 ml-8">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Court orders, subpoenas, or legal processes</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Requests from government authorities or law enforcement</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Protection of our rights, property, or safety</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Protection of users or the public from harm</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Prevention of fraud or illegal activity</span>
                                </li>
                            </ul>
                        </div>

                        {/* 3.4 With Your Consent */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">3.4 With Your Consent</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                We may share your information with third parties when you give us explicit consent to do so.
                            </p>
                        </div>

                        {/* 3.5 Aggregate/Anonymous Data */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">3.5 Aggregate/Anonymous Data</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-6 ml-4">
                                We may share aggregated or anonymized information that cannot identify you personally with:
                            </p>
                            <ul className="space-y-3 ml-8">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Business partners for joint marketing initiatives</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Researchers for statistical analysis</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Public reports on usage trends</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 4. Data Retention */}
                <Section title="4. Data Retention">
                    <div className="space-y-10 ml-4">
                        {/* 4.1 Active Accounts */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">4.1 Active Accounts</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed">
                                We retain your personal information for as long as your account is active and as necessary to provide you with Services.
                            </p>
                        </div>

                        {/* 4.2 Inactive Accounts */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">4.2 Inactive Accounts</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed">
                                If your account is inactive for 2 years, we may delete or anonymize your data after providing you with advance notice.
                            </p>
                        </div>

                        {/* 4.3 After Account Deletion */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">4.3 After Account Deletion</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-6">
                                When you request account deletion:
                            </p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Most personal information is deleted within 30 days</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Some information is retained for up to 90 days for legal, tax, and operational purposes</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Transaction records may be retained for up to 7 years as required by law</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Anonymized data may be retained indefinitely for analytics</span>
                                </li>
                            </ul>
                        </div>

                        {/* 4.4 Legal Obligations */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">4.4 Legal Obligations</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed">
                                We may retain certain information longer if required by law or to comply with legal obligations (e.g., tax records, financial transactions).
                            </p>
                        </div>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 5. Data Security */}
                <Section title="5. Data Security">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-10 ml-4">
                        We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction:
                    </p>

                    <div className="space-y-12 ml-4">
                        {/* 5.1 Technical Safeguards */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">5.1 Technical Safeguards</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Encryption of data in transit (SSL/TLS)</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Encryption of sensitive data at rest</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Secure cloud infrastructure with access controls</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Regular security audits and vulnerability assessments</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Firewall protection and intrusion detection systems</span>
                                </li>
                            </ul>
                        </div>

                        {/* 5.2 Organizational Safeguards */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">5.2 Organizational Safeguards</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Access to personal information is restricted to authorized personnel only</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Employee training on data protection and privacy</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Confidentiality agreements with employees and contractors</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Regular security policy reviews and updates</span>
                                </li>
                            </ul>
                        </div>

                        {/* 5.3 Account Security */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">5.3 Account Security</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Secure authentication with OTP verification</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Session management and automatic logout</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Encrypted storage of passwords (we never store plain text passwords)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 ml-4">
                        <p className="text-[15px] text-[#475569] leading-relaxed mb-6">
                            <span className="font-bold">Important:</span> While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.
                        </p>

                        <p className="text-[16px] font-bold text-[#1e293b] mb-4">Your Responsibility:</p>
                        <ul className="space-y-3 ml-4">
                            <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                <span>Keep your login credentials confidential</span>
                            </li>
                            <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                <span>Use a strong, unique password</span>
                            </li>
                            <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                <span>Do not share your account with others</span>
                            </li>
                            <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                <span>Log out after using the app on shared devices</span>
                            </li>
                            <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                <span>Report any unauthorized access immediately</span>
                            </li>
                        </ul>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 6. Your Rights and Choices */}
                <Section title="6. Your Rights and Choices">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-8 ml-4">
                        You have certain rights regarding your personal information:
                    </p>

                    <div className="space-y-12 ml-4">
                        {/* 6.1 Access and Correction */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.1 Access and Correction</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Right to Access:</span> Request a copy of the personal information we hold about you</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Right to Correction:</span> Update or correct inaccurate information</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">How:</span> Access most information directly in the app under "Profile" or "Account Settings"</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.2 Data Deletion */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.2 Data Deletion</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Right to Deletion:</span> Request deletion of your personal information</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">How:</span> contact mail <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span></span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Note:</span> Some information may be retained as described in Section 4</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.3 Data Portability */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.3 Data Portability</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Right to Portability:</span> Receive your data in a structured, machine-readable format</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">How:</span> Contact <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span> to request your data export</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.4 Marketing Opt-Out */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.4 Marketing Opt-Out</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Email:</span> Click "unsubscribe" in any marketing email</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">SMS:</span> Reply "STOP" to marketing SMS messages</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">App:</span> Go to Settings &gt; Notifications &gt; Disable marketing notifications</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Note:</span> You will still receive transactional messages (order updates, delivery notifications)</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.5 Location Permissions */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.5 Location Permissions</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Enable/Disable:</span> Control location access through your device settings</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Impact:</span> Disabling may affect service availability and delivery accuracy</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.6 Cookie Management */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.6 Cookie Management</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Browser Cookies:</span> Manage through your browser settings</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">App Cookies:</span> May affect app functionality if disabled</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.7 Withdraw Consent */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.7 Withdraw Consent</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>You may withdraw consent for certain data processing activities at any time</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>This does not affect the lawfulness of processing before withdrawal</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.8 Object to Processing */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.8 Object to Processing</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>You may object to certain processing of your data for direct marketing purposes</span>
                                </li>
                            </ul>
                        </div>

                        {/* 6.9 Lodge a Complaint */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">6.9 Lodge a Complaint</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>If you believe your privacy rights have been violated, you can file a complaint with the appropriate data protection authority in India</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 7. Children's Privacy */}
                <Section title="7. Children's Privacy">
                    <div className="space-y-12 ml-4">
                        {/* 7.1 Age Restriction */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">7.1 Age Restriction</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>True Harvest is not intended for children under 18 years of age</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We do not knowingly collect personal information from children under 18</span>
                                </li>
                            </ul>
                        </div>

                        {/* 7.2 Parental Discovery */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">7.2 Parental Discovery</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>If we discover that we have collected personal information from a child under 18 without parental consent, we will delete that information immediately</span>
                                </li>
                            </ul>
                        </div>

                        {/* 7.3 Parental Rights */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">7.3 Parental Rights</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>If you believe your child has provided us with personal information, please contact us at <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span> so we can delete it</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* 8. Third-Party Links and Services */}
                <Section title="8. Third-Party Links and Services">
                    <div className="space-y-12 ml-4">
                        {/* 8.1 External Links */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">8.1 External Links</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Our Services may contain links to third-party websites, apps, or services that are not operated by us</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We are not responsible for the privacy practices of these third parties</span>
                                </li>
                            </ul>
                        </div>

                        {/* 8.2 Third-Party Privacy Policies */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">8.2 Third-Party Privacy Policies</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We encourage you to review the privacy policies of any third-party services you interact with</span>
                                </li>
                            </ul>
                        </div>

                        {/* 8.3 Social Media Plugins */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">8.3 Social Media Plugins</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Our Services may include social media features (e.g., Facebook "Like" button)</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>These features may collect your IP address and set cookies</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Your interactions with these features are governed by the privacy policies of the companies providing them</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 9. International Data Transfers */}
                <Section title="9. International Data Transfers">
                    <div className="space-y-12 ml-4">
                        {/* 9.1 Data Storage Location */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">9.1 Data Storage Location</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Your information is primarily stored on servers located in India</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>However, some of our service providers may be located outside India</span>
                                </li>
                            </ul>
                        </div>

                        {/* 9.2 Safeguards */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">9.2 Safeguards</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-6">
                                When we transfer data internationally, we ensure appropriate safeguards are in place:
                            </p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Standard contractual clauses</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Adequacy decisions by relevant authorities</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Other legally approved transfer mechanisms</span>
                                </li>
                            </ul>
                        </div>

                        {/* 9.3 Cross-Border Processing */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">9.3 Cross-Border Processing</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>By using our Services, you consent to the transfer, storage, and processing of your information in countries outside your country of residence</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* 10. California Privacy Rights (CCPA) */}
                <Section title="10. California Privacy Rights (CCPA)">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-10 ml-4">
                        If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                    </p>

                    <div className="space-y-12 ml-4">
                        {/* 10.1 Right to Know */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">10.1 Right to Know</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Categories of personal information collected</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Sources of personal information</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Business or commercial purposes for collection</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Categories of third parties with whom we share information</span>
                                </li>
                            </ul>
                        </div>

                        {/* 10.2 Right to Delete */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">10.2 Right to Delete</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Request deletion of your personal information (subject to certain exceptions)</span>
                                </li>
                            </ul>
                        </div>

                        {/* 10.3 Right to Opt-Out of Sale */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">10.3 Right to Opt-Out of Sale</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We do not sell personal information. If this changes, we will update this policy and provide an opt-out mechanism</span>
                                </li>
                            </ul>
                        </div>

                        {/* 10.4 Right to Non-Discrimination */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">10.4 Right to Non-Discrimination</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We will not discriminate against you for exercising your CCPA rights</span>
                                </li>
                            </ul>
                        </div>

                        {/* 10.5 Exercising Your Rights */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">10.5 Exercising Your Rights</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Contact us at <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span> or call 7702710290 to exercise your rights</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We may require verification of your identity</span>
                                </li>
                            </ul>
                        </div>

                        {/* 10.6 Global Protections */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">10.6 Global Protections</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>While True Harvest primarily operates in India, we extend similar privacy protections to all users regardless of location</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 11. European Data Protection Rights (GDPR) */}
                <Section title="11. European Data Protection Rights (GDPR)">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-10 ml-4">
                        If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
                    </p>

                    <div className="space-y-12 ml-4">
                        {/* 11.1 Legal Basis for Processing */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">11.1 Legal Basis for Processing</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-6">
                                We process your personal data based on:
                            </p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Contract:</span> To fulfill our agreement with you</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Legitimate Interests:</span> To improve our Services, prevent fraud, and ensure security</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Consent:</span> For marketing communications and certain data processing activities</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span><span className="font-bold">Legal Obligations:</span> To comply with applicable laws</span>
                                </li>
                            </ul>
                        </div>

                        {/* 11.2 GDPR Rights */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">11.2 GDPR Rights</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Right of access, rectification, and erasure</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Right to restrict processing</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Right to data portability</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Right to object to processing</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Right to withdraw consent</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Right to lodge a complaint with a supervisory authority</span>
                                </li>
                            </ul>
                        </div>

                        {/* 11.3 Exercising Your Rights */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">11.3 Exercising Your Rights</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Contact our Data Protection Officer at <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span></span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* 12. Changes to This Privacy Policy */}
                <Section title="12. Changes to This Privacy Policy">
                    <div className="space-y-12 ml-4">
                        {/* 12.1 Updates */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">12.1 Updates</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors</span>
                                </li>
                            </ul>
                        </div>

                        {/* 12.2 Notification */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">12.2 Notification</p>
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-6">
                                When we make material changes:
                            </p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We will update the "Last Updated" date at the top</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We will notify you via email, app notification, or prominent notice in the app</span>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>For significant changes, we may require your consent to continue using the Services</span>
                                </li>
                            </ul>
                        </div>

                        {/* 12.3 Review */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">12.3 Review</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information</span>
                                </li>
                            </ul>
                        </div>

                        {/* 12.4 Continued Use */}
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">12.4 Continued Use</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Your continued use of the Services after changes indicates your acceptance of the updated Privacy Policy</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Section>

                <div className="h-px bg-black w-full my-12" />

                {/* 13. Contact Us */}
                <Section title="13. Contact Us">
                    <p className="text-[#475569] text-[15px] leading-relaxed mb-8 ml-4">
                        If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                    </p>

                    <div className="space-y-10 ml-4">
                        <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">True Harvest Privacy Team</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span>📩</span>
                                    <p><span className="font-bold">Email:</span> <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span></p>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span>📞</span>
                                    <p><span className="font-bold">Phone:</span> 7702710290</p>
                                </li>
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span>📍</span>
                                    <div>
                                        <p className="font-bold">Address: </p><p>405, 4th Floor, Block-A, PSR Prime Tower, Beside DLF, Gachibowli</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* <div>
                            <p className="text-[16px] font-bold text-[#1e293b] mb-4">Data Protection Officer:</p>
                            <ul className="space-y-3 ml-4">
                                <li className="flex items-start gap-4 text-[15px] text-[#475569]">
                                    <span>📩</span>
                                    <p><span className="font-bold">Email:</span> <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span></p>
                                </li>
                            </ul>
                        </div> */}

                        <p className="text-[#475569] text-[15px] ml-4">
                            <span className="font-bold">Response Time:</span> We aim to respond to all privacy inquiries within 7 business days.
                        </p>
                    </div>
                </Section>

                <div className="h-px bg-gray-200 w-full my-12" />

                {/* 14. Consent */}
                <Section title="14. Consent">
                    <div className="space-y-6 ml-4">
                        <p className="text-[#475569] text-[15px] leading-relaxed">
                            By using True Harvest Services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your personal information as described herein.
                        </p>
                        <p className="text-[#475569] text-[15px] leading-relaxed">
                            If you do not agree with this Privacy Policy, please discontinue use of our Services immediately.
                        </p>
                    </div>
                </Section>

                <div className="h-px bg-gray-200 w-full my-12" />

                <div className="ml-4 py-4 space-y-4">
                    <p className="text-[#1e293b] text-[16px] font-bold">
                        Your privacy matters to us. Thank you for trusting True Harvest with your information.
                    </p>
                    <p className="text-[#475569] text-[15px]">
                        Contact us at: <span className="underline decoration-[#38bdf8] underline-offset-2">contact@markwave.ai</span>
                    </p>
                </div>

                <div className="h-px bg-gray-200 w-full my-12" />



                <div className="h-px bg-black w-full my-20" />

                {/* TERMS AND CONDITIONS START */}
                <div className="max-w-4xl space-y-16">
                    <div className="mb-16">
                        <h1 className="text-[36px] font-extrabold text-[#2e7d32] mb-6">Terms and Conditions</h1>
                        <p className="text-[17px] font-bold text-[#1e293b] mb-10">Last Updated: January 29, 2026</p>
                        <p className="text-[#475569] text-[16px] leading-relaxed">
                            Welcome to True Harvest. By accessing or using the True Harvest mobile application, website, or services ("Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree, please do not use our Services.
                        </p>
                    </div>

                    <div className="space-y-20">
                        {/* 1. Definitions */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">1. Definitions</h2>
                            <ul className="space-y-4 ml-6">
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <p><span className="font-bold">"True Harvest", "we", "our", or "us"</span> refers to True Harvest and its operators.</p>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <p><span className="font-bold">"User", "you", or "customer"</span> refers to any individual using the Services.</p>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <p><span className="font-bold">"Products"</span> refers to goods delivered via subscription or one-time orders (e.g., milk, dairy, groceries, farm products).</p>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <p><span className="font-bold">"Subscription"</span> refers to recurring delivery plans selected by the user.</p>
                                </li>
                            </ul>
                        </div>

                        {/* 2. Eligibility */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">2. Eligibility</h2>
                            <div className="space-y-4">
                                <p className="text-[#475569] text-[16px]">You must:</p>
                                <ul className="space-y-4 ml-6">
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Be at least 18 years of age to use our Services</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Provide accurate and complete information during registration</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Have the legal capacity to enter into a binding agreement</span>
                                    </li>
                                </ul>
                                <ul className="space-y-4 ml-6 mt-6">
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>True Harvest reserves the right to suspend or terminate accounts with false or misleading information.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Account Registration */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">3. Account Registration</h2>
                            <ul className="space-y-4 ml-6">
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Users must register using a valid mobile number and may be required to provide email address and delivery address.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Location access may be requested to ensure accurate delivery and serviceability.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>You are responsible for keeping your login credentials secure and your information accurate and up to date.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>You are responsible for all activities that occur under your account.</span>
                                </li>
                            </ul>
                        </div>

                        {/* 4. Services Overview */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">4. Services Overview</h2>
                            <div className="space-y-4">
                                <p className="text-[#475569] text-[16px]">True Harvest provides:</p>
                                <ul className="space-y-4 ml-6">
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Subscription-based delivery of farm-fresh and related products</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>One-time orders of available products</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Flexible quantity, pause, resume, and modification options (subject to cutoff timings)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Home delivery to serviceable locations only</span>
                                    </li>
                                </ul>
                                <p className="text-[#475569] text-[16px] mt-6 leading-relaxed opacity-80">
                                    Service availability may vary by location. We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time.
                                </p>
                            </div>
                        </div>

                        {/* 5. Subscription Management */}
                        <div className="space-y-12">
                            <h2 className="text-[28px] font-bold text-[#2e7d32]">5. Subscription Management</h2>

                            <div className="space-y-10">
                                {/* 5.1 Subscription Control */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">5.1 Subscription Control</h3>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Subscriptions can be started, modified, paused, or cancelled via the app.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Changes must be made before the daily cutoff time displayed in the app.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Requests after cutoff apply from the next delivery cycle.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 5.2 Auto-Renewal */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">5.2 Auto-Renewal</h3>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Subscriptions automatically renew on their scheduled cycle (daily, weekly, or as selected).</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>You will be charged automatically according to your selected subscription plan.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>You can cancel auto-renewal at any time through the app settings.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 5.3 Cancellation Process */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">5.3 Cancellation Process</h3>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>To cancel a subscription, go to "My Subscriptions" in the app and select "Cancel Subscription."</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Cancellations take effect from the next billing/delivery cycle.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>You will receive confirmation of your cancellation via app notification and/or email.</span>
                                        </li>
                                    </ul>

                                    <div className="h-2 bg-gray-50 w-full my-6" />

                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Cancellation must be done at least 24 hours before the next scheduled delivery to avoid being charged.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 5.4 Subscription Modifications */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">5.4 Subscription Modifications</h3>
                                    <p className="text-[#475569] text-[16px] leading-relaxed">
                                        True Harvest reserves the right to modify subscription rules, features, or terms with at least 7 days' prior notice via app or email.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 6. Pricing & Payments */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">6. Pricing & Payments</h2>
                            <ul className="space-y-4 ml-6">
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Payments may be made via UPI, credit/debit cards, net banking, digital wallets, or other supported payment methods.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Wallet balances (if any) are non-transferable, non-interest bearing, and cannot be redeemed for cash.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>True Harvest may revise prices at any time. Updated prices will apply to future deliveries, and you will be notified in advance.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Failed payment attempts may result in suspension of services until payment is successfully processed.</span>
                                </li>
                            </ul>
                        </div>

                        {/* 7. Delivery Policy */}
                        <div className="space-y-12">
                            <h2 className="text-[28px] font-bold text-[#2e7d32]">7. Delivery Policy</h2>

                            <div className="space-y-10">
                                {/* 7.1 Delivery Execution */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">7.1 Delivery Execution</h3>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Deliveries are attempted at the selected address during scheduled delivery hours (typically early morning for milk/dairy products).</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Delivery timings may vary based on route optimization and local conditions.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 7.2 Failed Deliveries */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">7.2 Failed Deliveries</h3>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>If delivery fails due to incorrect address, locked gate, unavailability, or inability to access the premises, the order may be marked as delivered or returned.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>No refunds will be issued for failed deliveries caused by user error or circumstances beyond our control.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>It is your responsibility to ensure delivery instructions and address details are accurate and accessible.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 7.3 Delivery Personnel */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">7.3 Delivery Personnel</h3>
                                    <p className="text-[#475569] text-[16px] leading-relaxed">
                                        Please treat our delivery personnel with respect. Any abuse, harassment, or inappropriate behavior toward delivery staff will result in immediate account termination.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 8. Quality & Returns */}
                        <div className="space-y-12">
                            <h2 className="text-[28px] font-bold text-[#2e7d32]">8. Quality & Returns</h2>

                            <div className="space-y-10">
                                {/* 8.1 Quality Standards */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">8.1 Quality Standards</h3>
                                    <p className="text-[#475569] text-[16px] leading-relaxed">
                                        Products are sourced and delivered under strict quality control standards. We strive to ensure freshness and quality of all items.
                                    </p>
                                </div>

                                {/* 8.2 Returns & Complaints */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">8.2 Returns & Complaints</h3>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Perishable items (milk, dairy, fresh produce) cannot be returned once delivered due to their nature.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>In case of damaged, spoiled, or incorrect items, users must raise a complaint within 24 hours of delivery via the app or customer support.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Please provide photos of the damaged/incorrect items when filing a complaint.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Our team will review your complaint within 48 hours.</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 8.3 Refunds & Credits */}
                                <div className="space-y-4">
                                    <h3 className="text-[20px] font-bold text-[#2e7d32]">8.3 Refunds & Credits</h3>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Approved refunds may be credited to your True Harvest wallet or original payment method, at our discretion.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Refunds are typically processed within 5-7 business days.</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Wallet credits may be issued for minor quality issues and can be used for future orders.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 9. Cancellation & Refunds */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">9. Cancellation & Refunds</h2>
                            <ul className="space-y-4 ml-6">
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Subscription cancellations apply from the next billing/delivery cycle after the cutoff time.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>No refunds for already delivered items unless they are damaged or defective (see Section 8).</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Promotional or discounted subscriptions may have special cancellation rules, which will be clearly communicated at the time of purchase.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>One-time orders can be cancelled before dispatch. Once dispatched, standard delivery and return policies apply.</span>
                                </li>
                            </ul>
                        </div>

                        {/* 10. User Responsibilities */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">10. User Responsibilities</h2>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <p className="text-[#475569] text-[16px] font-bold">You agree not to:</p>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Misuse the app, Services, or any features for unlawful purposes</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Engage in fraudulent, abusive, or illegal activity</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Interfere with delivery personnel, operations, or other users</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Use automated systems (bots, scrapers) to access the Services</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Share your account credentials with others</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Attempt to reverse engineer, decompile, or hack the app</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[#475569] text-[16px] font-bold">You must:</p>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Ensure that mobile number, address, and location details provided are accurate</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Update your information promptly if it changes</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Maintain the security of your account</span>
                                        </li>
                                    </ul>
                                </div>
                                <ul className="space-y-4 ml-6">
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>True Harvest shall not be responsible for failed deliveries or service issues due to incorrect information provided by you. Violation of these responsibilities may lead to account suspension or permanent termination without refund.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 11. Promotions & Offers */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">11. Promotions & Offers</h2>
                            <ul className="space-y-4 ml-6">
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Promotional offers, discounts, and coupon codes are subject to specific terms, conditions, and validity periods.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>True Harvest reserves the right to modify, suspend, or withdraw offers at any time without prior notice.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Offers are non-transferable, cannot be combined with other offers (unless stated), and cannot be exchanged for cash.</span>
                                </li>
                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                    <span>Fraudulent use of promotional codes will result in account termination and potential legal action.</span>
                                </li>
                            </ul>
                        </div>

                        {/* 12. Intellectual Property */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">12. Intellectual Property</h2>
                            <p className="text-[#475569] text-[16px] leading-relaxed">
                                All content, including but not limited to logos, trademarks, app design, text, graphics, software, and user interface, belong exclusively to True Harvest. Unauthorized copying, reproduction, modification, distribution, or commercial use is strictly prohibited. You may not use our trademarks or branding without prior written permission.
                            </p>
                        </div>

                        {/* 13. Limitation of Liability */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">13. Limitation of Liability</h2>
                            <div className="space-y-4">
                                <p className="text-[#475569] text-[16px] font-bold">To the maximum extent permitted by law:</p>
                                <ul className="space-y-4 ml-6">
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>True Harvest is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Services.</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Our total liability shall not exceed the total amount paid by you in the preceding 30 days.</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>We are not responsible for delays, failures, or damages caused by circumstances beyond our reasonable control.</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>We do not guarantee uninterrupted or error-free service.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 14. Indemnification */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">14. Indemnification</h2>
                            <p className="text-[#475569] text-[16px] leading-relaxed">
                                You agree to indemnify, defend, and hold True Harvest, its officers, directors, employees, and agents harmless from and against any claims, liabilities, damages, losses, costs, or expenses (including legal fees) arising from: Your misuse of the Services; Violation of these Terms; Violation of applicable laws or regulations; Infringement of any third-party rights.
                            </p>
                        </div>

                        {/* 15. Force Majeure */}
                        <div className="space-y-8">
                            <h2 className="text-[24px] font-bold text-[#2e7d32]">15. Force Majeure</h2>
                            <div className="space-y-4">
                                <p className="text-[#475569] text-[16px] font-bold">True Harvest shall not be liable for any delay, failure, or interruption in Services resulting from causes beyond our reasonable control, including but not limited to:</p>
                                <ul className="space-y-4 ml-6">
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Natural disasters (earthquakes, floods, storms)</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Pandemics or health emergencies</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Acts of government or regulatory authorities</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>War, terrorism, or civil unrest</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Strikes, labor disputes, or supply chain disruptions</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                        <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                        <span>Technical failures or network outages</span>
                                    </li>
                                </ul>
                            </div>

                            {/* 16. Termination */}
                            <div className="space-y-12">
                                <h2 className="text-[28px] font-bold text-[#2e7d32]">16. Termination</h2>
                                <div className="space-y-10">
                                    {/* 16.1 Termination by True Harvest */}
                                    <div className="space-y-4">
                                        <h3 className="text-[20px] font-bold text-[#2e7d32]">16.1 Termination by True Harvest</h3>
                                        <div className="space-y-4">
                                            <p className="text-[#475569] text-[16px]">True Harvest may suspend or terminate your access to the Services immediately and without notice if:</p>
                                            <ul className="space-y-3 ml-6">
                                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                    <span>You violate these Terms</span>
                                                </li>
                                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                    <span>You engage in fraudulent or illegal activity</span>
                                                </li>
                                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                    <span>Required by law or regulatory authorities</span>
                                                </li>
                                                <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                    <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                    <span>Your account has been inactive for an extended period</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 16.2 Termination by User */}
                                    <div className="space-y-4">
                                        <h3 className="text-[20px] font-bold text-[#2e7d32]">16.2 Termination by User</h3>
                                        <p className="text-[#475569] text-[16px] leading-relaxed">
                                            You may terminate your account at any time by contacting customer support or using the app settings.
                                            Upon termination: Active subscriptions will be cancelled (subject to Section 9); Wallet balances may be
                                            forfeited after 90 days of account closure; Your data will be handled according to our Privacy Policy.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 17. Governing Law & Jurisdiction */}
                            <div className="space-y-8">
                                <h2 className="text-[24px] font-bold text-[#2e7d32]">17. Governing Law & Jurisdiction</h2>
                                <p className="text-[#475569] text-[16px] leading-relaxed">
                                    These Terms shall be governed by and construed in accordance with the laws of India. Any disputes
                                    arising from these Terms or use of the Services shall be subject to the exclusive jurisdiction of the
                                    courts in Hyderabad, Telangana, India.
                                </p>
                            </div>

                            {/* 18. Changes to Terms */}
                            <div className="space-y-8">
                                <h2 className="text-[24px] font-bold text-[#2e7d32]">18. Changes to Terms</h2>
                                <div className="space-y-4">
                                    <p className="text-[#475569] text-[16px]">True Harvest may update, modify, or revise these Terms from time to time. When we make changes:</p>
                                    <ul className="space-y-3 ml-6">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>We will update the "Last Updated" date at the top of this document</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>We will notify you via app notification, email, or prominent notice in the app</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>Continued use of the Services after changes constitutes your acceptance of the revised Terms</span>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <span>If you do not agree to the changes, you should discontinue use of the Services</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* 19. Privacy Policy */}
                            <div className="space-y-8">
                                <h2 className="text-[24px] font-bold text-[#2e7d32]">19. Privacy Policy</h2>
                                <p className="text-[#475569] text-[16px] leading-relaxed">
                                    Your use of our Services is also governed by our Privacy Policy, which describes how we collect, use,
                                    store, and protect your personal information. Please review our Privacy Policy at [INSERT PRIVACY
                                    POLICY URL] to understand our data practices. By using True Harvest, you consent to the data
                                    practices described in our Privacy Policy.
                                </p>
                            </div>

                            {/* 20. Data Collection & Usage */}
                            <div className="space-y-12">
                                <h2 className="text-[28px] font-bold text-[#2e7d32]">20. Data Collection & Usage</h2>
                                <p className="text-[#475569] text-[16px] leading-relaxed">
                                    By using the True Harvest app, you consent to the collection and use of the following information:
                                </p>

                                <div className="space-y-10">
                                    {/* 20.1 Information We Collect */}
                                    <div className="space-y-4">
                                        <h3 className="text-[20px] font-bold text-[#2e7d32]">20.1 Information We Collect</h3>
                                        <ul className="space-y-3 ml-6">
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Mobile number – for account creation, login, authentication, order updates, and customer support</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Email address – for communication, invoices, promotional messages, and service notifications</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Delivery address – for order fulfillment, serviceability checks, and delivery routing</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Location data (approximate or precise, as permitted by you) – to determine service availability, assign and optimize delivery routes, and improve delivery efficiency</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Payment information – processed securely through third-party payment gateways</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Order history and preferences – to personalize your experience</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Device information – for technical support</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* 20.2 Your Rights */}
                                    <div className="space-y-4">
                                        <h3 className="text-[20px] font-bold text-[#2e7d32]">20.2 Your Rights</h3>
                                        <p className="text-[#475569] text-[16px] leading-relaxed">
                                            You have the right to: Access your personal data; Request correction of inaccurate data; Request
                                            deletion of your data; Opt-out of promotional communications; Withdraw location permissions.
                                            To exercise these rights, contact us at contact@markwave.ai.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 21. Third-Party Services */}
                            <div className="space-y-8">
                                <h2 className="text-[24px] font-bold text-[#2e7d32]">21. Third-Party Services</h2>
                                <p className="text-[#475569] text-[16px] leading-relaxed">
                                    Our Services integrate with third-party payment processors and analytics tools. Your payment
                                    information is subject to their privacy policies. We may use third-party analytics tools (e.g., Google
                                    Analytics, Firebase) to understand app usage. Our app may contain links to third-party websites or
                                    services. We are not responsible for their content, practices, or policies.
                                </p>
                            </div>

                            {/* 22. App Store Specific Terms */}
                            <div className="space-y-12">
                                <h2 className="text-[28px] font-bold text-[#2e7d32]">22. App Store Specific Terms</h2>

                                <div className="space-y-10">
                                    {/* 22.1 Apple App Store */}
                                    <div className="space-y-4">
                                        <h3 className="text-[20px] font-bold text-[#2e7d32]">22.1 Apple App Store</h3>
                                        <ul className="space-y-3 ml-6">
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>These Terms are between you and True Harvest, not Apple</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Apple has no obligation to provide support or maintenance</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Apple is not responsible for addressing any claims related to the app</span>
                                            </li>
                                            <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                                <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                                <span>Apple and its subsidiaries are third-party beneficiaries of these Terms</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* 22.2 Google Play Store */}
                                    <div className="space-y-4">
                                        <h3 className="text-[20px] font-bold text-[#2e7d32]">22.2 Google Play Store</h3>
                                        <p className="text-[#475569] text-[16px] leading-relaxed">
                                            If you download the app from Google Play Store, you agree to Google Play's Terms of Service and may
                                            manage subscriptions through your Google Play account settings.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 23. Severability */}
                            <div className="space-y-8">
                                <h2 className="text-[24px] font-bold text-[#2e7d32]">23. Severability</h2>
                                <p className="text-[#475569] text-[16px] leading-relaxed">
                                    If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions
                                    shall continue in full force and effect.
                                </p>
                            </div>

                            {/* 24. Entire Agreement */}
                            <div className="space-y-8">
                                <h2 className="text-[24px] font-bold text-[#2e7d32]">24. Entire Agreement</h2>
                                <p className="text-[#475569] text-[16px] leading-relaxed">
                                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and True
                                    Harvest regarding the use of our Services and supersede any prior agreements.
                                </p>
                            </div>

                            {/* 25. Contact Information */}
                            <div className="space-y-8">
                                <h2 className="text-[24px] font-bold text-[#2e7d32]">25. Contact Information</h2>

                                <div className="space-y-6">
                                    <p className="text-[16px] font-bold text-[#1e293b]">True Harvest Support</p>

                                    <ul className="space-y-4 ml-2">
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <p><span className="font-bold text-[#1e293b]">Email:</span> contact@markwave.ai</p>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <p><span className="font-bold text-[#1e293b]">Phone:</span> 7702710290</p>
                                        </li>
                                        <li className="flex items-start gap-4 text-[16px] text-[#475569]">
                                            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
                                            <p><span className="font-bold text-[#1e293b]">Address:</span> 405, 4th Floor, Block-A, PSR Prime Tower,Beside DLF, Gachibowli</p>
                                        </li>
                                        <li className="text-[16px] text-[#475569] ml-[24px]">
                                            <p><span className="font-bold text-[#1e293b]">Business Hours:</span> 09:30am to 06:30pm</p>
                                        </li>
                                    </ul>

                                    <p className="text-[16px] font-bold text-[#1e293b] leading-relaxed mt-12">
                                        By using True Harvest, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-gray-100 w-full flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[#94a3b8] text-[13px] font-medium">© 2026 True Harvest. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
