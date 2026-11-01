import { request } from './request.js';
import { decrypt } from '@lib/utils/crypto.js';

const postJson = (path, payload) =>
  request.send(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

/** Exchanges the refresh cookie for a new session `{ accessToken, isActivated, ... }`. */
export const refreshSession = async () => {
  const res = await request.send('/api/refresh', {
    method: 'GET',
    credentials: 'include',
  });
  return decrypt(res.body.data);
};

export const signIn = async (credentials) => {
  const res = await postJson('/api/auth', credentials);
  return decrypt(res.body.data);
};

export const signInWithGoogle = async (googleToken) => {
  const res = await postJson('/api/auth/google', { token: googleToken });
  return decrypt(res.body.data);
};

export const signUp = async (credentials) => {
  await postJson('/api/register', credentials);
};

export const signOut = async () => {
  await request.send('/api/logout');
};

export const requestPasswordReset = async (credentials) => {
  await postJson('/api/password/forgot-password', credentials);
};

export const resetPassword = async (credentials) => {
  await postJson('/api/password/reset-password', credentials);
};
