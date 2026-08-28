import { url } from './url.js';
import { fetchWithAuth } from './fetchWithAuth.js';

export const request = {
  async send(path, options = {}) {
    const res = await fetch(`${url}${path}`, options)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw { status: res.status, error: data?.message || data?.errors || data?.error || 'Request Failed' }
    }

    return ({
      body: data,
      status: res.status
    })
  },
  async auth(path, options = {}, errMsg = null) {
    const res = await fetchWithAuth(path, options)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw { status: res.status, error: errMsg || data?.message || data?.errors || data?.error || 'Request Failed' }
    }

    return ({
      body: data,
      status: res.status
    })
  }
}