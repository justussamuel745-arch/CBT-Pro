import { useEffect, useRef, useState } from 'react'
import { MarkdownContent } from '@/components/common/MarkdownContent'
import { Image } from '@/components/common/Image'
import { prefetchQuestionShareImage } from '../utils/shareQuestionImage'
import { SHARE_RESULT, shareQuestionImage, shareQuestionLink } from '../utils/shareQuestion'
import './QuestionCard.css'

const STATE_LABEL = {
  correct: 'Correct answer',
  wrong: 'Your answer, incorrect',
  viewed: 'Correct answer',
}

const SHARE_MESSAGE = {
  [SHARE_RESULT.linkShared]: 'Link shared.',
  [SHARE_RESULT.linkCopied]: 'Link copied to clipboard.',
  [SHARE_RESULT.imageShared]: 'Question image shared.',
  [SHARE_RESULT.imageSaved]: 'Image downloaded and link copied. Paste the link when you share the image.',
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 8.5 9 12m6 3.5L9 12m11-5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM10 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 17 5-4.5 3.5 3L15 13.5l5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* One question with its options.
   `answer` is undefined until the question is answered, then { userAnswer, status } where status is
   'correct' | 'wrong' (an option was picked) or 'viewed' (explanation opened without picking).
   Once `answer` exists the question is locked.
   question: { id, year, topic, question, image?, options: [{ id, option }], correctAnswers: [id], explanation: { text } } */
export function QuestionCard({ number, question, answer, onChoose, onReveal, shareUrl, subject }) {
  const [shareMessage, setShareMessage] = useState('')
  const [sharing, setSharing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const shareRef = useRef(null)
  const shareButtonRef = useRef(null)
  const { year, topic, image, options = [], explanation } = question
  const correct = question.correctAnswers ?? []
  const body = question.question
  const structured = typeof body === 'object' && body !== null
  const answered = Boolean(answer)

  // Close the share menu on outside press or Escape, and focus its first option when it opens.
  useEffect(() => {
    if (!menuOpen) return undefined

    shareRef.current?.querySelector('[role="menuitem"]')?.focus()

    const handlePointerDown = (event) => {
      if (!shareRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      shareButtonRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const stateOf = (id) => {
    if (!answer) return ''
    const isCorrect = correct.includes(id)
    if (answer.status === 'viewed') return isCorrect ? 'viewed' : ''
    if (id === answer.userAnswer) return isCorrect ? 'correct' : 'wrong'
    return isCorrect ? 'correct' : ''
  }

  const choose = (id) => {
    if (!answered) onChoose(question, id)
  }

  // Opening the menu shows intent to share, so start rendering the image now. The result is cached.
  const toggleMenu = () => {
    if (!menuOpen) prefetchQuestionShareImage({ question, subject })
    setMenuOpen((open) => !open)
  }

  const runShare = async (pendingMessage, action) => {
    setMenuOpen(false)
    if (!shareUrl || sharing) return
    setSharing(true)
    setShareMessage(pendingMessage)

    try {
      setShareMessage(SHARE_MESSAGE[await action()])
    } catch (error) {
      setShareMessage(error.name === 'AbortError' ? 'Sharing cancelled.' : 'Could not share the question. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  const shareLink = () => runShare('Sharing link…', () => shareQuestionLink({ url: shareUrl, subject }))
  const shareImage = () =>
    runShare('Preparing question image…', () => shareQuestionImage({ question, subject, url: shareUrl }))

  return (
    <article className="qc">
      <div className="qc-meta">
        <span className="qc-number">Question {number}</span>
        {year && <span className="qc-tag">JAMB {year}</span>}
        {topic && <span className="qc-tag">{topic}</span>}
        {shareUrl && (
          <div className="qc-share-wrap" ref={shareRef}>
            <button
              type="button"
              className="qc-share"
              ref={shareButtonRef}
              onClick={toggleMenu}
              disabled={sharing}
              aria-busy={sharing}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Share question"
            >
              <ShareIcon />
              <span>{sharing ? 'Preparing…' : 'Share'}</span>
            </button>
            {menuOpen && (
              <div className="qc-share-menu" role="menu" aria-label="Share options">
                <button type="button" role="menuitem" className="qc-share-option" onClick={shareLink}>
                  <LinkIcon />
                  <span>Share URL</span>
                </button>
                <button type="button" role="menuitem" className="qc-share-option" onClick={shareImage}>
                  <ImageIcon />
                  <span>Share as image</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {shareMessage && <p className="qc-share-message" role="status">{shareMessage}</p>}

      <div className="qc-text">
        {image?.url && <Image imageUrl={image.url} />}
        {structured && body.instruction && (
          <strong><MarkdownContent>{body.instruction}</MarkdownContent></strong>
        )}
        {structured && body.comprehension && (
          <strong dangerouslySetInnerHTML={{ __html: body.comprehension }} />
        )}
        <MarkdownContent>{structured ? body.qs ?? '' : body ?? ''}</MarkdownContent>
      </div>

      <div className="qc-options" role="group" aria-label="Answer options">
        {options.map((opt) => {
          const state = stateOf(opt.id)
          return (
            <div
              key={opt.id}
              role="button"
              tabIndex={answered ? -1 : 0}
              aria-disabled={answered}
              className={`qc-option${state ? ` is-${state}` : ''}`}
              onClick={() => choose(opt.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  choose(opt.id)
                }
              }}
            >
              <span className="qc-key">{String(opt.id).toUpperCase()}</span>
              <div className="qc-option-text">
                <MarkdownContent>{opt.option}</MarkdownContent>
              </div>
              {state && <span className="qc-sr">{STATE_LABEL[state]}</span>}
            </div>
          )
        })}
      </div>

      {!answered && (
        <button type="button" className="qc-show" onClick={() => onReveal(question)}>
          Show explanation
        </button>
      )}

      {answered && (
        <div className="qc-explanation" role="region" aria-label="Answer and explanation">
          <p className="qc-answer-line">
            Correct answer: <strong>{correct.join(', ').toUpperCase()}</strong>
          </p>
          {explanation?.text
            ? <MarkdownContent>{explanation.text}</MarkdownContent>
            : <p>No explanation is available for this question yet.</p>}
        </div>
      )}
    </article>
  )
}
