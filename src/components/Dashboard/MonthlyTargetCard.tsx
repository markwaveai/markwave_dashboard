import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

const MonthlyTargetCard: React.FC = () => {
    const data = [
        { name: 'Progress', value: 75.55 },
        { name: 'Remaining', value: 24.45 },
    ];
    const COLORS = ['#4f46e5', '#f3f4f6'];

    return (
        <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Monthly Target</h3>
                    <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px' }}>⋮</button>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Target you've set for each month</p>
            </div>

            <div style={{ flex: 1, minHeight: '200px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Semi-Circle Chart */}
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="70%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={0} // Continuous
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Content */}
                <div style={{
                    position: 'absolute',
                    top: '55%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    marginTop: '20px' // Adjust for semi-circle
                }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>75.55%</div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: '#ecfdf5',
                        color: '#10b981',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginTop: '4px'
                    }}>
                        +10%
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', margin: '20px 0', padding: '0 20px' }}>
                You earn $3287 today, it's higher than last month. Keep up your good work!
            </div>

            <div style={{
                marginTop: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                textAlign: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Target</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        $20K <ArrowDown size={14} color="#ef4444" />
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Revenue</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        $20K <ArrowUp size={14} color="#10b981" />
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Today</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        $20K <ArrowUp size={14} color="#10b981" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyTargetCard;
