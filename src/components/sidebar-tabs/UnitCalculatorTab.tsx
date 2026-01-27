import React from 'react';
import { useLocation } from 'react-router-dom';
import UnitCalculatorApp from '../unit-calculator/UnitCalculatorApp';

interface UnitCalculatorTabProps {
    tree?: boolean;
}

const UnitCalculatorTab: React.FC<UnitCalculatorTabProps> = ({ tree = true }) => {
    const location = useLocation();

    // Strict Access Control: Block manual URL edits between specific routes
    const isSidebarNav = location.state?.authorizedNavigation;

    // Check for invalid manual switching using Session Storage (Robust per-tab check)
    // 1. Authorized (Sidebar): Always Allow & Update Storage
    // 2. Unauthorized (Manual):
    //    - If Storage has "Last View" and it DOES NOT match current -> Suspicious Switch! (BLOCK)
    //    - If Storage is empty (New Tab) -> Allow & Update Storage
    //    - If Storage matches current (Refresh) -> Allow

    const currentPath = location.pathname;
    // Determine current logical view (Updated with Unique IDs)
    const currentViewType = currentPath.includes('/73d2a') ? 'mode-tree' :
        currentPath.includes('/92f1b') ? 'mode-revenue' : null;

    // We only care about guarding these two specific views
    let isInvalidSwitch = false;

    if (currentViewType) {
        // If coming from sidebar key -> Authorized -> Update Storage
        if (isSidebarNav) {
            sessionStorage.setItem('unitCalcLastView', currentViewType);
        } else {
            // Manual / Direct Access
            const lastView = sessionStorage.getItem('unitCalcLastView');

            // If we have a history of a DIFFERENT view in this tab, and we didn't use the sidebar...
            // It means the user manually edited the URL (e.g. 73d2a -> 92f1b) to switch views.
            if (lastView && lastView !== currentViewType) {
                isInvalidSwitch = true;
            } else {
                // First visit in this tab OR Refreshing same page -> Update/Confirm Storage
                sessionStorage.setItem('unitCalcLastView', currentViewType);
            }
        }
    }

    if (isInvalidSwitch) {
        return (
            <div style={{
                width: '100%',
                height: 'calc(100vh - 60px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
            }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Access Denied</h1>
                <p style={{ color: '#64748b' }}>Invalid navigation detected.</p>
                <p style={{ color: '#64748b', marginTop: '8px' }}>Please use the sidebar menu to switch views.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden', position: 'relative' }}>
            <UnitCalculatorApp key={tree ? 'with-tree' : 'without-tree'} tree={tree} />
        </div>
    );
};

export default UnitCalculatorTab;
