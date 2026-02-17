import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MoreHorizontal, Target, TrendingUp } from 'lucide-react';

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
        datasets: [
            {
                data: [percentage, 100 - percentage],
                backgroundColor: ['#6366f1', '#f1f5f9'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
                borderRadius: 20,
                cutout: '85%',
            },
        ],
    };

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        maintainAspectRatio: false,
    };

    const marketingPct = 85;
    const salesPct = 55;

    return (
        <div className="bg-white rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-sm)] border border-[var(--slate-200)] h-full flex flex-col group hover:shadow-[var(--shadow-md)] transition-all duration-300">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl font-black text-[var(--slate-900)] tracking-tight">Revenue Target</h3>
                    <p className="text-sm text-[var(--slate-500)] font-semibold mt-1">Monthly performance goal</p>
                </div>
                <button className="p-2 text-[var(--slate-400)] hover:bg-[var(--slate-50)] rounded-xl transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="relative h-44 w-full flex justify-center mb-8">
                <div className="w-full max-w-[280px] h-[140px] relative">
                    <div className="absolute top-0 left-0 w-full h-[280px]">
                        <Doughnut data={data} options={options} />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-[var(--slate-400)] font-black mb-1">
                            <Target size={12} className="text-indigo-500" />
                            <span>June Goal</span>
                        </div>
                        <span className="text-4xl font-black text-[var(--slate-900)] tracking-tighter">₹{current}K</span>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-0.5 mt-1">
                            <TrendingUp size={12} />
                            {percentage}% Achieved
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mt-auto">
                <div className="group/progress">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-[var(--slate-400)] uppercase tracking-wider">Marketing</span>
                        <span className="text-xs font-bold text-[var(--slate-900)]">{marketingPct}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-[var(--slate-900)] w-20">₹{marketingSpend.toLocaleString()}</span>
                        <div className="flex-1 h-2 bg-[var(--slate-100)] rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover/progress:bg-indigo-600" style={{ width: `${marketingPct}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="group/progress">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-[var(--slate-400)] uppercase tracking-wider">Sales Ops</span>
                        <span className="text-xs font-bold text-[var(--slate-900)]">{salesPct}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-[var(--slate-900)] w-20">₹{salesSpend.toLocaleString()}</span>
                        <div className="flex-1 h-2 bg-[var(--slate-100)] rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full transition-all duration-1000 group-hover/progress:bg-indigo-500" style={{ width: `${salesPct}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueGaugeCard;
