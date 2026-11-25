import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If canteen staff accidentally goes to student route, redirect to canteen dashboard
    if (user.role === 'canteen_staff') {
      return <Navigate to="/canteen/dashboard" replace />;
    }
    // If student/college staff tries to access canteen route, redirect to student dashboard
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

