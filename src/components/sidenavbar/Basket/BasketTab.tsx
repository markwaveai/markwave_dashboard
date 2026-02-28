import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, RotateCcw, ShoppingBasket, Truck, ShieldCheck, Box, CheckCircle2, Layers, Loader2, AlertCircle, User } from 'lucide-react';
import { procurementService, marketService } from '../../../services/api';
import { Market } from '../../../types';
import { useAppSelector } from '../../../store/hooks';


const BasketTab: React.FC = () => {
    const adminMobile = useAppSelector((state) => state.auth.adminMobile);
    const [activePhase, setActivePhase] = useState('Phase 1');
    const [activeMainFilter, setActiveMainFilter] = useState('Basket');
    const [activeSubFilter, setActiveSubFilter] = useState('Waiting for market assign');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingIds, setProcessingIds] = useState<string[]>([]);
    const [selectedBuffaloIds, setSelectedBuffaloIds] = useState<string[]>([]);
    const [selectedMarkets, setSelectedMarkets] = useState<Record<string, string>>({});
    const [markets, setMarkets] = useState<string[]>([]);



    const phasesList = ['Phase 1', 'Phase 2'];

    const mainFilters = [
        { id: 'Basket', label: 'Basket', icon: <ShoppingBasket size={18} /> },
        { id: 'Procurement', label: 'Procurement (5 days)', icon: <Layers size={18} /> },
        { id: 'Market Quarantine', label: 'Market Quarantine (7 days)', icon: <ShieldCheck size={18} /> },
        { id: 'In transit', label: 'In transit (10 days)', icon: <Truck size={18} /> },
        { id: 'local quarantine', label: 'Local Quarantine (7 days)', icon: <ShieldCheck size={18} /> },
        { id: 'Ready for delivery', label: 'Ready for delivery', icon: <CheckCircle2 size={18} /> },
    ];

    const procurementSubFilters = [
        'Waiting for market assign',
        'Procurement in Progress'
    ];

    const getApiStage = useCallback(() => {
        if (activeMainFilter === 'Basket') {
            return activePhase === 'Phase 1' ? 'BASKET' : 'PHASE2_BASKET';
        }
        if (activeMainFilter === 'Procurement') {
            return activeSubFilter === 'Waiting for market assign' ? 'PROCUREMENT_STARTED' : 'PROCUREMENT_IN_PROGRESS';
        }
        if (activeMainFilter === 'Market Quarantine') return 'MARKET_QUARANTINE';
        if (activeMainFilter === 'In transit') return 'IN_TRANSIT';
        if (activeMainFilter === 'local quarantine') return 'LOCAL_QUARANTINE';
        if (activeMainFilter === 'Ready for delivery') return 'DELIVERED';
        return 'BASKET';
    }, [activePhase, activeMainFilter, activeSubFilter]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const stage = getApiStage();
            const params: any = { stage };
            if (selectedDate) {
                params.date = selectedDate;
            }
            const result = await procurementService.getProcurementRoster(params);
            setData(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tracking data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [getApiStage, selectedDate]);

    const handleAction = async (buffaloIds: string[]) => {
        if (!buffaloIds.length) return;
        setProcessingIds((prev: string[]) => [...prev, ...buffaloIds]);
        try {
            await procurementService.performProcurementAction({
                action: 'start_procurement',
                buffaloIds: buffaloIds,
                sendNotification: true,
                adminMobile: adminMobile
            });
            // Clear selection for these IDs
            setSelectedBuffaloIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
            // Refresh data after successful action
            fetchData();
        } catch (err: any) {
            console.error('Action failed:', err);
        } finally {
            setProcessingIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
        }
    };

    const handleMarketAssignment = async (buffaloIds: string[], marketName: string, approvedDate: string) => {
        if (!buffaloIds.length || !marketName) return;
        setProcessingIds((prev: string[]) => [...prev, ...buffaloIds]);
        try {
            await procurementService.performProcurementAction({
                action: 'assign_market',
                buffaloIds: buffaloIds,
                marketName: marketName,
                sendNotification: true,
                adminMobile: adminMobile
            });
            // Clear selection and market selection
            setSelectedBuffaloIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
            setSelectedMarkets(prev => {
                const newState = { ...prev };
                delete newState[approvedDate];
                return newState;
            });
            fetchData();
        } finally {
            setProcessingIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
        }
    };

    const handleBoughtAction = async (buffaloIds: string[]) => {
        if (!buffaloIds.length) return;
        setProcessingIds((prev: string[]) => [...prev, ...buffaloIds]);
        try {
            await procurementService.performProcurementAction({
                action: 'mark_bought',
                buffaloIds: buffaloIds,
                sendNotification: true,
                adminMobile: adminMobile
            });
            // Clear selection for these IDs
            setSelectedBuffaloIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
            // Refresh data after successful action
            fetchData();
        } catch (err: any) {
            console.error('Bought action failed:', err);
        } finally {
            setProcessingIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
        }
    };

    const handleTransportAction = async (buffaloIds: string[]) => {
        if (!buffaloIds.length) return;
        setProcessingIds((prev: string[]) => [...prev, ...buffaloIds]);
        try {
            await procurementService.performProcurementAction({
                action: 'ready_to_transport',
                buffaloIds: buffaloIds,
                sendNotification: true,
                adminMobile: adminMobile
            });
            setSelectedBuffaloIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
            fetchData();
        } catch (err: any) {
            console.error('Transport action failed:', err);
        } finally {
            setProcessingIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
        }
    };

    const handleLocalQuarantineAction = async (buffaloIds: string[]) => {
        if (!buffaloIds.length) return;
        setProcessingIds((prev: string[]) => [...prev, ...buffaloIds]);
        try {
            await procurementService.performProcurementAction({
                action: 'move_to_local_quarantine',
                buffaloIds: buffaloIds,
                sendNotification: true,
                adminMobile: adminMobile
            });
            setSelectedBuffaloIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
            fetchData();
        } catch (err: any) {
            console.error('Local Quarantine action failed:', err);
        } finally {
            setProcessingIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
        }
    };

    const handleDeliverAction = async (buffaloIds: string[]) => {
        if (!buffaloIds.length) return;
        setProcessingIds((prev: string[]) => [...prev, ...buffaloIds]);
        try {
            await procurementService.performProcurementAction({
                action: 'deliver',
                buffaloIds: buffaloIds,
                sendNotification: true,
                adminMobile: adminMobile
            });
            setSelectedBuffaloIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
            fetchData();
        } catch (err: any) {
            console.error('Deliver action failed:', err);
        } finally {
            setProcessingIds((prev: string[]) => prev.filter((id: string) => !buffaloIds.includes(id)));
        }
    };

    const toggleSelection = (buffaloId: string) => {
        setSelectedBuffaloIds((prev: string[]) =>
            prev.includes(buffaloId)
                ? prev.filter((id: string) => id !== buffaloId)
                : [...prev, buffaloId]
        );
    };

    const toggleGroupSelection = (buffaloes: any[]) => {
        const groupIds = buffaloes.map((b: any) => b.buffaloId || b.id).filter(Boolean);
        const allSelected = groupIds.length > 0 && groupIds.every((id: string) => selectedBuffaloIds.includes(id));

        if (allSelected) {
            setSelectedBuffaloIds((prev: string[]) => prev.filter((id: string) => !groupIds.includes(id)));
        } else {
            setSelectedBuffaloIds((prev: string[]) => {
                const newIds = [...prev];
                groupIds.forEach((id: string) => {
                    if (!newIds.includes(id)) newIds.push(id);
                });
                return newIds;
            });
        }
    };

    const fetchMarkets = useCallback(async () => {
        try {
            const data = await marketService.getMarkets();
            // Filter only active markets and extract names
            const activeMarketNames = (data || [])
                .filter((m: Market) => m.isActive)
                .map((m: Market) => m.name);
            setMarkets(activeMarketNames);
        } catch (error) {
            console.error('Error fetching markets:', error);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchMarkets();
    }, [fetchData, fetchMarkets]);


    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
                <h2 className="text-2xl font-bold m-0 text-slate-800 shrink-0 flex items-center gap-2">
                    <ShoppingBasket className="text-indigo-600" />
                    Basket Tracking
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* Date Filter */}
                    <div className="relative w-full sm:w-[240px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                            <Calendar size={18} />
                        </div>
                        <input
                            type="date"
                            className="h-[42px] pl-10 pr-4 text-sm border-0 shadow-sm rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 w-full font-medium"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    {/* Reset Button */}
                    <button
                        onClick={() => setSelectedDate('')}
                        className="flex items-center gap-2 px-4 h-[42px] border border-indigo-100 rounded-xl text-sm font-semibold text-indigo-600 bg-white hover:bg-indigo-50 transition-all active:scale-95 shadow-sm whitespace-nowrap"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Phase Selection Tabs */}
            <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-fit mb-8">
                {phasesList.map((phase) => (
                    <button
                        key={phase}
                        onClick={() => setActivePhase(phase)}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-none cursor-pointer flex items-center gap-2 ${activePhase === phase
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <Layers size={16} />
                        {phase}
                    </button>
                ))}
            </div>

            {/* Main Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {mainFilters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveMainFilter(filter.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer ${activeMainFilter === filter.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
                            }`}
                    >
                        {filter.icon}
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Procurement Sub-filters */}
            {activeMainFilter === 'Procurement' && (
                <div className="flex flex-wrap gap-3 mb-8 animate-in slide-in-from-top-2 duration-300">
                    {procurementSubFilters.map((subFilter) => (
                        <button
                            key={subFilter}
                            onClick={() => setActiveSubFilter(subFilter)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-none cursor-pointer ${activeSubFilter === subFilter
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm'
                                }`}
                        >
                            {subFilter}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Display Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShoppingBasket size={24} className="text-indigo-400" />
                            </div>
                        </div>
                        <p className="mt-6 text-slate-500 font-bold animate-pulse">Fetching tracking data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-rose-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Sync Failed</h3>
                        <p className="text-rose-600 font-medium mb-6">{error}</p>
                        <button
                            onClick={fetchData}
                            className="px-8 py-3 bg-white border-2 border-rose-200 text-rose-600 rounded-2xl font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95 shadow-sm"
                        >
                            Try Again
                        </button>
                    </div>
                ) : data.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Box className="text-slate-200" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Items Found</h3>
                        <p className="text-slate-500 text-base max-w-sm mx-auto font-sans">
                            There are currently no items in the <strong>{activePhase}</strong> - <strong>{activeMainFilter}</strong> {activeMainFilter === 'Procurement' ? `(${activeSubFilter})` : ''} stage {selectedDate ? `for ${new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {data.map((group, groupIdx) => {
                            const groupIds = (group.buffaloes || []).map((b: any) => b.buffaloId || b.id).filter(Boolean);
                            const selectedInGroup = groupIds.filter((id: string) => selectedBuffaloIds.includes(id));
                            const isGroupProcessing = groupIds.some((id: string) => processingIds.includes(id));
                            const displayDate = group.date || group.approvedDate || group.filterDate || '';

                            return (
                                <div key={displayDate || groupIdx} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Group Header */}
                                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                                <Calendar size={20} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 m-0">
                                                    Date: {displayDate ? new Date(displayDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 font-medium m-0">Total buffaloes: {group.totalBuffaloes || group.buffaloes?.length || 0}</p>
                                            </div>
                                        </div>

                                        {/* Batch Action Buttons */}
                                        <div className="flex items-center gap-3">
                                            {activeMainFilter === 'Basket' && (
                                                <button
                                                    onClick={() => handleAction(selectedInGroup)}
                                                    disabled={isGroupProcessing || selectedInGroup.length === 0}
                                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${isGroupProcessing || selectedInGroup.length === 0
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 animate-in slide-in-from-right-4 duration-300'
                                                        }`}
                                                >
                                                    {isGroupProcessing ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <ShoppingBasket size={18} />
                                                    )}
                                                    Start Procurement {selectedInGroup.length > 0 ? `(${selectedInGroup.length})` : ''}
                                                </button>
                                            )}

                                            {activeMainFilter === 'Procurement' && activeSubFilter === 'Waiting for market assign' && (
                                                <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                                                    <select
                                                        value={selectedMarkets[displayDate] || ''}
                                                        onChange={(e) => setSelectedMarkets(prev => ({ ...prev, [displayDate]: e.target.value }))}
                                                        className="h-[42px] px-4 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium min-w-[180px]"
                                                    >
                                                        <option value="">Select Market</option>
                                                        {markets.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <button
                                                        onClick={() => handleMarketAssignment(selectedInGroup, selectedMarkets[displayDate], displayDate as string)}
                                                        disabled={isGroupProcessing || selectedInGroup.length === 0 || !selectedMarkets[displayDate]}
                                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${isGroupProcessing || selectedInGroup.length === 0 || !selectedMarkets[displayDate]
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                                            }`}
                                                    >
                                                        {isGroupProcessing ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                                        Assign Market {selectedInGroup.length > 0 ? `(${selectedInGroup.length})` : ''}
                                                    </button>
                                                </div>
                                            )}
                                            {activeMainFilter === 'Procurement' && activeSubFilter === 'Procurement in Progress' && (
                                                <button
                                                    onClick={() => handleBoughtAction(selectedInGroup)}
                                                    disabled={isGroupProcessing || selectedInGroup.length === 0}
                                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${isGroupProcessing || selectedInGroup.length === 0
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 animate-in slide-in-from-right-4 duration-300'
                                                        }`}
                                                >
                                                    {isGroupProcessing ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 size={18} />
                                                    )}
                                                    Bought {selectedInGroup.length > 0 ? `(${selectedInGroup.length})` : ''}
                                                </button>
                                            )}
                                            {activeMainFilter === 'Market Quarantine' && (
                                                <button
                                                    onClick={() => handleTransportAction(selectedInGroup)}
                                                    disabled={isGroupProcessing || selectedInGroup.length === 0}
                                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${isGroupProcessing || selectedInGroup.length === 0
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 animate-in slide-in-from-right-4 duration-300'
                                                        }`}
                                                >
                                                    {isGroupProcessing ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Truck size={18} />
                                                    )}
                                                    Ready to Transport {selectedInGroup.length > 0 ? `(${selectedInGroup.length})` : ''}
                                                </button>
                                            )}
                                            {activeMainFilter === 'In transit' && (
                                                <button
                                                    onClick={() => handleLocalQuarantineAction(selectedInGroup)}
                                                    disabled={isGroupProcessing || selectedInGroup.length === 0}
                                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${isGroupProcessing || selectedInGroup.length === 0
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                                        : 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 animate-in slide-in-from-right-4 duration-300'
                                                        }`}
                                                >
                                                    {isGroupProcessing ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <ShieldCheck size={18} />
                                                    )}
                                                    Move to Local Quarantine {selectedInGroup.length > 0 ? `(${selectedInGroup.length})` : ''}
                                                </button>
                                            )}
                                            {activeMainFilter === 'local quarantine' && (
                                                <button
                                                    onClick={() => handleDeliverAction(selectedInGroup)}
                                                    disabled={isGroupProcessing || selectedInGroup.length === 0}
                                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 ${isGroupProcessing || selectedInGroup.length === 0
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 animate-in slide-in-from-right-4 duration-300'
                                                        }`}
                                                >
                                                    {isGroupProcessing ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 size={18} />
                                                    )}
                                                    Deliver {selectedInGroup.length > 0 ? `(${selectedInGroup.length})` : ''}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Buffalo Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-50">
                                                    {(activeMainFilter === 'Basket' ||
                                                        activeMainFilter === 'Market Quarantine' ||
                                                        activeMainFilter === 'In transit' ||
                                                        activeMainFilter === 'local quarantine' ||
                                                        (activeMainFilter === 'Procurement' && (activeSubFilter === 'Waiting for market assign' || activeSubFilter === 'Procurement in Progress'))) && (
                                                            <th className="px-1 py-4 w-10 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                                    checked={groupIds.length > 0 && groupIds.every((id: string) => selectedBuffaloIds.includes(id))}
                                                                    onChange={() => toggleGroupSelection(group.buffaloes || [])}
                                                                />
                                                            </th>
                                                        )}
                                                    <th className="px-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Buffalo ID</th>
                                                    <th className="px-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Order ID</th>
                                                    <th className="px-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Customer</th>
                                                    {!(activeMainFilter === 'Basket' || (activeMainFilter === 'Procurement' && activeSubFilter === 'Waiting for market assign')) && (
                                                        <th className="px-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Market</th>
                                                    )}
                                                    <th className="px-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Location</th>
                                                    <th className="px-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Notify Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {(group.buffaloes || []).map((item: any, idx: number) => {
                                                    const buffaloId = item.buffaloId || item.id;
                                                    const isSelected = selectedBuffaloIds.includes(buffaloId);
                                                    const isProcessing = processingIds.includes(buffaloId);

                                                    return (
                                                        <tr key={buffaloId || idx} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                                                            {(activeMainFilter === 'Basket' ||
                                                                activeMainFilter === 'Market Quarantine' ||
                                                                activeMainFilter === 'In transit' ||
                                                                activeMainFilter === 'local quarantine' ||
                                                                (activeMainFilter === 'Procurement' && (activeSubFilter === 'Waiting for market assign' || activeSubFilter === 'Procurement in Progress'))) && (
                                                                    <td className="px-1 py-4 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                                            checked={isSelected}
                                                                            onChange={() => toggleSelection(buffaloId)}
                                                                        />
                                                                    </td>
                                                                )}
                                                            <td className="px-1 py-4 whitespace-nowrap text-center">
                                                                <div className="flex items-center gap-3 justify-center">
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                                        <Box size={14} className="text-indigo-600" />
                                                                    </div>
                                                                    <span className="font-bold text-slate-800 text-sm">{buffaloId?.split('-')[0] || 'N/A'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-1 py-4 text-center">
                                                                <span className="text-sm font-semibold text-slate-700">{item.orderId || 'N/A'}</span>
                                                            </td>
                                                            <td className="px-1 py-4 text-center">
                                                                <div className="flex items-center gap-3 justify-center">
                                                                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                                                        <User size={18} />
                                                                    </div>
                                                                    <div className="flex flex-col text-left">
                                                                        <span className="text-sm font-bold text-slate-800">{item.userName || 'N/A'}</span>
                                                                        <span className="text-[11px] text-slate-500 font-medium">
                                                                            + 91 {item.userId || ''}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {!(activeMainFilter === 'Basket' || (activeMainFilter === 'Procurement' && activeSubFilter === 'Waiting for market assign')) && (
                                                                <td className="px-1 py-4 text-center">
                                                                    <div className="flex items-center gap-2 justify-center">
                                                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${item.marketName ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-400'}`}>
                                                                            {item.marketName || 'Not Assigned'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            )}
                                                            <td className="px-1 py-4 text-center">
                                                                <span className="text-sm font-medium text-slate-600">{item.farmLocation || 'N/A'}</span>
                                                            </td>
                                                            <td className="px-1 py-4 whitespace-nowrap text-center">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.isNotificationSent ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                                    {item.isNotificationSent ? 'SENT' : 'PENDING'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasketTab;
