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

    // Middle Row - Flexible
    customMiddleRow?: ReactNode;
    chartProps?: {
        primaryValue: string;
        secondaryValue: string;
    };
    revenueProps?: {
        target: number;
        current: number;
    };

    // Bottom Row
    categoryData?: any; // For Donut Chart
    showSchedule?: boolean; // Toggle Schedule Card

    // Footer
    showRecentOrders?: boolean;
    customFooter?: ReactNode; // If we want to show something else instead of RecentOrders
}

const DashboardTabLayout: React.FC<DashboardTabLayoutProps> = ({
    stats,
    chartProps,
    revenueProps,
    categoryData,
    showSchedule = true,
    showRecentOrders = true,
    customMiddleRow,
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

            {/* Middle Row: Statistics Chart (2/3) + Revenue Gauge (1/3) OR Custom Content */}
            {customMiddleRow ? (
                <div className="grid grid-cols-1 gap-6">
                    {customMiddleRow}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[420px]">
                        {chartProps && (
                            <StatisticsChart
                                primaryValue={chartProps.primaryValue}
                                secondaryValue={chartProps.secondaryValue}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-1 h-[420px]">
                        {revenueProps && (
                            <RevenueGaugeCard
                                target={revenueProps.target}
                                current={revenueProps.current}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Row: Sales Category (1/2) + Schedule (1/2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[380px]">
                <div className="h-full">
                    <SalesCategoryCard data={categoryData} />
                </div>
                <div className="h-full">
                    {showSchedule ? <ScheduleCard /> : <div className="h-full bg-slate-50 rounded-[20px] border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-medium">No Schedule Data</div>}
                </div>
            </div>

            {/* Footer Row: Recent Orders / Users Table */}
            <div className="w-full">
                {customFooter ? customFooter : showRecentOrders ? <RecentOrdersCard /> : null}
            </div>
        </div>
    );
};

export default DashboardTabLayout;
