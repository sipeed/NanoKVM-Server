import { createHashRouter } from 'react-router-dom';

import { ProtectedRoute } from '@/components/auth';
import { Root } from '@/components/root';

export const router = createHashRouter([
  {
    path: '/auth/login',
    lazy: async () => {
      const { Login } = await import('./auth/login');
      return { Component: Login };
    }
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Root />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        lazy: async () => {
          const { Desktop } = await import('./desktop');
          return { Component: Desktop };
        }
      },
      {
        path: 'terminal',
        lazy: async () => {
          const { SshTerminal } = await import('./ssh-terminal');
          return { Component: SshTerminal };
        }
      },
      {
        path: 'auth/password',
        lazy: async () => {
          const { ChangePassword } = await import('./auth/change-password');
          return { Component: ChangePassword };
        }
      }
    ]
  }
]);
