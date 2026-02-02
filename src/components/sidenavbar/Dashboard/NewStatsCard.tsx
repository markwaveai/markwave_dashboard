import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface NewStatsCardProps {
    title: string;
    count: string;
    trend: number;
    trendLabel?: string;
}

const NewStatsCard: React.FC<NewStatsCardProps> = ({ title, count, trend, trendLabel = 'From last month' }) => {
    const isPositive = trend >= 0;

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900 m-0">{count}</h3>
            </div>

            <div className="flex justify-between items-end">
                <span className="text-gray-500 font-medium text-sm">{title}</span>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {isPositive ? '+' : ''}{trend}%
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{trendLabel}</span>
                </div>
            </div>
        </div>
    );
};

export default NewStatsCard;
