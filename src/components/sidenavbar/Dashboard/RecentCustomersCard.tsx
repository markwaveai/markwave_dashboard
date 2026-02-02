import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentCustomersCard: React.FC = () => {
    const navigate = useNavigate();
    const mockCustomers = [
        { id: 1, name: 'Amit Verma', mobile: '9876543210', joined: '2 mins ago', initial: 'A', color: 'text-red-500 bg-red-50' },
        { id: 2, name: 'Sneha Gupta', mobile: '9123456780', joined: '1 hour ago', initial: 'S', color: 'text-violet-500 bg-violet-50' },
        { id: 3, name: 'Rahul Roy', mobile: '8899776655', joined: '3 hours ago', initial: 'R', color: 'text-emerald-500 bg-emerald-50' },
        { id: 4, name: 'Deepak Kumar', mobile: '7766554433', joined: '1 day ago', initial: 'D', color: 'text-amber-500 bg-amber-50' },
    ];

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm h-full flex flex-col border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-lg font-bold text-gray-900">Recent Users</h3>
                <button
                    onClick={() => navigate('/user-management')}
                    className="bg-transparent border-none text-indigo-600 hover:text-indigo-700 cursor-pointer text-sm font-semibold flex items-center gap-1 p-0 transition-colors"
                >
                    View All <ArrowRight size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-5">
                {mockCustomers.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 group cursor-default">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${user.color} transition-transform group-hover:scale-105`}>
                            {user.initial}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 mb-0.5">
                                {user.name}
                            </div>
                            <div className="text-xs text-gray-500 tracking-tight">
                                +91 {user.mobile}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                            {user.joined}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentCustomersCard;
