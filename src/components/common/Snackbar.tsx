import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface SnackbarProps {
    message: string | null;
    type: 'success' | 'error' | null;
    onClose: () => void;
    duration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;
    return (
        <div
            className={`fixed top-6 right-6 z-[99999] w-full max-w-[400px] flex items-center p-4 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 border backdrop-blur-md ${type === 'success'
                    ? 'bg-emerald-600/95 border-emerald-500/50 shadow-emerald-500/20 text-white'
                    : 'bg-red-600/95 border-red-500/50 shadow-red-500/20 text-white'
                }`}
        >
            <div className="flex items-start gap-4 w-full">
                <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                    {type === 'success' ? (
                        <CheckCircle size={20} className="text-white" />
                    ) : (
                        <AlertCircle size={20} className="text-white" />
                    )}
                </div>
                <div className="flex-grow pt-0.5">
                    <p className="font-bold text-base mb-0.5">{type === 'success' ? 'Success' : 'Error'}</p>
                    <p className="text-sm text-white/90 leading-snug">{message}</p>
                </div>
                <button
                    className="p-1 -mr-2 -mt-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={onClose}
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Snackbar;
