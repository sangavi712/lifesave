import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, token, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
      </div>
    );
  }

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If route is adminOnly, and user is not admin, redirect to dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export const PublicRoute = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
