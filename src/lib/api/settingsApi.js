import { request } from './request.js';
import { decrypt } from '@lib/utils/crypto.js';

const postJson = (path, payload) =>
  request.auth(path, { method: 'POST', body: JSON.stringify(payload) });

/** The signed in user's account, settings and pending question updates. */
export const fetchSettings = async () => {
  const res = await request.auth('/api/settings', { method: 'GET' });
  return decrypt(res.body.data);
};

/** `formData` is the profile form (multipart, because of the avatar). */
export const updateProfile = async (formData) => {
  const res = await request.auth('/api/settings/profile', {
    method: 'POST',
    body: formData,
  });
  return decrypt(res.body.data);
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  await postJson('/api/settings/account', { currentPassword, newPassword });
};

/** For Google-only accounts that have no password yet. */
export const addPassword = async (newPassword) => {
  await postJson('/api/settings/account', { newPassword });
};

/** `credentials` is `{ password }` or `{ googleToken }`. */
export const deleteAccount = async (credentials) => {
  await postJson('/api/settings/delete', credentials);
};

/**
 * Downloads the profile picture. Resolves `null` when the image host answers
 * with an error status; rejects when the host cannot be reached.
 */
export const fetchProfileImage = async (url) => {
  const res = await fetch(url);
  return res.ok ? res.blob() : null;
};
