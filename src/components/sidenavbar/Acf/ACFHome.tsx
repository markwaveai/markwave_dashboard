import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, User } from 'lucide-react';

const ACFHome: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Static Mock Data
    const mockUsers = [
        { id: 'ACF-001', name: 'Rajesh Kumar', mobile: '9876543210', units: 5, orderDate: '2024-03-15', emiPaid: 3, emiPending: 9 },
        { id: 'ACF-002', name: 'Suman Rao', mobile: '8765432109', units: 2, orderDate: '2024-03-20', emiPaid: 1, emiPending: 11 },
        { id: 'ACF-003', name: 'Vikram Singh', mobile: '7654321098', units: 10, orderDate: '2024-02-28', emiPaid: 6, emiPending: 6 },
        { id: 'ACF-004', name: 'Anita Desai', mobile: '6543210987', units: 1, orderDate: '2024-04-01', emiPaid: 0, emiPending: 12 },
        { id: 'ACF-005', name: 'Amitabh Bachan', mobile: '9988776655', units: 8, orderDate: '2024-01-10', emiPaid: 12, emiPending: 0 },
    ];

    const filteredUsers = mockUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 m-0">ACF Orders</h1>
                    <p className="text-slate-500 mt-1">Manage users who have opted for ACF</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or mobile..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Info</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Units</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">EMI Progress</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => navigate(`/acf/${user.id}`)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</div>
                                                    <div className="text-xs text-slate-500 font-medium">+91 {user.mobile}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-700 font-medium">{user.id}</div>
                                            <div className="text-xs text-slate-500">Ordered: {new Date(user.orderDate).toLocaleDateString('en-GB')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                                                {user.units}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5 max-w-[140px] mx-auto">
                                                <div className="flex justify-between text-[11px] font-semibold">
                                                    <span className="text-emerald-600">{user.emiPaid} Paid</span>
                                                    <span className="text-amber-600">{user.emiPending} Pending</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${(user.emiPaid / (user.emiPaid + user.emiPending)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ACFHome;
