
import React, { useState } from 'react';
import { getBuffaloValueByAge } from '../BuffaloFamilyTree/CommonComponents';
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
    setHeaderStats,
    selectedYearIndex,
    isCpfStaggered
}: any) => {
    const [selectedUnit, setSelectedUnit] = useState(1);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const scrollContainerRef = React.useRef<any>(null);
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

    // Get buffaloes for selected unit and filter only income-producing ones
    const unitBuffaloes = allUnitBuffaloes
        .filter((buffalo: any) => {
            // Show buffalo if it produces any revenue this year OR is old enough to potentially produce
            // Or if it's M1/M2 which are main units
            if (buffalo.generation === 0) return true;

            if (currentSimYearStart < buffalo.birthYear) {
                return false;
            }

            const hasRevenue = Array.from({ length: 12 }).some((_, m) => {
                const { year, month } = getCalendarDate(selectedYearIndex, m);
                return (monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id] || 0) > 0;
            });


            // Show if it has revenue OR is of CPF paying age (>= 24 months)
            if (buffalo.generation > 0) {
                // Check if buffalo reaches 24 months in this year
                const reachesCPFAge = Array.from({ length: 12 }).some((_, m) => {
                    const { year, month } = getCalendarDate(selectedYearIndex, m);
                    const age = calculateAgeInMonths(buffalo, year, month);
                    return age >= 24;
                });

                const hasRevenue = Array.from({ length: 12 }).some((_, m) => {
                    const { year, month } = getCalendarDate(selectedYearIndex, m);
                    return (monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id] || 0) > 0;
                });

                return reachesCPFAge || hasRevenue;
            }

            return true;
        });

    // Helper to check precise CPF applicability (Standard Eligibility)
    const isCpfApplicableForMonth = (buffalo: any, yearIndex: number, monthIndexInSim: number) => {
        const { absMonth } = getCalendarDate(yearIndex, monthIndexInSim);
        const absoluteStartMonth = treeData.startYear * 12 + (treeData.startMonth || 0);
        const absoluteEndMonth = absoluteStartMonth + (treeData.years * 12) - 1;

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

    const calculateCPFCost = () => {
        let monthlyCosts = new Array(12).fill(0);
        const buffaloCPFDetails: any[] = [];
        const CPF_PER_MONTH = (isCpfStaggered ? 15000 : 18000) / 12;
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);
        const scanMaxAbs = (treeData.startYear + treeData.years + 2) * 12;

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
            if (isCpfStaggered) {
                let firstAbsEligible = -1;
                for (let absM = treeData.startYear * 12; absM < scanMaxAbs; absM++) {
                    if (eligibility[absM]) { firstAbsEligible = absM; break; }
                }

                if (firstAbsEligible !== -1) {
                    for (let s = firstAbsEligible; s < scanMaxAbs; s += 12) {
                        let cycleMonths = 0;
                        for (let k = 0; k < 12; k++) { if (eligibility[s + k]) cycleMonths++; }
                        const cycleTotal = cycleMonths * CPF_PER_MONTH;
                        for (let pIdx = s - 3; pIdx <= s - 1; pIdx++) {
                            const pYearIdx = Math.floor(pIdx / 12) - treeData.startYear;
                            if (pYearIdx === selectedYearIndex) {
                                monthlyCosts[pIdx % 12] += cycleTotal / 3;
                            }
                        }
                    }
                }
            } else {
                for (let m = 0; m < 12; m++) {
                    const absM = (treeData.startYear + selectedYearIndex) * 12 + m;
                    if (eligibility[absM]) monthlyCosts[m] += CPF_PER_MONTH;
                }
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
    };

    const cpfCost = calculateCPFCost();

    // Calculate cumulative revenue locally based on Simulation Years to ensure alignment with Table
    const calculateCumulativeRevenueLocally = () => {
        let totals: any = { total: 0 };
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);
        allUnitBuffaloes.forEach((b: any) => totals[b.id] = 0);

        for (let yIndex = 0; yIndex <= selectedYearIndex; yIndex++) {
            for (let m = 0; m < 12; m++) {
                const { year, month } = getCalendarDate(yIndex, m);
                if (monthlyRevenue[year]?.[month]) {
                    const monthData = monthlyRevenue[year][month];
                    allUnitBuffaloes.forEach((b: any) => {
                        const rev = monthData.buffaloes[b.id] || 0;
                        totals[b.id] = (totals[b.id] || 0) + rev;
                        totals.total += rev;
                    });
                }
            }
        }
        return totals;
    };

    const cumulativeData = calculateCumulativeRevenueLocally();
    const totalCumulativeUntilYear = cumulativeData.total;

    // Calculate CPF cumulative cost until selected year precisely
    const calculateCumulativeCPFCost = () => {
        let totalCPF = 0;
        const CPF_PER_MONTH = (isCpfStaggered ? 15000 : 18000) / 12;
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);
        const scanMaxAbs = (treeData.startYear + treeData.years + 2) * 12;

        allUnitBuffaloes.forEach((buffalo: any) => {
            const eligibility: Record<number, boolean> = {};
            for (let absM = treeData.startYear * 12 - 12; absM < scanMaxAbs; absM++) {
                eligibility[absM] = isCpfApplicableForMonth(buffalo, Math.floor(absM / 12) - treeData.startYear, absM % 12);
            }

            if (isCpfStaggered) {
                let firstAbsEligible = -1;
                for (let absM = treeData.startYear * 12; absM < scanMaxAbs; absM++) {
                    if (eligibility[absM]) { firstAbsEligible = absM; break; }
                }

                if (firstAbsEligible !== -1) {
                    for (let s = firstAbsEligible; s < scanMaxAbs; s += 12) {
                        let cycleMonths = 0;
                        for (let k = 0; k < 12; k++) { if (eligibility[s + k]) cycleMonths++; }
                        const cycleTotal = cycleMonths * CPF_PER_MONTH;
                        for (let pIdx = s - 3; pIdx <= s - 1; pIdx++) {
                            const pYearIdx = Math.floor(pIdx / 12) - treeData.startYear;
                            if (pYearIdx <= selectedYearIndex && pYearIdx >= 0) {
                                totalCPF += cycleTotal / 3;
                            }
                        }
                    }
                }
            } else {
                for (let yIdx = 0; yIdx <= selectedYearIndex; yIdx++) {
                    for (let m = 0; m < 12; m++) {
                        if (eligibility[treeData.startYear * 12 + yIdx * 12 + m]) totalCPF += CPF_PER_MONTH;
                    }
                }
            }
        });

        return Math.round(totalCPF);
    };

    const cumulativeCPFCost = calculateCumulativeCPFCost();

    // Calculate Caring Cost (CGF) cumulative until selected year
    const calculateCumulativeCaringCost = (untilYearIndex: number) => {
        let totalCaring = 0;
        const allUnitBuffaloes = Object.values(buffaloDetails).filter((b: any) => b.unit === selectedUnit);

        for (let yIdx = 0; yIdx <= untilYearIndex; yIdx++) {
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
        return totalCaring;
    };

    const cumulativeCaringCost = calculateCumulativeCaringCost(selectedYearIndex);
    const cumulativeNetRevenue = totalCumulativeUntilYear - cumulativeCPFCost;
    const cumulativeNetRevenueWithCaring = cumulativeNetRevenue - cumulativeCaringCost;

    // --- Fixed 10-Year Calculations for Header ---
    const calculateFullDurationStats = () => {
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
        const CPF_PER_MONTH = (isCpfStaggered ? 15000 : 18000) / 12;
        const scanMaxAbs = (treeData.startYear + treeData.years + 2) * 12;
        allUnitBuffaloes.forEach((buffalo: any) => {
            const eligibility: Record<number, boolean> = {};
            for (let absM = treeData.startYear * 12 - 12; absM < scanMaxAbs; absM++) {
                eligibility[absM] = isCpfApplicableForMonth(buffalo, Math.floor(absM / 12) - treeData.startYear, absM % 12);
            }

            if (isCpfStaggered) {
                let firstAbsEligible = -1;
                for (let absM = treeData.startYear * 12; absM < scanMaxAbs; absM++) {
                    if (eligibility[absM]) { firstAbsEligible = absM; break; }
                }

                if (firstAbsEligible !== -1) {
                    for (let s = firstAbsEligible; s < scanMaxAbs; s += 12) {
                        let cycleMonths = 0;
                        for (let k = 0; k < 12; k++) { if (eligibility[s + k]) cycleMonths++; }
                        const cycleTotal = cycleMonths * CPF_PER_MONTH;
                        for (let pIdx = s - 3; pIdx <= s - 1; pIdx++) {
                            const pYearIdx = Math.floor(pIdx / 12) - treeData.startYear;
                            if (pYearIdx <= fullYearIndex && pYearIdx >= 0) {
                                totalFullCPF += cycleTotal / 3;
                            }
                        }
                    }
                }
            } else {
                for (let yIdx = 0; yIdx <= fullYearIndex; yIdx++) {
                    for (let m = 0; m < 12; m++) {
                        if (eligibility[treeData.startYear * 12 + yIdx * 12 + m]) totalFullCPF += CPF_PER_MONTH;
                    }
                }
            }
        });

        // Cumulative Caring Full
        const totalFullCaring = calculateCumulativeCaringCost(fullYearIndex);

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
            return sum + getBuffaloValueByAge(age);
        }, 0);

        // Buffalo Count Full (at end of simulation)
        const absoluteEndMonth = treeData.startYear * 12 + (treeData.startMonth || 0) + (treeData.years * 12) - 1;
        const fullDurationBuffaloes = Object.values(buffaloDetails).filter((b: any) => {
            if (b.unit !== selectedUnit) return false;
            const birthAbsolute = b.birthYear * 12 + (b.birthMonth !== undefined ? b.birthMonth : (b.acquisitionMonth || 0));
            return birthAbsolute <= absoluteEndMonth;
        }).length;

        const netRev = Math.round(totalFullRev - totalFullCPF);

        return {
            netRev,
            netRevWithCaring: Math.round(netRev - totalFullCaring),
            assetValue: fullDurationAssetValue,
            buffaloes: fullDurationBuffaloes
        };
    };

    const fullDurationStats = calculateFullDurationStats();

    // Sync with Header
    React.useEffect(() => {
        if (typeof setHeaderStats === 'function') {
            setHeaderStats({
                cumulativeNetRevenue: fullDurationStats.netRev,
                cumulativeNetRevenueWithCaring: fullDurationStats.netRevWithCaring,
                totalRevenue: totalCumulativeUntilYear, // Still used for internal logic potentially
                totalAssetValue: fullDurationStats.assetValue,
                totalBuffaloes: fullDurationStats.buffaloes,
                endYear: selectedYear
            });
        }
    }, [fullDurationStats, selectedYear, setHeaderStats]);

    const startMonthName = monthNames[treeData.startMonth || 0];
    const startDateString = `${startMonthName} ${treeData.startYear}`;
    const endDateString = `December ${selectedYear}`;
    const dateRangeString = `${startDateString} - ${endDateString}`;

    // Download Excel function
    const downloadExcel = () => {
        const yearLabel = `Year ${selectedYearIndex + 1}`;
        let csvContent = "Monthly Revenue Breakdown - Unit " + selectedUnit + " - " + yearLabel + "\n\n";

        csvContent += "Month,";
        unitBuffaloes.forEach((buffalo: any) => {
            csvContent += buffalo.id + ",";
        });
        csvContent += "Unit Total,CPF Cost,Net Revenue,Cumulative Revenue Until " + yearLabel + "\n";

        Array.from({ length: 12 }).forEach((_, mIndex) => {
            const { year, month } = getCalendarDate(selectedYearIndex, mIndex);
            const monthName = monthNames[month];

            const unitTotal: number = (unitBuffaloes as any[]).reduce((sum: number, buffalo: any) => {
                return sum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
            }, 0);

            const monthlyCPF: number = cpfCost.monthlyCosts[mIndex];
            const netRevenue: number = unitTotal - monthlyCPF;

            csvContent += monthName + ",";
            unitBuffaloes.map((buffalo: any) => {
                const revenue = monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id] || 0;
                const isCpfApplicable = isCpfApplicableForMonth(buffalo, selectedYearIndex, mIndex);
            });
            csvContent += unitTotal + "," + Math.round(monthlyCPF) + "," + Math.round(netRevenue) + "," + totalCumulativeUntilYear + "\n";
        });

        // Yearly totals (Sum over the 12 simulation months)
        const yearlyUnitTotal: number = (unitBuffaloes as any[]).reduce((sum: number, buffalo: any) => {
            return sum + (Array.from({ length: 12 }) as any[]).reduce((monthSum: number, _, mIndex: number) => {
                const { year, month } = getCalendarDate(selectedYearIndex, mIndex);
                return monthSum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
            }, 0);
        }, 0);

        const yearlyNetRevenue = yearlyUnitTotal - cpfCost.annualCPFCost;

        csvContent += "\nYearly Total,";
        (unitBuffaloes as any[]).forEach((buffalo: any) => {
            const yearlyTotal: number = (Array.from({ length: 12 }) as any[]).reduce((sum: number, _, mIndex: number) => {
                const { year, month } = getCalendarDate(selectedYearIndex, mIndex);
                return sum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
            }, 0);
            csvContent += yearlyTotal + ",";
        });
        csvContent += yearlyUnitTotal + "," + cpfCost.annualCPFCost + "," + yearlyNetRevenue + "," + totalCumulativeUntilYear + "\n";

        // Add CPF details section
        csvContent += "\n\nCPF Details,\n";
        csvContent += "Buffalo ID,Has CPF,Months,Reason\n";
        cpfCost.buffaloCPFDetails.forEach((detail: any) => {
            csvContent += detail.id + "," + (detail.hasCPF ? "Yes" : "No") + "," + detail.monthsWithCPF + "," + detail.reason + "\n";
        });

        // Add cumulative data
        csvContent += "\n\nCumulative Data,\n";
        csvContent += "Description,Amount\n";
        csvContent += "Cumulative Revenue Until " + yearLabel + "," + totalCumulativeUntilYear + "\n";
        csvContent += "Cumulative CPF Cost," + cumulativeCPFCost + "\n";
        csvContent += "Cumulative Net Revenue," + cumulativeNetRevenue + "\n";

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Unit-${selectedUnit}-Revenue-${yearLabel}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

    return (
        <div className="w-full mb-6 space-y-2">
            {unitBuffaloes.length > 0 ? (
                <>
                    {/* 1. Top Summary Cards - KPI Grid */}
                    {/* 1. Top Summary Cards - KPI Grid */}
                    {/* 1. Top Summary Cards - KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">

                        {/* Annual Revenue */}
                        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Annual Revenue (No CPF)</p>
                                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                                    {formatCurrency(unitBuffaloes.reduce((sum: number, buffalo: any) => {
                                        return sum + Array.from({ length: 12 }).reduce((monthSum: number, _, mIndex: number) => {
                                            const { year, month } = getCalendarDate(selectedYearIndex, mIndex);
                                            return monthSum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
                                        }, 0);
                                    }, 0))}
                                </h3>
                            </div>
                            <div className="mt-1 flex items-center justify-center text-[9px] font-bold text-emerald-600 bg-emerald-50 w-fit px-1 py-0.5 rounded">
                                {(unitBuffaloes as any[]).filter((buffalo: any) => {
                                    const annualRev: number = (Array.from({ length: 12 }) as any[]).reduce((s: number, _, m: number) => {
                                        const { year: y, month: mo } = getCalendarDate(selectedYearIndex, m);
                                        return s + (Number(monthlyRevenue[y]?.[mo]?.buffaloes[buffalo.id]) || 0);
                                    }, 0);
                                    return annualRev > 0;
                                }).length} Producing
                            </div>
                        </div>

                        {/* Annual CPF Cost */}
                        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Annual CPF Cost</p>
                                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                                    {formatCurrency(cpfCost.annualCPFCost)}
                                </h3>
                            </div>
                            <div className="mt-1 flex items-center justify-center text-[9px] font-bold text-amber-600 bg-amber-50 w-fit px-1 py-0.5 rounded">
                                {cpfCost.milkProducingBuffaloesWithCPF} Active
                            </div>
                        </div>

                        {/* Net Annual Revenue */}
                        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                            <div className="relative z-10 h-full flex flex-col justify-between items-center">
                                <div className="flex flex-col items-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Net Annual (+CPF)</p>
                                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                                        {formatCurrency((unitBuffaloes as any[]).reduce((sum: number, buffalo: any) => {
                                            return sum + (Array.from({ length: 12 }) as any[]).reduce((monthSum: number, _, mIndex: number) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, mIndex);
                                                return monthSum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0);
                                            }, 0);
                                        }, 0) - cpfCost.annualCPFCost)}
                                    </h3>
                                </div>
                                <div className="mt-1 flex items-center justify-center text-[9px] text-slate-400">
                                    {(() => {
                                        const startAbs = (treeData.startYear * 12 + (treeData.startMonth || 0)) + (selectedYearIndex * 12);
                                        const sYear = Math.floor(startAbs / 12);
                                        const sMonth = startAbs % 12;
                                        const sDate = new Date(sYear, sMonth, 1);
                                        const eDate = new Date(sYear, sMonth + 11, 1);
                                        const startStr = sDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                        const endStr = eDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                        return `${startStr} - ${endStr}`;
                                    })()}
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-emerald-500" />
                        </div>

                        {/* Cumulative Net */}
                        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cumulative Net (Till Date)</p>
                                <h3 className="text-base font-bold text-indigo-600 mt-0.5">
                                    {formatCurrency(cumulativeNetRevenue)}
                                </h3>
                            </div>

                        </div>

                        {/* Asset Value */}
                        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Asset Value</p>
                                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                                    {formatCurrency(
                                        allUnitBuffaloes.reduce((sum: number, buffalo: any) => {
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
                                            return sum + getBuffaloValueByAge(age);
                                        }, 0)
                                    )}
                                </h3>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">End                 {(() => {
                                const startAbs = (treeData.startYear * 12 + (treeData.startMonth || 0)) + (selectedYearIndex * 12);
                                const sYear = Math.floor(startAbs / 12);
                                const sMonth = startAbs % 12;
                                const eDate = new Date(sYear, sMonth + 11, 1);
                                return eDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            })()}</p>
                        </div>

                    </div>

                    {/* 2. Toolbar & Actions */}
                    {/* Toolbar Removed */}

                    {/* 3. Main Data Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                        {showScrollIndicator && (
                            <div className="absolute right-[16rem] top-5 z-50 pointer-events-none">
                                <div className="bg-slate-900 text-white rounded-full p-1 shadow-xl animate-pulse flex items-center justify-center opacity-90 border border-slate-700">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                        <div
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="overflow-x-auto"
                        >
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="sticky left-0 z-20 w-24 min-w-[6rem] px-4 py-4 font-bold border-r border-slate-100 bg-slate-50">Month</th>
                                        {unitBuffaloes.map((buffalo: any) => (
                                            <th key={buffalo.id} className="px-4 py-4 font-semibold text-center border-r border-slate-100 min-w-[80px]">
                                                <div className="text-slate-800 text-base">{buffalo.id}</div>
                                            </th>
                                        ))}
                                        <th className="sticky right-[10rem] z-20 w-20 min-w-[5rem] px-2 py-4 font-bold text-center bg-slate-100 text-slate-700 border-l border-slate-200 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.1)]">Total</th>
                                        <th className="sticky right-[5rem] z-20 w-20 min-w-[5rem] px-2 py-4 font-bold text-center bg-amber-50 text-amber-700 border-l border-slate-200">CPF</th>
                                        <th className="sticky right-0 z-20 w-20 min-w-[5rem] px-2 py-4 font-bold text-center bg-emerald-50 text-emerald-700 border-l border-slate-200">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {Array.from({ length: 12 }).map((_, mIndex: number) => {
                                        const { year, month } = getCalendarDate(selectedYearIndex, mIndex);
                                        const monthName = monthNames[month];
                                        const unitTotal: number = (unitBuffaloes as any[]).reduce((sum: number, b: any) => sum + (Number(monthlyRevenue[year]?.[month]?.buffaloes[b.id]) || 0), 0);
                                        const monthlyCpfValue: number = cpfCost.monthlyCosts[mIndex];
                                        const netRevenue: number = unitTotal - monthlyCpfValue;
                                        const rowBg = mIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'; // Ensure opaque bg for sticky

                                        return (
                                            <React.Fragment key={mIndex}>
                                                <tr className={`group hover:bg-slate-50 transition-colors ${mIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                    <td className={`sticky left-0 z-10 px-4 py-3 font-medium text-slate-900 border-r border-slate-100 ${rowBg}`}>
                                                        {monthName}
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
                                                        } else if (buffalo.generation > 0) {
                                                            // Children Logic
                                                            // monthDiff is 0-indexed offset from birthMonth. 

                                                            if (monthDiff < 0) {
                                                                displayText = "-";
                                                            } else if (monthDiff === 24) {
                                                                cellClass = "text-rose-400 text-xs font-medium bg-rose-50";
                                                                displayText = (
                                                                    <div className="flex flex-col items-center leading-none">
                                                                        <span>CPF</span>
                                                                        <span className="text-[9px] text-slate-400 font-normal">({monthDiff + 1}th month)</span>
                                                                    </div>
                                                                );
                                                            } else if (monthDiff >= 32) {
                                                                // Generalized logic for Born/Transport events
                                                                // Cycle starts at 34 months (first birth). Subsequent births every 12 months.
                                                                // "Born" label at BirthMonth - 2. "Transport" label at BirthMonth - 1.

                                                                // Check for "Born" event (monthDiff is BirthMonth - 2)
                                                                // TargetAge = monthDiff. BirthMonth = TargetAge + 2.
                                                                // Condition: (TargetAge + 2 - 34) % 12 === 0

                                                                const monthsSinceFirstBirthForBorn = monthDiff + 2 - 34;
                                                                const monthsSinceFirstBirthForTransport = monthDiff + 1 - 34;

                                                                if (monthsSinceFirstBirthForBorn >= 0 && monthsSinceFirstBirthForBorn % 12 === 0) {
                                                                    const childIndex = 1 + (monthsSinceFirstBirthForBorn / 12);
                                                                    cellClass = "text-slate-500 text-xs font-medium bg-slate-100";
                                                                    displayText = (
                                                                        <div className="flex flex-col items-center leading-none">
                                                                            <span>{buffalo.id}{childIndex} Child (born)</span>
                                                                            <span className="text-[9px] text-slate-400 font-normal">({currentSimMonthIndex}th month)</span>
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
                                                                    cellClass = "text-slate-400 text-xs font-medium bg-slate-50";
                                                                    displayText = "Rest";
                                                                } else {
                                                                    cellClass = "text-slate-400 text-xs font-medium bg-slate-50";
                                                                    displayText = "Rest";
                                                                }
                                                            } else if (monthDiff < 34) { // 0-31
                                                                displayText = "-";
                                                            } else {
                                                                cellClass = "text-slate-400 text-xs font-medium bg-slate-50";
                                                                displayText = "Rest";
                                                            }
                                                        } else if (monthDiff < 0 && buffalo.id === 'B') {
                                                            cellClass = "text-slate-400 text-xs font-medium bg-slate-50";
                                                            displayText = "Importing";
                                                        } else if (monthDiff === 0) {
                                                            cellClass = "text-slate-500 text-xs font-medium bg-slate-50";
                                                            displayText = "Transport";
                                                        } else if (monthDiff === 1) {
                                                            cellClass = "text-slate-500 text-xs font-medium bg-slate-50";
                                                            displayText = "Milk Yield Initiation Period";
                                                            // Actually user said "resting and landing periods of children".
                                                            // For Gen 0, Month 2 is implicitly "Landing Phase" before full revenue.
                                                        } else if (isCpfApplicable) {
                                                            cellClass = "text-rose-400 text-xs";
                                                            displayText = "CPF";
                                                        }

                                                        return (
                                                            <td key={buffalo.id} className={`px-4 py-3 text-center border-r border-slate-100 ${cellClass}`}>
                                                                {displayText}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className={`sticky right-[10rem] z-10 px-2 py-3 text-center font-bold text-slate-700 border-l border-slate-200 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.1)] ${mIndex % 2 === 0 ? 'bg-slate-50' : 'bg-slate-100'}`}>
                                                        {formatCurrency(unitTotal)}
                                                    </td>
                                                    <td className={`sticky right-[5rem] z-10 px-2 py-3 text-center font-medium text-amber-600 border-l border-slate-200 ${mIndex % 2 === 0 ? 'bg-amber-50' : 'bg-amber-100'}`}>
                                                        {formatCurrency(monthlyCpfValue)}
                                                    </td>
                                                    <td className={`sticky right-0 z-10 px-2 py-3 text-center font-bold border-l border-slate-200 ${netRevenue >= 0 ? (mIndex % 2 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-100 text-emerald-600') : (mIndex % 2 === 0 ? 'bg-rose-50 text-rose-600' : 'bg-rose-100 text-rose-600')}`}>
                                                        {formatCurrency(netRevenue)}
                                                    </td>


                                                </tr>
                                                {/* Quarter separators */}
                                                {(mIndex === 2 || mIndex === 5 || mIndex === 8) && (
                                                    <tr className="bg-slate-100/50">
                                                        <td colSpan={unitBuffaloes.length + 4} className="h-2 p-0"></td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Yearly Footer */}
                                    <tr className="bg-slate-800 text-white font-semibold">
                                        <td className="sticky left-0 z-10 px-4 py-4 border-r border-slate-700 bg-slate-800">Year Total</td>
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
                                        <td className="sticky right-[10rem] z-10 px-2 py-4 text-center bg-slate-900 border-l border-slate-700 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                            {formatCurrency(unitBuffaloes.reduce((s: any, b: any) => s + Array.from({ length: 12 }).reduce((ms: any, _, m) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, m);
                                                return ms + (monthlyRevenue[year]?.[month]?.buffaloes[b.id] || 0);
                                            }, 0), 0))}
                                        </td>
                                        <td className="sticky right-[5rem] z-10 px-2 py-4 text-center bg-amber-900 border-l border-slate-700 text-amber-200">
                                            {formatCurrency(cpfCost.annualCPFCost)}
                                        </td>
                                        <td className="sticky right-0 z-10 px-2 py-4 text-center bg-emerald-900 text-emerald-300 border-l border-slate-700">
                                            {formatCurrency((unitBuffaloes as any[]).reduce((s: number, b: any) => s + (Array.from({ length: 12 }) as any[]).reduce((ms: number, _, m: number) => {
                                                const { year, month } = getCalendarDate(selectedYearIndex, m);
                                                return ms + (Number(monthlyRevenue[year]?.[month]?.buffaloes[b.id]) || 0);
                                            }, 0), 0) - cpfCost.annualCPFCost)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 mt-4">
                        Notes: B gets one year free CPF start. CPF = ₹18,000/yr (monthly).
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
                    <div className="mt-6">
                        {/* Selector Removed - Controlled globally */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyRevenueBreak;
