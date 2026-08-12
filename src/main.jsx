import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from 'react-router'
import { NotificationProvider } from './context/NotificationContext';
import { registerSW } from "virtual:pwa-register";
import './index.css'
import App from './App.jsx'

export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new Event("pwa-update-available"));
  },

  onOfflineReady() {
    window.dispatchEvent(new Event("pwa-offline-ready"));
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
        <NotificationProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NotificationProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
