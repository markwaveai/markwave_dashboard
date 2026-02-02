import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RevenueGaugeCardProps {
    target: number;
    current: number;
    marketingSpend?: number;
    salesSpend?: number;
}

const RevenueGaugeCard: React.FC<RevenueGaugeCardProps> = ({
    target = 100,
    current = 90,
    marketingSpend = 30569.00,
    salesSpend = 20486.00
}) => {

    // Calculate percentage for the gauge
    const percentage = Math.min((current / target) * 100, 100);
    const data = {
        labels: ['Current', 'Remaining'],
        datasets: [
            {
                data: [percentage, 100 - percentage],
                backgroundColor: ['#4f46e5', '#f3f4f6'], // Indigo and Gray
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
                borderRadius: 20,
            },
        ],
    };

    const options = {
        cutout: '90%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        maintainAspectRatio: false,
    };

    const marketingPct = 85;
    const salesPct = 55;

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 m-0">Estimated Revenue</h3>
                    <p className="text-xs text-gray-500 mt-1">Target you've set for each month</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            {/* Semi-Circle Gauge */}
            <div className="relative h-40 w-full flex justify-center mb-6">
                <div className="w-64 h-32 relative">
                    <Doughnut data={data} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase mb-1">June Goals</span>
                        <span className="text-3xl font-bold text-gray-900">${current}</span>
                    </div>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-5 mt-auto">
                <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Marketing</span>
                        <span className="font-semibold text-gray-700">{marketingPct}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-900">${marketingSpend.toLocaleString()}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${marketingPct}%` }}></div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Sales</span>
                        <span className="font-semibold text-gray-700">{salesPct}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-900">${salesSpend.toLocaleString()}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${salesPct}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueGaugeCard;
