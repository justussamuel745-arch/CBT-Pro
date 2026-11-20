import { request } from '@lib/api/request.js'
import { decrypt } from '@lib/utils/crypto.js'

/* BACKEND CONTRACT (needs to exist on your server)
   A public twin of POST /api/study: no login, same request body, returns the list of
   questions. If your backend uses a different path, change only this constant. */
export const PUBLIC_QUESTIONS_ENDPOINT = '/api/public/questions'

/* Fetches every question that matches the subject, topics and years.
   Resolves an array shaped like the study questions:
   { id, year, topic, question, image?, options: [{ id, option }], correctAnswers: [id], explanation: { text } } */
export const fetchPublicQuestions = async (params) => {
  if ('questionId' in params){
    const res = await request.send(`${PUBLIC_QUESTIONS_ENDPOINT}/${params.questionId}`)
    const data = typeof res.body !== 'object' ? [decrypt(res.body)] : res.body
    
    return data
  }
  const res = await request.send(PUBLIC_QUESTIONS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, shuffle: false }),
  })

  // Accept both an encrypted body (like /api/study) and a plain JSON array
  const data = Array.isArray(res.body) ? res.body : decrypt(res.body)
  if (!Array.isArray(data)) throw new Error('Unexpected response from the questions endpoint')
  return data
}
