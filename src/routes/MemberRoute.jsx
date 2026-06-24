import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import MinimalLoader from '../components/common/MinimalLoader.jsx';

const MemberRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [role, isRoleLoading] = useRole();
  const location = useLocation();

  if (loading || isRoleLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <MinimalLoader />
      </div>
    );
  }

  if (user && (role === 'member' || role === 'admin')) {
    return children;
  }

  // If user is logged in but not a member (e.g. guest or standard user), send to membership request
  if (user && role !== 'member' && role !== 'admin') {
    return <Navigate to="/membership/request" state={{ from: location }} replace />;
  }

  return <Navigate to="/Login" state={{ from: location }} replace />;
};

export default MemberRoute;
