import React, { useState, useEffect } from 'react';
import { Gift, Award, Clock, AlertCircle, ShoppingBag, RotateCcw, Plus, Edit2, MoreVertical, XCircle, CheckCircle2, X, MonitorPlay } from 'lucide-react';
import { selfBenefitService } from '../../../services/api';
import BenefitModal from './CreateBenefitModal';
import { SelfBenefit } from '../../../types';

const SelfBenefitsList: React.FC = () => {
    const [benefits, setBenefits] = useState<SelfBenefit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBenefit, setSelectedBenefit] = useState<SelfBenefit | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [globalActionLoading, setGlobalActionLoading] = useState(false);
    const [showToggleConfirm, setShowToggleConfirm] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchBenefits();
    }, []);

    const fetchBenefits = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await selfBenefitService.getSelfBenefits();
            setBenefits(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching self benefits:', err);
            setError('Failed to load benefits. Please try again later.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const getAdminMobile = () => {
        try {
            const session = localStorage.getItem('ak_dashboard_session');
            if (session) {
                const parsed = JSON.parse(session);
                return parsed.mobile || '';
            }
        } catch (e) {
            console.error('Error parsing session:', e);
        }
        return '';
    };

    const handleToggleAll = async (status: boolean) => {
        const adminMobile = getAdminMobile();
        if (!adminMobile) return;

        setGlobalActionLoading(true);
        try {
            const result = await selfBenefitService.updateGlobalStatus(status, adminMobile);
            if (!result.error) {
                await fetchBenefits();
                setShowToggleConfirm(false);
            } else {
                alert(result.error);
            }
        } catch (err) {
            console.error('Error toggling all benefits:', err);
            alert('An unexpected error occurred');
        } finally {
            setGlobalActionLoading(false);
        }
    };

    const filteredBenefits = benefits;

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#f8fafc] p-10 min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e]"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading benefits...</p>
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
                        onClick={() => fetchBenefits()}
                        className="px-6 py-2 bg-[#22c55e] text-white rounded-xl hover:bg-[#1eb054] transition-all font-semibold shadow-md shadow-emerald-500/20"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const anyActive = benefits.some(b => b.is_active);

    return (
        <div className="flex flex-col bg-[#f4f7fa] p-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-[2rem] font-extrabold text-[#111827] leading-tight">
                        Manage Self Benefits
                    </h2>
                    <p className="text-[#6b7280] text-lg mt-1 font-medium">Configure and manage unit-based reward programs for members.</p>
                </div>
            </div>

            {/* Actions & Search Bar */}
            <div className="bg-white p-4 rounded-[1.5rem] shadow-sm mb-6 border border-[#f1f5f9] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {anyActive ? (
                        <button
                            type="button"
                            onClick={() => handleToggleAll(false)}
                            disabled={globalActionLoading}
                            className="flex items-center gap-2 bg-[#fef2f2] text-[#ef4444] px-5 py-2.5 rounded-xl font-bold hover:bg-[#fee2e2] border border-[#ef4444]/10 transition-all disabled:opacity-50 text-sm shadow-sm"
                        >
                            <XCircle size={16} fill="#ef4444" className="text-[#fef2f2]" />
                            Disable All Benefits
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleToggleAll(true)}
                            disabled={globalActionLoading}
                            className="flex items-center gap-2 bg-[#ecfdf5] text-[#10b981] px-5 py-2.5 rounded-xl font-bold hover:bg-[#d1fae5] border border-[#10b981]/10 transition-all disabled:opacity-50 text-sm shadow-sm"
                        >
                            <CheckCircle2 size={16} fill="#10b981" className="text-[#ecfdf5]" />
                            Activate All Benefits
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSelectedBenefit(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#10b981]/10 active:scale-95 text-sm"
                >
                    <Plus size={18} strokeWidth={3} />
                    Add New Benefit
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20">
                {filteredBenefits.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border-2 border-dashed border-[#e2e8f0] text-center">
                        <div className="w-20 h-20 bg-[#f8fafc] rounded-full flex items-center justify-center mb-6 text-[#94a3b8]">
                            <Gift size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[#1e293b] mb-2">No benefits available</h3>
                        <p className="text-[#64748b] max-w-sm mx-auto font-medium">
                            There are currently no active benefits to display. Start by adding one!
                        </p>
                    </div>
                ) : (
                    filteredBenefits.map((benefit) => (
                        <div
                            key={benefit.id}
                            className={`bg-white rounded-[1.5rem] shadow-sm border border-[#f1f5f9] p-5 flex items-center gap-6 relative group transition-all hover:shadow-xl hover:scale-[1.01]`}
                        >
                            {/* Card Header: Icon Section (Left) */}
                            <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${benefit.is_active ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                                {benefit.units_required >= 100 ? <ShoppingBag size={28} /> :
                                    benefit.units_required >= 50 ? <Award size={28} /> :
                                        benefit.title.toLowerCase().includes('trip') ? <MonitorPlay size={28} /> : <Gift size={28} />}
                            </div>

                            {/* Info Section (Center) */}
                            <div className="flex-grow min-w-0 py-1">
                                <h3 className="font-bold text-[#111827] text-lg mb-1.5 group-hover:text-[#10b981] transition-colors leading-tight">
                                    {benefit.title}
                                </h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#f1f5f9] text-[#475569] rounded-md border border-[#e2e8f0]">
                                        <ShoppingBag size={12} className="text-[#64748b]" />
                                        <span className="text-[11px] font-black tracking-tight">{benefit.units_required} UNITS REQUIRED</span>
                                    </div>
                                </div>
                                <p className="text-[#64748b] text-[11px] font-bold leading-snug opacity-70">
                                    {benefit.description || 'Exclusive reward for completing unit milestones.'}
                                </p>
                            </div>

                            {/* Footer Actions (Right) */}
                            <div className="flex-shrink-0 flex flex-col items-center gap-2 ml-auto pl-6 border-l border-[#f1f5f9] self-center">
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (processingId === benefit.id) return;

                                        const adminMobile = getAdminMobile();
                                        if (!adminMobile) {
                                            alert("Admin session not found");
                                            return;
                                        }

                                        setProcessingId(benefit.id);
                                        try {
                                            const result = await selfBenefitService.updateSelfBenefit(
                                                benefit.id,
                                                {
                                                    title: benefit.title,
                                                    description: benefit.description,
                                                    units_required: benefit.units_required,
                                                    is_active: !benefit.is_active
                                                },
                                                adminMobile
                                            );
                                            if (!result.error) {
                                                await fetchBenefits(true);
                                            } else {
                                                console.error(result.error);
                                            }
                                        } catch (err) {
                                            console.error("Failed to toggle status", err);
                                        } finally {
                                            setProcessingId(null);
                                        }
                                    }}
                                    disabled={processingId === benefit.id}
                                    className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${benefit.is_active
                                        ? 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20 hover:bg-[#d1fae5]'
                                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'} ${processingId === benefit.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {processingId === benefit.id ? (
                                        <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : null}
                                    {benefit.is_active ? 'Active' : 'Inactive'}
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBenefit(benefit);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#334155] hover:text-[#10b981] font-bold text-[10px] rounded-lg border border-slate-200 transition-all active:scale-95 w-full justify-center"
                                >
                                    <Edit2 size={12} />
                                    EDIT
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BenefitModal
                isOpen={isModalOpen}
                benefit={selectedBenefit}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedBenefit(null);
                }}
                onSuccess={() => {
                    fetchBenefits(true);
                }}
            />
        </div>
    );
};

export default SelfBenefitsList;
