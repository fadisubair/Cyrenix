import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ANALYST' | 'VIEWER')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <ShieldAlert className="h-12 w-12 text-indigo-400 animate-pulse mb-4" />
          <div className="text-zinc-400 font-medium tracking-widest animate-pulse">AUTHENTICATING...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md bg-panel p-8 rounded-md border border-red-500/20">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Access Denied</h2>
          <p className="text-zinc-400">
            You do not have the required permissions to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
