import { authStore } from '@/stores/authStore.js';
import { BACKEND_URL } from '@lib/config/app.js';


export async function fetchWithAuth(path, options = {}) {
  const makeRequest = () => {
    const token = authStore.getState().token;

    return fetch(`${BACKEND_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: options?.headers
        ? {
            ...options.headers,
            authorization: `Bearer ${token}`,
          }
        : {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
    });
  };

  let response = await makeRequest();

  if (response.status === 403) {
    await authStore.getState().refresh();

    response = await makeRequest();
  }

  return response;
}