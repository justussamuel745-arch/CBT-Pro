import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { ProctectedAdminRoutes } from '../../routes/ProtectedAdminRoutes';
import { Loading } from '../../components/Loading';
import UserManagement from './UserManagement';
import Feedback from './Feedback';
import Report from './Report';
import { adminStore } from '../../stores/AdminStore';



export default function Admin() {
  const { fetchUsers, fetchPayments, fetchFeedbacks, loading, setLoading } = adminStore()
  const navigate = useNavigate()
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          fetchUsers(), 
          fetchPayments(), 
          fetchFeedbacks()
        ])
      } catch (err) {
        console.error('Error:', err);
        navigate('/')
      } finally {
        setLoading(false)
      }
    })()
  },[fetchFeedbacks, fetchUsers, fetchPayments, setLoading, navigate])
  
  if (loading) return <Loading />
  
  return (
    <Routes>
      <Route element={<ProctectedAdminRoutes />}>
        <Route path="/" element={<UserManagement />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/reports" element={<Report />} />
      </Route>
    </Routes>
  )
}