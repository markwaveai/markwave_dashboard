import React from 'react';
// Force rebuild
import StatsCard from './StatsCard';
import MonthlySalesChart from './MonthlySalesChart';
import MonthlyTargetCard from './MonthlyTargetCard';
import RecentOrdersCard from './RecentOrdersCard';
import TopProductsCard from './TopProductsCard';
import RecentCustomersCard from './RecentCustomersCard';
import CategoryCard from './CategoryCard';
import CoinsStatsCard from './CoinsStatsCard';
import UnitsStatsCard from './UnitsStatsCard';
import OrdersStatsCard from './OrdersStatsCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStatusCounts } from '../../store/slices/ordersSlice';
import { setSession as setReduxSession } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import { Award, ShoppingBag } from 'lucide-react';

const DashboardHome: React.FC = () => {
    // We can pull real data here if available, using placeholder for now to match design
    const dispatch = useAppDispatch();
    const { totalAllOrders, pendingAdminApprovalCount, paidCount, rejectedCount } = useAppSelector((state: RootState) => state.orders);
    const { adminMobile } = useAppSelector((state: RootState) => state.auth);

    React.useEffect(() => {
        if (adminMobile) {
            dispatch(fetchStatusCounts({ adminMobile }));
        }
    }, [dispatch, adminMobile]);

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
                <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    <CoinsStatsCard
                        count="1.55M"
                        target="1.75B"
                    />
                    <UnitsStatsCard
                        count={totalAllOrders ? totalAllOrders.toLocaleString() : "323"}
                        target="100,000"
                    />
                    <OrdersStatsCard
                        total={1250}
                        pending={450}
                        approved={720}
                        rejected={80}
                    />
                    <CategoryCard totalUsers={customerCount} />
                </div>

                {/* Left Column - Chart, Recent Orders (Span 8) */}
                <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }} className="col-span-12 lg:col-span-8">
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
