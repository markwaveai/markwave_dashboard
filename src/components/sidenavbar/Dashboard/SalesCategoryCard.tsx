import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SalesCategoryCardProps {
    data?: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor: string[];
            borderWidth: number;
        }[];
    };
    totalLabel?: string;
    totalValue?: string | number;
}

const defaultData = {
    labels: ['Affiliate Program', 'Direct Buy', 'Adsense'],
    datasets: [
        {
            data: [48, 33, 19],
            backgroundColor: [
                '#3b82f6', // blue-500
                '#6366f1', // indigo-500
                '#93c5fd', // blue-300
            ],
            borderWidth: 0,
        },
    ],
};

const SalesCategoryCard: React.FC<SalesCategoryCardProps> = ({ data = defaultData, totalLabel = "Total", totalValue = "2450" }) => {

    const options = {
        cutout: '75%',
        plugins: {
            legend: {
                display: false, // We'll build a custom legend
            },
            tooltip: {
                enabled: true
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 m-0">Sales Category</h3>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                {/* Donut Chart with Center Text */}
                <div className="relative w-48 h-48 flex-shrink-0">
                    <Doughnut data={data} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-gray-500 text-sm font-medium">{totalLabel}</span>
                        <span className="text-2xl font-bold text-gray-900">{totalValue}</span>
                    </div>
                </div>

                {/* Custom Legend */}
                <div className="flex flex-col gap-4 w-full">
                    {data.labels.map((label, index) => {
                        const value = data.datasets[0].data[index];
                        const color = data.datasets[0].backgroundColor[index];
                        // Mock product count for now
                        const productCount = Math.round(value * 42.5);

                        return (
                            <div key={label} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: color }}></div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-700">{label}</div>
                                    <div className="text-xs text-gray-400 font-medium">
                                        {value}% <span className="mx-1">•</span> {productCount} Products
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SalesCategoryCard;
