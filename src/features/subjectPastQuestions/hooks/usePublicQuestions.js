import { useCallback, useEffect, useState } from 'react'
import { fetchPublicQuestions } from '../api/publicQuestionsApi'

const LOADING = { status: 'loading', questions: [] }

/* Loads all questions for one subject / topics / years selection.
   `topics` and `years` must keep the same array identity between renders (the page model does). */
export function usePublicQuestions({ subject, topics, years }) {
  const [state, setState] = useState(LOADING)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchPublicQuestions({ subject, topics, years })
      .then((questions) => {
        if (!cancelled) setState({ status: 'ready', questions })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', questions: [] })
      })
    return () => {
      cancelled = true
    }
  }, [subject, topics, years, attempt])

  const reload = useCallback(() => {
    setState(LOADING)
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, reload }
}
