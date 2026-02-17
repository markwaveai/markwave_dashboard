import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MoreHorizontal, PieChart, ShoppingBag } from 'lucide-react';

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
    labels: ['Affiliate', 'Direct', 'Organic'],
    datasets: [
        {
            data: [48, 33, 19],
            backgroundColor: [
                '#6366f1', // indigo-500
                '#818cf8', // indigo-400
                '#c7d2fe', // indigo-200
            ],
            borderWidth: 0,
            cutout: '80%',
            borderRadius: 8,
            hoverOffset: 15
        },
    ],
};

const SalesCategoryCard: React.FC<SalesCategoryCardProps> = ({ data = defaultData, totalLabel = "Units Sold", totalValue = "2,450" }) => {

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 12, weight: 'bold' as const },
                bodyFont: { size: 13 },
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                usePointStyle: true,
            }
        },
        maintainAspectRatio: false,
        animation: {
            animateRotate: true,
            animateScale: true
        }
    };

    return (
        <div className="bg-white rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-sm)] border border-[var(--slate-200)] h-full flex flex-col group hover:shadow-[var(--shadow-md)] transition-all duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-[var(--slate-900)] tracking-tight">Sales by Category</h3>
                    <p className="text-sm text-[var(--slate-500)] font-semibold mt-1">Distribution by source</p>
                </div>
                <button className="p-2 text-[var(--slate-400)] hover:bg-[var(--slate-50)] rounded-xl transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-10 flex-1">
                {/* Donut Chart with Center Text */}
                <div className="relative w-52 h-52 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <Doughnut data={data} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <ShoppingBag size={20} className="text-indigo-500 mb-1" />
                        <span className="text-3xl font-black text-[var(--slate-900)] tracking-tighter">{totalValue}</span>
                        <span className="text-[10px] uppercase font-black text-[var(--slate-400)] tracking-widest">{totalLabel}</span>
                    </div>
                </div>

                {/* Custom Legend */}
                <div className="flex flex-col gap-5 w-full">
                    {data.labels.map((label, index) => {
                        const value = data.datasets[0].data[index];
                        const color = data.datasets[0].backgroundColor[index];
                        const productCount = Math.round(value * 42.5);

                        return (
                            <div key={label} className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-[var(--slate-50)] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 rounded-full ring-4 ring-offset-2 ring-transparent group-hover/item:ring-offset-0 group-hover/item:ring-[inherit]" style={{ backgroundColor: color }}></div>
                                    <div>
                                        <div className="text-sm font-black text-[var(--slate-900)]">{label}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-[var(--slate-400)] font-black">
                                            {productCount} Products
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-black text-[var(--slate-900)] bg-[var(--slate-100)] px-3 py-1 rounded-lg">
                                    {value}%
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
