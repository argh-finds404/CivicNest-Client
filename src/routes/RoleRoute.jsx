import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { atLeast } from '../utils/roles';
import MinimalLoader from '../components/common/MinimalLoader.jsx';

/**
 * Requires sign-in and at least `min` role. Guests go to the login page (and
 * come back afterwards); signed-in users without the role go home.
 */
const RoleRoute = ({ min, children }) => {
  const { user, loading } = useAuth();
  const [role, isRoleLoading] = useRole();
  const location = useLocation();

  if (loading || (user && isRoleLoading)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <MinimalLoader />
      </div>
    );
  }
  if (!user) return <Navigate to="/Login" state={{ from: location }} replace />;
  if (!atLeast(role, min)) return <Navigate to="/" replace />;
  return children;
};

export default RoleRoute;
