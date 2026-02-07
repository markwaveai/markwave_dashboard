import React from 'react';
import { Gem, ChevronLeft, ChevronRight } from 'lucide-react';

interface AssetProjectionCardProps {
    value: number;
    year: number;
    onYearChange: (year: number) => void;
    buffaloCount: number;
    formatCurrency: (val: number) => string;
}

const AssetProjectionCard: React.FC<AssetProjectionCardProps> = ({
    value,
    year,
    onYearChange,
    buffaloCount,
    formatCurrency
}) => {

    // Calculate a mock date based on year (Assuming starting from current year)
    const currentYear = new Date().getFullYear();
    const displayYear = currentYear + (year - 1);

    const handlePrev = () => {
        if (year > 1) {
            onYearChange(year - 1);
        }
    };

    const handleNext = () => {
        if (year < 10) {
            onYearChange(year + 1);
        }
    };

    return (
        <div className="relative rounded-3xl p-6 h-full flex flex-col justify-between min-h-[180px] bg-[#e0f7fa] transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-[#b2ebf2] flex items-center justify-center text-[#0097a7]">
                    <Gem size={24} strokeWidth={2} />
                </div>

                {/* Pill Date Selector */}
                <div className="flex items-center bg-[#b2ebf2]/50 rounded-lg p-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className={`p-1 rounded-md transition-colors ${year <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-[#00838f] hover:bg-white/50'}`}
                        disabled={year <= 1}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="mx-2 text-xs font-bold text-[#006064] min-w-[60px] text-center">
                        Jan, {displayYear}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className={`p-1 rounded-md transition-colors ${year >= 10 ? 'opacity-30 cursor-not-allowed' : 'text-[#00838f] hover:bg-white/50'}`}
                        disabled={year >= 10}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Asset Value
                </p>
                <div className="text-3xl font-extrabold tracking-tight text-[#006064]">
                    ₹{formatCurrency(value)}
                </div>
                <div className="text-sm font-bold text-[#00838f] mt-1">
                    (Buffaloes - {buffaloCount})
                </div>
            </div>

            <div className="mt-auto pt-2">
                <button className="bg-white text-[#006064] text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-[#b2ebf2]">
                    Projected Value
                </button>
            </div>
        </div>
    );
};

export default AssetProjectionCard;
