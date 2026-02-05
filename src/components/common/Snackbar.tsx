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
            className={`fixed top-6 right-6 z-[99999] w-[350px] h-16 flex items-center px-4 rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-right duration-300 ${type === 'success' ? 'bg-emerald-500 border border-white/20' : 'bg-red-500 border border-white/20'}`}
        >
            <div className="flex items-center gap-3 w-full">
                {type === 'success' ? (
                    <CheckCircle className="flex-shrink-0" size={20} color="white" />
                ) : (
                    <AlertCircle className="flex-shrink-0" size={20} color="white" />
                )}
                <span className="text-sm font-semibold text-white flex-grow">{message}</span>
                <button
                    className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={onClose}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};


export default Snackbar;
