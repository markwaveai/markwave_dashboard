import React, { useState, useEffect, useCallback } from 'react';
import {
    Store,
    Pencil,
    Loader2,
    Search,
    Filter,
    RefreshCw,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { marketService } from '../../../services/api';
import { Market } from '../../../types';
import Snackbar from '../../common/Snackbar';
import CreateMarketModal from './CreateMarketModal';

interface MarketListTabProps {
    isSuperAdmin: boolean;
    adminMobile?: string;
}

const MarketListTab: React.FC<MarketListTabProps> = ({ isSuperAdmin, adminMobile }) => {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


    const fetchMarkets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await marketService.getMarkets();
            setMarkets(data);
        } catch (error) {
            console.error('Error fetching markets:', error);
            setSnackbar({ message: 'Failed to fetch markets', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    const handleEditClick = (market: Market) => {
        setSelectedMarket(market);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (marketId: string, currentStatus: boolean) => {
        if (!isSuperAdmin || !adminMobile) return;

        setTogglingId(marketId);
        try {
            const response = await marketService.toggleMarketStatus(marketId, !currentStatus, adminMobile);
            if (response.error) {
                setSnackbar({ message: response.error, type: 'error' });
            } else {
                setSnackbar({ message: response.message || 'Status updated', type: 'success' });
                fetchMarkets();
            }
        } catch (error) {
            setSnackbar({ message: 'Failed to update status', type: 'error' });
        } finally {
            setTogglingId(null);
        }
    };


    const filteredMarkets = Array.isArray(markets) ? markets : [];


    const formatDate = (dateString: string) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Market Management Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                            <Store size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Market Inventory</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    </div>

                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="relative">
                                <Loader2 className="animate-spin text-blue-600" size={48} />
                                <Store className="absolute inset-0 m-auto text-blue-600/30" size={20} />
                            </div>
                            <p className="text-slate-500 font-medium">Fetching market information...</p>
                        </div>
                    ) : filteredMarkets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <div className="bg-slate-50 p-6 rounded-full text-slate-300">
                                <Store size={48} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">No Markets Found</h3>
                                <p className="text-slate-500 text-sm max-w-xs mt-1">
                                    Your marketplace is empty. Start by adding a new market.
                                </p>
                            </div>

                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50/80 backdrop-blur-sm text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-6 py-4">Market Name</th>
                                    <th className="px-6 py-4">State</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Added On</th>
                                    {isSuperAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredMarkets.map((market) => (
                                    <tr key={market.id} className="group hover:bg-blue-50/30 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    <Store size={16} />
                                                </div>
                                                <span className="font-bold text-slate-700">{market.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-slate-600">{market.state || '---'}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <AlertCircle size={14} className="text-slate-400" />
                                                <span className="text-sm font-medium">{market.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(market.id, market.isActive)}
                                                disabled={togglingId === market.id || !isSuperAdmin}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${market.isActive
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    } ${isSuperAdmin ? 'hover:scale-105 cursor-pointer active:scale-95' : 'cursor-default'} ${togglingId === market.id ? 'opacity-50 animate-pulse' : ''}`}
                                            >
                                                {market.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </button>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar size={14} />
                                                    <span className="text-xs font-bold">{formatDate(market.createdAt)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        onClick={() => handleEditClick(market)}
                                                        className="p-2 rounded-xl transition-all text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                        title="Edit Market"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>

                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && filteredMarkets.length > 0 && (
                    <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            Showing {filteredMarkets.length} {filteredMarkets.length === 1 ? 'Market' : 'Markets'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modals & Popups */}
            <CreateMarketModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMarket(null);
                }}
                onSuccess={(msg) => {
                    setSnackbar({ message: msg, type: 'success' });
                    fetchMarkets();
                }}
                initialData={selectedMarket ? {
                    id: selectedMarket.id,
                    name: selectedMarket.name,
                    state: selectedMarket.state,
                    location: selectedMarket.location,
                    isActive: selectedMarket.isActive
                } : null}
                isEditMode={!!selectedMarket}
                adminMobile={adminMobile}
            />

            {snackbar && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar(null)}
                />
            )}
        </div>
    );
};

export default MarketListTab;
