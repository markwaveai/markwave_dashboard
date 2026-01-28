import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', sales: 150 },
    { name: 'Feb', sales: 380 },
    { name: 'Mar', sales: 180 },
    { name: 'Apr', sales: 290 },
    { name: 'May', sales: 170 },
    { name: 'Jun', sales: 180 },
    { name: 'Jul', sales: 280 },
    { name: 'Aug', sales: 90 },
    { name: 'Sep', sales: 200 },
    { name: 'Oct', sales: 380 },
    { name: 'Nov', sales: 270 },
    { name: 'Dec', sales: 90 },
];

const MonthlySalesChart: React.FC = () => {
    return (
        <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Monthly Sales</h3>
                <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px' }}>⋮</button>
            </div>

            <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={12}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar
                            dataKey="sales"
                            fill="#4f46e5"
                            radius={[6, 6, 6, 6]}
                            background={{ fill: '#fff', radius: 6 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlySalesChart;
