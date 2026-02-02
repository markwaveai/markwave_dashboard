import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { LayoutDashboard, ClipboardList, Users, TreePine, ShoppingBag, LogOut, UserCheck, Menu, X, Calculator, MonitorPlay, Shield as ShieldIcon, LifeBuoy, UserMinus, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootState } from '../store';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  toggleSidebar,
  setSidebarOpen,
  setShowAdminDetails,
  setReferralModalOpen,
  setCreationRole,
  setSnackbar,
} from '../store/slices/uiSlice';

import {
  createReferralUser,
  setReferralUsers
} from '../store/slices/UsersSlice';

// Extracted Components
import ImageNamesModal from './products/components/ImageNamesModal';
import AdminDetailsModal from './Users/components/AdminDetailsModal';
import Logout from './auth/Logout';
import Snackbar from './common/Snackbar';

interface PageBreadcrumbProps {
  adminMobile?: string;
  adminName?: string;
  adminRole?: string;
  lastLogin?: string;
  presentLogin?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ adminMobile, adminName, adminRole, lastLogin, presentLogin, onLogout, children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Local State
  const [displayAdminName, setDisplayAdminName] = useState(adminName);
  const [adminReferralCode, setAdminReferralCode] = useState<string>('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Sidebar Sub-menu States
  const [isUnitCalcOpen, setIsUnitCalcOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const { isSidebarOpen, snackbar } = useAppSelector((state: RootState) => state.ui);
  const { creationRole } = useAppSelector((state: RootState) => state.ui.modals);

  // Determine active tab
  const currentPath = location.pathname;
  let activeTab = 'orders';
  if (currentPath.includes('/user-management/network')) activeTab = 'network';
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
  else if (currentPath.includes('/support-tickets')) activeTab = 'support-tickets';

  const handleChoiceSelection = useCallback((type: 'investor' | 'referral') => {
    setFormData(prev => ({
      ...prev,
      role: type === 'investor' ? 'Investor' : 'Employee',
      refered_by_mobile: adminMobile || '',
      refered_by_name: displayAdminName || '',
      referral_code: adminReferralCode || '',
      is_test: 'false'
    }));
    dispatch(setReferralModalOpen(true));
  }, [adminMobile, displayAdminName, adminReferralCode, dispatch]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      dispatch(setSidebarOpen(false));
    } else {
      dispatch(setSidebarOpen(true));
    }

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        dispatch(setSidebarOpen(false));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  useEffect(() => {
    // Open Unit Calc dropdown if we are on a child route
    if (location.pathname.includes('/unit-calculator')) {
      setIsUnitCalcOpen(true);
    }
  }, [location.pathname]);

  const { adminProfile } = useAppSelector((state: RootState) => state.users);

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
      if (user.referral_code) setAdminReferralCode(user.referral_code);
    }
  }, [adminProfile]);

  useEffect(() => {
    if (creationRole) {
      handleChoiceSelection(creationRole === 'Investor' ? 'investor' : 'referral');
      dispatch(setCreationRole(null));
    }
  }, [creationRole, dispatch, handleChoiceSelection]);

  const hasSession = !!adminMobile;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Mobile validation: Only allow numbers and max 10 digits
    if (name === 'mobile') {
      if (value && (!/^\d*$/.test(value) || value.length > 10)) {
        return;
      }
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked ? 'true' : 'false' });
    } else {
      setFormData({ ...formData, [name]: value });
      // Clear error when user types
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Mobile Validation
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    // Name Validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // Email Validation (Optional but must be valid if present)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'mobile':
        if (!value) error = 'Mobile number is required';
        else if (!/^\d{10}$/.test(value)) error = 'Mobile number must be 10 digits';
        break;
      case 'first_name':
        if (!value.trim()) error = 'First name is required';
        else if (value.length < 2) error = 'First name must be at least 2 characters';
        break;
      case 'last_name':
        if (!value.trim()) error = 'Last name is required';
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
    }
    return error;
  };

  const handleReferralFieldBlur = (field: string) => {
    const value = formData[field as keyof typeof formData] || '';
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    if (field === 'mobile' && !error) {
      fetchReferrerDetails(formData.refered_by_mobile, false);
    }
  };

  const fetchReferrerDetails = async (mobile: string, isEditMode: boolean = false) => {
    if (!mobile || mobile.length < 10) return;
    try {
      const response = await axios.get(API_ENDPOINTS.getUserDetails(mobile));
      if (response.data && response.data.user) {
        const user = response.data.user;
        let fullName = '';
        if (user.first_name || user.last_name) {
          fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        } else if (user.name) {
          fullName = user.name;
        }

        if (fullName) {
          setFormData(prev => ({ ...prev, refered_by_name: fullName }));
        }
      }
    } catch (error) {
      console.log('Referrer not found or error fetching details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        mobile: formData.mobile,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        referral_code: formData.referral_code,
        role: formData.role,
        refered_by_mobile: formData.refered_by_mobile,
        refered_by_name: formData.refered_by_name,
        isabletoreferr: formData.role === 'Employee' || formData.role === 'SpecialCategory',
        isTestAccount: formData.is_test === 'true',
      };
      const result = await dispatch(createReferralUser(payload)).unwrap();
      if (result.message === 'User already exists') {
        alert('User already exists with this mobile number.');
      } else {
        alert('User created successfully!');
      }
      dispatch(setReferralModalOpen(false));
      setFormData({
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
      setErrors({});

    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error || 'Error creating user. Please try again.');
    }
  };

  const navItemClass = (tab: string) => `
    flex items-center w-full px-3.5 py-2.5 bg-transparent rounded-[10px] 
    ${activeTab === tab ? 'bg-slate-600 text-white font-bold shadow-md' : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-0.5'}
    text-[0.85rem] font-medium cursor-pointer transition-all duration-200 text-left outline-none my-0.5 relative
  `;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans text-slate-700 overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      <div
        className={`fixed inset-0 bg-black/30 z-[99] md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => dispatch(setSidebarOpen(false))}
      />

      {hasSession && (
        <header className="bg-[#1e293b] h-[70px] px-6 flex items-center justify-between shadow-md z-[1000] text-white relative flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button className="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => dispatch(toggleSidebar())}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <img src="/header-logo.png" alt="Markwave Logo" className="h-[30px] w-auto transition-all" />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center">
            {/* Dashboard Switcher Removed */}
          </div>

          <div className="flex items-center">
            <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"></div>
              <span className="text-[0.85rem] font-semibold text-white">Online</span>
            </div>
            <div onClick={() => dispatch(setShowAdminDetails(true))} className="flex items-center gap-3 ml-6 cursor-pointer group">
              <div className="flex flex-col items-end opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-semibold text-[0.9rem] leading-none">{displayAdminName}</span>
              </div>
              <div className="flex items-center justify-center rounded-full bg-orange-500 text-white font-bold border-2 border-white/20 w-10 h-10 text-[1rem]">
                {displayAdminName ? displayAdminName.substring(0, 2).toUpperCase() : 'AD'}
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-row flex-1 overflow-hidden relative">
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
              <button className="flex items-center w-full px-3.5 py-2.5 bg-transparent rounded-[10px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left outline-none" onClick={(e) => { e.stopPropagation(); setIsLogoutModalOpen(true); }}>
                <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : 'flex-1'}`}>
                  <LogOut size={18} />
                  {isSidebarOpen && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-medium text-[0.85rem]">Logout</span>}
                </div>
              </button>
            </div>
          )}
        </nav>

        <main className="flex-1 overflow-y-auto p-0 bg-slate-100">
          {children}
        </main>
      </div>

      {hasSession && (
        <>
          <ImageNamesModal />
          <AdminDetailsModal
            adminName={displayAdminName}
            adminMobile={adminMobile}
            adminRole={adminRole}
            lastLogin={lastLogin}
            presentLogin={presentLogin}
            adminReferralCode={adminReferralCode}
            onLogout={() => {
              dispatch(setShowAdminDetails(false));
              setIsLogoutModalOpen(true);
            }}
          />

          <Logout isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={onLogout!} />
          <Snackbar
            message={snackbar.message}
            type={snackbar.type as 'success' | 'error' | null}
            onClose={() => dispatch(setSnackbar({ message: null, type: null }))}
          />
        </>
      )}
    </div>
  );
};

export default PageBreadcrumb;