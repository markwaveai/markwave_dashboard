import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setSession as setReduxSession } from './store/slices/authSlice';
import { fetchAdminProfile } from './store/slices/usersSlice';
import { RootState } from './store';
import React, { useState, useCallback, useEffect } from 'react';
import HealthStatus from './components/topnavbar/HealthStatus';
import Breadcrumb from './components/Breadcrumb/Breadcrumb';
import Login from './components/auth/Login';

// Tabs
// Tabs
import DashboardHome from './components/sidenavbar/Dashboard/DashboardHome';
import OrdersTab from './components/sidenavbar/Orders/OrdersTab';
import OrderDetailsPage from './components/sidenavbar/Orders/OrderDetailsPage';
import UserDetails from './components/sidenavbar/Users/UserDetails';
import ProductsTab from './components/sidenavbar/products/ProductsTab';
import BuffaloVisualizationTab from './components/sidenavbar/BuffaloViz/BuffaloVisualizationTab';
import EmiCalculatorTab from './components/sidenavbar/Calculators/Emi/EmiCalculatorTab';
import AcfCalculatorTab from './components/sidenavbar/Calculators/Acf/AcfCalculatorTab';
import UnitCalculatorTab from './components/sidenavbar/Calculators/Unit/UnitCalculatorTab';
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

// Privacy
import PrivacyPolicy from './components/sidenavbar/public/PrivacyPolicy';
import TrueHarvestPrivacyPolicy from './components/sidenavbar/true-harvest/TrueHarvestPrivacyPolicy';
import TrueHarvestDeactivateUser from './components/sidenavbar/true-harvest/TrueHarvestDeactivateUser';
import TrueHarvestSupport from './components/sidenavbar/true-harvest/TrueHarvestSupport';
import LandifyLegal from './components/sidenavbar/landify/LandifyLegal';
import LandifySupport from './components/sidenavbar/landify/LandifySupport';
import LandifyDeactivateUser from './components/sidenavbar/landify/LandifyDeactivateUser';
import Support from './components/sidenavbar/public/Support';

// Skeletons
import OrdersPageSkeleton from './components/common/skeletons/OrdersPageSkeleton';
import UsersPageSkeleton from './components/common/skeletons/UsersPageSkeleton';
import ProductsPageSkeleton from './components/common/skeletons/ProductsPageSkeleton';
import BuffaloVizSkeleton from './components/common/skeletons/BuffaloVizSkeleton';
import EmiCalculatorSkeleton from './components/common/skeletons/EmiCalculatorSkeleton';



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

  useEffect(() => {
    if (session) {
      dispatch(setReduxSession({
        adminMobile: session.mobile,
        adminName: session.name || 'Admin',
        adminRole: session.role || 'Admin',
        lastLogin: session.lastLoginTime || 'First Login',
        presentLogin: session.currentLoginTime || new Date().toLocaleString(),
      }));

      // Fetch admin profile if not already loaded to prevent repeated API calls
      if (!adminProfile && !adminProfileLoading) {
        dispatch(fetchAdminProfile(session.mobile));
      }
    }
  }, [dispatch, session, adminProfile, adminProfileLoading]);

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

    let defaultPath = '/orders';
    if (newSession.role === 'Animalkart admin') {
      defaultPath = '/orders';
    }

    // Navigate to origin or default
    const from = (location.state as any)?.from?.pathname;
    const targetPath = from && from !== '/login' ? from : defaultPath;

    navigate(targetPath, { replace: true });
  }, [dispatch, location.state, navigate]);

  const handleLogout = () => {
    window.localStorage.removeItem('ak_dashboard_session');
    setSession(null);
  };

  const isAdmin = session?.role === 'Admin' || session?.role === 'Animalkart admin';

  const getSortIcon = (key: string, currentSortConfig: any) => {
    if (currentSortConfig.key !== key) return '';
    return currentSortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={
          session ? <Navigate to="/orders" replace /> : <Login onLogin={handleLogin} />
        } />

        {/* Persistent Layout for all authenticated dashboard views */}
        <Route element={<DashboardLayout session={session} isAdmin={isAdmin} handleLogout={handleLogout} />}>

          {/* Strictly Protected Routes */}
          <Route element={<RequireAuth session={session} isAdmin={isAdmin} handleLogout={handleLogout}><Outlet /></RequireAuth>}>
            <Route path="/dashboard" element={<DashboardHome />} />

            <Route path="/orders" element={
              <React.Suspense fallback={<OrdersPageSkeleton />}>
                <OrdersTab />
              </React.Suspense>
            } />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />

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
            <Route path="/acf/:userId" element={<ACFUserDetails />} />

            <Route path="/support-tickets" element={<SupportTicketsTab />} />
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
          <Route path="/true-harvest-deactivate-user" element={<TrueHarvestDeactivateUser />} />
          <Route path="/true-harvest-support" element={<TrueHarvestSupport />} />

          <Route path="/landify/legal" element={<LandifyLegal />} />
          <Route path="/landify/support" element={<LandifySupport />} />
          <Route path="/landify/deactivate" element={<LandifyDeactivateUser />} />
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
        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

const DashboardLayout = ({ session, isAdmin, handleLogout }: { session: Session | null, isAdmin: boolean, handleLogout: () => void }) => {
  const location = useLocation();

  // Redirect to login if no session for protected routes
  // But wait, we have mixed routes here. 
  // Let's keep strict protection for the main dashboard routes and conditional for others?
  // Actually, to keep sidebar persistent, the hierarchy must be:
  // <Route element={<DashboardLayout />}>
  //    <Route path="/protected" ... />
  //    <Route path="/public-with-sidebar" ... />
  // </Route>

  // If we want Breadcrumb to persist, DashboardLayout MUST be the parent.
  // Routes that shouldn't have sidebar (like public unauth) should be outside.

  // If a route like /privacy-policy is public but shows sidebar IF logged in:
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
  if (session.role === 'Animalkart admin' && location.pathname.startsWith('/true-harvest')) {
    return <Navigate to="/orders" replace />;
  }
  return <>{children}</>;
};



export default App;
