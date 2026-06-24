import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import MinimalLoader from '../components/common/MinimalLoader.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <MinimalLoader />
      </div>
    );
  }

  if (user) {
    return children;
  }

  return <Navigate to="/Login" state={{ from: location }} replace />;
};

export default PrivateRoute;
