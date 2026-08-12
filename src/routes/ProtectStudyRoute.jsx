import { Navigate } from 'react-router';
import { studyStore } from '../stores/studyStore';

export function ProtectStudyRoute({ children }){
  const studyConfig = studyStore(state => state.studyConfig)
  return !(Object.keys(studyConfig).length <= 0) ? children : <Navigate to="/study" />
}