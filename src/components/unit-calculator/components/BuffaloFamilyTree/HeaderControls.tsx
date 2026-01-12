
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Calendar, Loader2, ToggleLeft, ToggleRight, LayoutGrid, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatCurrency } from './CommonComponents';
import algorithmConfig from '../../algorithms.json';


const HeaderControls = ({
    units,
    setUnits,
    years,
    setYears,
    startYear,
    setStartYear,
    startMonth,
    setStartMonth,
    startDay,
    setStartDay,
    daysInMonth,
    runSimulation,
    treeData,
    resetSimulation,
    loading,
    headerStats,
    activeTab,
    setActiveTab
}: {
    units: number;
    setUnits: (val: number) => void;
    years: number;
    setYears: (val: number) => void;
    startYear: number;
    setStartYear: (val: number) => void;
    startMonth: number;
    setStartMonth: (val: number) => void;
    startDay: number;
    setStartDay: (val: number) => void;
    daysInMonth: number;
    runSimulation: () => void;
    treeData: any;
    resetSimulation: () => void;
    loading: boolean;
    headerStats: any;
    activeTab: string;
    setActiveTab: (val: string) => void;
}) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Generate days array based on days in month
    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const [isCGFEnabled, setIsCGFEnabled] = useState(false);

    // Calculate Initial Stats based on Units (Dynamic)
    const motherPrice = algorithmConfig.assetValue.motherPrice;
    const cpfPerUnit = algorithmConfig.cpf.annualCostPerUnit;

    // Per Unit: 2 Mothers + 1 CPF Unit Cost?
    // Logic from CostEstimationTable: motherBuffaloCost = units * 2 * MOTHER_BUFFALO_PRICE
    // cpfCost = units * CPF_PER_UNIT

    const initialBuffaloCost = (units || 0) * 2 * motherPrice;
    const initialCpfCost = (units || 0) * cpfPerUnit;
    const totalInitialInvestment = initialBuffaloCost + initialCpfCost;


    const handleNumberChange = (value: string | number, setter: (val: any) => void) => {
        if (value === '' || isNaN(Number(value))) {
            setter(''); // Allow empty string state for editing
        } else {
            const num = parseInt(value.toString(), 10);
            if (num > 999) setter(999);
            else setter(num);
        }
    };

    const handleBlur = (setter: (val: any) => void, val: any, defaultVal: number = 1) => {
        if (!val || val < 1) {
            setter(defaultVal);
        } else {
            // ensure integer
            setter(Math.floor(Number(val)));
        }
    };

    // Auto-run simulation on inputs change
    useEffect(() => {
        runSimulation();
    }, [units, years, startYear, startMonth, startDay]);

    return (
        <div className="bg-white border-b border-slate-200 px-4 py-3 pb-8 z-[80] relative">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* Left Section: Configuration & Actions */}
                <div className="flex items-center gap-4">

                    {/* Unified Left Card */}
                    <div className="flex items-center bg-white border border-slate-100 rounded-xl px-2 py-1 shadow-sm h-full min-h-[42px]">

                        {/* Units Input */}
                        <div className="flex flex-col items-center px-4 border-r border-slate-100 min-w-[5rem]">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Units</span>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    className="w-14 bg-transparent text-sm font-bold text-slate-700 text-center focus:outline-none"
                                    value={units}
                                    onChange={(e) => handleNumberChange(e.target.value, setUnits)}
                                    onBlur={() => handleBlur(setUnits, units, 1)}
                                />
                            </div>
                        </div>

                        {/* Start Date Picker */}
                        <div className="flex flex-col items-center px-4 border-r border-slate-100 min-w-[7rem]">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Start</span>
                            <div className="relative w-24 flex justify-center">
                                <DatePicker
                                    selected={new Date(startYear, startMonth, 1)}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            setStartYear(date.getFullYear());
                                            setStartMonth(date.getMonth());
                                            setStartDay(1);
                                        }
                                    }}
                                    minDate={new Date(2026, 0, 1)}
                                    dateFormat="MMM yyyy"
                                    showMonthYearPicker
                                    className="w-full bg-transparent text-sm font-bold text-slate-700 cursor-pointer focus:outline-none text-center hover:text-indigo-600 transition-colors"
                                    placeholderText="Select"
                                    onKeyDown={(e) => e.preventDefault()}
                                    popperClassName="!z-[100]"
                                    popperPlacement="bottom-start"
                                />
                            </div>
                        </div>

                        {/* End Year Picker - Year Selection */}
                        <div className="flex flex-col items-center px-4 border-r border-slate-100 min-w-[7rem]">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">End Year</span>
                            <div className="relative w-24 flex justify-center">
                                <DatePicker
                                    selected={(() => {
                                        const endYearBase = startMonth === 0 ? startYear + years - 1 : startYear + years;
                                        return new Date(endYearBase, 0, 1);
                                    })()}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            const selectedYear = date.getFullYear();
                                            let newDuration;
                                            if (startMonth === 0) {
                                                // Jan Start: 2026-2026 = 1 year
                                                newDuration = selectedYear - startYear + 1;
                                            } else {
                                                // Non-Jan: 2026-2027 = 1 year
                                                newDuration = selectedYear - startYear;
                                            }
                                            setYears(Math.max(1, Math.min(10, newDuration)));
                                        }
                                    }}
                                    minDate={(() => {
                                        const minYear = startMonth === 0 ? startYear : startYear + 1;
                                        return new Date(minYear, 0, 1);
                                    })()}
                                    maxDate={(() => {
                                        const maxYear = startMonth === 0 ? startYear + 9 : startYear + 10;
                                        return new Date(maxYear, 11, 31);
                                    })()}
                                    showYearPicker
                                    dateFormat="yyyy"
                                    className="w-full bg-transparent text-sm font-bold text-slate-700 cursor-pointer focus:outline-none text-center hover:text-indigo-600 transition-colors"
                                    onKeyDown={(e) => e.preventDefault()}
                                    popperClassName="!z-[100]"
                                    popperPlacement="bottom-start"
                                />
                            </div>
                        </div>

                        {/* Initial Investment & CPF Combined */}
                        <div className="flex flex-col items-center px-4">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Initial Inv</span>
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-sm font-black text-slate-800">{formatCurrency(initialBuffaloCost)}</span>
                                <span className="text-[9px] font-bold text-rose-500 mt-0.5">CPF: {formatCurrency(initialCpfCost)}</span>
                            </div>
                        </div>

                    </div>
                    {/* Run Button */}

                </div>


                {/* Center Section: View Toggle */}
                {treeData && (
                    <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center gap-1">
                        <button
                            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all duration-200 flex flex-col items-center leading-none gap-0.5 ${activeTab === "familyTree"
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                                }`}
                            onClick={() => setActiveTab("familyTree")}
                        >
                            <span>Tree</span>
                            <span>View</span>
                        </button>
                        <button
                            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all duration-200 flex flex-col items-center leading-none gap-0.5 ${activeTab === "costEstimation"
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                                }`}
                            onClick={() => setActiveTab("costEstimation")}
                        >
                            <span>Revenue</span>
                            <span>Projections</span>
                        </button>

                    </div>
                )}

                {/* Right Section: Summary Stats */}
                {treeData && treeData.summaryStats && (
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-slate-100 shadow-sm shrink-0">





                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Buffaloes</span>
                            <span className="text-sm font-black text-slate-800">{treeData.summaryStats.totalBuffaloes}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200" />

                        {/* Asset Value - Added */}
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Asset Val</span>
                            <span className="text-sm font-black text-blue-600">{formatCurrency(treeData.summaryStats.totalAssetValue)}</span>
                        </div>

                        <div className="w-px h-8 bg-slate-200" />

                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                {isCGFEnabled ? "Net (+CGF)" : "Net Rev"}
                            </span>
                            <span className={`text-sm font-black ${isCGFEnabled ? 'text-emerald-600' : 'text-emerald-600'}`}>
                                {formatCurrency(isCGFEnabled ? treeData.summaryStats.totalNetRevenueWithCaring : treeData.summaryStats.totalNetRevenue)}
                            </span>
                        </div>

                        {/* CGF Toggle - Integrated */}
                        <button
                            onClick={() => setIsCGFEnabled(!isCGFEnabled)}
                            className={`flex items-center justify-center p-1.5 rounded-full transition-all ${isCGFEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                            title={isCGFEnabled ? "Disable CGF Mode" : "Enable CGF Mode"}
                        >
                            <span className="text-[9px] font-bold uppercase mr-1.5">CGF</span>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 relative ${isCGFEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isCGFEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </button>

                        <div className="w-px h-8 bg-slate-200" />

                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total ROI</span>
                            <span className="text-sm font-black text-slate-900">
                                {formatCurrency(
                                    (isCGFEnabled ? treeData.summaryStats.totalNetRevenueWithCaring : treeData.summaryStats.totalNetRevenue) +
                                    treeData.summaryStats.totalAssetValue
                                )}
                            </span>
                        </div>




                    </div>
                )}
            </div>
        </div>
    );
};

export default HeaderControls;
