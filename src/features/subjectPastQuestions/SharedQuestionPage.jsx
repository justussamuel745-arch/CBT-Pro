import { useCallback, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router'
import { Footer } from '@/components/layouts/Footer'
import { PublicNav } from '@/components/layouts/PublicNav'
import { Loading } from '@/components/feedback/Loading'
import { usePublicQuestions } from './hooks/usePublicQuestions'
import { getSubjectPage, subjectPath } from './utils/subjectPage'
import { QuestionCard } from './components/QuestionCard'
import './SharedQuestionPage.css'

function SharedQuestion({ subject, questionId }) {
  const { status, questions, reload } = usePublicQuestions({
    subject: subject.rawName,
    topics: subject.topics,
    years: subject.years,
  })
  const [answer, setAnswer] = useState(undefined)
  const question = questions.find((item) => String(item.id) === questionId)

  const choose = useCallback((selectedQuestion, optionId) => {
    if (answer) return
    const isCorrect = (selectedQuestion.correctAnswers ?? []).includes(optionId)
    setAnswer({ userAnswer: optionId, status: isCorrect ? 'correct' : 'wrong' })
  }, [answer])

  const reveal = useCallback(() => {
    setAnswer((current) => current ?? { userAnswer: '', status: 'viewed' })
  }, [])

  let content
  if (status === 'loading') {
    content = <div className="sq-state" role="status"><Loading /></div>
  } else if (status === 'error') {
    content = (
      <div className="sq-state" role="alert">
        <p>We could not load this question. Check your connection and try again.</p>
        <button type="button" className="btn btn-primary" onClick={reload}>Try again</button>
      </div>
    )
  } else if (!question) {
    content = (
      <div className="sq-state" role="status">
        <h1>Question not found</h1>
        <p>This question may no longer be publicly available.</p>
        <Link className="btn btn-primary" to={subjectPath(subject.slug)}>Browse {subject.name} questions</Link>
      </div>
    )
  } else {
    const shareUrl = new URL('/shared-question', window.location.origin)
    shareUrl.searchParams.set('questionId', String(question.id))
    shareUrl.searchParams.set('subject', subject.slug)
    content = (
      <QuestionCard
        number={1}
        question={question}
        answer={answer}
        onChoose={choose}
        onReveal={reveal}
        shareUrl={shareUrl.toString()}
      />
    )
  }

  return (
    <>
      <Helmet>
        <title>{subject.name} JAMB Past Question | CBT Pro</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <PublicNav />
      <main className="sq-main">
        <div className="sq-content">
          <Link className="sq-back" to={subjectPath(subject.slug)}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> All {subject.name} questions
          </Link>
          {content}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function SharedQuestionPage() {
  const [searchParams] = useSearchParams()
  const questionId = searchParams.get('questionId')
  const subjectSlug = searchParams.get('subject')
  const subject = useMemo(() => getSubjectPage(subjectSlug), [subjectSlug])

  if (!subject || !questionId) {
    return (
      <>
        <PublicNav />
        <main className="sq-main">
          <div className="sq-state" role="alert">
            <h1>Invalid question link</h1>
            <p>This link is missing the subject or question ID.</p>
            <Link className="btn btn-primary" to="/jamb-past-questions">Browse past questions</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return <SharedQuestion key={`${subjectSlug}:${questionId}`} subject={subject} questionId={questionId} />
}
