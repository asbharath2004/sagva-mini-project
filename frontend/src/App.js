import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminPanel from './pages/AdminPanel';

import ManageStudentsPage from './pages/ManageStudentsPage';
import ManageAcademicRecordsPage from './pages/ManageAcademicRecordsPage';

// Enhanced Pages (New Features)
import MessagingPage from './pages/MessagingPage';
import StudentTasksPage from './pages/StudentTasksPage';
import TeacherReviewPage from './pages/TeacherReviewPage';

// Bootstrap Styles
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['student']}>
                  <AnalyticsPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-students"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <ManageStudentsPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-academic/:studentId"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <ManageAcademicRecordsPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Enhanced Features Routes */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['teacher', 'student']}>
                  <MessagingPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-tasks"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentTasksPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher-reviews"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['teacher']}>
                  <TeacherReviewPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Redirect to login by default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
