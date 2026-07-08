import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import UserProvider from './context/UserProvider.jsx'
import { registerSW } from "virtual:pwa-register";
import './index.css'
import App from './App.jsx'

registerSW({
  onNeedRefresh() {
    console.log("New version available.");
  },
  onOfflineReady() {
    console.log("App is ready to work offline.");
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
