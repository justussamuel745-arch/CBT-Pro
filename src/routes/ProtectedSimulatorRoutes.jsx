import { Navigate, Outlet} from 'react-router'
import { simulatorStore } from '../stores/simulatorStore';

export function ProtectedSimulatorRoutes(){
  const examConfig  = simulatorStore(state => state.examConfig)
  
  return examConfig ? <Outlet /> :  <Navigate to="/simulator" replace />
}