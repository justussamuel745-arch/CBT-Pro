import { Navigate, Outlet} from 'react-router'
import { authStore } from '../stores/authStore';

export function ProtectRoutes(){
  const token = authStore(state => state.token)
  return token ? <Outlet /> : <Navigate to="/auth" replace />
}