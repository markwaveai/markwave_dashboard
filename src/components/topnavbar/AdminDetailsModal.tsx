import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { setShowAdminDetails } from '../../store/slices/uiSlice';

interface AdminDetailsModalProps {
    adminName?: string;
    adminMobile?: string;
    adminRole?: string;
    lastLogin?: string;
    presentLogin?: string;
    adminReferralCode?: string;
    onLogout?: () => void;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = (props) => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector((state: RootState) => state.ui.showAdminDetails);
    const auth = useAppSelector((state: RootState) => state.auth);

    const adminName = props.adminName || auth.adminName;
    const adminMobile = props.adminMobile || auth.adminMobile;
    const adminRole = props.adminRole || auth.adminRole;
    const lastLogin = props.lastLogin || auth.lastLogin;
    const presentLogin = props.presentLogin || auth.presentLogin;
    const adminReferralCode = props.adminReferralCode;

    const onClose = () => {
        dispatch(setShowAdminDetails(false));
    };
    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 z-[1999] bg-transparent">
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[340px] bg-white rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-200 z-[2000] p-5 animate-in fade-in zoom-in-95 duration-200 md:absolute md:top-[75px] md:right-[25px] md:left-auto md:translate-x-0 md:translate-y-0 md:w-[320px] md:zoom-in-100 md:slide-in-from-top-2"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600 p-1 leading-none transition-colors"
                >
                    ×
                </button>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold flex items-center justify-center shrink-0">
                        {adminName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-base text-gray-800 font-semibold whitespace-nowrap overflow-hidden text-ellipsis m-0">
                            {adminName}
                        </h2>
                        <p className="text-xs text-gray-500 m-0">
                            {adminMobile}
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 bg-gray-50 p-4 rounded-lg text-sm">
                    <div>
                        <div className="text-xs text-gray-500 mb-0.5">Role</div>
                        <div className="font-semibold text-gray-700">{adminRole}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-0.5">Referral Code</div>
                        <div className="font-semibold text-gray-700 font-mono tracking-wider">{adminReferralCode || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-0.5">Last Login</div>
                        <div className="font-semibold text-gray-700">{lastLogin || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-0.5">Present Login</div>
                        <div className="font-semibold text-gray-700">{presentLogin || 'N/A'}</div>
                    </div>
                </div>

                <div className="mt-4 px-4">
                    <button
                        onClick={props.onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        Logout
                    </button>
                </div>

                <div className="mt-3 text-center">
                    <span className="text-xs text-gray-400">v1.0.1</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDetailsModal;
