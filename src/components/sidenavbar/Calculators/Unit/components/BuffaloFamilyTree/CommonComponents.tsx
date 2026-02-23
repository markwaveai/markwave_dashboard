
import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Xarrow from "react-xarrows";

const lineColors = [
    "#ff9800", // gen 0 → 1
    "#3f51b5",
    "#009688",
    "#e91e63",
    "#f44336",
    "#9c27b0",
    "#4caf50"
];

// Colors array for different generations
export const colors = [
    "bg-gradient-to-br from-amber-400 to-amber-600",
    "bg-gradient-to-br from-indigo-400 to-indigo-600",
    "bg-gradient-to-br from-teal-400 to-teal-600",
    "bg-gradient-to-br from-pink-400 to-pink-600",
    "bg-gradient-to-br from-red-400 to-red-600",
    "bg-gradient-to-br from-purple-400 to-purple-600",
    "bg-gradient-to-br from-green-400 to-green-600",
];

// Format currency with Lakhs (L) and Crores (Cr) support
export const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 10000000) { // 1 Crore
        return `${sign}₹${(absAmount / 10000000).toFixed(2)} Cr`;
    } else if (absAmount >= 100000) { // 1 Lakh
        return `${sign}₹${(absAmount / 100000).toFixed(2)} L`;
    } else {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }
};

// Format number
export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

// Calculate Age in Months
export const calculateAgeInMonths = (buffalo: any, targetYear: number, targetMonth: number = 0) => {
    const birthYear = buffalo.birthYear;
    // Use birthMonth if available, fall back to acquisitionMonth or 0
    const birthMonth = buffalo.birthMonth !== undefined ? buffalo.birthMonth : (buffalo.acquisitionMonth || 0);
    const totalMonths = (targetYear - birthYear) * 12 + (targetMonth - birthMonth);
    return Math.max(0, totalMonths);
};

// Format Date Range based on Start Day
export const formatMonthDateRange = (year: number, month: number, startDay: number, startOnly: boolean = false) => {
    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Start date is the `startDay` of the current month
    const startDate = new Date(year, month, startDay);

    // End date is `startDay - 1` of the NEXT month
    const endDate = new Date(year, month + 1, startDay - 1);

    // Formatting helper
    const formatDate = (date: Date) => `${date.getDate()} ${monthNamesShort[date.getMonth()]}`;

    if (startOnly) {
        return formatDate(startDate);
    }

    // Special case handling if startDay is 1
    if (startDay === 1) {
        return monthNamesShort[month]; // Just return "Jan", "Feb" etc
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Get Buffalo Value by Age
// Get Buffalo Value by Age
export const getBuffaloValueByAge = (ageInMonths: number) => {
    if (ageInMonths >= 41) {
        return 175000;
    } else if (ageInMonths >= 35) {
        return 150000;
    } else if (ageInMonths >= 25) {
        return 100000;
    } else if (ageInMonths >= 19) {
        return 40000;
    } else if (ageInMonths >= 13) {
        return 25000;
    } else {
        return 10000;
    }
};

// Build tree function
export const buildTree = (root: any, all: any[]) => {
    return all.filter((b: any) => b.parentId === root.id);
};

// Buffalo Node Component - Memoized to prevent unnecessary re-renders in large trees
export const BuffaloNode = React.memo(({
    data,
    founder,
    displayName,
    elementId,
    parentDisplayName,
    variant = 'circle',
    tooltipPosition = 'bottom'
}: {
    data: any;
    founder?: boolean;
    displayName: string;
    elementId: string;
    parentDisplayName?: string;
    variant?: 'circle' | 'pill';
    tooltipPosition?: 'bottom' | 'right';
}) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const birthMonthName = monthNames[data.acquisitionMonth] || "Jan";

    // Tooltip positioning classes
    const tooltipClasses = tooltipPosition === 'right'
        ? "absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block z-50 w-48 transition-opacity duration-200"
        : "absolute top-full left-1/2 -translate-x-1/2 mt-3 hidden group-hover:block z-50 w-48 transition-opacity duration-200";

    const arrowClasses = tooltipPosition === 'right'
        ? "absolute top-1/2 right-full -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-slate-800 drop-shadow-sm"
        : "absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-800 drop-shadow-sm";

    // Node shape classes
    const nodeShapeClasses = variant === 'pill'
        ? "w-20 h-10 rounded-xl flex-col"
        : "w-12 h-12 rounded-full flex-col";

    return (
        <div id={elementId} className="flex flex-col items-center group relative z-10 hover:z-50">
            {/* Tooltip using Portal */}
            <SimpleTooltip
                placement={tooltipPosition === 'right' ? 'right' : 'bottom'}
                className="w-48"
                wrapperClassName="flex flex-col items-center"
                content={
                    <div className="text-left">
                        <div className="font-bold text-xs mb-1.5 border-b border-slate-600 pb-1.5 text-white">
                            Buffalo {displayName} ({data.ageInMonths >= 34 ? 'Milking' : 'Non-Milking'})
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Age:</span>
                                <span className="font-semibold text-slate-200">{Math.floor(data.ageInMonths / 12)}y {data.ageInMonths % 12}m</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                                <span className="text-slate-400">Lifetime Revenue:</span>
                                <span className="font-bold text-emerald-400">{formatCurrency(data.lifetimeRevenue)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-400">Asset Value:</span>
                                <span className="font-bold text-blue-400">{formatCurrency(data.currentAssetValue)}</span>
                            </div>
                        </div>
                    </div> as any
                }
            >
                <div
                    className={`${colors[data.generation % colors.length]}
              ${nodeShapeClasses} flex justify-center items-center
              text-white shadow-md transform transition-all duration-200
              hover:scale-110 border-none cursor-pointer relative`}
                >
                    <div className="text-[10px] font-bold drop-shadow-md leading-tight text-center px-1">
                        {displayName}
                    </div>
                    <div className="text-[8px] font-medium opacity-90 bg-black/20 px-1 py-0 rounded-full mt-0.5">
                        {founder ? 'F' : data.birthYear}
                    </div>
                </div>
            </SimpleTooltip>
        </div>
    );
});

// Tree Branch Component with Xarrow - FIXED VERSION
export const TreeBranch = ({ parent, all, level = 0, getDisplayName, zoom = 1 }: any) => {
    const kids = buildTree(parent, all);
    const [forceUpdate, setForceUpdate] = useState(0);

    // Force update arrows when zoom changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setForceUpdate(prev => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
    }, [zoom]);

    if (kids.length === 0) return null;

    return (
        <div className="flex flex-col items-center mt-6">
            {/* Connecting line from parent */}
            <div className="h-10 w-0.5 bg-gradient-to-b from-gray-300 to-gray-400"></div>

            <div className="flex flex-wrap gap-6 justify-center items-start relative">
                {kids.map((child: any, index: number) => {
                    const parentId = `buffalo-${parent.id}`;
                    const childId = `buffalo-${child.id}`;

                    return (
                        <div key={`${child.id}-${forceUpdate}`} className="flex flex-col items-center relative">
                            {/* Child Node */}
                            <BuffaloNode
                                data={child}
                                displayName={getDisplayName(child)}
                                parentDisplayName={getDisplayName(parent)}
                                elementId={childId}
                            />

                            {/* Recursive children */}
                            <TreeBranch
                                parent={child}
                                all={all}
                                level={level + 1}
                                getDisplayName={getDisplayName}
                                zoom={zoom}
                            />

                            {/* Line between parent → child - Force update on zoom */}
                            <Xarrow
                                key={`arrow-${parent.id}-${child.id}-${forceUpdate}`}
                                start={parentId}
                                end={childId}
                                color={lineColors[parent.generation % lineColors.length]}
                                strokeWidth={2.5}
                                curveness={0.6}
                                showHead={true}
                                headSize={4}
                                path="smooth"
                                dashness={false}
                                startAnchor="bottom"
                                endAnchor="top"
                                zIndex={10}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const SimpleTooltip = ({
    children,
    content,
    placement = 'left',
    className = '',
    wrapperClassName = ''
}: {
    children: React.ReactNode,
    content: string | React.ReactNode,
    placement?: 'left' | 'bottom' | 'top' | 'right' | 'bottom-right',
    className?: string,
    wrapperClassName?: string
}) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const updatePos = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        let top = 0, left = 0;

        if (placement === 'left') {
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
        } else if (placement === 'top') {
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
        } else if (placement === 'right') {
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
        } else if (placement === 'bottom-right') {
            top = rect.bottom + 8;
            left = rect.right;
        } else {
            // bottom (default)
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
        }
        setPos({ top, left });
    }, [placement]);

    const handleEnter = useCallback(() => {
        updatePos();
        setShow(true);
    }, [updatePos]);

    const handleLeave = useCallback(() => {
        setShow(false);
    }, []);

    const transformStyle =
        placement === 'left' ? 'translateX(-100%) translateY(-50%)'
            : placement === 'right' ? 'translateY(-50%)'
                : placement === 'top' ? 'translateX(-50%) translateY(-100%)'
                    : placement === 'bottom-right' ? 'translateX(-100%)'
                        : 'translateX(-50%)'; // bottom

    const arrowClasses = placement === 'left'
        ? "absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-slate-800"
        : placement === 'right'
            ? "absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-slate-800"
            : placement === 'top'
                ? "absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-800"
                : placement === 'bottom-right'
                    ? "absolute bottom-full right-4 w-0 h-0 border-x-[6px] border-x-transparent border-b-[6px] border-b-slate-800"
                    : "absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-b-[6px] border-b-slate-800"; // bottom arrow

    const maxWidthClass = className.includes('max-w-') ? '' : 'max-w-[200px]';

    const tooltipEl = show ? ReactDOM.createPortal(
        <div
            style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                transform: transformStyle,
                zIndex: 99999,
                pointerEvents: 'none',
            }}
        >
            <div className={`bg-slate-800 text-white text-[11px] font-medium rounded p-2 shadow-xl border border-slate-700 relative whitespace-pre-line text-center w-max ${maxWidthClass} ${className}`}>
                {content}
                <div className={arrowClasses}></div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div
            ref={triggerRef}
            className={`relative ${wrapperClassName}`}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {children}
            {tooltipEl}
        </div>
    );
};
