import { Suspense } from 'react';
import { ConfigProvider, Spin, theme } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';

import { MainError } from '@/components/main-error.tsx';

import { router } from './router';

const App = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainError}>
        <HelmetProvider>
          <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <RouterProvider router={router} />
          </ConfigProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default App;
