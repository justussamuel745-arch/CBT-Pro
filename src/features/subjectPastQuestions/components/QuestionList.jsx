import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Pagination } from '@/components/common/Pagination'
import { usePublicQuestions } from '../hooks/usePublicQuestions'
import { describeSelection, readPage, readPageSize } from '../utils/questionFilters'
import { subjectPath } from '../utils/subjectPage'
import { QuestionCard } from './QuestionCard'
import './QuestionList.css';

const MONETAG_DIRECT_LINK = 'https://uplcm.com/4/12192703'

function DirectLink({ children, subject }){
  const [hasClicked, setHasClicked] = useState(false)

  if (!hasClicked) return <a href={MONETAG_DIRECT_LINK} onClick={() => setHasClicked(true)} className="btn btn-primary">See all {subject.name} topics and years</a>

  return children
}

/* Loads every question for the selection, then shows them a page at a time.
   The page number and page size live in the URL (?page=2&size=20) so links and the back button work.
   Answers are kept here, so they survive moving between pages. */
export function QuestionList({ subject, topics, years }) {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const { status, questions, reload } = usePublicQuestions({ subject: subject.rawName, topics, years })
  const [answers, setAnswers] = useState({})

  const pageSize = readPageSize(searchParams)
  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize))
  const page = readPage(searchParams, totalPages)
  const start = (page - 1) * pageSize
  const visible = questions.slice(start, start + pageSize)

  // Scroll back to the top of the list when the page changes
  const topRef = useRef(null)
  const previousPage = useRef(page)
  useEffect(() => {
    if (previousPage.current !== page) {
      previousPage.current = page
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [page])

  // An answer can only be set once: later clicks are ignored
  const choose = useCallback((question, optionId) => {
    const isCorrect = (question.correctAnswers ?? []).includes(optionId)
    setAnswers((prev) =>
      prev[question.id]
        ? prev
        : { ...prev, [question.id]: { userAnswer: optionId, status: isCorrect ? 'correct' : 'wrong' } },
    )
  }, [])

  const reveal = useCallback((question) => {
    setAnswers((prev) =>
      prev[question.id] ? prev : { ...prev, [question.id]: { userAnswer: '', status: 'viewed' } },
    )
  }, [])

  const getLink = (target) => {
    const next = new URLSearchParams(searchParams)
    if (target === 1) next.delete('page')
    else next.set('page', String(target))
    const search = next.toString().replace(/%2C/g, ',')
    return { pathname, search: search ? `?${search}` : '' }
  }

  if (status === 'loading') {
    return (
      <div className="ql">
        <div className="ql-state" role="status">
          <span className="ql-spinner" aria-hidden="true"></span>
          <p>Loading questions…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="ql">
        <div className="ql-state" role="alert">
          <p>We could not load the questions. Check your connection and try again.</p>
          <button type="button" className="btn btn-primary" onClick={reload}>Try again</button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="ql">
        <div className="ql-state">
          <p>No questions found. Sign in for full access.</p>
          <DirectLink subject={subject}>
            <Link to={subjectPath(subject.slug)} className="btn btn-primary">See all {subject.name} topics and years</Link>
          </DirectLink>
        </div>
      </div>
    )
  }

  const pager = (
    <div className="ql-pager">
      <Pagination page={page} totalPages={totalPages} getLink={getLink} label="Question pages" />
    </div>
  )

  return (
    <div className="ql">
      <div ref={topRef} className="ql-top"></div>
      <p className="ql-summary">
        Showing <strong>{start + 1}–{start + visible.length}</strong> of <strong>{questions.length.toLocaleString()}</strong> questions
        {' · '}{describeSelection(subject, topics, years)}
      </p>

      {totalPages > 1 && pager}

      <ol className="ql-list">
        {visible.map((question, i) => (
          <li key={question.id}>
            <QuestionCard
              number={start + i + 1}
              question={question}
              answer={answers[question.id]}
              onChoose={choose}
              onReveal={reveal}
            />
          </li>
        ))}
      </ol>

      {pager}
    </div>
  )
}
