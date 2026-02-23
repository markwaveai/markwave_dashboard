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

interface UnitsStatsCardProps {
    count: string;
    target: string;
}

const UnitsStatsCard: React.FC<UnitsStatsCardProps> = ({ count, target }) => {

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
        <div className="bg-white rounded-[20px] p-6 shadow-sm flex flex-col justify-between gap-4 min-h-[170px] border border-gray-100 h-full">
            <div className="flex items-center gap-5">
                {/* Progress Circle */}
                <div className="relative w-[60px] h-[60px] shrink-0">
                    <Doughnut data={createProgressData(87, '#22c55e')} options={progressOptions} />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-500">
                        87%
                    </div>
                </div>
                {/* Text Info */}
                <div className="flex flex-col">
                    <div className="text-sm text-gray-500 font-medium">Purchased Units</div>
                    <div className="text-2xl font-bold text-slate-900">{count}</div>
                    <div className="text-xs text-gray-400">Target: {target}</div>
                </div>
            </div>

            {/* Growth & Wave */}
            <div className="flex items-end justify-between h-10">
                <div className="text-[13px] font-semibold text-green-600 mb-2">
                    ▲ 5.1%
                </div>
                <div className="w-[120px] h-full">
                    <Line data={createWaveChartData('#22c55e', 'rgba(34, 197, 94, 0.1)')} options={waveOptions} />
                </div>
            </div>
        </div>
    );
};

export default UnitsStatsCard;
