import React from 'react';

const LandifyLegal: React.FC = () => {
    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <section className="mb-10">
            <h3 className="text-[18px] font-bold text-[#1e293b] mb-4">{title}</h3>
            {children}
        </section>
    );

    const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <li className="flex items-start gap-4 text-[15px] text-[#475569]">
            <span className="mt-[7px] w-[5px] h-[5px] rounded-full bg-black shrink-0" />
            <span>{children}</span>
        </li>
    );

    return (
        <div className="min-h-full bg-white px-10 py-16 animate-[fadeIn_0.5s_ease-out] font-inter">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-[32px] font-extrabold text-[#1e293b] mb-2 tracking-tight">Landify Legal</h1>
                <p className="text-[#94a3b8] text-[12px] font-bold tracking-[0.1em] mb-12 uppercase">
                    Terms, Conditions, and Privacy Policy
                </p>

                {/* TERMS AND CONDITIONS */}
                <div className="mb-20">
                    <h2 className="text-[24px] font-extrabold text-[#1e293b] mb-2 pb-2 border-b border-gray-100">Terms & Conditions</h2>
                    <p className="text-[#64748b] text-[14px] font-semibold mb-10 italic">
                        Fodder Procurement & Supply Operations – Kurnool Sub-Branch
                    </p>

                    <div className="space-y-8 pl-2">
                        <Section title="1. Scope of Services">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                The platform facilitates fodder procurement, aggregation, logistics coordination, and supply management for the Kurnool sub-branch farm and its associated sourcing locations including Adoni, Veldurthi, and Krishnagiri.
                            </p>
                        </Section>

                        <Section title="2. Eligibility">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Participation is open to registered farmers, authorized field agents, logistics partners, and internal operational staff who meet the onboarding and verification requirements defined by the company.
                            </p>
                        </Section>

                        <Section title="3. Farmer Responsibilities">
                            <ul className="space-y-3 ml-8">
                                <BulletPoint>Farmers must supply fodder that meets agreed quality standards related to moisture, freshness, and contamination.</BulletPoint>
                                <BulletPoint>The declared acreage and expected yield must be accurate.</BulletPoint>
                                <BulletPoint>Harvest schedules agreed with agents must be adhered to.</BulletPoint>
                                <BulletPoint>Any changes in land usage, crop failure, or yield reduction must be communicated in advance.</BulletPoint>
                            </ul>
                        </Section>

                        <Section title="4. Agent Responsibilities">
                            <ul className="space-y-3 ml-8">
                                <BulletPoint>Agents are responsible for farmer coordination, acreage coverage, harvest planning, quality inspection, and logistics alignment.</BulletPoint>
                                <BulletPoint>Agents must ensure transparent record-keeping and timely reporting.</BulletPoint>
                                <BulletPoint>Misrepresentation of acreage, yield, or farmer data may result in suspension or termination.</BulletPoint>
                            </ul>
                        </Section>

                        <Section title="5. Pricing & Payments">
                            <ul className="space-y-3 ml-8">
                                <BulletPoint>Fodder pricing is determined based on quality, season, and mutually agreed commercial terms.</BulletPoint>
                                <BulletPoint>Payments to farmers will be processed only after successful quality verification and delivery confirmation.</BulletPoint>
                                <BulletPoint>Delays caused by incorrect information or quality rejection are not the responsibility of the platform.</BulletPoint>
                            </ul>
                        </Section>

                        <Section title="6. Quality Control">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                The company reserves the right to inspect, test, accept, or reject fodder based on internal quality benchmarks. Rejected fodder will not be eligible for payment.
                            </p>
                        </Section>

                        <Section title="7. Logistics & Delivery">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Transportation schedules are coordinated centrally. Delays caused by weather, road conditions, or force majeure events will not be considered a breach of contract.
                            </p>
                        </Section>

                        <Section title="8. Data Accuracy">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                All users are responsible for maintaining accurate and up-to-date information. The company is not liable for operational losses caused by incorrect or incomplete data provided by users.
                            </p>
                        </Section>

                        <Section title="9. Termination">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                The company may suspend or terminate access for violations including fraud, repeated quality failures, or breach of operational guidelines.
                            </p>
                        </Section>

                        <Section title="10. Modifications">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Terms may be updated periodically. Continued participation implies acceptance of revised terms.
                            </p>
                        </Section>
                    </div>
                </div>

                {/* PRIVACY POLICY */}
                <div className="pt-10 border-t border-gray-200">
                    <h2 className="text-[24px] font-extrabold text-[#1e293b] mb-10 flex items-center gap-2">
                        <span>🔐</span> PRIVACY POLICY
                    </h2>

                    <div className="space-y-8 pl-2">
                        <Section title="1. Information Collected">
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-4 ml-4">We may collect the following data:</p>
                            <ul className="space-y-3 ml-8">
                                <BulletPoint>Farmer details (name, location, land size, crop type)</BulletPoint>
                                <BulletPoint>Agent details (contact information, assigned acreage)</BulletPoint>
                                <BulletPoint>Operational data (harvest schedules, delivery records)</BulletPoint>
                                <BulletPoint>Transaction and payment-related information</BulletPoint>
                            </ul>
                        </Section>

                        <Section title="2. Use of Information">
                            <p className="text-[#475569] text-[15px] leading-relaxed mb-4 ml-4">Collected information is used solely for:</p>
                            <ul className="space-y-3 ml-8">
                                <BulletPoint>Fodder procurement planning</BulletPoint>
                                <BulletPoint>Logistics coordination</BulletPoint>
                                <BulletPoint>Payment processing</BulletPoint>
                                <BulletPoint>Operational analytics and reporting</BulletPoint>
                            </ul>
                        </Section>

                        <Section title="3. Data Sharing">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Data may be shared internally with authorized personnel or with logistics and payment partners strictly for operational purposes. We do not sell or rent personal data to third parties.
                            </p>
                        </Section>

                        <Section title="4. Data Security">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Appropriate technical and organizational measures are implemented to protect data against unauthorized access, misuse, or loss.
                            </p>
                        </Section>

                        <Section title="5. Data Retention">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Data is retained only as long as necessary to fulfill operational, legal, and audit requirements.
                            </p>
                        </Section>

                        <Section title="6. User Rights">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Users may request access, correction, or deletion of their data, subject to legal and operational constraints.
                            </p>
                        </Section>

                        <Section title="7. Policy Updates">
                            <p className="text-[#475569] text-[15px] leading-relaxed ml-4">
                                Privacy policies may be updated periodically. Continued use of the platform indicates acceptance of changes.
                            </p>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandifyLegal;
