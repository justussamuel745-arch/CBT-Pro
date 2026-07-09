import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import UserProvider from './context/UserProvider.jsx'
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
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
)
