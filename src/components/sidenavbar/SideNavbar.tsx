import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Users, ShoppingBag, LogOut, UserCheck,
    Calculator, MonitorPlay, Shield as ShieldIcon, LifeBuoy, Warehouse, Award, Trophy,
    UserMinus, Mail, ChevronDown, ChevronRight, LayoutDashboard, FileText, ChevronLeft, Star, Search, UserCog, Coins
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
    const [isCalculatorsOpen, setIsCalculatorsOpen] = useState(false);
    const [isLandifyOpen, setIsLandifyOpen] = useState(false);
    const [isTrueHarvestOpen, setIsTrueHarvestOpen] = useState(false);

    // Determine active tab
    const currentPath = location.pathname;
    let activeTab = 'dashboard';
    if (currentPath === '/dashboard') activeTab = 'dashboard';
    else if (currentPath.includes('/orders')) activeTab = 'orders';
    else if (currentPath.includes('/user-management/network')) activeTab = 'network';
    else if (currentPath.includes('/buffalo-viz')) activeTab = 'buffaloViz';
    else if (currentPath.includes('/emi-calculator')) activeTab = 'emi';
    else if (currentPath.includes('/acf-calculator')) activeTab = 'acf-calculator';
    else if (currentPath.includes('/acf')) activeTab = 'acf';
    else if (currentPath.includes('/user-management') || currentPath.includes('/users/customers')) activeTab = 'user-management';
    else if (currentPath.includes('/products')) activeTab = 'products';
    else if (currentPath.includes('/offer-settings')) activeTab = 'offer-settings';
    else if (currentPath.includes('/offers-achieved')) activeTab = 'offers-achieved';
    else if (currentPath.includes('/role-requests')) activeTab = 'role-requests';
    else if (currentPath.includes('/farm-management')) activeTab = 'farm';
    else if (currentPath.includes('/true-harvest-privacy-policy')) activeTab = 'true-harvest-privacy';
    else if (currentPath.includes('/privacy-policy')) activeTab = 'privacy-policy';
    else if (currentPath.includes('/true-harvest-support')) activeTab = 'true-harvest-support';
    else if (currentPath.includes('/landify/legal')) activeTab = 'landify-legal';
    else if (currentPath.includes('/landify/support')) activeTab = 'landify-support';
    else if (currentPath.includes('/landify/delete')) activeTab = 'landify-delete';
    else if (currentPath.includes('/support-tickets')) activeTab = 'support-tickets';
    else if (currentPath.includes('/support')) activeTab = 'support';
    else if (currentPath.includes('/referral-landing')) activeTab = 'referral-landing';
    else if (currentPath.includes('/true-harvest-delete-user')) activeTab = 'true-harvest-delete-user';
    else if (currentPath.includes('/deactivate-user')) activeTab = 'deactivate-user';
    else if (currentPath.includes('/unit-calculator')) activeTab = 'unit-calculator';

    useEffect(() => {
        if (location.pathname.includes('/unit-calculator')) {
            setIsUnitCalcOpen(true);
        }
    }, [location.pathname]);

    const navItemClass = (tab: string) => `
        flex items-center w-full px-3 py-2 rounded-xl transition-all duration-200 text-left outline-none my-0.5 relative group
        ${activeTab === tab
            ? 'bg-[var(--color-brand-600)] text-white shadow-lg shadow-indigo-900/40 font-semibold'
            : 'text-[var(--color-gray-500)] hover:bg-[var(--color-gray-800)]/50 hover:text-[var(--color-gray-100)]'
        }
        text-[0.8125rem]
    `;

    return (
        <>
            <div
                className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[99] md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => dispatch(setSidebarOpen(false))}
            />

            <nav className={`
                ${isSidebarOpen ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-collapsed-width)]'} 
                bg-[var(--color-gray-950)] flex flex-col shrink-0 transition-[width] duration-[var(--transition-speed)] ease-[var(--ease-in-out)] 
                z-[100] text-white border-r border-[var(--color-gray-800)] h-full shadow-xl relative
            `}>
                {/* Branding Area */}
                <div className={`flex items-center gap-3 h-[var(--navbar-height)] px-4 border-b border-[var(--color-gray-800)]/50 ${!isSidebarOpen && 'justify-center px-0'}`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-transparent shrink-0 overflow-hidden">
                        <img src={require('../../assets/logo.png')} alt="AnimalKart" className="w-full h-full object-contain" />
                    </div>
                    {isSidebarOpen && (
                        <div className="flex flex-col animate-[fadeIn_0.3s_ease-out]">
                            <span className="font-bold text-xl tracking-tight leading-none text-white">AnimalKart</span>
                        </div>
                    )}
                </div>

                {/* Toggle Button - Outside scroll container, aligned with Orders */}
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="absolute -right-3 top-[calc(var(--navbar-height)+38px)] z-50 hidden md:flex items-center justify-center w-6 h-6 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 shadow-sm transition-colors"
                >
                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Inner Scrollable Container */}
                <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
                    <ul className="list-none flex flex-col gap-1 w-full">
                        {/* {hasSession && (
                            <li>
                                <button className={navItemClass('dashboard')} onClick={() => navigate('/dashboard', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Dashboard</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Dashboard</div>}
                                </button>
                            </li>
                        )} */}
                        {hasSession && (
                            <li className="relative group/toggle">
                                <button className={navItemClass('orders')} onClick={() => navigate('/orders', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <ClipboardList size={20} className={activeTab === 'orders' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Orders</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Orders</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('user-management')} onClick={() => navigate('/user-management', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Users size={20} className={activeTab === 'user-management' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Users</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Users</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('network')} onClick={() => navigate('/user-management/network', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Users size={20} className={activeTab === 'network' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Network</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Network</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('products')} onClick={() => navigate('/products', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <ShoppingBag size={20} className={activeTab === 'products' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Products</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Products</div>}
                                </button>
                            </li>
                        )}



                        {hasSession && (
                            <li>
                                <button className={navItemClass('offer-settings')} onClick={() => navigate('/offer-settings', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Award size={20} className={activeTab === 'offer-settings' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Offer Settings</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Offer Settings</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('offers-achieved')} onClick={() => navigate('/offers-achieved', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Trophy size={20} className={activeTab === 'offers-achieved' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Offers Achieved</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Offers Achieved</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('role-requests')} onClick={() => navigate('/role-requests', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <UserCog size={20} className={activeTab === 'role-requests' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Role Requests</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Role Requests</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('farm')} onClick={() => navigate('/farm-management', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Warehouse size={20} className={activeTab === 'farm' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Farm Mgmt</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Farm Management</div>}
                                </button>
                            </li>
                        )}

                        {/* <div className="my-4 border-t border-[var(--slate-800)]/50 mx-2"></div> */}

                        {/* <li>
                            <button className={navItemClass('buffaloViz')} onClick={() => navigate('/buffalo-viz', { state: { fromDashboard: true } })}>
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                    <MonitorPlay size={20} className={activeTab === 'buffaloViz' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Buffalo Viz</span>}
                                </div>
                                {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Buffalo Visualization</div>}
                            </button>
                        </li> */}
                        {/* {hasSession && (
                            <li>
                                <button className={navItemClass('acf')} onClick={() => navigate('/acf', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Coins size={20} className={activeTab === 'acf' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">ACF Tracking</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">ACF Tracking</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('support-tickets')} onClick={() => navigate('/support-tickets', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <LifeBuoy size={20} className={activeTab === 'support-tickets' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Support Tickets</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Support Tickets</div>}
                                </button>
                            </li>
                        )}
                        {hasSession && (
                            <li>
                                <button className={navItemClass('support')} onClick={() => navigate('/support', { state: { fromDashboard: true } })}>
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <LifeBuoy size={20} className={activeTab === 'support' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Support</span>}
                                    </div>
                                    {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Support</div>}
                                </button>
                            </li>
                        )} */}



                        {/* Calculators Group */}
                        {/* EMI Calculator */}
                        <li>
                            <button
                                className={navItemClass('emi')}
                                onClick={() => navigate('/emi-calculator', { state: { fromDashboard: true } })}
                            >
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                    <Calculator size={20} className={activeTab === 'emi' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">EMI Calculator</span>}
                                </div>
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        EMI Calculator
                                    </div>
                                )}
                            </button>
                        </li>

                        {/* ACF Calculator */}
                        <li>
                            <button
                                className={navItemClass('acf-calculator')}
                                onClick={() => navigate('/acf-calculator', { state: { fromDashboard: true } })}
                            >
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                    <Calculator size={20} className={activeTab === 'acf-calculator' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">ACF Calculator</span>}
                                </div>
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        ACF Calculator
                                    </div>
                                )}
                            </button>
                        </li>

                        <li>
                            <div className="flex flex-col">
                                <button
                                    className={navItemClass('unit-calculator')}
                                    onClick={() => {
                                        if (!isSidebarOpen) dispatch(setSidebarOpen(true));
                                        setIsUnitCalcOpen(!isUnitCalcOpen);
                                    }}
                                >
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Calculator size={20} className={activeTab === 'unit-calculator' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Unit Calculator</span>}
                                    </div>
                                    {isSidebarOpen && (isUnitCalcOpen ? <ChevronDown size={14} className="opacity-70 ml-auto" /> : <ChevronRight size={14} className="opacity-70 ml-auto" />)}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                            Unit Calculator
                                        </div>
                                    )}
                                </button>

                                {isSidebarOpen && isUnitCalcOpen && (
                                    <ul className="pl-4 mt-1 border-l border-[var(--slate-800)] ml-6 space-y-1">
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${location.pathname.includes('/73d2a') ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg-[var(--slate-800)]/30'}`}
                                                onClick={() => navigate('/unit-calculator/73d2a', { state: { fromDashboard: true } })}
                                            >
                                                With Tree
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${location.pathname.includes('/92f1b') ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg-[var(--slate-800)]/30'}`}
                                                onClick={() => navigate('/unit-calculator/92f1b', { state: { fromDashboard: true } })}
                                            >
                                                Without Tree
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </li>



                        {/* Privacy & Legal */}
                        <li>
                            <button
                                className={navItemClass('privacy-policy')}
                                onClick={() => navigate('/privacy-policy', { state: { fromDashboard: true } })}
                            >
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                    <ShieldIcon size={20} className={activeTab === 'privacy-policy' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Privacy Policy</span>}
                                </div>
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        Privacy Policy
                                    </div>
                                )}
                            </button>
                        </li>

                        <li>
                            <button
                                className={navItemClass('deactivate-user')}
                                onClick={() => navigate('/deactivate-user', { state: { fromDashboard: true } })}
                            >
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                    <UserMinus size={20} className={activeTab === 'deactivate-user' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Deactivate User</span>}
                                </div>
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        Deactivate User
                                    </div>
                                )}
                            </button>
                        </li>

                        <li>
                            <button
                                className={navItemClass('support')}
                                onClick={() => navigate('/support', { state: { fromDashboard: true } })}
                            >
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                    <LifeBuoy size={20} className={activeTab === 'support' ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                    {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Support</span>}
                                </div>
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        Support
                                    </div>
                                )}
                            </button>
                        </li>



                        {/* Platform Groups */}
                        <li>
                            <div className="flex flex-col">
                                <button
                                    className={navItemClass('landify-group')}
                                    onClick={() => {
                                        if (!isSidebarOpen) dispatch(setSidebarOpen(true));
                                        setIsLandifyOpen(!isLandifyOpen);
                                    }}
                                >
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <ShieldIcon size={20} className={activeTab.startsWith('landify') ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">Landify Platform</span>}
                                    </div>
                                    {isSidebarOpen && (isLandifyOpen ? <ChevronDown size={14} className="opacity-70 ml-auto" /> : <ChevronRight size={14} className="opacity-70 ml-auto" />)}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                            Landify Platform
                                        </div>
                                    )}
                                </button>
                                {isSidebarOpen && isLandifyOpen && (
                                    <ul className="pl-4 mt-1 border-l border-[var(--slate-800)] ml-6 space-y-1">
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'landify-legal' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg-[var(--slate-800)]/30'}`}
                                                onClick={() => navigate('/landify/legal', { state: { fromDashboard: true } })}
                                            >
                                                Legal
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'landify-support' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg-[var(--slate-800)]/30'}`}
                                                onClick={() => navigate('/landify/support', { state: { fromDashboard: true } })}
                                            >
                                                Support
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'landify-delete' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg-[var(--slate-800)]/30'}`}
                                                onClick={() => navigate('/landify/delete', { state: { fromDashboard: true } })}
                                            >
                                                Delete User
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </li>

                        <li>
                            <div className="flex flex-col">
                                <button
                                    className={navItemClass('true-harvest-group')}
                                    onClick={() => {
                                        if (!isSidebarOpen) dispatch(setSidebarOpen(true));
                                        setIsTrueHarvestOpen(!isTrueHarvestOpen);
                                    }}
                                >
                                    <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                        <Warehouse size={20} className={activeTab.startsWith('true-harvest') ? 'text-white' : 'text-[var(--slate-400)] group-hover:text-[var(--slate-200)]'} />
                                        {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium">True Harvest</span>}
                                    </div>
                                    {isSidebarOpen && (isTrueHarvestOpen ? <ChevronDown size={14} className="opacity-70 ml-auto" /> : <ChevronRight size={14} className="opacity-70 ml-auto" />)}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--slate-800)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                            True Harvest
                                        </div>
                                    )}
                                </button>
                                {isSidebarOpen && isTrueHarvestOpen && (
                                    <ul className="pl-4 mt-1 border-l border-[var(--slate-800)] ml-6 space-y-1">
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'true-harvest-privacy' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg-[var(--slate-800)]/30'}`}
                                                onClick={() => navigate('/true-harvest-privacy-policy', { state: { fromDashboard: true } })}
                                            >
                                                Privacy
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'true-harvest-support' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg(--slate-800)]/30'}`}
                                                onClick={() => navigate('/true-harvest-support', { state: { fromDashboard: true } })}
                                            >
                                                Support
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeTab === 'true-harvest-delete-user' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-[var(--slate-500)] hover:text-[var(--slate-200)] hover:bg-[var(--slate-800)]/30'}`}
                                                onClick={() => navigate('/true-harvest-delete-user', { state: { fromDashboard: true } })}
                                            >
                                                Delete User
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </li>
                    </ul>

                    {hasSession && (
                        <div className="mt-auto pt-6 border-t border-[var(--slate-800)] w-full">
                            <button
                                className="flex items-center w-full px-3 py-3 rounded-xl text-[var(--slate-400)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 outline-none group"
                                onClick={onLogoutTrigger}
                            >
                                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'px-1'}`}>
                                    <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                                    {isSidebarOpen && <span className="flex-1 font-bold text-[0.875rem]">Logout</span>}
                                </div>
                                {!isSidebarOpen && <div className="absolute left-full ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">Logout</div>}
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default SideNavbar;
