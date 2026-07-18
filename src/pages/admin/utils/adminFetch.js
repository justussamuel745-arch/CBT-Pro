import { fetchWithAuth } from '../../../scripts/utilis/fetch.js'

export async function fetchUsers(token, setToken, setUsers) {
  const response = await fetchWithAuth(token, setToken, '/api/users', {
    method: 'GET'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw { status: response.status, error: 'Error while fetching users: ' + data?.error || data?.message || 'Failed' }
  }
  setUsers(data)
}

export async function fetchPayments(token, setToken, setPayment) {

  const response = await fetchWithAuth(token, setToken, '/api/payment/records', {
    method: 'GET'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw { status: response.status, error: 'Error while fetching payment: ' + data?.error || data?.message || 'Failed to fetch Payments' }
  }
  setPayment(data)
}

export async function fetchFeedbacks(token, setToken, setItems) {
  const response = await fetchWithAuth(token, setToken, '/api/feedback/all', {
    method: 'GET'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw { status: response.status, error: 'Error while fetching Feedback: ' + data?.error || data?.message || 'Failed to fetch Payments' }
  }
  setItems(data)
}

export async function fetchReports(token, setToken, setReports) {
  try {
    const response = await fetchWithAuth(token, setToken, '/api/reports', {
      method: 'GET'
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw { status: response.status, error: data?.error || data?.message || 'Failed to fetch Payments' }
    }
    setReports(data)
  } catch (err) {
    // handle error properly
    console.error('Error:', err);
  }
}