import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryCardProps {
    totalUsers?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ totalUsers }) => {

    const data = {
        labels: ['Investors', 'Employees', 'Special'],
        datasets: [
            {
                data: [12, 45, 8],
                backgroundColor: [
                    '#3b82f6', // Blue
                    '#f59e0b', // Yellow/Amber
                    '#8b5cf6', // Purple
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between gap-4 min-h-[170px] h-full">
            <h3 className="m-0 text-base font-bold text-gray-900">
                Users
            </h3>

            <div className="flex items-center gap-4 flex-1">
                {/* Chart Left */}
                <div className="relative w-[100px] h-[100px] shrink-0">
                    <Pie data={data} options={options} />
                </div>

                {/* Right Legend */}
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Investors</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Employees</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900">45</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Special</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900">8</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;
