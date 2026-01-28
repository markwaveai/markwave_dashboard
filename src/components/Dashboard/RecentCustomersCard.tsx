import React from 'react';
import { UserPlus } from 'lucide-react';

const RecentCustomersCard: React.FC = () => {
    const mockCustomers = [
        { id: 1, name: 'Amit Verma', mobile: '9876543210', joined: '2 mins ago', initial: 'A', color: '#ef4444' },
        { id: 2, name: 'Sneha Gupta', mobile: '9123456780', joined: '1 hour ago', initial: 'S', color: '#8b5cf6' },
        { id: 3, name: 'Rahul Roy', mobile: '8899776655', joined: '3 hours ago', initial: 'R', color: '#10b981' },
        { id: 4, name: 'Deepak Kumar', mobile: '7766554433', joined: '1 day ago', initial: 'D', color: '#f59e0b' },
    ];

    return (
        <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            height: '100%',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>New Customers</h3>
                <UserPlus size={20} color="#9ca3af" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {mockCustomers.map((user) => (
                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: `${user.color}20`,
                            color: user.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}>
                            {user.initial}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                +91 {user.mobile}
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {user.joined}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentCustomersCard;
