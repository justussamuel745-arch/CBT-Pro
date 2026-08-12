import { Navigate, Outlet } from 'react-router';
import { authStore } from '../stores/authStore';

export function ProctectedAdminRoutes(){
  const isAdmin = authStore(state => state.isAdmin)
  return isAdmin ? <Outlet /> : <Navigate to="/unauthorized" />
}