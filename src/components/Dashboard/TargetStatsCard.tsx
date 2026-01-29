import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TargetStatsCardProps {
    title: string;
    count: string;
    target: string;
    icon: LucideIcon;
    bgColor: string;
    iconColor: string;
    iconBgColor: string;
}

const TargetStatsCard: React.FC<TargetStatsCardProps> = ({
    title,
    count,
    target,
    icon: Icon,
    bgColor,
    iconColor,
    iconBgColor
}) => {
    return (
        <div style={{
            background: bgColor,
            borderRadius: '20px',
            padding: '24px',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            minHeight: '140px',
            justifyContent: 'flex-start'
        }}>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: iconBgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <Icon size={28} color={iconColor} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '15px', color: '#52525b', marginBottom: '4px', fontWeight: 500 }}>
                    {title}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.2' }}>
                    {count}
                </div>
                <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                    Target: {target}
                </div>
            </div>
        </div>
    );
};

export default TargetStatsCard;
