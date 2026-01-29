import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

interface CoinsStatsCardProps {
    count: string;
    target: string;
}

const CoinsStatsCard: React.FC<CoinsStatsCardProps> = ({ count, target }) => {

    // --- Helper for Wave Chart ---
    const createWaveChartData = (color: string, bgColor: string) => ({
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [
            {
                data: [30, 45, 35, 60, 50, 75, 80], // Dummy trend data
                borderColor: color,
                backgroundColor: bgColor,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
        ],
    });

    const waveOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
            x: { display: false },
            y: { display: false, min: 0 },
        },
    };

    // --- Helper for Circular Progress ---
    const createProgressData = (percent: number, color: string) => ({
        labels: ['Progress', 'Remaining'],
        datasets: [
            {
                data: [percent, 100 - percent],
                backgroundColor: [color, '#f3f4f6'],
                borderWidth: 0,
                cutout: '75%',
            },
        ],
    });

    const progressOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
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
            minHeight: '170px' // Initial height assumption, adjustable
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Progress Circle */}
                <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <Doughnut data={createProgressData(89, '#f59e0b')} options={progressOptions} />
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        fontSize: '12px', fontWeight: 'bold', color: '#f59e0b'
                    }}>
                        89%
                    </div>
                </div>
                {/* Text Info */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '14px', color: '#52525b', fontWeight: 500 }}>Distributed Coins</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{count}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Target: {target}</div>
                </div>
            </div>

            {/* Growth & Wave */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '40px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', marginBottom: '8px' }}>
                    ▲ 8.2%
                </div>
                <div style={{ width: '120px', height: '100%' }}>
                    <Line data={createWaveChartData('#f59e0b', 'rgba(245, 158, 11, 0.1)')} options={waveOptions} />
                </div>
            </div>
        </div>
    );
};

export default CoinsStatsCard;
