import { useContext } from 'react';
import { Navigate, Outlet} from 'react-router'
import UserContext from '../context/UserContext.jsx';

export function ProtectedExamRoutes(){
  const { examConfig } = useContext(UserContext)
  
  return examConfig ? <Outlet /> :  <Navigate to="/simulator" replace />
}