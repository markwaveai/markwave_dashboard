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

const generateData = (fill: boolean) => ({
    labels,
    datasets: [
        {
            label: 'Avg. Yearly Profit',
            data: [180, 190, 170, 160, 170, 165, 175, 210, 230, 210, 240, 235],
            borderColor: '#4f46e5', // Indigo 600
            backgroundColor: (context: ScriptableContext<'line'>) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return 'rgba(79, 70, 229, 0.1)';
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.25)');
                gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
        },
        {
            label: 'Avg. Yearly Profit (Secondary)',
            data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
            borderColor: '#93c5fd', // Blue 300
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
        }
    ],
});

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#fff',
            titleColor: '#111827',
            bodyColor: '#6b7280',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 10,
            boxPadding: 4,
            usePointStyle: true,
            displayColors: true,
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 } },
            border: { display: false }
        },
        y: {
            grid: { color: '#f3f4f6', borderDash: [2, 2] },
            ticks: { color: '#9ca3af', font: { size: 11 }, stepSize: 50 },
            border: { display: false },
            min: 0,
            max: 250 // Align with image example
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
    primaryValue = "$212,142.12",
    secondaryValue = "$30,321.23"
}) => {
    const [period, setPeriod] = useState<'Monthly' | 'Quarterly' | 'Annually'>('Monthly');

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 m-0">Statistics</h3>
                    <p className="text-xs text-gray-500 mt-1">Target you've set for each month</p>
                </div>

                <div className="flex bg-gray-50 p-1 rounded-lg">
                    {['Monthly', 'Quarterly', 'Annually'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${period === p
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-8 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{primaryValue}</span>
                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">+23.2%</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Avg. Yearly Profit</span>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{secondaryValue}</span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">-12.5%</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Avg. Yearly Profit</span>
                </div>
            </div>

            <div className="flex-1 min-h-[250px] relative w-full">
                <Line data={generateData(true)} options={options} />
            </div>
        </div>
    );
};

export default StatisticsChart;
