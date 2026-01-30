import React from 'react';
import MonthlySalesChart from './MonthlySalesChart';
import MonthlyTargetCard from './MonthlyTargetCard';
import RecentOrdersCard from './RecentOrdersCard';
import RecentCustomersCard from './RecentCustomersCard';
import CategoryCard from './CategoryCard';
import CoinsStatsCard from './CoinsStatsCard';
import UnitsStatsCard from './UnitsStatsCard';
import OrdersStatsCard from './OrdersStatsCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStatusCounts } from '../../store/slices/ordersSlice';
import type { RootState } from '../../store';

const DashboardHome: React.FC = () => {
    const dispatch = useAppDispatch();
    const { totalAllOrders } = useAppSelector((state: RootState) => state.orders);
    const { adminMobile } = useAppSelector((state: RootState) => state.auth);

    React.useEffect(() => {
        if (adminMobile) {
            dispatch(fetchStatusCounts({ adminMobile }));
        }
    }, [dispatch, adminMobile]);

    const customerCount = "3,782";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="grid grid-cols-12 gap-5 md:gap-6 items-start">

                {/* Row 1: Stats Summary - Multi-column responsive grid */}
                <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <CoinsStatsCard count="1.55M" target="1.75B" />
                    <UnitsStatsCard count={totalAllOrders ? totalAllOrders.toLocaleString() : "323"} target="100,000" />
                    <OrdersStatsCard total={1250} pending={450} approved={720} rejected={80} />
                    <CategoryCard totalUsers={customerCount} />
                </div>

                {/* Row 2: Charts & Targets */}
                <div className="col-span-12 lg:col-span-8 min-h-[400px]">
                    <MonthlySalesChart />
                </div>
                <div className="col-span-12 lg:col-span-4 h-full">
                    <MonthlyTargetCard />
                </div>

                {/* Row 3: Lists */}
                <div className="col-span-12 lg:col-span-8 h-full">
                    <RecentOrdersCard />
                </div>
                <div className="col-span-12 lg:col-span-4 h-full">
                    <RecentCustomersCard />
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
