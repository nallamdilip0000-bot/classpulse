import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Attendance from './pages/Attendance';
import Assessments from './pages/Assessments';
import Analytics from './pages/Analytics';
import RiskIndicators from './pages/RiskIndicators';
import Interventions from './pages/Interventions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import HelpAbout from './pages/HelpAbout';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Unauthenticated Login Portal for Student, Administrator, and Faculty */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login initialMode="register" />} />

            {/* Protected Application Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/:id" element={<StudentDetails />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="indicators" element={<RiskIndicators />} />
              <Route path="interventions" element={<Interventions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<HelpAbout />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
