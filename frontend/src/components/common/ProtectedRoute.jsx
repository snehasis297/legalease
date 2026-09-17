import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Securing session..." />
      </div>
    );
  }

  // CRITICAL RULE: Without login, every route redirects to /login immediately.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const status = user.accountStatus;

  // Account Safety & Status Redirects
  if (status === 'TEMPORARILY_DISABLED' || status === 'DISABLED' || status === 'AGE_VERIFICATION_REQUIRED') {
    if (location.pathname !== '/disabled') {
      return <Navigate to="/disabled" replace />;
    }
    return children;
  }

  if (status === 'SUSPENDED') {
    if (location.pathname !== '/suspended') {
      return <Navigate to="/suspended" replace />;
    }
    return children;
  }

  if (status === 'LOCKED') {
    if (location.pathname !== '/locked') {
      return <Navigate to="/locked" replace />;
    }
    return children;
  }

  // Verification step redirects
  if (status === 'PENDING_VERIFICATION') {
    if (user.role === 'LAWYER' && location.pathname !== '/lawyer/kyc/status' && location.pathname !== '/lawyer/kyc/upload') {
      return <Navigate to="/lawyer/kyc/status" replace />;
    }
    if (user.role !== 'LAWYER' && location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" replace />;
    }
  }

  if (status === 'PENDING_KYC') {
    if (location.pathname !== '/submit-kyc' && location.pathname !== '/verify-phone') {
      return <Navigate to="/submit-kyc" replace />;
    }
  }

  // Role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'LAWYER') return <Navigate to="/lawyer/dashboard" replace />;
    return <Navigate to="/client/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
