import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setSession as setReduxSession } from './store/slices/authSlice';
import { fetchAdminProfile } from './store/slices/usersSlice';
import { RootState } from './store';
import React, { useState, useCallback, useEffect } from 'react';
import HealthStatus from './components/HealthStatus';
import UserTabs from './components/UserTabs/UserTabs';
import Login from './components/auth/Login';

// Tabs
import OrdersTab from './components/sidebar-tabs/OrdersTab';
import UserManagementTab from './components/sidebar-tabs/UserManagementTab';
import ProductsTab from './components/sidebar-tabs/ProductsTab';
import BuffaloVisualizationTab from './components/sidebar-tabs/BuffaloVisualizationTab';
import EmiCalculatorTab from './components/sidebar-tabs/EmiCalculatorTab';
import AcfCalculatorTab from './components/sidebar-tabs/AcfCalculatorTab';
import UnitCalculatorTab from './components/sidebar-tabs/UnitCalculatorTab';
import SupportTicketsTab from './components/sidebar-tabs/SupportTicketsTab';

// FarmVest Components
// (Moved below all static imports)

// Public Pages
import ReferralLandingPage from './components/public/ReferralLandingPage';
import DeactivateUserPage from './components/public/DeactivateUserPage';

// Redux
import { approveOrder, rejectOrder } from './store/slices/ordersSlice';

// Privacy
import PrivacyPolicy from './components/PrivacyPolicy';
import Support from './components/Support';

// Skeletons
import OrdersPageSkeleton from './components/common/skeletons/OrdersPageSkeleton';
import UsersPageSkeleton from './components/common/skeletons/UsersPageSkeleton';
import ProductsPageSkeleton from './components/common/skeletons/ProductsPageSkeleton';
import BuffaloVizSkeleton from './components/common/skeletons/BuffaloVizSkeleton';
import EmiCalculatorSkeleton from './components/common/skeletons/EmiCalculatorSkeleton';

// FarmVest Components (Lazy Loaded)
const FarmVestEmployees = React.lazy(() => import('./FarmvestComponents/Employees'));
const FarmVestFarms = React.lazy(() => import('./FarmvestComponents/Farms'));
const FarmVestFarmDetails = React.lazy(() => import('./FarmvestComponents/FarmDetails'));

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

    // Determine default path based on role
    let defaultPath = '/orders';
    if (newSession.role === 'Farmvest admin') {
      defaultPath = '/farmvest/employees';
    } else if (newSession.role === 'Animalkart admin') {
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

  const isAdmin = session?.role === 'Admin' || session?.role === 'Animalkart admin' || session?.role === 'Farmvest admin';

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
              <OrdersTab
                handleApproveClick={async (id: string) => {
                  const result = await dispatch(approveOrder({ unitId: id, adminMobile: session!.mobile }));
                  if (approveOrder.fulfilled.match(result)) {
                    window.alert('Order Approved Successfully!');
                  }
                }}
                handleReject={async (id: string) => {
                  const result = await dispatch(rejectOrder({ unitId: id, adminMobile: session!.mobile, reason: 'Rejected by admin' }));
                  if (rejectOrder.fulfilled.match(result)) {
                    window.alert('Order Rejected Successfully!');
                  }
                }}
              />
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

        <Route path="/products" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <React.Suspense fallback={<ProductsPageSkeleton />}>
              <ProductsTab />
            </React.Suspense>
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

        <Route path="/unit-calculator" element={
          <ConditionalLayoutWrapper session={session} handleLogout={handleLogout}>
            <React.Suspense fallback={<BuffaloVizSkeleton />}>
              <UnitCalculatorTab />
            </React.Suspense>
          </ConditionalLayoutWrapper>
        } />

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

        {/* FarmVest Routes */}
        <Route path="/farmvest/employees" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <React.Suspense fallback={<UsersPageSkeleton />}>
              <FarmVestEmployees />
            </React.Suspense>
          </ProtectedRoute>
        } />

        <Route path="/farmvest/farms" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <React.Suspense fallback={<OrdersPageSkeleton />}>
              <FarmVestFarms />
            </React.Suspense>
          </ProtectedRoute>
        } />

        <Route path="/farmvest/farms/:id" element={
          <ProtectedRoute session={session} isAdmin={isAdmin} handleLogout={handleLogout}>
            <React.Suspense fallback={<OrdersPageSkeleton />}>
              <FarmVestFarmDetails />
            </React.Suspense>
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
  if (session.role === 'Farmvest admin' && !path.startsWith('/farmvest') && !['/support', '/support-tickets', '/privacy-policy'].includes(path)) {
    return <Navigate to="/farmvest/employees" replace />;
  }
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
  const shouldShowLayout = location.state?.fromDashboard && session;

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
