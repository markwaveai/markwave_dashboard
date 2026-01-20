import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { farmvestService } from '../services/farmvest_api';
import './FarmDetails.css';

const FarmDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Initial state from navigation if available
    const initialFarm = location.state?.farm;

    const [farmName, setFarmName] = useState(initialFarm?.farm_name || 'Loading Farm...');
    const [farmLocation, setFarmLocation] = useState(initialFarm?.location || '');
    const [sheds, setSheds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSheds = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // If we didn't get farm details from router state, we might want to fetch farm details too
                // But for now we focus on sheds

                const data = await farmvestService.getShedsByFarm(parseInt(id));

                let shedsList: any[] = [];
                if (Array.isArray(data)) {
                    shedsList = data;
                } else if (data && typeof data === 'object') {
                    if (Array.isArray(data.data)) {
                        shedsList = data.data;
                    } else if (Object.keys(data).length > 0) {
                        shedsList = Object.values(data);
                    }
                }

                setSheds(shedsList);
            } catch (err: any) {
                console.error('Failed to load sheds', err);
                // If 404, it means no sheds found - treat as empty list
                if (err.response && err.response.status === 404) {
                    setSheds([]);
                    setError(null);
                } else {
                    setError(err.message || 'Failed to fetch shed details');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSheds();
        }
    }, [id]);

    // If farm name wasn't passed, we might update it if the API returned it (not guaranteed by this specific endpoint though)

    return (
        <div className="farm-details-container animate-fadeIn">
            <div className="farm-details-header">
                <div className="farm-title-section">
                    <h1>{farmName}</h1>
                    {farmLocation && (
                        <div className="farm-location">
                            <span className="material-icons-outlined" style={{ fontSize: 18 }}>place</span>
                            {farmLocation}
                        </div>
                    )}
                </div>
                <button className="back-button" onClick={() => navigate(-1)}>
                    <span>←</span> Back to Farms
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Loading sheds configuration...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-bold">Error loading data</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            ) : sheds.length === 0 ? (
                <div className="empty-state-page">
                    <div className="text-6xl mb-4 grayscale opacity-30">🏚️</div>
                    <h3 className="text-xl font-bold text-gray-500">No Sheds Found</h3>
                    <p className="mt-2 text-gray-400">There are no sheds configured for this farm yet.</p>
                </div>
            ) : (
                <div className="sheds-grid-container">
                    {sheds.map((shed: any, idx: number) => (
                        <div key={shed.id || idx} className="shed-detail-card">
                            <div className="shed-card-header">
                                <div className="shed-icon-large">🛖</div>
                            </div>

                            <h3 className="shed-name-title">
                                {shed.shed_id || shed.name || `Shed Unit ${idx + 1}`}
                            </h3>

                            <div className="shed-stats">
                                <div className="stat-row">
                                    <span className="stat-label">Capacity</span>
                                    <span className="stat-value text-emerald-600">
                                        {shed.capacity || shed.unit_count || '-'}
                                    </span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Current Buffaloes</span>
                                    <span className="stat-value text-amber-600">
                                        {shed.current_buffaloes !== undefined ? shed.current_buffaloes : '-'}
                                    </span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Available Slots</span>
                                    <span className="stat-value text-purple-600">
                                        {shed.available_slots !== undefined ? shed.available_slots : '-'}
                                    </span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Status</span>
                                    <span className="stat-value text-blue-600">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FarmDetails;
