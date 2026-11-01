import { submitHistoryEntry } from '@lib/api/historyApi.js';
import { encrypt, decrypt } from '@lib/utils/crypto.js';
import { saveHistory } from '@lib/db/history.js';
import { userStore } from '@/stores/userStore.js';
import { examStore } from '@/stores/examStore.js';
import { generateObjectId } from '@lib/utils/generateObjectId.js';

const UNSAVED_HISTORY_KEY = 'unsavedHistory';

// Results that could not be sent to the server yet (offline / request failed)
// are kept encrypted in localStorage until the next sync.
const readUnsavedHistory = () => {
  const raw = JSON.parse(localStorage.getItem(UNSAVED_HISTORY_KEY));
  const history = raw ? decrypt(raw) : [];
  return Array.isArray(history) ? history : [];
};

const writeUnsavedHistory = (history) =>
  localStorage.setItem(UNSAVED_HISTORY_KEY, JSON.stringify(encrypt(history)));

const queueUnsavedHistory = (entry) =>
  writeUnsavedHistory([...readUnsavedHistory(), entry]);

/** Sends every queued result to the server, keeping the ones that fail. */
export async function submitLocalHistory() {
  const validHistory = readUnsavedHistory().filter(
    history => history && typeof history === 'object'
  );

  if (validHistory.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    validHistory.map(history => submitHistoryEntry(history))
  );

  const failedHistory = validHistory.filter(
    (_, index) => results[index].status === 'rejected'
  );

  if (failedHistory.length === 0) {
    localStorage.removeItem(UNSAVED_HISTORY_KEY);
  } else {
    writeUnsavedHistory(failedHistory);
  }
}

/** Saves a finished practice exam locally and sends it to the server. */
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
    queueUnsavedHistory(newHistory)
    return
  }

  try {
    await submitHistoryEntry(newHistory)
  } catch {
    queueUnsavedHistory(newHistory)
  }
}
