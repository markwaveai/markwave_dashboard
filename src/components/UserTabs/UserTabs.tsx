import React, { useState, useEffect, useCallback } from 'react';
import './UserTabs.css';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { LayoutDashboard, Users, TreePine, ShoppingBag, LogOut, UserCheck, Menu, X, Calculator, MonitorPlay, Shield as ShieldIcon, LifeBuoy, UserMinus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  toggleSidebar,
  setSidebarOpen,
  setShowAdminDetails,
  setReferralModalOpen,
  setEditReferralModal,
  setCreationRole,
} from '../../store/slices/uiSlice';




import {
  fetchReferralUsers,
  fetchExistingCustomers,
  createReferralUser,
  setReferralUsers
} from '../../store/slices/usersSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchEmployees as fetchFarmvestEmployees } from '../../store/slices/farmvest/employees';


// Extracted Components
import ImageNamesModal from '../modals/ImageNamesModal';
import AdminDetailsModal from '../modals/AdminDetailsModal';
import ReferralModal from '../modals/ReferralModal';
import EditReferralModal from '../modals/EditReferralModal';
import RejectionModal from '../modals/RejectionModal';
import LogoutModal from '../modals/LogoutModal';

interface UserTabsProps {
  adminMobile?: string;
  adminName?: string;
  adminRole?: string;
  lastLogin?: string;
  presentLogin?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

const UserTabs: React.FC<UserTabsProps> = ({ adminMobile, adminName, adminRole, lastLogin, presentLogin, onLogout, children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Local State
  const [displayAdminName, setDisplayAdminName] = useState(adminName);
  const [adminReferralCode, setAdminReferralCode] = useState<string>('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [currentDashboard, setCurrentDashboard] = useState<'animalkart' | 'farmvest'>(() => {
    if (location.pathname.startsWith('/farmvest')) return 'farmvest';
    return 'animalkart';
  });

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

  const [editFormData, setEditFormData] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    refered_by_mobile: '',
    refered_by_name: '',
  });

  // UI State from Redux
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.ui);
  const { creationRole } = useAppSelector((state: RootState) => state.ui.modals);
  const { editReferral: { user: editingUser } } = useAppSelector((state: RootState) => state.ui.modals);

  // Determine active tab
  const currentPath = location.pathname;
  let activeTab = 'orders';
  if (currentPath.includes('/user-management')) activeTab = 'user-management';
  else if (currentPath.includes('/products')) activeTab = 'products';
  else if (currentPath.includes('/buffalo-viz')) activeTab = 'buffaloViz';
  else if (currentPath.includes('/emi-calculator')) activeTab = 'emi';
  else if (currentPath.includes('/acf-calculator')) activeTab = 'acf';
  else if (currentPath.includes('/orders')) activeTab = 'orders';
  else if (currentPath.includes('/privacy-policy')) activeTab = 'privacy';
  else if (currentPath.includes('/support')) activeTab = 'support';
  else if (currentPath.includes('/referral-landing')) activeTab = 'referral-landing';
  else if (currentPath.includes('/deactivate-user')) activeTab = 'deactivate-user';
  else if (currentPath.includes('/unit-calculator')) activeTab = 'unit-calculator';
  else if (currentPath.includes('/farmvest/employees')) activeTab = 'farmvest-employees';
  else if (currentPath.includes('/farmvest/farms')) activeTab = 'farmvest-farms';

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
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.getUserDetails(adminMobile!));
        if (response.data && response.data.user) {
          const user = response.data.user;
          let fullName = '';
          if (user.first_name || user.last_name) {
            fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          } else if (user.name) {
            fullName = user.name;
          }
          if (fullName) setDisplayAdminName(fullName);
          if (user.referral_code) setAdminReferralCode(user.referral_code);
        }
      } catch (error) {
        console.error('Failed to fetch admin details:', error);
      }
    };

    if (adminMobile) fetchAdminDetails();
  }, [adminMobile]);

  useEffect(() => {
    if (creationRole) {
      handleChoiceSelection(creationRole === 'Investor' ? 'investor' : 'referral');
      dispatch(setCreationRole(null));
    }
  }, [creationRole, dispatch, handleChoiceSelection]);

  const hasSession = !!adminMobile;

  useEffect(() => {
    if (location.pathname === '/user-management' && hasSession && adminMobile) {
      dispatch(fetchReferralUsers());
      dispatch(fetchExistingCustomers());
    } else if (location.pathname === '/products' && hasSession) {
      dispatch(fetchProducts());
    }
  }, [location.pathname, dispatch, adminMobile, hasSession]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked ? 'true' : 'false' });
    } else {
      setFormData({ ...formData, [name]: value });
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

        if (isEditMode) {
          setEditFormData(prev => ({ ...prev, refered_by_name: fullName }));
        } else {
          setFormData(prev => ({ ...prev, refered_by_name: fullName }));
        }
      }
    } catch (error) {
      console.log('Referrer not found or error fetching details');
    }
  };

  const handleReferralMobileBlur = () => {
    fetchReferrerDetails(formData.refered_by_mobile, false);
  };

  const handleEditReferralMobileBlur = () => {
    fetchReferrerDetails(editFormData.refered_by_mobile, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(createReferralUser(formData)).unwrap();
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
      if (formData.role === 'Employee') {
        dispatch(fetchFarmvestEmployees());
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error || 'Error creating user. Please try again.');
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(API_ENDPOINTS.updateUser(editingUser.mobile), {
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        refered_by_mobile: editFormData.refered_by_mobile,
        refered_by_name: editFormData.refered_by_name,
      });
      alert('User updated successfully!');
      dispatch(setEditReferralModal({ isOpen: false }));
      setEditFormData({
        mobile: '',
        first_name: '',
        last_name: '',
        refered_by_mobile: '',
        refered_by_name: '',
      });
      const refreshResponse = await axios.get(API_ENDPOINTS.getReferrals());
      dispatch(setReferralUsers(refreshResponse.data.users || []));
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => dispatch(setSidebarOpen(false))} />

      {hasSession && (
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button className="sidebar-toggle-btn" onClick={() => dispatch(toggleSidebar())}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <img src="/header-logo.png" alt="Markwave Logo" className="header-logo" />
          </div>

          <div className="header-center-title">
            <div className="dashboard-switcher">
              <button className={`switch-btn ${currentDashboard === 'animalkart' ? 'active' : ''}`} onClick={() => { setCurrentDashboard('animalkart'); navigate('/orders'); }}>
                Animalkart Dashboard
              </button>
              <button className={`switch-btn ${currentDashboard === 'farmvest' ? 'active' : ''}`} onClick={() => { setCurrentDashboard('farmvest'); navigate('/farmvest/employees'); }}>
                FarmVest Dashboard
              </button>
            </div>
          </div>

          <div className="header-right">
            <div className="status-pill">
              <div className="status-dot-green"></div>
              <span className="status-text">Online</span>
            </div>
            <div onClick={() => dispatch(setShowAdminDetails(true))} className="admin-header-profile">
              <div className="admin-name-container">
                <span className="admin-name-text">{displayAdminName}</span>
              </div>
              <div className="avatar-circle admin-avatar-small">
                {displayAdminName ? displayAdminName.substring(0, 2).toUpperCase() : 'AD'}
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="layout-body">
        <nav className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`} onClick={() => dispatch(toggleSidebar())}>
          <div className="sidebar-header">
            <button className="sidebar-close-btn-mobile" onClick={(e) => { e.stopPropagation(); dispatch(setSidebarOpen(false)); }}>
              <X size={20} />
            </button>
            <img src="/header-logo.png" alt="Markwave Logo" className="header-logo-sidebar" style={{ height: '28px' }} />
          </div>
          <ul className="sidebar-menu" style={{ marginTop: '10px' }}>
            {currentDashboard === 'animalkart' ? (
              <>
                {hasSession && (
                  <li>
                    <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/orders'); }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <LayoutDashboard size={18} />
                        <span className="nav-text">Orders</span>
                      </div>
                    </button>
                  </li>
                )}
                {hasSession && (
                  <li>
                    <button className={`nav-item ${activeTab === 'user-management' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/user-management'); }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <Users size={18} />
                        <span className="nav-text">User Management</span>
                      </div>
                    </button>
                  </li>
                )}
                {hasSession && (
                  <li>
                    <button className={`nav-item ${activeTab === 'products' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/products'); }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <ShoppingBag size={18} />
                        <span className="nav-text">Products</span>
                      </div>
                    </button>
                  </li>
                )}
                <li>
                  <button className={`nav-item ${activeTab === 'buffaloViz' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/buffalo-viz', { state: { fromDashboard: true } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <MonitorPlay size={18} />
                      <span className="nav-text">Buffalo Vis</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'unit-calculator' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/unit-calculator', { state: { fromDashboard: true } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <Calculator size={18} />
                      <span className="nav-text">Unit Calculator</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'emi' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/emi-calculator', { state: { fromDashboard: true } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <Calculator size={18} />
                      <span className="nav-text">EMI Calculator</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'acf' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/acf-calculator', { state: { fromDashboard: true } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <Calculator size={18} />
                      <span className="nav-text">ACF Calculator</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'privacy' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/privacy-policy', { state: { fromDashboard: true } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <ShieldIcon size={18} />
                      <span className="nav-text">Privacy & Policy</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'referral-landing' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/referral-landing', { state: { fromDashboard: true, adminReferralCode } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <UserCheck size={18} />
                      <span className="nav-text">Referral Page</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'deactivate-user' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/deactivate-user', { state: { fromDashboard: true } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <UserMinus size={18} />
                      <span className="nav-text">Deactivate User</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'support' ? 'active-main' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/support', { state: { fromDashboard: true } }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <LifeBuoy size={18} />
                      <span className="nav-text">Support</span>
                    </div>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button className={`nav-item ${activeTab === 'farmvest-employees' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/farmvest/employees'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <Users size={18} />
                      <span className="nav-text">Employees</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button className={`nav-item ${activeTab === 'farmvest-farms' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); navigate('/farmvest/farms'); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <TreePine size={18} />
                      <span className="nav-text">Farms</span>
                    </div>
                  </button>
                </li>
              </>
            )}
          </ul>

          {hasSession && (
            <div className="sidebar-footer">
              <button className="nav-item logout" onClick={(e) => { e.stopPropagation(); setIsLogoutModalOpen(true); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <LogOut size={18} />
                  <span className="nav-text">Logout</span>
                </div>
              </button>
            </div>
          )}
        </nav>

        <main className="main-content">
          {children}
          {hasSession && activeTab === 'user-management' && (
            <div className="fab-container">
              <button className="fab-main-btn" onClick={() => handleChoiceSelection('investor')} title="Add New Investor" aria-label="Add New Investor">+</button>
            </div>
          )}
        </main>
      </div>

      {hasSession && (
        <>
          <ReferralModal formData={formData} onInputChange={handleInputChange} onBlur={handleReferralMobileBlur} onSubmit={handleSubmit} adminReferralCode={adminReferralCode} canEditReferralCode={true} />
          <EditReferralModal editFormData={editFormData} onInputChange={handleEditInputChange} onBlur={handleEditReferralMobileBlur} onSubmit={handleEditSubmit} />
          <ImageNamesModal />
          <AdminDetailsModal adminName={displayAdminName} adminMobile={adminMobile} adminRole={adminRole} lastLogin={lastLogin} presentLogin={presentLogin} adminReferralCode={adminReferralCode} />
          <RejectionModal />
          <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={onLogout!} />
        </>
      )}
    </div>
  );
};

export default UserTabs;