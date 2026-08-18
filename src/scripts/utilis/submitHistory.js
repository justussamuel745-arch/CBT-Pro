import { request } from './request.js';
import { encrypt, decrypt } from './crypto.js';
import { saveHistory } from '../../hooks/services/indexedDB/history.js';
import { userStore } from '../../stores/userStore.js';
import { examStore } from '../../stores/examStore.js';

function generateObjectId() {
  return [...Array(24)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

export async function submitLocalHistory() {
  const unsavedHistoryRaw = JSON.parse(localStorage.getItem('unsavedHistory'));
  let unsavedHistory = unsavedHistoryRaw
    ? decrypt(unsavedHistoryRaw)
    : []

  if (!unsavedHistory || unsavedHistory.length === 0 || !Array.isArray(unsavedHistory)) {
    return;
  }

  const failedHistory = [];

  for (const history of unsavedHistory) {
    if (!history || typeof history !== 'object') {
      continue;
    }

    try {
      await request.auth(
        '/api/history/submit',
        {
          method: 'POST',
          body: JSON.stringify(history)
        }
      );

      // Success: do nothing.
      // Since we don't push it into failedHistory,
      // it will be removed from localStorage.

    } catch {
      // Keep this one for the next retry.
      failedHistory.push(history);
    }
  }

  if (failedHistory.length === 0) {
    localStorage.removeItem('unsavedHistory');
  } else {
    localStorage.setItem(
      'unsavedHistory',
      JSON.stringify(encrypt(failedHistory))
    );
  }
}

export async function submitHistory({ subjects, score, timeTaken, performance }) {
  const userId = userStore.getState().userInfo?._id
  const question = examStore.getState().answers.length
  const { historyData } = userStore.getState()
  const newHistory = {
    userId,
    testId: generateObjectId(),
    subjects,
    score: score.obtained,
    total: score.over,
    timeSpent: timeTaken,
    question,
    performance,
    createdAt: new Date().toISOString()
  }
  const savedHistory = await saveHistory(newHistory)
  userStore.setState({
    historyData: [...historyData, ...savedHistory]
  })
  if (!navigator.onLine) {
    const unsavedHistoryRaw = JSON.parse(localStorage.getItem('unsavedHistory'))
    const unsavedHistory = unsavedHistoryRaw ? decrypt(unsavedHistoryRaw) : []
    unsavedHistory.push(newHistory)
    localStorage.setItem('unsavedHistory', JSON.stringify(encrypt(unsavedHistory)));
    return
  }
  try {
    await request.auth('/api/history/submit', {
      method: 'POST',
      body: JSON.stringify(newHistory)
    }, newHistory)
  } catch (err) {
    if (typeof err?.error === 'object' || err.status !== 404) {
      const unsavedHistory = decrypt(JSON.parse(localStorage.getItem('unsavedHistory'))) || []
      unsavedHistory.push(err.error)
      localStorage.setItem('unsavedHistory', JSON.stringify(encrypt(unsavedHistory)));
    }
  }
}