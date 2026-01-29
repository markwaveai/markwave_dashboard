import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryCardProps {
    totalUsers?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ totalUsers }) => {

    // Sample data to match the visual request
    const data = {
        labels: ['Investors', 'Employees', 'Special'],
        datasets: [
            {
                data: [12, 45, 8],
                backgroundColor: [
                    '#3b82f6', // Blue
                    '#f59e0b', // Yellow/Amber
                    '#8b5cf6', // Purple
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Custom legend below
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    // Custom Plugin to draw text inside slices
    const textCenterPlugin = {
        id: 'textCenter',
        afterDatasetsDraw(chart: any) {
            const { ctx, data } = chart;
            ctx.save();
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const meta = chart.getDatasetMeta(0);
            meta.data.forEach((element: any, index: number) => {
                const dataValue = data.datasets[0].data[index];
                const { x, y } = element.tooltipPosition();
                ctx.fillText(dataValue, x, y);
            });
            ctx.restore();
        }
    };

    return (
        <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
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
                Users
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                {/* Chart Left */}
                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                    <Pie data={data} options={options} />
                </div>

                {/* Right Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></div>
                            <span style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap' }}>Investors</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#111827' }}>12</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <span style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap' }}>Employees</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#111827' }}>45</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                            <span style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap' }}>Special</span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#111827' }}>8</span>
                    </div>
                    {/* Placeholder numbers used in legend to match visual, mapping to data would need access to dataset values */}
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;
