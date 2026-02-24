import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import {
    setSidebarOpen,
    setReferralModalOpen,
    setCreationRole,
    setSnackbar,
} from '../../store/slices/uiSlice';
import {
    createReferralUser
} from '../../store/slices/usersSlice';

// Components
import TopNavbar from '../topnavbar/TopNavbar';
import SideNavbar from '../sidenavbar/SideNavbar';
import ImageNamesModal from '../common/ImageNamesModal';
import Logout from '../auth/Logout';
import Snackbar from '../common/Snackbar';
import { CreateUser } from '../sidenavbar/Users/CreateUser';

interface BreadcrumbProps {
    adminMobile?: string;
    adminName?: string;
    adminRole?: string;
    lastLogin?: string;
    presentLogin?: string;
    onLogout?: () => void;
    children: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
    adminMobile, adminName, adminRole, lastLogin, presentLogin, onLogout, children
}) => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const isUnitCalculator = location.pathname.includes('/unit-calculator');

    // Local State
    const [adminReferralCode, setAdminReferralCode] = useState<string>('');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [lastSelectedRole, setLastSelectedRole] = useState<'Investor' | 'Employee' | 'SpecialCategory' | undefined>(undefined);

    // UI State from Redux
    const { snackbar } = useAppSelector((state: RootState) => state.ui);
    const { creationRole, referral: isReferralModalOpen } = useAppSelector((state: RootState) => state.ui.modals);
    const { adminProfile } = useAppSelector((state: RootState) => state.users);

    // Resize Listener
    useEffect(() => {
        if (window.innerWidth <= 768) {
            dispatch(setSidebarOpen(false));
        }

        const handleResize = () => {
            if (window.innerWidth <= 768) {
                dispatch(setSidebarOpen(false));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [dispatch]);

    // Sync Admin Profile
    useEffect(() => {
        if (adminProfile) {
            const code = adminProfile.referral_code || adminProfile.referral_code;
            if (code) setAdminReferralCode(code);
        }
    }, [adminProfile]);

    useEffect(() => {
        if (creationRole) {
            setLastSelectedRole(creationRole);
            dispatch(setReferralModalOpen(true));
            dispatch(setCreationRole(null));
        }
    }, [creationRole, dispatch]);

    const hasSession = !!adminMobile;

    // Render
    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-gray-50)] font-sans text-[var(--color-gray-700)]">

            <SideNavbar
                hasSession={hasSession}
                adminReferralCode={adminReferralCode}
                onLogoutTrigger={() => setIsLogoutModalOpen(true)}
            />

            <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative">
                {hasSession && (
                    <TopNavbar
                        adminMobile={adminMobile}
                        adminName={adminName}
                        adminRole={adminRole}
                        lastLogin={lastLogin}
                        presentLogin={presentLogin}
                        adminReferralCode={adminReferralCode}
                        onLogoutTrigger={() => setIsLogoutModalOpen(true)}
                    />
                )}

                <main id="dashboard-main-scroll-container" className={`flex-1 ${isUnitCalculator ? 'overflow-hidden' : 'overflow-y-auto'} p-0 bg-[var(--color-gray-50)]`}>
                    <div className={`w-full h-full ${isUnitCalculator ? 'p-0' : 'p-3 lg:p-4'}`}>
                        {children}
                    </div>
                </main>
            </div>

            {hasSession && <ImageNamesModal />}

            <Logout
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={onLogout!}
            />

            <Snackbar
                message={snackbar.message}
                type={snackbar.type as 'success' | 'error' | null}
                onClose={() => dispatch(setSnackbar({ message: null, type: null }))}
            />

            <CreateUser
                isOpen={isReferralModalOpen}
                onClose={() => {
                    dispatch(setReferralModalOpen(false));
                    setLastSelectedRole(undefined);
                }}
                onSuccess={() => {
                    dispatch(setSnackbar({ message: 'Action completed successfully', type: 'success' }));
                }}
                adminReferralCode={adminReferralCode}
                initialRole={lastSelectedRole}
            />
        </div>
    );
};

export default Breadcrumb;
