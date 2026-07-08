import { useContext } from 'react';
import { Navigate, Outlet} from 'react-router'
import UserContext from '../context/UserContext.jsx';

export function ProtectedRoutes(){
  const { token } = useContext(UserContext)
  return token ? <Outlet /> : <Navigate to="signin" replace />
}