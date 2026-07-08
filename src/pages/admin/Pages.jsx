import { useState, useMemo, useContext, useEffect } from 'react';
import { Navigate } from 'react-router';
import UserContext from '../../context/UserContext';
import AdminContext from './context/AdminContext';
import { UserManagement } from './UserManagement';
import { Feedback } from './Feedback';
import { AdminReports } from './AdminReports';
import { fetchUsers } from './utils/scripts/adminFetch';
import { fetchPayments } from './utils/scripts/adminFetch';
import { fetchFeedbacks } from './utils/scripts/adminFetch';
import { Loading } from '../../components/Loading';

export default function Pages(){
  const { token, setToken } = useContext(UserContext)
  const [page, setPage] = useState('users')
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true)
  
  const stats = useMemo(() => ({
    total: items.length,
    unread: items.filter(i => !i.read).length,
    bugs: items.filter(i => i.type === 'Technical Issues').length,
    requests: items.filter(i => i.type === 'Business').length,
  }), [items]);
  
  useEffect(() => {
    async function fetchAllData(){
      await fetchUsers(token, setToken, setUsers)
      await fetchPayments(token, setToken, setPayments)
      await fetchFeedbacks(token, setToken, setItems)
      setLoading(false)
    }
    
    fetchAllData()
  },[token, setToken])
  
  if (loading){
    return <Loading />
  }
  
  return (
    <AdminContext.Provider value={{
      setPage,
      items,
      setItems,
      stats,
      users,
      setUsers,
      payments,
      setPayments
    }}>
      { page === 'home' && <Navigate to="/" /> }
      { page === 'users' && <UserManagement /> }
      { page === 'feedback' && <Feedback /> }
      { page === 'reports' && <AdminReports /> }
    </AdminContext.Provider>
  )
}