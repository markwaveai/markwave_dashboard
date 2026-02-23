import React, { useState, useEffect, useCallback } from 'react';
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
    const [actionLoading, setActionLoading] = useState<string | null>(null); // Track specific stage being updated

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

    const handleStageUpdateLocal = async (orderId: string, buffaloIds: string[], nextStageId: number) => {
        // Map nextStageId to Specific Backend Status required by user
        let status = '';

        if (nextStageId === 5) status = 'PLACED_TO_MARKET';
        else if (nextStageId === 6) status = 'BOUGHT';
        else if (nextStageId === 7) status = 'IN_QUARANTINE';
        else if (nextStageId === 8) status = 'IN_TRANSIT';

        if (!status) {
            alert("Update not allowed for this stage.");
            return;
        }

        setActionLoading(`${orderId}-${nextStageId}`);

        const payload = {
            orderId: orderId,
            status: status,
            buffaloIds: buffaloIds, // LIST of IDs
            adminMobile: adminMobile,
            description: "",
            location: ""
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.updateOrderStatus(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-admin-mobile': adminMobile
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Refresh tracking data
                const refreshResponse = await fetch(API_ENDPOINTS.getOrderStatus(), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ orderId: orderId })
                });
                const refreshData = await refreshResponse.json();
                if (refreshData.status === 'success') {
                    setRealTrackingData(refreshData);
                }
            } else {
                alert(`Failed to update status: ${data.message}`);
            }
        } catch (err) {
            alert("Error updating status");
        } finally {
            setActionLoading(null);
        }
    };

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                                        <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-base font-bold text-slate-800">{`Cycle ${cycleNum} ${buffaloText}`}</span>
                                                {!isTrackingEnabled && (
                                                    <span className="text-xs text-red-500 mt-1 font-medium">
                                                        Tracking starts in {daysRemaining - TRACKING_WINDOW_DAYS} days ({new Date(targetDate).toLocaleDateString()})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center">
                                                {isTrackingEnabled && (
                                                    <button
                                                        onClick={() => setExpandedTrackerKeys(prev => ({ ...prev, [trackerKey]: !isExpanded }))}
                                                        className="flex items-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border-none cursor-pointer"
                                                    >
                                                        {isExpanded ? 'Minimize' : 'Expand'}
                                                        <span className={`ml-2 text-[10px] transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                                            ▼
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-6 bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {timelineStages.map((stage: any, sIdx: number) => {
                                                    const isLast = sIdx === timelineStages.length - 1;
                                                    const isStepCompleted = stage.id < currentStageId;
                                                    const isCurrent = stage.id === currentStageId;
                                                    const stageDate = tracker.history[stage.id]?.date || '-';
                                                    const stageTime = tracker.history[stage.id]?.time || '-';

                                                    return (
                                                        <div key={stage.id} className="flex min-h-[80px]">
                                                            {/* Date Column */}
                                                            <div className="w-24 text-right pr-4 pt-1 flex-shrink-0">
                                                                <div className="text-xs font-bold text-slate-600">{stageDate}</div>
                                                                {stageTime !== '-' && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{stageTime}</div>}
                                                            </div>

                                                            {/* Marker Column */}
                                                            <div className="flex flex-col items-center mr-4 relative flex-shrink-0">
                                                                {!isLast && (
                                                                    <div className={`absolute top-6 bottom-[-4px] w-0.5 z-0 ${isStepCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                                )}
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-[10px] font-bold border-2 ${isStepCompleted
                                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                    : 'bg-white border-slate-200 text-slate-400'
                                                                    }`}>
                                                                    {isStepCompleted ? '✓' : stage.id}
                                                                </div>
                                                            </div>

                                                            {/* Content Column */}
                                                            <div className={`flex-1 ${!isLast ? 'pb-8' : ''}`}>
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex flex-col">
                                                                        <div className={`text-sm font-bold mb-1 ${isStepCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                                            {stage.label}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                                                                            {(tracker.history[stage.id]?.date && tracker.history[stage.id]?.date !== '-') ? `(${tracker.history[stage.id]?.description || stage.description})` : null}
                                                                        </div>
                                                                    </div>

                                                                    {(isStepCompleted && stage.id === currentStageId - 1) && stage.id >= 4 && stage.id < 8 && (
                                                                        <button
                                                                            className={`ml-4 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors shadow-sm border-none cursor-pointer whitespace-nowrap ${actionLoading === `${orderId}-${stage.id + 1}` ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                                            onClick={() => handleStageUpdateLocal(orderId, buffaloIds, stage.id + 1)}
                                                                            disabled={actionLoading === `${orderId}-${stage.id + 1}`}
                                                                        >
                                                                            {(() => {
                                                                                const nextId = stage.id + 1;
                                                                                if (actionLoading === `${orderId}-${nextId}`) return 'Updating...';
                                                                                if (nextId === 5) return 'Update Placed to Market';
                                                                                if (nextId === 6) return 'Update Bought';
                                                                                if (nextId === 7) return 'Update In Quarantine';
                                                                                if (nextId === 8) return 'Update In Transit';
                                                                                return 'Update';
                                                                            })()}
                                                                        </button>
                                                                    )}

                                                                    {stage.status === 'COMPLETED' && !((isStepCompleted && stage.id === currentStageId - 1) && stage.id >= 4 && stage.id < 8) && (
                                                                        <span className="ml-4 px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 whitespace-nowrap">
                                                                            Completed
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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
