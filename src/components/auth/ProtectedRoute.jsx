import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route protection and role-based access guard.
 * Redirects unauthenticated users to /login preserving the requested target location.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required and current user is not authorized
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to default home
    return <Navigate to="/" replace />;
  }

  return children;
}
