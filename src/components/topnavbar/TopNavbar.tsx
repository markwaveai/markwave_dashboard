import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar, setShowAdminDetails } from '../../store/slices/uiSlice';
import type { RootState } from '../../store';
import AdminDetailsModal from './AdminDetailsModal';

interface TopNavbarProps {
    adminMobile?: string;
    adminName?: string;
    adminRole?: string;
    lastLogin?: string;
    presentLogin?: string;
    adminReferralCode?: string;
    onLogoutTrigger: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
    adminMobile,
    adminName,
    adminRole,
    lastLogin,
    presentLogin,
    adminReferralCode,
    onLogoutTrigger
}) => {
    const dispatch = useAppDispatch();
    const { isSidebarOpen } = useAppSelector((state: RootState) => state.ui);
    const { adminProfile } = useAppSelector((state: RootState) => state.users);

    const [displayAdminName, setDisplayAdminName] = useState(adminName);

    useEffect(() => {
        if (adminProfile) {
            const user = adminProfile;
            let fullName = '';
            if (user.first_name || user.last_name) {
                fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
            } else if (user.name) {
                fullName = user.name;
            }
            if (fullName) setDisplayAdminName(fullName);
        } else if (adminName) {
            setDisplayAdminName(adminName);
        }
    }, [adminProfile, adminName]);

    return (
        <>
            <header className="bg-[#1e293b] h-[70px] px-6 flex items-center justify-between shadow-md z-[1000] text-white relative flex-shrink-0">
                <div className="flex items-center gap-1.5">
                    <button
                        className="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => dispatch(toggleSidebar())}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <img src="/header-logo.png" alt="Markwave Logo" className="h-[30px] w-auto transition-all" />
                </div>

             

                <div className="flex items-center">
                    <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"></div>
                        <span className="text-[0.85rem] font-semibold text-white">Online</span>
                    </div>
                    <div
                        onClick={() => dispatch(setShowAdminDetails(true))}
                        className="flex items-center gap-3 ml-6 cursor-pointer group"
                    >
                        <div className="flex flex-col items-end opacity-90 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-semibold text-[0.9rem] leading-none">
                                {displayAdminName}
                            </span>
                        </div>
                        <div className="flex items-center justify-center rounded-full bg-orange-500 text-white font-bold border-2 border-white/20 w-10 h-10 text-[1rem]">
                            {displayAdminName ? displayAdminName.substring(0, 2).toUpperCase() : 'AD'}
                        </div>
                    </div>
                </div>
            </header>

            <AdminDetailsModal
                adminName={displayAdminName}
                adminMobile={adminMobile}
                adminRole={adminRole}
                lastLogin={lastLogin}
                presentLogin={presentLogin}
                adminReferralCode={adminReferralCode}
                onLogout={() => {
                    dispatch(setShowAdminDetails(false));
                    onLogoutTrigger();
                }}
            />
        </>
    );
};

export default TopNavbar;
