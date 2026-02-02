import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrdersStatsCardProps {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

const OrdersStatsCard: React.FC<OrdersStatsCardProps> = ({ total, pending, approved, rejected }) => {

    // Data for the chart
    const data = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [
            {
                data: [pending, approved, rejected],
                backgroundColor: [
                    '#fbbf24', // Pending - Amber/Yellow
                    '#34d399', // Approved - Emerald/Green
                    '#f87171', // Rejected - Red
                ],
                borderWidth: 0,
                cutout: '75%', // Thinner ring
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Custom legend
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between gap-4 min-h-[170px] h-full">
            <h3 className="m-0 text-base font-bold text-gray-900">
                Orders
            </h3>

            <div className="flex items-center gap-4 flex-1">
                {/* Chart Left */}
                <div className="relative w-[100px] h-[100px] shrink-0">
                    <Doughnut data={data} options={options} />
                    {/* Center Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total</div>
                        <div className="text-sm font-bold text-gray-900 leading-tight">
                            {total}
                        </div>
                    </div>
                </div>

                {/* Right Legend */}
                <div className="flex flex-col gap-2 flex-1">
                    {/* Approved */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Approved</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900">{approved}</span>
                    </div>

                    {/* Pending */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Pending</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900">{pending}</span>
                    </div>

                    {/* Rejected */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Rejected</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900">{rejected}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersStatsCard;
