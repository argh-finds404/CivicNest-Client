import React from 'react';
import RoleRoute from './RoleRoute';

/** Admins only */
const AdminRoute = ({ children }) => <RoleRoute min="admin">{children}</RoleRoute>;

export default AdminRoute;
