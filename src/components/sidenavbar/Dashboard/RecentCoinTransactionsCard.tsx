import React from 'react';
import { ArrowRight, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentCoinTransactionsCard: React.FC = () => {
    const navigate = useNavigate();

    const mockTransactions = [
        { id: 'TXN-7829', user: 'Rahul Sharma', type: 'Redeem', amount: 500, date: '2 mins ago', status: 'Completed' },
        { id: 'TXN-7830', user: 'Priya Singh', type: 'Earned', amount: 1200, date: '15 mins ago', status: 'Completed' },
        { id: 'TXN-7831', user: 'Amit Patel', type: 'Redeem', amount: 200, date: '1 hour ago', status: 'Pending' },
        { id: 'TXN-7832', user: 'Sneha Gupta', type: 'Bonus', amount: 100, date: '3 hours ago', status: 'Completed' },
        { id: 'TXN-7833', user: 'Vikram Das', type: 'Referral', amount: 500, date: '5 hours ago', status: 'Completed' },
    ];

    return (
        <div className="card p-6 h-full flex flex-col group hover:border-yellow-200 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600">
                        <Coins size={20} />
                    </div>
                    <h3 className="m-0 text-lg font-bold text-slate-900">Recent Coin Transactions</h3>
                </div>
                <button
                    onClick={() => navigate('/coins')}
                    className="bg-transparent border-none text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-semibold flex items-center gap-1 p-0 transition-colors"
                >
                    View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th className="pl-4 rounded-l-lg">Details</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th className="rounded-r-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockTransactions.map((tx) => (
                            <tr key={tx.id} className="group/row cursor-default">
                                <td className="font-medium text-slate-900 rounded-l-lg pl-4">
                                    <div className="flex flex-col">
                                        <span>{tx.user}</span>
                                        <span className="text-[11px] text-slate-400 font-normal">{tx.id}</span>
                                    </div>
                                </td>
                                <td className="text-slate-600">{tx.type}</td>
                                <td className="font-bold text-slate-800">{tx.amount}</td>
                                <td className="text-slate-500 text-xs">{tx.date}</td>
                                <td className="rounded-r-lg">
                                    <span className={`status-badge ${tx.status === 'Completed' ? 'status-verified' :
                                            tx.status === 'Pending' ? 'status-pending' :
                                                'status-rejected'
                                        }`}>
                                        {tx.status}
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

export default RecentCoinTransactionsCard;
