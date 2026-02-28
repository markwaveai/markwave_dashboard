
import React, { useState, useMemo } from 'react';
import { getBuffaloValueByAge, SimpleTooltip, formatMonthDateRange } from '../BuffaloFamilyTree/CommonComponents';
import { ChevronRight } from 'lucide-react';




const MonthlyRevenueBreak = ({
    treeData,
    buffaloDetails,
    monthlyRevenue,
    calculateAgeInMonths,
    calculateCumulativeRevenueUntilYear,
    calculateTotalCumulativeRevenueUntilYear,
    monthNames,
    formatCurrency,
    selectedYearIndex,
    isCGFEnabled
}: any) => {
    const [selectedUnit, setSelectedUnit] = useState(1);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const scrollContainerRef = React.useRef<any>(null);
    const units = treeData.units || 1;
    const selectedYear = treeData.startYear + selectedYearIndex; // Derived immediately for usage throughout

    // Helper to resolve Calendar Year/Month from Simulation Year/Month
    const getCalendarDate = (yearIndex: number, monthIndexInSim: number) => {
        const absStart = (treeData.startYear * 12 + (treeData.startMonth || 0));
        const absTarget = absStart + (yearIndex * 12) + monthIndexInSim;
        return {
            year: Math.floor(absTarget / 12),
            month: absTarget % 12,
            absMonth: absTarget
        };
    };

    const currentSimYearStart = treeData.startYear + selectedYearIndex; // Approx for age checks


    // Get all buffaloes for the unit (for Asset Value)
    const allUnitBuffaloes = Object.values(buffaloDetails).filter((buffalo: any) => buffalo.unit === selectedUnit);

    // Get buffaloes for selected unit and filter those that produce revenue OR reach CPF milestone this year
    const unitBuffaloes = allUnitBuffaloes
        .filter((buffalo: any) => {
            const hasRevenueThisYear = Array.from({ length: 12 }).some((_, m) => {
                const { year, month } = getCalendarDate(selectedYearIndex, m);
                return (monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id] || 0) > 0;
            });

            // Also show children who reach CPF eligibility (month 24) this year
            const reachesCPFMilestoneThisYear = buffalo.generation > 0 && Array.from({ length: 12 }).some((_, m) => {
                const { year, month } = getCalendarDate(selectedYearIndex, m);
                const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                const ageInMonths = ((year - buffalo.birthYear) * 12) + (month - birthMonth);
                return ageInMonths === 24;
            });

            return hasRevenueThisYear || reachesCPFMilestoneThisYear;
        });

    // Helper to check precise CPF applicability (Standard Eligibility)
    const isCpfApplicableForMonth = (buffalo: any, yearIndex: number, monthIndexInSim: number) => {
        const { absMonth } = getCalendarDate(yearIndex, monthIndexInSim);
        const absoluteStartMonth = treeData.startYear * 12 + (treeData.startMonth || 0);
        const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths) - 1;

        if (absMonth < absoluteStartMonth || absMonth > absoluteEndMonth) return false;

        const isFirstInUnit = (buffalo.id.charCodeAt(0) - 65) % 2 === 0;

        if (buffalo.generation === 0) {
            const monthsSinceStart = absMonth - absoluteStartMonth;
            if (isFirstInUnit) {
                // Type A: 12 months lag
                return monthsSinceStart >= 12;
            } else {
                // Type B: Free from month 6 to 18
                const isPresent = buffalo.absoluteAcquisitionMonth !== undefined
                    ? absMonth >= buffalo.absoluteAcquisitionMonth
                    : (treeData.startYear + yearIndex > treeData.startYear || (treeData.startYear + yearIndex === treeData.startYear && monthIndexInSim >= buffalo.acquisitionMonth));

                if (isPresent) {
                    const isFreePeriod = monthsSinceStart >= 6 && monthsSinceStart < 18;
                    return !isFreePeriod;
                }
            }
        } else {
            // Children: 24 months age
            const ageInMonths = calculateAgeInMonths(buffalo, Math.floor(absMonth / 12), absMonth % 12);
            return ageInMonths >= 24;
        }
        return false;
    };

    const cpfCost = useMemo(() => {
        let monthlyCosts = new Array(12).fill(0);
        const buffaloCPFDetails: any[] = [];
        const CPF_PER_MONTH = 15000 / 12;
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);
        const scanMaxAbs = (treeData.startYear + (treeData.durationMonths / 12) + 2) * 12;

        let milkProducingBuffaloesWithCPF = 0;

        allUnitBuffaloes.forEach((buffalo: any) => {
            // 1. Pre-calculate full eligibility for this buffalo
            const eligibility: Record<number, boolean> = {};
            let hasAnyEligibilityIndex = -1;
            for (let absM = treeData.startYear * 12 - 12; absM < scanMaxAbs; absM++) {
                const isEligible = isCpfApplicableForMonth(buffalo, Math.floor(absM / 12) - treeData.startYear, absM % 12);
                eligibility[absM] = isEligible;
                if (isEligible && hasAnyEligibilityIndex === -1 && absM >= treeData.startYear * 12) {
                    hasAnyEligibilityIndex = absM;
                }
            }

            if (hasAnyEligibilityIndex !== -1) milkProducingBuffaloesWithCPF++;

            // 2. Assign Costs
            for (let m = 0; m < 12; m++) {
                const absM = (treeData.startYear + selectedYearIndex) * 12 + m;
                if (eligibility[absM]) monthlyCosts[m] += CPF_PER_MONTH;
            }

            // UI Breakdown
            const currentYearAbsStart = (treeData.startYear + selectedYearIndex) * 12;
            let monthsThisYear = 0;
            for (let m = 0; m < 12; m++) {
                if (eligibility[currentYearAbsStart + m]) monthsThisYear++;
            }

            buffaloCPFDetails.push({
                id: buffalo.id,
                hasCPF: monthsThisYear > 0,
                reason: monthsThisYear === 12 ? "Full Year" : (monthsThisYear > 0 ? `Partial (${monthsThisYear} months)` : "No CPF"),
                monthsWithCPF: monthsThisYear
            });
        });

        return {
            monthlyCosts,
            annualCPFCost: Math.round(monthlyCosts.reduce((a, b) => a + b, 0)),
            buffaloCPFDetails,
            milkProducingBuffaloesWithCPF
        };
    }, [selectedUnit, buffaloDetails, treeData.startYear, treeData.years, treeData.startMonth, selectedYearIndex]);

    const { totalCumulativeUntilYear, cumulativeCPFCost, cumulativeCaringCost } = useMemo(() => {
        // 1. Cumulative Revenue
        let total = 0;
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);

        for (let yIndex = 0; yIndex <= selectedYearIndex; yIndex++) {
            for (let m = 0; m < 12; m++) {
                const { year, month } = getCalendarDate(yIndex, m);
                if (monthlyRevenue[year]?.[month]) {
                    const monthData = monthlyRevenue[year][month];
                    allUnitBuffaloes.forEach((b: any) => {
                        total += monthData.buffaloes[b.id] || 0;
                    });
                }
            }
        }

        // 2. Cumulative CPF
        let totalCPF = 0;
        const CPF_PER_MONTH = 15000 / 12;
        const scanMaxAbs = (treeData.startYear + treeData.years + 2) * 12;

        allUnitBuffaloes.forEach((buffalo: any) => {
            const eligibility: Record<number, boolean> = {};
            for (let absM = treeData.startYear * 12 - 12; absM < scanMaxAbs; absM++) {
                eligibility[absM] = isCpfApplicableForMonth(buffalo, Math.floor(absM / 12) - treeData.startYear, absM % 12);
            }

            for (let yIdx = 0; yIdx <= selectedYearIndex; yIdx++) {
                for (let m = 0; m < 12; m++) {
                    if (eligibility[treeData.startYear * 12 + yIdx * 12 + m]) totalCPF += CPF_PER_MONTH;
                }
            }
        });

        // 3. Cumulative Caring
        let totalCaring = 0;
        for (let yIdx = 0; yIdx <= selectedYearIndex; yIdx++) {
            for (let m = 0; m < 12; m++) {
                const { absMonth } = getCalendarDate(yIdx, m);
                allUnitBuffaloes.forEach((buffalo: any) => {
                    if (buffalo.generation > 0) {
                        const birthYear = buffalo.birthYear;
                        const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                        const birthAbsolute = birthYear * 12 + birthMonth;
                        if (birthAbsolute <= absMonth) {
                            const ageInMonths = (absMonth - birthAbsolute) + 1;
                            let monthlyCost = 0;
                            if (ageInMonths > 12 && ageInMonths <= 18) monthlyCost = 1000;
                            else if (ageInMonths > 18 && ageInMonths <= 24) monthlyCost = 1400;
                            else if (ageInMonths > 24 && ageInMonths <= 30) monthlyCost = 1800;
                            else if (ageInMonths > 30 && ageInMonths <= 36) monthlyCost = 2500;
                            totalCaring += monthlyCost;
                        }
                    }
                });
            }
        }

        return {
            totalCumulativeUntilYear: total,
            cumulativeCPFCost: Math.round(totalCPF),
            cumulativeCaringCost: totalCaring
        };
    }, [selectedUnit, buffaloDetails, selectedYearIndex, treeData.startYear, treeData.startMonth, treeData.years, monthlyRevenue]);
    const cumulativeNetRevenue = totalCumulativeUntilYear - (cumulativeCPFCost * units);
    const cumulativeNetRevenueWithCaring = cumulativeNetRevenue - (cumulativeCaringCost * units);

    const calculateMonthlyCGF = (yIndex: number, mIndex: number) => {
        let monthlyCGF = 0;
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);
        const { absMonth } = getCalendarDate(yIndex, mIndex);

        allUnitBuffaloes.forEach((buffalo: any) => {
            if (buffalo.generation > 0) {
                const birthYear = buffalo.birthYear;
                const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                const birthAbsolute = birthYear * 12 + birthMonth;

                if (birthAbsolute <= absMonth) {
                    const ageInMonths = (absMonth - birthAbsolute) + 1;
                    let monthlyCost = 0;
                    if (ageInMonths > 12 && ageInMonths <= 18) monthlyCost = 1000;
                    else if (ageInMonths > 18 && ageInMonths <= 24) monthlyCost = 1400;
                    else if (ageInMonths > 24 && ageInMonths <= 30) monthlyCost = 1800;
                    else if (ageInMonths > 30 && ageInMonths <= 36) monthlyCost = 2500;
                    monthlyCGF += monthlyCost;
                }
            }
        });
        return isCGFEnabled ? monthlyCGF : 0;
    };

    const fullDurationStats = useMemo(() => {
        const fullYearIndex = treeData.years - 1;

        // Cumulative Revenue Full
        let totalFullRev = 0;
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);
        for (let yIndex = 0; yIndex <= fullYearIndex; yIndex++) {
            for (let m = 0; m < 12; m++) {
                const { year, month } = getCalendarDate(yIndex, m);
                if (monthlyRevenue[year]?.[month]) {
                    const monthData = monthlyRevenue[year][month];
                    allUnitBuffaloes.forEach((b: any) => {
                        totalFullRev += monthData.buffaloes[b.id] || 0;
                    });
                }
            }
        }

        // Cumulative CPF Full
        let totalFullCPF = 0;
        const CPF_PER_MONTH = 15000 / 12;
        const scanMaxAbs = (treeData.startYear + treeData.years + 2) * 12;
        allUnitBuffaloes.forEach((buffalo: any) => {
            const eligibility: Record<number, boolean> = {};
            for (let absM = treeData.startYear * 12 - 12; absM < scanMaxAbs; absM++) {
                eligibility[absM] = isCpfApplicableForMonth(buffalo, Math.floor(absM / 12) - treeData.startYear, absM % 12);
            }

            for (let yIdx = 0; yIdx <= fullYearIndex; yIdx++) {
                for (let m = 0; m < 12; m++) {
                    if (eligibility[treeData.startYear * 12 + yIdx * 12 + m]) totalFullCPF += CPF_PER_MONTH;
                }
            }
        });

        // Cumulative Caring Full
        let totalFullCaring = 0;
        for (let yIdx = 0; yIdx <= fullYearIndex; yIdx++) {
            for (let m = 0; m < 12; m++) {
                const { absMonth } = getCalendarDate(yIdx, m);
                allUnitBuffaloes.forEach((buffalo: any) => {
                    if (buffalo.generation > 0) {
                        const birthYear = buffalo.birthYear;
                        const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                        const birthAbsolute = birthYear * 12 + birthMonth;
                        if (birthAbsolute <= absMonth) {
                            const ageInMonths = (absMonth - birthAbsolute) + 1;
                            let monthlyCost = 0;
                            if (ageInMonths > 12 && ageInMonths <= 18) monthlyCost = 1000;
                            else if (ageInMonths > 18 && ageInMonths <= 24) monthlyCost = 1400;
                            else if (ageInMonths > 24 && ageInMonths <= 30) monthlyCost = 1800;
                            else if (ageInMonths > 30 && ageInMonths <= 36) monthlyCost = 2500;
                            totalFullCaring += monthlyCost;
                        }
                    }
                });
            }
        }

        // Asset Value Full (at end of simulation)
        const fullDurationAssetValue = allUnitBuffaloes.reduce((sum: number, buffalo: any) => {
            const { year, month } = getCalendarDate(fullYearIndex, 11);
            let isPresent = false;
            if (buffalo.generation === 0) {
                if (buffalo.absoluteAcquisitionMonth !== undefined) {
                    isPresent = (year * 12 + month) >= buffalo.absoluteAcquisitionMonth;
                } else {
                    isPresent = year > treeData.startYear || (year === treeData.startYear && month >= buffalo.acquisitionMonth);
                }
            } else {
                const birthYear = buffalo.birthYear;
                const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                const absoluteBirth = birthYear * 12 + birthMonth;
                const currentAbsolute = year * 12 + month;
                isPresent = currentAbsolute >= absoluteBirth;
            }
            if (!isPresent) return sum;
            const age = calculateAgeInMonths(buffalo, year, month);
            return sum + (getBuffaloValueByAge(age) * units);
        }, 0);

        // Buffalo Count Full (at end of simulation)
        const absoluteEndMonth = treeData.startYear * 12 + (treeData.startMonth || 0) + (treeData.durationMonths) - 1;
        const fullDurationBuffaloes = Object.values(buffaloDetails).filter((b: any) => {
            if (b.unit !== selectedUnit) return false;
            const birthAbsolute = b.birthYear * 12 + (b.birthMonth !== undefined ? b.birthMonth : (b.acquisitionMonth || 0));
            return birthAbsolute <= absoluteEndMonth;
        }).length * units;

        const netRev = Math.round(totalFullRev - (totalFullCPF * units));

        return {
            netRev,
            netRevWithCaring: Math.round(netRev - (totalFullCaring * units)),
            assetValue: fullDurationAssetValue,
            buffaloes: fullDurationBuffaloes
        };
    }, [selectedUnit, buffaloDetails, treeData.startYear, treeData.years, treeData.startMonth, monthlyRevenue]);


    const startMonthNameShort = monthNames[treeData.startMonth || 0].substring(0, 3);
    const startDateString = `${treeData.startDay || 1} ${startMonthNameShort} ${treeData.startYear}`;
    const endDateString = `31 Dec ${selectedYear}`;
    const dateRangeString = `${startDateString} - ${endDateString}`;

    const checkScroll = () => {

        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowScrollIndicator(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    React.useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [unitBuffaloes]);



    const validMonthsThisYear = useMemo(() => {
        const absoluteStartMonth = (treeData.startYear * 12 + (treeData.startMonth || 0));
        const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths || (treeData.years * 12)) - 1;
        const currentYearAbsStart = (treeData.startYear + selectedYearIndex) * 12;

        let count = 0;
        for (let m = 0; m < 12; m++) {
            const absM = currentYearAbsStart + m;
            if (absM >= absoluteStartMonth && absM <= absoluteEndMonth) count++;
        }
        return count;
    }, [selectedYearIndex, treeData.startYear, treeData.startMonth, treeData.durationMonths, treeData.years]);

    // Update annual calculations to use validMonthsThisYear
    const annualRevenue = useMemo(() => {
        return unitBuffaloes.reduce((sum: number, buffalo: any) => {
            let yearSum = 0;
            for (let m = 0; m < 12; m++) {
                const { year, month, absMonth } = getCalendarDate(selectedYearIndex, m);
                const absoluteStartMonth = (treeData.startYear * 12 + (treeData.startMonth || 0));
                const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths || (treeData.years * 12)) - 1;

                if (absMonth >= absoluteStartMonth && absMonth <= absoluteEndMonth) {
                    yearSum += (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
                }
            }
            return sum + yearSum;
        }, 0);
    }, [unitBuffaloes, selectedYearIndex, monthlyRevenue, treeData]);

    const annualCgfCost = useMemo(() => {
        let total = 0;
        for (let m = 0; m < 12; m++) {
            const { absMonth } = getCalendarDate(selectedYearIndex, m);
            const absoluteStartMonth = (treeData.startYear * 12 + (treeData.startMonth || 0));
            const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths || (treeData.years * 12)) - 1;

            if (absMonth >= absoluteStartMonth && absMonth <= absoluteEndMonth) {
                total += calculateMonthlyCGF(selectedYearIndex, m);
            }
        }
        return total * units;
    }, [selectedYearIndex, treeData, units, isCGFEnabled, buffaloDetails]);

    const annualCpfCost = useMemo(() => {
        let total = 0;
        for (let m = 0; m < 12; m++) {
            const { absMonth } = getCalendarDate(selectedYearIndex, m);
            const absoluteStartMonth = (treeData.startYear * 12 + (treeData.startMonth || 0));
            const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths || (treeData.years * 12)) - 1;

            if (absMonth >= absoluteStartMonth && absMonth <= absoluteEndMonth) {
                total += cpfCost.monthlyCosts[m];
            }
        }
        return total * units;
    }, [selectedYearIndex, treeData, units, cpfCost]);

    return (
        <div className="w-full mb-6 space-y-2">
            {unitBuffaloes.length > 0 ? (
                <>
                    {/* 1. Top Summary Cards - Row 1: Annual Revenue / CPF / CGF always side-by-side */}
                    <div className={`grid gap-2 ${isCGFEnabled ? 'grid-cols-3' : 'grid-cols-2'}`}>

                        {/* Annual Revenue */}
                        <div className="bg-white rounded-md p-2 sm:p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Annual Revenue</p>
                                <h3 className="text-sm sm:text-lg font-bold text-slate-900 mt-1">
                                    {formatCurrency(annualRevenue)}
                                </h3>
                            </div>
                        </div>

                        {/* Annual CPF Cost */}
                        <div className="bg-white rounded-md p-2 sm:p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Annual CPF Cost</p>
                                <h3 className="text-sm sm:text-lg font-bold text-slate-900 mt-1">
                                    {formatCurrency(annualCpfCost)}
                                </h3>
                            </div>
                        </div>

                        {/* Annual CGF Cost */}
                        {isCGFEnabled && (
                            <div className="bg-white rounded-md p-2 sm:p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Annual CGF Cost</p>
                                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 mt-1">
                                        {formatCurrency(annualCgfCost)}
                                    </h3>
                                </div>
                            </div>
                        )}

                    </div>


                    {/* Row 2: Net Revenue / Cumulative Net / Asset Value */}
                    <div className="grid grid-cols-3 gap-2">

                        {/* Net Annual Revenue */}
                        <div className="bg-white rounded-md p-2 sm:p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                            <div className="relative z-10 h-full flex flex-col justify-between items-center">
                                <div className="flex flex-col items-center">
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Net Annual</p>
                                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 mt-1">
                                        {formatCurrency(((unitBuffaloes as any[]).reduce((sum: number, buffalo: any) => {
                                            return sum + (Array.from({ length: 12 }) as any[]).reduce((monthSum: number, _, mIndex: number) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, mIndex);
                                                return monthSum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
                                            }, 0);
                                        }, 0) - (cpfCost.annualCPFCost * units) - (Array.from({ length: 12 }) as any[]).reduce((sum, _, mIndex) => sum + calculateMonthlyCGF(selectedYearIndex, mIndex), 0) * units))}
                                    </h3>
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-emerald-500" />
                        </div>

                        {/* Cumulative Net */}
                        <div className="bg-white rounded-md p-2 sm:p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Cumulative Net</p>
                                <h3 className="text-sm sm:text-lg font-bold text-indigo-600 mt-1">
                                    {formatCurrency(isCGFEnabled ? cumulativeNetRevenueWithCaring : cumulativeNetRevenue)}
                                </h3>
                            </div>
                        </div>

                        {/* Asset Value */}
                        <div className="bg-white rounded-md p-2 sm:p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Asset Value</p>
                                <h3 className="text-sm sm:text-lg font-bold text-slate-900 mt-1">
                                    {formatCurrency(
                                        selectedYearIndex === 0
                                            ? 350000 * units
                                            : allUnitBuffaloes.reduce((sum: number, buffalo: any) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, 11);
                                                let isPresent = false;
                                                if (buffalo.generation === 0) {
                                                    if (buffalo.absoluteAcquisitionMonth !== undefined) {
                                                        isPresent = (year * 12 + month) >= buffalo.absoluteAcquisitionMonth;
                                                    } else {
                                                        isPresent = year > treeData.startYear || (year === treeData.startYear && month >= buffalo.acquisitionMonth);
                                                    }
                                                } else {
                                                    const birthYear = buffalo.birthYear;
                                                    const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                                                    const absoluteBirth = birthYear * 12 + birthMonth;
                                                    const currentAbsolute = year * 12 + month;
                                                    isPresent = currentAbsolute >= absoluteBirth;
                                                }
                                                if (!isPresent) return sum;
                                                const age = calculateAgeInMonths(buffalo, year, month);
                                                return sum + (getBuffaloValueByAge(age) * units);
                                            }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>


                    </div>




                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                        {showScrollIndicator && (
                            <div className="absolute left-[115px] top-[24px] z-50 pointer-events-none">
                                <div className="bg-slate-900 text-white rounded-full p-1 shadow-xl animate-pulse flex items-center justify-center opacity-90 border border-slate-700">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="overflow-x-auto pb-4"
                        >
                            <table className="w-full text-[10px] sm:text-base text-left">
                                <thead className="text-[10px] sm:text-sm text-slate-500 bg-slate-50 sticky top-0 z-[40] shadow-sm">
                                    <tr>
                                        <th className="sticky left-0 z-20 w-20 sm:w-24 min-w-[5rem] sm:min-w-[6rem] px-2 sm:px-4 py-3 sm:py-5 font-bold border-r border-slate-100 bg-slate-50 text-center">Month</th>

                                        {unitBuffaloes.map((buffalo: any) => (
                                            <th key={buffalo.id} className="px-2 sm:px-4 py-3 sm:py-5 font-semibold text-center border-r border-slate-100 min-w-[60px] sm:min-w-[80px]">
                                                <div className="text-slate-800 text-[10px] sm:text-sm">
                                                    Buffalo {buffalo.id} revenue
                                                </div>
                                            </th>
                                        ))}

                                        <th className={`md:sticky ${isCGFEnabled ? 'md:right-[15rem]' : 'md:right-[10rem]'} md:z-20 w-20 sm:w-28 min-w-[5rem] sm:min-w-[7rem] px-1 sm:px-2 py-3 sm:py-5 font-bold text-center bg-slate-100 text-slate-700 md:shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.1)]`}>Total Revenue</th>
                                        <th className={`md:sticky ${isCGFEnabled ? 'md:right-[10rem]' : 'md:right-[5rem]'} md:z-50 w-12 sm:w-20 min-w-[3rem] sm:min-w-[5rem] px-1 sm:px-2 py-3 sm:py-5 font-bold text-center bg-amber-50 text-amber-700`}>
                                            <SimpleTooltip content="Cattle Protection Fund" placement="bottom">
                                                <span className="cursor-default">CPF</span>
                                            </SimpleTooltip>
                                        </th>
                                        {isCGFEnabled && <th className="md:sticky md:right-[5rem] md:z-50 w-12 sm:w-20 min-w-[3rem] sm:min-w-[5rem] px-1 sm:px-2 py-3 sm:py-5 font-bold text-center bg-rose-50 text-rose-700 ">
                                            <SimpleTooltip content="Cattle Growing Fund" placement="bottom">
                                                <span className="cursor-default">CGF</span>
                                            </SimpleTooltip>
                                        </th>}
                                        <th className="md:sticky md:right-0 md:z-20 w-12 sm:w-20 min-w-[3rem] sm:min-w-[5rem] px-1 sm:px-2 py-3 sm:py-5 font-bold text-center bg-emerald-50 text-emerald-700 border-l border-slate-200">Net</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {Array.from({ length: 12 }).map((_, mIndex: number) => {
                                        const { year, month, absMonth } = getCalendarDate(selectedYearIndex, mIndex);
                                        const absoluteStartMonth = (treeData.startYear * 12 + (treeData.startMonth || 0));
                                        const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths || (treeData.years * 12)) - 1;

                                        if (absMonth > absoluteEndMonth) return null;

                                        const formattedDateRange = formatMonthDateRange(year, month, treeData.startDay || 1, true);
                                        const unitTotal: number = (unitBuffaloes as any[]).reduce((sum: number, b: any) => sum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[b.id]) || 0), 0);
                                        const monthlyCpfValue: number = cpfCost.monthlyCosts[mIndex] * units;
                                        const monthlyCgfValue: number = calculateMonthlyCGF(selectedYearIndex, mIndex) * units;
                                        const netRevenue: number = unitTotal - monthlyCpfValue - monthlyCgfValue;
                                        const rowBg = mIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'; // Ensure opaque bg for sticky

                                        return (
                                            <React.Fragment key={mIndex}>
                                                <tr className={`group hover:bg-slate-50 transition-colors ${mIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                    <td className={`sticky left-0 z-10 px-2 sm:px-4 py-3 sm:py-4 font-medium text-slate-900 border-r border-slate-100 ${rowBg} text-center`}>
                                                        {formattedDateRange}
                                                    </td>

                                                    {unitBuffaloes.map((buffalo: any, bIndex: any) => {
                                                        const revenue = monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id] || 0;
                                                        const isCpfApplicable = isCpfApplicableForMonth(buffalo, selectedYearIndex, mIndex);

                                                        // Subtle styling
                                                        let cellClass = "text-slate-400";
                                                        let displayText: React.ReactNode = "-";

                                                        // Calculate start absolute month for the buffalo
                                                        let buffaloStartAbsoluteMonth;
                                                        if (buffalo.generation === 0) {
                                                            if (buffalo.absoluteAcquisitionMonth !== undefined) {
                                                                buffaloStartAbsoluteMonth = buffalo.absoluteAcquisitionMonth;
                                                            } else {
                                                                buffaloStartAbsoluteMonth = treeData.startYear * 12 + (buffalo.acquisitionMonth || treeData.startMonth || 0);
                                                            }
                                                        } else {
                                                            buffaloStartAbsoluteMonth = buffalo.birthYear * 12 + (buffalo.birthMonth !== undefined ? buffalo.birthMonth : 0);
                                                        }

                                                        const currentAbsoluteMonth = year * 12 + month;
                                                        const monthDiff = currentAbsoluteMonth - buffaloStartAbsoluteMonth;

                                                        // Calculate simulation month index (1-based) for display
                                                        const currentSimMonthIndex = (year - treeData.startYear) * 12 + month + 1;

                                                        if (revenue > 0) {
                                                            cellClass = "text-slate-700 font-semibold";
                                                            displayText = (
                                                                <div className="flex flex-col items-center leading-none">
                                                                    <span>{formatCurrency(revenue)}</span>

                                                                </div>
                                                            );
                                                            if (revenue >= 9000) cellClass = "text-emerald-600 font-bold bg-emerald-50/30";
                                                            else if (revenue >= 6000) cellClass = "text-blue-600 font-semibold bg-blue-50/30";
                                                        } else if (revenue === 0 && monthDiff >= 2 && buffalo.generation === 0) {
                                                            // For Gen 0 buffaloes, show "Rest" for zero-revenue months after the landing period
                                                            cellClass = "text-slate-400 text-sm font-medium bg-slate-50";
                                                            displayText = "-";
                                                        } else if (buffalo.generation > 0) {
                                                            // Children Logic
                                                            // monthDiff is 0-indexed offset from birthMonth. 

                                                            if (monthDiff < 0) {
                                                                displayText = "-";
                                                            } else if (monthDiff === 24) {
                                                                cellClass = "text-amber-600 text-sm font-bold bg-amber-50";
                                                                displayText = (
                                                                    <SimpleTooltip content="For a calf, CPF starts from the 25th month" placement="top">
                                                                        <div className="flex flex-col items-center leading-none">
                                                                            <span>CPF Start</span>
                                                                            <span className="text-[11px] text-slate-400 font-normal">({monthDiff + 1}th month)</span>
                                                                        </div>
                                                                    </SimpleTooltip>
                                                                );
                                                            } else if (monthDiff >= 32) {
                                                                // Generalized logic for Born/Transport events
                                                                // First birth at month 32 (33rd month), then every 12 months
                                                                // "Born" label at month 32, 44, 56, etc.

                                                                const monthsSinceFirstBirth = monthDiff - 32;

                                                                if (monthsSinceFirstBirth >= 0 && monthsSinceFirstBirth % 12 === 0) {
                                                                    const childIndex = 1 + (monthsSinceFirstBirth / 12);
                                                                    cellClass = "text-slate-500 text-sm font-medium bg-slate-100";
                                                                    displayText = (
                                                                        <div className="flex flex-col items-center leading-none">
                                                                            <span>{buffalo.id}{childIndex} Child (born)</span>
                                                                            <span className="text-[11px] text-slate-400 font-normal">({monthDiff + 1}th month)</span>
                                                                        </div>
                                                                    );
                                                                } else if (monthDiff < 34) {
                                                                    // Catch any gaps between 32 and 34 not covered above (shouldn't be any if logic holds, but strictly < 34 is Growing)
                                                                    // Actually 32 is Born, 33 is Transport. So this just covers logic.
                                                                    // But "Growing" is only for < 34.
                                                                    // Re-eval logic:
                                                                    // If monthDiff is e.g. 40. 40 < 34 is false.
                                                                    // We need to fallback to "Rest" or whatever the status is.
                                                                    // But wait. "Rest" implies revenue is 0.
                                                                    // If revenue > 0, it enters the FIRST if block (Lines 524).
                                                                    // So this ELSE block is ONLY for months where Revenue == 0.
                                                                    // Which are the "Resting" months.
                                                                    // So "Rest" is the correct default here.
                                                                    cellClass = "text-slate-400 text-sm font-medium bg-slate-50";
                                                                    displayText = "-";
                                                                } else {
                                                                    cellClass = "text-slate-400 text-sm font-medium bg-slate-50";
                                                                    displayText = "-";
                                                                }
                                                            } else if (monthDiff < 34) { // 0-31
                                                                displayText = "-";
                                                            } else {
                                                                cellClass = "text-slate-400 text-sm font-medium bg-slate-50";
                                                                displayText = "-";
                                                            }
                                                        } else if (monthDiff < 0 && buffalo.id === 'B') {
                                                            cellClass = "text-slate-400 text-sm font-medium bg-slate-50";
                                                            displayText = "-";
                                                        } else if (monthDiff === 0) {
                                                            cellClass = "text-slate-500 text-sm font-medium bg-slate-50";
                                                            displayText = (
                                                                <SimpleTooltip
                                                                    content={`5 days for procurement
                                                                    7 days for quarantine (After procurement)
                                                                    10 days for in-transit
                                                                    7 days for quarantine (before onboarding)`}
                                                                    placement="bottom"
                                                                    className="whitespace-nowrap max-w-none min-w-max"
                                                                >
                                                                    <span className="border-slate-400">Procurement</span>
                                                                </SimpleTooltip>
                                                            );
                                                        } else if (monthDiff === 1) {
                                                            cellClass = "text-slate-500 text-sm font-medium bg-slate-50";
                                                            displayText = "Milk Yield Starts";
                                                        } else if (isCpfApplicable) {
                                                            cellClass = "text-slate-400 text-sm font-medium bg-slate-50";
                                                            displayText = "-";
                                                        }

                                                        return (
                                                            <td key={buffalo.id} className={`px-2 sm:px-4 py-3 sm:py-4 text-center border-r border-slate-100 ${cellClass}`}>
                                                                {displayText}
                                                            </td>
                                                        );

                                                    })}
                                                    <td className={`md:sticky ${isCGFEnabled ? 'md:right-[15rem]' : 'md:right-[10rem]'} md:z-10 px-1 sm:px-2 py-3 sm:py-4 text-center font-bold text-slate-700 md:shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.1)] ${mIndex % 2 === 0 ? 'bg-slate-50' : 'bg-slate-100'}`}>
                                                        {formatCurrency(unitTotal)}
                                                    </td>
                                                    <td className={`md:sticky ${isCGFEnabled ? 'md:right-[10rem]' : 'md:right-[5rem]'} md:z-10 px-1 sm:px-2 py-3 sm:py-4 text-center font-medium text-amber-600 ${mIndex % 2 === 0 ? 'bg-amber-50' : 'bg-amber-100'}`}>
                                                        {formatCurrency(monthlyCpfValue)}
                                                    </td>
                                                    {isCGFEnabled && (
                                                        <td className={`md:sticky md:right-[5rem] md:z-10 px-1 sm:px-2 py-3 sm:py-4 text-center font-medium text-rose-600 ${mIndex % 2 === 0 ? 'bg-rose-50' : 'bg-rose-100'}`}>
                                                            {formatCurrency(monthlyCgfValue)}
                                                        </td>
                                                    )}

                                                    <td className={`md:sticky md:right-0 md:z-10 px-2 py-4 text-center font-bold border-l border-slate-200 ${netRevenue >= 0 ? (mIndex % 2 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-100 text-emerald-600') : (mIndex % 2 === 0 ? 'bg-rose-50 text-rose-600' : 'bg-rose-100 text-rose-600')}`}>
                                                        {formatCurrency(netRevenue)}
                                                    </td>


                                                </tr>
                                                {/* Quarter separators */}
                                                {(mIndex === 2 || mIndex === 5 || mIndex === 8) && (
                                                    <tr className="bg-slate-100/50">
                                                        <td colSpan={unitBuffaloes.length + (isCGFEnabled ? 5 : 4)} className="h-2 p-0"></td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody >
                                <tfoot className="border-t-[3px] border-slate-300">
                                    {/* Yearly Footer */}
                                    <tr className="bg-slate-800 text-white font-semibold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                        <td className="sticky left-0 z-10 px-4 py-4 border-r border-slate-700 bg-slate-800 text-center">Year Total</td>
                                        {unitBuffaloes.map((buffalo: any) => {
                                            const yearTot = Array.from({ length: 12 }).reduce((s: number, _, m: number) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, m);
                                                return s + (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
                                            }, 0);
                                            return (
                                                <td key={buffalo.id} className="px-4 py-4 text-center border-r border-slate-700 text-slate-300">
                                                    {formatCurrency(yearTot)}
                                                </td>
                                            );
                                        })}
                                        <td className={`md:sticky ${isCGFEnabled ? 'md:right-[15rem]' : 'md:right-[10rem]'} md:z-10 px-2 py-4 text-center bg-slate-900 border-l border-slate-700 md:shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.1)]`}>
                                            {formatCurrency(unitBuffaloes.reduce((s: any, b: any) => s + Array.from({ length: 12 }).reduce((ms: any, _, m) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, m);
                                                return ms + ((monthlyRevenue[year]?.[month]?.buffaloes[b.id] || 0));
                                            }, 0), 0))}
                                        </td>
                                        <td className={`md:sticky ${isCGFEnabled ? 'md:right-[10rem]' : 'md:right-[5rem]'} md:z-10 px-2 py-4 text-center bg-amber-900 text-amber-200`}>
                                            {formatCurrency(cpfCost.annualCPFCost * units)}
                                        </td>
                                        {isCGFEnabled && (
                                            <td className="md:sticky md:right-[5rem] md:z-10 px-2 py-4 text-center bg-rose-900 text-rose-200">
                                                {formatCurrency((Array.from({ length: 12 }) as any[]).reduce((sum, _, mIndex) => sum + calculateMonthlyCGF(selectedYearIndex, mIndex), 0) * units)}
                                            </td>
                                        )}
                                        <td className={`md:sticky md:right-0 md:z-10 px-2 py-4 text-center bg-emerald-900 border-l border-slate-700 text-emerald-300`}>
                                            {formatCurrency(((unitBuffaloes as any[]).reduce((s: number, b: any) => s + (Array.from({ length: 12 }) as any[]).reduce((ms: number, _, m: number) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, m);
                                                return ms + (Number(monthlyRevenue[year]?.[month]?.buffaloes[b.id]) || 0);
                                            }, 0), 0) - (cpfCost.annualCPFCost * units) - (isCGFEnabled ? (Array.from({ length: 12 }) as any[]).reduce((sum, _, mIndex) => sum + calculateMonthlyCGF(selectedYearIndex, mIndex), 0) * units : 0)))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl text-slate-400">📊</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Data Available</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        No revenue data found for Unit {selectedUnit} in Year {selectedYearIndex + 1}. Try selecting a different year.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MonthlyRevenueBreak;
