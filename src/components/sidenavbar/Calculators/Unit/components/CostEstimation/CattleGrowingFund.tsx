import React, { useState, useEffect, useMemo } from 'react';
import { formatMonthDateRange } from '../BuffaloFamilyTree/CommonComponents';

const CattleGrowingFund = ({
    treeData,
    buffaloDetails,
    yearlyCPFCost,
    monthlyRevenue,
    yearlyData,
    formatCurrency,
    startYear,
    endYear,
    endMonth,
    selectedYearIndex
}: any) => {
    const units = treeData.units || 1;
    // const [selectedYearIndex, setSelectedYearIndex] = useState(0); // Controlled by Parent
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Helper to calculate financials for a specific simulation year index (0-9)
    const calculateFinancialsForYear = (yearIndex: number) => {
        const costBrackets = [
            { label: "0-12 months", start: 0, end: 12, cost: 0 },
            { label: "13-18 months", start: 13, end: 18, cost: 6000 },
            { label: "19-24 months", start: 19, end: 24, cost: 8400 },
            { label: "25-30 months", start: 25, end: 30, cost: 10800 },
            { label: "31-36 months", start: 31, end: 36, cost: 15000 },
            { label: " 37+ months", start: 37, end: 999, cost: 0 }
        ];

        const startOfSimulationYear = treeData.startYear;
        const startOfSimulationMonth = treeData.startMonth || 0;

        const absoluteStartMonth = startOfSimulationYear * 12 + startOfSimulationMonth;
        const currentYearAbsoluteStart = absoluteStartMonth + (yearIndex * 12);
        const currentYearAbsoluteEnd = currentYearAbsoluteStart + 11;

        // Identify Children active in this "Simulation Year"
        const activeChildren = Object.values(buffaloDetails as Record<string, any>).filter((b: any) => {
            const birthTotalMonths = (b.birthYear as number) * 12 + (b.birthMonth as number || 0);
            return b.generation > 0 && birthTotalMonths <= currentYearAbsoluteEnd;
        }).sort((a: any, b: any) => a.id.localeCompare(b.id));

        const monthlyData = [];
        const childTotalCosts: Record<string, number> = {};
        const childActiveBrackets: Record<string, Set<string>> = {};
        activeChildren.forEach((c: any) => {
            childTotalCosts[c.id] = 0;
            childActiveBrackets[c.id] = new Set();
        });

        let totalYearlyCaringCost = 0;

        for (let m = 0; m < 12; m++) {
            const currentAbsoluteMonth = currentYearAbsoluteStart + m;
            const currentCalendarMonth = currentAbsoluteMonth % 12;

            const rowData: any = {
                monthName: formatMonthDateRange(Math.floor(currentAbsoluteMonth / 12), currentCalendarMonth, treeData.startDay || 1),
                costs: {},
                totalMonthlyCost: 0,
                isValidMonth: currentAbsoluteMonth < (treeData.startYear * 12 + treeData.startMonth + (treeData.durationMonths))
            };

            if (rowData.isValidMonth) {
                activeChildren.forEach((child: any) => {
                    const buffaloAbsoluteBirth = (child.birthYear as number) * 12 + (child.birthMonth as number || 0);
                    if (buffaloAbsoluteBirth <= currentAbsoluteMonth) {
                        const ageInMonths = (currentAbsoluteMonth - buffaloAbsoluteBirth) + 1;
                        const bracketIndex = costBrackets.findIndex((b: any) => ageInMonths >= b.start && ageInMonths <= b.end);
                        if (bracketIndex !== -1) {
                            const bracket = costBrackets[bracketIndex];
                            const shortLabel = bracket.label.replace(' months', 'm').replace('months', 'm');
                            childActiveBrackets[child.id].add(shortLabel);
                            let duration = bracket.end - bracket.start + 1;
                            if (bracket.end === 999) duration = 12;
                            const monthlyRate = (bracket.cost / duration) * units;
                            rowData.costs[child.id] = monthlyRate;
                            rowData.totalMonthlyCost += monthlyRate;
                            childTotalCosts[child.id] = (childTotalCosts[child.id] || 0) + monthlyRate;
                            totalYearlyCaringCost += monthlyRate;
                        } else {
                            rowData.costs[child.id] = 0;
                            if (costBrackets[0].cost === 0 && ageInMonths <= 12) {
                                const shortLabel = costBrackets[0].label.replace(' months', 'm').replace('months', 'm');
                                childActiveBrackets[child.id].add(shortLabel);
                            }
                        }
                    } else {
                        rowData.costs[child.id] = null;
                    }
                });
            } else {
                activeChildren.forEach((child: any) => rowData.costs[child.id] = 0);
            }
            monthlyData.push(rowData);
        }

        return { monthlyData, activeChildren, childTotalCosts, totalYearlyCaringCost, childActiveBrackets };
    };

    const {
        monthlyData,
        activeChildren,
        childTotalCosts,
        totalYearlyCaringCost,
        childActiveBrackets,
        totalAnnualRevenue,
        childCumulativeCosts,
        totalCumulativeCaringCost,
        totalCumulativeRevenue
    } = useMemo(() => {
        const stats = calculateFinancialsForYear(selectedYearIndex);

        // --- Annual Revenue ---
        let annRev = 0;
        const absStart = (treeData.startYear * 12 + (treeData.startMonth || 0)) + (selectedYearIndex * 12);
        for (let m = 0; m < 12; m++) {
            const abs = absStart + m;
            const y = Math.floor(abs / 12);
            const mo = abs % 12;
            if (monthlyRevenue && monthlyRevenue[y] && monthlyRevenue[y][mo]) {
                annRev += (monthlyRevenue[y][mo].total || 0);
            }
        }

        // --- Cumulative ---
        const cumChildCosts: Record<string, number> = {};
        let cumCaring = 0;
        let cumRev = 0;
        stats.activeChildren.forEach((child: any) => { cumChildCosts[child.id] = 0; });

        for (let yIndex = 0; yIndex <= selectedYearIndex; yIndex++) {
            const financials = calculateFinancialsForYear(yIndex);
            Object.entries(financials.childTotalCosts).forEach(([id, cost]: [string, any]) => {
                if (cumChildCosts[id] !== undefined) {
                    cumChildCosts[id] += cost;
                } else if (stats.activeChildren.find((c: any) => c.id === id)) {
                    cumChildCosts[id] = cost;
                }
            });
            cumCaring += financials.totalYearlyCaringCost;
            const absStartLoop = (treeData.startYear * 12 + (treeData.startMonth || 0)) + (yIndex * 12);
            for (let m = 0; m < 12; m++) {
                const abs = absStartLoop + m;
                const y = Math.floor(abs / 12);
                const mo = abs % 12;
                if (monthlyRevenue && monthlyRevenue[y]) {
                    cumRev += (monthlyRevenue[y][mo]?.total || 0);
                }
            }
        }

        return {
            ...stats,
            totalAnnualRevenue: annRev,
            childCumulativeCosts: cumChildCosts,
            totalCumulativeCaringCost: cumCaring,
            totalCumulativeRevenue: cumRev
        };
    }, [selectedYearIndex, buffaloDetails, treeData.startYear, treeData.startMonth, treeData.durationMonths, monthlyRevenue, units]);

    const revenue = totalAnnualRevenue;
    const netValue = revenue - totalYearlyCaringCost;

    return (
        <div className="w-full mb-6 space-y-2">
            {/* Top Stats Cards */}
            {/* Top Stats Cards */}
            <div className="flex justify-start">
                {/* Annual & Cumulative Caring Cost */}
                <div className="bg-white rounded-md p-4 border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between gap-8 min-w-[300px]">

                    {/* Annual */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Annual CGF Cost</p>
                        <div className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(totalYearlyCaringCost)}</div>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    {/* Cumulative */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cumulative Caring Cost</p>
                        <div className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(totalCumulativeCaringCost)}</div>
                    </div>

                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-4">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="sticky left-0 bg-slate-50 z-10 p-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 w-24">Month</th>
                                {activeChildren.map(c => (
                                    <th key={c.id} className="p-2 text-center border-r border-slate-200 last:border-r-0 min-w-[100px]">
                                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{c.id}</div>
                                        <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                                            {Array.from(childActiveBrackets[c.id] || []).map((b: any) => (
                                                <span key={b} className="text-[8px] bg-indigo-100 text-indigo-700 px-1 rounded font-bold uppercase">{b}</span>
                                            ))}
                                        </div>
                                        {c.units > 1 && (
                                            <div className="text-[8px] bg-slate-100 text-slate-700 px-1 rounded font-bold uppercase mt-1">
                                                ({c.units} units)
                                            </div>
                                        )}
                                    </th>
                                ))}
                                <th className="p-2 text-right text-[10px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100/50 min-w-[110px]">Monthly Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {monthlyData.map((row, idx) => (
                                <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${!row.isValidMonth ? 'opacity-40 grayscale pointer-events-none bg-slate-50/50' : ''}`}>
                                    <td className="sticky left-0 bg-white z-10 p-2 text-[11px] font-bold text-slate-700 border-r border-slate-200">{row.monthName}</td>
                                    {activeChildren.map(child => {
                                        const cost = row.costs[child.id];
                                        return (
                                            <td key={child.id} className="p-2 text-center text-[11px] border-r border-slate-200 last:border-r-0 font-medium">
                                                {cost === null ? (
                                                    <span className="text-slate-300 font-normal">-</span>
                                                ) : (
                                                    <span className={cost > 0 ? 'text-slate-900' : 'text-slate-400'}>
                                                        {cost > 0 ? formatCurrency(cost) : '₹0'}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="p-2 text-right text-[11px] font-bold text-slate-900 bg-slate-50/30">
                                        {formatCurrency(row.totalMonthlyCost)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 border-t border-slate-700">
                                <td className="sticky left-0 bg-slate-900 z-10 p-2 text-[10px] font-bold text-white uppercase tracking-wider border-r border-slate-700">Annual Total</td>
                                {activeChildren.map(child => (
                                    <td key={child.id} className="p-2 text-center text-[11px] font-bold text-white border-r border-slate-700 last:border-r-0">
                                        {formatCurrency(childTotalCosts[child.id] || 0)}
                                    </td>
                                ))}
                                <td className="p-2 text-right text-[11px] font-black text-white bg-slate-800">
                                    {formatCurrency(totalYearlyCaringCost)}
                                </td>
                            </tr>
                            <tr className="bg-white border-t border-slate-200">
                                <td className="sticky left-0 bg-white z-10 p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Asset Cost</td>
                                {activeChildren.map(child => (
                                    <td key={child.id} className="p-2 text-center text-[11px] font-bold text-indigo-600 border-r border-slate-200 last:border-r-0">
                                        {formatCurrency(childCumulativeCosts[child.id] || 0)}
                                    </td>
                                ))}
                                <td className="p-2 text-right text-[11px] font-black text-indigo-700 bg-slate-50/50">
                                    {formatCurrency(totalCumulativeCaringCost)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CattleGrowingFund;
