import React, { useState, useMemo } from 'react';
import { formatMonthDateRange } from '../BuffaloFamilyTree/CommonComponents';

const CpfCgfCombined = ({
    treeData,
    buffaloDetails,
    formatCurrency,
    calculateAgeInMonths,
    monthNames,
    startYear,
    endYear,
    endMonth,
    selectedYearIndex
}: any) => {
    const units = treeData.units || 1;
    // const [selectedYearIndex, setSelectedYearIndex] = useState(0);

    // Helper to resolve Calendar Year/Month from Simulation Year/Month
    const getCalendarDate = (yearIndex: number, monthIndexInSim: number) => {
        const absStart = (startYear * 12 + (treeData.startMonth || 0));
        const absTarget = absStart + (yearIndex * 12) + monthIndexInSim;
        return {
            year: Math.floor(absTarget / 12),
            month: absTarget % 12,
            absMonth: absTarget
        };
    };

    // --- Helper Logic ---

    // 1. CGF Logic (Caring Cost)
    const calculateCgfForMonth = (yearIndex: number, monthIndex: number) => {
        let totalCost = 0;
        const { absMonth: currentAbsoluteMonth } = getCalendarDate(yearIndex, monthIndex);

        // Filter children (Gen > 0)
        Object.values(buffaloDetails as Record<string, any>).forEach((buffalo: any) => {
            if (buffalo.generation > 0) {
                const buffaloAbsoluteBirth = (buffalo.birthYear as number) * 12 + (buffalo.birthMonth as number || 0);

                if (buffaloAbsoluteBirth <= currentAbsoluteMonth) {
                    const ageInMonths = (currentAbsoluteMonth - buffaloAbsoluteBirth) + 1;

                    let monthlyCost = 0;
                    if (ageInMonths > 12 && ageInMonths <= 18) monthlyCost = 1000;
                    else if (ageInMonths > 18 && ageInMonths <= 24) monthlyCost = 1400;
                    else if (ageInMonths > 24 && ageInMonths <= 30) monthlyCost = 1800;
                    else if (ageInMonths > 30 && ageInMonths <= 36) monthlyCost = 2500;

                    totalCost += monthlyCost * units;
                }
            }
        });
        return totalCost;
    };

    // 2. CPF Logic
    const isCpfApplicableForMonth = (buffalo: any, yearIndex: number, monthIndex: number) => {
        // Global Limit Check
        const absoluteStart = startYear * 12 + (treeData.startMonth || 0);
        const absoluteEnd = absoluteStart + (treeData.durationMonths) - 1;
        const { year, month, absMonth: currentAbsolute } = getCalendarDate(yearIndex, monthIndex);

        if (currentAbsolute < absoluteStart || currentAbsolute > absoluteEnd) return false;

        // Gen 0
        if (buffalo.generation === 0) {
            const isFirstInUnit = (buffalo.id.charCodeAt(0) - 65) % 2 === 0; // A, C, E...

            // Presence Check
            const buffaloAbsoluteAcq = (buffalo.absoluteAcquisitionMonth as number) !== undefined
                ? (buffalo.absoluteAcquisitionMonth as number)
                : (startYear * 12 + (buffalo.acquisitionMonth as number || 0)); // Fallback approximation

            if (currentAbsolute < buffaloAbsoluteAcq) return false;

            if (isFirstInUnit) {
                // Type A: Free Period for first 12 months (Sync with global logic)
                const monthsSinceStart = currentAbsolute - absoluteStart;
                if (monthsSinceStart >= 12) {
                    return true;
                }
                return false;
            } else {
                // Type B: Free Period Check (Months 6-17 relative to simulation start)
                const monthsSinceStart = currentAbsolute - absoluteStart;
                const isFreePeriod = monthsSinceStart >= 6 && monthsSinceStart < 18;
                return !isFreePeriod;
            }
        } else {
            // Offspring: Pay >= 24 months
            const ageInMonths = calculateAgeInMonths(buffalo, year, month);
            return ageInMonths >= 24;
        }
    };

    const calculateCpfForMonth = (yearIdx: number, monthIdx: number) => {
        const CPF_PER_MONTH = 15000 / 12;
        let totalMonthlyCPF = 0;

        const allBuffaloes = Object.values(buffaloDetails as Record<string, any>);

        allBuffaloes.forEach((buffalo: any) => {
            if (isCpfApplicableForMonth(buffalo, yearIdx, monthIdx)) {
                totalMonthlyCPF += CPF_PER_MONTH * units;
            }
        });

        return totalMonthlyCPF;
    };

    // --- Generate Table & Cumulative Data ---
    const { tableData, yearlyCgf, yearlyCpf, yearlyTotal, cumulativeCgf, cumulativeCpf, cumulativeTotal } = useMemo(() => {
        const tData = [];
        let yCgf = 0;
        let yCpf = 0;
        let yTotal = 0;

        for (let m = 0; m < 12; m++) {
            const { absMonth, month, year } = getCalendarDate(selectedYearIndex, m);
            const globalEnd = startYear * 12 + (treeData.startMonth || 0) + (treeData.durationMonths) - 1;
            const isValid = absMonth <= globalEnd;

            const cgf = isValid ? calculateCgfForMonth(selectedYearIndex, m) : 0;
            const cpf = isValid ? calculateCpfForMonth(selectedYearIndex, m) : 0;
            const total = cgf + cpf;

            yCgf += cgf;
            yCpf += cpf;
            yTotal += total;

            tData.push({
                monthName: formatMonthDateRange(year, month, treeData.startDay || 1),
                isValid,
                cgf,
                cpf,
                total
            });
        }

        // Cumulative
        let cCgf = 0;
        let cCpf = 0;
        for (let yIndex = 0; yIndex <= selectedYearIndex; yIndex++) {
            for (let m = 0; m < 12; m++) {
                const { absMonth } = getCalendarDate(yIndex, m);
                const globalEnd = startYear * 12 + (treeData.startMonth || 0) + (treeData.durationMonths) - 1;

                if (absMonth <= globalEnd) {
                    cCgf += calculateCgfForMonth(yIndex, m);
                    cCpf += calculateCpfForMonth(yIndex, m);
                }
            }
        }

        return {
            tableData: tData,
            yearlyCgf: yCgf,
            yearlyCpf: yCpf,
            yearlyTotal: yTotal,
            cumulativeCgf: cCgf,
            cumulativeCpf: cCpf,
            cumulativeTotal: cCgf + cCpf
        };
    }, [selectedYearIndex, buffaloDetails, startYear, treeData.startMonth, treeData.durationMonths]);

    return (
        <div className="w-full mb-6 space-y-2">

            {/* 1. Top Summary Cards - KPI Grid */}
            <div className="grid grid-cols-3 gap-2">
                {/* Cumulative CPF */}
                <div className="bg-white rounded-md p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cumulative CPF Cost</p>
                        <h3 className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(cumulativeCpf)}</h3>
                    </div>
                </div>

                {/* Cumulative CGF */}
                <div className="bg-white rounded-md p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cumulative CGF Cost</p>
                        <h3 className="text-lg font-bold text-rose-600 mt-1">{formatCurrency(cumulativeCgf)}</h3>
                    </div>
                </div>

                {/* Combined Total */}
                <div className="bg-white rounded-md p-3 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Combined Cumulative Total</p>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(cumulativeTotal)}</h3>
                    </div>
                </div>
            </div>

            {/* 3. Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-base text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase">
                            <tr>
                                <th className="py-5 px-6 font-bold border-r border-slate-100 w-32 min-w-[8rem] text-center">Month</th>
                                <th className="py-5 px-6 font-bold text-amber-700 text-center border-r border-slate-100 whitespace-nowrap">CPF Cost</th>
                                <th className="py-5 px-6 font-bold text-rose-700 text-center border-r border-slate-100 whitespace-nowrap">CGF Cost</th>
                                <th className="py-5 px-6 font-bold text-slate-800 text-center whitespace-nowrap">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tableData.map((row: any, idx: number) => (
                                <React.Fragment key={idx}>
                                    <tr className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="py-4 px-6 font-medium text-slate-900 border-r border-slate-100 bg-slate-50/30 whitespace-nowrap text-center">{row.monthName}</td>
                                        <td className="py-4 px-6 text-center text-amber-700 font-medium border-r border-slate-100 whitespace-nowrap">{row.isValid ? formatCurrency(row.cpf) : '-'}</td>
                                        <td className="py-4 px-6 text-center text-rose-700 font-medium border-r border-slate-100 whitespace-nowrap">{row.isValid ? formatCurrency(row.cgf) : '-'}</td>
                                        <td className="py-4 px-6 text-center text-slate-900 font-bold whitespace-nowrap">{row.isValid ? formatCurrency(row.total) : '-'}</td>
                                    </tr>
                                    {(idx + 1) % 3 === 0 && idx < 11 && (
                                        <tr className="bg-slate-100/30">
                                            <td colSpan={4} className="h-1 p-0"></td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-800 text-white border-t border-slate-700">
                            <tr>
                                <td className="py-5 px-6 font-bold text-center border-r border-slate-700">Year Total</td>
                                <td className="py-5 px-6 text-center font-bold text-amber-300 border-r border-slate-700 whitespace-nowrap">{formatCurrency(yearlyCpf)}</td>
                                <td className="py-5 px-6 text-center font-bold text-rose-300 border-r border-slate-700 whitespace-nowrap">{formatCurrency(yearlyCgf)}</td>
                                <td className="py-5 px-6 text-center font-bold text-white whitespace-nowrap">{formatCurrency(yearlyTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="text-xs text-center text-slate-400">Shows combined monthly expenses for Cattle Growing Fund (Care) and CPF (Insurance/Fee).</div>
        </div>
    );
};

export default CpfCgfCombined;
