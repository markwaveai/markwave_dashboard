import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setSession as setReduxSession } from './store/slices/authSlice';
import { fetchAdminProfile } from './store/slices/usersSlice';
import { RootState } from './store';
import React, { useState, useCallback, useEffect } from 'react';
import HealthStatus from './components/common/HealthStatus';
import UserTabs from './components/Users/components/UserTabs';
import Login from './components/auth/Login';

// Tabs
// Tabs
import OrdersTab from './components/Orders/OrdersTab';
import UserManagementTab from './components/Users/UserManagement';
import ProductsTab from './components/products/ProductsTab';
import BuffaloVisualizationTab from './components/BuffaloViz/BuffaloVisualizationTab';
import EmiCalculatorTab from './components/Calculators/Emi/EmiCalculatorTab';
import AcfCalculatorTab from './components/Calculators/Acf/AcfCalculatorTab';
import UnitCalculatorTab from './components/Calculators/Unit/UnitCalculatorTab';
import SupportTicketsTab from './components/Support/SupportTicketsTab';
import CustomerDetailsPage from './components/Users/CustomerDetails';
import NetworkTab from './components/Users/Network';
import NetworkUserDetailsPage from './components/Users/NetworkUserDetails';

// Public Pages
import ReferralLandingPage from './components/public/ReferralLandingPage';
import DeactivateUserPage from './components/public/DeactivateUserPage';

// Redux
import { approveOrder, rejectOrder } from './store/slices/ordersSlice';

// Privacy
import PrivacyPolicy from './components/public/PrivacyPolicy';
import Support from './components/Support/Support';

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
  const { adminProfile } = useAppSelector((state: RootState) => state.users);
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
      if (!adminProfile) {
        dispatch(fetchAdminProfile(session.mobile));
      }
    }
  }, [dispatch, session, adminProfile]);

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

        {/* Protected Dashboard Routes */}
        <Route path="/orders" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <React.Suspense fallback={<OrdersPageSkeleton />}>
              <OrdersTab />
            </React.Suspense>
          </ProtectedRoute>
        } />

        <Route path="/user-management" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <React.Suspense fallback={<UsersPageSkeleton />}>
              <UserManagementTab getSortIcon={getSortIcon} />
            </React.Suspense>
          </ProtectedRoute>
        } />

        <Route path="/users/customers/:mobile" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <CustomerDetailsPage />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <React.Suspense fallback={<ProductsPageSkeleton />}>
              <ProductsTab />
            </React.Suspense>
          </ProtectedRoute>
        } />

        <Route path="/user-management/network" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <NetworkTab />
          </ProtectedRoute>
        } />

        {/* Publically Accessible Visualization Routes */}
        <Route path="/buffalo-viz" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <React.Suspense fallback={<BuffaloVizSkeleton />}>
              <BuffaloVisualizationTab />
            </React.Suspense>
          </ConditionalLayoutWrapper>
        } />

        <Route path="/unit-calculator/73d2a" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <React.Suspense fallback={<BuffaloVizSkeleton />}>
              <UnitCalculatorTab tree={true} />
            </React.Suspense>
          </ConditionalLayoutWrapper>
        } />

        <Route path="/unit-calculator/92f1b" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <React.Suspense fallback={<BuffaloVizSkeleton />}>
              <UnitCalculatorTab tree={false} />
            </React.Suspense>
          </ConditionalLayoutWrapper>
        } />

        <Route path="/unit-calculator" element={<Navigate to="/unit-calculator/73d2a" replace />} />

        <Route path="/emi-calculator" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <React.Suspense fallback={<EmiCalculatorSkeleton />}>
              <EmiCalculatorTab />
            </React.Suspense>
          </ConditionalLayoutWrapper>
        } />

        <Route path="/acf-calculator" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <React.Suspense fallback={<EmiCalculatorSkeleton />}>
              <AcfCalculatorTab />
            </React.Suspense>
          </ConditionalLayoutWrapper>
        } />

        <Route path="/referral-landing" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <ReferralLandingPage />
          </ConditionalLayoutWrapper>
        } />

        <Route path="/deactivate-user" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <DeactivateUserPage />
          </ConditionalLayoutWrapper>
        } />



        <Route path="/support-tickets" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <SupportTicketsTab />
          </ProtectedRoute>
        } />



        {/* Backward Compatibility Redirects */}
        <Route path="/dashboard/orders" element={<Navigate to="/orders" replace />} />
        <Route path="/dashboard/user-management" element={<Navigate to="/user-management" replace />} />
        <Route path="/dashboard/products" element={<Navigate to="/products" replace />} />
        <Route path="/dashboard/buffalo-viz" element={<Navigate to="/buffalo-viz" replace />} />
        <Route path="/dashboard/emi-calculator" element={<Navigate to="/emi-calculator" replace />} />
        <Route path="/dashboard/acf-calculator" element={<Navigate to="/acf-calculator" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/orders" replace />} />

        {/* Privacy Policy - Standalone, no UserTabs, accessible publicly if needed */}
        <Route path="/privacy-policy" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <PrivacyPolicy />
          </ConditionalLayoutWrapper>
        } />

        {/* Support Page - Context Aware */}
        <Route path="/support" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <Support />
          </ConditionalLayoutWrapper>
        } />

        {/* Default redirect to orders or login */}
        <Route path="/" element={<Navigate to={session ? "/orders" : "/login"} replace />} />
        <Route path="/user-management/network/:mobile" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <NetworkUserDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to={session ? "/orders" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

const ProtectedRoute = ({ children, session, isAdmin, handleLogout }: { children: React.ReactNode, session: Session | null, isAdmin: boolean, handleLogout: () => void }) => {
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Access Restricted</h2>
        <p style={{ marginBottom: 0 }}>Only authorized Admin users can access this dashboard. Please login with an Admin mobile.</p>
        <button onClick={handleLogout} style={{ marginTop: '1rem', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
    );
  }

  // Role-based route protection
  const path = location.pathname;
  if (session.role === 'Animalkart admin' && path.startsWith('/farmvest')) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <UserTabs
      adminMobile={session.mobile}
      adminName={session.name}
      adminRole={session.role || undefined}
      lastLogin={session.lastLoginTime}
      presentLogin={session.currentLoginTime}
      onLogout={handleLogout}
    >
      {children}
    </UserTabs>
  );
};

const ConditionalLayoutWrapper = ({ children, session, handleLogout }: { children: React.ReactNode, session: Session | null, handleLogout: () => void }) => {
  const location = useLocation();

  // Dashboard paths that should show layout if logged in
  const dashboardPaths = [
    '/unit-calculator',
    '/emi-calculator',
    '/acf-calculator',
    '/buffalo-viz',
    '/referral-landing',
    '/deactivate-user',
    '/privacy-policy',
    '/support'
  ];

  const isDashboardPath = dashboardPaths.some(path => location.pathname.startsWith(path));
  const shouldShowLayout = (location.state?.fromDashboard || isDashboardPath) && session;

  if (shouldShowLayout) {
    return (
      <UserTabs
        adminMobile={session?.mobile}
        adminName={session?.name}
        adminRole={session?.role || undefined}
        lastLogin={session?.lastLoginTime}
        presentLogin={session?.currentLoginTime}
        onLogout={handleLogout}
      >
        {children}
      </UserTabs>
    );
  }

  return <>{children}</>;
};

export default App;
