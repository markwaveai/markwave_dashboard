import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#fff',
            titleColor: '#111827',
            bodyColor: '#6b7280',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
                label: function (context: any) {
                    return `Sales: ${context.parsed.y}`;
                }
            }
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#6b7280',
                font: {
                    size: 12
                }
            },
            border: {
                display: false
            }
        },
        y: {
            grid: {
                color: '#f3f4f6',
            },
            ticks: {
                color: '#6b7280',
                font: {
                    size: 12
                }
            },
            border: {
                display: false
            }
        },
    },
    interaction: {
        mode: 'index' as const,
        intersect: false,
    }
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const data = {
    labels,
    datasets: [
        {
            fill: true,
            label: 'Monthly Sales',
            data: [150, 380, 180, 290, 170, 180, 280, 90, 200, 380, 270, 90],
            borderColor: '#4f46e5',
            backgroundColor: (context: ScriptableContext<'line'>) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.5)'); // Start color
                gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');   // End color
                return gradient;
            },
            tension: 0.4, // Curved line
            pointRadius: 0, // Hide points by default
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#4f46e5',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
        },
    ],
};

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

            <div style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
                <Line options={options} data={data} />
            </div>
        </div>
    );
};

export default MonthlySalesChart;
