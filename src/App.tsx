import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setSession as setReduxSession } from './store/slices/authSlice';
import { fetchAdminProfile } from './store/slices/usersSlice';
import { RootState } from './store';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from './config/api';
import notificationService, { ForegroundNotification } from './services/notificationService';
import HealthStatus from './components/topnavbar/HealthStatus';
import Breadcrumb from './components/Breadcrumb/Breadcrumb';
import Login from './components/auth/Login';

// Tabs
// Tabs
import DashboardHome from './components/sidenavbar/Dashboard/DashboardHome';
import OrderDetailsPage from './components/sidenavbar/Orders/OrderDetailsPage';
import SupportTicketsTab from './components/sidenavbar/public/SupportTicketsTab';
import CustomerDetailsPage from './components/sidenavbar/Users/CustomerDetails';
import NetworkTab from './components/sidenavbar/Network/Network';
import NetworkUserDetailsPage from './components/sidenavbar/Network/NetworkUserDetails';
import ACFHome from './components/sidenavbar/Acf/ACFHome';
import ACFUserDetails from './components/sidenavbar/Acf/ACFUserDetails';

// Public Pages
import ReferralLandingPage from './components/sidenavbar/public/ReferralLandingPage';
import DeactivateUserPage from './components/sidenavbar/public/DeactivateUserPage';

// Redux
import { approveOrder, rejectOrder } from './store/slices/ordersSlice';
import { setHighlightedOrderId, setHighlightedMilestoneId, addNotification } from './store/slices/uiSlice';

// Privacy
import PrivacyPolicy from './components/sidenavbar/public/PrivacyPolicy';
import TrueHarvestPrivacyPolicy from './components/sidenavbar/true-harvest/TrueHarvestPrivacyPolicy';
import TrueHarvestDeleteUser from './components/sidenavbar/true-harvest/TrueHarvestDeleteUser';
import TrueHarvestSupport from './components/sidenavbar/true-harvest/TrueHarvestSupport';
import LandifyLegal from './components/sidenavbar/landify/LandifyLegal';
import LandifySupport from './components/sidenavbar/landify/LandifySupport';
import LandifyDeleteUser from './components/sidenavbar/landify/LandifyDeleteUser';
import Support from './components/sidenavbar/public/Support';

// Skeletons
import OrdersPageSkeleton from './components/common/skeletons/OrdersPageSkeleton';
import UsersPageSkeleton from './components/common/skeletons/UsersPageSkeleton';
import ProductsPageSkeleton from './components/common/skeletons/ProductsPageSkeleton';
import BuffaloVizSkeleton from './components/common/skeletons/BuffaloVizSkeleton';
import EmiCalculatorSkeleton from './components/common/skeletons/EmiCalculatorSkeleton';

// Tabs (Lazy Loaded)
const OrdersTab = React.lazy(() => import('./components/sidenavbar/Orders/OrdersTab'));
const UserDetails = React.lazy(() => import('./components/sidenavbar/Users/UserDetails'));
const ProductsTab = React.lazy(() => import('./components/sidenavbar/products/ProductsTab'));
const BuffaloVisualizationTab = React.lazy(() => import('./components/sidenavbar/BuffaloViz/BuffaloVisualizationTab'));
const EmiCalculatorTab = React.lazy(() => import('./components/sidenavbar/Calculators/Emi/EmiCalculatorTab'));
const AcfCalculatorTab = React.lazy(() => import('./components/sidenavbar/Calculators/Acf/AcfCalculatorTab'));
const UnitCalculatorTab = React.lazy(() => import('./components/sidenavbar/Calculators/Unit/UnitCalculatorTab'));
const FarmManagement = React.lazy(() => import('./components/sidenavbar/Farm/FarmManagement'));
const SelfBenefitsTab = React.lazy(() => import('./components/sidenavbar/SelfBenefits/SelfBenefitsTab'));
const ReferralBenefitsTab = React.lazy(() => import('./components/sidenavbar/ReferralBenefits/ReferralBenefitsTab'));
const RoleRequestsTab = React.lazy(() => import('./components/sidenavbar/RoleRequests/RoleRequestsTab'));
const OffersAchievedTab = React.lazy(() => import('./components/sidenavbar/OffersAchieved/OffersAchievedTab'));

interface Session {
  mobile: string;
  role: string | null;
  name?: string;
  lastLoginTime?: string;
  currentLoginTime?: string;
}




// Helper component to handle smart redirects for Unit Calculator based on session history
const SmartUnitCalculatorRedirect = () => {
  const lastMode = sessionStorage.getItem('lastUnitCalcMode') || '73d2a';
  return <Navigate to={`/unit-calculator/${lastMode}`} replace />;
};

function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = window.localStorage.getItem('ak_dashboard_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        window.localStorage.removeItem('ak_dashboard_session');
      }
    }
    return null;
  });
  const dispatch = useAppDispatch();
  const { adminProfile, adminProfileLoading } = useAppSelector((state: RootState) => state.users);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync session stats to Redux
  useEffect(() => {
    if (session) {
      dispatch(setReduxSession({
        adminMobile: session.mobile,
        adminName: session.name || 'Admin',
        adminRole: session.role || 'Admin',
        lastLogin: session.lastLoginTime || 'First Login',
        presentLogin: session.currentLoginTime || new Date().toLocaleString(),
      }));
    }
  }, [dispatch, session]);

  // Each toast has its own id so they stack independently
  type Toast = ForegroundNotification & { id: string };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    clearTimeout(toastTimers.current[id]);
    delete toastTimers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const pushToast = useCallback((payload: ForegroundNotification) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...payload, id }]);
    toastTimers.current[id] = setTimeout(() => dismissToast(id), 8000);
  }, [dismissToast]);

  // Fetch admin profile EXACTLY ONCE per session initialization
  useEffect(() => {
    if (session?.mobile && !adminProfile && !adminProfileLoading) {
      dispatch(fetchAdminProfile(session.mobile));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.mobile, dispatch]);

  // Wire up FCM: register SW, get/save token, subscribe to admin topic,
  // and listen for foreground and background messages.
  useEffect(() => {
    if (!session?.mobile) return;

    const roles = session.role ? session.role.split(',').map((r) => r.trim()) : [];

    // Foreground listener: store in Redux, show stacked toast, navigate + highlight
    const unsubscribeMessage = notificationService.onForegroundMessage((payload) => {
      dispatch(addNotification({ title: payload.title, body: payload.body, data: payload.data }));
      pushToast(payload);

      const data: Record<string, string> = payload.data || {};
      if (data.type === 'MILESTONE_ACHIEVED' && data.milestone_id) {
        dispatch(setHighlightedMilestoneId(data.milestone_id));
        navigate('/offer-settings');
      } else if (data.type === 'REFERRAL_REWARD' && data.recipient_mobile) {
        navigate(`/user-management/network/${data.recipient_mobile}`);
      } else if (data.order_id) {
        dispatch(setHighlightedOrderId(data.order_id));
        navigate('/orders');
      }
    });

    // Init FCM, save token, subscribe to admin topic
    notificationService.onUserLogin(session.mobile, roles);

    // Handle clicks on background OS notifications (posted by the service worker)
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'FCM_NOTIFICATION_CLICK') return;
      const url: string = event.data.url || '/orders';
      const urlObj = new URL(url, window.location.origin);
      const highlightOrder = urlObj.searchParams.get('highlight_order');
      const highlightMilestone = urlObj.searchParams.get('highlight_milestone');
      if (highlightOrder) dispatch(setHighlightedOrderId(highlightOrder));
      if (highlightMilestone) dispatch(setHighlightedMilestoneId(highlightMilestone));
      navigate(urlObj.pathname);
    };

    navigator.serviceWorker?.addEventListener('message', handleSwMessage);

    return () => {
      unsubscribeMessage();
      navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.mobile]);

  // Parse highlight query-params on cold open (tab opened by SW on notification click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightOrder = params.get('highlight_order');
    const highlightMilestone = params.get('highlight_milestone');
    if (highlightOrder) dispatch(setHighlightedOrderId(highlightOrder));
    if (highlightMilestone) dispatch(setHighlightedMilestoneId(highlightMilestone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleLogin = useCallback((s: Session) => {
    // Determine last login (from previous session or current if new)
    const prevSessionStr = window.localStorage.getItem('ak_dashboard_session');
    let lastLoginTime = new Date().toLocaleString();

    if (prevSessionStr) {
      try {
        const prevSession = JSON.parse(prevSessionStr);
        if (prevSession.currentLoginTime) {
          lastLoginTime = prevSession.currentLoginTime;
        }
      } catch (e) { }
    }

    const newSession = {
      ...s,
      currentLoginTime: new Date().toLocaleString(),
      lastLoginTime: lastLoginTime
    };

    window.localStorage.setItem('ak_dashboard_session', JSON.stringify(newSession));
    setSession(newSession);
    dispatch(setReduxSession({
      adminMobile: newSession.mobile,
      adminName: newSession.name || 'Admin',
      adminRole: newSession.role || 'Admin',
      lastLogin: newSession.lastLoginTime || 'First Login',
      presentLogin: newSession.currentLoginTime || new Date().toLocaleString(),
    }));

    const userRoles = newSession.role ? newSession.role.split(',').map(r => r.trim()) : [];
    const hasAdminAccess = userRoles.some(r => ['Admin', 'Animalkart admin', 'SuperAdmin'].includes(r));

    let defaultPath = '/orders';
    if (hasAdminAccess) {
      defaultPath = '/orders';
    }

    // Navigate to origin or default
    const from = (location.state as any)?.from?.pathname;
    const targetPath = from && from !== '/login' ? from : defaultPath;

    navigate(targetPath, { replace: true });
  }, [dispatch, location.state, navigate]);

  const handleLogout = () => {
    if (session?.mobile) {
      const roles = session.role ? session.role.split(',').map((r) => r.trim()) : [];
      notificationService.onUserLogout(session.mobile, roles);
    }
    window.localStorage.removeItem('ak_dashboard_session');
    setSession(null);
    navigate('/login', { replace: true });
  };

  const userRoles = session?.role ? session.role.split(',').map(r => r.trim()) : [];
  const isAdmin = userRoles.some(r => ['Admin', 'Animalkart admin', 'SuperAdmin'].includes(r));

  const getSortIcon = (key: string, currentSortConfig: any) => {
    if (currentSortConfig.key !== key) return '';
    return currentSortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="App">
      {/* Stacked foreground notification toasts — bottom-right column */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9997,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
        width: '360px',
        pointerEvents: toasts.length === 0 ? 'none' : 'auto',
      }}>
        {toasts.map((toast) => {
          const hasLink = !!(toast.data?.order_id || toast.data?.milestone_id || toast.data?.recipient_mobile);
          const handleView = () => {
            const data = toast.data || {};
            if (data.type === 'MILESTONE_ACHIEVED' && data.milestone_id) {
              dispatch(setHighlightedMilestoneId(data.milestone_id));
              navigate('/offer-settings');
            } else if (data.type === 'REFERRAL_REWARD' && data.recipient_mobile) {
              navigate(`/user-management/network/${data.recipient_mobile}`);
            } else if (data.order_id) {
              dispatch(setHighlightedOrderId(data.order_id));
              navigate('/orders');
            }
            dismissToast(toast.id);
          };
          return (
            <div key={toast.id} style={{
              backgroundColor: '#1e293b',
              color: 'white',
              padding: '14px 16px',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -3px rgba(0,0,0,0.5)',
              border: '1px solid rgba(99,102,241,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'slideIn 0.25s ease-out',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', lineHeight: '1.4', flex: 1 }}>{toast.title}</span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0', flexShrink: 0 }}>
                  ✕
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5', color: '#94a3b8' }}>{toast.body}</p>
              {hasLink && (
                <button
                  onClick={handleView}
                  style={{
                    marginTop: '6px',
                    alignSelf: 'flex-end',
                    background: 'none',
                    border: '1px solid rgba(99,102,241,0.4)',
                    color: '#818cf8',
                    cursor: 'pointer',
                    padding: '3px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}>
                  View →
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Routes>
        <Route path="/login" element={
          session ? <Navigate to="/orders" replace /> : <Login onLogin={handleLogin} />
        } />

        {/* Persistent Layout for all authenticated dashboard views */}
        <Route element={<DashboardLayout session={session} isAdmin={isAdmin} handleLogout={handleLogout} />}>

          {/* Strictly Protected Routes */}
          <Route element={<RequireAuth session={session} isAdmin={isAdmin} handleLogout={handleLogout}><Outlet /></RequireAuth>}>
            {/* <Route path="/dashboard" element={<DashboardHome />} /> */}

            <Route path="/orders" element={
              <React.Suspense fallback={<OrdersPageSkeleton />}>
                <OrdersTab />
              </React.Suspense>
            } />

            <Route path="/user-management" element={
              <React.Suspense fallback={<UsersPageSkeleton />}>
                <UserDetails getSortIcon={getSortIcon} />
              </React.Suspense>
            } />

            <Route path="/users/customers/:mobile" element={<CustomerDetailsPage />} />

            <Route path="/products" element={
              <React.Suspense fallback={<ProductsPageSkeleton />}>
                <ProductsTab />
              </React.Suspense>
            } />

            <Route path="/user-management/network" element={<NetworkTab />} />
            <Route path="/user-management/network/:mobile" element={<NetworkUserDetailsPage />} />

            <Route path="/acf" element={<ACFHome />} />
            <Route path="/acf/details/:userId/:orderId" element={<ACFUserDetails />} />

            <Route path="/support-tickets" element={<SupportTicketsTab />} />
            <Route path="/farm-management" element={
              <React.Suspense fallback={<OrdersPageSkeleton />}>
                <FarmManagement />
              </React.Suspense>
            } />
            <Route path="/offer-settings" element={
              <React.Suspense fallback={<OrdersPageSkeleton />}>
                <SelfBenefitsTab />
              </React.Suspense>
            } />
            <Route path="/offers-achieved" element={
              <React.Suspense fallback={<OrdersPageSkeleton />}>
                <OffersAchievedTab />
              </React.Suspense>
            } />
            <Route path="/role-requests" element={
              <React.Suspense fallback={<OrdersPageSkeleton />}>
                <RoleRequestsTab />
              </React.Suspense>
            } />
          </Route>

          {/* Public/Hybrid Routes - Layout visible if logged in */}
          <Route path="/buffalo-viz" element={
            <React.Suspense fallback={<BuffaloVizSkeleton />}>
              <BuffaloVisualizationTab />
            </React.Suspense>
          } />

          <Route path="/unit-calculator/73d2a" element={
            <React.Suspense fallback={<BuffaloVizSkeleton />}>
              <UnitCalculatorTab tree={true} />
            </React.Suspense>
          } />
          <Route path="/unit-calculator/92f1b" element={
            <React.Suspense fallback={<BuffaloVizSkeleton />}>
              <UnitCalculatorTab tree={false} />
            </React.Suspense>
          } />
          <Route path="/unit-calculator" element={<SmartUnitCalculatorRedirect />} />

          <Route path="/emi-calculator" element={
            <React.Suspense fallback={<EmiCalculatorSkeleton />}>
              <EmiCalculatorTab />
            </React.Suspense>
          } />

          <Route path="/acf-calculator" element={
            <React.Suspense fallback={<EmiCalculatorSkeleton />}>
              <AcfCalculatorTab />
            </React.Suspense>
          } />

          <Route path="/referral-landing" element={<ReferralLandingPage />} />
          <Route path="/deactivate-user" element={<DeactivateUserPage />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />

          <Route path="/true-harvest-privacy-policy" element={<TrueHarvestPrivacyPolicy />} />
          <Route path="/true-harvest-delete-user" element={<TrueHarvestDeleteUser />} />
          <Route path="/true-harvest-support" element={<TrueHarvestSupport />} />

          <Route path="/landify/legal" element={<LandifyLegal />} />
          <Route path="/landify/support" element={<LandifySupport />} />
          <Route path="/landify/delete" element={<LandifyDeleteUser />} />
        </Route>

        {/* Backward Compatibility Redirects */}
        <Route path="/dashboard/orders" element={<Navigate to="/orders" replace />} />
        <Route path="/dashboard/user-management" element={<Navigate to="/user-management" replace />} />
        <Route path="/dashboard/products" element={<Navigate to="/products" replace />} />
        <Route path="/dashboard/buffalo-viz" element={<Navigate to="/buffalo-viz" replace />} />
        <Route path="/dashboard/emi-calculator" element={<Navigate to="/emi-calculator" replace />} />
        <Route path="/dashboard/acf-calculator" element={<Navigate to="/acf-calculator" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/orders" replace />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={session ? "/orders" : "/login"} replace />} />
        <Route path="*" element={<Navigate to={session ? "/orders" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

const DashboardLayout = ({ session, isAdmin, handleLogout }: { session: Session | null, isAdmin: boolean, handleLogout: () => void }) => {
  const location = useLocation();

  // Define routes that should ALWAYS show the sidebar (protected dashboard content)
  const protectedPrefixes = [
    '/orders',
    '/user-management',
    '/users/customers',
    '/products',
    '/acf',
    '/support-tickets',
    '/farm-management',
    '/offer-settings',
    '/role-requests',
    '/offers-achieved'
  ];

  const isProtectedPath = protectedPrefixes.some(prefix => location.pathname.startsWith(prefix)) && !location.pathname.startsWith('/acf-calculator');

  // If the user navigates from the dashboard (via sidebar), state.fromDashboard will be true
  const isFromDashboard = !!(location.state as any)?.fromDashboard;

  // Hybrid paths are public pages that CAN show the dashboard layout if accessed from within
  const hybridPrefixes = [
    '/landify',
    '/true-harvest',
    '/support',
    '/privacy-policy',
    '/deactivate-user',
    '/unit-calculator',
    '/emi-calculator',
    '/acf-calculator'
  ];
  const isHybridPath = hybridPrefixes.some(prefix => location.pathname.startsWith(prefix));

  // We show the dashboard layout IF:
  // 1. It's a core protected dashboard route
  // 2. OR it's a hybrid route AND we are coming from the dashboard
  const showDashboardLayout = isProtectedPath || (isHybridPath && isFromDashboard);

  // Standalone mode is for public/hybrid pages accessed directly via URL or when no dashboard context is present
  const isStandalone = !showDashboardLayout;

  if (isStandalone) {
    return (
      <main className="h-screen w-full overflow-y-auto bg-slate-100">
        <Outlet />
      </main>
    );
  }

  return (
    <Breadcrumb
      adminMobile={session?.mobile}
      adminName={session?.name}
      adminRole={session?.role || undefined}
      lastLogin={session?.lastLoginTime}
      presentLogin={session?.currentLoginTime}
      onLogout={handleLogout}
    >
      <Outlet />
    </Breadcrumb>
  );
};

// Helper for strict protection
const RequireAuth = ({ children, session, isAdmin, handleLogout }: { children: React.ReactNode, session: Session | null, isAdmin: boolean, handleLogout: () => void }) => {
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Access Restricted</h2>
        <p style={{ marginBottom: 0 }}>Only authorized Admin users can access this dashboard. Please login with an Admin mobile.</p>
        <button onClick={handleLogout} style={{ marginTop: '1rem', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
    );
  }
  // Rolecheck
  const userRoles = session.role ? session.role.split(',').map(r => r.trim()) : [];
  if (userRoles.includes('Animalkart admin') && !userRoles.includes('SuperAdmin') && location.pathname.startsWith('/true-harvest')) {
    return <Navigate to="/orders" replace />;
  }
  return <>{children}</>;
};



export default App;
