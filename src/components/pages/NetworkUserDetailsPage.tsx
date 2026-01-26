import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchNetworkUserDetails } from '../../store/slices/usersSlice';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Award, Package, CheckCircle, AlertCircle, Users } from 'lucide-react';
import Loader from '../common/Loader';

const NetworkUserDetailsPage: React.FC = () => {
    const { mobile } = useParams<{ mobile: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { networkUserDetails } = useAppSelector((state) => state.users);
    const { data, loading, error } = networkUserDetails;

    useEffect(() => {
        if (mobile) {
            dispatch(fetchNetworkUserDetails(mobile));
        }
    }, [dispatch, mobile]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded">Go Back</button>
            </div>
        );
    }

    if (!data || !data.user) {
        return null;
    }

    const { user, stats, network_tree } = data;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Network User Details</h1>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* User Profile Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500 overflow-hidden">
                                {user.aadhar_front_image_url ? (
                                    <img src={user.aadhar_front_image_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.first_name ? user.first_name[0].toUpperCase() : 'U'
                                )}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                                <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.verified ? 'Verified' : 'Pending'}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    {user.role}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                                <div className="flex items-center gap-2">
                                    <Phone size={16} /> {user.mobile}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} /> {user.email || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} /> {user.city}, {user.state} - {user.pincode}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} /> Joined: {new Date(user.user_created_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-gray-500 text-xs uppercase mb-1">Total Coins</div>
                        <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                            <Award size={20} /> {stats?.total_coins?.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-gray-500 text-xs uppercase mb-1">Paid Orders</div>
                        <div className="text-2xl font-bold text-green-600">{stats?.paid_orders_count}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-gray-500 text-xs uppercase mb-1">Direct Referrals</div>
                        <div className="text-2xl font-bold">{stats?.direct_referrals_count}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <div className="text-gray-500 text-xs uppercase mb-1">Network Size</div>
                        <div className="text-2xl font-bold">{stats?.total_network_size}</div>
                    </div>
                </div>

                {/* Network Tree / Direct Referrals */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users size={20} /> Direct Referrals
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Mobile</th>
                                    <th className="px-4 py-3">Referrals</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!network_tree || network_tree.length === 0) ? (
                                    <tr><td colSpan={3} className="px-4 py-4 text-center">No direct referrals found</td></tr>
                                ) : (
                                    network_tree.map((ref: any, index: number) => (
                                        <tr key={ref.mobile || index} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{ref.name}</td>
                                            <td className="px-4 py-3">{ref.mobile}</td>
                                            <td className="px-4 py-3">{ref.referrals ? ref.referrals.length : 0}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkUserDetailsPage;
