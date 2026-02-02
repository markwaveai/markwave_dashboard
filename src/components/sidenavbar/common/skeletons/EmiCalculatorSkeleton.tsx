import React from 'react';

const EmiCalculatorSkeleton: React.FC = () => {
    return (
        <div className="w-full h-full p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>

            <div className="flex flex-col md:flex-row gap-8 h-4/5">
                {/* Inputs Column */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>

                    <div className="space-y-4">
                        <div className="h-12 bg-gray-100 rounded w-full"></div>
                        <div className="h-12 bg-gray-100 rounded w-full"></div>
                        <div className="h-12 bg-gray-100 rounded w-full"></div>
                    </div>

                    <div className="mt-auto h-12 bg-gray-200 rounded w-full"></div>
                </div>

                {/* Results Column */}
                <div className="w-full md:w-2/3 p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    {/* Circular Chart Placeholder */}
                    <div className="w-64 h-64 rounded-full border-8 border-gray-100 mb-8"></div>

                    <div className="w-full grid grid-cols-2 gap-4 max-w-md">
                        <div className="h-20 bg-gray-50 rounded p-4"></div>
                        <div className="h-20 bg-gray-50 rounded p-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmiCalculatorSkeleton;
