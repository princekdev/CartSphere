import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protects all /admin/* routes.
 * Allows access only when:
 *  1. User is logged in (has a token)
 *  2. user.isAdmin === true  (set by backend when email matches ADMIN_EMAIL)
 */
export default function AdminRoute() {
  const location = useLocation();
  const { user, token } = useSelector((s) => s.auth);

  if (!token || !user) {
    // Not logged in → send to login, remember where they came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isAdmin) {
    // Logged in but NOT the admin email → back to home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
