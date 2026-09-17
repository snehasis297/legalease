import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import VerifyPhone from './pages/VerifyPhone';
import SubmitKyc from './pages/SubmitKyc';
import SetupTwoFactor from './pages/SetupTwoFactor';

// Security Status Pages
import Disabled from './pages/Disabled';
import Suspended from './pages/Suspended';
import Locked from './pages/Locked';
import Appeal from './pages/Appeal';
import AppealSuccess from './pages/AppealSuccess';
import AppealExpired from './pages/AppealExpired';
import AppealInvalid from './pages/AppealInvalid';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import UploadDocument from './pages/client/UploadDocument';
import DocumentList from './pages/client/DocumentList';
import AnalysisResult from './pages/client/AnalysisResult';
import ChatPage from './pages/client/ChatPage';
import Profile from './pages/client/Profile';
import Security from './pages/client/Security';

// Lawyer Pages
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import KycUpload from './pages/lawyer/KycUpload';
import KycStatus from './pages/lawyer/KycStatus';
import ReviewDocument from './pages/lawyer/ReviewDocument';
import LawyerProfile from './pages/lawyer/LawyerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import VerificationQueue from './pages/admin/VerificationQueue';
import VerificationDetail from './pages/admin/VerificationDetail';
import AllDocuments from './pages/admin/AllDocuments';
import AuditLogs from './pages/admin/AuditLogs';
import SuspiciousActivities from './pages/admin/SuspiciousActivities';
import IpBlacklist from './pages/admin/IpBlacklist';
import Appeals from './pages/admin/Appeals';
import AppealDetail from './pages/admin/AppealDetail';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-phone" element={<VerifyPhone />} />
      <Route path="/submit-kyc" element={<SubmitKyc />} />
      <Route path="/setup-2fa" element={<SetupTwoFactor />} />

      {/* Account Safety State Routes */}
      <Route path="/account-disabled" element={<Disabled />} />
      <Route path="/account-suspended" element={<Suspended />} />
      <Route path="/account-locked" element={<Locked />} />
      <Route path="/appeal" element={<Appeal />} />
      <Route path="/appeal-success" element={<AppealSuccess />} />
      <Route path="/appeal-expired" element={<AppealExpired />} />
      <Route path="/appeal-invalid" element={<AppealInvalid />} />

      {/* Protected Client Routes */}
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'LAWYER', 'ADMIN']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/upload"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'LAWYER', 'ADMIN']}>
            <UploadDocument />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/documents"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'LAWYER', 'ADMIN']}>
            <DocumentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/analysis/:id"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'LAWYER', 'ADMIN']}>
            <AnalysisResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/chat/:id"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'LAWYER', 'ADMIN']}>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/profile"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'LAWYER', 'ADMIN']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/security"
        element={
          <ProtectedRoute allowedRoles={['CLIENT', 'LAWYER', 'ADMIN']}>
            <Security />
          </ProtectedRoute>
        }
      />

      {/* Protected Lawyer Routes */}
      <Route
        path="/lawyer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}>
            <LawyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lawyer/kyc-upload"
        element={
          <ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}>
            <KycUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lawyer/kyc-status"
        element={
          <ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}>
            <KycStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lawyer/review/:id"
        element={
          <ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}>
            <ReviewDocument />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lawyer/profile"
        element={
          <ProtectedRoute allowedRoles={['LAWYER', 'ADMIN']}>
            <LawyerProfile />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verifications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <VerificationQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verifications/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <VerificationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/documents"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AllDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/suspicious"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SuspiciousActivities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/blacklist"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <IpBlacklist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appeals"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Appeals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appeals/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppealDetail />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
