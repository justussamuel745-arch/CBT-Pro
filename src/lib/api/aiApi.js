import { request } from './request.js';
import { decrypt } from '@lib/utils/crypto.js';
import { describeError } from './errors.js';

/** Resolves `{ answer, creditsLeft }`. */
export const explainQuestion = async ({ questionId, message }) => {
  const res = await request.auth('/api/ai/explain', {
    method: 'POST',
    body: JSON.stringify({
      questionId: questionId ?? undefined,
      question: message,
    }),
  });
  return decrypt(res.body.reply);
};

/** Text shown to the user when asking Astra fails. */
export const describeAiError = (err) => {
  if (err?.status === 402) {
    return "You've reached your AI credit limit. Please upgrade your plan or purchase additional credits to continue.";
  }

  return describeError(err, {
    network: "Can't reach the server. Check your connection and try again.",
    server: 'Something went wrong. Please try again.',
  });
};
