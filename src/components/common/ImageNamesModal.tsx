import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { setProofModal } from '../../store/slices/uiSlice';


interface ImageNamesModalProps { }


const ImageNamesModal: React.FC<ImageNamesModalProps> = () => {
    const dispatch = useAppDispatch();
    const { isOpen, data } = useAppSelector((state: RootState) => state.ui.modals.proof);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-view if direct URL is provided
    React.useEffect(() => {
        if (isOpen && data?.directUrl) {
            setViewingImage(data.directUrl);
            setIsLoading(true);
        } else if (!isOpen) {
            setViewingImage(null);
        }
    }, [isOpen, data?.directUrl]);

    const onClose = () => {
        dispatch(setProofModal({ isOpen: false }));
    };

    if (!isOpen || !data) return null;

    const isImage = (key: string, value: any) => {
        if (typeof value !== 'string') return false;
        const lowerKey = key.toLowerCase();
        const lowerValue = value.toLowerCase();
        return (
            lowerKey.includes('image') ||
            lowerKey.includes('photo') ||
            lowerKey.includes('proof') ||
            lowerKey.includes('card') ||
            lowerValue.match(/\.(jpeg|jpg|png|gif|webp)(\?.*)?$/)
        );
    };

    const imageFields: [string, any][] = [];
    const tx = data?.transaction || data;

    if (tx) {
        // Check for Cheque Front Image (various common spellings)
        const frontVal = tx.chequeFrontImage || tx.frontImageUrl || tx.front_image_url || tx.frontImage || tx.cheque_front_image_url;
        if (frontVal) {
            imageFields.push(['Cheque Front', frontVal]);
        }

        // Check for Cheque Back Image (various common spellings)
        const backVal = tx.chequeBackImage || tx.backImageUrl || tx.back_image_url || tx.backImage || tx.cheque_back_image_url;
        if (backVal) {
            imageFields.push(['Cheque Back', backVal]);
        }

        if (tx.paymentScreenshotUrl) {
            imageFields.push(['Payment Proof', tx.paymentScreenshotUrl]);
        }
        // Check for Cash Voucher
        if (tx.voucher_image_url) {
            imageFields.push(['Cash Voucher', tx.voucher_image_url]);
        }
        // Fallback for payment_proof_Url if not covered
        if (!tx.paymentScreenshotUrl && !tx.voucher_image_url && tx.payment_proof_Url) {
            imageFields.push(['Payment Proof', tx.payment_proof_Url]);
        }
    }


    const handleClose = () => {
        setViewingImage(null);
        setIsLoading(false);
        onClose();
    };

    const handleViewImage = (url: string) => {
        setViewingImage(url);
        setIsLoading(true);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose}>
            <div
                className={`bg-white rounded-xl w-full max-w-lg shadow-2xl transition-all duration-300 transform scale-100 flex flex-col max-h-[90vh] ${viewingImage ? 'max-w-4xl h-[85vh]' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10 text-xl font-light"
                >
                    ×
                </button>

                {viewingImage ? (
                    <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                            View Document
                        </h3>

                        <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center border border-gray-300 shadow-inner p-2">
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                                    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
                                    <span className="text-sm text-gray-500 font-medium">Loading...</span>
                                </div>
                            )}
                            <img
                                src={viewingImage}
                                alt="ID Proof"
                                onLoad={() => setIsLoading(false)}
                                onError={() => setIsLoading(false)}
                                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            />
                        </div>

                        <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors active:scale-95 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Payment Proof Files: {data.name}
                            </h3>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            {imageFields.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-500 text-sm">No Payment proof documents found.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {imageFields.map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <div className="font-medium text-gray-700 capitalize group-hover:text-blue-700 transition-colors">
                                                    {key.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewImage(String(value))}
                                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-xl">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageNamesModal;
