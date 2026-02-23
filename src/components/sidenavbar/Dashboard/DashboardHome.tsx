import React from 'react';
import { Coins, Package, ShoppingCart, Users, Gem, Box, CreditCard, UserPlus, Activity } from 'lucide-react';
import RecentOrdersCard from './RecentOrdersCard';
import RecentCustomersCard from './RecentCustomersCard';
import RecentCoinTransactionsCard from './RecentCoinTransactionsCard';
import RecentUnitsSoldCard from './RecentUnitsSoldCard';
import DashboardTabLayout from './DashboardTabLayout';

const DashboardHome: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState<'coins' | 'units' | 'orders' | 'users'>('coins');

    // Static Data Configuration
    const tabs = [
        { id: 'coins', label: 'Coins', icon: <Coins size={16} /> },
        { id: 'units', label: 'Units', icon: <Package size={16} /> },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart size={16} /> },
        { id: 'users', label: 'Users', icon: <Users size={16} /> }
    ];

    // 1. Coins Data
    const coinsData = {
        stats: [
            { title: 'Total Coins Distributed', count: '1.55M', trend: 20, icon: <Gem size={20} /> },
            { title: 'Redeemed Orders', count: '245', trend: 12, icon: <ShoppingCart size={20} /> },
            { title: 'Active Campaigns', count: '8', trend: -4.5, icon: <Activity size={20} /> }
        ],
        chartProps: { primaryValue: "1.55M", secondaryValue: "850K" },
        revenueProps: { target: 2000000, current: 1550 },
        categoryData: {
            labels: ['Referrals', 'Signups', 'Bonuses'],
            datasets: [{
                data: [55, 30, 15],
                backgroundColor: ['#6366f1', '#818cf8', '#c7d2fe'],
                borderWidth: 0
            }]
        },
        footer: <RecentCoinTransactionsCard />
    };

    // 2. Units Data
    const unitsData = {
        stats: [
            { title: 'Total Units Sold', count: '323', trend: 15, icon: <Box size={20} /> },
            { title: 'Revenue from Units', count: '₹2,34,210', trend: 9.0, icon: <CreditCard size={20} /> },
            { title: 'Pending Delivery', count: '12', trend: -2.5, icon: <Package size={20} /> }
        ],
        chartProps: { primaryValue: "₹234K", secondaryValue: "₹45K" },
        revenueProps: { target: 500000, current: 234 },
        categoryData: {
            labels: ['Standard', 'Premium', 'Bulk'],
            datasets: [{
                data: [60, 25, 15],
                backgroundColor: ['#6366f1', '#818cf8', '#c7d2fe'],
                borderWidth: 0
            }]
        },
        footer: <RecentUnitsSoldCard />
    };

    // 3. Orders Data
    const ordersData = {
        stats: [
            { title: 'Pending Approval', count: '15', trend: 5, icon: <Activity size={20} /> },
            { title: 'Approved Orders', count: '120', trend: 8.2, icon: <ShoppingCart size={20} /> },
            { title: 'Rejected Orders', count: '5', trend: -2.1, icon: <Package size={20} /> }
        ],
        chartProps: { primaryValue: "140", secondaryValue: "120" },
        revenueProps: { target: 200, current: 140 },
        categoryData: {
            labels: ['Credit Card', 'Bank Transfer', 'UPI'],
            datasets: [{
                data: [40, 35, 25],
                backgroundColor: ['#6366f1', '#818cf8', '#c7d2fe'],
                borderWidth: 0
            }]
        },
        footer: <RecentOrdersCard />
    };

    // 4. Users Data
    const usersData = {
        stats: [
            { title: 'Total Users', count: '3,782', trend: 12, icon: <Users size={20} /> },
            { title: 'Active Users', count: '1,240', trend: 5.4, icon: <UserPlus size={20} /> },
            { title: 'New Signups', count: '45', trend: 18, icon: <Gem size={20} /> }
        ],
        chartProps: { primaryValue: "3,782", secondaryValue: "850" },
        revenueProps: { target: 5000, current: 3782 },
        categoryData: {
            labels: ['Mobile App', 'Web', 'Referral'],
            datasets: [{
                data: [70, 20, 10],
                backgroundColor: ['#6366f1', '#818cf8', '#c7d2fe'],
                borderWidth: 0
            }]
        },
        footer: <RecentCustomersCard />
    };

    const getActiveData = () => {
        switch (activeTab) {
            case 'coins': return coinsData;
            case 'units': return unitsData;
            case 'orders': return ordersData;
            case 'users': return usersData;
            default: return coinsData;
        }
    };

    const activeData = getActiveData();

    return (
        <div className="animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-[var(--slate-900)] tracking-tight">Overview</h1>
                <p className="text-[var(--slate-500)] font-semibold mt-1">Welcome back, here's what's happening today.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-3 mb-10 bg-[var(--slate-100)] p-1.5 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-white text-[var(--slate-900)] shadow-lg shadow-[var(--slate-200)] transform scale-105'
                            : 'text-[var(--slate-500)] hover:text-[var(--slate-700)]'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dashboard Content */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <DashboardTabLayout
                    stats={activeData.stats}
                    chartProps={activeData.chartProps}
                    revenueProps={activeData.revenueProps}
                    categoryData={activeData.categoryData}
                    customFooter={activeData.footer}
                    showRecentOrders={false}
                    showSchedule={true}
                />
            </div>
        </div>
    );
};

export default DashboardHome;
