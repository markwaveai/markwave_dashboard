import React, { useMemo } from 'react';
import { IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';

interface RevenueProjectionCardProps {
    yearIndex: number; // 1-based index (1 = 2026, 2 = 2027...)
    onYearChange: (year: number) => void;
    units: number;
    formatCurrency: (val: number) => string;
}

// Data provided by the user (Per Unit assumption)
const REVENUE_DATA = [
    { year: 2026, revenue: 99000, cpf: 0 },
    { year: 2027, revenue: 103500, cpf: 22500 },
    { year: 2028, revenue: 91500, cpf: 52500 },
    { year: 2029, revenue: 187500, cpf: 82500 },
    { year: 2030, revenue: 278500, cpf: 117500 },
    { year: 2031, revenue: 393000, cpf: 180000 },
    { year: 2032, revenue: 603500, cpf: 272500 },
    { year: 2033, revenue: 897500, cpf: 407500 },
    { year: 2034, revenue: 1344000, cpf: 615000 },
    { year: 2035, revenue: 2039000, cpf: 925000 },
];

const RevenueProjectionCard: React.FC<RevenueProjectionCardProps> = ({
    yearIndex,
    onYearChange,
    units,
    formatCurrency
}) => {

    // Ensure yearIndex is within bounds (1 to 10)
    const validYearIndex = Math.max(1, Math.min(yearIndex, 10));
    const dataIndex = validYearIndex - 1;

    const entry = REVENUE_DATA[dataIndex] || REVENUE_DATA[0];
    const displayYear = entry.year;

    const totalRevenue = entry.revenue * units;
    const totalCpf = entry.cpf * units;

    const handlePrev = () => {
        if (validYearIndex > 1) {
            onYearChange(validYearIndex - 1);
        }
    };

    const handleNext = () => {
        if (validYearIndex < 10) {
            onYearChange(validYearIndex + 1);
        }
    };

    return (
        <div className="relative rounded-3xl p-6 h-full flex flex-col justify-between min-h-[180px] bg-[#f3e5f5] transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-[#e1bee7] flex items-center justify-center text-[#7b1fa2]">
                    <IndianRupee size={24} strokeWidth={2} />
                </div>

                {/* Pill Date Selector */}
                <div className="flex items-center bg-[#e1bee7]/50 rounded-lg p-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className={`p-1 rounded-md transition-colors ${validYearIndex <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-[#7b1fa2] hover:bg-white/50'}`}
                        disabled={validYearIndex <= 1}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="mx-2 text-xs font-bold text-[#4a148c] min-w-[60px] text-center">
                        Jan, {displayYear}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className={`p-1 rounded-md transition-colors ${validYearIndex >= 10 ? 'opacity-30 cursor-not-allowed' : 'text-[#7b1fa2] hover:bg-white/50'}`}
                        disabled={validYearIndex >= 10}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Projected Revenue
                </p>
                <div className="text-3xl font-extrabold tracking-tight text-[#6a1b9a]">
                    ₹{formatCurrency(totalRevenue)}
                </div>

                <div className="mt-2 inline-flex items-center bg-[#e1bee7] px-2 py-1 rounded text-[10px] font-bold text-[#4a148c]">
                    CPF: ₹{formatCurrency(totalCpf)}
                </div>
            </div>
        </div>
    );
};

export default RevenueProjectionCard;
