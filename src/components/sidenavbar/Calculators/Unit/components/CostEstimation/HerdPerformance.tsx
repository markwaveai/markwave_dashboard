
import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts';
import { formatCurrency, formatNumber } from '../BuffaloFamilyTree/CommonComponents';

const HerdPerformance = ({
    yearlyData,
    monthlyRevenue,
    selectedYearIndex,
    startYear,
    breakEvenAnalysis,
    assetMarketValue,
    treeData
}: any) => {
    // State for Line Chart
    const [localYearIndex, setLocalYearIndex] = useState(selectedYearIndex);
    // Independent State for Bar Chart
    const [barLocalYearIndex, setBarLocalYearIndex] = useState(selectedYearIndex);

    const [isBreakEvenHovered, setIsBreakEvenHovered] = useState(false);

    // Sync both with global selection if it changes
    useEffect(() => {
        setLocalYearIndex(selectedYearIndex);
        setBarLocalYearIndex(selectedYearIndex);
    }, [selectedYearIndex]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

    // Helper to get formatted monthly data
    const getMonthlyDataForYear = (yearIndex: number) => {
        return Array.from({ length: 12 }).map((_, mIndex) => {
            const { year, month } = getCalendarDate(yearIndex, mIndex);
            const yearRevenue = monthlyRevenue?.[year] || {};
            const revenue = yearRevenue[month]?.total || 0;

            return {
                name: `${monthNames[month]} '${year.toString().slice(-2)}`,
                value: revenue
            };
        });
    };

    // Prepare Revenue Data
    const monthlyLineChartData = getMonthlyDataForYear(localYearIndex);
    const monthlyBarChartData = getMonthlyDataForYear(barLocalYearIndex);

    const getYearlyRevenueData = () => {
        const safeYearlyData = Array.isArray(yearlyData) ? yearlyData : [];

        // Create lookup map for asset values
        const assetMap: any = {};
        if (Array.isArray(assetMarketValue)) {
            assetMarketValue.forEach((item: any) => {
                assetMap[item.year] = item.totalAssetValue;
            });
        }

        return safeYearlyData.map((data: any) => ({
            name: data.year,
            displayLabel: data.displayLabel,
            Revenue: data.revenueWithCPF,
            "Asset Value": assetMap[data.year] || 0
        }));
    };

    const yearlyRevenueChartData = getYearlyRevenueData();
    const totalYears = Array.isArray(yearlyData) ? yearlyData.length : 1;

    // Prepare Herd Composition Data (Milking vs Non-Milking)
    const getHerdCompositionData = () => {
        const safeYearlyData = Array.isArray(yearlyData) ? yearlyData : [];
        return safeYearlyData.map((data: any) => ({
            name: data.year,
            displayLabel: data.displayLabel,
            Milking: data.producingBuffaloes || 0,
            "Non-Milking": data.nonProducingBuffaloes || 0
        }));
    };

    const herdCompositionData = getHerdCompositionData();

    // Determine Precise Break Even Point (Year + Fractional Month)
    let breakEvenX: any = null;
    let breakEvenLabel = "Break Even";

    if (breakEvenAnalysis?.revenueBreakEvenYearWithCPF) {
        const year = breakEvenAnalysis.revenueBreakEvenYearWithCPF;
        const month = breakEvenAnalysis.revenueBreakEvenMonthWithCPF || 0;
        breakEvenX = year + (month / 12);

        const monthName = monthNames[month % 12];
        breakEvenLabel = isBreakEvenHovered ? `Break Even: ${monthName} ${year}` : "Break Even";
    }

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded-lg shadow-lg border border-slate-200">
                    <p className="font-bold text-xs text-slate-700 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
                            {entry.name || "Value"}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomHerdTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded-lg shadow-lg border border-slate-200">
                    <p className="font-bold text-xs text-slate-700 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
                            {entry.name}: {formatNumber(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Reusable Dropdown Component
    const YearSelector = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
        <div className="relative">
            <select
                value={value}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(parseInt(e.target.value))}
                className="appearance-none bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-md py-1 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
                {Array.from({ length: totalYears }, (_, i: number) => {
                    const label = yearlyData[i]?.displayLabel || `Year ${i + 1}`;
                    return (
                        <option key={i} value={i}>
                            {label}
                        </option>
                    );
                })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
        </div>
    );

    // Helper to format display label to range (e.g. "Mar 2035 - Feb 2036" -> "2035-36")
    const formatYearRange = (displayLabel: string, year: number) => {
        if (!displayLabel) return year.toString();
        const parts = displayLabel.split(' - ');
        if (parts.length === 2) {
            const startYearStr = parts[0].split(' ').pop();
            const endYearStr = parts[1].split(' ').pop();
            if (startYearStr && endYearStr) {
                return `${startYearStr}-${endYearStr.slice(2)}`;
            }
        }
        return year.toString();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Monthly Revenue Line Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Monthly Revenue (Line)</h2>
                        <p className="text-xs text-slate-500">Distribution for selected simulation year</p>
                    </div>
                    <YearSelector value={localYearIndex} onChange={setLocalYearIndex} />
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={monthlyLineChartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(value) => formatCurrency(value)}
                                width={65}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                name="Revenue"
                                stroke="#4f46e5"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 5, fill: '#4f46e5', strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card 2: Yearly Revenue Line Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-800">Annual Trend (Line)</h2>
                    <p className="text-xs text-slate-500">
                        Revenue vs Asset Value
                    </p>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={yearlyRevenueChartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(tick) => {
                                    const item = yearlyRevenueChartData.find((d: any) => d.name === tick);
                                    return item ? formatYearRange(item.displayLabel, item.name) : tick.toString();
                                }}
                                dy={10}
                                allowDecimals={false}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(value) => formatCurrency(value)}
                                width={65}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                labelFormatter={(label) => {
                                    const item = yearlyRevenueChartData.find((d: any) => d.name === label);
                                    return item?.displayLabel || label;
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey="Revenue"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                            <Line
                                type="monotone"
                                dataKey="Asset Value"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                            {breakEvenX && (
                                <ReferenceLine
                                    x={breakEvenX}
                                    stroke="#ef4444"
                                    strokeDasharray="3 3"
                                    strokeWidth={isBreakEvenHovered ? 2 : 1}
                                    onMouseEnter={() => setIsBreakEvenHovered(true)}
                                    onMouseLeave={() => setIsBreakEvenHovered(false)}
                                    style={{ cursor: 'pointer' }}
                                    label={{
                                        value: breakEvenLabel,
                                        position: 'insideTopRight',
                                        fill: '#ef4444',
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                        className: 'transition-all duration-300'
                                    }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card 3: Monthly Revenue Bar Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Monthly Revenue (Bar)</h2>
                        <p className="text-xs text-slate-500">Distribution for selected simulation year</p>
                    </div>
                    <YearSelector value={barLocalYearIndex} onChange={setBarLocalYearIndex} />
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyBarChartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(value) => formatCurrency(value)}
                                width={65}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                            <Bar
                                dataKey="value"
                                name="Revenue"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card 4: Yearly Revenue Bar Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-800">Annual Trend (Bar)</h2>
                    <p className="text-xs text-slate-500">
                        Revenue vs Asset Value
                    </p>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={yearlyRevenueChartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            barGap={0}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(tick) => {
                                    const item = yearlyRevenueChartData.find((d: any) => d.name === tick);
                                    return item ? formatYearRange(item.displayLabel, item.name) : tick.toString();
                                }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(value) => formatCurrency(value)}
                                width={65}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: '#f1f5f9' }}
                                labelFormatter={(label) => {
                                    const item = yearlyRevenueChartData.find((d: any) => d.name === label);
                                    return item?.displayLabel || label;
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Bar
                                dataKey="Revenue"
                                fill="#06b6d4"
                                radius={[4, 0, 0, 0]}
                                maxBarSize={20}
                                animationDuration={1000}
                            />
                            <Bar
                                dataKey="Asset Value"
                                fill="#8b5cf6"
                                radius={[0, 4, 0, 0]}
                                maxBarSize={20}
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card 5: Herd Composition Line Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-800">Herd Composition (Trend)</h2>
                    <p className="text-xs text-slate-500">
                        Milking vs Non-Milking
                    </p>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={herdCompositionData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(tick) => {
                                    const item = herdCompositionData.find((d: any) => d.name === tick);
                                    return item ? formatYearRange(item.displayLabel, item.name) : tick.toString();
                                }}
                                dy={10}
                                allowDecimals={false}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                width={30}
                            />
                            <Tooltip
                                content={<CustomHerdTooltip />}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                labelFormatter={(label) => {
                                    const item = herdCompositionData.find((d: any) => d.name === label);
                                    return item?.displayLabel || label;
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey="Milking"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Non-Milking"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card 6: Herd Composition Bar Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-800">Herd Composition (Vol)</h2>
                    <p className="text-xs text-slate-500">
                        Milking vs Non-Milking
                    </p>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={herdCompositionData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            barGap={0}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                tickFormatter={(tick) => {
                                    const item = herdCompositionData.find((d: any) => d.name === tick);
                                    return item ? formatYearRange(item.displayLabel, item.name) : tick.toString();
                                }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                width={30}
                            />
                            <Tooltip
                                content={<CustomHerdTooltip />}
                                cursor={{ fill: '#f1f5f9' }}
                                labelFormatter={(label) => {
                                    const item = herdCompositionData.find((d: any) => d.name === label);
                                    return item?.displayLabel || label;
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Bar
                                dataKey="Milking"
                                fill="#10b981"
                                radius={[4, 0, 0, 0]}
                                maxBarSize={20}
                            />
                            <Bar
                                dataKey="Non-Milking"
                                fill="#f59e0b"
                                radius={[0, 4, 0, 0]}
                                maxBarSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default HerdPerformance;
