import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { Signin } from './Signin';
import { Signup } from './Signup';
import { ForgotPassword } from './ForgotPassword';

const ResetPassword = lazy(() => import('./ResetPassword.jsx'));

import { Loading } from '../../components/Loading.jsx';

export default function Auth(){
  return (
    <Routes>
      <Route path="/" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={
        <Suspense fallback={<Loading />}>
          <ResetPassword />110
        </Suspense>
      } />
    </Routes>
  )
}