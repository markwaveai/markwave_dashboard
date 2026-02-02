import React from 'react';
import { TrendingUp } from 'lucide-react';

const TopProductsCard: React.FC = () => {
    const mockProducts = [
        { id: 1, name: 'Premium Murrah Buffalo', sales: 120, revenue: 12000000, color: '#4f46e5' },
        { id: 2, name: 'Standard Sahiwal Cow', sales: 85, revenue: 4250000, color: '#0ea5e9' },
        { id: 3, name: 'Gir Cow Alpha', sales: 42, revenue: 3360000, color: '#f59e0b' },
        { id: 4, name: 'Jersey Cow Plus', sales: 30, revenue: 1500000, color: '#10b981' },
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
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Top Products</h3>
                <TrendingUp size={20} color="#9ca3af" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {mockProducts.map((product, index) => (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `${product.color}20`,
                            color: product.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}>
                            #{index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                                {product.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {product.sales} Sales
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                                ₹{(product.revenue / 100000).toFixed(1)}L
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopProductsCard;
