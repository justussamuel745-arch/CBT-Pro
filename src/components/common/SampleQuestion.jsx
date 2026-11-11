import './SampleQuestion.css'

const letter = (i) => String.fromCharCode(65 + i)

/* A static question with its options and a collapsible answer.
   The answer stays in the HTML so search engines can read it.
   Uses .demo-option-letter from HomePage.css for the A/B/C/D badge.
   question: { text, options: string[], answer: index, explanation } */
export function SampleQuestion({ number, question }) {
  const { text, options, answer, explanation } = question
  return (
    <article className="sample-card">
      <p className="sample-number">Question {number}</p>
      <h3 className="sample-text">{text}</h3>

      <ol className="sample-options">
        {options.map((option, i) => (
          <li key={i} className="sample-option">
            <span className="demo-option-letter">{letter(i)}</span>
            {option}
          </li>
        ))}
      </ol>

      <details className="sample-answer">
        <summary>Show answer and explanation</summary>
        <div className="sample-answer-body">
          <p className="sample-answer-line">
            <i className="fa-solid fa-circle-check" aria-hidden="true"></i>{' '}
            Answer: <strong>{letter(answer)}. {options[answer]}</strong>
          </p>
          <p>{explanation}</p>
        </div>
      </details>
    </article>
  )
}
