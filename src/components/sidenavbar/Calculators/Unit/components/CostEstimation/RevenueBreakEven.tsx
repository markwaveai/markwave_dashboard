import React from 'react';

const RevenueBreakEven: React.FC<any> = ({
    treeData,
    initialInvestment,
    yearlyCPFCost,
    breakEvenAnalysis,
    cpfToggle,
    setCpfToggle,
    formatCurrency,
    formatNumber,
    revenueBreakEvenYearWithoutCPF,
    revenueBreakEvenMonthWithoutCPF,
    revenueBreakEvenYearWithCPF,
    revenueBreakEvenMonthWithCPF,
    revenueExactBreakEvenDateWithoutCPF,
    revenueExactBreakEvenDateWithCPF,
    isCGFEnabled
}) => {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    // Calculate revenue-only break-even summary
    const calculateRevenueBreakEvenSummary = () => {
        const summary = {
            withoutCPF: {
                year: revenueBreakEvenYearWithoutCPF,
                month: revenueBreakEvenMonthWithoutCPF,
                date: revenueExactBreakEvenDateWithoutCPF,
                monthsToBreakEven:
                    revenueBreakEvenYearWithoutCPF && revenueBreakEvenMonthWithoutCPF !== null
                        ? (revenueBreakEvenYearWithoutCPF - treeData.startYear) * 12 +
                        revenueBreakEvenMonthWithoutCPF -
                        (treeData.startMonth || 0) +
                        1
                        : null,
                totalInvestment: initialInvestment.totalInvestment
            },
            withCPF: {
                year: revenueBreakEvenYearWithCPF,
                month: revenueBreakEvenMonthWithCPF,
                date: revenueExactBreakEvenDateWithCPF,
                monthsToBreakEven:
                    revenueBreakEvenYearWithCPF && revenueBreakEvenMonthWithCPF !== null
                        ? (revenueBreakEvenYearWithCPF - treeData.startYear) * 12 +
                        revenueBreakEvenMonthWithCPF -
                        (treeData.startMonth || 0) +
                        1
                        : null,
                totalInvestment: initialInvestment.totalInvestment
            }
        };
        return summary;
    };

    const revenueBreakEvenSummary = calculateRevenueBreakEvenSummary();

    const startMonthName = monthNames[treeData.startMonth || 0];
    const startDateString = `${startMonthName} ${treeData.startYear}`;

    // Function to calculate investment recovery status based on cumulative revenue
    const calculateInvestmentRecoveryStatus = (cumulativeRevenue: number, totalInvestment: number, isRevenueBreakEven: boolean) => {
        const recoveryPercentage = (cumulativeRevenue / totalInvestment) * 100;
        let status = "";
        if (isRevenueBreakEven || recoveryPercentage >= 100) {
            status = "Break-Even Achieved ✓";
        } else if (recoveryPercentage >= 75) {
            status = "75% Recovered";
        } else if (recoveryPercentage >= 50) {
            status = "50% Recovered";
        } else if (recoveryPercentage >= 25) {
            status = "25% Recovered";
        } else {
            status = "In Progress";
        }
        return { recoveryPercentage, status };
    };

    return (
        <div className="w-full mb-6 space-y-2">
            {/* Context Cards */}
            <div className="grid grid-cols-2 gap-2">
                {/* Initial Investment */}
                <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="text-center flex flex-col items-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Initial Investment</p>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(initialInvestment.totalInvestment)}</h3>
                    </div>
                </div>
                {/* Break Even Status */}
                <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Break-Even Point</p>
                        {revenueBreakEvenSummary.withCPF.date ? (
                            <div className="flex flex-col items-center">
                                <h3 className="text-base font-bold text-emerald-700 mt-0.5">
                                    {revenueBreakEvenSummary.withCPF.date.getDate()} {monthNames[revenueBreakEvenSummary.withCPF.date.getMonth()]} {revenueBreakEvenSummary.withCPF.date.getFullYear()}
                                </h3>
                                <p className="text-[9px] text-emerald-600 mt-0.5 font-semibold px-1 py-0.5 bg-emerald-50 rounded inline-block">
                                    {revenueBreakEvenSummary.withCPF.monthsToBreakEven} Months
                                </p>
                            </div>
                        ) : (
                            <h3 className="text-base font-bold text-slate-400 mt-0.5">Not Projected</h3>
                        )}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-600" />
                </div>
                {/* Unit Cost */}
                <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Unit Cost</p>
                        <h3 className="text-base font-bold text-slate-800 mt-0.5">{formatCurrency(initialInvestment.motherBuffaloCost)}</h3>
                    </div>
                </div>
                {/* Initial CPF */}
                <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative group">
                    <div className="text-center items-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-center gap-1">
                            Initial CPF
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-slate-800 text-white text-[10px] rounded px-2 py-1 z-10 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0">
                            First Year Coverage
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>

                        <h3 className="text-base font-bold text-slate-800 mt-0.5">{formatCurrency(initialInvestment.cpfCost)}</h3>
                    </div>
                </div>
            </div>
            {/* Break-Even Analysis Table */}
            <div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 w-1/4 text-center">Year</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 text-center w-1/4">Net Annual Revenue</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 text-center w-1/4">Cumulative Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {breakEvenAnalysis.breakEvenData.map((data: any, index: number) => {
                                const annualRevenue = data.annualRevenueWithCPF;
                                const cumulativeRevenue = data.cumulativeRevenueWithCPF;
                                const isRevenueBreakEven = data.isRevenueBreakEvenWithCPF;
                                const { recoveryPercentage, status } = calculateInvestmentRecoveryStatus(
                                    cumulativeRevenue,
                                    initialInvestment.totalInvestment,
                                    isRevenueBreakEven
                                );
                                return (
                                    <tr key={data.year} className={`hover:bg-slate-50 transition-colors ${isRevenueBreakEven ? 'bg-emerald-50/50' : 'bg-white'}`}>
                                        <td className="px-6 py-4 border-r border-slate-100 text-sm text-center">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">
                                                    {data.displayLabel || data.year}
                                                </span>
                                                {isRevenueBreakEven && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Break-Even</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-r border-slate-100 text-right">
                                            <div className="font-bold text-slate-700">{formatCurrency(annualRevenue)}</div>
                                            <div className="block text-[10px] text-amber-500 font-medium">CPF: -{formatNumber(data.cpfCost)}</div>
                                            {isCGFEnabled && (
                                                <div className="block text-[10px] text-rose-500 font-medium">CGF: -{formatNumber(data.cgfCost)}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 border-r border-slate-100 text-right">
                                            <div className={`font-bold ${isRevenueBreakEven ? 'text-emerald-600' : 'text-blue-600'}`}>{formatCurrency(cumulativeRevenue)}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueBreakEven;
