import React from 'react';
import { Calendar, Clock, MoreHorizontal, Video, Users, MessageSquare } from 'lucide-react';

interface ScheduleItem {
    id: string;
    date: string;
    time: string;
    title: string;
    description: string;
    type: 'meeting' | 'call' | 'standup';
}

const mockSchedule: ScheduleItem[] = [
    {
        id: '1',
        date: 'Wed, 11 Jan',
        time: '09:20 AM',
        title: 'Business Analytics Press',
        description: 'Exploring the Future of Data-Driven +6 more',
        type: 'meeting'
    },
    {
        id: '2',
        date: 'Fri, 15 Feb',
        time: '10:35 AM',
        title: 'Business Sprint',
        description: 'Techniques from Business Sprint +2 more',
        type: 'call'
    },
    {
        id: '3',
        date: 'Thu, 18 Mar',
        time: '1:15 PM',
        title: 'Customer Review Meeting',
        description: 'Reviewing recent feedback and milestones',
        type: 'standup'
    }
];

const ScheduleCard: React.FC = () => {
    return (
        <div className="bg-white rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-sm)] border border-[var(--slate-200)] h-full flex flex-col group hover:shadow-[var(--shadow-md)] transition-all duration-300">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-xl font-black text-[var(--slate-900)] tracking-tight">Upcoming Events</h3>
                    <p className="text-sm text-[var(--slate-500)] font-semibold mt-1">Your schedule for the week</p>
                </div>
                <button className="p-2 text-[var(--slate-400)] hover:bg-[var(--slate-50)] rounded-xl transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {mockSchedule.map((item) => (
                    <div key={item.id} className="group/item flex gap-5 p-4 rounded-2xl border border-transparent hover:border-[var(--slate-100)] hover:bg-[var(--slate-50)] transition-all duration-300">
                        <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover/item:scale-110 ${item.type === 'meeting' ? 'bg-indigo-50 text-indigo-600' :
                                    item.type === 'call' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-amber-50 text-amber-600'
                                }`}>
                                {item.type === 'meeting' && <Video size={20} />}
                                {item.type === 'call' && <Users size={20} />}
                                {item.type === 'standup' && <MessageSquare size={20} />}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                    <Calendar size={12} />
                                    {item.date}
                                </div>
                                <span className="w-1 h-1 bg-[var(--slate-300)] rounded-full"></span>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--slate-400)] uppercase tracking-widest">
                                    <Clock size={12} />
                                    {item.time}
                                </div>
                            </div>
                            <h4 className="text-sm font-black text-[var(--slate-900)] group-hover/item:text-indigo-600 transition-colors mb-1">{item.title}</h4>
                            <p className="text-xs text-[var(--slate-500)] font-semibold line-clamp-1">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-8 w-full py-3 px-4 bg-[var(--slate-900)] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all hover:shadow-lg shadow-black/10">
                View Full Calendar
            </button>
        </div>
    );
};

export default ScheduleCard;
