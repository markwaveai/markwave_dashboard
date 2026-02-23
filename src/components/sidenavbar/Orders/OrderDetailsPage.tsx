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
    Download,
    Printer
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPendingUnits } from '../../../store/slices/ordersSlice';
import { RootState } from '../../../store';
import { setProofModal } from '../../../store/slices/uiSlice';
import ImageNamesModal from '../../common/ImageNamesModal';
import InvoiceModal from './components/InvoiceModal';
import InvoiceTemplate from './components/InvoiceTemplate';
import { orderService } from '../../../services/api';
// @ts-ignore
import { useReactToPrint } from 'react-to-print';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import jsPDF from 'jspdf';
import { userService } from '../../../services/api';


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
    const [fetchedOrderData, setFetchedOrderData] = useState<any>(null);

    // Invoice State
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);
    const invoiceComponentRef = React.useRef<HTMLDivElement>(null);

    // Investor State for standalone fetching
    const [fetchedInvestor, setFetchedInvestor] = useState<any>(null);

    // Find order in current list or use specifically fetched data
    const foundEntry = useMemo(() => {
        if (fetchedOrderData) return fetchedOrderData;
        if (!pendingUnits || !orderId) return null;
        return pendingUnits.find((u: any) => u.order?.id === orderId);
    }, [pendingUnits, orderId, fetchedOrderData]);

    useEffect(() => {
        // If not found in current list, try fetching specifically using the dedicated endpoint
        if (orderId && !foundEntry && adminMobile) {
            setIsFetchingInfo(true);
            orderService.getOrderDetails(orderId)
                .then((response: any) => {
                    if (response?.status === 'success' && response.order) {
                        // Keep the expected structure { order: ... } for foundEntry
                        setFetchedOrderData(response);
                    }
                })
                .catch((err: any) => {
                    console.error('Error fetching specifically:', err);
                })
                .finally(() => {
                    setIsFetchingInfo(false);
                });
        }
    }, [orderId, adminMobile, dispatch, foundEntry]);

    const { order, transaction, investor: initialInvestor } = foundEntry || {};

    const investor = initialInvestor || fetchedInvestor;

    useEffect(() => {
        if (order?.userId && !initialInvestor && !fetchedInvestor) {
            userService.getUserDetails(order.userId)
                .then((res: any) => {
                    if (res && res.user) {
                        setFetchedInvestor(res.user);
                    } else if (res && Object.keys(res).length > 0) {
                        setFetchedInvestor(res); // Fallback in case response is the user itself
                    }
                })
                .catch(console.error);
        }
    }, [order?.userId, initialInvestor, fetchedInvestor]);

    // Helper to get transaction object - API structure might vary
    const rawTx = transaction || {};
    const orderObj: any = order || {};
    const txData: any = { ...orderObj, ...rawTx, ...(rawTx.transaction || {}) };

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

    // Memoized fetch function to avoid re-fetching if data exists
    const fetchInvoiceData = async () => {
        if (!order?.id || !investor?.mobile || invoiceData || isFetchingInvoice) return;
        setIsFetchingInvoice(true);
        try {
            const response = await orderService.getInvoiceDetails(order.id, investor.mobile);
            if (response?.status === 'success' && response.invoice) {
                setInvoiceData(response.invoice);
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
        } finally {
            setIsFetchingInvoice(false);
        }
    };

    useEffect(() => {
        if (order?.paymentStatus === 'PAID') {
            fetchInvoiceData();
        }
    }, [order?.paymentStatus, order?.id, investor?.mobile]);

    const handlePrintInvoice = useReactToPrint({
        contentRef: invoiceComponentRef,
        documentTitle: `Invoice_${invoiceData?.invoice_number}`,
    });

    const handleDownloadInvoice = async () => {
        if (!invoiceComponentRef.current) return;

        // High quality capture
        const canvas = await html2canvas(invoiceComponentRef.current, {
            scale: 3, // Increased scale for crisp PDF 
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice_${invoiceData?.invoice_number}.pdf`);
    };

    const handleOpenInNewTab = () => {
        if (!invoiceData) return;
        // In a real app, this would be a link to a dedicated PDF route or blob URL
        // For now, we'll use the modal as the "full view" since it's most robust
        setIsInvoiceOpen(true);
    };

    const handleViewInvoice = () => {
        if (invoiceData) {
            setIsInvoiceOpen(true);
        } else {
            fetchInvoiceData().then(() => {
                if (invoiceData) setIsInvoiceOpen(true);
            });
        }
    };

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
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
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

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* Header / Navbar style area */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
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
                                    Placed on {order?.placedAt || '-'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <span className="text-gray-400">Farm Location:</span>
                            <span className="font-medium text-gray-700">{order?.location || '-'}</span>
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
                                <InfoItem icon={<Calendar size={16} />} label="Joined Date" value={investor?.user_created_date || '-'} />
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
                                        value={findVal(txData, ['cash_payment_date', 'chequeDate', 'cheque_date', 'date', 'transactionDate', 'paymentDate', 'placedAt'], ['date', 'placed'])}
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

                        {/* Order History Timeline */}
                        {order?.history && order.history.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Clock className="text-blue-500" size={20} />
                                        Order History & Approvals
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                                        {order.history.map((event: any, index: number) => {
                                            const isApprove = event.action === 'APPROVE';
                                            const actionDate = event.approvedAt || event.rejectedAt || '-';
                                            const actionBy = event.approvedByName || event.rejectedByName || '-';
                                            const actionRole = event.role || event.stage || '-';

                                            // Make icon slightly overlap the border
                                            return (
                                                <div key={index} className="relative pl-8">
                                                    {/* Timeline dot */}
                                                    <div className={`absolute -left-[11px] bg-white p-0.5 rounded-full border-2 ${isApprove ? 'border-green-500' : 'border-red-500'}`}>
                                                        {isApprove ? (
                                                            <CheckCircle className="text-green-500 bg-white rounded-full" size={16} />
                                                        ) : (
                                                            <AlertCircle className="text-red-500 bg-white rounded-full" size={16} />
                                                        )}
                                                    </div>

                                                    {/* Content Card */}
                                                    <div className={`bg-white rounded-lg border p-4 shadow-sm ${isApprove ? 'border-green-100' : 'border-red-100'}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className={`text-md font-bold uppercase ${isApprove ? 'text-green-700' : 'text-red-700'}`}>
                                                                    {event.action} ({actionRole})
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    By: <span className="font-semibold">{actionBy}</span>
                                                                    {(event.approvedByNumber || event.rejectedByNumber) && (
                                                                        <span className="text-xs text-gray-400 ml-1">({event.approvedByNumber || event.rejectedByNumber})</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                                <Calendar size={12} />
                                                                {actionDate}
                                                            </div>
                                                        </div>

                                                        {event.comments && (
                                                            <div className="mt-3 bg-gray-50 p-2.5 rounded text-sm text-gray-700 border border-gray-100">
                                                                <span className="font-semibold text-gray-500 text-xs uppercase mr-2">Comments:</span>
                                                                {event.comments}
                                                            </div>
                                                        )}

                                                        {event.checks && Object.keys(event.checks).length > 0 && (
                                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Verification Checks</p>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                    {Object.entries(event.checks).map(([key, value]: [string, any]) => (
                                                                        <div key={key} className="flex items-center gap-1.5 text-xs">
                                                                            {value ? (
                                                                                <CheckCircle size={12} className="text-green-500" />
                                                                            ) : (
                                                                                <AlertCircle size={12} className="text-gray-300" />
                                                                            )}
                                                                            <span className={value ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}>
                                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Order Summary (1/3 width) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

                                <div className="space-y-3 pt-4">
                                    <SummaryRow label="Items / Units" value={order?.numUnits} />
                                    <SummaryRow label="Buffalo Count" value={order?.buffaloCount} />
                                    <SummaryRow label="Calf Count" value={order?.calfCount} />
                                    <SummaryRow label="Cost per Unit" value={`₹ ${order?.unitCost?.toLocaleString()}`} />
                                    <SummaryRow label="CPF Included" value={order?.withCpf ? 'Yes' : 'No'} />
                                    <SummaryRow label="Farm Location" value={order?.location} />
                                </div>
                            </div>
                        </div>

                        {/* Invoice & Documents Card - PDF Design */}
                        {order?.paymentStatus === 'PAID' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-slate-50 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                                        <FileText className="text-blue-600" size={18} />
                                        Invoice & Documents
                                    </h3>
                                    <div className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        Verified
                                    </div>
                                </div>
                                <div className="p-5">
                                    {/* PDF-Style Document Card */}
                                    <div
                                        onClick={handleOpenInNewTab}
                                        className="group relative cursor-pointer rounded-xl border border-gray-200 overflow-hidden transition-all hover:border-blue-300 hover:shadow-md active:scale-[0.98]"
                                    >
                                        {/* Clipped Preview Area */}
                                        <div className="h-[180px] bg-gray-50 overflow-hidden relative shadow-inner">
                                            {isFetchingInvoice ? (
                                                <div className="absolute inset-0 h-full flex flex-col items-center justify-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
                                                </div>
                                            ) : invoiceData ? (
                                                <div className="bg-white scale-[0.45] origin-top transform-gpu">
                                                    <InvoiceTemplate data={invoiceData} />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                                                    <FileText size={32} strokeWidth={1} />
                                                    <span className="text-[10px] font-bold uppercase">No Preview</span>
                                                </div>
                                            )}
                                            {/* Gradient Fade Overlay */}
                                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-50/100 to-transparent"></div>
                                        </div>

                                        {/* Dark PDF Info Footer (WhatsApp style) */}
                                        <div className="bg-[#1f2937] px-4 py-3 flex items-center justify-between group-hover:bg-[#111827] transition-colors">
                                            <div className="flex items-center gap-3">
                                                {/* Red PDF Icon */}
                                                <div className="w-10 h-10 bg-red-600 rounded-lg flex flex-col items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                                    <FileText size={16} className="text-white" />
                                                    <span className="text-[8px] font-black text-white -mt-0.5">PDF</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white tracking-tight">invoice.pdf</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        1 page • PDF • 68 kB
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/20 transition-all border border-white/5"
                                            >
                                                <ArrowLeft size={16} className="rotate-180" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePrintInvoice(); }}
                                            disabled={!invoiceData || isFetchingInvoice}
                                            className={`flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm ${!invoiceData || isFetchingInvoice ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow'}`}
                                        >
                                            <Printer size={16} />
                                            Print
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(); }}
                                            disabled={!invoiceData || isFetchingInvoice}
                                            className={`flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm ${!invoiceData || isFetchingInvoice ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:border-purple-500 hover:text-purple-600 hover:shadow'}`}
                                        >
                                            <Download size={16} />
                                            Download
                                        </button>
                                    </div>

                                    {isFetchingInvoice && (
                                        <div className="mt-4 text-[10px] text-center text-blue-500 font-black uppercase animate-pulse">
                                            Generating Document...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <ImageNamesModal />
                <InvoiceModal
                    isOpen={isInvoiceOpen}
                    onClose={() => setIsInvoiceOpen(false)}
                    data={invoiceData}
                />

                {/* Hidden Printable Invoice Section */}
                {invoiceData && (
                    <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '210mm' }}>
                        <InvoiceTemplate ref={invoiceComponentRef} data={invoiceData} />
                    </div>
                )}
            </div>
        </div >
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
