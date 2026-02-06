import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Box, CheckCircle, Clock, AlertCircle, FileText, Download, CreditCard, ChevronRight } from 'lucide-react';

const ACFUserDetails: React.FC = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    // Mock User Data
    const userDetail = {
        id: userId,
        name: 'Rajesh Kumar',
        mobile: '9876543210',
        email: 'rajesh.k@example.com',
        joinDate: '10 Jan 2024',
        // Plan Details
        planName: 'ACF 30-Month Plan',
        planType: '30 Months', // or '11 Months'
        totalAmount: 150000,
        amountPerMonth: 5000,
        units: 2,
        startDate: '2024-03-01',
        nextEmiDate: '2024-06-01'
    };

    // Generate Mock EMI Schedule
    const generateSchedule = () => {
        const schedule = [];
        const totalMonths = 30;
        const paidMonths = 3;

        for (let i = 1; i <= totalMonths; i++) {
            const isPaid = i <= paidMonths;
            const date = new Date(2024, 2 + i - 1, 1); // Start Mar 2024

            schedule.push({
                emiNo: i,
                dueDate: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                amount: userDetail.amountPerMonth,
                status: isPaid ? 'Paid' : 'Pending',
                paidDate: isPaid ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
                paymentMode: isPaid ? (i % 2 === 0 ? 'UPI' : 'Bank Transfer') : '-',
                transactionId: isPaid ? `TXN-${1000 + i}` : '-'
            });
        }
        return schedule;
    };

    const emiSchedule = generateSchedule();
    const paidAmount = emiSchedule.filter(e => e.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingAmount = userDetail.totalAmount - paidAmount;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/acf')}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors mb-2 bg-transparent border-none p-0 cursor-pointer text-sm"
                    >
                        <ArrowLeft size={16} /> Back to Users
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 m-0">User Details</h1>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        <FileText size={16} className="text-slate-400" /> Statement
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                        <Download size={16} /> Download Report
                    </button>
                </div>
            </div>

            {/* User Profile Card */}
            <div className="card p-6 mb-8 border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                        {userDetail.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-900 m-0">{userDetail.name}</h2>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">Active Plan</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-2"><User size={14} className="text-slate-400" /> +91 {userDetail.mobile}</span>
                            <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> Joined {userDetail.joinDate}</span>
                            <span className="flex items-center gap-2"><Box size={14} className="text-slate-400" /> {userDetail.units} Units Purchased</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Plan Value */}
                <div className="card p-5 relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Box size={64} className="text-blue-600" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Plan Value</p>
                    <h3 className="text-2xl font-bold text-slate-900 m-0">₹{userDetail.totalAmount.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="font-medium text-slate-600">{userDetail.planType}</span>
                        @ ₹{userDetail.amountPerMonth.toLocaleString()}/mo
                    </p>
                </div>

                {/* Paid Amount */}
                <div className="card p-5 group hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">Paid Amount</p>
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-600 m-0">₹{paidAmount.toLocaleString()}</h3>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(paidAmount / userDetail.totalAmount) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-right">{Math.round((paidAmount / userDetail.totalAmount) * 100)}% Completed</p>
                </div>

                {/* Pending Amount */}
                <div className="card p-5 group hover:border-amber-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">Pending Amount</p>
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                            <Clock size={16} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-amber-600 m-0">₹{pendingAmount.toLocaleString()}</h3>
                    <p className="text-xs text-amber-600/80 mt-2 font-medium flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md w-fit">
                        <AlertCircle size={12} />
                        Next Due: {userDetail.nextEmiDate}
                    </p>
                </div>

                {/* Plan Status */}
                <div className="card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg shadow-slate-900/20">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Plan Status</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-white m-0">Active</h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <Calendar size={12} />
                        <span>{30 - 3} EMIs Remaining</span>
                    </div>
                </div>
            </div>

            {/* Repayment Schedule Table */}
            <div className="card overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-blue-600">
                            <CreditCard size={18} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 m-0">Repayment Schedule</h3>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-white text-slate-600 rounded-full border border-slate-200 shadow-sm">
                        {userDetail.planName}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th className="w-24">EMI No</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th className="text-center">Status</th>
                                <th>Paid Date</th>
                                <th>Mode</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {emiSchedule.map((emi) => (
                                <tr key={emi.emiNo} className="group cursor-pointer">
                                    <td className="font-semibold text-slate-700">
                                        #{emi.emiNo}
                                    </td>
                                    <td className="text-slate-600">
                                        {emi.dueDate}
                                    </td>
                                    <td className="font-bold text-slate-900">
                                        ₹{emi.amount.toLocaleString()}
                                    </td>
                                    <td className="text-center">
                                        {emi.status === 'Paid' ? (
                                            <span className="status-badge status-verified">
                                                <CheckCircle size={10} strokeWidth={3} className="mr-1" /> Paid
                                            </span>
                                        ) : (
                                            <span className="status-badge status-pending">
                                                <Clock size={10} strokeWidth={3} className="mr-1" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-slate-500 text-sm">
                                        {emi.paidDate}
                                    </td>
                                    <td className="text-slate-500 text-sm">
                                        {emi.paymentMode}
                                    </td>
                                    <td className="text-right">
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ACFUserDetails;
