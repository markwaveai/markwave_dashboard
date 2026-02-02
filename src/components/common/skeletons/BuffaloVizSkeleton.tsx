import React from 'react';

const BuffaloVizSkeleton: React.FC = () => {
    return (
        <div className="w-full h-full p-6 animate-pulse flex flex-col gap-6">
            {/* Header */}
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>

            {/* Main Content - Large Canvas area */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Mock Chart/Graph Bars */}
                <div className="absolute inset-0 p-8 flex items-end justify-around">
                    <div className="w-16 h-[40%] bg-gray-100 rounded-t-lg"></div>
                    <div className="w-16 h-[70%] bg-gray-100 rounded-t-lg"></div>
                    <div className="w-16 h-[50%] bg-gray-100 rounded-t-lg"></div>
                    <div className="w-16 h-[80%] bg-gray-100 rounded-t-lg"></div>
                    <div className="w-16 h-[60%] bg-gray-100 rounded-t-lg"></div>
                </div>
                {/* Overlay to fade it out slightly */}
                <div className="absolute inset-0 bg-white/30"></div>
            </div>
        </div>
    );
};

export default BuffaloVizSkeleton;
