import { BACKEND_URL } from '@lib/config/app.js';
import { fetchWithAuth } from './fetchWithAuth.js';
import { ApiError } from './errors.js';

/**
 * Reads the JSON body and resolves `{ body, status }`.
 * Any non 2xx response is thrown as an `ApiError` ({ status, message, code }).
 */
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      message: data?.message || data?.errors || data?.error || 'Request Failed',
      code: data?.code,
    });
  }

  return { body: data, status: res.status };
};

export const request = {
  /** Public endpoints (no access token). */
  async send(path, options = {}) {
    return handleResponse(await fetch(`${BACKEND_URL}${path}`, options));
  },

  /** Protected endpoints (adds the access token, refreshes it when expired). */
  async auth(path, options = {}) {
    return handleResponse(await fetchWithAuth(path, options));
  },
};
