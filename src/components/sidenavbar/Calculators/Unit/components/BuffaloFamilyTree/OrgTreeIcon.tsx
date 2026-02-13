import React from 'react';

interface OrgTreeIconProps {
    className?: string; // Allow passing className for sizing/color
}

const OrgTreeIcon: React.FC<OrgTreeIconProps> = ({ className = "w-6 h-6" }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Top Person - Centered */}
            <rect x="10" y="2" width="4" height="4" rx="0.5" />

            {/* Connecting Lines Level 1 - Vertical from Top */}
            <path d="M12 6V8H6V10M12 8H18V10" stroke="currentColor" strokeWidth="1.5" fill="none" />

            {/* Middle People - Two groups */}
            <rect x="4" y="10" width="4" height="4" rx="0.5" />
            <rect x="16" y="10" width="4" height="4" rx="0.5" />

            {/* Connecting Lines Level 2 - Left Branch */}
            <path d="M6 14V16H3V18M6 16H9V18" stroke="currentColor" strokeWidth="1.5" fill="none" />

            {/* Connecting Lines Level 2 - Right Branch */}
            <path d="M18 14V16H15V18M18 16H21V18" stroke="currentColor" strokeWidth="1.5" fill="none" />

            {/* Bottom People - Left Branch (2 nodes) */}
            <rect x="1" y="18" width="4" height="4" rx="0.5" />
            <rect x="7" y="18" width="4" height="4" rx="0.5" />

            {/* Bottom People - Right Branch (2 nodes) */}
            <rect x="13" y="18" width="4" height="4" rx="0.5" />
            <rect x="19" y="18" width="4" height="4" rx="0.5" />
        </svg>
    );
};

export default OrgTreeIcon;
