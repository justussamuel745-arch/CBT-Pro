import { Routes, Route } from 'react-router';
import AdminProvider from '../../context/AdminProvider';
import { ProctectedAdminRoutes } from '../../routes/ProtectedAdminRoutes';
import { UserManagement } from './UserManagement';
import { Feedback } from './Feedback';
import { Report } from './Report';



export default function Admin() {
  return (
    <AdminProvider>
      <Routes>
        <Route element={<ProctectedAdminRoutes />}>
          <Route path="/" element={<UserManagement />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/reports" element={<Report />} />
        </Route>
      </Routes>
    </AdminProvider>
  )
}