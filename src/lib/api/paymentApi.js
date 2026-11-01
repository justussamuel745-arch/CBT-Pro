import { request } from './request.js';

/** `type` is `app_activation` or `ai_pack_<price>`. Resolves `{ authorization_url }`. */
export const initializePayment = async ({ email, type }) => {
  const res = await request.auth('/api/payment', {
    method: 'POST',
    body: JSON.stringify({ email, type }),
  });
  return res.body;
};
