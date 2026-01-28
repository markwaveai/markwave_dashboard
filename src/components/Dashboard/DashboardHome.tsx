import React from 'react';
import StatsCard from './StatsCard';
import MonthlySalesChart from './MonthlySalesChart';
import MonthlyTargetCard from './MonthlyTargetCard';
import RecentOrdersCard from './RecentOrdersCard';
import TopProductsCard from './TopProductsCard';
import RecentCustomersCard from './RecentCustomersCard';
import CategoryCard from './CategoryCard';
import { Users, Package, IndianRupee, Clock } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';

const DashboardHome: React.FC = () => {
    // We can pull real data here if available, using placeholder for now to match design
    const { totalCount, totalAllOrders } = useAppSelector((state: RootState) => state.orders);

    // Using mock data to match the visual provided by user for "Customers" if real count is not suitable or available in this context yet
    const customerCount = "3,782";
    const orderCount = totalAllOrders ? totalAllOrders.toLocaleString() : "5,359";

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '24px',
                alignItems: 'start'
            }}>
                {/* Left Column - Stats, Chart, Recent Orders (Span 8) */}
                <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }} className="col-span-12 lg:col-span-8">
                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                        <StatsCard
                            title="Total Revenue"
                            count="₹4.2Cr"
                            trend="12.5%"
                            isIncrease={true}
                            icon={IndianRupee}
                        />
                        <StatsCard
                            title="Orders"
                            count={orderCount}
                            trend="9.05%"
                            isIncrease={false}
                            icon={Package}
                        />
                        <StatsCard
                            title="Pending"
                            count="145"
                            trend="5.2%"
                            isIncrease={true}
                            icon={Clock}
                        />
                        <StatsCard
                            title="Customers"
                            count={customerCount}
                            trend="11.01%"
                            isIncrease={true}
                            icon={Users}
                        />
                        <CategoryCard />
                    </div>

                    {/* Sales Chart Row */}
                    <div style={{ minHeight: '400px' }}>
                        <MonthlySalesChart />
                    </div>

                    {/* Recent Orders Row */}
                    <div>
                        <RecentOrdersCard />
                    </div>
                </div>

                {/* Right Column - Target, Products, Customers (Span 4) */}
                <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }} className="col-span-12 lg:col-span-4">
                    <MonthlyTargetCard />
                    {/* <TopProductsCard /> */}
                    <RecentCustomersCard />
                </div>
            </div>

            {/* Inline Media Query for Grid Layout (since we might not have Tailwind configured for custom classes in this file directly or want to ensure internal style works) */}
            <style>{`
                @media (min-width: 1024px) {
                    .col-span-12 { grid-column: span 12; }
                    .lg\\:col-span-8 { grid-column: span 8 !important; }
                    .lg\\:col-span-4 { grid-column: span 4 !important; }
                }
                @media (max-width: 1023px) {
                    .lg\\:col-span-8 { grid-column: span 12 !important; }
                    .lg\\:col-span-4 { grid-column: span 12 !important; }
                }
            `}</style>
        </div>
    );
};

export default DashboardHome;
