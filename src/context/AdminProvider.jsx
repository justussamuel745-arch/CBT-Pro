import { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router';
import UserContext from './UserContext';
import { AdminContext } from './AdminContext';
import { Loading } from '../components/Loading';
import { fetchUsers, fetchPayments, fetchFeedbacks } from '../pages/admin/utils/adminFetch';

function AdminProvider({ children }){
  const { token, setToken } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState('users')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  
  
  const stats = useMemo(() => ({
    total: items.length,
    unread: items.filter(i => !i.read).length,
    bugs: items.filter(i => i.type === 'Technical Issues').length,
    requests: items.filter(i => i.type === 'Business').length,
  }), [items]);
  
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        await fetchUsers(token, setToken, setUsers)
        await fetchPayments(token, setToken, setPayments)
        await fetchFeedbacks(token, setToken, setItems)
        setIsLoading(false)
      } catch (err) {
        console.error('Error:', err);
        navigate('/')
      }
    }
    
    fetchAdminInfo()
  },[])
  
  return (
    <AdminContext.Provider value={{
      users,
      setUsers,
      payments,
      items,
      setItems,
      stats,
      page,
      setPage
    }}>
      { isLoading ? <Loading /> :  children }
    </AdminContext.Provider>
  )
}

export default AdminProvider