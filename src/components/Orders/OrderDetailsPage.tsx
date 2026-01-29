import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    CreditCard,
    Package,
    Calendar,
    MapPin,
    Phone,
    Mail,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    Download
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPendingUnits } from '../../store/slices/ordersSlice';
import { RootState } from '../../store';


const OrderDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { adminMobile } = useAppSelector((state: RootState) => state.auth);
    const { pendingUnits, loading } = useAppSelector((state: RootState) => state.orders);

    // Local state to handle "single order fetch" status if not in list
    const [isFetchingInfo, setIsFetchingInfo] = useState(false);

    // Find order in current list
    const foundEntry = useMemo(() => {
        console.log('OrderDetailsPage Debug V2: orderId param:', orderId);
        if (!pendingUnits || !orderId) return null;
        const found = pendingUnits.find((u: any) => u.order?.id === orderId);
        console.log('Found entry in standard list:', found ? 'Yes' : 'No');
        return found;
    }, [pendingUnits, orderId]);

    useEffect(() => {
        // If not found in current list, try fetching specifically
        if (orderId && !foundEntry && adminMobile) {
            setIsFetchingInfo(true);
            dispatch(fetchPendingUnits({
                adminMobile,
                search: orderId,
                page: 1,
                pageSize: 10 // Fetch at least a few to be safe, though search should return 1
            })).finally(() => {
                setIsFetchingInfo(false);
            });
        }
    }, [orderId, adminMobile, dispatch, foundEntry]);

    const { order, transaction, investor } = foundEntry || {};

    // Fallback while loading
    if ((loading || isFetchingInfo) && !foundEntry) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500 font-medium">Loading Order Details...</div>
            </div>
        );
    }

    if (!foundEntry && !loading && !isFetchingInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center bg-gray-50">
                <div className="text-gray-800 font-bold text-lg mb-2">Order Not Found</div>
                <button
                    onClick={() => navigate('/orders')}
                    className="text-blue-600 hover:underline"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    // Helper to get transaction object - API structure might vary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txData: any = transaction?.transaction || transaction || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderObj: any = order || {};

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
            case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING_ADMIN_VERIFICATION': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING_PAYMENT': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const StatusIcon = (status: string) => {
        switch (status) {
            case 'PAID':
            case 'Approved': return <CheckCircle size={16} className="mr-1.5" />;
            case 'PENDING_ADMIN_VERIFICATION': return <Clock size={16} className="mr-1.5" />;
            case 'REJECTED': return <AlertCircle size={16} className="mr-1.5" />;
            case 'PENDING_PAYMENT': return <CreditCard size={16} className="mr-1.5" />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID':
            case 'Approved': return 'Paid';
            case 'PENDING_ADMIN_VERIFICATION': return 'Admin Approval';
            case 'REJECTED': return 'Rejected';
            case 'PENDING_PAYMENT': return 'Payment Due';
            default: return status?.replace(/_/g, ' ') || '-';
        }
    };

    const findVal = (obj: any, keys: string[], partials: string[]) => {
        if (!obj) return '-';
        for (const k of keys) {
            if (obj[k]) return obj[k];
        }
        const foundKey = Object.keys(obj).find(k =>
            partials.some(p => k.toLowerCase().includes(p))
        );
        return foundKey ? obj[foundKey] : '-';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* Header / Navbar style area */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/orders')}
                                className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Order {order?.id}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order?.paymentStatus)}`}>
                                        {StatusIcon(order?.paymentStatus)}
                                        {getStatusLabel(order?.paymentStatus)}
                                    </span>
                                </h1>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Placed on {order?.placedAt ? new Date(order.placedAt).toLocaleString() : '-'}
                                </p>
                            </div>
                        </div>
                        <div>
                            {/* Actions or Branding */}
                            <span className="text-sm font-medium text-gray-400">Order Details View</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Investor & Transaction (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Investor Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <User className="text-blue-500" size={20} />
                                    Investor Information
                                </h2>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${investor?.verified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {investor?.verified ? 'KYC Verified' : 'KYC Pending'}
                                </span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoItem icon={<User size={16} />} label="Full Name" value={investor?.name} />
                                <InfoItem icon={<Phone size={16} />} label="Mobile Number" value={investor?.mobile} />
                                <InfoItem icon={<Mail size={16} />} label="Email Address" value={investor?.email} />
                                <InfoItem icon={<MapPin size={16} />} label="Location" value={`${investor?.city || ''}, ${investor?.state || ''}`} />
                                <InfoItem icon={<FileText size={16} />} label="Role" value={investor?.role} />
                                <InfoItem icon={<Calendar size={16} />} label="Joined Date" value={investor?.user_created_date ? new Date(investor.user_created_date).toLocaleDateString() : '-'} />
                            </div>

                            {investor?.panCardUrl && (
                                <div className="px-6 pb-6 pt-2">
                                    <p className="text-sm font-medium text-gray-700 mb-3 block">Documents</p>
                                    <div className="inline-block relative group">
                                        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                                            <img src={investor.panCardUrl} alt="PAN Card" className="h-32 w-auto object-cover rounded shadow-sm" />
                                        </div>
                                        <a
                                            href={investor.panCardUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-50 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="View Full Size"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">PAN Card Image</p>
                                </div>
                            )}
                        </div>

                        {/* Transaction Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <CreditCard className="text-purple-500" size={20} />
                                    Payment Transaction
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                    <InfoItem
                                        label="Transaction Amount"
                                        value={`₹ ${Number(txData?.amount || txData?.totalCost || 0).toLocaleString()}`}
                                        isCurrency
                                    />
                                    <InfoItem
                                        label="UTR / Ref Number"
                                        value={findVal(txData, ['utr', 'utr_no', 'utr_number', 'transaction_id', 'cheque_no', 'cheque_number', 'chequeNo'], ['utr', 'txid', 'cheque'])}
                                        highlight
                                    />
                                    <InfoItem
                                        label="Bank Name"
                                        value={findVal(txData, ['bank_name', 'bankName', 'bank_details', 'payerBankName'], ['bank'])}
                                    />
                                    <InfoItem
                                        label="Payment Method"
                                        value={txData?.transferMode || txData?.paymentType || orderObj?.paymentType}
                                    />
                                    <InfoItem
                                        label="Transaction Date"
                                        value={findVal(txData, ['cheque_date', 'date', 'transactionDate', 'paymentDate'], ['date'])}
                                    />
                                    <InfoItem
                                        label="Account Number"
                                        value={findVal(txData, ['account_number', 'account_no', 'acc_no', 'ac_no', 'accountNumber'], ['account', 'acc_no'])}
                                    />
                                </div>

                                {(txData?.paymentScreenshotUrl || txData?.screenshot || txData?.paymentProof) && (
                                    <div className="mt-8 border-t border-gray-100 pt-6">
                                        <p className="text-sm font-medium text-gray-700 mb-3">Payment Proof</p>
                                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 max-w-md">
                                            <a href={txData?.paymentScreenshotUrl || txData?.screenshot || txData?.paymentProof} target="_blank" rel="noreferrer">
                                                <img
                                                    src={txData?.paymentScreenshotUrl || txData?.screenshot || txData?.paymentProof}
                                                    alt="Payment Screenshot"
                                                    className="w-full h-auto object-contain max-h-[400px]"
                                                />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary (1/3 width) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="bg-blue-600 px-6 py-6 text-white">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                                    <Package size={24} className="text-blue-200" />
                                    Order Summary
                                </h2>
                                <p className="text-blue-100 text-sm opacity-90">
                                    {order?.id}
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-end pb-4 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">₹ {order?.totalCost?.toLocaleString()}</span>
                                </div>

                                <div className="space-y-3">
                                    <SummaryRow label="Items / Units" value={order?.numUnits} />
                                    <SummaryRow label="Buffalo Count" value={order?.buffaloCount} />
                                    <SummaryRow label="Calf Count" value={order?.calfCount} />
                                    <SummaryRow label="Cost per Unit" value={`₹ ${order?.unitCost?.toLocaleString()}`} />
                                    <SummaryRow label="CPF Included" value={order?.withCpf ? 'Yes' : 'No'} />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Timeline</p>
                                    <div className="relative pl-4 space-y-4 border-l-2 border-gray-100 ml-1">
                                        <TimelineItem
                                            time={order?.submittedAt ? new Date(order.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            date={order?.submittedAt ? new Date(order.submittedAt).toLocaleDateString() : '-'}
                                            title="Order Submitted"
                                            active
                                        />
                                        <TimelineItem
                                            time={order?.placedAt ? new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            date={order?.placedAt ? new Date(order.placedAt).toLocaleDateString() : '-'}
                                            title="Order Placed"
                                            active
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                                <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                    Download Invoice
                                </button>
                                <button className="w-full py-2 px-4 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
                                    Contact Investor
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper Components
const InfoItem = ({ icon, label, value, isCurrency, highlight }: any) => (
    <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            {label}
        </span>
        <span className={`text-sm font-medium ${highlight ? 'text-blue-600 font-semibold' : 'text-gray-900'} ${isCurrency ? 'text-lg text-gray-900 font-bold' : ''}`}>
            {value || '-'}
        </span>
    </div>
);

const SummaryRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-900">{value || '-'}</span>
    </div>
);

const TimelineItem = ({ title, date, time, active }: any) => (
    <div className="relative">
        <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ${active ? 'bg-blue-500' : 'bg-gray-300'} ring-1 ring-gray-100`}></div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{date} • {time}</p>
    </div>
);

export default OrderDetailsPage;
