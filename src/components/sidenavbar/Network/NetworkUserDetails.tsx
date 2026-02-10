import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchNetworkUserDetails } from '../../../store/slices/usersSlice';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Award, Package, CheckCircle, AlertCircle, Users, Plane, Smartphone as PhoneIcon, Bike, Gift, ShoppingBag } from 'lucide-react';
import Loader from '../../common/Loader';
import NetworkTreeVisualization from './NetworkTreeVisualization';

const NetworkUserDetailsPage: React.FC = () => {
    const { mobile } = useParams<{ mobile: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { networkUserDetails } = useAppSelector((state) => state.users);
    const { data, loading, error } = networkUserDetails;

    useEffect(() => {
        if (mobile) {
            dispatch(fetchNetworkUserDetails(mobile));
        }
    }, [dispatch, mobile]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Go Back</button>
            </div>
        );
    }

    if (!data || !data.user) {
        return null;
    }

    const { user, stats, network_tree } = data;
    // Parse achieved_rewards: It might be an array (old) or object (new)
    // We want a list of keys effectively: ["30", "50", "100"] if they exist
    // Parse achieved_rewards: It might be an array (old) or object (new)
    const achievedRewardsData = stats?.achieved_rewards || {};

    // We want a list of keys effectively: ["30", "50", "100"] if they exist
    const achievedRewardsKeys = Array.isArray(achievedRewardsData)
        ? achievedRewardsData
        : (typeof achievedRewardsData === 'object' ? Object.keys(achievedRewardsData) : []);

    // Helper to get reward label
    const getRewardLabel = (milestone: number, defaultLabel: string) => {
        const mStr = milestone.toString();
        if (Array.isArray(achievedRewardsData)) {
            // If it's an array, we don't have custom labels, return default
            return defaultLabel;
        }
        // If it's an object, check if there is a value for this key
        // Need to cast to any or check type because typescript might complain about index signature if not defined in stats type
        const val = (achievedRewardsData as any)[mStr];
        return val && typeof val === 'string' ? val : defaultLabel;
    };

    // Helper to check if a milestone is achieved
    const isAchieved = (milestone: string | number) => {
        const mStr = milestone.toString();
        // Check if key exists in achieved_rewards OR if units metric suffices (backup)
        return achievedRewardsKeys.includes(mStr) || (stats?.indirect_referrals_units || 0) >= Number(milestone);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">User Network Details</h1>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* User Profile Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500 overflow-hidden">
                                {user.aadhar_front_image_url ? (
                                    <img src={user.aadhar_front_image_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.first_name ? user.first_name[0].toUpperCase() : 'U'
                                )}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                                <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.verified ? 'Verified' : 'Pending'}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    {user.role}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                                <div className="flex items-center gap-2">
                                    <Phone size={16} /> {user.mobile}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} /> {user.email || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} /> {user.city}, {user.state} - {user.pincode}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} /> Joined: {new Date(user.user_created_date).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Main Network Stats In Card */}
                            <div className="flex flex-wrap gap-8 mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Network Size</div>
                                        <div className="text-sm font-black text-gray-800">{stats?.total_network_size || 0}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Paid Orders</div>
                                        <div className="text-sm font-black text-gray-800">{stats?.paid_orders_count || 0}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Paid Units</div>
                                        <div className="text-sm font-black text-gray-800">{stats?.paid_units_count || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Sections Stacked Vertically */}
                <div className="space-y-8">
                    {/* 1. Direct Referrals Stats */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Users className="text-blue-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Direct Referrals</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Direct Referrals Count */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Direct Referrals</div>
                                <div className="text-xl lg:text-2xl font-black text-slate-800">
                                    {stats?.direct_referrals_count || 0}
                                </div>
                            </div>

                            {/* Direct Referrals Units */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Direct Referrals Units</div>
                                <div className="text-xl lg:text-2xl font-black text-blue-600">
                                    {stats?.direct_referrals_units || 0}
                                </div>
                            </div>

                            {/* Total Coins */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Total Coins</div>
                                <div className="text-xl lg:text-2xl font-black text-amber-600 flex items-center gap-1.5">
                                    <Award className="w-5 h-5" />
                                    {(stats?.total_coins || 0).toLocaleString('en-IN')}
                                </div>
                            </div>

                            {/* Spending Coins */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Spent Coins</div>
                                <div className="text-xl lg:text-2xl font-black text-red-600">
                                    {(stats?.spending_coins || 0).toLocaleString('en-IN')}
                                </div>
                            </div>

                            {/* Remaining Coins */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Remaining Coins</div>
                                <div className="text-xl lg:text-2xl font-black text-green-600">
                                    {(stats?.remaining_coins || 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Indirect Referrals & Rewards */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Gift className="text-purple-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Indirect Referrals & Rewards</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Indirect Referrals Count */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Indirect Referrals</div>
                                <div className="text-xl lg:text-2xl font-black text-slate-800">
                                    {stats?.indirect_referrals_count || 0}
                                </div>
                            </div>

                            {/* Indirect Referrals Units */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Indirect Referrals Units</div>
                                <div className="text-xl lg:text-2xl font-black text-purple-600">
                                    {stats?.indirect_referrals_units || 0}
                                </div>
                            </div>
                        </div>

                        {/* Referral Rewards Progress Bar Component */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 xl:p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h4 className="text-base font-bold text-gray-800">Rewards Status</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats?.current_reward ? (
                                            <>Current Reward: <span className="text-purple-600 font-bold">{stats.current_reward}</span></>
                                        ) : 'Unlock exclusive benefits through indirect referrals'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Units Milestone</div>
                                    <div className="text-lg font-black text-purple-600">
                                        {stats?.indirect_referrals_units || 0} <span className="text-gray-300 font-normal ml-1">/ 100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative py-12 px-8 bg-slate-50/70 rounded-2xl border border-slate-100/50">
                                {/* Track Container */}
                                <div className="relative h-3 mx-2">
                                    {/* Progress Line Background */}
                                    <div className="absolute inset-0 bg-gray-200 rounded-full"></div>

                                    {/* Active Progress Line */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                                        style={{ width: `${Math.min(((stats?.indirect_referrals_units || 0) / 100) * 100, 100)}%` }}
                                    ></div>

                                    {/* Interval Nodes (Ticks) - Using absolute positioning for perfect alignment with milestones */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {[10, 20, 40, 60, 70, 80, 90].map((tick) => (
                                            <div
                                                key={tick}
                                                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 z-20 transition-all duration-500 ${(stats?.indirect_referrals_units || 0) >= tick ? 'bg-indigo-500 border-indigo-300' : 'bg-white border-gray-200'}`}
                                                style={{ left: `${tick}%` }}
                                            />
                                        ))}
                                    </div>

                                    {/* Milestones */}
                                    <div className="absolute inset-0 h-3">
                                        {/* Start Point (0) */}
                                        <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-lg z-30 transition-all"></div>
                                            <div className="absolute -bottom-10 text-[11px] font-black text-slate-600">0</div>
                                        </div>

                                        {/* Milestone 30 - Thailand */}
                                        <div className="absolute left-[30%] -translate-x-1/2 flex flex-col items-center">
                                            <div className="absolute -top-[82px] flex flex-col items-center group cursor-pointer">
                                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 shadow-sm whitespace-nowrap ${isAchieved(30) ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{getRewardLabel(30, 'Thailand Trip')}</div>
                                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isAchieved(30) ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-4 ring-blue-50' : 'bg-white border-blue-100 text-blue-400 shadow-md group-hover:scale-110'}`}>
                                                    <Plane size={20} />
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-4 z-30 transition-all duration-500 ${isAchieved(30) ? 'bg-blue-600 border-white ring-4 ring-blue-50 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}></div>
                                            <div className={`absolute -bottom-10 text-[11px] font-black transition-colors ${isAchieved(30) ? 'text-blue-600' : 'text-slate-400'}`}>30</div>
                                        </div>

                                        {/* Milestone 50 - iPhone */}
                                        <div className="absolute left-[50%] -translate-x-1/2 flex flex-col items-center">
                                            <div className="absolute -top-[82px] flex flex-col items-center group cursor-pointer">
                                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 shadow-sm whitespace-nowrap ${isAchieved(50) ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>{getRewardLabel(50, 'iPhone')}</div>
                                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isAchieved(50) ? 'bg-purple-600 border-purple-400 text-white shadow-lg ring-4 ring-purple-50' : 'bg-white border-purple-100 text-purple-400 shadow-md group-hover:scale-110'}`}>
                                                    <PhoneIcon size={20} />
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-4 z-30 transition-all duration-500 ${isAchieved(50) ? 'bg-purple-600 border-white ring-4 ring-purple-50 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}></div>
                                            <div className={`absolute -bottom-10 text-[11px] font-black transition-colors ${isAchieved(50) ? 'text-purple-600' : 'text-slate-400'}`}>50</div>
                                        </div>

                                        {/* Milestone 100 - Scooty */}
                                        <div className="absolute left-[100%] -translate-x-1/2 flex flex-col items-center">
                                            <div className="absolute -top-[82px] flex flex-col items-center group cursor-pointer">
                                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 shadow-sm whitespace-nowrap ${isAchieved(100) ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>{getRewardLabel(100, 'Ather E Bike')}</div>
                                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isAchieved(100) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-4 ring-indigo-50' : 'bg-white border-indigo-100 text-indigo-400 shadow-md group-hover:scale-110'}`}>
                                                    <Bike size={22} />
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-4 z-30 transition-all duration-500 ${isAchieved(100) ? 'bg-indigo-600 border-white ring-4 ring-indigo-50 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}></div>
                                            <div className={`absolute -bottom-10 text-[11px] font-black transition-colors ${isAchieved(100) ? 'text-indigo-600' : 'text-slate-400'}`}>100</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Network Visualization (Row below progress bar) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-800">
                        <Users size={24} className="text-indigo-500" /> Network Visualization
                    </h3>
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                        <NetworkTreeVisualization data={data} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NetworkUserDetailsPage;
