import React from 'react';
import MonthlySalesChart from './MonthlySalesChart';
import MonthlyTargetCard from './MonthlyTargetCard';
import RecentOrdersCard from './RecentOrdersCard';
import RecentCustomersCard from './RecentCustomersCard';
import CategoryCard from './CategoryCard';
import CoinsStatsCard from './CoinsStatsCard';
import UnitsStatsCard from './UnitsStatsCard';
import OrdersStatsCard from './OrdersStatsCard';
import TopProductsCard from './TopProductsCard';
import StatsCard from './StatsCard';
import { Users, ShoppingBag, Clock, CheckCircle, AlertCircle, Coins, CreditCard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStatusCounts } from '../../store/slices/ordersSlice';
import type { RootState } from '../../store';
import DashboardTabLayout from './DashboardTabLayout';

const DashboardHome: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        totalAllOrders,
        pendingAdminApprovalCount,
        paidCount,
        rejectedCount,
        paymentDueCount,
        coinsRedeemedCount
    } = useAppSelector((state: RootState) => state.orders);
    const { adminMobile } = useAppSelector((state: RootState) => state.auth);

    const [activeTab, setActiveTab] = React.useState<'coins' | 'units' | 'orders' | 'users'>('coins');

    React.useEffect(() => {
        if (adminMobile) {
            dispatch(fetchStatusCounts({ adminMobile }));
        }
    }, [dispatch, adminMobile]);

    const customerCount = "3,782";

    const tabs = [
        { id: 'coins', label: 'Coins' },
        { id: 'units', label: 'Units' },
        { id: 'orders', label: 'Orders' },
        { id: 'users', label: 'Users' }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 transform scale-105'
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dashboard Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Coins View */}
                {activeTab === 'coins' && (
                    <DashboardTabLayout
                        stats={[
                            { title: 'Total Coins Distributed', count: '1.55M', trend: 20 },
                            { title: 'Redeemed Orders', count: coinsRedeemedCount?.toString() || "245", trend: 12 },
                            { title: 'Active Campaigns', count: '8', trend: -4.5 }
                        ]}
                        chartProps={{ primaryValue: "1.55M", secondaryValue: "850K" }}
                        revenueProps={{ target: 2000000, current: 1550000 }}
                        categoryData={{
                            labels: ['Referrals', 'Signups', 'Bonuses'],
                            datasets: [{
                                data: [55, 30, 15],
                                backgroundColor: ['#3b82f6', '#6366f1', '#93c5fd'],
                                borderWidth: 0
                            }]
                        }}
                    />
                )}

                {/* Units View */}
                {activeTab === 'units' && (
                    <DashboardTabLayout
                        stats={[
                            { title: 'Total Units Sold', count: totalAllOrders ? totalAllOrders.toLocaleString() : "323", trend: 15 },
                            { title: 'Revenue from Units', count: '$234,210', trend: 9.0 },
                            { title: 'Pending Delivery', count: '12', trend: -2.5 }
                        ]}
                        chartProps={{ primaryValue: "$234,210", secondaryValue: "$45,320" }}
                        revenueProps={{ target: 500000, current: 234210 }}
                        categoryData={{
                            labels: ['Standard', 'Premium', 'Bulk'],
                            datasets: [{
                                data: [60, 25, 15],
                                backgroundColor: ['#10b981', '#34d399', '#6ee7b7'],
                                borderWidth: 0
                            }]
                        }}
                    />
                )}

                {/* Orders View */}
                {activeTab === 'orders' && (
                    <DashboardTabLayout
                        stats={[
                            { title: 'Pending Approval', count: pendingAdminApprovalCount?.toString() || "0", trend: 5 },
                            { title: 'Approved Orders', count: paidCount?.toString() || "0", trend: 8.2 },
                            { title: 'Rejected Orders', count: rejectedCount?.toString() || "0", trend: -2.1 }
                        ]}
                        chartProps={{ primaryValue: "1,250", secondaryValue: "430" }}
                        revenueProps={{ target: 2000, current: 1250 }}
                        categoryData={{
                            labels: ['Credit Card', 'Bank Transfer', 'UPI'],
                            datasets: [{
                                data: [40, 35, 25],
                                backgroundColor: ['#f59e0b', '#fbbf24', '#fcd34d'],
                                borderWidth: 0
                            }]
                        }}
                    />
                )}

                {/* Users View */}
                {activeTab === 'users' && (
                    <DashboardTabLayout
                        stats={[
                            { title: 'Total Users', count: customerCount, trend: 12 },
                            { title: 'Active Users', count: '1,240', trend: 5.4 },
                            { title: 'New Signups', count: '45', trend: 18 }
                        ]}
                        chartProps={{ primaryValue: "3,782", secondaryValue: "850" }}
                        revenueProps={{ target: 5000, current: 3782 }}
                        customFooter={<RecentCustomersCard />}
                        showRecentOrders={false} // Use custom footer for Users tab
                        categoryData={{
                            labels: ['Mobile App', 'Web', 'Referral'],
                            datasets: [{
                                data: [70, 20, 10],
                                backgroundColor: ['#ec4899', '#f472b6', '#fbcfe8'],
                                borderWidth: 0
                            }]
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
