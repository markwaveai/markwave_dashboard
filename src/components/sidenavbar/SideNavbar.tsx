import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Users, ShoppingBag, LogOut, UserCheck, X,
    Calculator, MonitorPlay, Shield as ShieldIcon, LifeBuoy,
    UserMinus, Mail, ChevronDown, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar, setSidebarOpen } from '../../store/slices/uiSlice';
import type { RootState } from '../../store';

interface SideNavbarProps {
    hasSession: boolean;
    adminReferralCode: string;
    onLogoutTrigger: () => void;
}

const SideNavbar: React.FC<SideNavbarProps> = ({
    hasSession,
    adminReferralCode,
    onLogoutTrigger
}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarOpen } = useAppSelector((state: RootState) => state.ui);

    // Sidebar Sub-menu States
    const [isUnitCalcOpen, setIsUnitCalcOpen] = useState(false);

    // Determine active tab
    const currentPath = location.pathname;
    let activeTab = 'dashboard';
    if (currentPath.includes('/orders')) activeTab = 'orders';
    else if (currentPath.includes('/user-management/network')) activeTab = 'network';
    else if (currentPath.includes('/buffalo-viz')) activeTab = 'buffaloViz';
    else if (currentPath.includes('/emi-calculator')) activeTab = 'emi';
    else if (currentPath.includes('/acf-calculator')) activeTab = 'acf';
    else if (currentPath.includes('/user-management') || currentPath.includes('/users/customers')) activeTab = 'user-management';
    else if (currentPath.includes('/products')) activeTab = 'products';
    else if (currentPath.includes('/true-harvest-privacy-policy')) activeTab = 'true-harvest-privacy';
    else if (currentPath.includes('/privacy-policy')) activeTab = 'privacy';
    else if (currentPath.includes('/true-harvest-support')) activeTab = 'true-harvest-support';
    else if (currentPath.includes('/landify/legal')) activeTab = 'landify-legal';
    else if (currentPath.includes('/landify/support')) activeTab = 'landify-support';
    else if (currentPath.includes('/landify/deactivate')) activeTab = 'landify-deactivate';
    else if (currentPath.includes('/support-tickets')) activeTab = 'support-tickets';
    else if (currentPath.includes('/support')) activeTab = 'support';
    else if (currentPath.includes('/referral-landing')) activeTab = 'referral-landing';
    else if (currentPath.includes('/true-harvest-deactivate-user')) activeTab = 'true-harvest-deactivate-user';
    else if (currentPath.includes('/deactivate-user')) activeTab = 'deactivate-user';
    else if (currentPath.includes('/unit-calculator')) {
        activeTab = 'unit-calculator';
    }

    useEffect(() => {
        // Open Unit Calc dropdown if we are on a child route
        if (location.pathname.includes('/unit-calculator')) {
            setIsUnitCalcOpen(true);
        }
    }, [location.pathname]);

    const navItemClass = (tab: string) => `
    flex items-center w-full px-3.5 py-2.5 bg-transparent rounded-[10px] 
    ${activeTab === tab ? 'bg-slate-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-0.5'}
    text-[0.85rem] font-medium cursor-pointer transition-all duration-200 text-left outline-none my-0.5 relative
  `;

    return (
        <>
            {/* Sidebar Overlay (Mobile) */}
            <div
                className={`fixed inset-0 bg-black/30 z-[99] md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => dispatch(setSidebarOpen(false))}
            />

            <nav className={`
          ${isSidebarOpen ? 'w-[200px]' : 'w-[60px]'} 
          bg-[#1e293b] flex flex-col shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
          whitespace-nowrap overflow-y-auto z-[100] text-white border-r border-white/10 
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        `}
                onClick={() => !isSidebarOpen && dispatch(toggleSidebar())}>
                <div className="flex md:hidden p-4 items-center justify-between">
                    <button className="text-white p-1 hover:bg-white/10 rounded" onClick={(e) => { e.stopPropagation(); dispatch(setSidebarOpen(false)); }}>
                        <X size={20} />
                    </button>
                    <img src="/header-logo.png" alt="Markwave Logo" className="h-7 w-auto" />
                </div>

                <ul className="list-none px-3 my-2.5 flex flex-col gap-1 mt-[10px]">
                    {hasSession && (
                        <li>
                            <button className={navItemClass('dashboard')} onClick={(e) => { e.stopPropagation(); navigate('/dashboard'); }}>
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                    <LayoutDashboard size={18} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Dashboard</span>}
                                </div>
                            </button>
                        </li>
                    )}
                    {hasSession && (
                        <li>
                            <button className={navItemClass('orders')} onClick={(e) => { e.stopPropagation(); navigate('/orders'); }}>
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                    <ClipboardList size={18} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Orders</span>}
                                </div>
                            </button>
                        </li>
                    )}
                    {hasSession && (
                        <li>
                            <button className={navItemClass('user-management')} onClick={(e) => { e.stopPropagation(); navigate('/user-management'); }}>
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                    <Users size={18} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">User Management</span>}
                                </div>
                            </button>
                        </li>
                    )}
                    {hasSession && (
                        <li>
                            <button className={navItemClass('network')} onClick={(e) => { e.stopPropagation(); navigate('/user-management/network'); }}>
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                    <Users size={18} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Network</span>}
                                </div>
                            </button>
                        </li>
                    )}
                    {hasSession && (
                        <li>
                            <button className={navItemClass('products')} onClick={(e) => { e.stopPropagation(); navigate('/products'); }}>
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                    <ShoppingBag size={18} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Products</span>}
                                </div>
                            </button>
                        </li>
                    )}
                    <li>
                        <button className={navItemClass('buffaloViz')} onClick={(e) => { e.stopPropagation(); navigate('/buffalo-viz', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <MonitorPlay size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Buffalo Vis</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <div className="flex flex-col">
                            <button
                                className={navItemClass('unit-calculator')}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsUnitCalcOpen(!isUnitCalcOpen);
                                }}
                            >
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                    <Calculator size={18} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Unit Calculator</span>}
                                </div>
                                {isSidebarOpen && (isUnitCalcOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                            </button>

                            {isSidebarOpen && isUnitCalcOpen && (
                                <ul className="pl-9 mt-1 list-none flex flex-col gap-1">
                                    <li>
                                        <Link
                                            className={`
                        flex items-center w-full px-3 py-2 rounded-lg text-[0.85rem] transition-colors
                        ${location.pathname.includes('/73d2a') ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                      `}
                                            to="/unit-calculator/73d2a"
                                            state={{ fromDashboard: true }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            With Tree
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className={`
                        flex items-center w-full px-3 py-2 rounded-lg text-[0.85rem] transition-colors
                        ${location.pathname.includes('/92f1b') ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                      `}
                                            to="/unit-calculator/92f1b"
                                            state={{ fromDashboard: true }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Without Tree
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </li>
                    <li>
                        <button className={navItemClass('emi')} onClick={(e) => { e.stopPropagation(); navigate('/emi-calculator', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <Calculator size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">EMI Calculator</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('acf')} onClick={(e) => { e.stopPropagation(); navigate('/acf-calculator', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <Calculator size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">ACF Calculator</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('privacy')} onClick={(e) => { e.stopPropagation(); navigate('/privacy-policy', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <ShieldIcon size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Privacy & Policy</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('referral-landing')} onClick={(e) => { e.stopPropagation(); navigate('/referral-landing', { state: { fromDashboard: true, adminReferralCode } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <UserCheck size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Referral Page</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('deactivate-user')} onClick={(e) => { e.stopPropagation(); navigate('/deactivate-user', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <UserMinus size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Deactivate User</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('true-harvest-privacy')} onClick={(e) => { e.stopPropagation(); navigate('/true-harvest-privacy-policy', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <ShieldIcon size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">True Harvest Privacy</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('true-harvest-deactivate-user')} onClick={(e) => { e.stopPropagation(); navigate('/true-harvest-deactivate-user', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <UserMinus size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">True Harvest Deactivate</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('true-harvest-support')} onClick={(e) => { e.stopPropagation(); navigate('/true-harvest-support', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <LifeBuoy size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">True Harvest Support</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('landify-legal')} onClick={(e) => { e.stopPropagation(); navigate('/landify/legal', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <ShieldIcon size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Landify Legal</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('landify-support')} onClick={(e) => { e.stopPropagation(); navigate('/landify/support', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <LifeBuoy size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Landify Support</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('landify-deactivate')} onClick={(e) => { e.stopPropagation(); navigate('/landify/deactivate', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <UserMinus size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Landify Deactivate</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('support')} onClick={(e) => { e.stopPropagation(); navigate('/support', { state: { fromDashboard: true } }); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <LifeBuoy size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Support</span>}
                            </div>
                        </button>
                    </li>
                    <li>
                        <button className={navItemClass('support-tickets')} onClick={(e) => { e.stopPropagation(); navigate('/support-tickets'); }}>
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <Mail size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Support Ticket</span>}
                            </div>
                        </button>
                    </li>
                </ul>

                {hasSession && (
                    <div className="mt-auto p-3.5 border-t border-white/10 flex-shrink-0">
                        <button
                            className="flex items-center w-full px-3.5 py-2.5 bg-transparent rounded-[10px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left outline-none"
                            onClick={(e) => { e.stopPropagation(); onLogoutTrigger(); }}
                        >
                            <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                                <LogOut size={18} />
                                {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium text-[0.85rem]">Logout</span>}
                            </div>
                        </button>
                    </div>
                )}
            </nav>
        </>
    );
};

export default SideNavbar;
