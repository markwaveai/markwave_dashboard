import React, { useState, useEffect, useCallback } from 'react';
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

    // Local State
    const [adminReferralCode, setAdminReferralCode] = useState<string>('');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form Data (moved from PageBreadcrumb, mostly for Admin Referral Modal if it's still needed here)
    // Wait, the referral modal logic was in PageBreadcrumb. Is it triggered from Sidebar? 
    // No, PageBreadcrumb had `handleChoiceSelection` which listened to `creationRole` from Redux. 
    // This logic seems global, so it should stay in Layout.

    const [formData, setFormData] = useState({
        mobile: '',
        first_name: '',
        last_name: '',
        email: '',
        refered_by_mobile: '',
        refered_by_name: '',
        referral_code: '',
        role: 'Investor',
        is_test: 'false',
    });

    // UI State from Redux
    const { snackbar } = useAppSelector((state: RootState) => state.ui);
    const { creationRole } = useAppSelector((state: RootState) => state.ui.modals);
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
            if (adminProfile.referral_code) setAdminReferralCode(adminProfile.referral_code);
        }
    }, [adminProfile]);

    // Referral Modal Logic
    const handleChoiceSelection = useCallback((type: 'investor' | 'referral') => {
        setFormData(prev => ({
            ...prev,
            role: type === 'investor' ? 'Investor' : 'Employee',
            refered_by_mobile: adminMobile || '',
            refered_by_name: adminName || '', // We use adminName here, display logic is separate in TopNavbar
            referral_code: adminReferralCode || '',
            is_test: 'false'
        }));
        dispatch(setReferralModalOpen(true));
    }, [adminMobile, adminName, adminReferralCode, dispatch]);

    useEffect(() => {
        if (creationRole) {
            handleChoiceSelection(creationRole === 'Investor' ? 'investor' : 'referral');
            dispatch(setCreationRole(null));
        }
    }, [creationRole, dispatch, handleChoiceSelection]);

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

                <main id="dashboard-main-scroll-container" className="flex-1 overflow-y-auto p-0 bg-[var(--color-gray-50)]">
                    <div className="w-full p-3 lg:p-4">
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
        </div>
    );
};

export default Breadcrumb;
