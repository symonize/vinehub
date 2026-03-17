import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout (always loaded)
import Layout from './components/Layout';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WineriesList = lazy(() => import('./pages/wineries/WineriesList'));
const WineryForm = lazy(() => import('./pages/wineries/WineryForm'));
const WineryDetail = lazy(() => import('./pages/wineries/WineryDetail'));
const WinesList = lazy(() => import('./pages/wines/WinesList'));
const WineForm = lazy(() => import('./pages/wines/WineForm'));
const VintagesList = lazy(() => import('./pages/vintages/VintagesList'));
const VintageForm = lazy(() => import('./pages/vintages/VintageForm'));
const VintageDetail = lazy(() => import('./pages/vintages/VintageDetail'));
const UserManagement = lazy(() => import('./pages/users/UserManagement'));
const StyleGuide = lazy(() => import('./pages/StyleGuide'));
const DashboardAlt = lazy(() => import('./pages/DashboardAlt'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  }
});

const PageLoader = () => (
  <div className="loading">
    <div className="spinner"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;

  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Wineries */}
          <Route path="wineries" element={<WineriesList />} />
          <Route path="wineries/new" element={<WineryForm />} />
          <Route path="wineries/:id" element={<WineryDetail />} />
          <Route path="wineries/:id/edit" element={<WineryForm />} />

          {/* Wines */}
          <Route path="wines" element={<WinesList />} />
          <Route path="wines/new" element={<WineForm />} />
          <Route path="wines/:id" element={<WineForm />} />
          <Route path="wines/:id/edit" element={<WineForm />} />

          {/* Vintages */}
          <Route path="vintages" element={<VintagesList />} />
          <Route path="vintages/new" element={<VintageForm />} />
          <Route path="vintages/:id" element={<VintageDetail />} />
          <Route path="vintages/:id/edit" element={<VintageForm />} />

          {/* Users */}
          <Route path="users" element={<UserManagement />} />

          {/* Style Guide */}
          <Route path="style-guide" element={<StyleGuide />} />

          {/* Dashboard Alt */}
          <Route path="dashboard-alt" element={<DashboardAlt />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
