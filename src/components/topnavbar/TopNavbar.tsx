import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
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
            <header className="header sticky top-0 z-40 w-full transition-all duration-300 bg-[#0f172a] border-b border-slate-800">
                <div className="flex items-center justify-between px-6 h-[70px]">

                    {/* Left Side: Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-2 -ml-2 text-slate-400 hover:bg-slate-800 rounded-lg md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <img
                            src="/header-logo-new.png"
                            alt="Logo"
                            className="h-8 object-contain"
                            onError={(e) => {
                                e.currentTarget.src = "/header-logo.png"; // Fallback
                            }}
                        />
                    </div>

                    {/* Right Side: Profile */}
                    <div className="flex items-center gap-6">

                        {/* Profile Dropdown Trigger */}
                        <div
                            onClick={() => dispatch(setShowAdminDetails(true))}
                            className="flex items-center gap-3 pl-4 cursor-pointer group"
                        >
                            <div className="flex flex-col items-end">
                                <span className="text-white font-bold text-sm leading-tight group-hover:text-blue-400 transition-colors">
                                    {displayAdminName || 'Admin'}
                                </span>
                                <span className="text-slate-400 text-xs font-medium">
                                    {adminRole || 'Administrator'}
                                </span>
                            </div>
                            <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-md shadow-blue-500/20 w-10 h-10 text-sm ring-2 ring-white/10 transition-transform group-hover:scale-105">
                                {displayAdminName ? displayAdminName.substring(0, 2).toUpperCase() : 'AD'}
                            </div>
                            <ChevronDown size={16} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
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
