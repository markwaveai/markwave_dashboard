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
        <div className={clsx("relative rounded-3xl p-6 h-full flex flex-col justify-between min-h-[180px] transition-transform hover:-translate-y-1 duration-300", theme.bg)}>
            <div className="flex justify-between items-start">
                <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4", theme.iconBg, theme.iconColor)}>
                    {typeof Icon === 'string' ? (
                        <img src={Icon} alt={label} className="w-6 h-6 object-contain" />
                    ) : (
                        Icon && <Icon size={24} strokeWidth={2} />
                    )}
                </div>
            </div>

            <div className="mt-auto">
                <p className={clsx("text-[11px] font-bold uppercase tracking-wider mb-1", theme.labelColor)}>
                    {label}
                </p>
                <div className={clsx("text-3xl font-extrabold tracking-tight", theme.valueColor)}>
                    {prefix}{formattedValue}
                </div>
                {secondaryText && (
                    <p className={clsx("text-xs font-bold mt-1", theme.secondaryColor)}>
                        ~ {secondaryText}
                    </p>
                )}
            </div>
        </div>
    );
};

export default HoverGradientStatCard;

