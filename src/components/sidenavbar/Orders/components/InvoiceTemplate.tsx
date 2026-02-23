import React from 'react';
import { numberToIndianWords } from '../../Calculators/Emi/utils/numberToWords';
import logo from '../../../../assets/logo.png';

interface InvoiceTemplateProps {
    data: any;
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ data }, ref) => {
    const invoice = data || {};

    const formatCurrency = (val: any) => {
        if (val === undefined || val === null) return '0 /-';
        return `₹ ${Number(val).toLocaleString('en-IN')} /-`;
    };

    const totalInWords = invoice.total_amount ? numberToIndianWords(Number(invoice.total_amount)) : '';

    return (
        <div
            ref={ref}
            className="relative bg-white shadow-sm border border-gray-100 mx-auto print:shadow-none print:border-none print:p-0 text-slate-900 overflow-hidden"
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '15mm',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: '1.2',
                boxSizing: 'border-box'
            }}
        >
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                <img src={logo} alt="Watermark" className="w-[80%] max-w-[400px]" />
            </div>

            <div className="relative z-10 flex flex-col overflow-hidden">
                {/* Header with Logo */}
                <div className="flex justify-between items-start mb-6">
                    <div className="w-28">
                        <img src={logo} alt="AnimalKart Logo" className="w-full h-auto" />
                    </div>
                    <div className="text-right space-y-0.5">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">AnimalKart</h1>
                        <p className="text-[9px] text-slate-600 font-medium">206, 2nd Floor, PSR Prime Tower, Gachibowli, Telangana - 500032</p>
                        <p className="text-[9px] text-slate-600 font-medium">9247534762 | contact@markwave.ai</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">
                            CIN: U01411TS2025PTC202201 | GSTIN: 36ABDCA4827A1Z3
                        </p>
                    </div>
                </div>

                {/* INVOICE Label */}
                <div className="bg-[#CFE2F3] px-3 py-1.5 flex justify-between items-center mb-6 border border-slate-300">
                    <h2 className="text-lg font-black text-slate-900 tracking-[0.2em]">INVOICE</h2>
                    <p className="text-[9px] font-bold italic text-slate-700">Original For Recipient</p>
                </div>

                {/* Metadata Grid */}
                <div className="flex justify-between mb-6 text-[10px]">
                    <div className="grid grid-cols-[110px_1fr] gap-y-1.5">
                        <span className="font-bold text-slate-900">Invoice Number</span>
                        <span className="text-slate-700">: {invoice.invoice_number}</span>
                        <span className="font-bold text-slate-900">Invoice Date</span>
                        <span className="text-slate-700">: {invoice.invoice_generated_date}</span>
                        <span className="font-bold text-slate-900">Order ID</span>
                        <span className="text-slate-700">: {invoice.order_id}</span>
                    </div>
                    <div className="text-right">
                        <div className="grid grid-cols-[100px_1fr] gap-x-2">
                            <span className="font-bold text-slate-900 text-right">Order Placed At</span>
                            <span className="text-slate-700">: {invoice.order_placed_at}</span>
                        </div>
                    </div>
                </div>

                {/* Buyer / Shipping Grid */}
                <div className="grid grid-cols-2 border border-slate-300 mb-6 font-sans overflow-hidden">
                    <div className="border-r border-slate-300 flex flex-col">
                        <div className="bg-[#CFE2F3] px-3 py-1.5 border-b border-slate-300 text-[9px] font-black text-slate-900 uppercase tracking-widest text-center">
                            Details of Buyer
                        </div>
                        <div className="p-4 space-y-1.5 text-[10px] leading-snug flex-1 min-h-[80px]">
                            <p><span className="font-bold text-slate-900">Name:</span> {invoice.customer_name}</p>
                            <p><span className="font-bold text-slate-900">Mobile:</span> {invoice.customer_mobile}</p>
                            <p><span className="font-bold text-slate-900">Address:</span> {invoice.customer_address}</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="bg-[#CFE2F3] px-3 py-1.5 border-b border-slate-300 text-[9px] font-black text-slate-900 uppercase tracking-widest text-center">
                            Shipping Address
                        </div>
                        <div className="p-4 space-y-1.5 text-[10px] leading-snug flex-1 min-h-[80px]">
                            <p><span className="font-bold text-slate-900">Address:</span> {invoice.shipping_address}</p>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="mb-6 font-sans">
                    <table className="w-full border-collapse border border-slate-300">
                        <thead>
                            <tr className="bg-[#CFE2F3]">
                                <th className="border border-slate-300 px-2 py-2 text-[9px] font-black w-12 text-center text-slate-900 uppercase tracking-tighter">Sr. No.</th>
                                <th className="border border-slate-300 px-3 py-2 text-[9px] font-black text-center text-slate-900 uppercase tracking-tighter">Name of Product</th>
                                <th className="border border-slate-300 px-2 py-2 text-[9px] font-black w-22 text-center text-slate-900 uppercase tracking-tighter">QTY in Units</th>
                                <th className="border border-slate-300 px-3 py-2 text-[9px] font-black w-32 text-center text-slate-900 uppercase tracking-tighter">Rate</th>
                                <th className="border border-slate-300 px-3 py-2 text-[9px] font-black w-32 text-center text-slate-900 uppercase tracking-tighter">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-[10px]">
                                <td className="border border-slate-300 px-2 py-4 text-center text-slate-700">1</td>
                                <td className="border border-slate-300 px-4 py-4">
                                    <p className="font-bold text-[11px] text-slate-900 uppercase tracking-tight mb-0.5">{invoice.breed_id}</p>
                                    <p className="text-[9px] text-slate-500 font-medium">Buffalos: {invoice.buffalo_count} | Calves: {invoice.calf_count}</p>
                                </td>
                                <td className="border border-slate-300 px-2 py-4 text-center text-slate-900 font-bold">{invoice.num_units}</td>
                                <td className="border border-slate-300 px-3 py-4 text-center text-slate-900 whitespace-nowrap">{formatCurrency(invoice.unit_cost)}</td>
                                <td className="border border-slate-300 px-3 py-4 text-center font-bold text-slate-900 whitespace-nowrap">{formatCurrency(invoice.total_unit_cost)}</td>
                            </tr>
                            <tr className="bg-[#CFE2F3] text-[10px] h-8 font-black">
                                <td className="border border-slate-300" colSpan={2}>
                                    <div className="text-right px-4 uppercase text-slate-900 tracking-widest">Total</div>
                                </td>
                                <td className="border border-slate-300 px-2 text-center text-slate-900">{invoice.num_units}</td>
                                <td className="border border-slate-300"></td>
                                <td className="border border-slate-300 px-3 text-center text-slate-900 whitespace-nowrap">{formatCurrency(invoice.total_unit_cost)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payment Details Table */}
                <div className="mb-2 font-sans">
                    <table className="w-full border-collapse border border-slate-300">
                        <thead>
                            <tr className="bg-[#CFE2F3]">
                                <th className="border border-slate-300 px-2 py-2 text-[9px] font-black w-12 text-center text-slate-900 uppercase tracking-tighter">Sr. No.</th>
                                <th className="border border-slate-300 px-3 py-2 text-[9px] font-black text-center text-slate-900 uppercase tracking-tighter">Type of Payment</th>
                                <th className="border border-slate-300 px-3 py-2 text-[9px] font-black text-center text-slate-900 uppercase tracking-tighter">Name of Acc. Holder</th>
                                <th className="border border-slate-300 px-3 py-2 text-[9px] font-black w-36 text-center text-slate-900 uppercase tracking-tighter">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-[10px]">
                                <td className="border border-slate-300 px-2 py-4 text-center text-slate-700">1</td>
                                <td className="border border-slate-300 px-4 py-4 text-slate-900 font-medium">
                                    <div className="uppercase font-bold tracking-tight mb-0.5">{invoice.payment_type}</div>
                                    <div className="text-[8px] text-slate-500 uppercase">UTR NO: {invoice.utr_number || '—'}</div>
                                </td>
                                <td className="border border-slate-300 px-3 py-4 text-center uppercase font-medium text-slate-700">{invoice.account_holder_name || '—'}</td>
                                <td className="border border-slate-300 px-3 py-4 text-center font-bold text-slate-900 whitespace-nowrap">{formatCurrency(invoice.total_cost)}</td>
                            </tr>
                            {Number(invoice.coins_redeemed) > 0 && (
                                <tr className="text-[10px]">
                                    <td className="border border-slate-300 px-2 py-4 text-center text-slate-700">2</td>
                                    <td className="border border-slate-300 px-4 py-4 text-slate-900 font-medium capitalize">Coins Redeemed</td>
                                    <td className="border border-slate-300 px-3 py-4 text-center uppercase font-medium text-slate-700">{invoice.customer_name}</td>
                                    <td className="border border-slate-300 px-3 py-4 text-center font-bold text-slate-900">{Number(invoice.coins_redeemed).toLocaleString()}</td>
                                </tr>
                            )}
                            <tr className="bg-[#CFE2F3] text-[10px] h-8 font-black">
                                <td className="border border-slate-300" colSpan={3}>
                                    <div className="text-right px-4 uppercase text-slate-900 tracking-widest">Total</div>
                                </td>
                                <td className="border border-slate-300 px-3 text-center text-slate-900 whitespace-nowrap">{formatCurrency(invoice.total_amount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Amount in Words Section */}
                <div className="mt-5 bg-[#CFE2F3] border border-slate-300 px-4 py-3 mb-8 font-sans">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.15em] mb-1">Total Invoice Amount (in Words):</p>
                        <p className="text-[11px] font-bold text-slate-700 italic tracking-tight">Rupees {totalInWords} Only</p>
                    </div>
                </div>

                {/* Terms and Signatory Footer */}
                <div className="grid grid-cols-2 border border-slate-300 text-[9px] font-sans h-40">
                    <div className="p-4 border-r border-slate-300 flex flex-col justify-center">
                        <p className="font-bold text-[10px] text-slate-900 underline uppercase tracking-tight mb-2">Terms And Conditions</p>
                        <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed text-slate-600 text-[9px] font-medium">
                            <li>This is an electronically generated document.</li>
                            <li>This purchase is non-refundable.</li>
                            <li>Once confirmed, no cancellation or refund.</li>
                            <li>All disputes are subject to Kurnool jurisdiction.</li>
                        </ol>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-between text-center relative">
                        <p className="text-[8px] font-medium text-slate-400 absolute top-2 right-4 italic">Certified that the particulars given above are true and correct</p>

                        <div className="mt-auto w-full">
                            <p className="font-black text-[11px] text-slate-900 uppercase mb-10 tracking-tight">For, AnimalKart</p>
                            <div className="border-t border-slate-300 w-48 mx-auto pt-1.5">
                                <p className="font-black text-[9px] text-slate-800 uppercase tracking-[0.2em] opacity-80">Authorised Signatory</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
