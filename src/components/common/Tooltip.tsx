import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactElement;
    className?: string;
    disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '', disabled = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            // Default position: Right of the item
            let top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            let left = triggerRect.right + 8; // 8px gap

            // Vertical collision detection
            const padding = 8;
            if (top < padding) {
                top = padding;
            } else if (top + tooltipRect.height > window.innerHeight - padding) {
                top = window.innerHeight - tooltipRect.height - padding;
            }

            // Horizontal collision detection (if needed, but sidebar is usually on the left)
            if (left + tooltipRect.width > window.innerWidth - padding) {
                left = triggerRect.left - tooltipRect.width - 8;
            }

            setCoords({ top, left });
        }
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isVisible]);

    const handleMouseEnter = () => {
        if (!disabled) setIsVisible(true);
    };
    const handleMouseLeave = () => setIsVisible(false);

    return (
        <>
            {React.cloneElement(children, {
                ref: triggerRef,
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
            } as any)}
            {isVisible && createPortal(
                <div
                    ref={tooltipRef}
                    className={`fixed z-[9999] px-2 py-1 bg-[var(--color-gray-800)] text-white text-xs rounded shadow-xl pointer-events-none transition-opacity whitespace-nowrap border border-[var(--color-gray-700)] animate-in fade-in zoom-in-95 duration-100 ${className}`}
                    style={{
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                >
                    {content}
                </div>,
                document.body
            )}
        </>
    );
};

export default Tooltip;
