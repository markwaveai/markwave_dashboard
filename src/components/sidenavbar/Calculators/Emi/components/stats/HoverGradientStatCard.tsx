import React from 'react';
import { clsx } from 'clsx';

interface HoverGradientStatCardProps {
    label: string;
    value: number | string;
    prefix?: string;
    icon?: any;
    color?: 'blue' | 'green' | 'teal';
    secondaryText?: string;
    isSecondaryBold?: boolean;
    isLarge?: boolean;
    formatCurrency?: (val: number) => string;
}

const HoverGradientStatCard: React.FC<HoverGradientStatCardProps> = ({
    label,
    value,
    prefix = '',
    icon: Icon,
    color = 'blue',
    secondaryText,
    isLarge = false,
    formatCurrency
}) => {
    const formattedValue = typeof value === 'number' && formatCurrency ? formatCurrency(value) : String(value);

    // Pastel themes matching the image
    const themes = {
        blue: {
            bg: 'bg-[#eef8ff]',
            iconBg: 'bg-[#cfe8fc]',
            iconColor: 'text-[#2b88d8]',
            labelColor: 'text-slate-500',
            valueColor: 'text-[#1e88e5]',
            secondaryColor: 'text-[#1e88e5]'
        },
        green: {
            bg: 'bg-[#ebf9eb]',
            iconBg: 'bg-[#ccebcc]',
            iconColor: 'text-[#4caf50]',
            labelColor: 'text-slate-500',
            valueColor: 'text-[#2e7d32]',
            secondaryColor: 'text-[#2e7d32]'
        },
        teal: {
            bg: 'bg-teal-50',
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            labelColor: 'text-slate-500',
            valueColor: 'text-teal-700',
            secondaryColor: 'text-teal-600'
        },
    };

    const theme = themes[color] || themes.blue;

    return (
        <div className="bg-white rounded-md p-2 border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center transition-transform hover:-translate-y-0.5 duration-300">
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {label}
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {prefix}{formattedValue}
                </h3>
                {secondaryText && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                        {secondaryText}
                    </p>
                )}
            </div>
        </div>
    );
};

export default HoverGradientStatCard;

