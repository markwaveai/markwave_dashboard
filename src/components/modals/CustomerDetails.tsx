import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import type { RootState } from '../../store';
import { clearCustomerDetails } from '../../store/slices/usersSlice';
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Award, Info, Package, AlertCircle, CheckCircle } from 'lucide-react';
import Loader from '../common/Loader';
import './CustomerDetails.css';

interface CustomerDetailsProps {
    onClose: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ onClose }) => {
    const dispatch = useAppDispatch();
    const { customerDetails, customerDetailsLoading, customerDetailsError } = useAppSelector((state: RootState) => state.users);

    useEffect(() => {
        return () => {
            dispatch(clearCustomerDetails());
        };
    }, [dispatch]);

    if (customerDetailsLoading) {
        return (
            <div className="customer-details-overlay">
                <div className="customer-details-modal loading">
                    <Loader />
                </div>
            </div>
        );
    }

    if (customerDetailsError) {
        return (
            <div className="customer-details-overlay">
                <div className="customer-details-modal error">
                    <div className="text-red-500 mb-4">Error: {customerDetailsError}</div>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Close</button>
                </div>
            </div>
        );
    }

    if (!customerDetails || !customerDetails.user) {
        return null;
    }

    const { user, stats, orders, referrals } = customerDetails;

    return (
        <div className="customer-details-overlay">
            <div className="customer-details-modal">
                <div className="modal-header">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <User size={20} />
                        Customer Details
                    </h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    {/* User Profile Header */}
                    <div className="user-profile-section">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
                                    {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex flex-wrap gap-2 items-center mb-2">
                                    <h3 className="text-2xl font-bold">{user.first_name} {user.last_name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.verified ? 'Verified' : 'Pending'}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                        {user.role}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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

                    {/* Stats Section */}
                    <div className="stats-section mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="stat-card">
                            <div className="text-gray-500 text-xs uppercase">Total Orders</div>
                            <div className="text-xl font-bold">{stats.total_orders}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-gray-500 text-xs uppercase">Referrals</div>
                            <div className="text-xl font-bold">{stats.total_referrals}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-gray-500 text-xs uppercase">Coins</div>
                            <div className="text-xl font-bold text-yellow-600 flex items-center gap-1">
                                <Award size={16} /> {stats.total_coins.toLocaleString()}
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="text-gray-500 text-xs uppercase">Purchased</div>
                            <div className="text-xl font-bold text-green-600">{stats.purchased_orders}</div>
                        </div>
                    </div>

                    {/* Tabs / Sections for Orders and Referrals */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package size={18} /> Recent Orders
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Cost</th>
                                        <th className="px-4 py-3">Payment</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-4 text-center">No orders found</td></tr>
                                    ) : (
                                        orders.map((order: any) => (
                                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
                                                <td className="px-4 py-3">{new Date(order.placedAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">₹{order.totalCost.toLocaleString()}</td>
                                                <td className="px-4 py-3">{order.paymentType}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                                        order.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User size={18} /> Referrals
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Mobile</th>
                                        <th className="px-4 py-3">City</th>
                                        <th className="px-4 py-3">Verified</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.length === 0 ? (
                                        <tr><td colSpan={4} className="px-4 py-4 text-center">No referrals found</td></tr>
                                    ) : (
                                        referrals.map((ref: any) => (
                                            <tr key={ref.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{ref.first_name} {ref.last_name}</td>
                                                <td className="px-4 py-3">{ref.mobile}</td>
                                                <td className="px-4 py-3">{ref.city}</td>
                                                <td className="px-4 py-3">
                                                    {ref.verified ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
