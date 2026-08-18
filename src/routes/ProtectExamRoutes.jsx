import { Navigate, Outlet} from 'react-router'
import { examStore } from '../stores/examStore';

function validate(examConfig){
  if (!examConfig || typeof examConfig !== 'object') return false
  const hasSubject = Object.prototype.hasOwnProperty.call(examConfig, 'subjects')
  const subIsArray = Array.isArray(examConfig.subjects)
  return (hasSubject && subIsArray)
    ? true
    : false
}

export function ProtectExamRoutes(){
  const examConfig  = examStore(state => state.examConfig)
  const isAuthorized = validate(examConfig)
  
  return isAuthorized ? <Outlet /> :  <Navigate to="/" replace />
}