import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const RecentOrdersCard: React.FC = () => {
    const navigate = useNavigate();

    const mockOrders = [
        { id: 'ORD-2024-001', customer: 'Ramesh Kumar', status: 'PAID', amount: 45000, date: '2024-03-20' },
        { id: 'ORD-2024-002', customer: 'Sita Devi', status: 'PENDING_ADMIN_VERIFICATION', amount: 12000, date: '2024-03-19' },
        { id: 'ORD-2024-003', customer: 'Anil Singh', status: 'REJECTED', amount: 8000, date: '2024-03-18' },
        { id: 'ORD-2024-004', customer: 'Priya Patel', status: 'PAID', amount: 25000, date: '2024-03-18' },
        { id: 'ORD-2024-005', customer: 'Vikram Mehta', status: 'PENDING_PAYMENT', amount: 15000, date: '2024-03-17' },
    ];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800 label-Paid';
            case 'PENDING_ADMIN_VERIFICATION': return 'bg-amber-100 text-amber-800 label-Pending';
            case 'REJECTED': return 'bg-red-100 text-red-800 label-Rejected';
            case 'PENDING_PAYMENT': return 'bg-blue-100 text-blue-800 label-Due';
            default: return 'bg-gray-100 text-gray-800 label-' + status;
        }
    };

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm h-full border border-gray-100">
            <div className="flex justify-between items-center mb-5">
                <h3 className="m-0 text-lg font-bold text-gray-900">Recent Orders</h3>
                <button
                    onClick={() => navigate('/orders')}
                    className="bg-transparent border-none text-indigo-600 hover:text-indigo-700 cursor-pointer text-sm font-semibold flex items-center gap-1 p-0 transition-colors"
                >
                    View All <ArrowRight size={16} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-left text-gray-400 text-[13px]">
                            <th className="pb-2 font-medium">Order ID</th>
                            <th className="pb-2 font-medium">Customer</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 font-medium">Amount</th>
                            <th className="pb-2 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockOrders.map((order) => {
                            const styles = getStatusStyles(order.status).split(' ');
                            const label = styles.find(s => s.startsWith('label-'))?.replace('label-', '') || order.status;
                            const badgeClasses = styles.filter(s => !s.startsWith('label-')).join(' ');

                            return (
                                <tr key={order.id} className="text-sm">
                                    <td className="py-2 text-gray-900 font-medium">{order.id}</td>
                                    <td className="py-2 text-gray-600">{order.customer}</td>
                                    <td className="py-2">
                                        <span className={`${badgeClasses} px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                                            {label}
                                        </span>
                                    </td>
                                    <td className="py-2 text-gray-900 font-bold">₹{order.amount.toLocaleString('en-IN')}</td>
                                    <td className="py-2 text-gray-500 text-[13px]">{new Date(order.date).toLocaleDateString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentOrdersCard;
