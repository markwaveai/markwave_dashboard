import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ScriptableContext,
    LineController,
    BarController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    LineController,
    BarController,
    Title,
    Tooltip,
    Filler,
    Legend
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
            align: 'end' as const,
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 6,
                boxHeight: 6,
                padding: 10,
                font: {
                    size: 11,
                    weight: 'bold' as any
                }
            }
        },
        tooltip: {
            backgroundColor: '#fff',
            titleColor: '#111827',
            bodyColor: '#6b7280',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            boxPadding: 4,
            usePointStyle: true,
            callbacks: {
                label: function (context: any) {
                    return `${context.dataset.label}: ${context.parsed.y}`;
                }
            }
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#6b7280',
                font: {
                    size: 11
                }
            },
            border: {
                display: false
            }
        },
        y: {
            grid: {
                color: '#f3f4f6',
            },
            ticks: {
                color: '#6b7280',
                font: {
                    size: 11
                }
            },
            border: {
                display: false
            },
            beginAtZero: true
        },
    },
    interaction: {
        mode: 'nearest' as const,
        intersect: true,
        axis: 'xy' as const
    }
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const data = {
    labels,
    datasets: [
        {
            type: 'line' as const,
            label: 'Units',
            data: [150, 380, 180, 290, 170, 180, 280, 90, 200, 380, 270, 90],
            borderColor: '#4f46e5',
            backgroundColor: (context: ScriptableContext<'line'>) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return 'rgba(79, 70, 229, 0.1)';
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)');
                gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointBackgroundColor: '#4f46e5',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHitRadius: 25,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#4f46e5',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            order: 1
        },
        {
            type: 'bar' as const,
            label: 'Orders',
            data: [100, 280, 130, 210, 120, 140, 200, 70, 150, 290, 200, 60],
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            hoverBackgroundColor: 'rgba(16, 185, 129, 0.65)',
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 35,
            order: 2
        }
    ],
};

const MonthlySalesChart: React.FC = () => {
    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm flex flex-col h-full border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-lg font-bold text-gray-900">Monthly Peak Analysis</h3>
                <button className="bg-transparent border-none text-gray-400 cursor-pointer text-xl p-0 hover:text-gray-600">⋮</button>
            </div>

            <div className="flex-1 min-h-[300px] relative">
                <Chart type="bar" options={options as any} data={data} />
            </div>
        </div>
    );
};

export default MonthlySalesChart;
