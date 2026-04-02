import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: '#111827',
              fontWeight: '600',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              borderRadius: '20px',
              padding: '16px 20px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
              style: {
                background: 'rgba(236, 253, 245, 0.85)',
                border: '1px solid rgba(167, 243, 208, 0.5)',
                color: '#065F46',
              }
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
              style: {
                background: 'rgba(254, 242, 242, 0.85)',
                border: '1px solid rgba(254, 202, 202, 0.5)',
                color: '#991B1B'
              }
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
)
