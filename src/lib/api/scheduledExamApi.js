import { request } from './request.js';
import { decrypt } from '@lib/utils/crypto.js';

const EXAM_PLANNER = '/api/exam-planner';

const send = (path, method, payload) =>
  request.auth(path, {
    method,
    ...(payload !== undefined && { body: JSON.stringify(payload) }),
  });

/** Resolves `{ stats, upcomingExams, missedExams }`. */
export const fetchDashboard = async () => {
  const res = await send(`${EXAM_PLANNER}/dashboard`, 'GET');
  return decrypt(res.body.data);
};

/** Resolves `{ invalidIds, validIds }`. */
export const syncExamReminders = async (examIds) => {
  const res = await send(`${EXAM_PLANNER}/exam/reminder`, 'POST', { examIds });
  return res.body;
};

/** Resolves `{ stats, upcomingExams }`. */
export const updateExamStatus = async (examId, status) => {
  const res = await send(`${EXAM_PLANNER}/exam/status/${examId}`, 'PUT', {
    status,
  });
  return decrypt(res.body.data);
};

/** Resolves `{ stats, upcomingExams }`. */
export const createExam = async (exam) => {
  const res = await send(`${EXAM_PLANNER}/exam`, 'POST', exam);
  return decrypt(res.body.data);
};

/** Resolves `{ upcomingExams }`. `query` is e.g. `?action=edit`. */
export const updateExam = async (examId, exam, query = '') => {
  const res = await send(`${EXAM_PLANNER}/exam/${examId}${query}`, 'PUT', exam);
  return decrypt(res.body.data);
};

export const fetchExam = async (examId) => {
  const res = await send(`${EXAM_PLANNER}/exam/${examId}`, 'GET');
  return res.body;
};

/** Resolves `{ historyStats, history, achievements }`. */
export const fetchExamHistory = async () => {
  const res = await send(`${EXAM_PLANNER}/history`, 'GET');
  return res.body;
};

/** Resolves the attempt `{ stats, upcomingExams, ... }`. */
export const submitExamAttempt = async (submission) => {
  const res = await send(`${EXAM_PLANNER}/exam/submit`, 'POST', submission);
  return res.body.attempt;
};
