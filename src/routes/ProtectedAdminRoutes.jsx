import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import UserContext from '../context/UserContext'

export function ProctectedAdminRoutes({ children }){
  const { isAdmin } = useContext(UserContext);
  return isAdmin ? <Outlet /> : <Navigate to="/unauthorized" />
}