import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Toaster } from 'sonner';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: '#1A7A4E' } }}>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </ConfigProvider>
  </StrictMode>,
);
