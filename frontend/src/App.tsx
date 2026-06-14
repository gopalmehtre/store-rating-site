import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import AdminOverview from './pages/AdminDashboard/AdminOverview';
import AdminUsers from './pages/AdminDashboard/AdminUsers';
import AdminStores from './pages/AdminDashboard/AdminStores';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import './styles.css';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    <Route path="/admin" element={
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <Layout><AdminOverview /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/admin/users" element={
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <Layout><AdminUsers /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/admin/stores" element={
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <Layout><AdminStores /></Layout>
      </ProtectedRoute>
    } />

    <Route path="/dashboard" element={
      <ProtectedRoute allowedRoles={['USER']}>
        <Layout><UserDashboard /></Layout>
      </ProtectedRoute>
    } />

    <Route path="/owner" element={
      <ProtectedRoute allowedRoles={['STORE_OWNER']}>
        <Layout><OwnerDashboard /></Layout>
      </ProtectedRoute>
    } />

    <Route path="/change-password" element={
      <ProtectedRoute>
        <Layout><ChangePassword /></Layout>
      </ProtectedRoute>
    } />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
