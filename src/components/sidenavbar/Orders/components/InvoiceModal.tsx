import React, { useRef } from 'react';
import { X, Printer, Download, Building2, Phone, Mail, Globe, Hash } from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';
// @ts-ignore
import { useReactToPrint } from 'react-to-print';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import jsPDF from 'jspdf';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, data }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Invoice_${data?.invoice_number}`,
    });

    const handleDownload = async () => {
        if (!componentRef.current) return;
        const canvas = await html2canvas(componentRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice_${data?.invoice_number}.pdf`);
    };

    if (!isOpen) return null;

    const invoice = data || {};

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header Actions */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Hash className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Invoice Preview</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                    <InvoiceTemplate ref={componentRef} data={invoice} />
                </div>
            </div>
        </div>
    );
};

// Sub-components
const BankDetail = ({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) => (
    <div className="flex items-start gap-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase w-20 shrink-0">{label}</span>
        <span className={`text-[10px] font-black uppercase ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>{value || '-'}</span>
    </div>
);

const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

export default InvoiceModal;
