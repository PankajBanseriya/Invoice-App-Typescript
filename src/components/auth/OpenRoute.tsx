import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const OpenRoute: React.FC = () => {
  const token: string | null = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/invoices" replace />;
  }

  return <Outlet />;
};

export default OpenRoute;