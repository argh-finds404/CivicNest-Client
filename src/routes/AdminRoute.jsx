import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import MinimalLoader from '../components/common/MinimalLoader.jsx';

const AdminRoute = ({ children }) => {
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

  if (user && role === 'admin') {
    return children;
  }

  return <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;
