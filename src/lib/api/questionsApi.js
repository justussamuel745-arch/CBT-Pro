import { request } from './request.js';
import { decrypt } from '@lib/utils/crypto.js';

const postJson = (path, payload) =>
  request.auth(path, { method: 'POST', body: JSON.stringify(payload) });

/** Practice questions for accounts that are not activated yet. */
export const fetchFixedExamQuestions = async (subjectNames) => {
  const res = await postJson('/api/exam/fixedExam', { subjects: subjectNames });
  return decrypt(res.body);
};

/** Practice questions for activated accounts. */
export const fetchExamQuestions = async (examConfig) => {
  const res = await postJson('/api/exam', examConfig);
  return decrypt(res.body);
};

/** Questions of a scheduled exam. Resolves `{ examId, questions }`. */
export const fetchScheduledExamQuestions = async (examConfig) => {
  const res = await postJson('/api/exam/scheduled', {
    ...examConfig,
    subjects: examConfig.subjects.map((s) => s.name ?? null).filter(Boolean),
  });
  return { examId: res.body.examId, questions: decrypt(res.body.questions) };
};

export const fetchStudyQuestions = async (studyConfig) => {
  const res = await postJson('/api/study', studyConfig);
  return decrypt(res.body);
};

/** Resolves the questions of one subject, grouped (e.g. by year). */
export const downloadSubjectQuestions = async (subjectName) => {
  const res = await postJson('/api/questions/download', {
    subjects: [subjectName],
  });
  return decrypt(res.body.questions);
};

export const searchQuestions = async ({ subject, year, query }) => {
  const params = [`subject=${encodeURIComponent(subject.toLowerCase())}`];
  if (year !== 'All') params.push(`year=${encodeURIComponent(year)}`);
  if (query) params.push(`keyword=${encodeURIComponent(query)}`);

  const res = await request.auth(`/api/search?${params.join('&')}`, {
    method: 'GET',
  });
  return decrypt(res.body.data);
};
