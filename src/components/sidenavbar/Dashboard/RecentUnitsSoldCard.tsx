import React from 'react';
import { ArrowRight, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentUnitsSoldCard: React.FC = () => {
    const navigate = useNavigate();

    const mockUnits = [
        { id: 'UNT-5501', product: 'Premium Plan 1Y', buyer: 'Arjun Reddy', price: 15000, date: '10 mins ago', status: 'Active' },
        { id: 'UNT-5502', product: 'Basic Plan 6M', buyer: 'Meera Joy', price: 8000, date: '45 mins ago', status: 'Active' },
        { id: 'UNT-5503', product: 'Standard Plan 1Y', buyer: 'Karan Mehra', price: 12000, date: '2 hours ago', status: 'Pending' },
        { id: 'UNT-5504', product: 'Premium Plan 3Y', buyer: 'Sarah Khan', price: 40000, date: '4 hours ago', status: 'Active' },
        { id: 'UNT-5505', product: 'Basic Plan 1M', buyer: 'John Doe', price: 1500, date: 'Yesterday', status: 'Expired' },
    ];

    return (
        <div className="card p-6 h-full flex flex-col group hover:border-blue-200 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <Box size={20} />
                    </div>
                    <h3 className="m-0 text-lg font-bold text-slate-900">Recent Units Sold</h3>
                </div>
                <button
                    onClick={() => navigate('/products')}
                    className="bg-transparent border-none text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-semibold flex items-center gap-1 p-0 transition-colors"
                >
                    View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th className="pl-4 rounded-l-lg">Product Info</th>
                            <th>Buyer</th>
                            <th>Price</th>
                            <th>Date</th>
                            <th className="rounded-r-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUnits.map((unit) => (
                            <tr key={unit.id} className="group/row cursor-default">
                                <td className="font-medium text-slate-900 rounded-l-lg pl-4">
                                    <div className="flex flex-col">
                                        <span>{unit.product}</span>
                                        <span className="text-[11px] text-slate-400 font-normal">{unit.id}</span>
                                    </div>
                                </td>
                                <td className="text-slate-600">{unit.buyer}</td>
                                <td className="font-bold text-slate-800">₹{unit.price.toLocaleString('en-IN')}</td>
                                <td className="text-slate-500 text-xs">{unit.date}</td>
                                <td className="rounded-r-lg">
                                    <span className={`status-badge ${unit.status === 'Active' ? 'status-verified' :
                                            unit.status === 'Pending' ? 'status-pending' :
                                                'bg-slate-100 text-slate-500 border border-slate-200'
                                        }`}>
                                        {unit.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentUnitsSoldCard;
