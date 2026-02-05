import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WineriesList from './pages/wineries/WineriesList';
import WineryForm from './pages/wineries/WineryForm';
import WineryDetail from './pages/wineries/WineryDetail';
import WinesList from './pages/wines/WinesList';
import WineForm from './pages/wines/WineForm';
import WineDetail from './pages/wines/WineDetail';
import VintagesList from './pages/vintages/VintagesList';
import VintageForm from './pages/vintages/VintageForm';
import VintageDetail from './pages/vintages/VintageDetail';
import UserManagement from './pages/users/UserManagement';
import StyleGuide from './pages/StyleGuide';

// Layout
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
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

        {/* Wineries */}
        <Route path="wineries" element={<WineriesList />} />
        <Route path="wineries/new" element={<WineryForm />} />
        <Route path="wineries/:id" element={<WineryDetail />} />
        <Route path="wineries/:id/edit" element={<WineryForm />} />

        {/* Wines */}
        <Route path="wines" element={<WinesList />} />
        <Route path="wines/new" element={<WineForm />} />
        <Route path="wines/:id" element={<WineDetail />} />
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
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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
