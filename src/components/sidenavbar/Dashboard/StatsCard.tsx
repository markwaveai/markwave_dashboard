import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    count: string;
    trend: string;
    icon: React.ReactNode;
    isIncrease: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, trend, icon, isIncrease }) => {
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
            minHeight: '160px'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
            }}>
                {/* Render the icon node directly, assuming it's already styled/sized by parent if needed, 
                    OR parent passes a node that fits. 
                    Actually, to preserve the previous style (size 24, specific color), 
                    we should ask parent to pass the element with those props, or clone it.
                    For simplicity and safety, let's assume parent passes the full element. */}
                {icon}
            </div>

            <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
                    {title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
                        {count}
                    </div>
                    {trend && (
                        <div style={{
                            padding: '4px 8px',
                            borderRadius: '9999px',
                            background: isIncrease ? '#ecfdf5' : '#fef2f2',
                            color: isIncrease ? '#10b981' : '#f43f5e',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            {isIncrease ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            {trend}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
