import React, { useState, useEffect } from 'react';
import {
    Tractor,
    Package,
    PieChart,
    Bell,
    Pencil,
    Plus,
    Loader2,
    Store,
    ShoppingBag
} from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { farmService } from '../../../services/api';
import { Farm, CreateFarmRequest } from '../../../types';
import Snackbar from '../../common/Snackbar';
import CreateFarmModal from './CreateFarmModal';
import CreateMarketModal from './CreateMarketModal';
import MarketListTab from './MarketListTab';
import OtpVerificationModal from '../../common/OtpVerificationModal';

const FarmManagement: React.FC = () => {
    const { adminMobile, adminRole } = useAppSelector((state: any) => state.auth);
    const adminProfile = useAppSelector((state: any) => state.users.adminProfile);

    const effectiveRole = adminProfile?.role || adminRole;
    const isSuperAdmin = effectiveRole?.split(',').map((r: string) => r.trim()).includes('SuperAdmin');

    const [activeSubTab, setActiveSubTab] = useState<'farm' | 'market'>('farm');
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('--');
    const [processingAction, setProcessingAction] = useState<{ id: string, type: string } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [snackbar, setSnackbar] = useState<{ message: string | null; type: 'success' | 'error' | null }>({ message: null, type: null });

    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<any>(null);
    const [otpActionType, setOtpActionType] = useState<'status' | 'benefit' | null>(null);

    const fetchFarms = async () => {
        setLoading(true);
        try {
            const data = await farmService.getFarms(statusFilter);
            setFarms(data);
        } catch (error) {
            console.error('Error fetching farms:', error);
            setSnackbar({ message: 'Failed to fetch farms', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeSubTab === 'farm') {
            fetchFarms();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, activeSubTab]);

    const handleAddClick = () => {
        if (activeSubTab === 'farm') {
            setSelectedFarm(null);
            setIsModalOpen(true);
        } else {
            setIsMarketModalOpen(true);
        }
    };

    const handleEditClick = (farm: Farm) => {
        setSelectedFarm(farm);
        setIsModalOpen(true);
    };

    const handleStatusToggle = (farm: Farm) => {
        if (!adminMobile) {
            setSnackbar({ message: 'Admin mobile number not found. Please log in again.', type: 'error' });
            return;
        }

        setOtpActionType('status');
        setPendingAction(farm);
        setIsOtpModalOpen(true);
    };

    const handleBenefitToggle = (farm: Farm, field: 'isSelfBenefitsActive' | 'isReferralBenefitsActive') => {
        if (!adminMobile) {
            setSnackbar({ message: 'Admin mobile number not found. Please log in again.', type: 'error' });
            return;
        }

        setOtpActionType('benefit');
        setPendingAction({ farm, field });
        setIsOtpModalOpen(true);
    };

    const handleConfirmOtp = async (mobile: string, otp: string) => {
        if (otpActionType === 'status' && pendingAction) {
            const farm = pendingAction as Farm;
            try {
                setProcessingAction({ id: farm.id, type: 'status' });
                const newStatus = farm.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                const farmData: CreateFarmRequest = {
                    location: farm.location,
                    strength: farm.strength,
                    status: newStatus,
                    isSelfBenefitsActive: farm.isSelfBenefitsActive,
                    isReferralBenefitsActive: farm.isReferralBenefitsActive,
                };

                const response = await farmService.updateFarm(farm.id, farmData, mobile, otp);

                if (response.error) {
                    throw new Error(response.error);
                } else {
                    setSnackbar({
                        message: `Farm status updated to ${newStatus}!`,
                        type: 'success'
                    });
                    await fetchFarms();
                }
            } catch (error: any) {
                setSnackbar({ message: error.message || 'An unexpected error occurred', type: 'error' });
                throw error;
            } finally {
                setProcessingAction(null);
                setPendingAction(null);
            }
        } else if (otpActionType === 'benefit' && pendingAction) {
            const { farm, field } = pendingAction;
            try {
                setProcessingAction({ id: farm.id, type: field });
                const farmData: CreateFarmRequest = {
                    location: farm.location,
                    strength: farm.strength,
                    status: farm.status,
                    isSelfBenefitsActive: farm.isSelfBenefitsActive,
                    isReferralBenefitsActive: farm.isReferralBenefitsActive,
                    [field]: !farm[field]
                };

                const response = await farmService.updateFarm(farm.id, farmData, mobile, otp);

                if (response.error) {
                    throw new Error(response.error);
                } else {
                    setSnackbar({
                        message: `${field === 'isSelfBenefitsActive' ? 'Self Benefits' : 'Referral Benefits'} updated!`,
                        type: 'success'
                    });
                    await fetchFarms();
                }
            } catch (error: any) {
                setSnackbar({ message: error.message || 'An unexpected error occurred', type: 'error' });
                throw error;
            } finally {
                setProcessingAction(null);
                setPendingAction(null);
            }
        }
    };


    const calculateStats = () => {
        const totalFarms = farms.length;
        const globalCapacity = farms.reduce((acc, farm) => acc + (farm.strength || 0), 0);
        const filled = farms.reduce((acc, farm) => acc + (farm.currentUnits || 0), 0);
        const remaining = globalCapacity - filled;

        return [
            { title: 'Total Farms', value: totalFarms.toString(), icon: <Tractor size={16} />, color: 'bg-blue-50 text-blue-600' },
            { title: 'Global Capacity', value: globalCapacity.toLocaleString(), subValue: 'Units', icon: <Package size={16} />, color: 'bg-blue-50 text-blue-600' },
            { title: 'Filled', value: filled.toLocaleString(), subValue: 'Units', icon: <PieChart size={16} />, color: 'bg-blue-50 text-blue-600' },
            { title: 'Remaining', value: remaining.toLocaleString(), subValue: 'Units', icon: <Bell size={16} />, color: 'bg-blue-50 text-blue-600' },
        ];
    };

    const stats = calculateStats();

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-orange-500';
        return 'bg-blue-500';
    };

    const getTextColor = (percentage: number, status?: string) => {
        if (percentage >= 90 || status === 'FULL') return 'text-orange-600';
        return 'text-blue-600';
    };

    return (
        <div className="px-4 py-0 bg-[#f8fafc] min-h-screen relative pb-24">
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar({ message: null, type: null })}
            />

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-[#f8fafc]/80 backdrop-blur-md py-4 mb-6 -mx-4 px-4 border-b border-transparent transition-all group-scroll:border-slate-200">
                {/* Sub-Tabs Navigation */}
                <div className="flex items-center gap-6 mb-6 border-b border-slate-100">
                    <button
                        onClick={() => setActiveSubTab('farm')}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeSubTab === 'farm' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Tractor size={16} />
                            <span>Farm</span>
                        </div>
                        {activeSubTab === 'farm' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('market')}
                        className={`pb-3 text-sm font-bold transition-all relative ${activeSubTab === 'market' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Store size={16} />
                            <span>Market</span>
                        </div>
                        {activeSubTab === 'market' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            {activeSubTab === 'farm' ? 'Farm Management' : 'Market Management'}
                        </h1>
                        <p className="text-slate-500 text-xs font-medium mt-1">
                            {activeSubTab === 'farm'
                                ? 'Manage and monitor your farm inventory'
                                : 'Explore and manage marketplace activities'}
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-blue-600 text-white rounded-xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all z-40 group focus:outline-none"
                        >
                            <span className="font-bold text-xs tracking-wide uppercase">
                                {activeSubTab === 'farm' ? 'Add Farm' : 'Add Market'}
                            </span>
                            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {activeSubTab === 'farm' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`${stat.color} p-1.5 rounded-lg`}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-slate-500 font-medium text-xs">{stat.title}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-slate-800">{stat.value}</span>
                                    {stat.subValue && <span className="text-slate-400 text-[10px]">{stat.subValue}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Farm Inventory Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-slate-800">Farm Inventory</h2>
                            <div className="flex items-center gap-4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-slate-600 transition-all cursor-pointer"
                                >
                                    <option value="--">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="FULL">Full</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin text-blue-600" size={40} />
                                    <p className="text-slate-500 font-medium">Loading farm inventory...</p>
                                </div>
                            ) : farms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-full text-slate-400">
                                        <Tractor size={40} />
                                    </div>
                                    <p className="text-slate-500 font-medium">No farms found</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                            <th className="px-6 py-4">Farm Location</th>
                                            <th className="px-6 py-4">Capacity Status</th>
                                            <th className="px-6 py-4 text-center">Farm Status</th>
                                            <th className="px-6 py-4 text-center">Self Benefit</th>
                                            <th className="px-6 py-4 text-center">Referral Benefit</th>
                                            <th className="px-6 py-4 text-center">Total Cap.</th>
                                            <th className="px-6 py-4 text-center">Onboarded</th>
                                            <th className="px-6 py-4 text-center">Remaining</th>
                                            {isSuperAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {farms.map((farm) => {
                                            const percentage = farm.strength > 0 ? ((farm.currentUnits || 0) / farm.strength) * 100 : 0;
                                            return (
                                                <tr key={farm.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-5 font-semibold text-slate-700">{farm.location}</td>
                                                    <td className="px-6 py-5 min-w-[200px]">
                                                        <div className="flex items-center justify-between gap-4 mb-2">
                                                            <span className={`text-[10px] font-bold uppercase ${getTextColor(percentage, farm.status)}`}>
                                                                {percentage.toFixed(0)}% FULL
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                                {(farm.currentUnits || 0).toLocaleString()} / {farm.strength.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <button
                                                            onClick={() => handleStatusToggle(farm)}
                                                            disabled={!isSuperAdmin || (processingAction?.id === farm.id && processingAction?.type === 'status')}
                                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 min-w-[80px] ${!isSuperAdmin ? 'cursor-default' : ''} ${farm.status === 'ACTIVE'
                                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                : farm.status === 'FULL'
                                                                    ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                                }`}
                                                        >
                                                            {processingAction?.id === farm.id && processingAction?.type === 'status' ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                farm.status
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <button
                                                            onClick={() => handleBenefitToggle(farm, 'isSelfBenefitsActive')}
                                                            disabled={!isSuperAdmin || (processingAction?.id === farm.id && processingAction?.type === 'isSelfBenefitsActive')}
                                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 min-w-[80px] ${!isSuperAdmin ? 'cursor-default' : ''} ${farm.isSelfBenefitsActive
                                                                ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                                                                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {processingAction?.id === farm.id && processingAction?.type === 'isSelfBenefitsActive' ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                farm.isSelfBenefitsActive ? 'Enabled' : 'Disabled'
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <button
                                                            onClick={() => handleBenefitToggle(farm, 'isReferralBenefitsActive')}
                                                            disabled={!isSuperAdmin || (processingAction?.id === farm.id && processingAction?.type === 'isReferralBenefitsActive')}
                                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 min-w-[80px] ${!isSuperAdmin ? 'cursor-default' : ''} ${farm.isReferralBenefitsActive
                                                                ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                                                                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {processingAction?.id === farm.id && processingAction?.type === 'isReferralBenefitsActive' ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                farm.isReferralBenefitsActive ? 'Enabled' : 'Disabled'
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5 text-center font-semibold text-slate-600 tracking-tight">{farm.strength.toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-center font-semibold text-slate-600 tracking-tight">{(farm.currentUnits || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-center font-bold text-blue-600 tracking-tight">{farm.availableUnits.toLocaleString()}</td>
                                                    {isSuperAdmin && (
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center justify-end">
                                                                <button
                                                                    onClick={() => handleEditClick(farm)}
                                                                    className="p-2 rounded-lg transition-all text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                >
                                                                    <Pencil size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )
                            }
                        </div>

                        {!loading && farms.length > 0 && (
                            <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-sm text-slate-500">Showing {farms.length} of {farms.length} farms</span>
                                <div className="flex items-center gap-2">
                                    <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg disabled:opacity-50">
                                        Previous
                                    </button>
                                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white font-semibold text-sm">
                                        1
                                    </button>
                                    <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <MarketListTab
                    isSuperAdmin={isSuperAdmin}
                    adminMobile={adminMobile || undefined}
                />
            )}

            {/* The floating button was moved to the sticky header at the top */}

            <CreateFarmModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedFarm(null);
                }}
                onSuccess={(msg) => {
                    setSnackbar({ message: msg, type: 'success' });
                    fetchFarms();
                }}
                initialData={selectedFarm ? {
                    ...selectedFarm,
                    strength: selectedFarm.strength.toString()
                } : null}
                isEditMode={!!selectedFarm}
                adminMobile={adminMobile || undefined}
            />

            <CreateMarketModal
                isOpen={isMarketModalOpen}
                onClose={() => setIsMarketModalOpen(false)}
                onSuccess={(msg) => setSnackbar({ message: msg, type: 'success' })}
                isEditMode={false}
                adminMobile={adminMobile || undefined}
            />

            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => {
                    setIsOtpModalOpen(false);
                    setPendingAction(null);
                }}
                onVerify={handleConfirmOtp}
                title="Admin Authorization"
                description={
                    otpActionType === 'status'
                        ? `Authorize changing status for ${pendingAction?.location} to ${pendingAction?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}.`
                        : `Authorize toggling ${pendingAction?.field === 'isSelfBenefitsActive' ? 'Self Benefits' : 'Referral Benefits'} for ${pendingAction?.farm?.location}.`
                }
                actionName="Confirm Action"
            />
        </div>
    );
};

export default FarmManagement;
