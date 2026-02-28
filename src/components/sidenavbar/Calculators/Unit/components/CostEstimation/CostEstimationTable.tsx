
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Info,
    Calendar,
    Target,
    TrendingUp,
    Activity,
    PieChart,
    Clock,
    Sprout,
    Calculator,
    ChevronDown,
    FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import MonthlyRevenueBreak from './MonthlyRevenueBreak';

import RevenueBreakEven from './RevenueBreakEven';
import AssetMarketValue from './AssetMarketValue';
import HerdPerformance from './HerdPerformance';
import AnnualHerdRevenue from './AnnualHerdRevenue';
import BreakEvenTimeline from './BreakEvenTimeline';
import CattleGrowingFund from './CattleGrowingFund';
import CpfCgfCombined from './CpfCgfCombined';
import { formatCurrency, formatNumber } from '../BuffaloFamilyTree/CommonComponents';

const CostEstimationTable = ({
    treeData,
    activeGraph,
    setActiveGraph,
    onBack,
    setHeaderStats,
    isCGFEnabled
}: {
    treeData: any;
    activeGraph: string;
    setActiveGraph: (val: string) => void;
    onBack: () => void;
    setHeaderStats?: (stats: any) => void;
    isCGFEnabled: boolean;
}) => {
    return <CostEstimationTableContent
        treeData={treeData}
        activeGraph={activeGraph}
        setActiveGraph={setActiveGraph}
        onBack={onBack}
        setHeaderStats={setHeaderStats}
        isCGFEnabled={isCGFEnabled}
    />;
};

const CostEstimationTableContent = ({
    treeData: propTreeData,
    activeGraph,
    setActiveGraph,
    onBack,
    setHeaderStats,
    isCGFEnabled
}: {
    treeData: any;
    activeGraph: string;
    setActiveGraph: (val: string) => void;
    onBack: () => void;
    setHeaderStats?: (stats: any) => void;
    isCGFEnabled: boolean;
}) => {
    const [activeTab, setActiveTab] = useState("Monthly Revenue Break");
    const [cpfToggle, setCpfToggle] = useState("withCPF");
    const [globalYearIndex, setGlobalYearIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to top when year or tab changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [globalYearIndex, activeTab]);

    const treeData = propTreeData || { buffaloes: [], startYear: 0, startMonth: 0, durationMonths: 0, revenueData: { yearlyData: [] } };
    const units = treeData.units || 1;
    const startYear = treeData.startYear;
    const startMonth = treeData.startMonth;

    // Clamp year selector if current selection exceeds new range
    React.useEffect(() => {
        if (treeData.durationMonths > 0) {
            const lastYearIndex = Math.ceil(treeData.durationMonths / 12) - 1;
            setGlobalYearIndex(prev => prev > lastYearIndex ? lastYearIndex : prev);
        }
    }, [treeData.durationMonths, treeData.startYear, treeData.startMonth]);

    const { yearlyData = [], totalRevenue = 0, totalUnits = 0, totalMatureBuffaloYears = 0 } = treeData.revenueData || {};

    // Shared calculation functions
    const calculateAgeInMonths = (buffalo: any, targetYear: number, targetMonth: number = 0) => {
        const birthYear = buffalo.birthYear;
        // Use birthMonth if available (from getBuffaloDetails), fall back to acquisitionMonth or 0
        const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
        const totalMonths = (targetYear - birthYear) * 12 + (targetMonth - birthMonth);
        return Math.max(0, totalMonths);
    };

    const buffaloDetails = useMemo(() => {
        const buffaloDetails: any = {};

        // First pass: Create all buffalo entries
        (treeData.buffaloes || []).forEach((buffalo: any) => {
            // Determine acquisition/birth month logic
            // For Gen 0, acquisitionMonth is set.
            // For Gen > 0, we can use birthMonth if available or inherit from parent acquisition if consistent.
            // In the new treeData, acquisitionMonth is passed down.

            const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);

            buffaloDetails[buffalo.id] = {
                id: buffalo.id,
                name: buffalo.name || buffalo.id, // Pass name, fallback to ID
                originalId: buffalo.id,
                generation: buffalo.generation,
                unit: buffalo.unit,
                acquisitionMonth: buffalo.acquisitionMonth,
                absoluteAcquisitionMonth: buffalo.absoluteAcquisitionMonth, // Pass this down
                birthYear: buffalo.birthYear,
                birthMonth: birthMonth,
                parentId: buffalo.parentId,
                children: [],
                grandchildren: []
            };
        });

        // Second pass: Link relationships
        (treeData.buffaloes || []).forEach((buffalo: any) => {
            if (buffalo.parentId && buffaloDetails[buffalo.parentId]) {
                const parent = buffaloDetails[buffalo.parentId];
                parent.children.push(buffalo.id);

                // If parent is a child (generation 1), then this buffalo is a grandchild (generation 2)
                // We also want to link it to the grandparent for CostEstimationTable structure if needed,
                // though the current code only explicitly tracks grandchildren for the grandparent object?
                // The original code was: grandparent.grandchildren.push(buffalo.id)

                if (parent.generation === 1) {
                    const grandparent = buffaloDetails[parent.parentId];
                    if (grandparent) {
                        grandparent.grandchildren.push(buffalo.id);
                    }
                }
            }
        });

        return buffaloDetails;
    }, [treeData.buffaloes]);

    const calculateMonthlyRevenueForBuffalo = (acquisitionMonth: number, currentMonth: number, currentYear: number, startYear: number, absoluteAcquisitionMonth?: number, generation = 0, buffaloId = '') => {
        let monthsSinceAcquisition;

        if (absoluteAcquisitionMonth !== undefined) {
            const currentAbsolute = currentYear * 12 + currentMonth;
            monthsSinceAcquisition = currentAbsolute - absoluteAcquisitionMonth;
        } else {
            // Fallback for old/legacy data
            monthsSinceAcquisition = (currentYear - startYear) * 12 + (currentMonth - acquisitionMonth);
        }

        let offset = 2;
        if (generation > 0) {
            offset = 34; // Standardized for all offspring
        }

        if (monthsSinceAcquisition < offset) {
            return 0;
        }

        const productionMonth = monthsSinceAcquisition - offset;
        const cycleMonth = productionMonth % 12;

        if (cycleMonth < 5) {
            return 9000;
        } else if (cycleMonth < 8) {
            return 6000;
        } else {
            return 0;
        }
    };

    const { byYear: yearlyCPFCost, byMonth: monthlyCPFCost } = useMemo(() => {
        const cpfCostByYear: any = {};
        const cpfCostByMonth: any = {};
        const CPF_PER_MONTH = 15000 / 12;

        const startAbs = treeData.startYear * 12 + (treeData.startMonth || 0);
        const endAbs = startAbs + (treeData.durationMonths) - 1;
        const scanMaxAbs = (treeData.startYear + Math.ceil(treeData.durationMonths / 12) + 2) * 12;

        // 1. Calculate Standard Monthly Eligibility for all months
        const eligibilityMap: Record<string, Record<number, boolean>> = {};
        Object.values(buffaloDetails).forEach((buffalo: any) => {
            eligibilityMap[buffalo.id] = {};
            for (let absM = treeData.startYear * 12 - 12; absM < scanMaxAbs; absM++) {
                if (absM < startAbs || absM > endAbs) {
                    eligibilityMap[buffalo.id][absM] = false;
                    continue;
                }

                const year = Math.floor(absM / 12);
                const month = absM % 12;
                let isCpfApplicable = false;
                const isFirstInUnit = (buffalo.id.charCodeAt(0) - 65) % 2 === 0;

                if (buffalo.generation === 0) {
                    const monthsSinceStart = absM - startAbs;
                    if (isFirstInUnit) {
                        if (monthsSinceStart >= 12) isCpfApplicable = true;
                    } else {
                        const isPresent = buffalo.absoluteAcquisitionMonth !== undefined
                            ? absM >= buffalo.absoluteAcquisitionMonth
                            : (year > treeData.startYear || (year === treeData.startYear && month >= buffalo.acquisitionMonth));
                        if (isPresent) {
                            const isFreePeriod = monthsSinceStart >= 6 && monthsSinceStart < 18;
                            if (!isFreePeriod) isCpfApplicable = true;
                        }
                    }
                } else {
                    const age = calculateAgeInMonths(buffalo, year, month);
                    if (age >= 24) isCpfApplicable = true;
                }
                eligibilityMap[buffalo.id][absM] = isCpfApplicable;
            }
        });

        // 2. Initialize Yearly/Monthly Cost Storage
        for (let year = treeData.startYear; year <= treeData.startYear + Math.ceil(treeData.durationMonths / 12); year++) {
            cpfCostByMonth[year] = {};
            for (let month = 0; month < 12; month++) {
                cpfCostByMonth[year][month] = 0;
            }
        }

        // 3. Assign Costs
        Object.values(buffaloDetails).forEach((buffalo: any) => {
            const eligibility = eligibilityMap[buffalo.id];

            for (let absM = startAbs; absM <= endAbs; absM++) {
                if (eligibility[absM]) {
                    const y = Math.floor(absM / 12);
                    const m = absM % 12;
                    if (cpfCostByMonth[y]) {
                        cpfCostByMonth[y][m] += CPF_PER_MONTH;
                    }
                }
            }
        });

        // 4. Finalize Yearly Totals
        for (let year = treeData.startYear; year <= treeData.startYear + Math.ceil(treeData.durationMonths / 12); year++) {
            let total = 0;
            for (let month = 0; month < 12; month++) {
                total += cpfCostByMonth[year][month];
            }
            cpfCostByYear[year] = Math.round(total);
        }

        return { byYear: cpfCostByYear, byMonth: cpfCostByMonth };
    }, [treeData.startYear, treeData.startMonth, treeData.durationMonths, buffaloDetails]);

    // Calculate Yearly CGF Cost
    const { byYear: yearlyCGFCost, byMonth: monthlyCGFCost } = useMemo(() => {
        const cgfCostByYear: any = {};
        const cgfCostByMonth: any = {};

        if (!isCGFEnabled) return { byYear: {}, byMonth: {} };

        const startAbs = treeData.startYear * 12 + (treeData.startMonth || 0);
        const endAbs = startAbs + (treeData.durationMonths) - 1;

        // Initialize
        for (let year = treeData.startYear; year <= treeData.startYear + Math.ceil(treeData.durationMonths / 12); year++) {
            cgfCostByMonth[year] = {};
            for (let month = 0; month < 12; month++) {
                cgfCostByMonth[year][month] = 0;
            }
        }

        // Calculate CGF for each buffalo
        Object.values(buffaloDetails).forEach((buffalo: any) => {
            if (buffalo.generation > 0) {
                const birthYear = buffalo.birthYear;
                const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                const birthAbsolute = birthYear * 12 + birthMonth;

                for (let absM = startAbs; absM <= endAbs; absM++) {
                    const year = Math.floor(absM / 12);
                    const month = absM % 12;

                    if (birthAbsolute <= absM) {
                        const ageInMonths = (absM - birthAbsolute) + 1;
                        let monthlyCost = 0;
                        if (ageInMonths > 12 && ageInMonths <= 18) monthlyCost = 1000;
                        else if (ageInMonths > 18 && ageInMonths <= 24) monthlyCost = 1400;
                        else if (ageInMonths > 24 && ageInMonths <= 30) monthlyCost = 1800;
                        else if (ageInMonths > 30 && ageInMonths <= 36) monthlyCost = 2500;

                        if (monthlyCost > 0) {
                            if (cgfCostByMonth[year]) {
                                cgfCostByMonth[year][month] += monthlyCost * units;
                            }
                        }
                    }
                }
            }
        });

        // Sum up yearly
        for (let year = treeData.startYear; year <= treeData.startYear + Math.ceil(treeData.durationMonths / 12); year++) {
            let total = 0;
            for (let month = 0; month < 12; month++) {
                total += cgfCostByMonth[year][month];
            }
            cgfCostByYear[year] = Math.round(total);
        }

        return { byYear: cgfCostByYear, byMonth: cgfCostByMonth };

    }, [treeData.startYear, treeData.startMonth, treeData.durationMonths, buffaloDetails, isCGFEnabled, units]);

    // Moved calculation functions to after investorMonthlyRevenue definition
    // ... code moved ...

    const getBuffaloValueByAge = (ageInMonths: number) => {
        if (ageInMonths >= 41) {
            return 175000;
        } else if (ageInMonths >= 35) {
            return 150000;
        } else if (ageInMonths >= 25) {
            return 100000;
        } else if (ageInMonths >= 19) {
            return 40000;
        } else if (ageInMonths >= 13) {
            return 25000;
        } else {
            return 10000;
        }
    };

    const getBuffaloValueDescription = (ageInMonths: number) => {
        if (ageInMonths >= 41) {
            return "41+ months (Peak/Proven - ₹1,75,000)";
        } else if (ageInMonths >= 35) {
            return "35-40 months (Prime - ₹1,50,000)";
        } else if (ageInMonths >= 25) {
            return "25-34 months (Mature - ₹1,00,000)";
        } else if (ageInMonths >= 19) {
            return "19-24 months (Heifer - ₹40,000)";
        } else if (ageInMonths >= 13) {
            return "13-18 months (Growing - ₹25,000)";
        } else {
            return "0-12 months (Calf - ₹10,000)";
        }
    };

    const calculateDetailedAssetValue = (year: any, targetMonth: number = 11) => {
        const ageGroups: any = {
            '0-12 months': { count: 0, value: 0, unitValue: 10000 },
            '13-18 months': { count: 0, value: 0, unitValue: 25000 },
            '19-24 months': { count: 0, value: 0, unitValue: 40000 },
            '25-34 months': { count: 0, value: 0, unitValue: 100000 },
            '35-40 months': { count: 0, value: 0, unitValue: 150000 },
            '41+ months': { count: 0, value: 0, unitValue: 175000 }
        };

        let totalValue = 0;
        let totalCount = 0;
        let buffaloesCount = 0;
        let calvesCount = 0;

        Object.values(buffaloDetails).forEach((buffalo: any) => {
            const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
            if (year > buffalo.birthYear || (year === buffalo.birthYear && birthMonth <= targetMonth)) {
                const ageInMonths = calculateAgeInMonths(buffalo, year, targetMonth);
                let value = getBuffaloValueByAge(ageInMonths);

                const absStart = Number(treeData.startYear) * 12 + Number(treeData.startMonth || 0);
                const absCurrent = Number(year) * 12 + Number(targetMonth);
                const monthsPassed = absCurrent - absStart + 1;

                // Override: 0-12 months value is 0 in the first 12 months of simulation
                if (monthsPassed <= 12 && ageInMonths <= 12) {
                    value = 0;
                }

                // Breakdown: Buffaloes (> 24m), Calves (<= 24m)
                if (ageInMonths > 24) {
                    buffaloesCount += units;
                } else {
                    calvesCount += units;
                }

                if (ageInMonths >= 41) {
                    ageGroups['41+ months'].count += units;
                    ageGroups['41+ months'].value += value * units;
                } else if (ageInMonths >= 35) {
                    ageGroups['35-40 months'].count += units;
                    ageGroups['35-40 months'].value += value * units;
                } else if (ageInMonths >= 25) {
                    ageGroups['25-34 months'].count += units;
                    ageGroups['25-34 months'].value += value * units;
                } else if (ageInMonths >= 19) {
                    ageGroups['19-24 months'].count += units;
                    ageGroups['19-24 months'].value += value * units;
                } else if (ageInMonths >= 13) {
                    ageGroups['13-18 months'].count += units;
                    ageGroups['13-18 months'].value += value * units;
                } else {
                    ageGroups['0-12 months'].count += units;
                    ageGroups['0-12 months'].value += value * units;
                }

                totalValue += value * units;
                totalCount += units;
            }
        });

        return { ageGroups, totalValue, totalCount, buffaloesCount, calvesCount };

    };

    const MOTHER_BUFFALO_PRICE = 175000;
    const CPF_PER_UNIT = 15000;

    const initialInvestment = useMemo(() => {
        const motherBuffaloCost = treeData.units * 2 * MOTHER_BUFFALO_PRICE;
        const cpfCost = treeData.units * CPF_PER_UNIT;
        return {
            motherBuffaloCost,
            cpfCost,
            totalInvestment: motherBuffaloCost + cpfCost,
            totalBuffaloesAtStart: treeData.units * 4,
            motherBuffaloes: treeData.units * 2,
            calvesAtStart: treeData.units * 2,
            pricePerMotherBuffalo: MOTHER_BUFFALO_PRICE,
            cpfPerUnit: CPF_PER_UNIT
        };
    }, [treeData.units]);



    const { monthlyRevenue, investorMonthlyRevenue, revenueBuffaloDetails, buffaloValuesByYear } = useMemo(() => {
        const monthlyRevenue: any = {};
        const investorMonthlyRevenue: any = {};
        const buffaloValuesByYear: any = {};

        const endYear = treeData.startYear + Math.ceil(treeData.durationMonths / 12);
        for (let year = treeData.startYear; year <= endYear; year++) {
            monthlyRevenue[year] = {};
            investorMonthlyRevenue[year] = {};
            buffaloValuesByYear[year] = {};

            for (let month = 0; month < 12; month++) {
                monthlyRevenue[year][month] = {
                    total: 0,
                    buffaloes: {}
                };
                investorMonthlyRevenue[year][month] = 0;
            }
        }

        Object.values(buffaloDetails).forEach((buffalo: any) => {
            for (let year = treeData.startYear; year <= endYear; year++) {
                const ageInMonths = calculateAgeInMonths(buffalo, year, 11);

                if (!buffaloValuesByYear[year][buffalo.id]) {
                    buffaloValuesByYear[year][buffalo.id] = {
                        ageInMonths: ageInMonths,
                        value: getBuffaloValueByAge(ageInMonths),
                        description: getBuffaloValueDescription(ageInMonths)
                    };
                }

                // Revenue Logic
                // For Gen 0 (Mothers): Revenue based on acquisitionMonth
                // For Gen 1/2 (Children): Revenue starts when they mature (e.g. 3 years / 36 months)

                let shouldCalculateRevenue = false;
                if (buffalo.generation === 0) {
                    shouldCalculateRevenue = true;
                } else {
                    // For children, checking strictly year is not enough as M2C1 is born mid-year.
                    // We check if they are at least 36 months old in this year (at some point).
                    // Actually, we should check per month.
                    shouldCalculateRevenue = true; // We will check inside the monthly loop
                }

                if (shouldCalculateRevenue) {
                    for (let month = 0; month < 12; month++) {
                        // Cutoff Logic
                        const currentAbsoluteMonth = year * 12 + month;
                        const absoluteStartMonth = treeData.startYear * 12 + treeData.startMonth;
                        const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths) - 1;

                        if (currentAbsoluteMonth < absoluteStartMonth || currentAbsoluteMonth > absoluteEndMonth) {
                            continue;
                        }

                        // Precise age check for children
                        if (buffalo.generation > 0) {
                            const ageAtMonth = calculateAgeInMonths(buffalo, year, month);
                            const threshold = 34; // Standardized for all offspring
                            if (ageAtMonth < threshold) continue;
                        }

                        const revenue = calculateMonthlyRevenueForBuffalo(
                            buffalo.acquisitionMonth,
                            month,
                            year,
                            treeData.startYear,
                            buffalo.absoluteAcquisitionMonth,
                            buffalo.generation,
                            buffalo.id
                        );

                        const scaledRevenue = revenue * units;
                        if (revenue > 0) {
                            monthlyRevenue[year][month].total += scaledRevenue;
                            monthlyRevenue[year][month].buffaloes[buffalo.id] = scaledRevenue;
                            investorMonthlyRevenue[year][month] += scaledRevenue;
                        }
                    }
                }
            }
        });

        return { monthlyRevenue, investorMonthlyRevenue, revenueBuffaloDetails: buffaloDetails, buffaloValuesByYear };
    }, [treeData.startYear, treeData.startMonth, treeData.durationMonths, buffaloDetails, units]);

    // --- Helper for Simulation Year Labels ---
    const getSimulationYearLabel = (simYearIndex: number) => {
        const startAbs = treeData.startYear * 12 + (treeData.startMonth || 0);
        const startY = Math.floor((startAbs + simYearIndex * 12) / 12);
        const startM = (startAbs + simYearIndex * 12) % 12;

        const monthsInThisYear = Math.min(12, treeData.durationMonths - simYearIndex * 12);

        const startDay = treeData.startDay || 1;
        const startDate = new Date(startY, startM, startDay);
        // End date represents the start date of the final month in this period
        const endDate = new Date(startY, startM + monthsInThisYear - 1, startDay);

        const formatDate = (date: Date) => {
            const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${startDay !== 1 ? date.getDate() + ' ' : ''}${monthNamesShort[date.getMonth()]} ${date.getFullYear()}`;
        };

        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    const yearlyDataWithCPF = useMemo(() => {
        const simYears = Math.ceil(treeData.durationMonths / 12);
        const results = [];

        for (let i = 0; i < simYears; i++) {
            let annualRevenue = 0;
            let annualCPF = 0;
            let annualCGF = 0;
            let finalBuffaloCount = 0;
            let producingBuffaloes = 0;
            let nonProducingBuffaloes = 0;

            const monthsThisYear = Math.min(12, treeData.durationMonths - i * 12);
            const startAbs = (treeData.startYear * 12 + (treeData.startMonth || 0)) + (i * 12);

            for (let m = 0; m < monthsThisYear; m++) {
                const absM = startAbs + m;
                const year = Math.floor(absM / 12);
                const month = absM % 12;

                annualRevenue += (investorMonthlyRevenue[year]?.[month] || 0);
                annualCPF += ((monthlyCPFCost[year]?.[month] || 0) * units);

                // Track buffalo count at the end of this year
                if (m === monthsThisYear - 1) {
                    const allBuffaloes = Object.values(buffaloDetails).filter((b: any) => {
                        const birthAbs = b.birthYear * 12 + (b.birthMonth !== undefined ? b.birthMonth : (b.acquisitionMonth || 0));
                        return birthAbs <= absM;
                    });

                    finalBuffaloCount = allBuffaloes.length * units;

                    allBuffaloes.forEach((b: any) => {
                        const birthAbs = b.birthYear * 12 + (b.birthMonth !== undefined ? b.birthMonth : (b.acquisitionMonth || 0));
                        const ageAtMonth = absM - birthAbs;
                        const offset = b.generation > 0 ? 34 : 2;

                        if (ageAtMonth >= offset) {
                            producingBuffaloes += units;
                        } else {
                            nonProducingBuffaloes += units;
                        }
                    });
                }
            }

            // Sync CGF (already calculated by month)
            if (isCGFEnabled) {
                for (let m = 0; m < monthsThisYear; m++) {
                    const absM = startAbs + m;
                    const year = Math.floor(absM / 12);
                    const month = absM % 12;
                    annualCGF += (monthlyCGFCost[year]?.[month] || 0);
                }
            }

            const revenueWithoutCPF = annualRevenue;
            const revenueWithCPF = annualRevenue - annualCPF - annualCGF;

            results.push({
                year: treeData.startYear + i, // Numeric year index for sorting/legacy
                displayLabel: getSimulationYearLabel(i),
                revenue: annualRevenue,
                cpfCost: annualCPF,
                cgfCost: annualCGF,
                revenueWithoutCPF,
                revenueWithCPF,
                totalBuffaloes: finalBuffaloCount,
                producingBuffaloes,
                nonProducingBuffaloes
            });
        }
        return results;
    }, [treeData.durationMonths, treeData.startYear, treeData.startMonth, investorMonthlyRevenue, monthlyCPFCost, monthlyCGFCost, units, isCGFEnabled, buffaloDetails]);

    const cumulativeYearlyData = useMemo(() => {
        const cumulativeData: any[] = [];
        let cumulativeRevenueWithoutCPF = 0;
        let cumulativeRevenueWithCPF = 0;

        yearlyDataWithCPF.forEach((yearData: any) => {
            cumulativeRevenueWithoutCPF += yearData.revenueWithoutCPF;
            cumulativeRevenueWithCPF += yearData.revenueWithCPF;

            cumulativeData.push({
                ...yearData,
                cumulativeRevenueWithCPF: cumulativeRevenueWithCPF,
                cumulativeCPFCost: cumulativeRevenueWithoutCPF - cumulativeRevenueWithCPF
            });
        });

        return cumulativeData;
    }, [yearlyDataWithCPF]);

    const breakEvenAnalysis = useMemo(() => {
        const breakEvenData = [];
        let breakEvenYearWithCPF = null;
        let breakEvenMonthWithCPF = null;
        let exactBreakEvenDateWithCPF = null;

        let revenueBreakEvenYearWithCPF: any = null;
        let revenueBreakEvenMonthWithCPF = null;
        let revenueExactBreakEvenDateWithCPF = null;

        // Helper to calculate total asset value for a specific point in time
        const calculateTotalAssetValueForMonth = (targetYear: number, targetMonth: number) => {
            const { totalValue } = calculateDetailedAssetValue(targetYear, targetMonth);
            return totalValue;
        };

        // Helper to get calendar date from simulation index
        const getCalendarDate = (simYearIndex: number, simMonthIndex: number) => {
            const absStart = (treeData.startYear * 12 + (treeData.startMonth || 0));
            const absTarget = absStart + (simYearIndex * 12) + simMonthIndex;
            return {
                year: Math.floor(absTarget / 12),
                month: absTarget % 12,
                absMonth: absTarget
            };
        };

        const calculateMonthlyCGF = (simulationYearIndex: number, simulationMonthIndex: number) => {
            if (!isCGFEnabled) return 0;
            let monthlyCGF = 0;
            const { absMonth } = getCalendarDate(simulationYearIndex, simulationMonthIndex);

            Object.values(buffaloDetails as Record<string, any>).forEach((buffalo: any) => {
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
            return monthlyCGF;
        };

        // Calculate Simulation-Year based data
        const simulationYears = treeData.durationMonths / 12;
        let cumulativeRevenueWithCPF = 0;

        // We need to track break-even precisely monthly, but aggregate yearly for table

        // 1. Precise Break Even Check (Monthly Stream)
        // Run this FIRST so we know the Break Even Year for the table flags
        let cumRev = 0;
        const initialInv = initialInvestment.totalInvestment;

        // We iterate ONE continuous stream of months for exact dates
        const totalMonths = treeData.durationMonths;
        for (let absM = 0; absM < totalMonths; absM++) {
            const simY = Math.floor(absM / 12);
            const simM = absM % 12;
            const { year, month } = getCalendarDate(simY, simM);

            const rev = investorMonthlyRevenue[year]?.[month] || 0;
            /* CPF */
            const cpf = (monthlyCPFCost[year]?.[month] || 0) * units;
            /* CGF */
            const cgf = calculateMonthlyCGF(simY, simM) * units;

            cumRev += (rev - cpf - cgf);

            // --- Total Value Break Even Check (Asset + Revenue) ---
            const currentAssetValue = calculateTotalAssetValueForMonth(year, month);
            const currentTotalValue = cumRev + currentAssetValue;

            if (currentTotalValue >= initialInv && !exactBreakEvenDateWithCPF) {
                breakEvenYearWithCPF = year;
                breakEvenMonthWithCPF = month;
                exactBreakEvenDateWithCPF = new Date(year, month + 1, 0); // End of month
                // If break even happens in month 0 (Jan), this date will be Jan 31st.
            }

            // --- Revenue Only Break Even Check ---
            if (cumRev >= initialInv && !revenueBreakEvenYearWithCPF) {
                revenueBreakEvenYearWithCPF = year;
                revenueBreakEvenMonthWithCPF = month;
                // Date logic...
                const d = new Date(year, month + 1, 0);
                revenueExactBreakEvenDateWithCPF = d;
            }
        }

        // 2. Table Data Aggregation
        let tableRevenueBreakEvenYearWithCPF: any = null;
        let runningCumulativeRevenue = 0;

        // Asset Value Calculation Helper (Projected at end of Sim Year)
        const calculateAssetAtSimYearEnd = (simYear: number) => {
            const monthsPassed = Math.min((simYear + 1) * 12, treeData.durationMonths);
            const { year, month } = getCalendarDate(0, monthsPassed - 1);
            return calculateTotalAssetValueForMonth(year, month);
        };

        const yearsToSimulate = Math.ceil(treeData.durationMonths / 12);
        for (let i = 0; i < yearsToSimulate; i++) {
            let annualRevenue = 0;
            let annualCPF = 0;
            let annualCGF = 0;

            // For the last year, only sum months within durationMonths
            const monthsThisYear = Math.min(12, treeData.durationMonths - i * 12);

            // Sum months (truncated for final partial year)
            for (let m = 0; m < monthsThisYear; m++) {
                const { year, month } = getCalendarDate(i, m);
                /* Revenue */
                const rev = investorMonthlyRevenue[year]?.[month] || 0;
                annualRevenue += rev;
                /* CPF */
                const cpfMonth = (monthlyCPFCost[year]?.[month] || 0) * units;
                annualCPF += cpfMonth;
                /* CGF */
                const cgfMonth = (monthlyCGFCost[year]?.[month] || 0);
                annualCGF += cgfMonth;
            }

            const annualNet = annualRevenue - annualCPF - annualCGF;
            runningCumulativeRevenue += annualNet;

            const yearEndAsset = calculateAssetAtSimYearEnd(i);
            const totalValue = runningCumulativeRevenue + yearEndAsset;

            // Check Break Even (Asset + Rev) - Total Value
            // Use the precise year calculated from the monthly loop
            let isBE = false;
            if (breakEvenYearWithCPF === (treeData.startYear + i)) {
                isBE = true;
            }

            // If we somehow missed it (fallback) or for logic completeness:
            if (totalValue >= initialInv && !breakEvenYearWithCPF) {
                breakEvenYearWithCPF = treeData.startYear + i;
                isBE = true;
            }

            // Check Revenue Break Even (Table Consistent)
            if (runningCumulativeRevenue >= initialInv && !tableRevenueBreakEvenYearWithCPF) {
                tableRevenueBreakEvenYearWithCPF = treeData.startYear + i;
            }

            // Stats
            const recPct = (totalValue / initialInv) * 100;
            let status = "In Progress";
            if (recPct >= 100) status = "✔ Break-Even";
            else if (recPct >= 75) status = "75% Recovered";
            else if (recPct >= 50) status = "50% Recovered";

            breakEvenData.push({
                year: treeData.startYear + i,
                displayLabel: getSimulationYearLabel(i),
                annualRevenueWithCPF: annualNet, // Net Rev
                cpfCost: annualCPF, // Already scaled inside loop
                cgfCost: annualCGF, // Already scaled inside loop
                cumulativeRevenueWithCPF: runningCumulativeRevenue,
                assetValue: yearEndAsset,
                totalValueWithCPF: totalValue,
                recoveryPercentageWithCPF: recPct,
                revenueOnlyPercentageWithCPF: (runningCumulativeRevenue / initialInv) * 100, // Added precise calc
                statusWithCPF: status,
                revenueOnlyStatusWithCPF: 'In Progress',
                isBreakEvenWithCPF: isBE,
                isRevenueBreakEvenWithCPF: tableRevenueBreakEvenYearWithCPF === (treeData.startYear + i), // Correctly Flag Row based on Table Data
                totalBuffaloes: 0,
                matureBuffaloes: 0
            });
        }

        return {
            breakEvenData,
            breakEvenYearWithCPF,
            breakEvenMonthWithCPF,
            exactBreakEvenDateWithCPF,
            revenueBreakEvenYearWithCPF: revenueBreakEvenYearWithCPF, // Use precise calendar year
            revenueBreakEvenMonthWithCPF,
            revenueExactBreakEvenDateWithCPF,
            initialInvestment: initialInvestment.totalInvestment,
            finalCumulativeRevenueWithCPF: breakEvenData.length > 0 ? breakEvenData[breakEvenData.length - 1].cumulativeRevenueWithCPF : 0
        };
    }, [treeData.durationMonths, treeData.startYear, treeData.startMonth, treeData.years, buffaloDetails, initialInvestment, investorMonthlyRevenue, monthlyCPFCost, isCGFEnabled]);

    const assetMarketValue = useMemo(() => {
        const assetValues: any[] = [];
        // Correctly calculate end year including partial years (same as index.jsx)
        const absoluteStartMonth = treeData.startYear * 12 + (treeData.startMonth || 0);
        const yearsToSimulate = Math.ceil(treeData.durationMonths / 12);

        for (let i = 0; i < yearsToSimulate; i++) {
            let totalAssetValue = 0;

            // Target absolute month is the end of this simulation year (12 months passed)
            // For the final year, it strictly caps at the duration.
            const monthsPassed = Math.min((i + 1) * 12, treeData.durationMonths);
            const absoluteTargetMonth = absoluteStartMonth + monthsPassed - 1;

            const targetYear = Math.floor(absoluteTargetMonth / 12);
            const targetMonth = absoluteTargetMonth % 12;

            const ageCategories: any = {
                '0-12 months': { count: 0, value: 0 },
                '13-18 months': { count: 0, value: 0 },
                '19-24 months': { count: 0, value: 0 },
                '25-34 months': { count: 0, value: 0 },
                '35-40 months': { count: 0, value: 0 },
                '41+ months': { count: 0, value: 0 }
            };

            Object.values(buffaloDetails).forEach((buffalo: any) => {
                const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                const absoluteBirthMonth = buffalo.birthYear * 12 + birthMonth;

                // Only count buffaloes born before or exactly at the target absolute month
                if (absoluteBirthMonth <= absoluteTargetMonth) {
                    const ageInMonths = calculateAgeInMonths(buffalo, targetYear, targetMonth);
                    let value = getBuffaloValueByAge(ageInMonths);

                    // Consistency Override: 0-12 months value is 0 in the first year only
                    if (i === 0 && ageInMonths <= 12) {
                        value = 0;
                    }

                    totalAssetValue += value;

                    if (ageInMonths >= 41) {
                        ageCategories['41+ months'].count++;
                        ageCategories['41+ months'].value += value;
                    } else if (ageInMonths >= 35) {
                        ageCategories['35-40 months'].count++;
                        ageCategories['35-40 months'].value += value;
                    } else if (ageInMonths >= 25) {
                        ageCategories['25-34 months'].count++;
                        ageCategories['25-34 months'].value += value;
                    } else if (ageInMonths >= 19) {
                        ageCategories['19-24 months'].count++;
                        ageCategories['19-24 months'].value += value;
                    } else if (ageInMonths >= 13) {
                        ageCategories['13-18 months'].count++;
                        ageCategories['13-18 months'].value += value;
                    } else {
                        ageCategories['0-12 months'].count++;
                        ageCategories['0-12 months'].value += value;
                    }
                }
            });

            // Map data from yearlyData correctly based on the index / year.
            // yearlyData is also generated per calendar year, but for display let's mirror it
            const displayYear = treeData.startYear + i;
            const yearData = yearlyData.find((d: any) => d.year === displayYear) || yearlyData[yearlyData.length - 1];

            assetValues.push({
                year: displayYear, // Required for 'selectedYear' matching
                totalBuffaloes: (Object.values(ageCategories) as any[]).reduce((sum: any, cat: any) => sum + cat.count, 0) * Number(treeData.units || 1), // Exact count at this point
                ageCategories: Object.keys(ageCategories).reduce((acc: any, key: string) => {
                    const group = ageCategories[key];
                    const units = Number(treeData.units || 1);
                    acc[key] = {
                        count: group.count * units,
                        value: group.value * units
                    };
                    return acc;
                }, {}),
                totalAssetValue: totalAssetValue * Number(treeData.units || 1),
                motherBuffaloes: ageCategories['41+ months'].count * Number(treeData.units || 1)
            });
        }

        return assetValues;
    }, [treeData.durationMonths, treeData.years, treeData.startYear, treeData.startMonth, buffaloDetails, yearlyData, treeData.units]);



    const calculateCumulativeRevenueUntilYear = (unit: number, selectedYear: number) => {
        const cumulativeRevenue: any = {};
        const unitBuffaloes = Object.values(buffaloDetails as Record<string, any>).filter((buffalo: any) => buffalo.unit === unit);

        unitBuffaloes.forEach((buffalo: any) => {
            let total = 0;
            for (let year = treeData.startYear; year <= selectedYear; year++) {
                for (let month = 0; month < 12; month++) {
                    total += monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id] || 0;
                }
            }
            cumulativeRevenue[buffalo.id] = total;
        });

        return Object.fromEntries(
            Object.entries(cumulativeRevenue).map(([id, val]) => [id, (val as number) * units])
        );
    };

    // Sync Header Stats - Use precise monthly loop matching MonthlyRevenueBreak's calculation
    React.useEffect(() => {
        if (typeof setHeaderStats === 'function' && yearlyDataWithCPF.length > 0) {
            // 1. Calculate Cumulative Financials using precise monthly loop
            let totalRevenue = 0;
            let totalCPF = 0;
            let totalCGF = 0;
            // Use yearsToSimulate * 12 to match MonthlyRevenueBreak's loop structure
            // (full 12 months per year, even for partial final year)
            const yearsToSimulate = Math.ceil(treeData.durationMonths / 12);
            const totalMonths = treeData.durationMonths;
            const simAbsStart = treeData.startYear * 12 + (treeData.startMonth || 0);

            for (let absM = 0; absM < totalMonths; absM++) {
                const currentAbsMonth = simAbsStart + absM;
                const year = Math.floor(currentAbsMonth / 12);
                const month = currentAbsMonth % 12;

                // Revenue
                totalRevenue += (investorMonthlyRevenue[year]?.[month] || 0);
                // CPF
                totalCPF += ((monthlyCPFCost[year]?.[month] || 0) * units);
                // CGF
                if (isCGFEnabled) {
                    totalCGF += (monthlyCGFCost[year]?.[month] || 0);
                }
            }

            const cumulativeNetRevenue = totalRevenue - totalCPF;
            const cumulativeNetRevenueWithCaring = cumulativeNetRevenue - totalCGF;

            // 2. Calculate Asset Value & Count at End of Simulation
            const absoluteEndMonth = simAbsStart + treeData.durationMonths - 1;
            const displayEndYear = Math.floor(absoluteEndMonth / 12);
            const endMonthOfSimulation = absoluteEndMonth % 12;
            const { totalValue, totalCount, buffaloesCount, calvesCount } = calculateDetailedAssetValue(displayEndYear, endMonthOfSimulation);

            setHeaderStats({
                cumulativeNetRevenue,
                cumulativeNetRevenueWithCaring,
                totalRevenue,
                totalAssetValue: totalValue,
                totalBuffaloes: totalCount,
                buffaloesCount,
                calvesCount,
                endYear: displayEndYear
            });

        }
    }, [yearlyDataWithCPF, treeData.durationMonths, treeData.startYear, treeData.startMonth, setHeaderStats, units, isCGFEnabled, buffaloDetails, investorMonthlyRevenue, monthlyCPFCost]);

    const calculateTotalCumulativeRevenueUntilYear = (unit: number, selectedYear: number) => {
        const cumulativeRevenue = calculateCumulativeRevenueUntilYear(unit, selectedYear);
        return Object.values(cumulativeRevenue as Record<string, any>).reduce((sum: number, revenue: any) => sum + (revenue as number), 0);
    };

    const downloadFullReport = () => {
        const selectedUnit = 1; // Assuming primary unit for full report
        const allBuffaloes = Object.values(buffaloDetails).filter((b: any) => (b as any).unit === selectedUnit);
        const data: any[][] = [];

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

        const isCpfApplicableForMonth = (buffalo: any, yearIndex: number, monthIndexInSim: number) => {
            const { absMonth } = getCalendarDate(yearIndex, monthIndexInSim);
            const absoluteStartMonth = treeData.startYear * 12 + (treeData.startMonth || 0);
            const absoluteEndMonth = absoluteStartMonth + (treeData.durationMonths) - 1;
            if (absMonth < absoluteStartMonth || absMonth > absoluteEndMonth) return false;
            const isFirstInUnit = (buffalo.id.charCodeAt(0) - 65) % 2 === 0;
            if (buffalo.generation === 0) {
                const monthsSinceStart = absMonth - absoluteStartMonth;
                if (isFirstInUnit) return monthsSinceStart >= 12;
                else {
                    const isPresent = (treeData.startYear + yearIndex > treeData.startYear || (treeData.startYear + yearIndex === treeData.startYear && monthIndexInSim >= buffalo.acquisitionMonth));
                    if (isPresent) {
                        const isFreePeriod = monthsSinceStart >= 6 && monthsSinceStart < 18;
                        return !isFreePeriod;
                    }
                }
            } else {
                const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                const ageInMonths = ((Math.floor(absMonth / 12) - buffalo.birthYear) * 12) + ((absMonth % 12) - birthMonth);
                return ageInMonths >= 24;
            }
            return false;
        };

        const calculateMonthlyCGF = (yIndex: number, mIndex: number) => {
            let monthlyCGF = 0;
            const { absMonth } = getCalendarDate(yIndex, mIndex);
            allBuffaloes.forEach((buffalo: any) => {
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

        const formatMonthDateRangeLocal = (year: number, month: number, startDay: number) => {
            const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const startDate = new Date(year, month, startDay);
            const endDate = new Date(year, month + 1, startDay - 1);
            return `${startDate.getDate()} ${monthsShort[startDate.getMonth()]} ${startDate.getFullYear()} - ${endDate.getDate()} ${monthsShort[endDate.getMonth()]} ${endDate.getFullYear()}`;
        };

        for (let yIdx = 0; yIdx < treeData.years; yIdx++) {
            const currentSimYear = treeData.startYear + yIdx;
            const buffaloesInYear = allBuffaloes.filter((buffalo: any) => {
                const { year, month } = getCalendarDate(yIdx, 11);
                let isPresent = false;
                if (buffalo.generation === 0) {
                    isPresent = year > treeData.startYear || (year === treeData.startYear && month >= (buffalo.acquisitionMonth || 0));
                } else {
                    const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
                    const birthAbsolute = buffalo.birthYear * 12 + birthMonth;
                    const currentAbsolute = year * 12 + month;
                    isPresent = currentAbsolute >= birthAbsolute;
                }
                return isPresent;
            });

            data.push([`Year ${yIdx + 1} Report (${currentSimYear})`]);
            const header = ["Month"];
            buffaloesInYear.forEach((buffalo: any) => header.push(`Buffalo ${buffalo.id} revenue`));
            header.push("Total Revenue", "CPF", "CGF", "Net");
            data.push(header);

            let yearlyUnitTotal = 0;
            let yearlyCPFTotal = 0;
            let yearlyCGFTotal = 0;
            let yearlyNetTotal = 0;

            Array.from({ length: 12 }).forEach((_, mIndex) => {
                const { year, month, absMonth } = getCalendarDate(yIdx, mIndex);
                const absStart = (treeData.startYear * 12 + (treeData.startMonth || 0));
                const absEnd = absStart + (treeData.durationMonths || (treeData.years * 12)) - 1;
                if (absMonth < absStart || absMonth > absEnd) return;

                const row: any[] = [formatMonthDateRangeLocal(year, month, treeData.startDay || 1)];
                let monthlyUnitTotal = 0;
                buffaloesInYear.forEach((buffalo: any) => {
                    const revenue = Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0;
                    row.push(Math.round(revenue));
                    monthlyUnitTotal += revenue;
                });

                let monthlyCPF = 0;
                buffaloesInYear.forEach((buffalo: any) => {
                    if (isCpfApplicableForMonth(buffalo, yIdx, mIndex)) monthlyCPF += (15000 / 12);
                });

                const monthlyCGF = calculateMonthlyCGF(yIdx, mIndex) * treeData.units;
                const monthlyNet = monthlyUnitTotal - (monthlyCPF * treeData.units) - monthlyCGF;
                row.push(Math.round(monthlyUnitTotal), Math.round(monthlyCPF * treeData.units), Math.round(monthlyCGF), Math.round(monthlyNet));
                data.push(row);

                yearlyUnitTotal += monthlyUnitTotal;
                yearlyCPFTotal += (monthlyCPF * treeData.units);
                yearlyCGFTotal += monthlyCGF;
                yearlyNetTotal += monthlyNet;
            });

            const yearlySummaryRow: any[] = [`Year ${yIdx + 1} Total`];
            buffaloesInYear.forEach((buffalo: any) => {
                let buffaloYearly = 0;
                Array.from({ length: 12 }).forEach((_, mIndex) => {
                    const { year, month } = getCalendarDate(yIdx, mIndex);
                    buffaloYearly += Number(monthlyRevenue[year]?.[month]?.buffaloes[buffalo.id]) || 0;
                });
                yearlySummaryRow.push(Math.round(buffaloYearly));
            });
            yearlySummaryRow.push(Math.round(yearlyUnitTotal), Math.round(yearlyCPFTotal), Math.round(yearlyCGFTotal), Math.round(yearlyNetTotal));
            data.push(yearlySummaryRow);
            data.push([]); data.push([]);
        }

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "10-Year Report");
        XLSX.writeFile(wb, `Unit-Full-Report.xlsx`);
    };


    // Calculate dynamic year ranges
    // Calculate dynamic year ranges
    // const startYear = treeData.startYear; // startYear is already in scope from state
    const endYear = startYear + treeData.years - 1;
    const yearRange = `${startYear}-${endYear}`;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const TAB_CONFIG = [
        { id: "Monthly Revenue Break", icon: Calendar, label: "Monthly Revenue", showYearSelector: true },
        { id: "Revenue Break Even", icon: Target, label: "Break Even Analysis", showYearSelector: false },
        { id: "Asset Market Value", icon: TrendingUp, label: "Asset Valuation", showYearSelector: true },
        { id: "Herd Performance", icon: Activity, label: "Herd Performance", showYearSelector: false },
        { id: "Annual Herd Revenue", icon: PieChart, label: "Annual Revenue", showYearSelector: false },
        { id: "Break Even Timeline", icon: Clock, label: "Break Even Timeline", showYearSelector: false },
        { id: "Cattle Growing Fund", icon: Sprout, label: "Annual CGF Cost", showYearSelector: true },
        { id: "CPF + CGF", icon: Calculator, label: "CPF + CGF Analysis", showYearSelector: true }
    ];

    if (!propTreeData?.revenueData) {
        return (
            <div className="fixed inset-0 bg-white z-50 overflow-auto flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="text-2xl text-red-500 mb-4">Revenue data not available</div>
                    <button
                        onClick={onBack}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden relative bg-slate-50">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-[60] shadow-sm">
                <div className="flex flex-col items-center py-1 max-w-7xl mx-auto">
                    {/* Tabs - Single Row, Scroll if needed but hidden bar */}
                    <div className="flex justify-start px-3 gap-1 overflow-x-auto overflow-y-hidden max-w-full pr-5 pb-2 whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                        {TAB_CONFIG.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border flex-shrink-0
                                      ${isActive
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Integrated Year Selector & CPF Toggle (Bottom Row) */}
                    {TAB_CONFIG.find(t => t.id === activeTab)?.showYearSelector && (
                        <div className="pt-[2px] flex-shrink-0 animate-fade-in-up flex items-center justify-center gap-4">
                            <div className="bg-slate-50 rounded-full px-3 py-1.5 border border-slate-200 flex items-center gap-3 hover:bg-white transition-colors cursor-pointer group shadow-sm">
                                <div className="flex items-center gap-2 pl-1 border-r border-slate-200 pr-3">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-indigo-500 transition-colors">Year</span>
                                </div>
                                <div className="relative flex items-center">
                                    <select
                                        value={globalYearIndex}
                                        onChange={(e) => setGlobalYearIndex(parseInt(e.target.value))}
                                        className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer min-w-[140px] appearance-none hover:text-indigo-600 transition-colors text-center pr-6"
                                        style={{ backgroundImage: 'none' }}
                                    >
                                        {Array.from({ length: Math.ceil(treeData.durationMonths / 12) }, (_, i) => {
                                            const simAbsStart = (treeData.startYear * 12 + (treeData.startMonth || 0));
                                            const simAbsEnd = simAbsStart + treeData.durationMonths - 1;

                                            const startAbs = simAbsStart + (i * 12);
                                            const sYear = Math.floor(startAbs / 12);
                                            const sMonth = startAbs % 12;
                                            const sDate = new Date(sYear, sMonth, treeData.startDay || 1);

                                            // Cap end at simulation boundary for the last year
                                            const endAbs = Math.min(startAbs + 11, simAbsEnd);
                                            const eYear = Math.floor(endAbs / 12);
                                            const eMonth = endAbs % 12;
                                            const eDate = new Date(eYear, eMonth, treeData.startDay || 1);

                                            const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
                                            const startStr = sDate.toLocaleDateString('en-GB', options);
                                            const endStr = eDate.toLocaleDateString('en-GB', options);

                                            return (
                                                <option key={i} value={i}>
                                                    {startStr} - {endStr}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                            <button
                                onClick={downloadFullReport}
                                className="bg-white hover:bg-slate-50 text-indigo-600 px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm border border-slate-200 active:scale-95 group"
                                title={`Download Full ${treeData.years}-Year Report`}
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">Full Report</span>
                            </button>



                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto bg-slate-50 transition-all duration-300 relative"
            >

                {/* Dashboard Header */}


                <div className="w-full max-w-7xl mx-auto px-2 sm:px-8 pt-2 pb-8">



                    <div className='w-full'>
                        {activeTab === "Monthly Revenue Break" && (
                            <MonthlyRevenueBreak
                                key={`${activeTab}-${treeData.startYear}-${treeData.startMonth}`}
                                treeData={treeData}
                                buffaloDetails={buffaloDetails}
                                monthlyRevenue={monthlyRevenue}
                                calculateAgeInMonths={calculateAgeInMonths}
                                calculateCumulativeRevenueUntilYear={calculateCumulativeRevenueUntilYear}
                                calculateTotalCumulativeRevenueUntilYear={calculateTotalCumulativeRevenueUntilYear}
                                monthNames={monthNames}
                                formatCurrency={formatCurrency}
                                selectedYearIndex={globalYearIndex}
                                isCGFEnabled={isCGFEnabled}
                            />
                        )}



                        {activeTab === "Cattle Growing Fund" && (
                            <CattleGrowingFund
                                key={`${activeTab}-${treeData.startYear}-${treeData.startMonth}`}
                                treeData={treeData}
                                buffaloDetails={buffaloDetails}
                                yearlyCPFCost={yearlyCPFCost}
                                monthlyRevenue={monthlyRevenue}
                                yearlyData={yearlyData}
                                formatCurrency={formatCurrency}
                                startYear={startYear}
                                endYear={startYear + Math.ceil(treeData.durationMonths / 12)}
                                endMonth={(treeData.startMonth + (treeData.durationMonths) - 1) % 12}
                                selectedYearIndex={globalYearIndex}
                            />
                        )}

                        {activeTab === "CPF + CGF" && (
                            <CpfCgfCombined
                                key={`${activeTab}-${treeData.startYear}-${treeData.startMonth}`}
                                treeData={treeData}
                                buffaloDetails={buffaloDetails}
                                formatCurrency={formatCurrency}
                                calculateAgeInMonths={calculateAgeInMonths}
                                monthNames={monthNames}
                                startYear={startYear}
                                endYear={startYear + Math.ceil(treeData.durationMonths / 12)}
                                endMonth={(treeData.startMonth + (treeData.durationMonths) - 1) % 12}
                                selectedYearIndex={globalYearIndex}
                            />
                        )}


                        {activeTab === "Revenue Break Even" && (
                            <RevenueBreakEven
                                key={`${activeTab}-${treeData.startYear}-${treeData.startMonth}`}
                                treeData={treeData}
                                initialInvestment={initialInvestment}
                                yearlyCPFCost={yearlyCPFCost}
                                breakEvenAnalysis={breakEvenAnalysis}
                                cpfToggle={cpfToggle}
                                setCpfToggle={setCpfToggle}
                                formatCurrency={formatCurrency}
                                formatNumber={formatNumber}
                                // Pass the revenue-only break-even dates
                                revenueBreakEvenYearWithCPF={breakEvenAnalysis.revenueBreakEvenYearWithCPF}
                                revenueBreakEvenMonthWithCPF={breakEvenAnalysis.revenueBreakEvenMonthWithCPF}
                                revenueExactBreakEvenDateWithCPF={breakEvenAnalysis.revenueExactBreakEvenDateWithCPF}
                                selectedYearIndex={globalYearIndex}
                                isCGFEnabled={isCGFEnabled}
                            />
                        )}

                        {activeTab === "Asset Market Value" && (
                            <AssetMarketValue
                                key={`${activeTab}-${treeData.startYear}-${treeData.startMonth}`}
                                treeData={treeData}
                                buffaloDetails={buffaloDetails}
                                calculateAgeInMonths={calculateAgeInMonths}
                                getBuffaloValueByAge={getBuffaloValueByAge}
                                getBuffaloValueDescription={getBuffaloValueDescription}
                                calculateDetailedAssetValue={calculateDetailedAssetValue}
                                assetMarketValue={assetMarketValue}
                                formatCurrency={formatCurrency}
                                startYear={startYear}
                                endYear={startYear + Math.ceil(treeData.durationMonths / 12)}
                                endMonth={(treeData.startYear * 12 + treeData.startMonth + (treeData.durationMonths) - 1) % 12}
                                yearRange={yearRange}
                                yearlyData={yearlyData}
                                monthlyRevenue={monthlyRevenue}
                                yearlyCPFCost={yearlyCPFCost}
                                selectedYear={startYear + globalYearIndex} // Added missing prop
                                selectedYearIndex={globalYearIndex}
                            />
                        )}

                        {activeTab === "Break Even Timeline" && (
                            <BreakEvenTimeline
                                treeData={treeData}
                                monthNames={monthNames}
                                formatCurrency={formatCurrency}
                                formatNumber={formatNumber}
                                yearRange={yearRange}
                                breakEvenAnalysis={breakEvenAnalysis}
                                assetMarketValue={assetMarketValue}
                                isCGFEnabled={isCGFEnabled}
                            />
                        )}

                        {activeTab === "Herd Performance" && (
                            <HerdPerformance
                                key={`${activeTab}-${treeData.startYear}-${treeData.startMonth}`}
                                yearlyData={yearlyDataWithCPF}
                                monthlyRevenue={monthlyRevenue}
                                selectedYearIndex={globalYearIndex}
                                activeGraph={activeGraph}
                                setActiveGraph={setActiveGraph}
                                startYear={startYear}
                                endYear={startYear + Math.ceil(treeData.durationMonths / 12) - 1}
                                yearRange={`${startYear}-${startYear + Math.ceil(treeData.durationMonths / 12) - 1}`}
                                breakEvenAnalysis={breakEvenAnalysis}
                                assetMarketValue={assetMarketValue}
                                treeData={treeData}
                            />
                        )}

                        {activeTab === "Annual Herd Revenue" && (
                            <AnnualHerdRevenue
                                cumulativeYearlyData={cumulativeYearlyData}
                                assetMarketValue={assetMarketValue}
                                formatCurrency={formatCurrency}
                                formatNumber={formatNumber}
                                treeData={treeData}
                                startYear={startYear}
                                endYear={startYear + Math.ceil(treeData.durationMonths / 12)}
                                yearRange={`${startYear}-${startYear + Math.ceil(treeData.durationMonths / 12)}`}
                            />
                        )}


                    </div>

                    {/* CPF Explanation Note - Sticky Footer */}
                    <div className="mt-8 border-t border-slate-200 bg-white/95 backdrop-blur-sm p-4 mb-8">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 shadow-sm">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <div>
                                <h3 className="text-sm font-semibold text-blue-900">Cattle Protection Fund (CPF): Income Guarantee & Asset Security</h3>
                                <p className="mt-1 text-sm text-blue-700 leading-relaxed">
                                    Your income is guaranteed through the Cattle Protection Fund. This safety measure secures your animals,
                                    decreases revenue risk, and ensures growing assets. It is a vital step for long-term stability.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CostEstimationTable;
