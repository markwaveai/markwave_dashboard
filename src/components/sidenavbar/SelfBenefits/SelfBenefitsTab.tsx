import React, { useState } from 'react';
import SelfBenefitsList from './SelfBenefitsList';
import ReferralBenefitsTab from '../ReferralBenefits/ReferralBenefitsTab';

const SelfBenefitsTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'self' | 'referral'>('self');

    return (
        <div className="flex flex-col h-full bg-[#f4f7fa] font-sans">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-8 pt-6">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('self')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'self'
                            ? 'border-[#10b981] text-[#10b981]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Self Benefits
                    </button>
                    <button
                        onClick={() => setActiveTab('referral')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'referral'
                            ? 'border-[#10b981] text-[#10b981]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Referral Benefits
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'self' ? <SelfBenefitsList /> : <ReferralBenefitsTab isEmbedded={true} />}
            </div>
        </div>
    );
};

export default SelfBenefitsTab;
