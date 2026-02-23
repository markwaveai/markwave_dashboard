import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface NewStatsCardProps {
    title: string;
    count: string;
    trend: number;
    trendLabel?: string;
    icon?: React.ReactNode;
}

const NewStatsCard: React.FC<NewStatsCardProps> = ({
    title,
    count,
    trend,
    trendLabel = 'vs last month',
    icon = <Activity size={20} />
}) => {
    const isPositive = trend >= 0;

    return (
        <div className="group relative bg-white rounded-[var(--radius-2xl)] p-6 shadow-[var(--shadow-sm)] border border-[var(--slate-200)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            {/* Decorative background shape */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>

            <div className="flex justify-between items-start relative z-10 mb-4">
                <div className={`p-3 rounded-2xl ${isPositive ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'} transition-colors group-hover:bg-indigo-600 group-hover:text-white`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-lg ${isPositive ? 'bg-green-100/50 text-green-700' : 'bg-rose-100/50 text-rose-700'}`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isPositive ? '+' : ''}{trend}%
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-black text-[var(--slate-900)] tracking-tight mb-1">{count}</h3>
                <p className="text-[var(--slate-500)] font-semibold text-sm flex items-center gap-2">
                    {title}
                    <span className="w-1 h-1 bg-[var(--slate-300)] rounded-full"></span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--slate-400)]">{trendLabel}</span>
                </p>
            </div>
        </div>
    );
};

export default NewStatsCard;
