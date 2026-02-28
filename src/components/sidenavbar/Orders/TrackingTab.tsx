import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { API_ENDPOINTS } from '../../../config/api';


interface TrackingTabProps {
    orderId: string;
    expandedTrackerKeys: Record<string, boolean>;
    setExpandedTrackerKeys: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const TrackingTab: React.FC<TrackingTabProps> = ({ orderId, expandedTrackerKeys, setExpandedTrackerKeys }) => {
    const adminMobile = useAppSelector((state) => state.auth.adminMobile || '9999999999');

    // Real Tracking Integration
    const [realTrackingData, setRealTrackingData] = useState<any>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        if (orderId) {
            setTrackingLoading(true);
            const fetchTracking = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(API_ENDPOINTS.getOrderStatus(), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ orderId: orderId })
                    });
                    const data = await response.json();
                    if (data.status === 'success') {
                        setRealTrackingData(data);
                    }
                } catch (err) {
                    // Silently fail or handle error
                } finally {
                    setTrackingLoading(false);
                }
            };
            fetchTracking();
        } else {
            setRealTrackingData(null);
        }
    }, [orderId]);

    // Process specific phase/cycle stages from the new API structure
    const processPhaseStages = useCallback((phaseData: any) => {
        if (!phaseData || !phaseData.stages) return { currentStageId: 1, history: {}, stages: [] };

        const history: any = {};
        let maxStageId = 1;

        const dynamicStages = phaseData.stages.map((item: any) => {
            let label = '';
            if (item.stage === 'BUFFALOS_BOUGHT') {
                label = 'Buffaloes Bought';
            } else {
                label = item.stage
                    .split('_')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            }

            return {
                id: item.id,
                label: label,
                description: item.description,
                status: item.status,
                rawStage: item.stage
            };
        }).sort((a: any, b: any) => a.id - b.id);

        phaseData.stages.forEach((item: any) => {
            const sId = item.id;
            if (sId) {
                if (item.timestamp) {
                    const dateObj = new Date(item.timestamp);
                    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
                    history[sId] = { date: dateStr, time: timeStr, description: item.description };
                } else if (item.description) {
                    history[sId] = { date: '-', time: '-', description: item.description };
                }

                if (item.status === 'COMPLETED') {
                    maxStageId = Math.max(maxStageId, sId + 1);
                }
            }
        });

        if (dynamicStages.length > 0) {
            const lastId = dynamicStages[dynamicStages.length - 1].id;
            if (maxStageId > lastId + 1) maxStageId = lastId + 1;
        }

        return { currentStageId: maxStageId, history, stages: dynamicStages };
    }, []);


    if (trackingLoading) {
        return <div className="p-4 text-center">Loading Tracking Details...</div>;
    }

    if (!realTrackingData) {
        return <div className="p-4 text-center text-gray-500">No tracking data available.</div>;
    }

    return (

        <div className="transition-all duration-300 ease-in-out">
            <div className="block">
                <div className="w-full">
                    <div className="flex flex-col gap-3">

                        {realTrackingData?.deliveryPhases ? (
                            realTrackingData.deliveryPhases.map((phase: any, index: number) => {
                                const cycleNum = phase.phase;
                                const tracker = processPhaseStages(phase);
                                const TRACKING_WINDOW_DAYS = 15;

                                // Tracking enablement logic
                                let isTrackingEnabled = true;
                                let daysRemaining = 0;
                                const targetDate = phase.scheduledDate || phase.scheduled_date;

                                if (targetDate) {
                                    const scheduledDate = new Date(targetDate);
                                    scheduledDate.setHours(0, 0, 0, 0);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const diffTime = scheduledDate.getTime() - today.getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    daysRemaining = diffDays;

                                    // Cycle 2 restriction: Only enable if scheduled date has arrived
                                    if (cycleNum === 2 && diffDays > 0) {
                                        isTrackingEnabled = false;
                                    }
                                }

                                const currentStageId = tracker.currentStageId;
                                const trackerKey = `${orderId}-${cycleNum}`;
                                const isExpanded = isTrackingEnabled && (expandedTrackerKeys[trackerKey] !== false);
                                const timelineStages = tracker.stages || [];
                                const buffaloIds = phase.buffaloIds || [];

                                // Text formatting
                                const buffaloCount = buffaloIds.length;
                                const buffaloText = buffaloCount === 1
                                    ? '(1 Buffalo)'
                                    : `(${buffaloCount} Buffaloes)`;

                                return (
                                    <div key={cycleNum} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div
                                            className="p-3.5 border-b border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => isTrackingEnabled && setExpandedTrackerKeys(prev => ({ ...prev, [trackerKey]: !isExpanded }))}
                                        >
                                            {isTrackingEnabled && (
                                                <div className="flex items-center justify-center w-6">
                                                    <ChevronRight
                                                        size={16}
                                                        className={`text-slate-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex flex-col flex-1">
                                                <span className="text-sm font-bold text-slate-800">{`Cycle ${cycleNum} ${buffaloText}`}</span>
                                                {!isTrackingEnabled && (
                                                    <span className="text-[11px] text-red-500 mt-0.5 font-medium">
                                                        Tracking starts in {daysRemaining - TRACKING_WINDOW_DAYS} days ({new Date(targetDate).toLocaleDateString()})
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 bg-slate-50/50 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex flex-row min-w-max pb-2 pt-1 relative">
                                                    {timelineStages.map((stage: any, sIdx: number) => {
                                                        const isLast = sIdx === timelineStages.length - 1;
                                                        const isStepCompleted = stage.id < currentStageId;
                                                        // const isCurrent = stage.id === currentStageId;
                                                        const stageDate = tracker.history[stage.id]?.date || '-';
                                                        const stageTime = tracker.history[stage.id]?.time || '-';

                                                        return (
                                                            <div key={stage.id} className="flex flex-col items-center w-[180px] relative">
                                                                {/* Date Column - MOVE TO TOP */}
                                                                <div className="text-center mb-1 flex flex-col justify-end h-8">
                                                                    <div className="text-[11px] font-bold text-slate-600">{stageDate}</div>
                                                                    {stageTime !== '-' && <div className="text-[9px] text-slate-400 font-medium mt-0">{stageTime}</div>}
                                                                </div>

                                                                {/* Marker & Line Container */}
                                                                <div className="relative w-full flex justify-center mb-2">
                                                                    {/* Horizontal Connector Line */}
                                                                    {!isLast && (
                                                                        <div className={`absolute top-1/2 -translate-y-1/2 left-[calc(50%+10px)] right-[calc(-50%+10px)] h-0.5 z-0 ${isStepCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                                    )}

                                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 relative z-10 ${isStepCompleted
                                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                        : 'bg-white border-slate-200 text-slate-400'
                                                                        }`}>
                                                                        {isStepCompleted ? '✓' : stage.id}
                                                                    </div>
                                                                </div>

                                                                {/* Content Column */}
                                                                <div className="flex flex-col items-center text-center px-1">
                                                                    <div className={`text-xs font-bold mb-1 ${isStepCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                                        {stage.label}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-500 font-medium leading-tight mb-1.5 h-6 overflow-hidden">
                                                                        {(tracker.history[stage.id]?.date && tracker.history[stage.id]?.date !== '-') ? `(${tracker.history[stage.id]?.description || stage.description})` : null}
                                                                    </div>

                                                                    {stage.status === 'COMPLETED' && (
                                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold border border-emerald-200 whitespace-nowrap">
                                                                            Completed
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackingTab;
