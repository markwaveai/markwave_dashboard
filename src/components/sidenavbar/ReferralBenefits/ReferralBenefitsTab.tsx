import React, { useState, useEffect } from 'react';
import { Gift, Award, Clock, AlertCircle, ShoppingBag, RotateCcw, Plus, Minus, Edit2, MoreVertical, XCircle, CheckCircle2, X, Star, MonitorPlay, Plane, Smartphone, Bike, Car, Check } from 'lucide-react';
import { referralBenefitService, referralConfigService } from '../../../services/api';
import { ReferralMilestone, ReferralConfig } from '../../../types';
import CreateReferralMilestoneModal from './CreateReferralMilestoneModal';

const ReferralBenefitsTab: React.FC = () => {
    const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<ReferralMilestone | null>(null);
    const [config, setConfig] = useState<ReferralConfig | null>(null);
    const [editingStage, setEditingStage] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [editActiveStatus, setEditActiveStatus] = useState<boolean>(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [milestoneData, configData] = await Promise.all([
                referralBenefitService.getReferralMilestones(),
                referralConfigService.getReferralConfig()
            ]);
            setMilestones(milestoneData || []);
            setConfig(configData);
            setError(null);
        } catch (err) {
            console.error('Error fetching referral data:', err);
            setError('Failed to load referral data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (updates: any) => {
        try {
            const response = await referralConfigService.updateReferralConfig(updates);
            if (response.error) {
                console.error('Error updating config:', response.error);
                return;
            }
            setConfig(prev => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            console.error('Error updating referral config:', err);
        }
    };

    const getRewardIcon = (reward: string) => {
        const lowerReward = reward.toLowerCase();
        if (lowerReward.includes('trip') || lowerReward.includes('travel') || lowerReward.includes('thailand') || lowerReward.includes('bali')) {
            return <Plane size={24} strokeWidth={2.5} />;
        }
        if (lowerReward.includes('iphone') || lowerReward.includes('phone') || lowerReward.includes('mobile')) {
            return <Smartphone size={24} strokeWidth={2.5} />;
        }
        if (lowerReward.includes('bike') || lowerReward.includes('scooter') || lowerReward.includes('ather')) {
            return <Bike size={24} strokeWidth={2.5} />;
        }
        if (lowerReward.includes('car') || lowerReward.includes('thar') || lowerReward.includes('suv')) {
            return <Car size={24} strokeWidth={2.5} />;
        }
        if (lowerReward.includes('watch') || lowerReward.includes('smartwatch')) {
            return <MonitorPlay size={24} strokeWidth={2.5} />;
        }
        return <Star size={24} strokeWidth={2.5} />;
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#f8fafc] p-10 min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading milestones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full bg-[#f8fafc] p-10 min-h-screen items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="px-6 py-2 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-all font-semibold shadow-md shadow-emerald-500/20"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans overflow-y-auto max-h-screen custom-scrollbar">
            {/* Header */}
            <div className="p-8 pb-0">
                <div>
                    <h2 className="text-[2.25rem] font-[900] text-[#1e293b] tracking-tight leading-none mb-3">Referral Roadmap</h2>
                    <p className="text-[#64748b] text-base font-semibold opacity-80">Track milestones and unlock exclusive rewards through network growth.</p>
                </div>
            </div>

            {/* Coins Rewards Heading & Global Activation Toggle */}
            <div className="px-8 mt-8 flex items-end justify-between">
                <div>
                    <h3 className="text-xl font-black text-[#1e293b] tracking-tight leading-none mb-1">Coins rewards</h3>
                </div>
                <button
                    onClick={() => updateConfig({ is_global_active: !config?.is_global_active })}
                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all shadow-lg active:scale-95 ${config?.stage1_active || config?.stage2_active
                        ? 'bg-[#fef2f2] text-[#ef4444] border border-[#ef4444]/10 hover:bg-[#fee2e2]'
                        : 'bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/10 hover:bg-[#d1fae5]'
                        }`}
                >
                    {config?.stage1_active || config?.stage2_active ? 'Disable all coins rewards' : 'Activate all coins rewards'}
                </button>
            </div>

            {/* Redesigned Commission Cards Grid */}
            <div className="px-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {/* Stage 1 Card */}
                <div className="bg-white rounded-[1.25rem] p-3.5 shadow-[0_5px_20px_rgba(0,0,0,0.01)] border border-[#f1f5f9] relative group hover:shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all">
                    <div className="flex items-center justify-between mb-1 pr-10">
                        <span className="text-[9px] font-[900] text-[#1e293b] tracking-wider uppercase opacity-80">Direct Referral coins percent</span>
                        <button
                            onClick={() => {
                                setEditingStage(1);
                                setEditValue(config?.stage1_percentage?.toString() || '0');
                                setEditActiveStatus(config?.stage1_active || false);
                            }}
                            className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#10b981] transition-all"
                        >
                            <Edit2 size={10} />
                        </button>
                    </div>
                    <button
                        onClick={() => updateConfig({
                            stage1_active: !config?.stage1_active,
                            stage1_percentage: config?.stage1_percentage
                        })}
                        className={`absolute top-4 right-4 w-8 h-4.5 rounded-full transition-all duration-500 relative ${config?.stage1_active ? 'bg-[#10b981] shadow-lg shadow-[#10b981]/10' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-500 shadow-sm ${config?.stage1_active ? 'left-4' : 'left-0.5'}`} />
                    </button>

                    <div className="flex flex-col items-center justify-center pt-0.5 pb-2">
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-3xl font-[1000] text-[#1e293b] tracking-tighter leading-none">{config?.stage1_percentage}</span>
                            <span className="text-sm font-black text-[#1e293b] mt-auto pb-0.5">%</span>
                        </div>

                        {/* Edit Popup */}
                        {editingStage === 1 && (
                            <div className="absolute -inset-1 z-30 bg-white rounded-[1.25rem] p-3.5 flex flex-col gap-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-black text-[#1e293b] tracking-wider uppercase">Edit Stage 1</span>
                                    <button onClick={() => setEditingStage(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">Percentage</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-full h-7 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none transition-all"
                                                autoFocus
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">%</span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">Status</label>
                                        <select
                                            value={editActiveStatus ? "active" : "inactive"}
                                            onChange={(e) => setEditActiveStatus(e.target.value === "active")}
                                            className="w-full h-7 px-2 text-[10px] font-bold border border-slate-200 rounded-lg focus:border-[#10b981] outline-none bg-slate-50 cursor-pointer"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 mt-auto">
                                    <button
                                        onClick={() => {
                                            updateConfig({ stage1_percentage: parseFloat(editValue), stage1_active: editActiveStatus });
                                            setEditingStage(null);
                                        }}
                                        className="flex-[2] h-7 bg-[#10b981] text-white text-[9px] font-black tracking-widest uppercase rounded-lg shadow-lg shadow-emerald-500/10 hover:bg-[#059669] active:scale-95 transition-all"
                                    >
                                        UPDATE
                                    </button>
                                    <button
                                        onClick={() => setEditingStage(null)}
                                        className="flex-1 h-7 bg-slate-50 text-slate-400 text-[9px] font-black tracking-widest uppercase rounded-lg hover:bg-slate-100 transition-all border border-slate-100"
                                    >
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-50 pt-3 flex justify-center">
                        <button
                            onClick={() => updateConfig({
                                stage1_active: !config?.stage1_active,
                                stage1_percentage: config?.stage1_percentage
                            })}
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all active:scale-95 ${config?.stage1_active ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            <div className={`w-1 h-1 rounded-full ${config?.stage1_active ? 'bg-[#10b981]' : 'bg-slate-300'}`} />
                            {config?.stage1_active ? 'Active' : 'Inactive'}
                        </button>
                    </div>
                </div>

                {/* Stage 2 Card */}
                <div className="bg-white rounded-[1.25rem] p-3.5 shadow-[0_5px_20px_rgba(0,0,0,0.01)] border border-[#f1f5f9] relative group hover:shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all">
                    <div className="flex items-center justify-between mb-1 pr-10">
                        <span className="text-[9px] font-[900] text-[#1e293b] tracking-wider uppercase opacity-80">Indirect Referral coins percent</span>
                        <button
                            onClick={() => {
                                setEditingStage(2);
                                setEditValue(config?.stage2_percentage?.toString() || '0');
                                setEditActiveStatus(config?.stage2_active || false);
                            }}
                            className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#10b981] transition-all"
                        >
                            <Edit2 size={10} />
                        </button>
                    </div>
                    <button
                        onClick={() => updateConfig({
                            stage2_active: !config?.stage2_active,
                            stage2_percentage: config?.stage2_percentage
                        })}
                        className={`absolute top-4 right-4 w-8 h-4.5 rounded-full transition-all duration-500 relative ${config?.stage2_active ? 'bg-[#10b981] shadow-lg shadow-[#10b981]/10' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-500 shadow-sm ${config?.stage2_active ? 'left-4' : 'left-0.5'}`} />
                    </button>

                    <div className="flex flex-col items-center justify-center pt-0.5 pb-2">
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-3xl font-[1000] text-[#1e293b] tracking-tighter leading-none">{config?.stage2_percentage}</span>
                            <span className="text-sm font-black text-[#1e293b] mt-auto pb-0.5">%</span>
                        </div>

                        {/* Edit Popup */}
                        {editingStage === 2 && (
                            <div className="absolute -inset-1 z-30 bg-white rounded-[1.25rem] p-3.5 flex flex-col gap-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-black text-[#1e293b] tracking-wider uppercase">Edit Stage 2</span>
                                    <button onClick={() => setEditingStage(null)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">Percentage</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-full h-7 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 outline-none transition-all"
                                                autoFocus
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">%</span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">Status</label>
                                        <select
                                            value={editActiveStatus ? "active" : "inactive"}
                                            onChange={(e) => setEditActiveStatus(e.target.value === "active")}
                                            className="w-full h-7 px-2 text-[10px] font-bold border border-slate-200 rounded-lg focus:border-[#10b981] outline-none bg-slate-50 cursor-pointer"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 mt-auto">
                                    <button
                                        onClick={() => {
                                            updateConfig({ stage2_percentage: parseFloat(editValue), stage2_active: editActiveStatus });
                                            setEditingStage(null);
                                        }}
                                        className="flex-[2] h-7 bg-[#10b981] text-white text-[9px] font-black tracking-widest uppercase rounded-lg shadow-lg shadow-emerald-500/10 hover:bg-[#059669] active:scale-95 transition-all"
                                    >
                                        UPDATE
                                    </button>
                                    <button
                                        onClick={() => setEditingStage(null)}
                                        className="flex-1 h-7 bg-slate-50 text-slate-400 text-[9px] font-black tracking-widest uppercase rounded-lg hover:bg-slate-100 transition-all border border-slate-100"
                                    >
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-50 pt-3 flex justify-center">
                        <button
                            onClick={() => updateConfig({
                                stage2_active: !config?.stage2_active,
                                stage2_percentage: config?.stage2_percentage
                            })}
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all active:scale-95 ${config?.stage2_active ? 'bg-[#ecfdf5] text-[#10b981] hover:bg-[#d1fae5]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            <div className={`w-1 h-1 rounded-full ${config?.stage2_active ? 'bg-[#10b981]' : 'bg-slate-300'}`} />
                            {config?.stage2_active ? 'Active' : 'Inactive'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-8 mt-16 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-[#1e293b] tracking-tight leading-none mb-1">Direct Referral rewards</h3>
                    <p className="text-[#64748b] text-[13px] font-bold opacity-60">Unlock exclusive milestones through network growth.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedMilestone(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                    <Plus size={14} strokeWidth={3} />
                    NEW MILESTONE
                </button>
            </div>

            {/* Roadmap Container */}
            <div className="mt-6 relative">
                <div className="overflow-x-auto custom-scrollbar pt-8 pb-16">
                    <div className="flex items-center gap-0 px-8 min-w-max relative">
                        {milestones.length === 0 ? (
                            <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-[#e2e8f0] text-center px-40 mx-4">
                                <div className="w-24 h-24 bg-[#f8fafc] rounded-full flex items-center justify-center mb-8 text-[#94a3b8]">
                                    <Star size={48} className="opacity-40" />
                                </div>
                                <h3 className="text-2xl font-black text-[#1e293b] mb-3">Roadmap is empty</h3>
                                <p className="text-[#64748b] max-w-sm mx-auto font-bold opacity-60">Start mapping out your referral program by adding the first milestone.</p>
                            </div>
                        ) : (
                            milestones.map((milestone: ReferralMilestone, index: number) => (
                                <div key={milestone.id} className="flex items-center relative group/milestone">
                                    {/* Connecting Line */}
                                    {index !== milestones.length - 1 && (
                                        <div className={`absolute left-[calc(100%-1.5rem)] right-[-1.5rem] top-[45%] -translate-y-1/2 h-0.5 z-0 overflow-hidden transition-all duration-700 ${milestone.is_active ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`}>
                                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                        </div>
                                    )}

                                    {/* Card */}
                                    <div
                                        className={`relative z-10 w-[200px] bg-white rounded-[2rem] shadow-[0_15px_35px_rgba(0,0,0,0.03)] border-2 p-4 transition-all duration-500 hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 flex flex-col mx-3 ${milestone.is_active ? 'border-[#10b981] ring-4 ring-[#10b981]/5' : 'border-[#f1f5f9] opacity-90'}`}
                                    >
                                        {/* Action Header: Threshold Badge & Edit */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`px-2 py-0.5 rounded-lg font-black text-[8px] tracking-[0.1em] shadow-sm flex items-center justify-center ${milestone.is_active ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                                                {milestone.threshold} UNITS
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMilestone(milestone);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2.5 bg-[#f8fafc] text-slate-300 hover:bg-[#111827] hover:text-white rounded-xl transition-all active:scale-90"
                                                title="Edit Milestone"
                                            >
                                                <Edit2 size={14} strokeWidth={3} />
                                            </button>
                                        </div>

                                        {/* Content: Icon & Text */}
                                        <div>
                                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 shadow-lg transition-all duration-500 group-hover/milestone:scale-105 ${milestone.is_active ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-[#10b981]/20' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                                                {getRewardIcon(milestone.reward)}
                                            </div>

                                            <h3 className="text-base font-black text-[#1e293b] leading-tight mb-2 tracking-tight transition-colors">{milestone.reward}</h3>
                                            <p className="text-[#64748b] text-[11px] font-bold leading-snug opacity-80 h-8 line-clamp-2">{milestone.description || 'Exclusive reward for dedicated partners.'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Indirect Referral Rewards Title Section */}


            <div className="pb-32" />

            <CreateReferralMilestoneModal
                isOpen={isModalOpen}
                milestone={selectedMilestone}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMilestone(null);
                }}
                onSuccess={() => {
                    fetchAllData();
                }}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                    background-clip: padding-box;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default ReferralBenefitsTab;
