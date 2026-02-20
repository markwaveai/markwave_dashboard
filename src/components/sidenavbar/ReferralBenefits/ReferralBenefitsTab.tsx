import React, { useState, useEffect } from 'react';
import { Gift, Award, Clock, AlertCircle, ShoppingBag, RotateCcw, Plus, Minus, Edit2, MoreVertical, XCircle, CheckCircle2, X, Star, MonitorPlay, Plane, Smartphone, Bike, Car, Check, ShieldCheck } from 'lucide-react';
import { referralBenefitService, referralConfigService, otpService } from '../../../services/api';
import { ReferralMilestone, ReferralConfig } from '../../../types';
import CreateReferralMilestoneModal from './CreateReferralMilestoneModal';
import Snackbar from '../../common/Snackbar';
import OtpVerificationModal from '../../common/OtpVerificationModal';

interface ReferralBenefitsTabProps {
    isEmbedded?: boolean;
    farmId?: string;
    preloadedMilestones?: ReferralMilestone[];
    preloadedConfig?: ReferralConfig | null;
    externalLoading?: boolean;
    onRefresh?: (silent?: boolean) => Promise<void> | void;
}

const ReferralBenefitsTab: React.FC<ReferralBenefitsTabProps> = ({
    isEmbedded = false,
    farmId,
    preloadedMilestones,
    preloadedConfig,
    externalLoading,
    onRefresh
}) => {
    const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<ReferralMilestone | null>(null);
    const [config, setConfig] = useState<ReferralConfig | null>(null);
    const [editingStage, setEditingStage] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [editActiveStatus, setEditActiveStatus] = useState<boolean>(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [globalToggleLoading, setGlobalToggleLoading] = useState(false);
    const [stage1Loading, setStage1Loading] = useState(false);
    const [stage2Loading, setStage2Loading] = useState(false);

    // Per-Action OTP State
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpActionType, setOtpActionType] = useState<'config' | 'milestone' | 'global_toggle'>('config');
    const [pendingUpdates, setPendingUpdates] = useState<any>(null);
    const [pendingMilestone, setPendingMilestone] = useState<ReferralMilestone | null>(null);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!preloadedMilestones && farmId) {
            fetchAllData();
        }
    }, [farmId, preloadedMilestones]);


    const fetchAllData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [milestoneData, configData] = await Promise.all([
                referralBenefitService.getReferralMilestones(farmId),
                referralConfigService.getReferralConfig(farmId)
            ]);
            setMilestones(milestoneData || []);
            setConfig(configData);
            setError(null);
        } catch (err) {
            console.error('Error fetching referral data:', err);
            setError('Failed to load referral data. Please try again later.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const updateConfig = async (updates: any, mobile: string, otp: string) => {
        if (!displayConfig) return;

        const updateKeys = Object.keys(updates);
        const isGlobalToggle = updateKeys.includes('is_global_active');
        const isStage1Toggle = updateKeys.includes('stage1_active') && !updateKeys.includes('stage1_percentage');
        const isStage2Toggle = updateKeys.includes('stage2_active') && !updateKeys.includes('stage2_percentage');

        if (isGlobalToggle) setGlobalToggleLoading(true);
        if (isStage1Toggle) setStage1Loading(true);
        if (isStage2Toggle) setStage2Loading(true);

        const payload: any = {
            stage1_percentage: displayConfig.stage1_percentage,
            stage2_percentage: displayConfig.stage2_percentage,
            stage1_active: isGlobalToggle ? updates.is_global_active : displayConfig.stage1_active,
            stage2_active: isGlobalToggle ? updates.is_global_active : displayConfig.stage2_active,
            is_global_active: displayConfig.is_global_active,
            ...updates
        };

        try {
            const response = await referralConfigService.updateReferralConfig(payload, mobile, otp);
            if (response.error) {
                throw new Error(response.error);
            }

            setSnackbar({ message: 'Configuration updated successfully!', type: 'success' });
            setConfig(prev => prev ? { ...prev, ...updates } : { ...displayConfig, ...updates });

            if (onRefresh) {
                const shouldSilentRefresh = isGlobalToggle || isStage1Toggle || isStage2Toggle;
                await onRefresh(shouldSilentRefresh);
            }
        } catch (err: any) {
            console.error('Error updating referral config:', err);
            throw err;
        } finally {
            if (isGlobalToggle) setGlobalToggleLoading(false);
            if (isStage1Toggle) setStage1Loading(false);
            if (isStage2Toggle) setStage2Loading(false);
        }
    };

    const handleConfirmOtpAction = async (mobile: string, otp: string) => {
        if (otpActionType === 'config' && pendingUpdates) {
            await updateConfig(pendingUpdates, mobile, otp);
            setPendingUpdates(null);
        } else if (otpActionType === 'milestone' && pendingMilestone) {
            try {
                const result = await referralBenefitService.updateReferralMilestone(pendingMilestone.id, {
                    is_active: !pendingMilestone.is_active,
                    threshold: pendingMilestone.threshold,
                    reward: pendingMilestone.reward,
                    description: pendingMilestone.description
                }, mobile, otp);

                if (result.error) {
                    throw new Error(result.error);
                } else {
                    setSnackbar({ message: `Milestone ${!pendingMilestone.is_active ? 'activated' : 'deactivated'} successfully!`, type: 'success' });
                    if (onRefresh) {
                        await onRefresh(true);
                    } else {
                        await fetchAllData(true);
                    }
                }
            } catch (err: any) {
                console.error("Failed to toggle status", err);
                throw err;
            } finally {
                setPendingMilestone(null);
            }
        } else if (otpActionType === 'global_toggle' && pendingUpdates) {
            await updateConfig(pendingUpdates, mobile, otp);
            setPendingUpdates(null);
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

    const displayMilestones = preloadedMilestones || milestones;
    const displayConfig = config || preloadedConfig;
    const isLoading = externalLoading !== undefined ? externalLoading : loading;

    // Sync preloaded config to local state to allow optimistic updates
    useEffect(() => {
        if (preloadedConfig) {
            setConfig(preloadedConfig);
        }
    }, [preloadedConfig]);

    if (isLoading) {
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
                        onClick={() => fetchAllData()}
                        className="px-6 py-2 bg-[#10b981] text-white rounded-xl hover:bg-[#059669] transition-all font-semibold shadow-md shadow-emerald-500/20"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!isLoading && displayMilestones.length === 0 && (!displayConfig || Object.keys(displayConfig).length === 0)) {
        return (
            <div className="flex flex-col h-full bg-[#f8fafc] p-10 min-h-screen items-center justify-center">
                <div className="w-full max-w-lg flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center mb-8 relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/20 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <Gift size={48} className="text-[#10b981] relative z-10" strokeWidth={1.5} />
                        <div className="absolute -top-2 -right-2 bg-[#ecfdf5] text-[#10b981] text-[10px] font-black px-2 py-1 rounded-full border border-[#10b981]/10 shadow-sm">
                            EMPTY
                        </div>
                    </div>
                    <h3 className="text-3xl font-[900] text-[#1e293b] mb-4 tracking-tight">No Referral Benefits Found</h3>
                    <p className="text-[#64748b] text-lg font-medium leading-relaxed mb-4 max-w-md mx-auto">
                        There are no referral benefits for this farm.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col font-sans custom-scrollbar ${isEmbedded ? 'h-full' : 'min-h-screen overflow-y-auto max-h-screen'} bg-[#f8fafc]`}>
            {/* Header */}
            <div className="p-6 pb-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-[2.25rem] font-[900] text-[#1e293b] tracking-tight leading-none mb-3">Manage Referral Benefits</h2>
                        <p className="text-[#64748b] text-base font-semibold opacity-80">Track milestones and unlock exclusive rewards through network growth.</p>
                    </div>
                </div>
            </div>

            {/* Coins Rewards Heading & Global Activation Toggle */}
            {displayConfig && Object.keys(displayConfig).length > 0 && (
                <>
                    <div className="px-6 mt-6 flex items-end justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#1e293b] tracking-tight leading-none mb-1">Coins rewards</h3>
                        </div>
                        {/* Global Toggle */}
                        <button
                            onClick={() => {
                                setOtpActionType('global_toggle');
                                setPendingUpdates({ is_global_active: !displayConfig.is_global_active });
                                setIsOtpModalOpen(true);
                            }}
                            disabled={globalToggleLoading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all active:scale-95 shadow-sm border ${displayConfig.is_global_active
                                ? 'bg-[#ef4444] text-white border-[#ef4444] shadow-lg shadow-[#ef4444]/20 hover:bg-[#dc2626]'
                                : 'bg-[#10b981] text-white border-[#10b981] hover:bg-[#059669]'
                                } ${globalToggleLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {globalToggleLoading ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                            {displayConfig.is_global_active ? 'Disable Offer' : 'Active All Offers'}
                        </button>
                    </div>

                    {/* Redesigned Commission Cards Grid */}
                    <div className="px-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                        {/* Stage 1 Card */}
                        <div className="bg-white rounded-[1.25rem] p-3.5 shadow-[0_5px_20px_rgba(0,0,0,0.01)] border border-[#f1f5f9] relative group hover:shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all">
                            <div className="flex items-center justify-between mb-1 pr-10">
                                <span className="text-[9px] font-[900] text-[#1e293b] tracking-wider uppercase opacity-80">Direct Referral coins percent</span>
                                <button
                                    onClick={() => {
                                        setEditingStage(1);
                                        setEditValue(displayConfig?.stage1_percentage?.toString() || '0');
                                        setEditActiveStatus(displayConfig?.stage1_active || false);
                                    }}
                                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#10b981] transition-all"
                                >
                                    <Edit2 size={10} />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    if (!stage1Loading) {
                                        setOtpActionType('config');
                                        setPendingUpdates({ stage1_active: !displayConfig?.stage1_active });
                                        setIsOtpModalOpen(true);
                                    }
                                }}
                                disabled={stage1Loading}
                                className={`absolute top-4 right-4 w-8 h-4.5 rounded-full transition-all duration-500 relative ${displayConfig?.stage1_active ? 'bg-[#10b981] shadow-lg shadow-[#10b981]/10' : 'bg-slate-200'} ${stage1Loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {stage1Loading ? (
                                    <div className="absolute top-0.5 left-2.5 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-500 shadow-sm ${displayConfig?.stage1_active ? 'left-4' : 'left-0.5'}`} />
                                )}
                            </button>

                            <div className="flex flex-col items-center justify-center pt-0.5 pb-2">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-3xl font-[1000] text-[#1e293b] tracking-tighter leading-none">{displayConfig?.stage1_percentage}</span>
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
                                                    setOtpActionType('config');
                                                    setPendingUpdates({ stage1_percentage: parseFloat(editValue), stage1_active: editActiveStatus });
                                                    setIsOtpModalOpen(true);
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
                                    onClick={() => {
                                        if (!stage1Loading) {
                                            setOtpActionType('config');
                                            setPendingUpdates({ stage1_active: !displayConfig?.stage1_active });
                                            setIsOtpModalOpen(true);
                                        }
                                    }}
                                    disabled={stage1Loading}
                                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all active:scale-95 ${displayConfig?.stage1_active ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'} ${stage1Loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {stage1Loading ? (
                                        <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <div className={`w-1 h-1 rounded-full ${displayConfig?.stage1_active ? 'bg-[#10b981]' : 'bg-slate-300'}`} />
                                    )}
                                    {displayConfig?.stage1_active ? 'Active' : 'Inactive'}
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
                                        setEditValue(displayConfig?.stage2_percentage?.toString() || '0');
                                        setEditActiveStatus(displayConfig?.stage2_active || false);
                                    }}
                                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#10b981] transition-all"
                                >
                                    <Edit2 size={10} />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    if (!stage2Loading) {
                                        setOtpActionType('config');
                                        setPendingUpdates({ stage2_active: !displayConfig?.stage2_active });
                                        setIsOtpModalOpen(true);
                                    }
                                }}
                                disabled={stage2Loading}
                                className={`absolute top-4 right-4 w-8 h-4.5 rounded-full transition-all duration-500 relative ${displayConfig?.stage2_active ? 'bg-[#10b981] shadow-lg shadow-[#10b981]/10' : 'bg-slate-200'} ${stage2Loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {stage2Loading ? (
                                    <div className="absolute top-0.5 left-2.5 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-500 shadow-sm ${displayConfig?.stage2_active ? 'left-4' : 'left-0.5'}`} />
                                )}
                            </button>

                            <div className="flex flex-col items-center justify-center pt-0.5 pb-2">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-3xl font-[1000] text-[#1e293b] tracking-tighter leading-none">{displayConfig?.stage2_percentage}</span>
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
                                                    setOtpActionType('config');
                                                    setPendingUpdates({ stage2_percentage: parseFloat(editValue), stage2_active: editActiveStatus });
                                                    setIsOtpModalOpen(true);
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
                                    onClick={() => {
                                        if (!stage2Loading) {
                                            setOtpActionType('config');
                                            setPendingUpdates({ stage2_active: !displayConfig?.stage2_active });
                                            setIsOtpModalOpen(true);
                                        }
                                    }}
                                    disabled={stage2Loading}
                                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all active:scale-95 ${displayConfig?.stage2_active ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'} ${stage2Loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {stage2Loading ? (
                                        <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <div className={`w-1 h-1 rounded-full ${displayConfig?.stage2_active ? 'bg-[#10b981]' : 'bg-slate-300'}`} />
                                    )}
                                    {displayConfig?.stage2_active ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="px-6 mt-8 flex items-center justify-between">
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
                    <div className="flex items-center gap-0 px-6 min-w-max relative">
                        {displayMilestones.length === 0 ? (
                            <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-[#e2e8f0] text-center px-40 mx-4">
                                <div className="w-24 h-24 bg-[#f8fafc] rounded-full flex items-center justify-center mb-8 text-[#94a3b8]">
                                    <Star size={48} className="opacity-40" />
                                </div>
                                <h3 className="text-2xl font-black text-[#1e293b] mb-3">No Rewards Found</h3>
                            </div>
                        ) : (
                            displayMilestones.map((milestone: ReferralMilestone, index: number) => (
                                <div key={milestone.id} className="flex items-center relative group/milestone">
                                    {/* Connecting Line */}
                                    {index !== displayMilestones.length - 1 && (
                                        <div className={`absolute left-[calc(100%-1.5rem)] right-[-1.5rem] top-[45%] -translate-y-1/2 h-0.5 z-0 overflow-hidden transition-all duration-700 ${milestone.is_active ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`}>
                                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                        </div>
                                    )}

                                    {/* Card */}
                                    <div
                                        className={`relative z-10 w-[240px] bg-white rounded-[2rem] shadow-[0_15px_35px_rgba(0,0,0,0.03)] border-2 p-5 transition-all duration-500 hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 flex flex-col mx-3 ${milestone.is_active ? 'border-[#10b981] ring-4 ring-[#10b981]/5' : 'border-[#f1f5f9] opacity-90'}`}
                                    >
                                        {/* Action Header: Threshold Badge & Edit */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`px-2.5 py-1 rounded-lg font-black text-[9px] tracking-[0.1em] shadow-sm flex items-center justify-center ${milestone.is_active ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                                                {milestone.threshold} UNITS REQUIRED
                                            </div>
                                        </div>

                                        {/* Content: Icon & Text */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-500 group-hover/milestone:scale-105 shrink-0 ${milestone.is_active ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-[#10b981]/20' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                                                {getRewardIcon(milestone.reward)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-[#1e293b] leading-tight mb-1.5 tracking-tight transition-colors">{milestone.reward}</h3>
                                            </div>
                                        </div>

                                        <div className="mb-4 h-10">
                                            <p className="text-[#64748b] text-xs font-bold leading-relaxed opacity-80 line-clamp-2">{milestone.description || 'Exclusive reward for dedicated partners.'}</p>
                                        </div>

                                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (processingId === milestone.id) return;
                                                    setOtpActionType('milestone');
                                                    setPendingMilestone(milestone);
                                                    setIsOtpModalOpen(true);
                                                }}
                                                disabled={processingId === milestone.id}
                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm active:scale-95 border flex items-center justify-center gap-1.5 ${milestone.is_active
                                                    ? 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20 hover:bg-[#d1fae5]'
                                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-500'} ${processingId === milestone.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {processingId === milestone.id ? (
                                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : null}
                                                {milestone.is_active ? 'Active' : 'Inactive'}
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMilestone(milestone);
                                                    setIsModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm group/edit"
                                                title="Edit Milestone"
                                            >
                                                <Edit2 size={12} strokeWidth={3} className="group-hover/edit:text-[#10b981] transition-colors" />
                                                <span className="text-[10px] font-black tracking-widest uppercase">Edit</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="pb-32" />

            <CreateReferralMilestoneModal
                isOpen={isModalOpen}
                milestone={selectedMilestone}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMilestone(null);
                }}
                onSuccess={() => {
                    if (onRefresh) {
                        onRefresh();
                    } else {
                        fetchAllData(true);
                    }
                }}
            />

            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => {
                    setIsOtpModalOpen(false);
                    setPendingUpdates(null);
                    setPendingMilestone(null);
                }}
                onVerify={handleConfirmOtpAction}
                title="Admin Authorization"
                description={
                    otpActionType === 'milestone'
                        ? `Authorize turning ${pendingMilestone?.is_active ? 'OFF' : 'ON'} the "${pendingMilestone?.reward}" milestone.`
                        : otpActionType === 'global_toggle'
                            ? `Authorize ${pendingUpdates?.is_global_active ? 'ACTIVATING ALL' : 'DEACTIVATING ALL'} referral offers.`
                            : "Authorize changes to referral configuration percentages/status."
                }
                actionName={
                    otpActionType === 'milestone'
                        ? (pendingMilestone?.is_active ? "Deactivate" : "Activate")
                        : "Confirm Changes"
                }
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

            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}
        </div >
    );
};

export default ReferralBenefitsTab;
