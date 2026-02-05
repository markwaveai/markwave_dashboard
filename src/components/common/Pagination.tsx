import React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    // For mobile, we show fewer pages to prevent overflow
    if (isMobile) {
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
        }
    } else {
        // Desktop logic (Existing)
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
    }

    return (
        <div className="flex items-center justify-between py-4 mt-4 border-t border-slate-200">
            <button
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex gap-1 sm:gap-1.5">
                {pages.map((page, index) => (
                    <button
                        key={index}
                        className={`min-w-[32px] h-8 flex items-center justify-center border rounded-md text-sm font-medium transition-colors cursor-pointer disabled:cursor-default
                            ${page === currentPage
                                ? 'bg-blue-50 text-blue-600 border-blue-100 font-semibold'
                                : page === '...'
                                    ? 'border-transparent text-slate-500 cursor-default'
                                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        disabled={page === '...'}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default Pagination;
