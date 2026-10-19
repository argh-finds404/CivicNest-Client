import React from 'react';
import RoleRoute from './RoleRoute';

/** Moderators and admins */
const StaffRoute = ({ children }) => <RoleRoute min="moderator">{children}</RoleRoute>;

export default StaffRoute;
