import { request } from './request.js';

/** Resolves the history array, or `null` when the user has none (204). */
export const fetchHistory = async () => {
  const res = await request.auth('/api/history', { method: 'GET' });
  return res.status === 204 ? null : res.body;
};

export const submitHistoryEntry = (history) =>
  request.auth('/api/history/submit', {
    method: 'POST',
    body: JSON.stringify(history),
  });

export const deleteHistoryEntry = (testId) =>
  request.auth(`/api/history/${testId}`, { method: 'DELETE' });
