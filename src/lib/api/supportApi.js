import { request } from './request.js';

const postJson = (path, payload) =>
  request.auth(path, { method: 'POST', body: JSON.stringify(payload) });

export const sendFeedback = (feedback) => postJson('/api/feedback', feedback);

export const reportQuestion = (report) => postJson('/api/report', report);

export const sendReview = (review) => request.send('/api/reviews', { 
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(review)
});