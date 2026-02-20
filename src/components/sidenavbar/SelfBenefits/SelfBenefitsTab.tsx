import React, { useState, useEffect } from 'react';
import SelfBenefitsList from './SelfBenefitsList';
import ReferralBenefitsTab from '../ReferralBenefits/ReferralBenefitsTab';
import { farmService, selfBenefitService, referralBenefitService, referralConfigService } from '../../../services/api';
import { SelfBenefit, ReferralMilestone, ReferralConfig } from '../../../types';

const SelfBenefitsTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'self' | 'referral'>(() => {
        const saved = localStorage.getItem('offer_manager_active_tab');
        return (saved === 'self' || saved === 'referral') ? saved : 'self';
    });
    const [farms, setFarms] = useState<any[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<string>('');

    // Hoisted Data State
    const [selfBenefits, setSelfBenefits] = useState<SelfBenefit[]>([]);
    const [referralMilestones, setReferralMilestones] = useState<ReferralMilestone[]>([]);
    const [referralConfig, setReferralConfig] = useState<ReferralConfig | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Persist active tab
    useEffect(() => {
        localStorage.setItem('offer_manager_active_tab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const data = await farmService.getFarms();
                setFarms(data);
                if (data.length > 0) {
                    const savedFarmId = localStorage.getItem('offer_manager_selected_farm');
                    const farmExists = data.find((f: any) => f.id === savedFarmId);
                    if (savedFarmId && farmExists) {
                        setSelectedFarmId(savedFarmId);
                    } else {
                        setSelectedFarmId(data[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch farms", error);
            }
        };
        fetchFarms();
    }, []);

    const fetchSelfBenefits = async (farmId: string, silent = false) => {
        if (!farmId) return;
        if (!silent) setLoading(true);
        try {
            const benefits = await selfBenefitService.getSelfBenefits(farmId);
            setSelfBenefits(benefits);
        } catch (error) {
            console.error("Error fetching self benefits:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchReferralData = async (farmId: string, silent = false) => {
        if (!farmId) return;
        if (!silent) setLoading(true);
        try {
            const [milestones, config] = await Promise.all([
                referralBenefitService.getReferralMilestones(farmId),
                referralConfigService.getReferralConfig(farmId)
            ]);
            setReferralMilestones(milestones);
            setReferralConfig(config);
        } catch (error) {
            console.error("Error fetching referral data:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFarmId) {
            if (activeTab === 'self') {
                fetchSelfBenefits(selectedFarmId);
            } else {
                fetchReferralData(selectedFarmId);
            }
        }
    }, [selectedFarmId, activeTab]);

    return (
        <div className="flex flex-col h-full bg-[#f4f7fa] font-sans">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-8 pt-6">
                {/* Header Row */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Manage Offers</h1>

                    {/* Farm Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Farm:</span>
                        <select
                            value={selectedFarmId}
                            onChange={(e) => {
                                const newId = e.target.value;
                                setSelectedFarmId(newId);
                                localStorage.setItem('offer_manager_selected_farm', newId);
                            }}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#10b981] focus:border-[#10b981] block p-2 outline-none transition-all hover:bg-gray-50"
                        >
                            {farms.map((farm) => (
                                <option key={farm.id} value={farm.id}>
                                    {farm.uniqueId}  {farm.location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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
                {activeTab === 'self' ? (
                    <SelfBenefitsList
                        farmId={selectedFarmId}
                        benefits={selfBenefits}
                        loading={loading}
                        onRefresh={(silent) => fetchSelfBenefits(selectedFarmId, silent)}
                    />
                ) : (
                    <ReferralBenefitsTab
                        isEmbedded={true}
                        farmId={selectedFarmId}
                        preloadedMilestones={referralMilestones}
                        preloadedConfig={referralConfig}
                        externalLoading={loading}
                        onRefresh={(silent) => fetchReferralData(selectedFarmId, silent)}
                    />
                )}
            </div>
        </div>
    );
};

export default SelfBenefitsTab;
