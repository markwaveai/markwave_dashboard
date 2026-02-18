import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { RootState } from '../../../store';
import { achievedBenefitService, referralBenefitService } from '../../../services/api';
import { Trophy, User, Phone, Calendar, Package, Award, Gift, Loader2, Users, Target, Info } from 'lucide-react';
import OrderDetailsPage from '../Orders/OrderDetailsPage';

interface AchievedBenefit {
    benefit_id: string;
    title: string;
    description: string;
    units_required: number;
    is_active: boolean;
    awarded_at: string;
    order_id: string;
    display_message: string;
    purchased_units: number;
    user_id: string;
    mobile: string;
    name: string;
    role: string;
}

interface MilestoneSummary {
    threshold: number;
    reward: string;
    is_active: boolean;
    members_achieved: number;
}

interface ReferralAchievement {
    mobile: string;
    username: string;
    role: string;
    total_referral_units: number;
    milestone_id: string;
    threshold: number;
    reward: string;
    is_active: boolean;
    achieved_date: string | null;
}

type TabType = 'self' | 'referral';

const OffersAchievedTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('self');
    const [benefits, setBenefits] = useState<AchievedBenefit[]>([]);
    const [referralAchievements, setReferralAchievements] = useState<ReferralAchievement[]>([]);
    const [milestoneSummaries, setMilestoneSummaries] = useState<MilestoneSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const adminMobile = useAppSelector((state: RootState) => state.auth.adminMobile || '');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => localStorage.getItem('offersSelectedOrderId'));

    const handleSelectOrder = (orderId: string) => {
        if (!orderId) return;
        localStorage.setItem('offersSelectedOrderId', orderId);
        setSelectedOrderId(orderId);
    };

    const handleBackFromOrder = () => {
        localStorage.removeItem('offersSelectedOrderId');
        setSelectedOrderId(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!adminMobile) return;
            setLoading(true);
            setError(null);
            try {
                if (activeTab === 'self') {
                    const data = await achievedBenefitService.getAchievedBenefits(adminMobile);
                    setBenefits(data.benefits || []);
                    setTotalCount(data.total_benefits || 0);
                } else {
                    const data = await referralBenefitService.getAchievedReferralMilestones(adminMobile);
                    setReferralAchievements(data.achieved_list || []);
                    setMilestoneSummaries(data.milestones_summary || []);
                    setTotalCount(data.total_records || 0);
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to fetch achieved benefits');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [adminMobile, activeTab]);


    const getBenefitColor = (title: string) => {
        if (title.includes('Mahindra Thar')) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', icon: '🚗' };
        if (title.includes('Silver')) return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800', icon: '🥈' };
        if (title.includes('2 Persons')) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', icon: '✈️' };
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800', icon: '🏝️' };
    };

    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        { key: 'self', label: 'Self Benefits', icon: <Award size={16} /> },
        { key: 'referral', label: 'Referral Benefits', icon: <Users size={16} /> },
    ];

    if (selectedOrderId) {
        return <OrderDetailsPage orderId={selectedOrderId} onBack={handleBackFromOrder} />;
    }

    return (
        <div className="flex flex-col h-full bg-[#f4f7fa] font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 pt-4 pb-0">
                {/* Tabs */}
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-200 border-b-2
                                ${activeTab === tab.key
                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 size={32} className="text-indigo-500 animate-spin" />
                        <p className="text-gray-500 text-sm font-medium">Loading achieved benefits...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <Trophy size={28} className="text-red-400" />
                        </div>
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                ) : (activeTab === 'self' ? benefits.length === 0 : referralAchievements.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Gift size={28} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                            {activeTab === 'self' ? 'No self benefit achievements yet' : 'No referral benefit achievements yet'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards for Referral */}
                        {activeTab === 'referral' && milestoneSummaries.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {milestoneSummaries.map((summary, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                                <Target size={18} />
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${summary.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {summary.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{summary.threshold} Units Milestone</p>
                                            <p className="font-bold text-gray-900 text-sm truncate">{summary.reward}</p>
                                        </div>
                                        <div className="mt-1 pt-2 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Achievers</span>
                                            <span className="text-sm font-bold text-indigo-600">{summary.members_achieved} Members</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Table */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="text-left px-5 pr-2 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                        <th className="text-center pl-2 pr-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {activeTab === 'self' ? 'Offer' : 'Milestone Reward'}
                                        </th>
                                        <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {activeTab === 'self' ? 'Units' : 'Referral Units'}
                                        </th>
                                        <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {activeTab === 'self' ? 'Order ID' : 'Threshold'}
                                        </th>
                                        <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {activeTab === 'self' ? 'Awarded At' : 'Achieved Date'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {activeTab === 'self' ? (
                                        benefits.map((benefit, index) => (
                                            <tr key={`${benefit.order_id}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 pr-2 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                            {benefit.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 capitalize text-[0.8125rem]">{benefit.name}</p>
                                                            <span className="text-xs text-gray-500 mt-0.5">{benefit.mobile}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="pl-2 pr-5 py-4 text-center">
                                                    <span className="text-[11px] font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">{benefit.role}</span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div>
                                                        <p className="font-semibold text-[0.8125rem] text-gray-900">{benefit.title}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{benefit.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                                                        {benefit.purchased_units} purchased
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span
                                                        className="text-xs font-mono bg-gray-50 px-2 py-1 rounded text-indigo-600 border border-gray-100 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                                        onClick={() => setSelectedOrderId(benefit.order_id)}
                                                    >
                                                        {benefit.order_id}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Calendar size={13} className="text-gray-400" />
                                                        <span className="text-xs text-gray-600 font-medium">{benefit.awarded_at || '-'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        referralAchievements.map((ach, index) => (
                                            <tr key={`${ach.mobile}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 pr-2 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                            {ach.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 capitalize text-[0.8125rem]">{ach.username}</p>
                                                            <span className="text-xs text-gray-500 mt-0.5">{ach.mobile}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="pl-2 pr-5 py-4 text-center">
                                                    <span className="text-[11px] font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">{ach.role}</span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div>
                                                        <p className="font-semibold text-[0.8125rem] text-gray-900">{ach.reward}</p>
                                                        {!ach.is_active && <span className="text-[10px] text-red-400 font-bold">INACTIVE OFFER</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                                                        {ach.total_referral_units} units
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="text-xs font-bold bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                                                        {ach.threshold} units
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    {ach.achieved_date ? (
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <Calendar size={13} className="text-gray-400" />
                                                            <span className="text-xs text-gray-600 font-medium">{ach.achieved_date}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-1.5 text-gray-400">
                                                            <Info size={13} />
                                                            <span className="text-[10px] uppercase font-bold tracking-tight">Pending</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">
                                Showing {activeTab === 'self' ? benefits.length : referralAchievements.length} of {totalCount} records
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OffersAchievedTab;
