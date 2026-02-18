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
    // Helper to get reward icon
    const getRewardIcon = (reward: string) => {
        const r = reward.toLowerCase();
        if (r.includes('thailand') || r.includes('trip') || r.includes('plane')) return <Plane size={22} strokeWidth={2.5} />;
        if (r.includes('iphone') || r.includes('phone') || r.includes('mobile')) return <PhoneIcon size={22} strokeWidth={2.5} />;
        if (r.includes('bike') || r.includes('ather') || r.includes('scooter')) return <Bike size={24} strokeWidth={2.5} />;
        if (r.includes('gift') || r.includes('voucher')) return <Gift size={22} strokeWidth={2.5} />;
        return <Award size={22} strokeWidth={2.5} />;
    };

    // Milestones from backend
    const milestones = stats?.achieved_rewards_list || [];
    const maxMilestone = milestones.length > 0 ? Math.max(...milestones.map((m: any) => m.threshold)) : 100;
    const currentUnits = stats?.direct_referrals_units || 0;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">User Network Details</h1>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* User Profile Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                <User size={48} className="text-gray-400" />
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
                                <div className="flex items-center gap-2"><Phone size={16} /> {user.mobile}</div>
                                <div className="flex items-center gap-2"><Mail size={16} /> {user.email || 'N/A'}</div>
                                <div className="flex items-center gap-2"><MapPin size={16} /> {user.city}, {user.state} - {user.pincode}</div>
                                <div className="flex items-center gap-2"><Calendar size={16} /> Joined: {new Date(user.user_created_date).toLocaleDateString()}</div>
                            </div>

                            <div className="flex flex-wrap gap-8 mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Users size={20} /></div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Network Size</div>
                                        <div className="text-sm font-black text-gray-800">{stats?.total_network_size || 0}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShoppingBag size={20} /></div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Paid Orders</div>
                                        <div className="text-sm font-black text-gray-800">{stats?.paid_orders_count || 0}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Package size={20} /></div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Paid Units</div>
                                        <div className="text-sm font-black text-gray-800">{stats?.paid_units_count || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Coins Overview */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Award className="text-amber-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Coins Overview</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Total Coins</div>
                                <div className="text-xl lg:text-2xl font-black text-amber-600 flex items-center gap-1.5"><Award className="w-5 h-5" />{(stats?.total_coins || 0).toLocaleString('en-IN')}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Spent Coins</div>
                                <div className="text-xl lg:text-2xl font-black text-red-600">{(stats?.spending_coins || 0).toLocaleString('en-IN')}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Remaining</div>
                                <div className="text-xl lg:text-2xl font-black text-green-600">{(stats?.remaining_coins || 0).toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Direct Referrals */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <Users className="text-blue-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Direct Referrals</h3>
                        </div>

                        {/* Direct Stats - Only Referrals & Units */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Direct Referrals</div>
                                <div className="text-xl lg:text-2xl font-black text-slate-800">{stats?.direct_referrals_count || 0}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Direct Units</div>
                                <div className="text-xl lg:text-2xl font-black text-blue-600">{stats?.direct_referrals_units || 0}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Direct Referral Coins</div>
                                <div className="text-xl lg:text-2xl font-black text-amber-600 flex items-center gap-1.5"><Award className="w-5 h-5" />{(stats?.direct_referrals_coins || 0).toLocaleString('en-IN')}</div>
                            </div>
                        </div>

                        {/* Direct Rewards Status */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 xl:p-10">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-32 gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800">Direct Rewards Status</h4>
                                    <p className="text-sm text-gray-500 mt-1">Unlock exclusive benefits through direct referrals</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">UNITS MILESTONE</div>
                                    <div className="text-3xl font-black text-blue-600 leading-none">
                                        {currentUnits}
                                        <span className="text-gray-200 text-xl font-medium ml-2">/ {maxMilestone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative px-4 sm:px-8 pb-8">
                                <div className="relative h-3 mx-0 sm:mx-4">
                                    {/* Background Track */}
                                    <div className="absolute inset-0 bg-blue-50 rounded-full"></div>

                                    {/* Active Progress */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((currentUnits / maxMilestone) * 100, 100)}%` }}
                                    ></div>

                                    {/* Milestones Container */}
                                    <div className="absolute inset-0 h-3">
                                        {/* Start Point (0) */}
                                        <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-blue-500 border-[3px] border-white shadow-sm z-10"></div>
                                            <div className="absolute -bottom-8 text-xs font-bold text-slate-400">0</div>
                                        </div>

                                        {/* Dynamic Milestones */}
                                        {milestones.map((m: any, idx: number) => {
                                            const threshold = m.threshold;
                                            const label = m.reward;
                                            const position = (threshold / maxMilestone) * 100;
                                            const achieved = currentUnits >= threshold;
                                            const colorClass = idx === 0 ? 'blue' : idx === 1 ? 'purple' : 'indigo';

                                            return (
                                                <div key={idx} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${position}%` }}>
                                                    {/* Label & Icon */}
                                                    <div className="absolute -top-[100px] flex flex-col items-center group">
                                                        <div className={`text-[9px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full mb-3 shadow-sm whitespace-nowrap transition-all duration-300 ${achieved ? `bg-${colorClass}-600 text-white scale-100 opacity-100` : 'bg-slate-100 text-slate-400 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'}`}>
                                                            {label}
                                                        </div>
                                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${achieved ? `bg-${colorClass}-600 text-white shadow-${colorClass}-200 scale-110` : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                                                            {getRewardIcon(label)}
                                                        </div>
                                                    </div>
                                                    {/* Dot on line */}
                                                    <div className={`w-5 h-5 rounded-full border-[3px] z-10 transition-all duration-500 ${achieved ? `bg-${colorClass}-600 border-white` : 'bg-white border-blue-100'}`}></div>
                                                    <div className={`absolute -bottom-8 text-xs font-bold transition-colors ${achieved ? `text-${colorClass}-600` : 'text-slate-400'}`}>{threshold}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Indirect Referrals */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Gift className="text-purple-600" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Indirect Referrals</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Indirect Referrals</div>
                                <div className="text-xl lg:text-2xl font-black text-slate-800">{stats?.indirect_referrals_count || 0}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Indirect Referrals Units</div>
                                <div className="text-xl lg:text-2xl font-black text-purple-600">{stats?.indirect_referrals_units || 0}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-md">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Indirect Referrals Coins</div>
                                <div className="text-xl lg:text-2xl font-black text-amber-600">{(stats?.indirect_referrals_coins || 0).toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    </div>

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
        </div>
    );
};

export default NetworkUserDetailsPage;
