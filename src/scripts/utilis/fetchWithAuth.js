import { authStore } from '../../stores/authStore.js';
import { url } from './url.js';


export async function fetchWithAuth(path, options = {}) {
  const makeRequest = () => {
    const token = authStore.getState().token;

    return fetch(`${url}${path}`, {
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