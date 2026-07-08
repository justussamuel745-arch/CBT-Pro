import { url } from './url.js'
import { saveUser } from '../../hooks/services/indexedDB/users.js';

export async function fetchDataPost(formData, path) {
  const response = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // throw the parsed error so we can catch it below
    throw { status: response.status, errors: data?.error || data?.errors || data?.message || 'network' };
  }

  return data;
}

export async function fetchDataGet(path) {
  const response = await fetch(`${url}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  const data = response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} `);
  }
  return data
}

export async function fetchWithAuth(token, setToken, path, options = {}) {
  const makeRequest = (authToken) => {
    return fetch(`${url}${path}`, {
      ...options,
      credentials: 'include',
      headers: options?.headers
      ? { authorization: `Bearer ${authToken}` }
      : {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${authToken}`,
      },
    });
  }

  // 1. Try request with current token
  let response = await makeRequest(token);

  // 2. If 401, refresh and retry once
  if (response.status === 403) {

    const refreshRes = await fetch(`${url}/api/refresh`, {
      method: 'GET',
      credentials: 'include', // if refresh token is in httpOnly cookie
      headers: { 'Content-Type': 'application/json' },
    });

    if (!refreshRes.ok) throw new Error('Refresh failed');

    const { accessToken: newToken } = await refreshRes.json();
    if (!newToken) throw new Error('No new token');
    setToken(newToken); // update state
    response = await makeRequest(newToken); // retry original request
  }

  return response;
}

/* ======= Specific to the settings page =======*/
export async function fetchUserInfo(token, setUserInfo, setProfileFields) {
  const response = await fetch(`${url}/api/settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    credentials: 'include'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw {
      status: response.status
    }
  }
  
  saveUser({
    ...data,
    id: 'current-user'
  })
  
  setUserInfo({
    ...data,
    id: 'current-user'
  })
  //setUserInfo(data);
  setProfileFields({
    fullName: data.fullName || '',
    phoneNumber: data.phoneNumber || '',
    targetExam: data.targetExam || 'JAMB UTME 2027',
    targetScore: data.targetScore || '',
  });
}

export async function fetchHistory(token, setHistoryData) {
  const response = await fetch(`${url}/api/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    credentials: 'include'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw {
      status: response.status
    }
  }
  
  if (response.status === 204){
    setHistoryData([])
    return
  }
  
  setHistoryData(data)
}

