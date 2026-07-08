import { useContext } from 'react';
import { Navigate } from 'react-router';
import UserContext from '../context/UserContext';

export function ProtectStudyRoute({ children }){
  const { studyConfig } = useContext(UserContext)
  return !(Object.keys(studyConfig).length <= 0) ? children : <Navigate to="/study" />
}