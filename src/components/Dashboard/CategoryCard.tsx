import React from 'react';
import { Users, Briefcase, Star, ChevronRight } from 'lucide-react';

const CategoryCard: React.FC = () => {
    const categories = [
        {
            id: 1,
            title: 'Investors',
            icon: Briefcase,
            color: '#3b82f6', // blue
            count: '12' // placeholder or remove if not needed
        },
        {
            id: 2,
            title: 'Employees',
            icon: Users,
            color: '#10b981', // green
            count: '45'
        },
        {
            id: 3,
            title: 'Special Category',
            icon: Star,
            color: '#8b5cf6', // purple
            count: '8'
        }
    ];

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
            <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#111827'
            }}>
                Categories
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {categories.map((category) => (
                    <div
                        key={category.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `${category.color}15`,
                            color: category.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <category.icon size={20} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                                {category.title}:
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                                {category.count}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryCard;
