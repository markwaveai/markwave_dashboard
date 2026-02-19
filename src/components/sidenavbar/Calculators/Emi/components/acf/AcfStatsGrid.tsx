import React from 'react';
import { useEmi } from '../../context/EmiContext';
import { Wallet, Calendar, PiggyBank } from 'lucide-react';
import HoverGradientStatCard from '../stats/HoverGradientStatCard';
import AssetProjectionCard from './AssetProjectionCard';
import RevenueProjectionCard from './RevenueProjectionCard';

const AcfStatsGrid = () => {
    const {
        acfTotalInvestment,
        acfTenureMonths,
        acfUnits,
        acfTotalBenefit,
        acfCpfBenefit,
        calculateProjectedAssetValue: calculateProjection,
        acfProjectionYear,
        setAcfProjectionYear,
        acfRevenueProjectionYear,
        setAcfRevenueProjectionYear,
        formatCurrency
    } = useEmi();

    // Projection Logic for Card
    const { totalAssetValue: projectedAssetValue, totalBuffaloes: projectedBuffaloCount } =
        calculateProjection ? calculateProjection(acfProjectionYear, acfUnits) : { totalAssetValue: 0, totalBuffaloes: 0 };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <HoverGradientStatCard
                label="Total Investment"
                value={acfTotalInvestment}
                prefix="₹"
                icon={Wallet}
                color="blue"
                secondaryText={`${acfTenureMonths} months`}
                formatCurrency={formatCurrency}
            />

            <AssetProjectionCard
                value={projectedAssetValue}
                year={acfProjectionYear}
                onYearChange={setAcfProjectionYear}
                buffaloCount={projectedBuffaloCount}
                formatCurrency={formatCurrency}
            />

            <RevenueProjectionCard
                yearIndex={acfRevenueProjectionYear}
                onYearChange={setAcfRevenueProjectionYear}
                units={acfUnits}
                formatCurrency={formatCurrency}
            />

            <HoverGradientStatCard
                label="Total Savings"
                value={acfTotalBenefit}
                prefix="₹"
                icon={PiggyBank}
                color="green"
                secondaryText={`Interest + Free CPF`}
                formatCurrency={formatCurrency}
            />

            <HoverGradientStatCard
                label="Period"
                value={acfTenureMonths}
                prefix=""
                icon={Calendar}
                color="blue"
                secondaryText="Months Tenure"
                formatCurrency={formatCurrency}
            />
        </div>
    );
};

export default AcfStatsGrid;
