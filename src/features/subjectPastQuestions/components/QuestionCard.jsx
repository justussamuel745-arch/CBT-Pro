import { MarkdownContent } from '@/components/common/MarkdownContent'
import { Image } from '@/components/common/Image'
import './QuestionCard.css'

const STATE_LABEL = {
  correct: 'Correct answer',
  wrong: 'Your answer, incorrect',
  viewed: 'Correct answer',
}

/* One question with its options.
   `answer` is undefined until the question is answered, then { userAnswer, status } where status is
   'correct' | 'wrong' (an option was picked) or 'viewed' (explanation opened without picking).
   Once `answer` exists the question is locked.
   question: { id, year, topic, question, image?, options: [{ id, option }], correctAnswers: [id], explanation: { text } } */
export function QuestionCard({ number, question, answer, onChoose, onReveal }) {
  const { year, topic, image, options = [], explanation } = question
  const correct = question.correctAnswers ?? []
  const body = question.question
  const structured = typeof body === 'object' && body !== null
  const answered = Boolean(answer)

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

  return (
    <article className="qc">
      <div className="qc-meta">
        <span className="qc-number">Question {number}</span>
        {year && <span className="qc-tag">JAMB {year}</span>}
        {topic && <span className="qc-tag">{topic}</span>}
      </div>

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
