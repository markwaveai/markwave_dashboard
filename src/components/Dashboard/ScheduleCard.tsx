import React from 'react';

interface ScheduleItem {
    id: string;
    date: string;
    time: string;
    title: string;
    description: string;
}

const mockSchedule: ScheduleItem[] = [
    {
        id: '1',
        date: 'Wed, 11 Jan',
        time: '09:20 AM',
        title: 'Business Analytics Press',
        description: 'Exploring the Future of Data-Driven +6 more'
    },
    {
        id: '2',
        date: 'Fri, 15 Feb',
        time: '10:35 AM',
        title: 'Business Sprint',
        description: 'Techniques from Business Sprint +2 more'
    },
    {
        id: '3',
        date: 'Thu, 18 Mar',
        time: '1:15 AM',
        title: 'Customer Review Meeting',
        description: 'Insights from Customer Review Meeting +8 more'
    }
];

const ScheduleCard: React.FC = () => {
    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 m-0">Upcoming Schedule</h3>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {mockSchedule.map((item) => (
                    <div key={item.id} className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center bg-white shadow-sm">
                                <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                            </div>
                        </div>
                        <div className="flex-grow pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-500">{item.date}</span>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <span className="text-xs text-gray-400">{item.time}</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleCard;
