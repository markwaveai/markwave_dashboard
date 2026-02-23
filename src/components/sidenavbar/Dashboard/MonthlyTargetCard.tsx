import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';

const MonthlyTargetCard: React.FC = () => {
    const data = [
        { name: 'Progress', value: 75.55 },
        { name: 'Remaining', value: 24.45 },
    ];
    const COLORS = ['#4f46e5', '#f3f4f6'];

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm h-full flex flex-col relative border border-gray-100">
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <h3 className="m-0 text-lg font-bold text-gray-900">Monthly Target</h3>
                    <button className="bg-transparent border-none text-gray-400 cursor-pointer text-xl p-0 hover:text-gray-600">⋮</button>
                </div>
            </div>

            <div className="flex-1 min-h-[200px] relative flex justify-center items-center">
                {/* Semi-Circle Chart */}
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="70%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Content */}
                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-5">
                    <div className="text-3xl font-extrabold text-gray-900">75.55%</div>
                    <div className="inline-flex items-center bg-emerald-50 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-bold mt-1">
                        +10%
                    </div>
                </div>
            </div>

            

            <div className="mt-auto grid grid-cols-3 gap-3 text-center">
                <div>
                    <div className="text-xs text-gray-400 mb-1">Target</div>
                    <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                        3500cr <ArrowDown size={14} className="text-red-500" />
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1">Revenue</div>
                    <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                        300k <ArrowUp size={14} className="text-emerald-500" />
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1">Today</div>
                    <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                        300K <ArrowUp size={14} className="text-emerald-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyTargetCard;
