import React, { useEffect } from 'react';
import './Snackbar.css';
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
        <div className={`snackbar-container ${type} animate-slideDown`}>
            <div className="snackbar-content">
                {type === 'success' ? (
                    <CheckCircle className="snackbar-icon" size={20} />
                ) : (
                    <AlertCircle className="snackbar-icon" size={20} />
                )}
                <span className="snackbar-message">{message}</span>
                <button className="snackbar-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Snackbar;
