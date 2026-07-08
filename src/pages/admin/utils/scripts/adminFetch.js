import { fetchWithAuth } from '../../../../scripts/utilis/fetch.js'

export async function fetchUsers(token, setToken, setUsers){
  try {
    const response = await fetchWithAuth(token, setToken, '/api/users', {
      method: 'GET'
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok){
      throw { status: response.status, error: data?.error || data?.message || 'Failed to fetch User'}
    }
    setUsers(data)
  } catch (err) {
    // handle error properly
    console.error('Error:', err);
  }
}

export async function fetchPayments(token, setToken, setPayment){
  try {
    const response = await fetchWithAuth(token, setToken, '/api/payment/records', {
      method: 'GET'
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok){
      throw { status: response.status, error: data?.error || data?.message || 'Failed to fetch Payments'}
    }
    setPayment(data)
  } catch (err) {
    // handle error properly
    console.error('Error:', err);
  }
}

export async function fetchFeedbacks(token, setToken, setItems){
  try {
    const response = await fetchWithAuth(token, setToken, '/api/feedback/all', {
      method: 'GET'
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok){
      throw { status: response.status, error: data?.error || data?.message || 'Failed to fetch Payments'}
    }
    setItems(data)
  } catch (err) {
    // handle error properly
    console.error('Error:', err);
  }
}

export async function fetchReports(token, setToken, setReports){
  try {
    const response = await fetchWithAuth(token, setToken, '/api/reports', {
      method: 'GET'
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok){
      throw { status: response.status, error: data?.error || data?.message || 'Failed to fetch Payments'}
    }
    setReports(data)
  } catch (err) {
    // handle error properly
    console.error('Error:', err);
  }
}