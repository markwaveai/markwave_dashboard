import React, { useState, useEffect, useRef } from 'react';
import {
    Tractor,
    Package,
    PieChart,
    Bell,
    Search,
    Pencil,
    Plus,
    MapPin,
    Loader2
} from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { farmService } from '../../../services/api';
import { Farm, CreateFarmRequest } from '../../../types';
import Snackbar from '../../common/Snackbar';

const FarmManagement: React.FC = () => {
    const { adminMobile } = useAppSelector((state) => state.auth);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('--');
    const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{ message: string | null; type: 'success' | 'error' | null }>({
        message: null,
        type: null,
    });

    // Form state
    const [newFarm, setNewFarm] = useState({
        location: '',
        strength: '',
        status: 'ACTIVE',
    });

    const fetchFarms = async () => {
        try {
            setLoading(true);
            const data = await farmService.getFarms(statusFilter);
            setFarms(data);
        } catch (error) {
            setSnackbar({ message: 'Failed to fetch farms', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarms();
    }, [statusFilter]);

    const handleAddFarm = async () => {
        if (!newFarm.location || !newFarm.strength || !newFarm.status) {
            setSnackbar({ message: 'Please fill in all fields', type: 'error' });
            return;
        }

        if (!adminMobile) {
            setSnackbar({ message: 'Admin mobile number not found. Please log in again.', type: 'error' });
            return;
        }

        try {
            setSubmitting(true);
            const farmData: CreateFarmRequest = {
                location: newFarm.location,
                strength: parseInt(newFarm.strength),
                status: newFarm.status,
            };

            let response;
            if (selectedFarmId) {
                response = await farmService.updateFarm(selectedFarmId, farmData, adminMobile);
            } else {
                response = await farmService.addFarm(farmData, adminMobile);
            }

            if (parseInt(newFarm.strength) <= 0) {
                setSnackbar({ message: 'Capacity must be a positive number', type: 'error' });
                return;
            }

            if (response.error) {
                setSnackbar({ message: response.error, type: 'error' });
            } else {
                setSnackbar({
                    message: selectedFarmId ? 'Farm updated successfully!' : 'Farm added successfully!',
                    type: 'success'
                });
                resetForm();
                fetchFarms(); // Refresh list
            }
        } catch (error) {
            setSnackbar({ message: 'An unexpected error occurred', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewFarm({ location: '', strength: '', status: 'ACTIVE' });
        setSelectedFarmId(null);
    };

    const handleEditClick = (farm: Farm) => {
        setNewFarm({
            location: farm.location,
            strength: farm.strength.toString(),
            status: farm.status,
        });
        setSelectedFarmId(farm.id);
        // Scroll to form and focus
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            locationInputRef.current?.focus();
        }, 100);
    };

    const filteredFarms = farms.filter(farm =>
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateStats = () => {
        const totalFarms = farms.length;
        const globalCapacity = farms.reduce((acc, farm) => acc + (farm.strength || 0), 0);
        const filled = farms.reduce((acc, farm) => acc + (farm.currentUnits || 0), 0);
        const remaining = globalCapacity - filled;

        return [
            { title: 'Total Farms', value: totalFarms.toString(), icon: <Tractor size={20} />, color: 'bg-blue-50 text-blue-600' },
            { title: 'Global Capacity', value: globalCapacity.toLocaleString(), subValue: 'Units', icon: <Package size={20} />, color: 'bg-blue-50 text-blue-600' },
            { title: 'Filled', value: filled.toLocaleString(), subValue: 'Units', icon: <PieChart size={20} />, color: 'bg-blue-50 text-blue-600' },
            { title: 'Remaining', value: remaining.toLocaleString(), subValue: 'Units', icon: <Bell size={20} />, color: 'bg-blue-50 text-blue-600' },
        ];
    };

    const stats = calculateStats();

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-orange-500';
        return 'bg-blue-500';
    };

    const getTextColor = (percentage: number, status?: string) => {
        if (percentage >= 90 || status === 'FULL') return 'text-orange-600';
        return 'text-blue-600';
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen">
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar({ message: null, type: null })}
            />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Farm Management</h1>
            </div>

            {/* Add/Update Farm Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <MapPin size={20} />
                        <span>{selectedFarmId ? 'Update Farm ' : 'Add New Farm '}</span>
                    </div>
                    {selectedFarmId && (
                        <button
                            onClick={resetForm}
                            className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600">Farm Location</label>
                        <input
                            ref={locationInputRef}
                            type="text"
                            placeholder="Enter location (e.g. Kurnool)"
                            value={newFarm.location}
                            onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600">Total Capacity (Units)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="e.g. 5000"
                            value={newFarm.strength}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setNewFarm({ ...newFarm, strength: val });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600">Status</label>
                        <select
                            value={newFarm.status}
                            onChange={(e) => setNewFarm({ ...newFarm, status: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <button
                        onClick={handleAddFarm}
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : selectedFarmId ? (
                            <Pencil size={20} />
                        ) : (
                            <Plus size={20} />
                        )}
                        {selectedFarmId ? 'Update Farm' : 'Add Farm'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`${stat.color} p-2 rounded-lg`}>
                                {stat.icon}
                            </div>
                            <span className="text-slate-500 font-medium text-sm">{stat.title}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                            {stat.subValue && <span className="text-slate-400 text-sm">{stat.subValue}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Farm Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Farm Inventory</h2>
                    <div className="flex items-center gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-slate-600 transition-all cursor-pointer"
                        >
                            <option value="--">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="FULL">Full</option>
                        </select>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Filter farms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <p className="text-slate-500 font-medium">Loading farm inventory...</p>
                        </div>
                    ) : filteredFarms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="bg-slate-50 p-4 rounded-full text-slate-400">
                                <Tractor size={40} />
                            </div>
                            <p className="text-slate-500 font-medium">No farms found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Farm Location</th>
                                    <th className="px-6 py-4">Capacity Status</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Total Capacity</th>
                                    <th className="px-6 py-4 text-center">Onboarded</th>
                                    <th className="px-6 py-4 text-center">Remaining</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredFarms.map((farm) => {
                                    const percentage = farm.strength > 0 ? ((farm.currentUnits || 0) / farm.strength) * 100 : 0;
                                    return (
                                        <tr key={farm.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 font-semibold text-slate-700">{farm.location}</td>
                                            <td className="px-6 py-5 min-w-[200px]">
                                                <div className="flex items-center justify-between gap-4 mb-2">
                                                    <span className={`text-[10px] font-bold uppercase ${getTextColor(percentage, farm.status)}`}>
                                                        {percentage.toFixed(0)}% FULL
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        {(farm.currentUnits || 0).toLocaleString()} / {farm.strength.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${farm.status === 'ACTIVE'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : farm.status === 'FULL'
                                                        ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {farm.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center font-semibold text-slate-600">{farm.strength.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-center font-semibold text-slate-600">{(farm.currentUnits || 0).toLocaleString()}</td>
                                            <td className="px-6 py-5 text-center font-bold text-blue-600">{farm.availableUnits.toLocaleString()}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(farm)}
                                                        className={`p-2 rounded-lg transition-all ${selectedFarmId === farm.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && filteredFarms.length > 0 && (
                    <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Showing {filteredFarms.length} of {farms.length} farms</span>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg disabled:opacity-50">
                                Previous
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white font-semibold text-sm">
                                1
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmManagement;
