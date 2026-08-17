import { Navigate, Outlet} from 'react-router'
import { practiceStore } from '../stores/practiceStore';

export function ProtectPracticeRoutes(){
  const examConfig  = practiceStore(state => state.examConfig)
  
  return examConfig ? <Outlet /> :  <Navigate to="/simulator" replace />
}