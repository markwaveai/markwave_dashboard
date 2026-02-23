import React from 'react';
import { Gem, ChevronLeft, ChevronRight } from 'lucide-react';
import { SimpleTooltip } from '../../../Unit/components/BuffaloFamilyTree/CommonComponents';

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

    // Helper to get ordinal suffix
    const getOrdinalLabel = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        const suffix = s[(v - 20) % 10] || s[v] || s[0];
        return `${n}${suffix} Year`;
    };

    const displayYearLabel = getOrdinalLabel(year);

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
                            className={`p-0.5 rounded transition-colors ${year <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-white'}`}
                            disabled={year <= 1}
                        >
                            <ChevronLeft size={12} />
                        </button>
                        <span className="mx-1 text-[10px] font-bold text-slate-700 min-w-[50px] text-center">
                            {displayYearLabel}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className={`p-0.5 rounded transition-colors ${year >= 10 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600 hover:bg-white'}`}
                            disabled={year >= 10}
                        >
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Asset Value
                    </p>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        ₹{formatCurrency(value)}
                    </h3>
                </div>
            </div>
        </SimpleTooltip>
    );
};

export default AssetProjectionCard;
