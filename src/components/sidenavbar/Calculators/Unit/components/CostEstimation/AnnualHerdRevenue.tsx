
import React from 'react';
import { Calendar, Users, IndianRupee, ArrowUpRight, Wallet } from 'lucide-react';

const AnnualHerdRevenue = ({
    cumulativeYearlyData,
    assetMarketValue,
    formatCurrency,
    formatNumber,
    treeData,
    startYear,
    endYear,
    yearRange
}: any) => {
    return (
        <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Wallet className="text-indigo-600" size={16} />
                            Annual Revenue Analysis
                        </h2>

                    </div>
                </div>


                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-slate-600 text-[10px] sm:text-sm w-[35%] sm:w-auto text-center">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Calendar size={14} className="text-slate-400 hidden sm:block" />
                                        Year
                                    </div>
                                </th>
                                <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-slate-600 text-[10px] sm:text-sm text-center w-[20%] sm:w-auto">
                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                        <Users size={14} className="text-slate-400 hidden sm:block" />
                                        Herd
                                    </div>
                                </th>
                                <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-slate-600 text-[10px] sm:text-sm text-center w-[45%] sm:w-auto">
                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                        <IndianRupee size={14} className="text-slate-400 hidden sm:block" />
                                        Net Revenue
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cumulativeYearlyData.map((data: any, index: number) => {
                                const annualRevenue = data.revenueWithCPF;
                                const prevRevenue = index > 0 ? cumulativeYearlyData[index - 1].revenueWithCPF : 0;
                                const growthRate = index > 0 && prevRevenue > 0
                                    ? ((annualRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
                                    : 0;

                                return (
                                    <tr key={data.year} className="hover:bg-indigo-50/30 transition-colors duration-150">
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                            <div>
                                                <p className="font-semibold text-slate-800 text-[10px] sm:text-sm">{data.displayLabel || data.year}</p>
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium bg-slate-100 text-slate-800 whitespace-nowrap">
                                                {formatNumber(data.totalBuffaloes)}
                                            </span>
                                        </td>
                                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-emerald-700 text-xs sm:text-base">
                                                    {formatCurrency(annualRevenue)}
                                                </span>

                                                <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                                                    <span className="text-[8px] sm:text-[10px] font-medium text-orange-500 whitespace-nowrap">
                                                        CPF: -{formatNumber(data.cpfCost)}
                                                    </span>
                                                    {data.cgfCost > 0 && (
                                                        <span className="text-[8px] sm:text-[10px] font-medium text-pink-400 whitespace-nowrap">
                                                            CGF: -{formatNumber(data.cgfCost)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>

                        {/* Footer Summary */}
                        <tfoot className="bg-slate-900 border-t border-slate-900">
                            <tr>
                                <td className="px-2 sm:px-6 py-4 text-center">
                                    <div className="text-white text-[10px] sm:text-sm font-medium">Duration</div>
                                    <div className="text-slate-400 text-[9px] sm:text-xs">{treeData.years} Years</div>
                                </td>
                                <td className="px-2 sm:px-6 py-4 text-center">
                                    <div className="text-white text-[10px] sm:text-sm font-medium">Final</div>
                                    <div className="text-slate-400 text-[9px] sm:text-xs text-center">
                                        {formatNumber(cumulativeYearlyData[cumulativeYearlyData.length - 1]?.totalBuffaloes || 0)} Buff.
                                    </div>
                                </td>
                                <td className="px-2 sm:px-6 py-4 text-center">
                                    <div className="text-emerald-400 text-xs sm:text-lg font-bold">
                                        {formatCurrency(cumulativeYearlyData.reduce((sum: number, data: any) => sum + data.revenueWithCPF, 0))}
                                    </div>
                                    <div className="text-slate-400 text-[9px] sm:text-xs">Net Revenue</div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnnualHerdRevenue;
