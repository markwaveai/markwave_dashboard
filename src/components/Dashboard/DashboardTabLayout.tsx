import React, { ReactNode } from 'react';
import NewStatsCard from './NewStatsCard';
import StatisticsChart from './StatisticsChart';
import RevenueGaugeCard from './RevenueGaugeCard';
import SalesCategoryCard from './SalesCategoryCard';
import ScheduleCard from './ScheduleCard';
import RecentOrdersCard from './RecentOrdersCard';

interface DashboardTabLayoutProps {
    // Top Row Stats
    stats: {
        title: string;
        count: string;
        trend: number;
        trendLabel?: string;
    }[];

    // Middle Row
    chartProps: {
        primaryValue: string;
        secondaryValue: string;
    };
    revenueProps: {
        target: number;
        current: number;
    };

    // Bottom Row
    categoryData?: any; // For Donut Chart

    // Footer
    showRecentOrders?: boolean;
    customFooter?: ReactNode; // If we want to show something else instead of RecentOrders
}

const DashboardTabLayout: React.FC<DashboardTabLayoutProps> = ({
    stats,
    chartProps,
    revenueProps,
    categoryData,
    showRecentOrders = true,
    customFooter
}) => {
    return (
        <div className="space-y-6">
            {/* Top Row: 3 Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <NewStatsCard
                        key={index}
                        title={stat.title}
                        count={stat.count}
                        trend={stat.trend}
                        trendLabel={stat.trendLabel}
                    />
                ))}
            </div>

            {/* Middle Row: Statistics Chart (2/3) + Revenue Gauge (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[420px]">
                    <StatisticsChart
                        primaryValue={chartProps.primaryValue}
                        secondaryValue={chartProps.secondaryValue}
                    />
                </div>
                <div className="lg:col-span-1 h-[420px]">
                    <RevenueGaugeCard
                        target={revenueProps.target}
                        current={revenueProps.current}
                    />
                </div>
            </div>

            {/* Bottom Row: Sales Category (1/2) + Schedule (1/2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[380px]">
                <div className="h-full">
                    <SalesCategoryCard data={categoryData} />
                </div>
                <div className="h-full">
                    <ScheduleCard />
                </div>
            </div>

            {/* Footer Row: Recent Orders / Users Table */}
            <div className="w-full">
                {showRecentOrders ? <RecentOrdersCard /> : customFooter}
            </div>
        </div>
    );
};

export default DashboardTabLayout;
