import { BACKEND_URL } from '@lib/config/app.js';

const PATH = `${BACKEND_URL}/api/push`;

// The token is passed in because these run while signing in, before the
// auth store holds it.
const send = (path, method, token, payload) =>
  fetch(`${PATH}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const savePushSubscription = async (subscription, token) => {
  const response = await send('/subscribe', 'POST', token, {
    subscription,
    userAgent: navigator.userAgent,
  });

  if (!response.ok) {
    throw new Error('Failed to save push subscription.');
  }

  return response.json();
};

export const removePushSubscription = async (endpoint, token) => {
  const response = await send('/unsubscribe', 'DELETE', token, { endpoint });

  if (!response.ok) {
    throw new Error('Failed to remove push subscription.');
  }
};
