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

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPendingUnits } from '../../../store/slices/ordersSlice';
import { RootState } from '../../../store';
import { setProofModal } from '../../../store/slices/uiSlice';
import ImageNamesModal from '../../common/ImageNamesModal';


interface OrderDetailsPageProps {
    orderId?: string;
    onBack?: () => void;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId: propOrderId, onBack }) => {
    const { orderId: paramOrderId } = useParams<{ orderId: string }>();
    const orderId = propOrderId || paramOrderId;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { adminMobile } = useAppSelector((state: RootState) => state.auth);
    const { pendingUnits, loading } = useAppSelector((state: RootState) => state.orders);

    // Local state to handle "single order fetch" status if not in list
    const [isFetchingInfo, setIsFetchingInfo] = useState(false);

    // Find order in current list
    const foundEntry = useMemo(() => {
        if (!pendingUnits || !orderId) return null;
        return pendingUnits.find((u: any) => u.order?.id === orderId);
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
                    onClick={() => onBack ? onBack() : navigate('/orders')}
                    className="text-blue-600 hover:underline"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    // Helper to get transaction object - API structure might vary
    const rawTx = transaction || {};
    const txData: any = { ...rawTx, ...(rawTx.transaction || {}) };
    const orderObj: any = order || {};

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
            case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING_ADMIN_VERIFICATION': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PENDING_SUPER_ADMIN_VERIFICATION': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING_PAYMENT': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const StatusIcon = (status: string) => {
        switch (status) {
            case 'PAID':
            case 'Approved': return <CheckCircle size={16} className="mr-1.5" />;
            case 'PENDING_ADMIN_VERIFICATION':
            case 'PENDING_SUPER_ADMIN_VERIFICATION': return <Clock size={16} className="mr-1.5" />;
            case 'REJECTED': return <AlertCircle size={16} className="mr-1.5" />;
            case 'PENDING_PAYMENT': return <CreditCard size={16} className="mr-1.5" />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID':
            case 'Approved': return 'Paid';
            case 'PENDING_ADMIN_VERIFICATION': return 'Pending Admin Approval';
            case 'PENDING_SUPER_ADMIN_VERIFICATION': return 'Super Admin Approval';
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
    const handleImageClick = (url: string, name: string) => {
        dispatch(setProofModal({
            isOpen: true,
            data: { directUrl: url, name: name }
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* Header / Navbar style area */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => onBack ? onBack() : navigate('/orders')}
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
                                    Placed on {order?.placedAt ? new Date(order.placedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
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
                                    <div className="inline-block relative group cursor-pointer" onClick={() => handleImageClick(investor.panCardUrl, 'PAN Card')}>
                                        <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                                            <img src={investor.panCardUrl} alt="PAN Card" className="h-32 w-auto object-cover rounded shadow-sm" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                                        <div
                                            className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-50 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="View Full Size"
                                        >
                                            <FileText size={16} />
                                        </div>
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
                                        label={txData?.paymentType === 'CASH' ? "Cashier Name" : "UTR / Ref Number"}
                                        value={findVal(txData, ['cashier_name', 'utrNumber', 'utr', 'utr_no', 'utr_number', 'transaction_id', 'cheque_no', 'cheque_number', 'chequeNo'], ['utr', 'txid', 'cheque'])}
                                        highlight
                                    />
                                    <InfoItem
                                        label="Payment Method"
                                        value={txData?.transferMode || txData?.paymentType || orderObj?.paymentType}
                                    />
                                    <InfoItem
                                        label={txData?.paymentType === 'CASH' ? "Cash Payment Date" : "Transaction Date"}
                                        value={findVal(txData, ['cash_payment_date', 'chequeDate', 'cheque_date', 'date', 'transactionDate', 'paymentDate'], ['date'])}
                                    />
                                    {txData?.paymentType === 'CASH' && txData?.cashier_phone && (
                                        <InfoItem label="Cashier Phone" value={txData.cashier_phone} />
                                    )}
                                </div>

                                {(() => {
                                    const frontImg = txData?.chequeFrontImage || txData?.frontImageUrl || txData?.front_image_url || txData?.frontImage || txData?.cheque_front_image_url;
                                    const backImg = txData?.chequeBackImage || txData?.backImageUrl || txData?.back_image_url || txData?.backImage || txData?.cheque_back_image_url;
                                    const proofImg = txData?.voucher_image_url || txData?.paymentScreenshotUrl || txData?.screenshot || txData?.paymentProof || txData?.payment_proof_Url || txData?.proofImage;

                                    if (!frontImg && !backImg && !proofImg) return null;

                                    return (
                                        <div className="mt-8 border-t border-gray-100 pt-6">
                                            <p className="text-sm font-medium text-gray-700 mb-3">Payment Proof</p>
                                            <div className="flex flex-wrap gap-4">
                                                {frontImg && (
                                                    <div className="flex flex-col gap-1 cursor-pointer group" onClick={() => handleImageClick(frontImg, 'Cheque Front')}>
                                                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 w-48 relative">
                                                            <img src={frontImg} alt="Cheque Front" className="w-full h-32 object-contain" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-bold text-center group-hover:text-blue-600 transition-colors">Front View</span>
                                                    </div>
                                                )}
                                                {backImg && (
                                                    <div className="flex flex-col gap-1 cursor-pointer group" onClick={() => handleImageClick(backImg, 'Cheque Back')}>
                                                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 w-48 relative">
                                                            <img src={backImg} alt="Cheque Back" className="w-full h-32 object-contain" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-bold text-center group-hover:text-blue-600 transition-colors">Back View</span>
                                                    </div>
                                                )}
                                                {proofImg && (
                                                    <div className="flex flex-col gap-1 cursor-pointer group" onClick={() => handleImageClick(proofImg, 'Payment Proof')}>
                                                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 w-48 relative">
                                                            <img src={proofImg} alt="Payment Screenshot" className="w-full h-32 object-contain" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-bold text-center group-hover:text-blue-600 transition-colors">Payment View</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
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
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <ImageNamesModal />
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


export default OrderDetailsPage;
