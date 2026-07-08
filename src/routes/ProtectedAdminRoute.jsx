import { useContext } from 'react';
import { Navigate } from 'react-router';
import UserContext from '../context/UserContext'

export function ProctectedAdminRoute({ children }){
  const { isAdmin } = useContext(UserContext);
  
  return isAdmin ? children : <Navigate to="/error" />
}