import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateData = () => ({
    labels,
    datasets: [
        {
            label: 'Total Revenue',
            data: [180, 190, 170, 160, 170, 165, 175, 210, 230, 210, 240, 235],
            borderColor: '#6366f1', // Indigo 500
            backgroundColor: (context: ScriptableContext<'line'>) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return 'transparent';
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
        }
    ],
});

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#cbd5e1',
            bodyColor: '#f8fafc',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            displayColors: false,
            titleFont: { size: 12, weight: 'bold' as const },
            bodyFont: { size: 14, weight: 'bold' as const },
            callbacks: {
                label: (context: any) => `₹${context.raw}K`
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: {
                color: '#64748b',
                font: { size: 10, weight: 'bold' as const },
                padding: 10
            },
            border: { display: false }
        },
        y: {
            grid: { color: '#f1f5f9', borderDash: [4, 4], drawTicks: false },
            ticks: {
                color: '#64748b',
                font: { size: 10, weight: 'bold' as const },
                padding: 10,
                callback: (value: any) => `₹${value}k`
            },
            border: { display: false },
            min: 0,
        }
    },
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
};

interface StatisticsChartProps {
    primaryValue: string;
    secondaryValue: string;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
    primaryValue = "₹212,142",
    secondaryValue = "₹30,321"
}) => {
    const [period, setPeriod] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

    return (
        <div className="bg-white rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-sm)] border border-[var(--slate-200)] h-full flex flex-col group hover:shadow-[var(--shadow-md)] transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h3 className="text-xl font-black text-[var(--slate-900)] tracking-tight">Revenue Analytics</h3>
                    <p className="text-sm text-[var(--slate-500)] font-semibold mt-1">Real-time performance metrics</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--slate-100)] p-1 rounded-xl">
                        {['Monthly', 'Quarterly', 'Yearly'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p
                                    ? 'bg-white text-[var(--slate-900)] shadow-sm'
                                    : 'text-[var(--slate-500)] hover:text-[var(--slate-700)]'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--slate-200)] rounded-xl text-xs font-bold text-[var(--slate-700)] hover:bg-[var(--slate-50)] transition-colors">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>Filters</span>
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-12 mb-10">
                <div className="group/stat">
                    <p className="text-xs uppercase tracking-[0.1em] text-[var(--slate-400)] font-black mb-2">Primary Revenue</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[var(--slate-900)] tracking-tighter group-hover/stat:text-indigo-600 transition-colors">{primaryValue}</span>
                        <span className="flex items-center gap-0.5 text-green-600 text-[11px] font-black bg-green-50 px-2 py-0.5 rounded-lg">
                            <TrendingUp size={10} />
                            +23.2%
                        </span>
                    </div>
                </div>
                <div className="group/stat">
                    <p className="text-xs uppercase tracking-[0.1em] text-[var(--slate-400)] font-black mb-2">Secondary Goal</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[var(--slate-900)] tracking-tighter group-hover/stat:text-indigo-600 transition-colors">{secondaryValue}</span>
                        <span className="text-red-500 text-[11px] font-black bg-red-50 px-2 py-0.5 rounded-lg">-12.5%</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[250px] relative w-full">
                <Line data={generateData()} options={options} />
            </div>
        </div>
    );
};

export default StatisticsChart;
