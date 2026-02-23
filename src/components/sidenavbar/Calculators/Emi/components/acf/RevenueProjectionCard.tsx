import React, { useMemo } from 'react';
import { IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';
import { SimpleTooltip } from '../../../Unit/components/BuffaloFamilyTree/CommonComponents';

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

    // Helper to get ordinal suffix
    const getOrdinalLabel = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        const suffix = s[(v - 20) % 10] || s[v] || s[0];
        return `${n}${suffix} Year`;
    };

    const displayYearLabel = getOrdinalLabel(validYearIndex);

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
        <SimpleTooltip
            content="These values starts after your ACF is completed"
            placement="bottom"
            wrapperClassName="w-full h-full"
        >
            <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center transition-transform hover:-translate-y-0.5 duration-300 w-full h-full">
                <div className="w-full flex justify-center mb-1">
                    {/* Pill Date Selector */}
                    <div className="flex items-center bg-slate-100 rounded p-0.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className={`p-0.5 rounded transition-colors ${validYearIndex <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-white'}`}
                            disabled={validYearIndex <= 1}
                        >
                            <ChevronLeft size={12} />
                        </button>
                        <span className="mx-1 text-[10px] font-bold text-slate-700 min-w-[50px] text-center">
                            {displayYearLabel}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className={`p-0.5 rounded transition-colors ${validYearIndex >= 10 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-white'}`}
                            disabled={validYearIndex >= 10}
                        >
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Projected Revenue
                    </p>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        ₹{formatCurrency(totalRevenue)}
                    </h3>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                        CPF: ₹{formatCurrency(totalCpf)}
                    </div>
                </div>
            </div>
        </SimpleTooltip>
    );
};

export default RevenueProjectionCard;
