import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { LowDataProvider } from './context/LowDataContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LiveAutomation from './pages/LiveAutomation';

// Frontline Health Worker Pages
import FrontlineDashboard from './pages/frontline/FrontlineDashboard';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import CreateReferral from './pages/doctor/CreateReferral';
import FindHospitals from './pages/doctor/FindHospitals';
import HospitalDetails from './pages/doctor/HospitalDetails';
import MyReferrals from './pages/doctor/MyReferrals';
import ReferralDetails from './pages/doctor/ReferralDetails';
import LiveTracking from './pages/doctor/LiveTracking';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import Beds from './pages/hospital/Beds';
import Facilities from './pages/hospital/Facilities';
import Specialists from './pages/hospital/Specialists';
import Diagnostics from './pages/hospital/Diagnostics';
import Medicines from './pages/hospital/Medicines';
import IncomingReferrals from './pages/hospital/IncomingReferrals';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyHospitals from './pages/admin/VerifyHospitals';
import DoctorsList from './pages/admin/DoctorsList';
import AllReferrals from './pages/admin/AllReferrals';

import LoadingSpinner from './components/LoadingSpinner';
import SimulationDock from './components/SimulationDock';

// Role Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Validating credentials..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective authorized dashboard
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'frontline_health_worker') return <Navigate to="/frontline" replace />;
    if (user.role === 'hospital') return <Navigate to="/hospital" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-navy antialiased relative">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/live-automation" element={<LiveAutomation />} />

          {/* Shared Referral Details (Doctor, Frontline, Hospital, or Admin) */}
          <Route
            path="/referrals/:id"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'frontline_health_worker', 'hospital', 'admin']}>
                <ReferralDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/referrals/:id/tracking"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'frontline_health_worker', 'hospital', 'admin']}>
                <LiveTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals/:id/tracking"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'frontline_health_worker', 'hospital', 'admin']}>
                <LiveTracking />
              </ProtectedRoute>
            }
          />

          {/* Frontline Health Worker Routes */}
          <Route
            path="/frontline"
            element={
              <ProtectedRoute allowedRoles={['frontline_health_worker', 'admin']}>
                <FrontlineDashboard />
              </ProtectedRoute>
            }
          />

          {/* Doctor & Referral Coordination Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/create-referral"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'frontline_health_worker', 'admin']}>
                <CreateReferral />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/find-hospitals"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'frontline_health_worker', 'admin']}>
                <FindHospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/hospitals/:id"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'frontline_health_worker', 'admin']}>
                <HospitalDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/referrals"
            element={
              <ProtectedRoute allowedRoles={['doctor', 'frontline_health_worker', 'admin']}>
                <MyReferrals />
              </ProtectedRoute>
            }
          />

          {/* Hospital Routes */}
          <Route
            path="/hospital"
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/beds"
            element={
              <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                <Beds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/facilities"
            element={
              <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                <Facilities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/specialists"
            element={
              <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                <Specialists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/diagnostics"
            element={
              <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                <Diagnostics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/medicines"
            element={
              <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                <Medicines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/referrals"
            element={
              <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                <IncomingReferrals />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verify-hospitals"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <VerifyHospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DoctorsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/referrals"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AllReferrals />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SimulationDock />
    </div>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <LowDataProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </LowDataProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
