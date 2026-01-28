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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return { bg: '#dcfce7', color: '#166534', label: 'Paid' };
            case 'PENDING_ADMIN_VERIFICATION': return { bg: '#fef3c7', color: '#92400e', label: 'Pending' };
            case 'REJECTED': return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
            case 'PENDING_PAYMENT': return { bg: '#eff6ff', color: '#1e40af', label: 'Due' };
            default: return { bg: '#f3f4f6', color: '#374151', label: status };
        }
    };

    return (
        <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            height: '100%',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Recent Orders</h3>
                <button
                    onClick={() => navigate('/orders')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#4f46e5',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    View All <ArrowRight size={16} />
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: '13px' }}>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>Order ID</th>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>Customer</th>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>Status</th>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>Amount</th>
                            <th style={{ paddingBottom: '8px', fontWeight: 500 }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockOrders.map((order) => {
                            const statusStyle = getStatusStyle(order.status);
                            return (
                                <tr key={order.id} style={{ fontSize: '14px' }}>
                                    <td style={{ padding: '8px 0', color: '#111827', fontWeight: 500 }}>{order.id}</td>
                                    <td style={{ padding: '8px 0', color: '#374151' }}>{order.customer}</td>
                                    <td style={{ padding: '8px 0' }}>
                                        <span style={{
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.color,
                                            padding: '4px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            {statusStyle.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px 0', color: '#111827', fontWeight: 600 }}>₹{order.amount.toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '13px' }}>{new Date(order.date).toLocaleDateString()}</td>
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
