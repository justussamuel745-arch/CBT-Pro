import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { ProctectAdminRoutes } from '../../routes/ProtectAdminRoutes';
import { Loading } from '../../components/Loading';
import { Offline } from '../../components/Offline';
import UserManagement from './UserManagement';
import Feedback from './Feedback';
import Report from './Report';
import { adminStore } from '../../stores/AdminStore';



export default function Admin() {
  const { fetchUsers, fetchPayments, fetchFeedbacks, loading, setLoading } = adminStore()
  const [isOffline, setIsOffline] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    if (!navigator.onLine){
      setIsOffline(true)
      return
    }
    (async () => {
      try {
        await Promise.all([
          fetchUsers(), 
          fetchPayments(), 
          fetchFeedbacks()
        ])
      } catch (err) {
        console.error('Error:', err);
        if (!err.status){
          setIsOffline(true)
        } else {
          navigate('/')
        }
      } finally {
        setLoading(false)
      }
    })()
  },[fetchFeedbacks, fetchUsers, fetchPayments, setLoading, navigate])
  
  if (isOffline) return <Offline />
  if (loading) return <Loading />
  
  return (
    <Routes>
      <Route element={<ProctectAdminRoutes />}>
        <Route path="/" element={<UserManagement />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/reports" element={<Report />} />
      </Route>
    </Routes>
  )
}