import { authStore } from '@/stores/authStore.js';
import { BACKEND_URL } from '@lib/config/app.js';

const buildHeaders = ({ headers, body }, token) => {
  const authorization = `Bearer ${token}`;

  if (headers) return { ...headers, authorization };

  // FormData sets its own multipart boundary, so no Content-Type for it.
  if (body instanceof FormData) return { authorization };

  return { 'Content-Type': 'application/json', authorization };
};

/**
 * `fetch` against the backend with the current access token.
 * A 403 means the token expired: refresh the session once and retry.
 */
export async function fetchWithAuth(path, options = {}) {
  const makeRequest = () =>
    fetch(`${BACKEND_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(options, authStore.getState().token),
    });

  let response = await makeRequest();

  if (response.status === 403) {
    await authStore.getState().refresh();
    response = await makeRequest();
  }

  return response;
}
