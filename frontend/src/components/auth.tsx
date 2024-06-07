import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { getToken } from '@/lib/cookie.ts';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate to={`/auth/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />
    );
  }

  return children;
};
