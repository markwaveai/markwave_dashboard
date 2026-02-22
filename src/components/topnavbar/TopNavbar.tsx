import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar, setShowAdminDetails } from '../../store/slices/uiSlice';
import type { RootState } from '../../store';
import AdminDetailsModal from './AdminDetailsModal';
import NotificationPanel from './NotificationPanel';

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
    const { isSidebarOpen, notifications } = useAppSelector((state: RootState) => state.ui);
    const { adminProfile } = useAppSelector((state: RootState) => state.users);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const [displayAdminName, setDisplayAdminName] = useState(adminName);
    const [displayRole, setDisplayRole] = useState(adminRole);

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
            if (user.role) setDisplayRole(user.role);
        } else {
            if (adminName) setDisplayAdminName(adminName);
            if (adminRole) setDisplayRole(adminRole);
        }
    }, [adminProfile, adminName, adminRole]);

    return (
        <>
            <header className="sticky top-0 z-40 w-full transition-all duration-[var(--transition-speed)] bg-[var(--slate-950)] border-b border-[var(--slate-800)]/50 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 h-[var(--navbar-height)]">

                    {/* Left Side: Empty placeholder or logo-link if needed */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-2 -ml-2 text-[var(--slate-400)] hover:bg-[var(--slate-800)]/50 rounded-xl md:hidden transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Right Side: Bell + Profile Dropdown */}
                    <div className="flex items-center gap-4">

                        {/* Notification Bell */}
                        <button
                            onClick={() => setIsPanelOpen(prev => !prev)}
                            className="relative p-2 text-[var(--slate-400)] hover:bg-[var(--slate-800)]/50 hover:text-white rounded-xl transition-colors"
                            title="Notifications"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] bg-indigo-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Profile Dropdown Trigger */}
                        <div
                            onClick={() => dispatch(setShowAdminDetails(true))}
                            className="flex items-center gap-3 pl-2 py-1.5 pr-1.5 cursor-pointer group hover:bg-[var(--slate-800)]/30 rounded-2xl transition-all border border-transparent hover:border-[var(--slate-800)]"
                        >
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-white font-bold text-sm leading-tight group-hover:text-indigo-400 transition-colors">
                                    {displayAdminName || 'Admin'}
                                </span>
                                <span className="text-[var(--slate-500)] text-[10px] uppercase tracking-wider font-black">
                                    {displayRole || 'Administrator'}
                                </span>
                            </div>
                            <div className="relative">
                                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black shadow-lg shadow-indigo-500/20 w-10 h-10 text-sm ring-2 ring-[var(--slate-800)] transition-transform group-hover:scale-105 group-hover:rotate-3">
                                    {displayAdminName ? displayAdminName.substring(0, 2).toUpperCase() : 'AD'}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[var(--slate-950)] rounded-full"></div>
                            </div>
                            <ChevronDown size={14} className="text-[var(--slate-500)] group-hover:text-indigo-400 transition-colors mr-1" />
                        </div>
                    </div>
                </div>
            </header>

            <NotificationPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

            <AdminDetailsModal
                adminName={displayAdminName}
                adminMobile={adminMobile}
                adminRole={displayRole}
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
