import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrdersStatsCardProps {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

const OrdersStatsCard: React.FC<OrdersStatsCardProps> = ({ total, pending, approved, rejected }) => {

    // Data for the chart
    const data = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [
            {
                data: [pending, approved, rejected],
                backgroundColor: [
                    '#fbbf24', // Pending - Amber/Yellow
                    '#34d399', // Approved - Emerald/Green
                    '#f87171', // Rejected - Red
                ],
                borderWidth: 0,
                cutout: '75%', // Thinner ring
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Custom legend
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            flex: 1,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
            minHeight: '170px'
        }}>
            <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827'
            }}>
                Orders
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                {/* Chart Left */}
                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                    <Doughnut data={data} options={options} />
                    {/* Center Text Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 'bold' }}>Total</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
                            {total}
                        </div>
                    </div>
                </div>

                {/* Right Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {/* Approved */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }}></div>
                            <span style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap' }}>Approved</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#111827' }}>{approved}</span>
                    </div>

                    {/* Pending */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24' }}></div>
                            <span style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap' }}>Pending</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#111827' }}>{pending}</span>
                    </div>

                    {/* Rejected */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }}></div>
                            <span style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap' }}>Rejected</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#111827' }}>{rejected}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersStatsCard;
