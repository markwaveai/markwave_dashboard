
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Calendar, Loader2, ToggleLeft, ToggleRight, LayoutGrid, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatCurrency, SimpleTooltip } from './CommonComponents';
import OrgTreeIcon from './OrgTreeIcon';


const HeaderControls = ({
    units,
    setUnits,
    years,
    setYears,
    endMonth,
    setEndMonth,
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
    setActiveTab,
    isCGFEnabled,
    setIsCGFEnabled,
    isViewRestricted,
}: {
    units: number;
    setUnits: (val: number) => void;
    years: number;
    setYears: (val: number) => void;
    endMonth: number;
    setEndMonth: (val: number) => void;
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
    isCGFEnabled: boolean;
    setIsCGFEnabled: (val: boolean) => void;
    isViewRestricted?: boolean;
}) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Generate days array based on days in month
    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);


    // Handle number input changes to prevent showing 0 when empty
    const handleNumberChange = (value: string | number, setter: (val: any) => void) => {
        if (value === '' || isNaN(Number(value))) {
            setter('');
        } else {
            let num = parseInt(value.toString(), 10);
            if (num > 999) num = 999;
            setter(num);
        }
    };

    // Auto-run simulation on inputs change
    useEffect(() => {
        runSimulation();
    }, [units, years, endMonth, startYear, startMonth, startDay]);

    return (
        <div className="bg-white border-b border-slate-200 px-4 py-2 z-[80] relative">
            {/* Horizontally scrollable on mobile */}
            <div className="overflow-x-auto overflow-y-hidden">
                <div className="flex items-center justify-between gap-4 min-w-max">

                    {/* Left Section: Configuration & Actions */}
                    <div className="flex items-center gap-4 shrink-0">

                        {/* Configuration Group */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-sm">

                            {/* Units Input */}
                            <div className="flex flex-col items-center px-2 py-1 border-r border-slate-200">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Units</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    className="w-12 bg-white/50 border border-slate-200 rounded px-1 text-sm font-semibold text-slate-700 text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={units || ''}
                                    onChange={(e) => handleNumberChange(e.target.value, setUnits)}
                                    placeholder="1-999"
                                />
                            </div>

                            {/* Start Date Picker */}
                            <div className="flex flex-col items-center px-2 py-1 border-r border-slate-200 relative">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Start Date</span>
                                <div className="relative w-32 group/date">
                                    <DatePicker
                                        selected={new Date(startYear, startMonth, startDay || 1)}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                const newYear = date.getFullYear();
                                                const newMonth = date.getMonth();
                                                const newDay = date.getDate();
                                                setStartYear(newYear);
                                                setStartMonth(newMonth);
                                                setStartDay(newDay);

                                                // Always reset to 10 years (120 months) duration
                                                setYears(10);
                                                // End month for exactly 10 years is (startMonth + 120 - 1) % 12
                                                setEndMonth((newMonth + 119) % 12);
                                            }
                                        }}
                                        minDate={new Date(2026, 0, 1)}
                                        dateFormat="dd MMM yyyy"
                                        portalId="root"
                                        className="w-full bg-transparent text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none text-center pr-6"
                                        placeholderText="Select"
                                        onKeyDown={(e) => e.preventDefault()}
                                        popperClassName="!z-[100]"
                                        popperPlacement="bottom-start"
                                    />
                                    <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 group-hover/date:text-indigo-500 transition-colors pointer-events-none" />
                                </div>
                            </div>

                            {/* End Date Picker - Swapped Position & DatePicker added */}
                            <div className="flex flex-col items-center px-2 py-1 border-r border-slate-200 relative">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">End Date</span>
                                <div className="relative w-32 group/date">
                                    <DatePicker
                                        selected={new Date(startYear, startMonth + Math.round(years * 12) - 1, startDay)}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                const newEndYear = date.getFullYear();
                                                const newEndMonth = date.getMonth();
                                                const startAbsolute = startYear * 12 + startMonth;
                                                const endAbsolute = newEndYear * 12 + newEndMonth;

                                                let diffMonths = (endAbsolute - startAbsolute) + 1;

                                                // Convert to years
                                                let numYears = Math.round(diffMonths / 12);

                                                if (numYears > 10) numYears = 10; // Cap at 10 years
                                                if (numYears < 1) numYears = 1; // Min 1 year

                                                setYears(numYears);
                                                setEndMonth((startMonth + (numYears * 12) - 1) % 12);
                                            }
                                        }}
                                        minDate={new Date(startYear, startMonth + 11, startDay)}
                                        maxDate={new Date(startYear, startMonth + 119, startDay)}
                                        dateFormat="dd MMM yyyy"
                                        showMonthYearPicker
                                        portalId="root"
                                        className="w-full bg-transparent text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none text-center pr-6"
                                        placeholderText="Select"
                                        onKeyDown={(e) => e.preventDefault()}
                                        popperClassName="!z-[100]"
                                        popperPlacement="bottom-start"
                                    />
                                    <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 group-hover/date:text-indigo-500 transition-colors pointer-events-none" />
                                </div>
                            </div>

                            {/* Duration (Years) Dropdown */}
                            <div className="flex flex-col items-center px-3 py-1 border-r border-slate-200">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Duration</span>
                                <select
                                    className="bg-transparent text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none text-center appearance-none pr-4"
                                    value={Math.round(years)}
                                    onChange={(e) => {
                                        const numYears = parseInt(e.target.value, 10);
                                        setYears(numYears);
                                        // Update end month based on new duration (duration is exactly numYears * 12 months)
                                        setEndMonth((startMonth + (numYears * 12) - 1) % 12);
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(yr => (
                                        <option key={yr} value={yr}>{yr} Year{yr > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Initial Investment Display */}
                            {treeData && (
                                <div className="flex items-center gap-1 px-2 py-1">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Initial Inv</span>
                                        <span className="text-sm font-black text-slate-900">
                                            {formatCurrency((units * 2 * 175000) + (units * 15000))}
                                        </span>
                                        <span className="text-[8px] font-bold text-blue-600">CPF: {formatCurrency(units * 15000)}</span>
                                    </div>
                                </div>
                            )}



                        </div>

                        {/* Run Button */}

                    </div>

                    {/* Center Section: View Toggle */}
                    {treeData && !isViewRestricted && (
                        <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-inner shrink-0">
                            <SimpleTooltip content="Tree View" placement="bottom">
                                <button
                                    disabled={isViewRestricted}
                                    className={`group relative px-3 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center ${activeTab === "familyTree"
                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100'
                                        : isViewRestricted ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50'
                                        }`}
                                    onClick={() => setActiveTab("familyTree")}
                                >
                                    <img src="/tree.png" alt="tree" className="w-7 h-7" />
                                </button>
                            </SimpleTooltip>

                            <SimpleTooltip content="Revenue Projections" placement="bottom">
                                <button
                                    className={`group relative  px-3 py-1.5 rounded-md transition-all duration-300 flex items-center justify-center ${activeTab === "costEstimation"
                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100'
                                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50'
                                        }`}
                                    onClick={() => setActiveTab("costEstimation")}
                                >
                                    <img src="/org-tree.png" alt="org-tree" className="w-7 h-7" />
                                </button>
                            </SimpleTooltip>
                        </div>
                    )}

                    {/* Right Section: Summary Stats */}
                    {treeData && treeData.summaryStats && (
                        <div className="flex items-center gap-4 bg-white px-3 py-1 rounded-xl border border-slate-100 shadow-sm shrink-0 overflow-visible">

                            <SimpleTooltip content="Total buffaloes + calves" placement="bottom">
                                <div className="flex flex-col items-center cursor-default">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Buffaloes</span>
                                    <span className="text-sm font-black text-slate-800">
                                        {activeTab === "costEstimation" && headerStats?.totalBuffaloes !== undefined
                                            ? headerStats.totalBuffaloes
                                            : treeData.summaryStats.totalBuffaloes}
                                    </span>
                                </div>
                            </SimpleTooltip>

                            <div className="w-px h-8 bg-slate-200" />

                            {/* Asset Value - Added */}
                            <SimpleTooltip content="Buffaloes asset value" placement="bottom">
                                <div className="flex flex-col items-center cursor-default">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Asset Value</span>
                                    <span className="text-sm font-black text-blue-600">
                                        {formatCurrency(activeTab === "costEstimation" && headerStats?.totalAssetValue !== undefined
                                            ? headerStats.totalAssetValue
                                            : treeData.summaryStats.totalAssetValue)}
                                    </span>
                                </div>
                            </SimpleTooltip>

                            <div className="w-px h-8 bg-slate-200" />

                            <SimpleTooltip
                                content={isCGFEnabled ? `Total Recurring Revenue - (CPF +CGF)` : `Total Recurring Revenue - CPF`}
                                placement="bottom-right"
                                className="whitespace-nowrap max-w-none"
                            >
                                <div className="flex flex-col items-center cursor-default">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                        {isCGFEnabled ? "Net (-(CPF+CGF))" : "Net (-CPF)"}
                                    </span>
                                    <span className="text-sm font-black text-emerald-600">
                                        {formatCurrency(
                                            activeTab === "costEstimation" && headerStats?.cumulativeNetRevenue !== undefined
                                                ? (isCGFEnabled ? headerStats.cumulativeNetRevenueWithCaring || headerStats.cumulativeNetRevenue : headerStats.cumulativeNetRevenue)
                                                : (isCGFEnabled ? treeData.summaryStats.totalNetRevenueWithCaring : treeData.summaryStats.totalNetRevenue)
                                        )}
                                    </span>
                                </div>
                            </SimpleTooltip>


                            {/* CGF Toggle - Integrated */}
                            <SimpleTooltip content={isCGFEnabled ? "Disable CGF Mode" : "Enable CGF Mode"} placement="bottom">
                                <button
                                    onClick={() => setIsCGFEnabled(!isCGFEnabled)}
                                    className={`flex items-center justify-center p-1.5 rounded-full transition-all ${isCGFEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    <span className="text-[9px] font-bold uppercase mr-1.5">CGF</span>
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 relative ${isCGFEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isCGFEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            </SimpleTooltip>

                            <div className="w-px h-8 bg-slate-200" />

                            <SimpleTooltip content="Total Projected Revenue" placement="bottom-right">
                                <div className="flex flex-col items-center cursor-default">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total PR</span>
                                    <span className="text-sm font-black text-slate-900">
                                        {formatCurrency(
                                            activeTab === "costEstimation" && headerStats
                                                ? (isCGFEnabled ? (headerStats.cumulativeNetRevenueWithCaring ?? headerStats.cumulativeNetRevenue) : headerStats.cumulativeNetRevenue) + headerStats.totalAssetValue
                                                : (isCGFEnabled ? treeData.summaryStats.totalNetRevenueWithCaring : treeData.summaryStats.totalNetRevenue) + treeData.summaryStats.totalAssetValue
                                        )}
                                    </span>
                                </div>
                            </SimpleTooltip>




                        </div>
                    )}
                </div>
            </div>{/* end overflow-x-auto */}
        </div>
    );
};

export default HeaderControls;
